/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { YourWishView } from './components/wishlist/YourWishView';
import { ReviewFormModal } from './components/common/ReviewFormModal';
import { CartPage } from './components/cart/CartPage';
import { OrderSummaryPage } from './components/checkout/OrderSummaryPage';
import { DeliveryInstructionsPage } from './components/checkout/DeliveryInstructionsPage';
import { PaymentPage } from './components/checkout/PaymentPage';
import { OrderConfirmationPage } from './components/checkout/OrderConfirmationPage';
import { HomePage } from './components/home/HomePage';
import { FoodMarketplace } from './components/food/FoodMarketplace';
import { GroceryMarketplace } from './components/grocery/GroceryMarketplace';
import { MedicineMarketplace } from './components/medicine/MedicineMarketplace';
import { OrdersView } from './components/orders/OrdersView';
import { AccountView, AccountSubPage } from './components/account/AccountView';
import { ProfilePage } from './components/account/ProfilePage';
import { SavedAddressesPage } from './components/account/SavedAddressesPage';
import { PaymentMethodsPage } from './components/account/PaymentMethodsPage';
import { NotificationsPage } from './components/account/NotificationsPage';
import { RecentlyViewedPage } from './components/account/RecentlyViewedPage';
import { ReviewsPage } from './components/account/ReviewsPage';
import { HelpCenterPage } from './components/account/HelpCenterPage';
import { CustomerSupportPage } from './components/account/CustomerSupportPage';
import { FaqsPage } from './components/account/FaqsPage';
import { ContactUsPage } from './components/account/ContactUsPage';
import { LegalPage } from './components/account/LegalPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AutomatedTestRunner } from './components/qa/AutomatedTestRunner';
import { SearchResultsPage } from './components/search/SearchResultsPage';
import { DedicatedSearchPage } from './components/search/DedicatedSearchPage';
import { LocationPage } from './components/location/LocationPage';
import { CustomerAuthModal } from './components/auth/CustomerAuthModal';
import { CategoryGradientDefs } from './components/common/CategoryGradientDefs';
import { UniAmbientGlow } from './components/common/UniAmbientGlow';
import { INITIAL_PRODUCTS } from './data/products';
import { HOME_PROMOTIONS } from './data/promotions';
import { Product, MainNavTab, CategoryTab, Order } from './types';

interface NavHistoryEntry {
  tab: MainNavTab;
  subPage: AccountSubPage | null;
  category?: CategoryTab;
  searchQuery?: string;
  key: string;
  scrollY: number;
}

const MainAppContent: React.FC = () => {
  const { backgroundStyle, theme, activeCategory, setActiveCategory } = useTheme();
  const { isAuthModalOpen, setIsAuthModalOpen, isAuthenticated } = useAuth();

  // Navigation & Modal states
  const [currentTab, setCurrentTab] = useState<MainNavTab>('home');
  const [accountSubPage, setAccountSubPage] = useState<AccountSubPage | null>(null);

  // Reset account subpage upon logout so stale authenticated subpages don't remain accessible
  useEffect(() => {
    if (!isAuthenticated) {
      setAccountSubPage(null);
    }
  }, [isAuthenticated]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [reviewModalProductId, setReviewModalProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSubmittedQuery, setSearchSubmittedQuery] = useState('');
  const [isDedicatedSearchOpen, setIsDedicatedSearchOpen] = useState(false);
  const [isLocationPageOpen, setIsLocationPageOpen] = useState(false);

  // Checkout Flow Step State
  type CheckoutFlowStep = 'cart' | 'order-summary' | 'delivery-instructions' | 'payment' | 'confirmation';
  const [checkoutStep, setCheckoutStep] = useState<CheckoutFlowStep>('cart');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [addressReturnTarget, setAddressReturnTarget] = useState<'cart' | 'order-summary' | null>(null);
  const [focusedOrderIdForOrdersView, setFocusedOrderIdForOrdersView] = useState<string | null>(null);

  // Global Scroll Position Restoration System
  const scrollPositionsRef = useRef<Map<string, number>>(new Map());
  const navigationHistoryRef = useRef<NavHistoryEntry[]>([]);

  // Compute current view's unique key for scroll restoration
  const getCurrentKey = useCallback((): string => {
    if (selectedProduct) return `product:${selectedProduct.id}`;
    if (currentTab === 'search') return `search:${searchSubmittedQuery || 'all'}`;
    if (currentTab === 'account') return accountSubPage ? `account:${accountSubPage}` : 'account';
    if (currentTab === 'wishlist') return 'wishlist';
    if (currentTab === 'cart') return 'cart';
    if (currentTab === 'orders') return 'orders';
    if (currentTab === 'admin') return 'admin';
    if (currentTab === 'home') return `home:${activeCategory}`;
    return currentTab;
  }, [selectedProduct, currentTab, searchSubmittedQuery, accountSubPage, activeCategory]);

  // Reliable scroll restoration helper with requestAnimationFrame confirmation
  const restoreScrollPosition = useCallback((targetKey: string, fallbackY = 0) => {
    const targetY = scrollPositionsRef.current.get(targetKey) ?? fallbackY;
    window.scrollTo({ top: targetY, behavior: 'instant' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: targetY, behavior: 'instant' });
      requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - targetY) > 5) {
          window.scrollTo({ top: targetY, behavior: 'instant' });
        }
      });
    });
  }, []);

  const CATEGORY_ORDER: Record<CategoryTab, number> = {
    home: 0,
    food: 1,
    grocery: 2,
    medicine: 3,
  };

  const prevCategoryRef = useRef<CategoryTab>(activeCategory);
  const leapDirection =
    CATEGORY_ORDER[activeCategory] >= CATEGORY_ORDER[prevCategoryRef.current] ? 1 : -1;

  useEffect(() => {
    prevCategoryRef.current = activeCategory;
  }, [activeCategory]);

  const categoryLeapVariants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir >= 0 ? 32 : -32,
      y: 8,
      scale: 0.99,
    }),
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 380,
        damping: 26,
        mass: 0.7,
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir >= 0 ? -32 : 32,
      y: -6,
      scale: 0.99,
      transition: {
        duration: 0.18,
        ease: 'easeOut' as const,
      },
    }),
  };

  // Synchronize browser history for standard Android hardware/gesture back-button and URL routes support
  useEffect(() => {
    // Check initial search param in URL
    const params = new URLSearchParams(window.location.search);
    const initialQ = params.get('q');
    const path = window.location.pathname;

    if (initialQ) {
      setSearchSubmittedQuery(initialQ);
      setSearchQuery(initialQ);
      setCurrentTab('search');
    } else if (path.startsWith('/account/')) {
      const sub = path.replace('/account/', '') as AccountSubPage;
      setCurrentTab('account');
      setAccountSubPage(sub);
    } else if (!window.history.state || !window.history.state.tab) {
      window.history.replaceState({ tab: 'home' }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      // 1. Back from Product Details -> restore previous page scroll
      if (selectedProduct) {
        const lastEntry = navigationHistoryRef.current.pop();
        setSelectedProduct(null);
        const targetKey = lastEntry?.key || (currentTab === 'home' ? `home:${activeCategory}` : currentTab);
        const targetY = lastEntry?.scrollY ?? (scrollPositionsRef.current.get(targetKey) || 0);
        restoreScrollPosition(targetKey, targetY);
        return;
      }

      // 2. Back from Account Sub-Page -> restore previous page scroll
      if (accountSubPage) {
        const lastEntry = navigationHistoryRef.current.pop();
        if (lastEntry && lastEntry.tab === 'home') {
          // Came from Home Bell
          setAccountSubPage(null);
          setCurrentTab('home');
          if (lastEntry.category) setActiveCategory(lastEntry.category);
          restoreScrollPosition(lastEntry.key, lastEntry.scrollY);
        } else {
          // Came from My Account
          setAccountSubPage(null);
          const targetY = lastEntry?.scrollY ?? (scrollPositionsRef.current.get('account') || 0);
          restoreScrollPosition('account', targetY);
        }
        return;
      }

      // 3. Normal History Back
      if (event.state && event.state.tab) {
        const lastEntry = navigationHistoryRef.current.pop();
        setCurrentTab(event.state.tab);
        if (event.state.subPage) {
          setAccountSubPage(event.state.subPage);
        } else {
          setAccountSubPage(null);
        }
        if (event.state.q) {
          setSearchSubmittedQuery(event.state.q);
          setSearchQuery(event.state.q);
        }
        const targetKey = lastEntry?.key || (event.state.tab === 'home' ? `home:${activeCategory}` : event.state.tab);
        const targetY = lastEntry?.scrollY ?? (scrollPositionsRef.current.get(targetKey) || 0);
        restoreScrollPosition(targetKey, targetY);
      } else {
        setCurrentTab('home');
        setAccountSubPage(null);
        const targetY = scrollPositionsRef.current.get(`home:${activeCategory}`) || 0;
        restoreScrollPosition(`home:${activeCategory}`, targetY);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct, accountSubPage, currentTab, activeCategory, restoreScrollPosition, setActiveCategory]);

  // Open Full-screen Product Detail Page and record scroll position & recently viewed product
  const handleOpenProductDetail = useCallback((product: Product) => {
    const currentKey = getCurrentKey();
    const currentY = window.scrollY;
    scrollPositionsRef.current.set(currentKey, currentY);

    navigationHistoryRef.current.push({
      tab: currentTab,
      subPage: accountSubPage,
      category: activeCategory,
      searchQuery: searchSubmittedQuery,
      key: currentKey,
      scrollY: currentY,
    });

    setSelectedProduct(product);

    // Track recently viewed products in localStorage
    try {
      const saved = localStorage.getItem('gravvy_recently_viewed');
      const existing: string[] = saved ? JSON.parse(saved) : [];
      const updated = [product.id, ...existing.filter((id) => id !== product.id)].slice(0, 20);
      localStorage.setItem('gravvy_recently_viewed', JSON.stringify(updated));
    } catch {}

    window.history.pushState({ tab: currentTab, q: searchSubmittedQuery, productDetailId: product.id, prevKey: currentKey }, '');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [getCurrentKey, currentTab, accountSubPage, activeCategory, searchSubmittedQuery]);

  // Close Product Detail Page and restore previous page scroll position
  const handleCloseProductDetail = useCallback(() => {
    const lastEntry = navigationHistoryRef.current.pop();
    setSelectedProduct(null);
    const targetKey = lastEntry?.key || (currentTab === 'home' ? `home:${activeCategory}` : currentTab);
    const targetY = lastEntry?.scrollY ?? (scrollPositionsRef.current.get(targetKey) || 0);
    restoreScrollPosition(targetKey, targetY);
  }, [currentTab, activeCategory, restoreScrollPosition]);

  // Dedicated Search Trigger
  const handleOpenDedicatedSearch = useCallback(() => {
    setIsDedicatedSearchOpen(true);
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Dedicated Search Results Trigger
  const handleOpenSearchResults = useCallback((query: string) => {
    const clean = query.trim();
    if (!clean) return;
    const currentKey = getCurrentKey();
    scrollPositionsRef.current.set(currentKey, window.scrollY);

    setSearchSubmittedQuery(clean);
    setSearchQuery(clean);
    setIsDedicatedSearchOpen(false);
    setSelectedProduct(null);
    setAccountSubPage(null);
    window.history.pushState({ tab: 'search', q: clean }, '', `?q=${encodeURIComponent(clean)}`);
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [getCurrentKey]);

  // Handle Tab changes from Bottom Navigation, header links, or in-page actions
  const handleNavTabChange = useCallback((tab: MainNavTab) => {
    const currentKey = getCurrentKey();
    scrollPositionsRef.current.set(currentKey, window.scrollY);

    setSelectedProduct(null);
    setAccountSubPage(null);
    if (tab === 'cart') {
      setCheckoutStep('cart');
    }
    if (tab !== currentTab) {
      window.history.pushState({ tab }, '', tab === 'home' ? '/' : undefined);
      setCurrentTab(tab);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [getCurrentKey, currentTab]);

  const handleSelectCategory = useCallback((cat: CategoryTab) => {
    setActiveCategory(cat);
  }, [setActiveCategory]);

  // Dedicated Account Sub-Pages Navigation
  const handleNavigateAccountSubPage = (subPage: AccountSubPage) => {
    const currentKey = 'account';
    const currentY = window.scrollY;
    scrollPositionsRef.current.set(currentKey, currentY);

    navigationHistoryRef.current.push({
      tab: 'account',
      subPage: null,
      key: 'account',
      scrollY: currentY,
    });

    setSelectedProduct(null);
    setAccountSubPage(subPage);
    setCurrentTab('account');
    window.history.pushState({ tab: 'account', subPage }, '', `/account/${subPage}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Open Notifications from Home Bell icon (unifying Home Bell + Account Notifications)
  const handleOpenNotificationsFromHome = () => {
    const currentKey = `home:${activeCategory}`;
    const currentY = window.scrollY;
    scrollPositionsRef.current.set(currentKey, currentY);

    navigationHistoryRef.current.push({
      tab: 'home',
      subPage: null,
      category: activeCategory,
      key: currentKey,
      scrollY: currentY,
    });

    setSelectedProduct(null);
    setCurrentTab('account');
    setAccountSubPage('notifications');
    window.history.pushState({ tab: 'account', subPage: 'notifications', fromHome: true, prevKey: currentKey }, '', '/account/notifications');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Back navigation from any dedicated Account Sub-Page
  const handleBackFromAccountSubPage = () => {
    const lastEntry = navigationHistoryRef.current.pop();
    if (lastEntry && lastEntry.tab === 'home') {
      // User entered from Home Bell
      setAccountSubPage(null);
      setCurrentTab('home');
      if (lastEntry.category) setActiveCategory(lastEntry.category);
      window.history.pushState({ tab: 'home' }, '', '/');
      restoreScrollPosition(lastEntry.key, lastEntry.scrollY);
    } else {
      // User entered from My Account
      setAccountSubPage(null);
      window.history.pushState({ tab: 'account' }, '', '/account');
      const targetY = lastEntry?.scrollY ?? (scrollPositionsRef.current.get('account') || 0);
      restoreScrollPosition('account', targetY);
    }
  };

  // Product mutations for Admin Dashboard
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleOrderSuccess = (order: Order) => {
    handleNavTabChange('orders');
  };

  // Dedicated Pages vs Global Browsing Experience:
  // Global Header (Search, Location, Categories) appears ONLY on browsing experience (Home, Food, Grocery, Medicine).
  // Dedicated Pages (Product Details, Location, Your Wish, Cart, Orders, Account, Sub-pages) have their own dedicated header.
  const isBrowsingExperience = !selectedProduct && !isLocationPageOpen && currentTab === 'home';

  return (
    <div
      style={backgroundStyle}
      className="min-h-screen text-stone-100 flex flex-col transition-all duration-700 relative overflow-x-hidden"
    >
      <CategoryGradientDefs />
      {/* UNI Theme Gemini-Inspired Ambient Viewport Glow */}
      <UniAmbientGlow />

      {/* Global Browsing Header: ONLY visible during browsing, NOT on dedicated pages */}
      {isBrowsingExperience && (
        <Header
          products={products}
          onSelectProduct={(p) => handleOpenProductDetail(p)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSubmitSearch={handleOpenSearchResults}
          onNavigateHome={() => handleNavTabChange('home')}
          onOpenNotifications={handleOpenNotificationsFromHome}
          onOpenDedicatedSearch={handleOpenDedicatedSearch}
          onOpenLocationPage={() => {
            setIsLocationPageOpen(true);
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        />
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 pb-28 sm:pb-24 ${
          isBrowsingExperience ? 'pt-2 xs:pt-3 sm:pt-4' : 'pt-0'
        }`}
      >
        {/* Full-screen dedicated Location Page */}
        {isLocationPageOpen ? (
          <LocationPage
            onBack={() => setIsLocationPageOpen(false)}
            onNavigateToAddresses={() => {
              setIsLocationPageOpen(false);
              handleNavigateAccountSubPage('addresses');
            }}
          />
        ) : selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={products}
            onBack={handleCloseProductDetail}
            onSelectProduct={handleOpenProductDetail}
            onProceedToCheckout={() => {
              setSelectedProduct(null);
              setCurrentTab('cart');
              setCheckoutStep('order-summary');
            }}
            onOpenReviewModal={(pId) => setReviewModalProductId(pId)}
          />
        ) : null}

        <div style={{ display: selectedProduct || isLocationPageOpen ? 'none' : 'contents' }}>
          {currentTab === 'search' ? (
            isDedicatedSearchOpen || !searchSubmittedQuery ? (
              <DedicatedSearchPage
                products={products}
                initialQuery={searchQuery}
                onSelectProduct={handleOpenProductDetail}
                onBack={() => {
                  setIsDedicatedSearchOpen(false);
                  handleNavTabChange('home');
                }}
                onSubmitSearch={handleOpenSearchResults}
              />
            ) : (
              <SearchResultsPage
                products={products}
                initialQuery={searchSubmittedQuery || searchQuery || 'Medicine'}
                onSelectProduct={handleOpenProductDetail}
                onBack={() => {
                  setIsDedicatedSearchOpen(true);
                }}
                onSelectCategory={(cat: CategoryTab) => {
                  setActiveCategory(cat);
                  handleNavTabChange('home');
                }}
                onOpenDedicatedSearch={handleOpenDedicatedSearch}
              />
            )
          ) : currentTab === 'wishlist' ? (
            <YourWishView
              allProducts={products}
              onOpenProductDetail={handleOpenProductDetail}
              onContinueShopping={() => handleNavTabChange('home')}
              onNavigateToCart={() => {
                setCheckoutStep('cart');
                handleNavTabChange('cart');
              }}
            />
          ) : currentTab === 'cart' ? (
            /* Dedicated Checkout Flow: Cart -> Order Summary -> Instructions -> Payment -> Confirmation */
            checkoutStep === 'order-summary' ? (
              <OrderSummaryPage
                onBack={() => setCheckoutStep('cart')}
                onContinue={() => setCheckoutStep('delivery-instructions')}
                onNavigateStep={(stepId) => {
                  if (stepId === 'order-summary') setCheckoutStep('order-summary');
                }}
                onChangeAddress={() => {
                  setAddressReturnTarget('order-summary');
                  handleNavigateAccountSubPage('addresses');
                }}
              />
            ) : checkoutStep === 'delivery-instructions' ? (
              <DeliveryInstructionsPage
                onBack={() => setCheckoutStep('order-summary')}
                onContinue={() => setCheckoutStep('payment')}
                onNavigateStep={(stepId) => {
                  if (stepId === 'order-summary') setCheckoutStep('order-summary');
                  if (stepId === 'delivery-instructions') setCheckoutStep('delivery-instructions');
                }}
                instructions={deliveryInstructions}
                setInstructions={setDeliveryInstructions}
              />
            ) : checkoutStep === 'payment' ? (
              <PaymentPage
                onBack={() => setCheckoutStep('delivery-instructions')}
                onNavigateStep={(stepId) => {
                  if (stepId === 'order-summary') setCheckoutStep('order-summary');
                  if (stepId === 'delivery-instructions') setCheckoutStep('delivery-instructions');
                  if (stepId === 'payment') setCheckoutStep('payment');
                }}
                deliveryInstructions={deliveryInstructions}
                onPaymentSuccess={(newOrder) => {
                  setPlacedOrder(newOrder);
                  setCheckoutStep('confirmation');
                }}
              />
            ) : checkoutStep === 'confirmation' && placedOrder ? (
              <OrderConfirmationPage
                order={placedOrder}
                onViewMyOrders={() => {
                  setFocusedOrderIdForOrdersView(placedOrder.id);
                  setCheckoutStep('cart');
                  handleNavTabChange('orders');
                }}
                onContinueShopping={() => {
                  setCheckoutStep('cart');
                  handleNavTabChange('home');
                }}
              />
            ) : (
              <CartPage
                onProceedToCheckout={() => {
                  if (!isAuthenticated) {
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setCheckoutStep('order-summary');
                }}
                onContinueShopping={() => handleNavTabChange('home')}
                onNavigateTab={handleNavTabChange}
                onChangeAddress={() => {
                  setAddressReturnTarget('cart');
                  handleNavigateAccountSubPage('addresses');
                }}
              />
            )
          ) : currentTab === 'orders' ? (
            <OrdersView
              initialOrderId={focusedOrderIdForOrdersView}
              onBack={() => {
                setFocusedOrderIdForOrdersView(null);
                handleNavTabChange('home');
              }}
              onNavigateCart={() => {
                setCheckoutStep('cart');
                handleNavTabChange('cart');
              }}
              onNavigateSupport={() => handleNavigateAccountSubPage('support')}
            />
          ) : currentTab === 'account' ? (
            /* Dedicated Account Views: Sub-pages or Main Hub */
            accountSubPage === 'profile' ? (
              <ProfilePage onBack={handleBackFromAccountSubPage} />
            ) : accountSubPage === 'addresses' ? (
              <SavedAddressesPage
                onBack={() => {
                  if (addressReturnTarget) {
                    const target = addressReturnTarget;
                    setAddressReturnTarget(null);
                    setAccountSubPage(null);
                    setCurrentTab('cart');
                    setCheckoutStep(target);
                  } else {
                    handleBackFromAccountSubPage();
                  }
                }}
                onSelectAddress={(addr) => {
                  if (addressReturnTarget) {
                    const target = addressReturnTarget;
                    setAddressReturnTarget(null);
                    setAccountSubPage(null);
                    setCurrentTab('cart');
                    setCheckoutStep(target);
                  }
                }}
              />
            ) : accountSubPage === 'payments' ? (
              <PaymentMethodsPage onBack={handleBackFromAccountSubPage} />
            ) : accountSubPage === 'notifications' ? (
              <NotificationsPage onBack={handleBackFromAccountSubPage} />
            ) : accountSubPage === 'recently_viewed' ? (
              <RecentlyViewedPage
                allProducts={products}
                onOpenProductDetail={handleOpenProductDetail}
                onContinueShopping={() => handleNavTabChange('home')}
                onBack={handleBackFromAccountSubPage}
              />
            ) : accountSubPage === 'reviews' ? (
              <ReviewsPage onBack={handleBackFromAccountSubPage} />
            ) : accountSubPage === 'help' ? (
              <HelpCenterPage
                onBack={handleBackFromAccountSubPage}
                onNavigateSupport={() => handleNavigateAccountSubPage('support')}
              />
            ) : accountSubPage === 'support' ? (
              <CustomerSupportPage onBack={handleBackFromAccountSubPage} />
            ) : accountSubPage === 'faqs' ? (
              <FaqsPage onBack={handleBackFromAccountSubPage} />
            ) : accountSubPage === 'contact' ? (
              <ContactUsPage onBack={handleBackFromAccountSubPage} />
            ) : accountSubPage === 'privacy' || accountSubPage === 'terms' || accountSubPage === 'about' ? (
              <LegalPage type={accountSubPage} onBack={handleBackFromAccountSubPage} />
            ) : (
              <AccountView
                onNavigateTab={handleNavTabChange}
                onNavigateSubPage={handleNavigateAccountSubPage}
                onOpenTestRunner={() => setIsTestRunnerOpen(true)}
                onBack={() => handleNavTabChange('home')}
              />
            )
          ) : currentTab === 'admin' ? (
            <AdminDashboard
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              promotions={HOME_PROMOTIONS}
            />
          ) : (
            /* Marketplace views governed by Category Navigation with Leap/Slide transition */
            <AnimatePresence mode="wait" custom={leapDirection} initial={false}>
              <motion.div
                key={activeCategory}
                custom={leapDirection}
                variants={categoryLeapVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                {activeCategory === 'home' && (
                  <HomePage
                    products={products}
                    promotions={HOME_PROMOTIONS}
                    onOpenProductDetail={handleOpenProductDetail}
                    onSelectCategory={handleSelectCategory}
                  />
                )}

                {activeCategory === 'food' && (
                  <FoodMarketplace
                    products={products}
                    onOpenProductDetail={handleOpenProductDetail}
                  />
                )}

                {activeCategory === 'grocery' && (
                  <GroceryMarketplace
                    products={products}
                    onOpenProductDetail={handleOpenProductDetail}
                  />
                )}

                {activeCategory === 'medicine' && (
                  <MedicineMarketplace
                    products={products}
                    onOpenProductDetail={handleOpenProductDetail}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Fixed Bottom Navigation (Hidden completely when on Product Details, Dedicated Account Sub-pages, or during active Checkout Flow steps) */}
      {!selectedProduct && !accountSubPage && !(currentTab === 'cart' && checkoutStep !== 'cart') && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={handleNavTabChange}
        />
      )}

      {/* Review Submission Form Modal */}
      <ReviewFormModal
        productId={reviewModalProductId}
        isOpen={!!reviewModalProductId}
        onClose={() => setReviewModalProductId(null)}
        onSubmitReview={(newRev) => {
          // Submitted review feedback
        }}
      />

      {/* In-app Automated QA Test Runner Modal */}
      <AutomatedTestRunner
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
        products={products}
        promotions={HOME_PROMOTIONS}
      />

      {/* Customer Firebase Authentication Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LocationProvider>
        <NotificationProvider>
          <AuthProvider>
            <CartProvider>
              <MainAppContent />
            </CartProvider>
          </AuthProvider>
        </NotificationProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}
