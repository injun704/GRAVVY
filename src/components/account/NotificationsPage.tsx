import React from 'react';
import {
  Bell,
  Package,
  Tag,
  Info,
  CheckCheck,
  Trash2,
  Clock,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface NotificationsPageProps {
  onBack: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack }) => {
  const { theme, textColorPrimary } = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotification();

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Dedicated Header */}
      <DedicatedPageHeader
        title="Notifications"
        onBack={onBack}
        itemCount={unreadCount}
        rightAction={
          notifications.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold border border-amber-400/40 text-amber-400 hover:bg-amber-400/10 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span className="hidden xs:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={clearAll}
                className="p-1.5 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-stone-500/15 transition-colors cursor-pointer"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null
        }
      />

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-2.5">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 backdrop-blur-xl ${
                !item.read
                  ? 'bg-amber-400/10 border-amber-400/30 shadow-xs'
                  : theme === 'LIGHT'
                  ? 'bg-white/80 border-stone-200 opacity-90'
                  : 'bg-stone-900/40 border-white/10 opacity-80'
              }`}
            >
              {/* Type Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  item.type === 'order'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : item.type === 'deal'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-sky-500/20 text-sky-400'
                }`}
              >
                {item.type === 'order' && <Package className="w-4 h-4" />}
                {item.type === 'deal' && <Tag className="w-4 h-4" />}
                {item.type === 'system' && <Info className="w-4 h-4" />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-bold truncate ${
                      !item.read ? 'text-amber-400' : textColorPrimary
                    }`}
                  >
                    {item.title}
                  </h4>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">{item.message}</p>
                <div className="flex items-center gap-1 text-[10px] text-stone-400 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className={`p-8 rounded-3xl border text-center space-y-3 ${
            theme === 'LIGHT' ? 'bg-white/80 border-stone-200' : 'bg-stone-900/40 border-white/10'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-sm font-bold font-display ${textColorPrimary}`}>
              No Notifications Yet
            </h3>
            <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
              You will receive live order updates, rider progress, and exclusive catalog alerts here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
