export type ThemeMode = 'LIGHT' | 'DARK' | 'UNI';

export type CategoryTab = 'home' | 'food' | 'grocery' | 'medicine';

export type MainNavTab = 'home' | 'search' | 'wishlist' | 'cart' | 'orders' | 'account' | 'admin';

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  originalPrice: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'food' | 'grocery' | 'medicine';
  subCategory: string;
  restaurantOrBrand: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  images: [string, string]; // Exactly 2 images: [Image 1 - Primary / Normal View, Image 2 - Zoomed View]
  inStock: boolean;
  stockQuantity: number;
  deliveryTimeMinutes: string;
  description: string;
  specifications: Record<string, string>;
  veg?: boolean | null; // true = veg, false = non-veg, null = grocery/medicine
  variants?: ProductVariant[];
  prescriptionRequired?: boolean;
  unitWeight?: string;
  tags?: string[];
  trending?: boolean;
  bestSeller?: boolean;
  dealOfTheDay?: boolean;
  budgetFriendly?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  reviewImage?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  customInstructions?: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';

export interface DeliveryAddress {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  pinCode: string;
  landmark?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  country?: string;
  placeId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  tipAmount: number;
  couponCode?: string;
  total: number;
  address: DeliveryAddress;
  paymentMethod: 'upi' | 'card' | 'cod' | 'netbanking';
  paymentStatus: 'paid' | 'pending';
  deliveryInstructions?: string;
  etaMinutes: number;
  placedAt?: string;
  confirmedAt?: string;
  preparingAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  deliveryAgent?: {
    name: string;
    phone: string;
    vehicle: string;
  };
}

export interface PromotionSlide {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  code?: string;
  imageUrl: string;
  badge: string;
  targetCategory: 'food' | 'grocery' | 'medicine' | 'home';
  accentColor: string;
  ctaText: string;
  subCategoryFilter?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  themePreference: ThemeMode;
  addresses: DeliveryAddress[];
  savedPaymentMethods: {
    id: string;
    type: 'upi' | 'card';
    label: string;
    last4?: string;
  }[];
  wishlistProductIds: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'order' | 'deal' | 'system';
}
