import React, { useState } from 'react';
import {
  Check,
  Clock,
  Package,
  Truck,
  FileText,
  MapPin,
  Phone,
  Download,
  CreditCard,
  ShoppingBag,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { Order, OrderStatus } from '../../types';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';
import { GoogleDeliveryTrackerMap } from '../maps/GoogleDeliveryTrackerMap';
import { generateOrderInvoicePDF, isOrderDelivered } from '../../utils/pdfInvoiceGenerator';

interface OrderDetailsPageProps {
  order: Order;
  onBack: () => void;
  onNavigateSupport?: () => void;
  onNavigateCart?: () => void;
}

interface TimelineStep {
  key: OrderStatus;
  title: string;
  desc: string;
  timestamp?: string;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({
  order,
  onBack,
  onNavigateSupport,
  onNavigateCart,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const { addToCart } = useCart();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [reorderFeedback, setReorderFeedback] = useState<string | null>(null);

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return {
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        time: date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
    } catch {
      return null;
    }
  };

  const statusProgression: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentStepIdx = statusProgression.indexOf(order.status);
  const isDelivered = isOrderDelivered(order);

  // Define tracking steps with real order timestamp mapping
  const timelineSteps: TimelineStep[] = [
    {
      key: 'placed',
      title: 'Order Placed',
      desc: 'Order received and payment verified.',
      timestamp: order.placedAt || order.createdAt,
    },
    {
      key: 'confirmed',
      title: 'Order Confirmed',
      desc: 'Partner confirmed and initiated dispatch.',
      timestamp: order.confirmedAt,
    },
    {
      key: 'preparing',
      title: 'Preparing',
      desc: 'Packed in eco-friendly sealed packaging.',
      timestamp: order.preparingAt,
    },
    {
      key: 'out_for_delivery',
      title: 'Out for Delivery',
      desc: order.deliveryAgent
        ? `${order.deliveryAgent.name} is en route.`
        : 'Rider is on the way to your address.',
      timestamp: order.outForDeliveryAt,
    },
    {
      key: 'delivered',
      title: 'Delivered',
      desc: 'Delivery completed. Enjoy your items!',
      timestamp: order.deliveredAt,
    },
  ];

  const handleDownloadInvoice = async () => {
    if (!isDelivered) return;
    try {
      setIsDownloadingPdf(true);
      await generateOrderInvoicePDF(order);
    } catch (err) {
      console.error('Failed to generate invoice PDF:', err);
      alert('Could not generate PDF invoice. Please try again.');
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 1200);
    }
  };

  const handleReorder = () => {
    if (!isDelivered) return;
    let countAdded = 0;
    order.items.forEach((item) => {
      if (item.product.inStock) {
        addToCart(item.product, item.quantity, item.selectedVariant);
        countAdded += item.quantity;
      }
    });

    if (countAdded > 0) {
      setReorderFeedback(`Added ${countAdded} item${countAdded > 1 ? 's' : ''} to Bag!`);
      setTimeout(() => setReorderFeedback(null), 3000);
    } else {
      setReorderFeedback('Item is currently out of stock.');
      setTimeout(() => setReorderFeedback(null), 3000);
    }
  };

  const primaryItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <div className="w-full space-y-2.5 pb-20 animate-in fade-in duration-200 max-w-xl mx-auto">
      {/* 1. Dedicated Header: ← Back Order Details */}
      <DedicatedPageHeader
        title="Order Details"
        onBack={onBack}
        subtitle={`#${order.orderNumber}`}
        rightAction={
          isDelivered ? (
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={isDownloadingPdf}
              className="p-1 px-2.5 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 transition-all flex items-center gap-1.5 cursor-pointer text-[11px] font-bold shadow-2xs active:scale-95"
              title="Download PDF Invoice"
            >
              <Download className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{isDownloadingPdf ? 'Generating...' : 'PDF Invoice'}</span>
            </button>
          ) : undefined
        }
      />

      {/* Reorder Feedback Notification Banner */}
      {reorderFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{reorderFeedback}</span>
          </div>
          {onNavigateCart && (
            <button
              onClick={onNavigateCart}
              className="text-[11px] font-bold underline text-emerald-300 hover:text-white shrink-0"
            >
              View Cart →
            </button>
          )}
        </div>
      )}

      {/* 2. ULTRA-COMPACT CART-SIZED PRODUCT CARD (Identical density to Cart item) */}
      <div
        className={`p-2.5 rounded-2xl border transition-all backdrop-blur-xl ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-stone-950/40 border-white/15'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Small Product Thumbnail (approx 56px) */}
          <div className="relative shrink-0">
            <img
              src={
                primaryItem?.product.images[0] ||
                'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80'
              }
              alt={primaryItem?.product.name || 'Order Item'}
              className="w-14 h-14 rounded-xl object-cover border border-stone-500/20 shrink-0 shadow-2xs"
              referrerPolicy="no-referrer"
            />
            {/* Veg / Non-veg badge overlay */}
            {primaryItem?.product.veg !== undefined && primaryItem?.product.veg !== null && (
              <div
                className={`absolute -top-1 -left-1 w-3.5 h-3.5 rounded-xs border flex items-center justify-center bg-white shadow-xs ${
                  primaryItem.product.veg ? 'border-emerald-600' : 'border-rose-600'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    primaryItem.product.veg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
              </div>
            )}
            {extraCount > 0 && (
              <span className="absolute -bottom-1 -right-1 text-[8px] font-black px-1 py-0.2 rounded-md bg-stone-900 text-amber-400 border border-amber-400/40 shadow-xs">
                +{extraCount}
              </span>
            )}
          </div>

          {/* Compact Product Details */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 truncate">
                {primaryItem?.product.category || 'Order'} · {primaryItem?.product.restaurantOrBrand}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                ₹{order.total}
              </span>
            </div>

            <h3 className={`text-xs sm:text-[13px] font-bold truncate leading-tight ${textColorPrimary}`}>
              {primaryItem?.product.name}
              {extraCount > 0 ? ` +${extraCount} item${extraCount > 1 ? 's' : ''}` : ''}
            </h3>

            <div className="flex items-center justify-between text-[11px] text-stone-400 leading-tight">
              <span className="truncate">
                Qty: {primaryItem?.quantity || 1}
                {primaryItem?.selectedVariant ? ` · ${primaryItem.selectedVariant.label}` : ''}
              </span>

              {/* Status Badge with colored indicator */}
              <span
                className={`text-[11px] font-bold shrink-0 flex items-center gap-1 ${
                  order.status === 'delivered'
                    ? 'text-emerald-400'
                    : order.status === 'out_for_delivery'
                    ? 'text-amber-400'
                    : 'text-sky-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    order.status === 'delivered'
                      ? 'bg-emerald-500'
                      : order.status === 'out_for_delivery'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-sky-400'
                  }`}
                />
                {order.status === 'delivered'
                  ? 'Delivered'
                  : order.status === 'out_for_delivery'
                  ? 'Out for Delivery'
                  : order.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-item breakdown (if 2+ items, ultra-compact list) */}
        {order.items.length > 1 && (
          <div className="mt-2 pt-1.5 border-t border-stone-500/10 space-y-0.5">
            {order.items.slice(1).map((item, idx) => {
              const itemPrice = (item.selectedVariant ? item.selectedVariant.price : item.product.price) * item.quantity;
              return (
                <div key={idx} className="flex items-center justify-between text-[10px] text-stone-400">
                  <span className="truncate flex-1 pr-2">
                    • {item.product.name} (x{item.quantity})
                  </span>
                  <span className="font-mono font-semibold text-stone-300 shrink-0">₹{itemPrice}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Google Delivery Tracker Map */}
      {order.address && (
        <GoogleDeliveryTrackerMap
          deliveryAddress={order.address}
          status={order.status}
          etaMinutes={order.etaMinutes || 20}
          deliveryAgentName={order.deliveryAgent?.name || 'Arjun Das'}
        />
      )}

      {/* 3. COMPACT FLIPKART/AMAZON-STYLE VERTICAL DELIVERY TRACKER */}
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
          <h3 className={`text-[10.5px] font-bold uppercase tracking-wider ${textColorMuted}`}>
            Delivery Progress
          </h3>
          {order.status === 'delivered' ? (
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" /> Completed
            </span>
          ) : (
            <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" /> ETA {order.etaMinutes || 15}m
            </span>
          )}
        </div>

        {/* Vertical Connected Timeline (Compact spacing) */}
        <div className="relative pl-1.5 py-0.5 space-y-3">
          {timelineSteps.map((step, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            const isLast = idx === timelineSteps.length - 1;
            const stepDateTime = formatDateTime(step.timestamp);

            return (
              <div key={step.key} className="relative flex items-start gap-2.5">
                {/* Connecting Vertical Line */}
                {!isLast && (
                  <div
                    className={`absolute left-[8px] top-[16px] bottom-[-12px] w-0.5 transition-colors ${
                      currentStepIdx > idx
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-gradient-to-b from-emerald-500 to-stone-700'
                        : 'bg-stone-700/40'
                    }`}
                  />
                )}

                {/* Circular Status Indicator (Compact 18px circle) */}
                <div className="relative z-10 shrink-0 mt-0.5">
                  {isCompleted ? (
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center font-bold shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-4.5 h-4.5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-xs ring-2 ring-amber-400/30 animate-pulse">
                      <Clock className="w-2.5 h-2.5" />
                    </div>
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-stone-600" />
                    </div>
                  )}
                </div>

                {/* Milestone Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <h4
                      className={`text-xs font-bold ${
                        isCompleted
                          ? 'text-emerald-400'
                          : isCurrent
                          ? 'text-amber-400'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.title}
                      {isCompleted && step.key === 'delivered' && ' — Done ✓'}
                    </h4>

                    {stepDateTime && (
                      <span className="text-[10px] font-mono text-stone-400 shrink-0">
                        {stepDateTime.date} · {stepDateTime.time}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-stone-400 leading-tight mt-0.2">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Delivery Hero Card (Compact) */}
      {order.deliveryAgent && (
        <div
          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
            theme === 'LIGHT'
              ? 'bg-white/80 border-stone-200 shadow-2xs'
              : 'bg-stone-900/40 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs shrink-0 font-bold">
              🛵
            </div>
            <div className="min-w-0">
              <h5 className={`text-xs font-bold truncate ${textColorPrimary}`}>
                {order.deliveryAgent.name}
              </h5>
              <span className="text-[10px] text-stone-400 block truncate">
                {order.deliveryAgent.vehicle}
              </span>
            </div>
          </div>

          <a
            href={`tel:${order.deliveryAgent.phone}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all shrink-0 cursor-pointer"
          >
            <Phone className="w-3 h-3" />
            <span>Call</span>
          </a>
        </div>
      )}

      {/* 5. Address & Itemized Payment Summary (Compact) */}
      <div
        className={`p-2.5 rounded-2xl border transition-all space-y-2 text-xs ${
          theme === 'LIGHT' ? 'bg-white/80 border-stone-200 shadow-2xs' : 'bg-stone-900/40 border-white/10'
        }`}
      >
        {/* Delivery Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className={`font-bold block text-xs ${textColorPrimary}`}>
              Delivery Address ({order.address.tag})
            </span>
            <p className="text-stone-300 text-[10.5px] leading-tight mt-0.5">
              {order.address.name} ({order.address.phone}) · {order.address.street}, {order.address.area}, {order.address.city} - {order.address.pinCode}
            </p>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="pt-1.5 border-t border-stone-500/10 space-y-1 text-[10.5px]">
          <div className="flex justify-between text-stone-400">
            <span>Item Subtotal</span>
            <span className="font-mono text-stone-200">₹{order.subtotal}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount ({order.couponCode || 'PROMO'})</span>
              <span className="font-mono">-₹{order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-400">
            <span>Delivery Fee</span>
            <span className="font-mono text-stone-200">
              {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
            </span>
          </div>
          {order.tipAmount > 0 && (
            <div className="flex justify-between text-stone-400">
              <span>Rider Tip</span>
              <span className="font-mono text-stone-200">+₹{order.tipAmount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xs pt-1 border-t border-stone-500/10">
            <span className={textColorPrimary}>Total Paid</span>
            <span className="font-mono text-amber-400">₹{order.total}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-stone-400 pt-0.5">
            <CreditCard className="w-3 h-3 text-stone-400" />
            <span>
              Paid via {order.paymentMethod.toUpperCase()} · Status: {order.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Actions: ONLY FOR DELIVERED ORDERS */}
      {isDelivered ? (
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleReorder}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer ${categoryAccent.bgClass}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-stone-950" />
            <span className="text-stone-950">Reorder All</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={isDownloadingPdf}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold border border-amber-400/40 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingPdf ? 'Generating...' : 'Download Invoice'}</span>
          </button>

          {onNavigateSupport && (
            <button
              type="button"
              onClick={onNavigateSupport}
              className="py-2 px-3 rounded-xl text-xs font-bold border border-stone-500/20 text-stone-300 hover:text-white hover:bg-stone-500/10 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Help</span>
            </button>
          )}
        </div>
      ) : (
        onNavigateSupport && (
          <div className="pt-0.5">
            <button
              type="button"
              onClick={onNavigateSupport}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold border border-stone-500/20 text-stone-300 hover:text-white hover:bg-stone-500/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Need Help with this Order?</span>
            </button>
          </div>
        )
      )}
    </div>
  );
};
