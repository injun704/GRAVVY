import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Bell,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import { useNotification } from '../../context/NotificationContext';
import { CategoryTab, Product } from '../../types';
import { SearchAutocomplete } from './SearchAutocomplete';
import { VoiceSearchModal } from './VoiceSearchModal';
import { LocationModal } from './LocationModal';
import { CategoryGradientDefs, CategoryGradientIcon } from './CategoryGradientDefs';
import { GravvyLogo } from './GravvyLogo';

interface HeaderProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmitSearch?: (query: string) => void;
  onNavigateHome?: () => void;
  onOpenNotifications?: () => void;
  onOpenDedicatedSearch?: () => void;
  onOpenLocationPage?: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  products,
  onSelectProduct,
  searchQuery,
  setSearchQuery,
  onSubmitSearch,
  onNavigateHome,
  onOpenNotifications,
  onOpenDedicatedSearch,
  onOpenLocationPage,
}) => {
  const {
    theme,
    activeCategory,
    setActiveCategory,
  } = useTheme();

  const { activeAddress } = useLocation();
  const { unreadCount } = useNotification();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const categories: {
    id: CategoryTab;
    label: string;
    textClass: string;
    activeTextClass: string;
    activeBgLight: string;
    activeBgDark: string;
    indicatorClass: string;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      textClass: 'text-amber-500',
      activeTextClass: 'text-amber-900 dark:text-amber-300',
      activeBgLight: 'bg-amber-400/20 border-amber-500/50 shadow-sm shadow-amber-500/15',
      activeBgDark: 'bg-amber-400/15 border-amber-400/60 shadow-md shadow-amber-500/20',
      indicatorClass: 'bg-gradient-to-r from-amber-400 to-amber-500',
    },
    {
      id: 'food',
      label: 'Food',
      textClass: 'text-red-500',
      activeTextClass: 'text-red-800 dark:text-red-300',
      activeBgLight: 'bg-red-500/20 border-red-500/50 shadow-sm shadow-red-500/15',
      activeBgDark: 'bg-red-500/15 border-red-500/60 shadow-md shadow-red-500/20',
      indicatorClass: 'bg-gradient-to-r from-red-500 to-red-600',
    },
    {
      id: 'grocery',
      label: 'Grocery',
      textClass: 'text-emerald-500',
      activeTextClass: 'text-emerald-800 dark:text-emerald-300',
      activeBgLight: 'bg-emerald-500/20 border-emerald-500/50 shadow-sm shadow-emerald-500/15',
      activeBgDark: 'bg-emerald-500/15 border-emerald-500/60 shadow-md shadow-emerald-500/20',
      indicatorClass: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    },
    {
      id: 'medicine',
      label: 'Medicine',
      textClass: 'text-sky-500',
      activeTextClass: 'text-sky-800 dark:text-sky-300',
      activeBgLight: 'bg-sky-500/20 border-sky-500/50 shadow-sm shadow-sky-500/15',
      activeBgDark: 'bg-sky-500/15 border-sky-500/60 shadow-md shadow-sky-500/20',
      indicatorClass: 'bg-gradient-to-r from-sky-400 to-sky-600',
    },
  ];

  return (
    <>
      <CategoryGradientDefs />
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b backdrop-blur-2xl ${
          theme === 'LIGHT'
            ? 'bg-white/75 border-stone-200/80 shadow-xs'
            : theme === 'DARK'
            ? 'bg-stone-900/40 border-white/10'
            : 'bg-stone-950/30 border-white/15'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 lg:px-8">
          {/* ROW 1: Compact Location Row (with Logo & Notifications) */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 pt-1.5 pb-1">
            {/* Left: Brand Logo & Compact Location */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Dynamic Category Gradient Logo */}
              <GravvyLogo
                onClick={() => {
                  setActiveCategory('home');
                  if (onNavigateHome) onNavigateHome();
                }}
              />

              {/* Compact Location Section - Reduced vertical height & minimal padding */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenLocationPage) {
                    onOpenLocationPage();
                  } else {
                    setIsLocationModalOpen(true);
                  }
                }}
                className={`flex items-center gap-1 xs:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] active:scale-95 min-w-0 flex-1 max-w-[180px] xs:max-w-[240px] sm:max-w-sm ${
                  theme === 'LIGHT'
                    ? 'bg-stone-100/90 hover:bg-stone-200/80 border-stone-200/90 text-stone-900 shadow-2xs'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-200'
                }`}
                title="Select Delivery Location"
                aria-label="Change delivery location"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="min-w-0 flex-1 flex items-center gap-1">
                  <span className="text-[11px] xs:text-xs font-black truncate text-amber-500 sm:text-inherit">
                    {activeAddress.tag}
                  </span>
                  <span className="text-[10px] xs:text-[11px] text-stone-400 truncate hidden xs:inline">
                    · {activeAddress.street || activeAddress.city}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400 shrink-0 ml-0.5" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-500 border border-amber-400/30 shrink-0 hidden sm:inline">
                  15m
                </span>
              </button>
            </div>

            {/* Right: Notifications Bell -> Opens Dedicated Notifications Page */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onOpenNotifications) {
                    onOpenNotifications();
                  }
                }}
                className={`relative p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                  theme === 'LIGHT'
                    ? 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-200'
                }`}
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ROW 2: Dedicated Full-Width Search Row directly below Location */}
          <div className="w-full pb-1.5 pt-0.5">
            <SearchAutocomplete
              products={products}
              onSelectProduct={onSelectProduct}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSubmitSearch={onSubmitSearch}
              hideMic={true}
              onFocusInput={onOpenDedicatedSearch}
            />
          </div>

          {/* ROW 3: Top Category Navigation Bar: Home | Food | Grocery | Medicine */}
          <div className="flex items-center justify-between py-1 sm:py-1.5 border-t border-stone-500/10">
            <nav className="grid grid-cols-4 md:flex items-center gap-1 sm:gap-2 w-full md:w-auto">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      if (onNavigateHome) onNavigateHome();
                    }}
                    className={`relative flex items-center justify-center gap-0.5 xs:gap-1 sm:gap-2 px-1 xs:px-1.5 sm:px-3 md:px-4 py-1.5 rounded-full text-[9.5px] xs:text-[11px] sm:text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer border min-w-0 min-h-[36px] ${
                      isActive
                        ? theme === 'LIGHT'
                          ? cat.activeBgLight
                          : cat.activeBgDark
                        : theme === 'LIGHT'
                        ? 'border-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                        : 'border-transparent text-stone-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {/* Category Icon with Diagonal Gradient when Active */}
                    <span className="shrink-0 flex items-center justify-center">
                      <CategoryGradientIcon
                        category={cat.id}
                        isActive={isActive}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${!isActive ? cat.textClass : ''}`}
                      />
                    </span>

                    {/* Category Label */}
                    <span
                      className={`transition-colors duration-200 truncate ${
                        isActive
                          ? cat.activeTextClass
                          : theme === 'LIGHT'
                          ? 'text-stone-700'
                          : 'text-stone-300'
                      }`}
                    >
                      {cat.label}
                    </span>

                    {/* Active Category Bottom Indicator */}
                    {isActive && (
                      <span
                        className={`absolute -bottom-1 left-1.5 right-1.5 sm:left-3 sm:right-3 h-0.5 rounded-full shadow-xs ${cat.indicatorClass}`}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Delivery Assurance Tag (Desktop only) */}
            <div className="hidden md:flex items-center gap-3 text-[11px] font-semibold text-stone-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> 15-Min Instant Delivery
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> 100% Quality Guaranteed
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};

export const Header = React.memo(HeaderComponent);
