import React from 'react';
import { Star, MessageSquare, CheckCircle, ThumbsUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface ReviewsPageProps {
  onBack: () => void;
}

const SAMPLE_REVIEWS = [
  {
    id: 'rev-1',
    productName: 'Hyderabadi Dum Biryani (Royal Mutton)',
    category: 'Food',
    rating: 5,
    date: '18 Sep 2026',
    comment: 'Exceptional taste and warmth! The meat was melting tender and the long-grain basmati rice had the perfect aromatic saffron infusion.',
    helpful: 24,
  },
  {
    id: 'rev-2',
    productName: 'Farm Fresh Organic Whole Milk (1 Litre)',
    category: 'Grocery',
    rating: 5,
    date: '12 Sep 2026',
    comment: 'Delivered ice-cold in under 18 minutes. The thick cream layer reminds me of village farm milk. Highly recommended!',
    helpful: 16,
  },
  {
    id: 'rev-3',
    productName: 'Dolo 650mg Paracetamol Tablets',
    category: 'Medicine',
    rating: 5,
    date: '05 Sep 2026',
    comment: 'Delivered at midnight when fever spiked suddenly. Genuine strip with long expiration date. Lifesaver express service.',
    helpful: 39,
  },
];

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onBack }) => {
  const { theme, textColorPrimary, textColorMuted } = useTheme();

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      <DedicatedPageHeader
        title="My Reviews"
        onBack={onBack}
        itemCount={SAMPLE_REVIEWS.length}
      />

      <div className="space-y-3">
        {SAMPLE_REVIEWS.map((rev) => (
          <div
            key={rev.id}
            className={`p-4 rounded-2xl sm:rounded-3xl border transition-all backdrop-blur-xl ${
              theme === 'LIGHT'
                ? 'bg-white/80 border-stone-200 shadow-xs'
                : 'bg-stone-900/40 border-white/10 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-400/15 text-amber-400 border border-amber-400/25">
                  {rev.category}
                </span>
                <h4 className={`text-xs sm:text-sm font-bold mt-1.5 ${textColorPrimary}`}>
                  {rev.productName}
                </h4>
              </div>

              <div className="flex items-center gap-1 bg-amber-400/15 px-2 py-0.5 rounded-lg text-amber-400 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-xs font-bold font-mono">{rev.rating}.0</span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">{rev.comment}</p>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-3 mt-2 border-t border-stone-500/15">
              <div className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified Purchase</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-stone-400">
                  <ThumbsUp className="w-3 h-3" /> {rev.helpful}
                </span>
                <span>{rev.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
