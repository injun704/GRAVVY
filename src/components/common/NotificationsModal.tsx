import React from 'react';
import { Bell, CheckCheck, Clock, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { NotificationItem } from '../../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md p-5 rounded-3xl border shadow-2xl relative max-h-[85vh] flex flex-col ${
          theme === 'LIGHT'
            ? 'bg-white border-stone-200'
            : theme === 'DARK'
            ? 'bg-neutral-900 border-neutral-800'
            : 'bg-stone-900 border-white/20'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-500/15">
          <div className="flex items-center gap-2">
            <Bell className={`w-5 h-5 ${categoryAccent.textClass}`} />
            <h3 className={`text-lg font-bold font-display ${textColorPrimary}`}>Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-semibold text-stone-400 hover:text-white flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all ${
                !item.read
                  ? theme === 'LIGHT'
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-white/10 border-white/20'
                  : theme === 'LIGHT'
                  ? 'bg-stone-50 border-stone-200 opacity-75'
                  : 'bg-white/5 border-white/10 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-stone-500/10 shrink-0">
                  {item.category === 'order' ? (
                    <ShoppingBag className="w-4 h-4 text-emerald-500" />
                  ) : item.category === 'deal' ? (
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Bell className="w-4 h-4 text-sky-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold truncate ${textColorPrimary}`}>{item.title}</h4>
                    <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">{item.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
