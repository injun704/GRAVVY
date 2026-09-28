import React, { useState } from 'react';
import {
  X,
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
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorSecondary, textColorMuted } = useTheme();
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

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ success: res.success, text: res.message });
    if (res.success) {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`absolute inset-y-0 right-0 max-w-full flex pl-10 transform transition-transform duration-300 ease-in-out`}
      >
        <div
          className={`w-screen max-w-md flex flex-col border-l shadow-2xl relative ${
            theme === 'LIGHT'
              ? 'bg-white border-stone-200'
              : theme === 'DARK'
              ? 'bg-neutral-950 border-neutral-800'
              : 'bg-stone-950 border-white/20'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-stone-500/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-500">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`font-bold font-display text-base ${textColorPrimary}`}>
                  Your Delivery Bag ({totalCartCount})
                </h2>
                <p className="text-xs text-stone-400">
                  Delivering to: <span className="font-semibold text-stone-300">{activeAddress.tag}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                  title="Clear bag"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {cartItems.length > 0 ? (
              <>
                {/* Item List */}
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl border border-stone-500/15 bg-black/10 flex items-center gap-3"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-500/20"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-bold truncate ${textColorPrimary}`}>
                            {item.product.name}
                          </h4>
                          {item.selectedVariant && (
                            <span className="text-[11px] text-amber-400 font-medium block">
                              {item.selectedVariant.label}
                            </span>
                          )}
                          {item.customInstructions && (
                            <span className="text-[10px] text-stone-400 italic block truncate">
                              "{item.customInstructions}"
                            </span>
                          )}
                          <div className="text-xs font-extrabold text-amber-400 font-mono mt-1">
                            ₹{price} × {item.quantity} = ₹{price * item.quantity}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs shrink-0">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-0.5 hover:opacity-75"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono tabular-nums min-w-3 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-0.5 hover:opacity-75"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupons Section */}
                <div className="p-3.5 rounded-2xl border border-stone-500/15 bg-black/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Tag className="w-3.5 h-3.5" /> Apply Coupon Code
                    </span>
                    {appliedCoupon && (
                      <button
                        onClick={removeCoupon}
                        className="text-rose-400 text-[11px] font-semibold hover:underline"
                      >
                        Remove ({appliedCoupon})
                      </button>
                    )}
                  </div>

                  {!appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Try 'GRAVVY50' or 'FREESHIP'"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-stone-500/10 border border-stone-500/20 text-white placeholder:text-stone-500 focus:outline-none uppercase font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-stone-950 hover:bg-amber-300 transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      <span>
                        Coupon <strong>{appliedCoupon}</strong> applied! You saved ₹{discountAmount}
                      </span>
                    </div>
                  )}

                  {couponMessage && !appliedCoupon && (
                    <p
                      className={`text-[11px] ${
                        couponMessage.success ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>

                {/* Delivery Tip to Rider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="font-semibold text-stone-300">Tip your delivery rider</span>
                    <span>100% goes to the partner</span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 20, 30, 50].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTipAmount(amt)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          tipAmount === amt
                            ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold'
                            : 'border-stone-500/20 text-stone-400 hover:text-white'
                        }`}
                      >
                        {amt === 0 ? 'No Tip' : `₹${amt}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="p-4 rounded-2xl border border-stone-500/15 bg-black/15 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-400">
                    <span>Items Subtotal</span>
                    <span className="font-mono tabular-nums text-white">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-stone-400">
                    <span>Delivery Fee</span>
                    <span className="font-mono tabular-nums text-white">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-bold">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount Savings</span>
                      <span className="font-mono tabular-nums">-₹{discountAmount}</span>
                    </div>
                  )}

                  {tipAmount > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Rider Tip</span>
                      <span className="font-mono tabular-nums">+₹{tipAmount}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-500/20 flex justify-between font-bold text-sm">
                    <span className={textColorPrimary}>To Pay</span>
                    <span className="font-mono tabular-nums text-amber-400 text-base">
                      ₹{totalAmount}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-500/10 flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className={`text-base font-bold ${textColorPrimary}`}>Your bag is empty</h3>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Add hot food, fresh vegetables, or daily medicine to get started with instant delivery.
                </p>
              </div>
            )}
          </div>

          {/* Drawer Sticky Footer Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-500/15 pb-safe">
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-between shadow-xl cursor-pointer ${categoryAccent.bgClass}`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-[10px] opacity-80 leading-none">Total Amount</span>
                  <span className="text-base font-mono font-black leading-tight">₹{totalAmount}</span>
                </div>
                <div className="flex items-center gap-1.5 font-extrabold">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
