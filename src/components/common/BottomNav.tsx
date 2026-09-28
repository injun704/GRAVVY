import React, { useState, useEffect } from 'react';
import { Home, Heart, ShoppingBag, Clock, User, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { MainNavTab } from '../../types';

interface BottomNavProps {
  currentTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  onOpenCartDrawer?: () => void;
}

const BottomNavComponent: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenCartDrawer,
}) => {
  const { theme, categoryAccent, activeCategory, textColorPrimary, textColorMuted } = useTheme();
  const { totalCartCount, wishlist } = useCart();
  const { isAdmin } = useAuth();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Monitor visualViewport and input focus to prevent BottomNav from jumping up when mobile keyboard opens
  useEffect(() => {
    const handleViewportResize = () => {
      if (window.visualViewport) {
        // If viewport height drops significantly below window.innerHeight, virtual keyboard is visible
        const isKeyboard = window.innerHeight - window.visualViewport.height > 140;
        setIsKeyboardOpen(isKeyboard);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        if (window.innerWidth < 768) {
          setIsKeyboardOpen(true);
        }
      }
    };

    const handleFocusOut = () => {
      // Delay check slightly to prevent flash between focused inputs
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        const stillInputFocused =
          active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
        if (!stillInputFocused) {
          if (window.visualViewport) {
            handleViewportResize();
          } else {
            setIsKeyboardOpen(false);
          }
        }
      }, 100);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const navItems = [
    {
      id: 'home' as MainNavTab,
      label: 'Home',
      icon: Home,
      action: () => onTabChange('home'),
    },
    {
      id: 'wishlist' as MainNavTab,
      label: 'Your Wish',
      icon: Heart,
      badge: wishlist.length,
      action: () => onTabChange('wishlist'),
    },
    {
      id: 'cart' as MainNavTab,
      label: 'Cart',
      icon: ShoppingBag,
      badge: totalCartCount,
      action: () => onTabChange('cart'),
    },
    {
      id: 'orders' as MainNavTab,
      label: 'My Orders',
      icon: Clock,
      action: () => onTabChange('orders'),
    },
    {
      id: 'account' as MainNavTab,
      label: 'My Account',
      icon: User,
      action: () => onTabChange('account'),
    },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin' as MainNavTab,
      label: 'Admin',
      icon: ShieldAlert,
      action: () => onTabChange('admin'),
    });
  }

  return (
    <nav
      aria-label="Bottom Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 px-2 sm:px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 pointer-events-none flex justify-center transition-all duration-200 ${
        isKeyboardOpen ? 'opacity-0 pointer-events-none translate-y-12 sm:opacity-100 sm:pointer-events-none sm:translate-y-0' : 'opacity-100'
      }`}
    >
      <div
        className={`pointer-events-auto w-full max-w-xl mx-auto rounded-2xl sm:rounded-3xl border backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
          theme === 'LIGHT'
            ? 'bg-white/75 border-stone-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-stone-900/5'
            : theme === 'DARK'
            ? 'bg-stone-900/40 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]'
            : 'bg-stone-950/30 border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.12)]'
        }`}
      >
        <div className="flex items-center justify-around h-15 sm:h-16 px-1 sm:px-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`relative flex flex-col items-center justify-center py-1 px-0.5 xs:px-1 sm:px-2 rounded-xl transition-all cursor-pointer min-w-0 flex-1 min-h-[46px] select-none active:scale-95 ${
                  isActive
                    ? 'font-bold'
                    : 'text-stone-400 hover:text-stone-200 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-4.5 h-4.5 xs:w-5 xs:h-5 transition-colors ${
                      isActive ? categoryAccent.textClass : ''
                    }`}
                    stroke={isActive ? `url(#gravvy-cat-grad-${activeCategory})` : 'currentColor'}
                    strokeWidth={isActive ? 2.5 : 2}
                    style={
                      isActive
                        ? {
                            stroke: `url(#gravvy-cat-grad-${activeCategory})`,
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                          }
                        : undefined
                    }
                  />
                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2.5 min-w-3.5 h-3.5 xs:min-w-4 xs:h-4 px-1 rounded-full bg-red-600 text-white text-[9px] xs:text-[10px] font-black flex items-center justify-center shadow-xs">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </div>
                <span
                  className={`text-[9px] xs:text-[10px] sm:text-[11px] mt-1 tracking-tight leading-none truncate max-w-[60px] xs:max-w-[72px] sm:max-w-none text-center ${
                    isActive ? `${categoryAccent.textClass} font-black` : ''
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span
                    className={`absolute -bottom-1 w-5 xs:w-6 h-1 rounded-full ${
                      categoryAccent.bgClass.split(' ')[0]
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export const BottomNav = React.memo(BottomNavComponent);
