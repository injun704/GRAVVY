import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface FaqsPageProps {
  onBack: () => void;
}

const FAQ_ITEMS = [
  {
    q: 'Can I order food, daily groceries, and pharmacy medicines in one cart?',
    a: 'Yes! GRAVVY is engineered with a unified multi-category marketplace cart. You can combine gourmet restaurant dishes, fresh farm dairy/produce, and OTC medicines into one order with unified tracking.',
  },
  {
    q: 'What is the standard delivery timeframe for orders?',
    a: 'Most orders are dispatched immediately from partner dark stores and cloud kitchens within 15 to 25 minutes depending on transit conditions.',
  },
  {
    q: 'How does the dynamic UNI Theme work?',
    a: 'The signature UNI Theme renders an ultra-smooth chromatic ambient glow around the perimeter of the screen that shifts organically across palettes while maintaining high readability on deep dark surfaces.',
  },
  {
    q: 'What happens if a fresh grocery item is damaged or missing?',
    a: 'We offer instant doorstep replacements or direct UPI refunds back to your verified account without requiring cumbersome returns.',
  },
  {
    q: 'Do you require prescriptions for over-the-counter (OTC) medicines?',
    a: 'General wellness products, vitamins, balms, and OTC fever tablets (like Dolo 650) do not require prescriptions. Schedule H/X medicines will prompt a simple prescription upload verification.',
  },
];

export const FaqsPage: React.FC<FaqsPageProps> = ({ onBack }) => {
  const { theme, textColorPrimary, textColorMuted } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      <DedicatedPageHeader
        title="FAQs"
        onBack={onBack}
      />

      <div className="space-y-2.5">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden backdrop-blur-xl ${
                isOpen
                  ? 'bg-amber-400/5 border-amber-400/40'
                  : theme === 'LIGHT'
                  ? 'bg-white/80 border-stone-200 hover:border-stone-300'
                  : 'bg-stone-900/40 border-white/10 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
              >
                <span className={`text-xs sm:text-sm font-bold ${textColorPrimary}`}>
                  {item.q}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 text-xs text-stone-300 leading-relaxed border-t border-stone-500/10">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
