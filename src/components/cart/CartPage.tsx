import React, { useState, useMemo, useCallback } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Percent,
  MapPin,
  CheckCircle,
  ChevronRight,
  Info,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Pill,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { MainNavTab, CartItem } from '../../types';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface CartItemRowProps {
  item: CartItem;
  textColorPrimary: string;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

const CartItemRow = React.memo<CartItemRowProps>(
  ({ item, textColorPrimary, onUpdateQuantity, onRemove }) => {
    const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
    const originalPrice = item.selectedVariant
      ? item.selectedVariant.originalPrice || price
      : item.product.originalPrice || price;

    return (
      <div className="p-2 rounded-xl bg-stone-500/5 border border-stone-500/10 flex items-center justify-between gap-2.5 transition-all">
        {/* Product Image (~60px) & Details */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative shrink-0">
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover border border-stone-500/20 shrink-0 shadow-2xs"
              referrerPolicy="no-referrer"
            />
            {/* Veg / Non-Veg badge */}
            {item.product.veg !== undefined && item.product.veg !== null && (
              <div
                className={`absolute -top-1 -left-1 w-3.5 h-3.5 rounded-xs border flex items-center justify-center bg-white shadow-xs ${
                  item.product.veg ? 'border-emerald-600' : 'border-rose-600'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.product.veg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className={`text-xs sm:text-[13px] font-bold truncate leading-tight ${textColorPrimary}`}>
              {item.product.name}
            </h3>

            <p className="text-[10.5px] text-stone-400 truncate leading-tight">
              {item.selectedVariant ? `${item.selectedVariant.label} · ` : ''}
              {item.product.restaurantOrBrand}
            </p>

            <div className="flex items-baseline gap-1.5 text-xs">
              <span className="font-mono font-bold text-amber-400">₹{price}</span>
              {originalPrice > price && (
                <span className="text-[10.5px] font-mono text-stone-500 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quantity Stepper & Remove */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quantity Stepper */}
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs shadow-xs">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="p-0.5 hover:bg-stone-950/10 rounded active:scale-90 cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3 stroke-[2.5]" />
            </button>
            <span className="font-mono tabular-nums font-black min-w-3 text-center text-xs">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-0.5 hover:bg-stone-950/10 rounded active:scale-90 cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
);

interface CartPageProps {
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
  onNavigateTab: (tab: MainNavTab) => void;
  onChangeAddress?: () => void;
}

const CartPageComponent: React.FC<CartPageProps> = ({
  onProceedToCheckout,
  onContinueShopping,
  onNavigateTab,
  onChangeAddress,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted, setActiveCategory } = useTheme();
  const {
    cartItems,
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
  } = useCart();

  const { activeAddress } = useLocation();

  // Coupon state
  const [isCouponExpanded, setIsCouponExpanded] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Tip custom input state
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [customTipInput, setCustomTipInput] = useState('');

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onContinueShopping();
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ success: res.success, text: res.message });
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleCustomTipChange = (val: string) => {
    setCustomTipInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
      setTipAmount(num);
    } else {
      setTipAmount(0);
    }
  };

  // If cart is empty, show polished full-screen empty state
  if (cartItems.length === 0) {
    return (
      <div className="w-full space-y-4 pb-20 animate-in fade-in duration-200 max-w-xl mx-auto">
        <DedicatedPageHeader title="Cart" onBack={handleBack} />

        <div
          className={`p-8 rounded-3xl border text-center space-y-4 backdrop-blur-xl ${
            theme === 'LIGHT' ? 'bg-white/90 border-stone-200 shadow-sm' : 'bg-stone-900/50 border-white/10'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-400/15 text-amber-400 border border-amber-400/30 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className={`text-lg font-black font-display ${textColorPrimary}`}>
              Your Delivery Bag is Empty
            </h2>
            <p className="text-xs text-stone-400 max-w-xs mx-auto">
              Add piping hot dishes, fresh daily groceries, or medical essentials to place an order!
            </p>
          </div>

          {/* Quick Category Jump */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setActiveCategory('food');
                onContinueShopping();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Hot Food</span>
            </button>
            <button
              onClick={() => {
                setActiveCategory('grocery');
                onContinueShopping();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Groceries</span>
            </button>
            <button
              onClick={() => {
                setActiveCategory('medicine');
                onContinueShopping();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Medicines</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={onContinueShopping}
              className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${categoryAccent.bgClass}`}
            >
              <span>Explore Menu & Shop</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5 pb-24 animate-in fade-in duration-200 max-w-xl mx-auto">
      {/* Top Dedicated Header Bar */}
      <DedicatedPageHeader
        title="Cart"
        onBack={handleBack}
        itemCount={totalCartCount}
        rightAction={
          <button
            onClick={onContinueShopping}
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              theme === 'LIGHT'
                ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-200'
            }`}
          >
            <span>+ Add More</span>
          </button>
        }
      />

      {/* ============================================================ */}
      {/* 1. CART ITEMS (Exact Order: Section 1)                       */}
      {/* ============================================================ */}
      <div
        className={`p-2.5 sm:p-3 rounded-2xl border transition-all backdrop-blur-xl space-y-2 ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-stone-950/40 border-white/15'
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-500/10 pb-1.5">
          <h2 className={`font-bold text-xs uppercase tracking-wider ${textColorMuted}`}>
            Cart Items ({cartItems.length})
          </h2>
          <span className="text-[10.5px] text-emerald-400 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> 15–20 Mins Delivery
          </span>
        </div>

        {/* Compact List of Items */}
        <div className="space-y-2">
          {cartItems.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              textColorPrimary={textColorPrimary}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. COMPACT DELIVERY ADDRESS (Exact Order: Section 2)         */}
      {/* ============================================================ */}
      <div
        className={`p-2.5 sm:p-3 rounded-2xl border transition-all backdrop-blur-xl space-y-1 ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-stone-950/40 border-white/15'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Deliver to: {activeAddress.name || 'User'}</span>
          </div>
          <button
            type="button"
            onClick={onChangeAddress || (() => onNavigateTab('account'))}
            className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
          >
            <span>Change Delivery Address</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <p className="text-[11px] text-stone-300 leading-tight truncate">
          {activeAddress.street}, {activeAddress.area}, {activeAddress.city} - {activeAddress.pinCode}
        </p>
      </div>

      {/* ============================================================ */}
      {/* 3. COUPON CODE (Exact Order: Section 3 - Collapsible by default) */}
      {/* ============================================================ */}
      <div
        className={`p-2.5 rounded-2xl border transition-all backdrop-blur-xl space-y-2 ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-stone-950/40 border-white/15'
        }`}
      >
        <div
          onClick={() => setIsCouponExpanded((prev) => !prev)}
          className="flex items-center justify-between text-xs font-bold cursor-pointer select-none"
        >
          <div className="flex items-center gap-1.5 text-amber-400">
            <Tag className="w-3.5 h-3.5" />
            <span>Coupon Code</span>
            <span
              className="text-[10px] text-stone-400 hover:text-white"
              title="Click to expand/collapse coupon input"
            >
              ⓘ
            </span>
          </div>

          <div className="flex items-center gap-1">
            {appliedCoupon ? (
              <span className="text-[10.5px] text-emerald-400 font-bold">
                {appliedCoupon} (-₹{discountAmount})
              </span>
            ) : (
              <span className="text-[10px] text-stone-400">
                {isCouponExpanded ? 'Hide' : 'Apply'}
              </span>
            )}
            {isCouponExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            )}
          </div>
        </div>

        {/* Collapsible Coupon Form */}
        {isCouponExpanded && (
          <div className="space-y-2 pt-1 border-t border-stone-500/10 animate-in fade-in duration-150">
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Enter coupon (e.g. WELCOME50, GRAVVY20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className={`flex-1 px-2.5 py-1.5 rounded-xl text-xs uppercase font-mono border focus:outline-none transition-all ${
                    theme === 'LIGHT'
                      ? 'bg-stone-100 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-400'
                      : 'bg-stone-900/80 border-white/15 text-white placeholder:text-stone-500 focus:border-amber-400'
                  }`}
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-stone-950 hover:bg-amber-300 transition-colors cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <Percent className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate text-[11px]">
                    <strong>{appliedCoupon}</strong> active! Saved ₹{discountAmount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-rose-400 text-[11px] font-bold hover:underline shrink-0 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {couponMessage && !appliedCoupon && (
              <p className={`text-[10.5px] ${couponMessage.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {couponMessage.text}
              </p>
            )}

            {/* Quick Suggestions */}
            {!appliedCoupon && (
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                <span className="text-stone-400">Try:</span>
                {['WELCOME50', 'GRAVVY20', 'HEALTH10'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setCouponInput(code);
                      const res = applyCoupon(code);
                      setCouponMessage({ success: res.success, text: res.message });
                    }}
                    className="font-mono font-bold px-1.5 py-0.5 rounded-md bg-stone-500/10 hover:bg-amber-400/20 text-amber-400 border border-stone-500/20 transition-colors cursor-pointer"
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. TIP YOUR DELIVERY PARTNER (Exact Order: Section 4)        */}
      {/* ============================================================ */}
      <div
        className={`p-2.5 sm:p-3 rounded-2xl border transition-all backdrop-blur-xl space-y-2 ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-stone-950/40 border-white/15'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className={`font-bold ${textColorPrimary}`}>Tip Your Delivery Partner</span>
          <span className="text-[10px] text-stone-400">100% goes directly to rider</span>
        </div>

        {/* Preset Options: ₹0 | ₹10 | ₹20 | ₹30 | Custom */}
        <div className="grid grid-cols-5 gap-1.5 text-xs">
          {[0, 10, 20, 30].map((amt) => {
            const isSelected = !isCustomTip && tipAmount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setIsCustomTip(false);
                  setTipAmount(amt);
                }}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-xs'
                    : 'bg-stone-500/5 border-stone-500/20 text-stone-400 hover:border-stone-500/40'
                }`}
              >
                {amt === 0 ? '₹0' : `₹${amt}`}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setIsCustomTip(true);
              if (customTipInput) {
                setTipAmount(parseInt(customTipInput, 10) || 0);
              }
            }}
            className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
              isCustomTip
                ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-xs'
                : 'bg-stone-500/5 border-stone-500/20 text-stone-400 hover:border-stone-500/40'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Input */}
        {isCustomTip && (
          <div className="pt-1 flex items-center gap-2 animate-in fade-in">
            <span className="text-xs text-stone-400 font-bold">₹</span>
            <input
              type="number"
              min="0"
              max="500"
              placeholder="Enter tip amount"
              value={customTipInput}
              onChange={(e) => handleCustomTipChange(e.target.value)}
              className={`w-32 px-2.5 py-1 rounded-lg text-xs font-mono border focus:outline-none ${
                theme === 'LIGHT'
                  ? 'bg-stone-100 border-stone-300 text-stone-900 focus:border-amber-400'
                  : 'bg-stone-900 border-white/15 text-white focus:border-amber-400'
              }`}
            />
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 5. COMPACT PRICE DETAILS (Exact Order: Section 5)            */}
      {/* ============================================================ */}
      <div
        className={`p-3 rounded-2xl border transition-all backdrop-blur-xl space-y-2 text-xs ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-stone-950/40 border-white/15'
        }`}
      >
        <h3 className={`font-bold text-[11px] uppercase tracking-wider border-b border-stone-500/10 pb-1 ${textColorMuted}`}>
          Price Details
        </h3>

        <div className="space-y-1 text-[11px]">
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
            <span>Applicable Taxes</span>
            <span className="font-mono text-stone-200">₹0</span>
          </div>

          <div className="pt-1.5 border-t border-stone-500/15 flex justify-between items-baseline font-bold text-xs">
            <span className={textColorPrimary}>Total Payable</span>
            <span className="font-mono text-sm sm:text-base text-amber-400 font-black">
              ₹{totalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. PROCEED TO CHECKOUT BUTTON (Exact Order: Section 6)       */}
      {/* ============================================================ */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onProceedToCheckout}
          className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-md active:scale-95 cursor-pointer ${categoryAccent.bgClass}`}
        >
          <div className="flex flex-col text-left">
            <span className="text-[9px] opacity-80 leading-none">Total Payable</span>
            <span className="text-sm font-mono font-black text-stone-950">₹{totalAmount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-950 font-black">
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};

export const CartPage = React.memo(CartPageComponent);
