# GRAVVY — Food, Grocery & Medicine On-Demand Delivery Platform
### Dynamic UNI Theme Edition | Production Ready Full-Stack Architecture

GRAVVY is a high-performance food, grocery, and pharmacy delivery application built for high conversion, tactile responsiveness, and mobile Android packaging via Capacitor.

---

## 🌟 Key Architecture & Technical Highlights

### 1. Global Theme System & 5-Second Dynamic UNI Theme
- **Three Global Themes**:
  - **LIGHT**: Deep, visible category gradients (Home: Gold `#FFF9E6` → `#FFB800`, Food: Red `#FFF1F0` → `#E53935`, Grocery: Green `#F0FDF4` → `#16A34A`, Medicine: Sky Blue `#F0F9FF` → `#0284C7`).
  - **DARK**: Deep black and charcoal gradients (Home: `#080808` → `#FFD600`, Food: `#080808` → `#B91C1C`, Grocery: `#080808` → `#16A34A`, Medicine: `#080808` → `#0284C7`).
  - **UNI**: Signature dynamic gradient engine cycling through 9 rich combinations every **5 seconds** (`5000ms`) with smooth easing transitions.
- **Category Color Preservation**: While UNI cycles the background, buttons and active tabs strictly preserve category identities (Home = Gold, Food = Red, Grocery = Green, Medicine = Sky Blue).
- **Theme Selector**: Placed at the **TOP** of the My Account page directly beneath the user's profile header with live preview cards (including animated UNI preview).
- **Reduced Motion & Battery Optimization**: Pauses animation when tab is in background via `document.hidden` and respects `prefers-reduced-motion`.

### 2. Home Page Medicine Exclusion Rule
- As strictly required, **Home contains only Food and Grocery** products and promotions.
- Medicine products and healthcare advertisements are strictly confined to the dedicated Medicine Marketplace.

### 3. Nine-Slide Promotional Carousels (Home, Food, Grocery & Medicine)
- **Home Carousel**: 9 curated Food & Grocery slides (strictly excluding medicine).
- **Food Carousel**: 9 unique gourmet food slides (Biryani, Pizza, Burgers, Momos, Chowmein, Fried Rice, Chicken Rolls, Indian Thalis, Desserts) with right-to-left 4s auto-sliding, sequential looping, touch swiping, and active-cuisine filter actions.
- **Grocery Carousel**: 9 farm-fresh and supermarket essential slides preserved intact.
- **Medicine Carousel**: 9 healthcare slides (First Aid, Vitamins, Wellness Products, Baby Care, Medical Devices, Healthcare Essentials, Personal Healthcare, Health Monitoring Devices, Pharmacy Essentials) with Sky Blue accents and 4s auto-sliding.
- **Category Icon Diagonal Gradients**: Upper-left to lower-right SVG diagonal gradients applied directly to icon strokes (Home: Gold `#FFD600` → `#FF8C00`, Food: Red `#FF5A4F` → `#B91C1C`, Grocery: Green `#4ADE80` → `#15803D`, Medicine: Sky Blue `#38BDF8` → `#0284C7`) with matching text and indicators across Light, Dark, and UNI themes.

### 4. Four-Image Swipeable Product Gallery
- Every product detail view has a horizontally swipeable gallery featuring 4 distinct authentic photographs with thumbnail selection, counter badges, veg/non-veg tags, and specifications.

### 5. Smart Search Autocomplete & Multilingual Voice Search
- Instant debounced autocomplete matching "B" (Biryani, Burger, Banana) and "A" (Apples, Aloo Tikki).
- Voice Search supporting English (`en-IN`), Hindi (`hi-IN`), and Bengali (`bn-IN`) using the Web Speech API.

### 6. Dedicated Full-Page Cart, Checkout & Orders
- **Full-Page Cart**: Tapping Cart in the bottom navigation opens a dedicated full-screen Cart page (`CartPage.tsx`), replacing the legacy side drawer while occupying the complete available viewport width.
- **Fixed Navigation & Android Back Support**: Fixed bottom navigation bar remains consistently visible with the Cart icon highlighted when active. Supports native Android hardware/gesture back-button navigation via `window.history.pushState` / `popstate` event listeners and an accessible in-page Back button.
- **Cart Layout & Features**: Real-time product cards with authentic photos, variant labels, custom cooking notes, unit prices, quantity increment/decrement steppers, item removal, active delivery address switcher, promo code / coupon input (`GRAVVY50`, `FREESHIP`), rider tip selector, detailed bill summary, and prominent "Proceed to Checkout" button.
- **Polished Empty State**: If the cart is empty, displays a glowing illustration, helpful messaging, quick category chips (Food, Grocery, Medicine), and a "Continue Shopping" button routing back to Home.
- **5-Step Checkout**: Address → Order Summary → Delivery Instructions → Payment (UPI, Card, COD) → Confirmation with confetti celebration.
- **Live order status progression**: Placed → Confirmed → Preparing → Out for Delivery → Delivered, plus downloadable receipt invoices.

### 7. Supabase Database Migration
- Located in `supabase/migrations/20260926000000_gravvy_schema.sql` covering `users`, `user_preferences`, `addresses`, `merchants`, `restaurants`, `categories`, `products`, `product_images`, `product_variants`, `inventory`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `reviews`, `prescriptions`, `promotions`, `wishlists`, and `recently_viewed`.

---

## 📱 Android Build Instructions (Capacitor)

GRAVVY is pre-configured with `capacitor.config.ts`. To package and build the Android APK:

1. **Install Android dependencies**:
   ```bash
   npm install @capacitor/cli @capacitor/android
   ```

2. **Build Web Assets**:
   ```bash
   npm run build
   ```

3. **Initialize Android Platform**:
   ```bash
   npx cap add android
   npx cap sync android
   ```

4. **Open in Android Studio & Generate APK**:
   ```bash
   npx cap open android
   ```
   - In Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - The signed/debug APK will be generated under `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🧪 In-App Automated QA Suite

Open **My Account > Run Automated Tests** to execute live verification of all technical criteria:
- Theme switching & persistence
- 5-second UNI gradient cycling & animation stopping in Light/Dark
- Home Medicine exclusion
- 4-image product galleries
- Smart autocomplete matching "B" and "A"
- Nine-slide carousels
- Cart, checkout, and order timeline
