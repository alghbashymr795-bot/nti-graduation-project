import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Package,
  Users,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

export const NotificationsView: React.FC = () => {
  const { state, t, language, markNotificationsRead, largeText } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  if (!state) return null;

  const { notifications } = state;

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  return (
    <div className={`space-y-6 max-w-4xl mx-auto ${largeText ? 'text-lg' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.notificationsTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.notificationsSubtitle}
          </p>
        </div>

        <button
          onClick={() => markNotificationsRead()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          <span>{t.markAllRead}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'refill', label: 'نقص المخزون' },
          { id: 'caregiver', label: 'تنبيهات المرافق' },
          { id: 'reminder', label: 'المواعيد' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">
            <Bell className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
            <p className="text-sm">{t.emptyNotifications}</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isAlert = item.severity === 'alert';
            const isWarning = item.severity === 'warning';
            const title = language === 'ar' ? item.titleAr : item.title;
            const message = language === 'ar' ? item.messageAr : item.message;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 md:p-5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  !item.read
                    ? isAlert
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
                      : isWarning
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                      : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isAlert
                      ? 'bg-red-100 text-red-600 dark:bg-red-950'
                      : isWarning
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-950'
                  }`}
                >
                  {item.type === 'refill' ? (
                    <Package className="w-5 h-5" />
                  ) : item.type === 'caregiver' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {message}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
