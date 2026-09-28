import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface DedicatedPageHeaderProps {
  title: string;
  onBack: () => void;
  categoryBadge?: {
    label: string;
    category?: 'home' | 'food' | 'grocery' | 'medicine';
  };
  itemCount?: number;
  rightAction?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export const DedicatedPageHeader: React.FC<DedicatedPageHeaderProps> = ({
  title,
  onBack,
  categoryBadge,
  itemCount,
  rightAction,
  subtitle,
  className = '',
}) => {
  const { theme, textColorPrimary } = useTheme();

  return (
    <div className={`w-full flex items-center justify-between py-2 sm:py-3 bg-transparent select-none border-0 shadow-none outline-none ${className}`}>
      {/* Left: Back Button & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          onClick={onBack}
          className={`flex items-center gap-1.5 py-1 px-1 text-xs sm:text-sm font-semibold transition-colors cursor-pointer bg-transparent border-0 outline-none active:scale-95 shrink-0 ${
            theme === 'LIGHT' ? 'text-stone-700 hover:text-stone-900' : 'text-stone-300 hover:text-white'
          }`}
          title="Go back"
          aria-label="Back to previous page"
        >
          <ArrowLeft className={`w-4 h-4 shrink-0 ${theme === 'LIGHT' ? 'text-stone-700' : 'text-stone-300'}`} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 truncate">
          <h1 className={`text-base sm:text-lg font-bold font-display tracking-tight truncate ${textColorPrimary}`}>
            {title}
          </h1>

          {/* Optional Category Context Badge */}
          {categoryBadge && (
            <span
              className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 shadow-xs ${
                categoryBadge.category === 'food'
                  ? 'bg-red-600 text-white'
                  : categoryBadge.category === 'grocery'
                  ? 'bg-emerald-600 text-white'
                  : categoryBadge.category === 'medicine'
                  ? 'bg-sky-600 text-white'
                  : 'bg-amber-400 text-stone-950'
              }`}
            >
              {categoryBadge.label}
            </span>
          )}

          {/* Optional Item Count Pill */}
          {itemCount !== undefined && (
            <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/25 shrink-0">
              {itemCount}
            </span>
          )}
        </div>
      </div>

      {/* Right Action Slot */}
      {rightAction && <div className="flex items-center gap-2 shrink-0">{rightAction}</div>}
    </div>
  );
};

