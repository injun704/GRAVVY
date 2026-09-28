import React, { memo } from 'react';
import {
  ArrowRight,
  MapPin,
  Tag,
  ShieldCheck,
  ChevronRight,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';
import { CheckoutProgressTracker } from './CheckoutProgressTracker';
import { CartItem } from '../../types';

interface OrderSummaryItemRowProps {
  item: CartItem;
  textColorPrimary: string;
}

const OrderSummaryItemRow = memo<OrderSummaryItemRowProps>(({ item, textColorPrimary }) => {
  const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
  const lineTotal = price * item.quantity;

  return (
    <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-stone-500/5 border border-stone-500/10">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <img
          src={item.product.images[0]}
          alt={item.product.name}
          className="w-11 h-11 rounded-lg object-cover border border-stone-500/20 shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0 flex-1">
          <h4 className={`text-xs font-bold truncate leading-tight ${textColorPrimary}`}>
            {item.product.name}
          </h4>
          <p className="text-[10.5px] text-stone-400 truncate">
            Qty: {item.quantity}
            {item.selectedVariant ? ` · ${item.selectedVariant.label}` : ''}
            {` · ₹${price} each`}
          </p>
        </div>
      </div>
      <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
        ₹{lineTotal}
      </span>
    </div>
  );
});

interface OrderSummaryPageProps {
  onBack: () => void;
  onContinue: () => void;
  onChangeAddress: () => void;
  onNavigateStep?: (stepId: 'order-summary' | 'delivery-instructions' | 'payment' | 'orders') => void;
}

const OrderSummaryPageComponent: React.FC<OrderSummaryPageProps> = ({
  onBack,
  onContinue,
  onChangeAddress,
  onNavigateStep,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const {
    cartItems,
    subtotal,
    deliveryFee,
    discountAmount,
    tipAmount,
    appliedCoupon,
    totalAmount,
    totalCartCount,
  } = useCart();
  const { activeAddress } = useLocation();
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleProceedToInstructions = () => {
    setValidationError(null);
    if (!cartItems || cartItems.length === 0) {
      setValidationError('Your cart is empty. Please add items before proceeding.');
      return;
    }
    if (!activeAddress || !activeAddress.street) {
      setValidationError('Please select a valid delivery address.');
      return;
    }
    const hasInvalidQty = cartItems.some((item) => item.quantity <= 0);
    if (hasInvalidQty) {
      setValidationError('One or more items in your cart have invalid quantities.');
      return;
    }
    onContinue();
  };

  return (
    <div className="w-full space-y-3 pb-24 animate-in fade-in duration-200 max-w-xl mx-auto">
      {/* 1. Dedicated Header */}
      <DedicatedPageHeader
        title="Order Summary"
        onBack={onBack}
        itemCount={totalCartCount}
      />

      {/* 1.1 Four-Step Horizontal Progress Tracker */}
      <CheckoutProgressTracker
        currentStep={1}
        onNavigateStep={onNavigateStep}
      />

      {/* 2. Delivery Address Summary */}
      <div
        className={`p-3 rounded-2xl border transition-all backdrop-blur-xl space-y-1.5 ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-stone-950/40 border-white/15'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>Deliver to: {activeAddress.name || 'User'}</span>
          </div>
          <button
            type="button"
            onClick={onChangeAddress}
            className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>Change</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <p className="text-[11px] text-stone-300 leading-tight">
          {activeAddress.street}, {activeAddress.area}, {activeAddress.city} - {activeAddress.pinCode}
        </p>
        <span className="text-[10px] text-stone-400 block">Phone: {activeAddress.phone}</span>
      </div>

      {/* 3. Compact Product List */}
      <div
        className={`p-3 rounded-2xl border transition-all backdrop-blur-xl space-y-2.5 ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-stone-950/40 border-white/15'
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-500/10 pb-1.5">
          <h3 className={`text-[11px] font-bold uppercase tracking-wider ${textColorMuted}`}>
            Order Items ({cartItems.length})
          </h3>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> 15-20 Mins Delivery
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
          {cartItems.map((item) => (
            <OrderSummaryItemRow
              key={item.id}
              item={item}
              textColorPrimary={textColorPrimary}
            />
          ))}
        </div>
      </div>

      {/* 4. Applied Coupon & Tip Overview */}
      {(appliedCoupon || tipAmount > 0) && (
        <div
          className={`p-2.5 rounded-2xl border transition-all space-y-1.5 text-xs ${
            theme === 'LIGHT' ? 'bg-white/80 border-stone-200 shadow-2xs' : 'bg-stone-900/40 border-white/10'
          }`}
        >
          {appliedCoupon && (
            <div className="flex items-center justify-between text-emerald-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" /> Coupon <strong>{appliedCoupon}</strong> Applied
              </span>
              <span className="font-mono font-bold">-₹{discountAmount}</span>
            </div>
          )}
          {tipAmount > 0 && (
            <div className="flex items-center justify-between text-amber-400 text-[11px]">
              <span>Delivery Partner Tip</span>
              <span className="font-mono font-bold">+₹{tipAmount}</span>
            </div>
          )}
        </div>
      )}

      {/* 5. Compact Price Breakdown */}
      <div
        className={`p-3 rounded-2xl border transition-all space-y-2 text-xs ${
          theme === 'LIGHT' ? 'bg-white/80 border-stone-200 shadow-2xs' : 'bg-stone-900/40 border-white/10'
        }`}
      >
        <h4 className={`text-[11px] font-bold uppercase tracking-wider border-b border-stone-500/10 pb-1 ${textColorMuted}`}>
          Price Details
        </h4>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between text-stone-400">
            <span>Item Subtotal</span>
            <span className="font-mono text-stone-200">₹{subtotal}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Discount ({appliedCoupon})
              </span>
              <span className="font-mono">-₹{discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-stone-400">
            <span>Delivery Fee</span>
            <span className="font-mono text-stone-200">
              {deliveryFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${deliveryFee}`}
            </span>
          </div>

          {tipAmount > 0 && (
            <div className="flex justify-between text-stone-400">
              <span>Delivery Partner Tip</span>
              <span className="font-mono text-stone-200">+₹{tipAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-stone-400">
            <span>Applicable Taxes & Handling</span>
            <span className="font-mono text-stone-200">₹0</span>
          </div>

          <div className="pt-2 border-t border-stone-500/15 flex justify-between items-baseline font-bold text-xs">
            <span className={textColorPrimary}>Total Payable Amount</span>
            <span className="font-mono text-sm sm:text-base text-amber-400 font-black">
              ₹{totalAmount}
            </span>
          </div>
        </div>
      </div>

      {validationError && (
        <p className="text-xs text-rose-500 font-bold text-center pt-1">
          {validationError}
        </p>
      )}

      {/* 6. Sticky Bottom Action: CONTINUE → */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleProceedToInstructions}
          className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-md active:scale-95 cursor-pointer ${categoryAccent.bgClass}`}
        >
          <div className="flex flex-col text-left">
            <span className="text-[9px] opacity-80 leading-none">Total Payable</span>
            <span className="text-sm font-mono font-black text-stone-950">₹{totalAmount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-950 font-black">
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};

export const OrderSummaryPage = memo(OrderSummaryPageComponent);
