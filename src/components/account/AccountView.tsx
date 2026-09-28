import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Clock,
  Star,
  HelpCircle,
  Headphones,
  ClipboardList,
  Mail,
  Lock,
  FileText,
  Info,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ThemeMode, MainNavTab } from '../../types';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

export type AccountSubPage =
  | 'profile'
  | 'addresses'
  | 'payments'
  | 'notifications'
  | 'recently_viewed'
  | 'reviews'
  | 'help'
  | 'support'
  | 'faqs'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'about';

interface AccountViewProps {
  onNavigateTab: (tab: MainNavTab) => void;
  onNavigateSubPage: (subPage: AccountSubPage) => void;
  onOpenTestRunner: () => void;
  onBack?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  onNavigateTab,
  onNavigateSubPage,
  onOpenTestRunner,
  onBack,
}) => {
  const { theme, setTheme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const { user, logout, isAdmin, toggleAdminMode, isAuthenticated, setIsAuthModalOpen } = useAuth();
  const { wishlist, orders } = useCart();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      onNavigateTab('home');
    }
  };

  const themeOptions: {
    id: ThemeMode;
    title: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'LIGHT',
      title: 'LIGHT',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'DARK',
      title: 'DARK',
      icon: <Moon className="w-3.5 h-3.5 text-stone-300" />,
    },
    {
      id: 'UNI',
      title: 'UNI',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
    },
  ];

  // List of Account Options (Coupon & Offer is COMPLETELY REMOVED)
  const accountOptions = [
    {
      id: 'profile',
      title: 'My Profile',
      subtitle: 'Name, email, mobile & account info',
      icon: <User className="w-4 h-4" />,
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      action: () => onNavigateSubPage('profile'),
    },
    {
      id: 'orders',
      title: 'My Orders',
      subtitle: `${orders.length} orders placed`,
      icon: <Package className="w-4 h-4" />,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      action: () => onNavigateTab('orders'),
    },
    {
      id: 'wishlist',
      title: 'Your Wish',
      subtitle: `${wishlist.length} saved items`,
      icon: <Heart className="w-4 h-4" />,
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-400',
      action: () => onNavigateTab('wishlist'),
    },
    {
      id: 'addresses',
      title: 'Saved Address',
      subtitle: 'Home, Work & GPS delivery locations',
      icon: <MapPin className="w-4 h-4" />,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      action: () => onNavigateSubPage('addresses'),
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      subtitle: 'UPI AutoPay, tokenized cards & COD',
      icon: <CreditCard className="w-4 h-4" />,
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-400',
      action: () => onNavigateSubPage('payments'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Live order updates & exclusive alerts',
      icon: <Bell className="w-4 h-4" />,
      iconBg: 'bg-yellow-500/15',
      iconColor: 'text-yellow-400',
      action: () => onNavigateSubPage('notifications'),
    },
    {
      id: 'recently_viewed',
      title: 'Recently Viewed',
      subtitle: 'Browsed products for fast reordering',
      icon: <Clock className="w-4 h-4" />,
      iconBg: 'bg-teal-500/15',
      iconColor: 'text-teal-400',
      action: () => onNavigateSubPage('recently_viewed'),
    },
    {
      id: 'reviews',
      title: 'My Reviews',
      subtitle: 'Ratings & verified buyer comments',
      icon: <Star className="w-4 h-4" />,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      action: () => onNavigateSubPage('reviews'),
    },
    {
      id: 'help',
      title: 'Help Center',
      subtitle: 'Guides, refund policies & FAQs',
      icon: <HelpCircle className="w-4 h-4" />,
      iconBg: 'bg-indigo-500/15',
      iconColor: 'text-indigo-400',
      action: () => onNavigateSubPage('help'),
    },
    {
      id: 'support',
      title: 'Customer Support',
      subtitle: '24/7 Helpline & Live chat',
      icon: <Headphones className="w-4 h-4" />,
      iconBg: 'bg-sky-500/15',
      iconColor: 'text-sky-400',
      action: () => onNavigateSubPage('support'),
    },
    {
      id: 'faqs',
      title: 'FAQs',
      subtitle: 'Multi-category cart & delivery answers',
      icon: <ClipboardList className="w-4 h-4" />,
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-400',
      action: () => onNavigateSubPage('faqs'),
    },
    {
      id: 'contact',
      title: 'Contact Us',
      subtitle: 'Direct inquiry & corporate address',
      icon: <Mail className="w-4 h-4" />,
      iconBg: 'bg-pink-500/15',
      iconColor: 'text-pink-400',
      action: () => onNavigateSubPage('contact'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Data protection & security standards',
      icon: <Lock className="w-4 h-4" />,
      iconBg: 'bg-stone-500/15',
      iconColor: 'text-stone-300',
      action: () => onNavigateSubPage('privacy'),
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      subtitle: 'Fulfillment & protocol agreement',
      icon: <FileText className="w-4 h-4" />,
      iconBg: 'bg-stone-500/15',
      iconColor: 'text-stone-300',
      action: () => onNavigateSubPage('terms'),
    },
    {
      id: 'about',
      title: 'About GRAVVY',
      subtitle: 'Version 2.2.0-PROD & platform info',
      icon: <Info className="w-4 h-4" />,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      action: () => onNavigateSubPage('about'),
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out of your current session',
      icon: <LogOut className="w-4 h-4" />,
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      action: () => {
        logout();
        showToast('Logged out successfully');
      },
    },
  ];

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Dedicated Header Bar: ← Back My Account */}
      <DedicatedPageHeader title="My Account" onBack={handleBack} />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900 border border-amber-400/40 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Profile Header Card */}
      {isAuthenticated && user ? (
        <div
          onClick={() => onNavigateSubPage('profile')}
          className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer backdrop-blur-xl group hover:border-amber-400/40 ${
            theme === 'LIGHT'
              ? 'bg-white/80 border-stone-200 shadow-xs'
              : theme === 'DARK'
              ? 'bg-stone-900/40 border-white/10'
              : 'bg-stone-950/30 border-white/15'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User Profile'}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-amber-400 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-400/15 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 font-black">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className={`text-xs sm:text-sm font-bold font-display truncate ${textColorPrimary}`}>
                    {user.name || user.phone || user.email || 'GRAVVY Member'}
                  </h2>
                  {isAdmin && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-red-600 text-white shrink-0">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 truncate">
                  {user.email || user.phone || 'Firebase Account'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden xs:inline text-[11px]">View Profile</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsAuthModalOpen(true)}
          className={`p-4 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer backdrop-blur-xl group hover:border-amber-400/60 ${
            theme === 'LIGHT'
              ? 'bg-amber-500/10 border-amber-300 shadow-xs'
              : 'bg-amber-400/10 border-amber-400/30'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-amber-500">Sign In / Register</h2>
                <p className="text-[11px] text-stone-400">Log in to sync orders, addresses & saved items</p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-black text-xs group-hover:brightness-105 transition-all">
              Sign In
            </div>
          </div>
        </div>
      )}

      {/* 2. THEME SELECTOR IN MY ACCOUNT (Compact Horizontal Left-to-Right Selector) */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3 className={`text-[11px] font-bold uppercase tracking-wider ${textColorMuted}`}>
            Theme Mode
          </h3>
          <span className="text-[10px] font-mono font-bold text-amber-400">
            {theme === 'UNI' ? 'UNI (Ambient Glow)' : theme}
          </span>
        </div>

        {/* Compact Horizontal 3-Theme Segmented Selector */}
        <div
          role="radiogroup"
          aria-label="Application Theme"
          className={`p-1 rounded-2xl border transition-all ${
            theme === 'LIGHT'
              ? 'bg-stone-100/90 border-stone-200 shadow-xs'
              : theme === 'DARK'
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-stone-900/75 border-white/10 backdrop-blur-md'
          }`}
        >
          <div className="grid grid-cols-3 gap-1">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setTheme(opt.id)}
                  className={`relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] select-none ${
                    isSelected
                      ? opt.id === 'LIGHT'
                        ? 'bg-white text-stone-950 shadow-xs border border-stone-200/90 ring-1 ring-amber-400/40'
                        : opt.id === 'DARK'
                        ? 'bg-neutral-800 text-white shadow-xs border border-neutral-700 ring-1 ring-stone-400/30'
                        : 'bg-gradient-to-r from-purple-950/80 via-stone-900 to-blue-950/80 text-white shadow-xs border border-purple-500/40 ring-1 ring-purple-400/30'
                      : theme === 'LIGHT'
                      ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                  }`}
                >
                  <span className="shrink-0">{opt.icon}</span>
                  <span className="font-display font-bold text-[11px] uppercase tracking-tight truncate">
                    {opt.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Account Navigation Options: Professional E-Commerce List */}
      <section className="space-y-1.5">
        <h3 className={`text-[11px] font-bold uppercase tracking-wider px-1 ${textColorMuted}`}>
          Account Hub & Services
        </h3>

        <div
          className={`rounded-2xl sm:rounded-3xl border divide-y overflow-hidden transition-all backdrop-blur-xl ${
            theme === 'LIGHT'
              ? 'bg-white/80 border-stone-200 divide-stone-100 shadow-xs'
              : theme === 'DARK'
              ? 'bg-stone-900/40 border-white/10 divide-white/5'
              : 'bg-stone-950/30 border-white/15 divide-white/5'
          }`}
        >
          {accountOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="w-full py-2.5 px-3.5 sm:px-4 flex items-center justify-between text-left hover:bg-stone-500/10 active:bg-stone-500/15 transition-all cursor-pointer group min-h-[44px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <span
                    className={`text-xs sm:text-[13px] font-semibold block truncate ${
                      item.id === 'logout'
                        ? 'text-red-500 group-hover:text-red-400'
                        : textColorPrimary
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] text-stone-400 block truncate">
                    {item.subtitle}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-200 shrink-0 transition-colors ml-2" />
            </button>
          ))}
        </div>
      </section>

      {/* 4. Admin & Developer Tools */}
      <section className="space-y-1.5">
        <h3 className={`text-[11px] font-bold uppercase tracking-wider px-1 ${textColorMuted}`}>
          System Administration & QA
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Admin Dashboard */}
          <button
            onClick={() => {
              if (!isAdmin) toggleAdminMode();
              onNavigateTab('admin');
            }}
            className="p-3 rounded-2xl border border-red-500/30 bg-red-950/20 text-left hover:bg-red-950/30 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Admin Dashboard</span>
                <span className="text-[10px] text-red-300">Catalog, banners & order management</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
          </button>

          {/* Automated Test Suite */}
          <button
            onClick={onOpenTestRunner}
            className="p-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 text-left hover:bg-amber-400/20 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Run Automated Tests</span>
                <span className="text-[10px] text-amber-300">Verify all master QA criteria</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </button>
        </div>
      </section>
    </div>
  );
};
