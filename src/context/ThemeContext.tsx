import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { ThemeMode, CategoryTab } from '../types';

interface UniGradientCombo {
  name: string;
  gradient: string;
  previewClass: string;
  textColor: string;
}

export const UNI_GRADIENTS: UniGradientCombo[] = [
  {
    name: 'Earthy Terracotta & Maroon',
    gradient: 'linear-gradient(135deg, #180804 0%, #3D1308 50%, #8B2500 100%)',
    previewClass: 'from-[#180804] via-[#3D1308] to-[#8B2500]',
    textColor: 'text-orange-100',
  },
  {
    name: 'Deep Purple & Violet',
    gradient: 'linear-gradient(135deg, #0D021A 0%, #2E0854 50%, #6B21A8 100%)',
    previewClass: 'from-[#0D021A] via-[#2E0854] to-[#6B21A8]',
    textColor: 'text-purple-100',
  },
  {
    name: 'Vibrant Pink & Magenta',
    gradient: 'linear-gradient(135deg, #1C021E 0%, #4A044E 50%, #BE185D 100%)',
    previewClass: 'from-[#1C021E] via-[#4A044E] to-[#BE185D]',
    textColor: 'text-pink-100',
  },
  {
    name: 'Electric Blue & Midnight Blue',
    gradient: 'linear-gradient(135deg, #050E1A 0%, #0B192C 50%, #1E3E62 100%)',
    previewClass: 'from-[#050E1A] via-[#0B192C] to-[#1E3E62]',
    textColor: 'text-blue-100',
  },
  {
    name: 'Emerald Green & Deep Teal',
    gradient: 'linear-gradient(135deg, #021712 0%, #022C22 50%, #047857 100%)',
    previewClass: 'from-[#021712] via-[#022C22] to-[#047857]',
    textColor: 'text-emerald-100',
  },
  {
    name: 'Golden Yellow & Warm Orange',
    gradient: 'linear-gradient(135deg, #1E0B02 0%, #451A03 50%, #D97706 100%)',
    previewClass: 'from-[#1E0B02] via-[#451A03] to-[#D97706]',
    textColor: 'text-amber-100',
  },
  {
    name: 'Cyan & Royal Blue',
    gradient: 'linear-gradient(135deg, #021724 0%, #082F49 50%, #0284C7 100%)',
    previewClass: 'from-[#021724] via-[#082F49] to-[#0284C7]',
    textColor: 'text-cyan-100',
  },
  {
    name: 'Burgundy & Dark Purple',
    gradient: 'linear-gradient(135deg, #1F040A 0%, #4A0E17 50%, #701A75 100%)',
    previewClass: 'from-[#1F040A] via-[#4A0E17] to-[#701A75]',
    textColor: 'text-rose-100',
  },
  {
    name: 'Indigo & Neon Violet',
    gradient: 'linear-gradient(135deg, #0A0826 0%, #1E1B4B 50%, #4338CA 100%)',
    previewClass: 'from-[#0A0826] via-[#1E1B4B] to-[#4338CA]',
    textColor: 'text-indigo-100',
  },
];

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  activeCategory: CategoryTab;
  setActiveCategory: (category: CategoryTab) => void;
  uniGradientIndex: number;
  currentUniGradient: UniGradientCombo;
  isUniAnimating: boolean;
  backgroundStyle: React.CSSProperties;
  categoryAccent: {
    colorName: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    badgeClass: string;
    ringClass: string;
    gradientClass: string;
    hexPrimary: string;
  };
  cardBgClass: string;
  cardBorderClass: string;
  textColorPrimary: string;
  textColorSecondary: string;
  textColorMuted: string;
  prefersReducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LIGHT_GRADIENTS: Record<CategoryTab, string> = {
  home: 'linear-gradient(160deg, #FFF9E6 0%, #FFF0A3 45%, #FFD600 85%, #FFB800 100%)',
  food: 'linear-gradient(160deg, #FFF1F0 0%, #FFE0DC 45%, #FF5A4F 85%, #E53935 100%)',
  grocery: 'linear-gradient(160deg, #F0FDF4 0%, #DCFCE7 45%, #4ADE80 85%, #16A34A 100%)',
  medicine: 'linear-gradient(160deg, #F0F9FF 0%, #E0F2FE 45%, #38BDF8 85%, #0284C7 100%)',
};

const DARK_GRADIENTS: Record<CategoryTab, string> = {
  home: 'linear-gradient(160deg, #080808 0%, #1A1400 45%, #332800 85%, #B39200 100%)',
  food: 'linear-gradient(160deg, #080808 0%, #1F0505 45%, #3B0A0A 85%, #991B1B 100%)',
  grocery: 'linear-gradient(160deg, #080808 0%, #03170B 45%, #052E16 85%, #166534 100%)',
  medicine: 'linear-gradient(160deg, #080808 0%, #041826 45%, #082F49 85%, #0369A1 100%)',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('gravvy_theme');
      if (saved === 'LIGHT' || saved === 'DARK' || saved === 'UNI') return saved;
    } catch {}
    return 'UNI'; // Default to the signature dynamic UNI theme
  });

  const [activeCategory, setActiveCategory] = useState<CategoryTab>('home');
  const [uniGradientIndex, setUniGradientIndex] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Listen to tab visibility to pause animation in background
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Centralized 5-second interval for UNI Theme
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only run the 5-second dynamic cycle when theme is 'UNI', tab is visible, and reduced motion is not preferred
    if (theme === 'UNI' && isTabVisible && !prefersReducedMotion) {
      intervalRef.current = setInterval(() => {
        setUniGradientIndex((prev) => (prev + 1) % UNI_GRADIENTS.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [theme, isTabVisible, prefersReducedMotion]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('gravvy_theme', newTheme);
    } catch {}
  };

  const currentUniGradient = UNI_GRADIENTS[uniGradientIndex];
  const isUniAnimating = theme === 'UNI' && isTabVisible && !prefersReducedMotion;

  // Background styling: UNI background remains FIXED, deep dark, and visually stable
  const backgroundStyle = useMemo<React.CSSProperties>(() => {
    if (theme === 'UNI') {
      return {
        background: '#09090D',
        backgroundColor: '#09090D',
        transition: 'background-color 0.5s ease',
      };
    }
    if (theme === 'DARK') {
      return {
        background: DARK_GRADIENTS[activeCategory],
        transition: 'background 0.5s ease',
      };
    }
    // LIGHT
    return {
      background: LIGHT_GRADIENTS[activeCategory],
      transition: 'background 0.5s ease',
    };
  }, [theme, activeCategory]);

  // Category specific accent identities (Yellow/Gold for Home, Red for Food, Green for Grocery, Sky Blue for Medicine)
  const categoryAccent = useMemo(() => {
    switch (activeCategory) {
      case 'home':
        return {
          colorName: 'Yellow/Gold',
          bgClass: 'bg-amber-400 hover:bg-amber-500 text-stone-950',
          textClass: theme === 'LIGHT' ? 'text-amber-700' : 'text-amber-400',
          borderClass: 'border-amber-400',
          badgeClass: 'bg-amber-400/20 text-amber-500 border border-amber-400/40',
          ringClass: 'focus:ring-amber-400',
          gradientClass: 'from-amber-400 to-yellow-500',
          hexPrimary: '#FFD600',
        };
      case 'food':
        return {
          colorName: 'Red',
          bgClass: 'bg-red-600 hover:bg-red-700 text-white',
          textClass: theme === 'LIGHT' ? 'text-red-700' : 'text-red-400',
          borderClass: 'border-red-600',
          badgeClass: 'bg-red-500/20 text-red-500 border border-red-500/40',
          ringClass: 'focus:ring-red-500',
          gradientClass: 'from-red-500 to-rose-600',
          hexPrimary: '#E53935',
        };
      case 'grocery':
        return {
          colorName: 'Green',
          bgClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          textClass: theme === 'LIGHT' ? 'text-emerald-700' : 'text-emerald-400',
          borderClass: 'border-emerald-600',
          badgeClass: 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40',
          ringClass: 'focus:ring-emerald-500',
          gradientClass: 'from-emerald-500 to-green-600',
          hexPrimary: '#16A34A',
        };
      case 'medicine':
        return {
          colorName: 'Sky Blue',
          bgClass: 'bg-sky-600 hover:bg-sky-700 text-white',
          textClass: theme === 'LIGHT' ? 'text-sky-700' : 'text-sky-400',
          borderClass: 'border-sky-600',
          badgeClass: 'bg-sky-500/20 text-sky-500 border border-sky-500/40',
          ringClass: 'focus:ring-sky-500',
          gradientClass: 'from-sky-500 to-blue-600',
          hexPrimary: '#0284C7',
        };
    }
  }, [activeCategory, theme]);

  // Card background styling based on theme
  const cardBgClass = useMemo(() => {
    if (theme === 'LIGHT') {
      return 'bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md';
    }
    if (theme === 'DARK') {
      return 'bg-neutral-900/85 backdrop-blur-md shadow-sm hover:shadow-md border border-neutral-800/80';
    }
    // UNI
    return 'bg-stone-900/75 backdrop-blur-md shadow-lg border border-white/10 hover:border-white/20';
  }, [theme]);

  const cardBorderClass = useMemo(() => {
    if (theme === 'LIGHT') return 'border-stone-200/80';
    if (theme === 'DARK') return 'border-neutral-800';
    return 'border-white/15';
  }, [theme]);

  const textColorPrimary = useMemo(() => {
    if (theme === 'LIGHT') return 'text-stone-900';
    return 'text-white';
  }, [theme]);

  const textColorSecondary = useMemo(() => {
    if (theme === 'LIGHT') return 'text-stone-700';
    return 'text-stone-300';
  }, [theme]);

  const textColorMuted = useMemo(() => {
    if (theme === 'LIGHT') return 'text-stone-500';
    return 'text-stone-400';
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        activeCategory,
        setActiveCategory,
        uniGradientIndex,
        currentUniGradient,
        isUniAnimating,
        backgroundStyle,
        categoryAccent,
        cardBgClass,
        cardBorderClass,
        textColorPrimary,
        textColorSecondary,
        textColorMuted,
        prefersReducedMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
