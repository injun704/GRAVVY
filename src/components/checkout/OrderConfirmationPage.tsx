import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Package,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Order } from '../../types';
import { CheckoutProgressTracker } from './CheckoutProgressTracker';
import { GoogleDeliveryTrackerMap } from '../maps/GoogleDeliveryTrackerMap';

interface OrderConfirmationPageProps {
  order: Order;
  onViewMyOrders: () => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onViewMyOrders,
  onContinueShopping,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch {}
  }, []);

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="w-full space-y-3.5 pb-24 animate-in fade-in duration-200 max-w-lg mx-auto pt-2 text-center">
      {/* 0. Checkout Progress Tracker - Final Step 4 Complete */}
      <CheckoutProgressTracker currentStep={4} />

      {/* 1. Success Hero Banner */}
      <div
        className={`p-5 rounded-3xl border shadow-lg backdrop-blur-xl space-y-3 transition-all ${
          theme === 'LIGHT'
            ? 'bg-white/95 border-stone-200 shadow-sm'
            : theme === 'DARK'
            ? 'bg-stone-900/80 border-white/15'
            : 'bg-stone-950/60 border-white/20'
        }`}
      >
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <CheckCircle className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Payment Confirmed
          </span>
          <h2 className={`text-lg sm:text-xl font-black font-display ${textColorPrimary}`}>
            Order Successfully Placed!
          </h2>
          <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
            Dark store / cloud kitchen has received your order and is packing your items.
          </p>
        </div>

        {/* Order ID & Estimated Time Pill */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30">
            Order #{order.orderNumber}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> ETA: 15–20 Mins
          </span>
        </div>
      </div>

      {/* 2. Order Summary Card */}
      <div
        className={`p-3.5 rounded-2xl border transition-all text-left space-y-2.5 text-xs ${
          theme === 'LIGHT' ? 'bg-white/80 border-stone-200 shadow-2xs' : 'bg-stone-900/40 border-white/10'
        }`}
      >
        <h4 className={`text-[11px] font-bold uppercase tracking-wider border-b border-stone-500/10 pb-1.5 ${textColorMuted}`}>
          Order Confirmation Details
        </h4>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-start justify-between">
            <span className="text-stone-400">Order Placed On</span>
            <span className="font-mono text-stone-200 font-semibold">{orderDate} at {orderTime}</span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-stone-400">Items Ordered</span>
            <span className="text-stone-200 font-semibold">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-stone-400">Payment Mode</span>
            <span className="text-stone-200 font-semibold uppercase">{order.paymentMethod} · {order.paymentStatus}</span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-stone-400">Amount Paid</span>
            <span className="font-mono text-amber-400 font-black text-xs">₹{order.total}</span>
          </div>

          <div className="pt-2 border-t border-stone-500/10">
            <span className="text-stone-400 block mb-0.5">Delivery Address ({order.address.tag})</span>
            <p className="text-stone-200 leading-tight">
              {order.address.name} ({order.address.phone})<br />
              {order.address.street}, {order.address.area}, {order.address.city} - {order.address.pinCode}
            </p>
          </div>
        </div>
      </div>

      {/* Live Google Delivery Tracker Map */}
      {order.address && (
        <div className="text-left space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 pl-1">Live Delivery Map</span>
          <GoogleDeliveryTrackerMap
            deliveryAddress={order.address}
            status={order.status}
            etaMinutes={order.etaMinutes || 20}
            deliveryAgentName={order.deliveryAgent?.name || 'Arjun Das'}
          />
        </div>
      )}

      {/* 3. Primary Action: VIEW MY ORDERS → */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onViewMyOrders}
          className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer ${categoryAccent.bgClass}`}
        >
          <Package className="w-4 h-4 text-stone-950" />
          <span className="text-stone-950">View My Orders</span>
          <ArrowRight className="w-4 h-4 text-stone-950" />
        </button>

        <button
          type="button"
          onClick={onContinueShopping}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-stone-500/20 text-stone-300 hover:text-white hover:bg-stone-500/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </button>
      </div>
    </div>
  );
};
