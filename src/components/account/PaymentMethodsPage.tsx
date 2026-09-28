import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  ShieldCheck,
  Check,
  Smartphone,
  Banknote,
  Lock,
  Trash2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface PaymentMethodsPageProps {
  onBack: () => void;
}

interface SavedUPI {
  id: string;
  vpa: string;
  bankName: string;
  isPrimary: boolean;
}

export const PaymentMethodsPage: React.FC<PaymentMethodsPageProps> = ({ onBack }) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();

  const [savedUPIs, setSavedUPIs] = useState<SavedUPI[]>([]);

  const [isAddingUPI, setIsAddingUPI] = useState(false);
  const [newVPA, setNewVPA] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddUPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVPA.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
      return;
    }

    const newItem: SavedUPI = {
      id: `upi-${Date.now()}`,
      vpa: newVPA.trim(),
      bankName: 'Verified UPI ID',
      isPrimary: savedUPIs.length === 0,
    };

    setSavedUPIs((prev) => [...prev, newItem]);
    setNewVPA('');
    setIsAddingUPI(false);
    showToast('UPI ID linked successfully');
  };

  const handleDeleteUPI = (id: string) => {
    setSavedUPIs((prev) => prev.filter((item) => item.id !== id));
    showToast('UPI ID removed');
  };

  const handleSetPrimary = (id: string) => {
    setSavedUPIs((prev) =>
      prev.map((item) => ({
        ...item,
        isPrimary: item.id === id,
      }))
    );
    showToast('Primary payment method updated');
  };

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Dedicated Header */}
      <DedicatedPageHeader
        title="Payment Methods"
        onBack={onBack}
        rightAction={
          !isAddingUPI ? (
            <button
              onClick={() => setIsAddingUPI(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-400 text-stone-950 hover:brightness-105 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add UPI</span>
            </button>
          ) : null
        }
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900 border border-amber-400/40 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Security Banner */}
      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span className="leading-tight">
          RBI Compliant & 256-bit Encrypted. GRAVVY never stores raw card details or UPI PINs.
        </span>
      </div>

      {/* Add UPI Form */}
      {isAddingUPI && (
        <div
          className={`p-4 rounded-2xl sm:rounded-3xl border transition-all backdrop-blur-xl ${
            theme === 'LIGHT'
              ? 'bg-white border-stone-200 shadow-xs'
              : 'bg-stone-900/90 border-white/15'
          }`}
        >
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${textColorMuted}`}>
            Link UPI Virtual Payment Address (VPA)
          </h3>
          <form onSubmit={handleAddUPI} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="e.g. mobileNumber@upi or yourname@okhdfcbank"
                value={newVPA}
                onChange={(e) => setNewVPA(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-500/10 border border-stone-500/20 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingUPI(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-stone-500/20 text-stone-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-md cursor-pointer ${categoryAccent.bgClass}`}
              >
                Verify & Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* UPI Section */}
      <div className="space-y-2">
        <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${textColorMuted}`}>
          Saved UPI Handles
        </h3>

        <div className="space-y-2">
          {savedUPIs.map((upi) => (
            <div
              key={upi.id}
              onClick={() => handleSetPrimary(upi.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                upi.isPrimary
                  ? 'bg-amber-400/10 border-amber-400/40 shadow-xs'
                  : theme === 'LIGHT'
                  ? 'bg-white/80 border-stone-200 hover:border-stone-300'
                  : 'bg-stone-900/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold truncate ${textColorPrimary}`}>
                      {upi.vpa}
                    </span>
                    {upi.isPrimary && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400">
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 block truncate">{upi.bankName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUPI(upi.id);
                  }}
                  className="p-1 rounded-lg text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove UPI"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards & Tokenized Methods */}
      <div className="space-y-2">
        <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${textColorMuted}`}>
          Saved Cards (Tokenized)
        </h3>

        <div className="space-y-2">
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              theme === 'LIGHT'
                ? 'bg-white/80 border-stone-200'
                : 'bg-stone-900/40 border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className={`text-xs font-bold block ${textColorPrimary}`}>
                  HDFC Bank Millennia Credit Card
                </span>
                <span className="text-[11px] text-stone-400">•••• 4892 · Exp 08/29</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Tokenized
            </span>
          </div>
        </div>
      </div>

      {/* Cash on Delivery */}
      <div className="space-y-2">
        <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${textColorMuted}`}>
          Pay on Delivery
        </h3>

        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            theme === 'LIGHT'
              ? 'bg-white/80 border-stone-200'
              : 'bg-stone-900/40 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-xs font-bold block ${textColorPrimary}`}>
                Cash / UPI on Delivery (COD)
              </span>
              <span className="text-[11px] text-stone-400">Pay cash or scan rider QR upon delivery</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            Enabled
          </span>
        </div>
      </div>
    </div>
  );
};
