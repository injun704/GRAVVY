-- ==============================================================================
-- GRAVVY SUPABASE DATABASE MIGRATION SCRIPT
-- Dynamic UNI Theme Edition
-- Full schema for Food, Grocery & Medicine On-Demand Delivery
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS PROFILE & PREFERENCES
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'merchant', 'rider', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    theme_preference TEXT NOT NULL DEFAULT 'UNI' CHECK (theme_preference IN ('LIGHT', 'DARK', 'UNI')),
    notifications_enabled BOOLEAN DEFAULT true,
    preferred_language TEXT DEFAULT 'en-IN' CHECK (preferred_language IN ('en-IN', 'hi-IN', 'bn-IN')),
    dietary_preference TEXT DEFAULT 'all' CHECK (dietary_preference IN ('all', 'veg', 'non-veg')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tag TEXT NOT NULL DEFAULT 'Home' CHECK (tag IN ('Home', 'Work', 'Other')),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT NOT NULL,
    pin_code VARCHAR(6) NOT NULL,
    landmark TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. MERCHANTS & RESTAURANTS
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('restaurant', 'grocery_store', 'pharmacy')),
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    drug_license_number TEXT, -- For licensed pharmacies
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cuisine_types TEXT[] NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    rating_count INTEGER DEFAULT 0,
    delivery_time_min INTEGER DEFAULT 25,
    banner_image TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 4. CATEGORIES & TAXONOMY
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_type TEXT NOT NULL CHECK (parent_type IN ('food', 'grocery', 'medicine')),
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- 5. PRODUCTS & FOUR-IMAGE GALLERIES
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES public.categories(id),
    category_type TEXT NOT NULL CHECK (category_type IN ('food', 'grocery', 'medicine')),
    sub_category TEXT NOT NULL,
    restaurant_or_brand TEXT NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    discount_percent INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 4.8,
    rating_count INTEGER DEFAULT 0,
    description TEXT NOT NULL,
    specifications JSONB DEFAULT '{}'::jsonb,
    veg BOOLEAN,
    unit_weight TEXT,
    prescription_required BOOLEAN DEFAULT false,
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 50,
    delivery_time_minutes TEXT DEFAULT '20-25 mins',
    trending BOOLEAN DEFAULT false,
    best_seller BOOLEAN DEFAULT false,
    deal_of_the_day BOOLEAN DEFAULT false,
    budget_friendly BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Exactly four distinct photographs per product
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL CHECK (display_order BETWEEN 1 AND 4),
    caption TEXT,
    UNIQUE (product_id, display_order)
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    in_stock BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.inventory (
    product_id TEXT PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
    available_stock INTEGER NOT NULL DEFAULT 50,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    last_restocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. CARTS & ITEMS
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    custom_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ORDERS & DELIVERY TIMELINE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id),
    address_id UUID NOT NULL REFERENCES public.addresses(id),
    status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tip_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    coupon_code TEXT,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'card', 'cod', 'netbanking')),
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'refunded')),
    delivery_instructions TEXT,
    eta_minutes INTEGER DEFAULT 25,
    rider_name TEXT,
    rider_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

-- 8. REVIEWS & PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT NOT NULL,
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    review_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    order_id UUID REFERENCES public.orders(id),
    image_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'approved_by_pharmacist', 'rejected')),
    pharmacist_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. PROMOTIONS & BANNERS (Food & Grocery distinct)
CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    discount_label TEXT NOT NULL,
    coupon_code TEXT,
    image_url TEXT NOT NULL,
    badge TEXT NOT NULL,
    target_category TEXT NOT NULL CHECK (target_category IN ('food', 'grocery')),
    accent_color TEXT NOT NULL,
    cta_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0
);

-- 10. WISHLISTS & RECENTLY VIEWED
CREATE TABLE IF NOT EXISTS public.wishlists (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.recently_viewed (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, product_id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_type, sub_category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_product_images_pid ON public.product_images(product_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- SAMPLE RLS POLICIES
CREATE POLICY "Users can read and update their own profile"
    ON public.users FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Users can read and update their own preferences"
    ON public.user_preferences FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Public read for products"
    ON public.products FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Public read for promotions"
    ON public.promotions FOR SELECT
    TO public
    USING (true);
