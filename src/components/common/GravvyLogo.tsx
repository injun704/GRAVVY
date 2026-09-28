import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CategoryTab } from '../../types';

interface GravvyLogoProps {
  className?: string;
  onClick?: () => void;
  showTagline?: boolean;
}

export const GravvyLogo: React.FC<GravvyLogoProps> = ({
  className = '',
  onClick,
  showTagline = true,
}) => {
  const { theme, activeCategory } = useTheme();

  // Color config for each category's diagonal gradient (upper-left to lower-right)
  const categoryGradients: Record<
    CategoryTab,
    {
      primary: string;
      mid: string;
      secondaryLight: string;
      secondaryDark: string;
      bgGlowLight: string;
      bgGlowDark: string;
      borderLight: string;
      borderDark: string;
      shadowColor: string;
    }
  > = {
    home: {
      primary: '#FFE600',
      mid: '#FFB800',
      secondaryLight: '#B45309', // rich dark gold in light mode
      secondaryDark: '#FFF9C4', // light golden shimmer in dark mode
      bgGlowLight: 'rgba(255, 184, 0, 0.15)',
      bgGlowDark: 'rgba(255, 184, 0, 0.25)',
      borderLight: 'rgba(255, 184, 0, 0.4)',
      borderDark: 'rgba(255, 184, 0, 0.5)',
      shadowColor: 'rgba(245, 158, 11, 0.35)',
    },
    food: {
      primary: '#FF4D42',
      mid: '#DC2626',
      secondaryLight: '#7F1D1D', // deep rich maroon in light mode
      secondaryDark: '#FFE4E6', // crisp bright white-pink in dark mode
      bgGlowLight: 'rgba(220, 38, 38, 0.15)',
      bgGlowDark: 'rgba(220, 38, 38, 0.25)',
      borderLight: 'rgba(220, 38, 38, 0.4)',
      borderDark: 'rgba(220, 38, 38, 0.5)',
      shadowColor: 'rgba(220, 38, 38, 0.4)',
    },
    grocery: {
      primary: '#34D399',
      mid: '#16A34A',
      secondaryLight: '#14532D', // forest green in light mode
      secondaryDark: '#DCFCE7', // bright mint shimmer in dark mode
      bgGlowLight: 'rgba(22, 163, 74, 0.15)',
      bgGlowDark: 'rgba(22, 163, 74, 0.25)',
      borderLight: 'rgba(22, 163, 74, 0.4)',
      borderDark: 'rgba(22, 163, 74, 0.5)',
      shadowColor: 'rgba(22, 163, 74, 0.35)',
    },
    medicine: {
      primary: '#38BDF8',
      mid: '#0284C7',
      secondaryLight: '#075985', // deep navy in light mode
      secondaryDark: '#E0F2FE', // icy bright sky shimmer in dark mode
      bgGlowLight: 'rgba(2, 132, 199, 0.15)',
      bgGlowDark: 'rgba(2, 132, 199, 0.25)',
      borderLight: 'rgba(2, 132, 199, 0.4)',
      borderDark: 'rgba(2, 132, 199, 0.5)',
      shadowColor: 'rgba(2, 132, 199, 0.35)',
    },
  };

  const current = categoryGradients[activeCategory] || categoryGradients.home;
  const isLight = theme === 'LIGHT';
  const secondaryColor = isLight ? current.secondaryLight : current.secondaryDark;
  const gradId = `gravvy-logo-dynamic-grad-${activeCategory}-${isLight ? 'light' : 'dark'}`;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 group text-left cursor-pointer focus:outline-none transition-all duration-300 ${className}`}
      role="button"
      tabIndex={0}
      aria-label="GRAVVY - Go to Home"
    >
      {/* SVG Definitions for Logo Gradient */}
      <svg width="0" height="0" className="absolute -z-50 pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={current.primary} />
            <stop offset="45%" stopColor={current.mid} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
      </svg>

      {/* Dynamic Logo Icon Box */}
      <div
        style={{
          boxShadow: `0 4px 14px ${current.shadowColor}`,
          borderColor: isLight ? current.borderLight : current.borderDark,
          backgroundColor: isLight ? '#FFFFFF' : 'rgba(15, 15, 15, 0.85)',
        }}
        className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative overflow-hidden backdrop-blur-md"
      >
        {/* Subtle Category Tint In Background */}
        <div
          style={{
            background: `radial-gradient(circle at 30% 30%, ${current.primary}33, transparent 70%)`,
          }}
          className="absolute inset-0 pointer-events-none transition-all duration-500"
        />

        {/* Dynamic 'G' Vector Mark with Diagonal Category Gradient */}
        <svg viewBox="0 0 24 24" className="w-6 h-6 z-10" fill="none">
          <text
            x="50%"
            y="54%"
            dominantBaseline="central"
            textAnchor="middle"
            fill={`url(#${gradId})`}
            className="font-black font-display text-[20px] select-none tracking-tighter"
            style={{
              filter: `drop-shadow(0 1px 2px ${current.shadowColor})`,
              fontWeight: 900,
            }}
          >
            G
          </text>
        </svg>
      </div>

      {/* Brand Wordmark & Tagline */}
      {showTagline && (
        <div className="hidden sm:block">
          <span
            style={{
              backgroundImage: `linear-gradient(135deg, ${current.primary} 0%, ${current.mid} 50%, ${secondaryColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: isLight ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
            }}
            className="font-display font-black text-xl tracking-tight block leading-tight transition-all duration-300"
          >
            GRAVVY
          </span>
          <span className="block text-[9px] uppercase tracking-widest text-stone-400 font-semibold leading-none">
            Fast & Fresh
          </span>
        </div>
      )}
    </div>
  );
};
