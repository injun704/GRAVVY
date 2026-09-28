import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  Lock,
  ArrowRight,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { Order } from '../../types';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';
import { PhoneVerifyModal } from '../auth/PhoneVerifyModal';
import { CheckoutProgressTracker } from './CheckoutProgressTracker';
import { loadRazorpayScript } from '../../utils/razorpay';

interface PaymentPageProps {
  onBack: () => void;
  onPaymentSuccess: (order: Order) => void;
  deliveryInstructions: string;
  onNavigateStep?: (stepId: 'order-summary' | 'delivery-instructions' | 'payment' | 'orders') => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  onBack,
  onPaymentSuccess,
  deliveryInstructions,
  onNavigateStep,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const { totalAmount, placeOrder, cartItems } = useCart();
  const { activeAddress } = useLocation();
  const { user, isAuthenticated, isPhoneVerified, setIsAuthModalOpen } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);

  // Route Guard: Ensure valid delivery preference exists before rendering payment
  React.useEffect(() => {
    if (!deliveryInstructions || !deliveryInstructions.trim()) {
      onBack();
    }
  }, [deliveryInstructions, onBack]);

  const handlePay = async (skipPhoneCheck: boolean = false) => {
    if (isProcessing) return;
    setErrorMessage('');

    if (!isAuthenticated || !user) {
      setErrorMessage('Please sign in or create an account to place your order.');
      setIsAuthModalOpen(true);
      return;
    }

    // Phone verification gate (the server enforces this too)
    if (!isPhoneVerified && !skipPhoneCheck) {
      setShowPhoneVerify(true);
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!activeAddress || !activeAddress.street) {
      setErrorMessage('Invalid delivery address. Please return to summary.');
      return;
    }

    if (paymentMethod === 'cod') {
      if (totalAmount > 5000) {
        setErrorMessage(
          'Cash on Delivery is available for orders up to ₹5,000. Please choose Razorpay Online Payment.'
        );
        return;
      }

      setIsProcessing(true);
      try {
        const order = await placeOrder(activeAddress, 'cod', deliveryInstructions);
        setIsProcessing(false);
        onPaymentSuccess(order);
      } catch (err: any) {
        setIsProcessing(false);
        if (err?.code === 'PHONE_NOT_VERIFIED') {
          setShowPhoneVerify(true);
          return;
        }
        setErrorMessage(err?.message || 'Failed to place Cash on Delivery order.');
      }
      return;
    }

    // RAZORPAY ONLINE PAYMENT FLOW
    setIsProcessing(true);

    try {
      let authToken = '';
      if (auth.currentUser) {
        try {
          authToken = await auth.currentUser.getIdToken();
        } catch (e) { }
      }

      // 1. Load Razorpay Checkout SDK Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setIsProcessing(false);
        setErrorMessage(
          'Failed to load Razorpay payment gateway. Please check your internet connection.'
        );
        return;
      }

      // 2. Create Razorpay Order on Secure Backend Server
      const createOrderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          notes: {
            deliveryAddress: `${activeAddress.street}, ${activeAddress.city} ${activeAddress.pinCode}`,
          },
        }),
      });

      const orderData = await createOrderRes.json();

      if (orderData.code === 'PHONE_NOT_VERIFIED') {
        setIsProcessing(false);
        setShowPhoneVerify(true);
        return;
      }

      if (!orderData.success || !orderData.orderId) {
        setIsProcessing(false);
        setErrorMessage(
          orderData.message || 'Failed to initialize payment gateway order. Please try again.'
        );
        return;
      }

      // 3. Prepare Order details for verification
      const pendingOrderId = `ord-${Date.now()}`;
      const pendingOrderObj = {
        id: pendingOrderId,
        orderNumber: `GRV-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toISOString(),
        items: cartItems,
        total: totalAmount,
        subtotal: totalAmount,
        deliveryFee: 0,
        discountAmount: 0,
        tipAmount: 0,
        address: activeAddress,
        deliveryInstructions,
        paymentMethod: 'razorpay' as const,
        paymentStatus: 'pending' as const,
        status: 'placed' as const,
        etaMinutes: 20,
      };

      // 4. Handle Sandbox Simulation Mode if Razorpay live keys are not configured yet
      if (orderData.isSandboxMode) {
        await new Promise((r) => setTimeout(r, 1200));
        const verifyRes = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: 'simulated_test_signature',
            orderData: pendingOrderObj,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          const confirmedOrder = await placeOrder(
            activeAddress,
            'upi',
            deliveryInstructions
          );
          setIsProcessing(false);
          onPaymentSuccess({
            ...confirmedOrder,
            status: 'confirmed',
            paymentStatus: 'paid',
          });
        } else {
          setIsProcessing(false);
          setErrorMessage('Test payment verification failed.');
        }
        return;
      }

      // 5. Open Real Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GRAVVY Express',
        description: 'Food & Grocery Order Payment',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || activeAddress.name || 'Customer',
          email: user?.email || '',
          contact: user?.phone || activeAddress.phone || '',
        },
        notes: {
          address: activeAddress.street,
        },
        theme: {
          color: '#f59e0b',
        },
        handler: async function (response: any) {
          try {
            // 5. Verify Razorpay Payment Signature on Backend Server
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: pendingOrderObj,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Complete order placement locally
              const confirmedOrder = await placeOrder(
                activeAddress,
                'upi',
                deliveryInstructions
              );
              setIsProcessing(false);
              onPaymentSuccess({
                ...confirmedOrder,
                status: 'confirmed',
                paymentStatus: 'paid',
              });
            } else {
              setIsProcessing(false);
              setErrorMessage(
                verifyData.message || 'Payment signature verification failed. Order not placed.'
              );
            }
          } catch (verifyErr: any) {
            setIsProcessing(false);
            setErrorMessage('Server error verifying Razorpay payment. Please contact support.');
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setErrorMessage('Payment process was cancelled by user.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setIsProcessing(false);
        setErrorMessage(
          resp.error?.description || 'Payment transaction failed. Please try another card or UPI.'
        );
      });

      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Unexpected payment initialization error.');
    }
  };

  return (
    <div className="w-full space-y-3 pb-24 animate-in fade-in duration-200 max-w-xl mx-auto">
      {/* Dedicated Header */}
      <DedicatedPageHeader title="Payment" onBack={onBack} subtitle="Step 3 of 4" />

      {/* Progress Tracker */}
      <CheckoutProgressTracker currentStep={3} onNavigateStep={onNavigateStep} />

      {/* Amount Payable Bar */}
      <div
        className={`p-3 rounded-2xl border transition-all backdrop-blur-xl flex items-center justify-between ${theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
              ? 'bg-stone-900/60 border-white/10'
              : 'bg-stone-950/40 border-white/15'
          }`}
      >
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            Total Payable
          </span>
          <span className="text-lg font-mono font-black text-amber-400">₹{totalAmount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Razorpay 256-Bit Encrypted</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div
        className={`p-3.5 rounded-2xl border transition-all backdrop-blur-xl space-y-3 ${theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
              ? 'bg-stone-900/60 border-white/10'
              : 'bg-stone-950/40 border-white/15'
          }`}
      >
        <h3 className={`text-xs font-bold uppercase tracking-wider ${textColorMuted}`}>
          Choose Payment Option
        </h3>

        {/* Primary Payment Method Selection (Horizontal Side-by-Side) */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* PAY ONLINE */}
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('razorpay');
              setErrorMessage('');
            }}
            className={`p-3.5 rounded-xl border flex flex-col justify-between gap-1 transition-all text-left cursor-pointer ${paymentMethod === 'razorpay'
                ? 'border-amber-400 bg-amber-400/15 text-white shadow-xs ring-1 ring-amber-400/30'
                : 'border-stone-500/20 bg-stone-500/5 text-stone-400 hover:border-stone-500/40'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                PAY ONLINE
              </span>
              {paymentMethod === 'razorpay' && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
            </div>
            <span className="text-[10px] text-stone-400 font-medium leading-tight">
              Razorpay (UPI, Cards, NetBanking, Wallets)
            </span>
          </button>

          {/* CASH ON DELIVERY */}
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('cod');
              setErrorMessage('');
            }}
            className={`p-3.5 rounded-xl border flex flex-col justify-between gap-1 transition-all text-left cursor-pointer ${paymentMethod === 'cod'
                ? 'border-emerald-400 bg-emerald-500/15 text-white shadow-xs ring-1 ring-emerald-400/30'
                : 'border-stone-500/20 bg-stone-500/5 text-stone-400 hover:border-stone-500/40'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                CASH ON DELIVERY
              </span>
              {paymentMethod === 'cod' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </div>
            <span className="text-[10px] text-stone-400 font-medium leading-tight">
              Pay at Door (Cash / QR Code)
            </span>
          </button>
        </div>

        {/* Razorpay Online Banner */}
        {paymentMethod === 'razorpay' && (
          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-300 text-[11.5px]">
              <span>Supports all Indian Payment Modes</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-stone-300">
              <span className="px-2 py-0.5 rounded bg-stone-900/80 border border-white/10 font-bold flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-amber-400" /> Google Pay / PhonePe / Paytm / BHIM UPI
              </span>
              <span className="px-2 py-0.5 rounded bg-stone-900/80 border border-white/10 font-bold flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-sky-400" /> Credit & Debit Cards (Visa/Mastercard/RuPay)
              </span>
              <span className="px-2 py-0.5 rounded bg-stone-900/80 border border-white/10 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> NetBanking & Wallets
              </span>
            </div>
          </div>
        )}

        {/* Cash on Delivery Banner */}
        {paymentMethod === 'cod' && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 space-y-1">
            <div className="font-bold">Pay on Delivery (Cash / UPI at Door):</div>
            <p className="text-[11px] text-stone-300">
              Please keep exact cash of ₹{totalAmount} ready or scan the delivery hero's QR code upon arrival.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Pay Action Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => handlePay()}
          disabled={isProcessing}
          className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer ${isProcessing
              ? 'bg-stone-700 text-stone-300 cursor-not-allowed'
              : `${categoryAccent.bgClass} text-stone-950 hover:brightness-105`
            }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Connecting to Razorpay Secure Checkout...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-black">
              <Lock className="w-3.5 h-3.5" />
              <span>
                {paymentMethod === 'cod'
                  ? `CONFIRM CASH ON DELIVERY · ₹${totalAmount}`
                  : `PAY ONLINE · ₹${totalAmount}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>

      {showPhoneVerify && (
        <PhoneVerifyModal
          onClose={() => setShowPhoneVerify(false)}
          onVerified={() => {
            setShowPhoneVerify(false);
            handlePay(true);
          }}
        />
      )}
    </div>
  );
};