import React from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  Clock, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { SystemNotification } from '../types/case';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onFilterByNotification?: (notif: SystemNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onFilterByNotification,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
      case 'warning':
        return <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/30 backdrop-blur-xs">
      <div 
        className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-top-4 duration-200 mt-14"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              নোটিফিকেশন ও আইনি অ্যালার্ট
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold">
                {unreadCount} নতুন
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium px-2 py-1"
                title="সব পঠিত হিসেবে চিহ্নিত করুন"
              >
                সব পঠিত
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 text-xs">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              কোনো নতুন নোটিফিকেশন নেই।
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => {
                  onMarkAsRead(notif.id);
                  if (onFilterByNotification) onFilterByNotification(notif);
                }}
                className={`p-3.5 rounded-2xl transition-colors cursor-pointer flex gap-3 ${
                  notif.read 
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75' 
                    : 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40'
                }`}
              >
                {getIcon(notif.type)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {notif.date}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400">
          মামলার শুনানি ও আদেশের তথ্যের উপর ভিত্তি করে স্বয়ংক্রিয় অ্যালার্ট জেনারেট হয়
        </div>

      </div>
    </div>
  );
};
