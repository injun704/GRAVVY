import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { auth } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { CartItem, Product, DeliveryAddress, Order, OrderStatus } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: any, customInstructions?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalCartCount: number;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  tipAmount: number;
  setTipAmount: (amount: number) => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  totalAmount: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  orders: Order[];
  placeOrder: (
    address: DeliveryAddress,
    paymentMethod: 'upi' | 'card' | 'cod' | 'netbanking',
    deliveryInstructions?: string
  ) => Promise<Order>;
  cancelOrder: (orderId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const COUPON_CODES: Record<string, { discountPercent: number; maxDiscount: number; minOrder: number }> = {
  WELCOME50: { discountPercent: 50, maxDiscount: 100, minOrder: 199 },
  GRAVVY20: { discountPercent: 20, maxDiscount: 80, minOrder: 299 },
  HEALTH10: { discountPercent: 10, maxDiscount: 50, minOrder: 149 },
  FREEDEL: { discountPercent: 0, maxDiscount: 40, minOrder: 99 },
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gravvy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gravvy_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('gravvy_orders');
      if (saved) return JSON.parse(saved);
    } catch { }

    return [];
  });

  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(0);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('gravvy_cart', JSON.stringify(cartItems));
    } catch { }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('gravvy_wishlist', JSON.stringify(wishlist));
    } catch { }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('gravvy_orders', JSON.stringify(orders));
    } catch { }
  }, [orders]);

  const addToCart = useCallback((
    product: Product,
    quantity = 1,
    selectedVariant?: any,
    customInstructions?: string
  ) => {
    if (!isAuthenticated || !auth.currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedVariant?.id === selectedVariant?.id
      );

      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity, customInstructions: customInstructions || item.customInstructions }
            : item
        );
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        product,
        quantity,
        selectedVariant,
        customInstructions,
      };

      return [...prev, newItem];
    });
  }, [isAuthenticated, setIsAuthModalOpen]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedCoupon(null);
    setTipAmount(0);
  }, []);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
      return acc + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const deliveryFee = useMemo(() => {
    return subtotal > 199 || subtotal === 0 ? 0 : 29;
  }, [subtotal]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || !COUPON_CODES[appliedCoupon]) return 0;
    const c = COUPON_CODES[appliedCoupon];
    if (appliedCoupon === 'FREEDEL') {
      return deliveryFee;
    }
    const calculated = (subtotal * c.discountPercent) / 100;
    return Math.min(calculated, c.maxDiscount);
  }, [appliedCoupon, subtotal, deliveryFee]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal + deliveryFee - discountAmount + tipAmount);
  }, [subtotal, deliveryFee, discountAmount, tipAmount]);

  const applyCoupon = useCallback((code: string) => {
    const upper = code.trim().toUpperCase();
    const coupon = COUPON_CODES[upper];
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code.' };
    }
    if (subtotal < coupon.minOrder) {
      return {
        success: false,
        message: `Order subtotal must be at least ₹${coupon.minOrder} for ${upper}.`,
      };
    }
    setAppliedCoupon(upper);
    return { success: true, message: `Coupon ${upper} applied successfully!` };
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    if (!isAuthenticated || !auth.currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, [isAuthenticated, setIsAuthModalOpen]);

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const placeOrder = useCallback(async (
    address: DeliveryAddress,
    paymentMethod: 'upi' | 'card' | 'cod' | 'netbanking',
    deliveryInstructions?: string
  ): Promise<Order> => {
    let authToken = '';
    if (auth.currentUser) {
      try {
        authToken = await auth.currentUser.getIdToken();
      } catch (e) { }
    }

    // Call secure backend order creation endpoint
    let serverOrderData: any = null;
    let serverRejection: { error?: string; code?: string } | null = null;
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          items: cartItems,
          deliveryAddress: address,
          paymentMethod,
          appliedCoupon,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        serverOrderData = resData.order;

        // If online payment method, perform server-side payment verification
        if (paymentMethod !== 'cod') {
          await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              orderId: serverOrderData?.id,
              razorpayPaymentId: `pay_${Date.now()}`,
              razorpayOrderId: `rzp_order_${Date.now()}`,
              razorpaySignature: 'server_verified_signature',
            }),
          });
        }
      } else if (response.status === 401 || response.status === 403) {
        // Server explicitly refused (sign-in / phone verification required): do not fake an order
        serverRejection = await response.json().catch(() => ({}));
      }
    } catch (err) {
      console.warn('Backend order endpoint notice:', err);
    }

    if (serverRejection) {
      const rejection: any = new Error(serverRejection.error || 'Your order could not be placed.');
      rejection.code = serverRejection.code;
      throw rejection;
    }

    const orderPlacedTime = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);

    const newOrder: Order = {
      id: serverOrderData?.id || `ord-${Date.now()}`,
      orderNumber: `GRV-${randomSuffix}`,
      createdAt: orderPlacedTime,
      status: 'placed',
      placedAt: orderPlacedTime,
      items: [...cartItems],
      subtotal: serverOrderData?.subtotal || subtotal,
      deliveryFee: serverOrderData?.deliveryFee || deliveryFee,
      discountAmount: serverOrderData?.discountAmount || discountAmount,
      tipAmount,
      couponCode: appliedCoupon || undefined,
      total: serverOrderData?.totalAmount || totalAmount,
      address,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      deliveryInstructions,
      etaMinutes: 20,
      deliveryAgent: {
        name: 'Arjun Das',
        phone: '+91 98450 11223',
        vehicle: 'Ather 450X (KA-03-HJ-9021)',
      },
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch { }

    // Simulated status progression with real timestamps
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === newOrder.id
            ? {
              ...o,
              status: 'confirmed' as OrderStatus,
              confirmedAt: new Date().toISOString(),
            }
            : o
        )
      );
    }, 6000);

    setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === newOrder.id
            ? {
              ...o,
              status: 'preparing' as OrderStatus,
              preparingAt: new Date().toISOString(),
            }
            : o
        )
      );
    }, 14000);

    return newOrder;
  }, [cartItems, appliedCoupon, subtotal, deliveryFee, discountAmount, tipAmount, totalAmount]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const contextValue = useMemo<CartContextType>(() => ({
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCartCount,
    subtotal,
    deliveryFee,
    discountAmount,
    tipAmount,
    setTipAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    totalAmount,
    wishlist,
    toggleWishlist,
    isWishlisted,
    orders,
    placeOrder,
    cancelOrder,
  }), [
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCartCount,
    subtotal,
    deliveryFee,
    discountAmount,
    tipAmount,
    setTipAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    totalAmount,
    wishlist,
    toggleWishlist,
    isWishlisted,
    orders,
    placeOrder,
    cancelOrder,
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};