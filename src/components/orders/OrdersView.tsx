import React, { useState } from 'react';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  ChevronRight,
  ShoppingBag,
  Download,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { Order, OrderStatus, MainNavTab } from '../../types';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';
import { OrderDetailsPage } from './OrderDetailsPage';
import { generateOrderInvoicePDF, isOrderDelivered } from '../../utils/pdfInvoiceGenerator';

interface OrdersViewProps {
  onBack?: () => void;
  onNavigateSupport?: () => void;
  onNavigateCart?: () => void;
  initialOrderId?: string | null;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  onBack,
  onNavigateSupport,
  onNavigateCart,
  initialOrderId,
}) => {
  const { orders, addToCart } = useCart();
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrderId || null);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [reorderMessage, setReorderMessage] = useState<{ id: string; text: string; success: boolean } | null>(null);

  React.useEffect(() => {
    if (initialOrderId) {
      setSelectedOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    }
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  if (selectedOrder) {
    return (
      <OrderDetailsPage
        order={selectedOrder}
        onBack={() => setSelectedOrderId(null)}
        onNavigateSupport={onNavigateSupport}
        onNavigateCart={onNavigateCart}
      />
    );
  }

  const handleDownloadInvoice = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    // Strict verification: invoice only for delivered orders
    if (!isOrderDelivered(order)) {
      return;
    }
    try {
      setDownloadingOrderId(order.id);
      
      let authToken = '';
      try {
        const { auth } = await import('../../lib/firebase');
        if (auth.currentUser) {
          authToken = await auth.currentUser.getIdToken();
        }
      } catch (e) {}

      const response = await fetch(`/api/invoices/${order.id}`, {
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GRAVVY-Invoice-${order.orderNumber || order.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        await generateOrderInvoicePDF(order);
      }
    } catch (err) {
      console.error('Error fetching PDF invoice:', err);
      await generateOrderInvoicePDF(order);
    } finally {
      setTimeout(() => setDownloadingOrderId(null), 1200);
    }
  };

  const handleReorderOrder = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    // Strict verification: reorder only for delivered orders
    if (!isOrderDelivered(order)) {
      return;
    }

    let countAdded = 0;
    order.items.forEach((item) => {
      if (item.product.inStock) {
        addToCart(item.product, item.quantity, item.selectedVariant);
        countAdded += item.quantity;
      }
    });

    if (countAdded > 0) {
      setReorderMessage({
        id: order.id,
        text: `Added ${countAdded} item${countAdded > 1 ? 's' : ''} to Bag!`,
        success: true,
      });
      setTimeout(() => setReorderMessage(null), 3500);
    } else {
      setReorderMessage({
        id: order.id,
        text: 'Items from this order are currently out of stock.',
        success: false,
      });
      setTimeout(() => setReorderMessage(null), 3500);
    }
  };

  const getStatusDisplay = (order: Order) => {
    if (order.status === 'delivered') {
      const deliveredDate = order.deliveredAt
        ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      return {
        label: `Delivered on ${deliveredDate}`,
        badgeClass: 'text-emerald-400 font-bold',
        dotClass: 'bg-emerald-500',
      };
    }

    if (order.status === 'out_for_delivery') {
      return {
        label: `Out for Delivery · In ${order.etaMinutes || 15}m`,
        badgeClass: 'text-amber-400 font-bold',
        dotClass: 'bg-amber-400 animate-pulse',
      };
    }

    if (order.status === 'preparing') {
      return {
        label: 'Preparing your items',
        badgeClass: 'text-sky-400 font-bold',
        dotClass: 'bg-sky-400',
      };
    }

    if (order.status === 'confirmed') {
      return {
        label: 'Order Confirmed',
        badgeClass: 'text-sky-400 font-semibold',
        dotClass: 'bg-sky-400',
      };
    }

    return {
      label: 'Order Placed',
      badgeClass: 'text-stone-300 font-semibold',
      dotClass: 'bg-amber-400',
    };
  };

  return (
    <div className="w-full space-y-3.5 pb-24 animate-in fade-in duration-200 max-w-xl mx-auto">
      {/* 1. Dedicated Header: ← Back My Orders */}
      <DedicatedPageHeader
        title="My Orders"
        onBack={handleBack}
        itemCount={orders.length}
      />

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const primaryItem = order.items[0];
            const extraItemsCount = order.items.length - 1;
            const statusInfo = getStatusDisplay(order);
            const isDelivered = isOrderDelivered(order);
            const isDownloading = downloadingOrderId === order.id;
            const hasReorderMsg = reorderMessage?.id === order.id;

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer group hover:border-amber-400/40 backdrop-blur-xl flex flex-col justify-between gap-2.5 ${
                  theme === 'LIGHT'
                    ? 'bg-white/90 border-stone-200 shadow-2xs hover:shadow-xs'
                    : theme === 'DARK'
                    ? 'bg-stone-900/40 border-white/10 hover:bg-stone-900/60'
                    : 'bg-stone-950/30 border-white/15 hover:bg-stone-950/50'
                }`}
              >
                {/* TOP ROW: Compact Product Info + Status + Chevron */}
                <div className="flex items-center justify-between gap-2.5 min-w-0">
                  {/* Left: Product Image Thumbnail */}
                  <div className="relative shrink-0">
                    <img
                      src={
                        primaryItem?.product.images[0] ||
                        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={primaryItem?.product.name || 'Order Item'}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover border border-stone-500/20 shrink-0 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                    {extraItemsCount > 0 && (
                      <span className="absolute -bottom-1 -right-1 text-[8px] font-black px-1 py-0.2 rounded-md bg-stone-900 text-amber-400 border border-amber-400/40 shadow-xs">
                        +{extraItemsCount}
                      </span>
                    )}
                  </div>

                  {/* Middle: Product Name, Qty/Variant, Status */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className={`text-xs sm:text-[13px] font-bold truncate leading-tight group-hover:text-amber-400 transition-colors ${textColorPrimary}`}>
                        {primaryItem?.product.name || 'Order Item'}
                        {extraItemsCount > 0 ? ` +${extraItemsCount} item${extraItemsCount > 1 ? 's' : ''}` : ''}
                      </h3>
                      <span className="text-xs font-mono font-bold text-amber-400 shrink-0 ml-1">
                        ₹{order.total}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 truncate leading-tight">
                      Qty: {primaryItem?.quantity || 1}
                      {primaryItem?.selectedVariant ? ` · ${primaryItem.selectedVariant.label}` : ''}
                      {` · #${order.orderNumber}`}
                    </p>

                    {/* Delivery Status below info with colored dot */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusInfo.dotClass}`} />
                      <span className={`text-[11px] truncate ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Right: Small Right Chevron */}
                  <div className="flex items-center gap-0.5 shrink-0 pl-1">
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Reorder notification for this card */}
                {hasReorderMsg && (
                  <div
                    className={`p-2 rounded-xl text-[11px] font-semibold flex items-center justify-between gap-1.5 animate-in fade-in ${
                      reorderMessage.success
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {reorderMessage.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">{reorderMessage.text}</span>
                    </div>
                    {onNavigateCart && reorderMessage.success && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateCart();
                        }}
                        className="text-[10.5px] font-bold underline text-emerald-300 hover:text-white shrink-0 ml-1 cursor-pointer"
                      >
                        View Cart
                      </button>
                    )}
                  </div>
                )}

                {/* BOTTOM DUAL ACTION ROW: ONLY FOR DELIVERED ORDERS */}
                {isDelivered && (
                  <div
                    className="pt-2 border-t border-stone-500/10 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* LEFT: Download Invoice Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDownloadInvoice(e, order)}
                      disabled={isDownloading}
                      className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                        theme === 'LIGHT'
                          ? 'border-stone-300 hover:bg-stone-100 text-stone-800'
                          : 'border-white/15 hover:bg-white/10 text-stone-200'
                      }`}
                      title={`Download PDF Invoice for #${order.orderNumber}`}
                    >
                      <Download className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{isDownloading ? 'Generating...' : 'Download Invoice'}</span>
                    </button>

                    {/* RIGHT: Reorder Button */}
                    <button
                      type="button"
                      onClick={(e) => handleReorderOrder(e, order)}
                      className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${categoryAccent.bgClass}`}
                      title="Add items from this order to cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-stone-950 shrink-0" />
                      <span className="truncate text-stone-950 font-black">Reorder</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div
          className={`p-10 rounded-3xl border text-center space-y-4 backdrop-blur-xl ${
            theme === 'LIGHT' ? 'bg-white/80 border-stone-200' : 'bg-stone-900/40 border-white/10'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className={`text-base font-bold font-display ${textColorPrimary}`}>
              No Orders Placed Yet
            </h3>
            <p className="text-xs text-stone-400 max-w-xs mx-auto">
              Browse hot food, fresh groceries, and pharmacy medicines to place your first fast delivery order!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
