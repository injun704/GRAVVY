import React from 'react';
import {
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  Bell,
  PhoneCall,
  UserCheck,
  DoorClosed,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';
import { CheckoutProgressTracker } from './CheckoutProgressTracker';

interface DeliveryInstructionsPageProps {
  onBack: () => void;
  onContinue: () => void;
  instructions: string;
  setInstructions: (val: string) => void;
  onNavigateStep?: (stepId: 'order-summary' | 'delivery-instructions' | 'payment' | 'orders') => void;
}

export const DeliveryInstructionsPage: React.FC<DeliveryInstructionsPageProps> = ({
  onBack,
  onContinue,
  instructions,
  setInstructions,
  onNavigateStep,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const { totalAmount, totalCartCount } = useCart();
  const { activeAddress } = useLocation();

  const presetInstructions = [
    { id: 'door', label: 'Leave at door', icon: <DoorClosed className="w-3.5 h-3.5" /> },
    { id: 'call', label: 'Call on arrival', icon: <PhoneCall className="w-3.5 h-3.5" /> },
    { id: 'hand', label: 'Hand over to me', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'contactless', label: 'Contactless delivery', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'nobell', label: 'Do not ring bell', icon: <Bell className="w-3.5 h-3.5" /> },
  ];

  const handleTogglePreset = (presetLabel: string) => {
    if (instructions.includes(presetLabel)) {
      setInstructions(
        instructions
          .replace(presetLabel, '')
          .replace(/\s+/g, ' ')
          .trim()
      );
    } else {
      setInstructions(instructions ? `${instructions}, ${presetLabel}` : presetLabel);
    }
  };

  const hasValidPreference = instructions.trim().length > 0;

  return (
    <div className="w-full space-y-3 pb-24 animate-in fade-in duration-200 max-w-xl mx-auto">
      {/* 1. Dedicated Header */}
      <DedicatedPageHeader
        title="Delivery Instructions"
        onBack={onBack}
        subtitle="Step 2 of 4"
      />

      {/* 1.1 Four-Step Horizontal Progress Tracker */}
      <CheckoutProgressTracker
        currentStep={2}
        onNavigateStep={onNavigateStep}
      />

      {/* 2. Destination Recap */}
      <div
        className={`p-2.5 rounded-2xl border transition-all backdrop-blur-xl flex items-center gap-2 text-xs ${
          theme === 'LIGHT' ? 'bg-white/80 border-stone-200 shadow-2xs' : 'bg-stone-900/40 border-white/10'
        }`}
      >
        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="truncate text-[11px] text-stone-300">
          Drop at: <strong className="text-stone-100">{activeAddress.tag}</strong> · {activeAddress.street}, {activeAddress.city}
        </span>
      </div>

      {/* 3. Delivery Preferences / Presets */}
      <div
        className={`p-3 rounded-2xl border transition-all backdrop-blur-xl space-y-2.5 ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-stone-950/40 border-white/15'
        }`}
      >
        <div>
          <h3 className={`text-xs font-bold ${textColorPrimary}`}>
            Select Delivery Preference <span className="text-amber-500">* (Required)</span>
          </h3>
          <p className="text-[10.5px] text-stone-400">
            Please tap at least one delivery preference for your rider
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {presetInstructions.map((preset) => {
            const isSelected = instructions.includes(preset.label);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleTogglePreset(preset.label)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-xs ring-1 ring-amber-400/30'
                    : 'border-stone-500/20 bg-stone-500/5 text-stone-400 hover:border-stone-500/40'
                }`}
              >
                <div className={isSelected ? 'text-amber-400' : 'text-stone-500'}>
                  {preset.icon}
                </div>
                <span className="text-[11px] font-bold truncate">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Additional Custom Note */}
        <div className="pt-1">
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${textColorMuted}`}>
            Additional Delivery Note (Optional)
          </label>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Near yellow building gate, 3rd floor lift on right..."
            className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none transition-all resize-none ${
              theme === 'LIGHT'
                ? 'bg-stone-100 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-400'
                : 'bg-stone-900/80 border-white/15 text-white placeholder:text-stone-500 focus:border-amber-400'
            }`}
          />
        </div>

        {/* 5. Speed & Safety Assurance */}
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10.5px] text-emerald-400 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>GRAVVY Express Rider dispatched within 15–20 minutes upon order confirmation.</span>
        </div>
      </div>

      {!hasValidPreference && (
        <p className="text-[11px] text-amber-500 font-bold text-center">
          * Please select a delivery preference above to enable Payment
        </p>
      )}

      {/* 6. Sticky Bottom Action: CONTINUE TO PAYMENT → */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => {
            if (hasValidPreference) {
              onContinue();
            }
          }}
          disabled={!hasValidPreference}
          className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-md active:scale-95 ${
            hasValidPreference
              ? `${categoryAccent.bgClass} cursor-pointer`
              : 'bg-stone-300 dark:bg-stone-800 text-stone-500 border border-stone-400/20 cursor-not-allowed opacity-60 shadow-none'
          }`}
        >
          <div className="flex flex-col text-left">
            <span className="text-[9px] opacity-80 leading-none">Payable Amount</span>
            <span className={`text-sm font-mono font-black ${hasValidPreference ? 'text-stone-950' : 'text-stone-400'}`}>
              ₹{totalAmount}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 font-black ${hasValidPreference ? 'text-stone-950' : 'text-stone-400'}`}>
            <span>Continue to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
