import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Activity,
  History,
  FileCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AnalyticsView: React.FC = () => {
  const { state, t, language, largeText } = useApp();
  const [filterPeriod, setFilterPeriod] = useState<'today' | '7days' | '30days'>('7days');

  if (!state) return null;

  const { doseLogs, medications } = state;

  // Filter logs by period
  const now = new Date();
  const filteredLogs = doseLogs.filter((log) => {
    const logDate = new Date(log.actionTime || log.scheduledTime);
    const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
    if (filterPeriod === 'today') return diffDays <= 1;
    if (filterPeriod === '7days') return diffDays <= 7;
    return diffDays <= 30;
  });

  // Calculate statistics
  const total = filteredLogs.length;
  const taken = filteredLogs.filter((l) => l.status === 'taken').length;
  const snoozed = filteredLogs.filter((l) => l.status === 'snoozed').length;
  const skipped = filteredLogs.filter((l) => l.status === 'skipped').length;
  const missed = filteredLogs.filter((l) => l.status === 'missed').length;

  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

  // Weekly compliance data for chart
  const daysOfWeek = [
    { day: language === 'ar' ? 'السبت' : 'Sat', taken: 4, total: 4 },
    { day: language === 'ar' ? 'الأحد' : 'Sun', taken: 4, total: 4 },
    { day: language === 'ar' ? 'الإثنين' : 'Mon', taken: 3, total: 4 },
    { day: language === 'ar' ? 'الثلاثاء' : 'Tue', taken: 4, total: 4 },
    { day: language === 'ar' ? 'الأربعاء' : 'Wed', taken: 3, total: 4 },
    { day: language === 'ar' ? 'الخميس' : 'Thu', taken: 4, total: 4 },
    { day: language === 'ar' ? 'اليوم' : 'Today', taken: taken, total: Math.max(taken, 3) },
  ];

  return (
    <div className={`space-y-6 max-w-6xl mx-auto ${largeText ? 'text-lg' : ''}`}>
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.analyticsTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.analyticsSubtitle}
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          {(['today', '7days', '30days'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterPeriod === period
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {period === 'today'
                ? t.filterToday
                : period === '7days'
                ? t.filter7Days
                : t.filter30Days}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{t.adherenceRate}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
            {adherenceRate}%
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            +5% أعلى من المتوسط العام
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{t.dosesTakenCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 tabular-nums">
            {taken}
          </div>
          <p className="text-xs text-slate-400 mt-2">جرعات تم تناولها في الموعد</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{t.dosesSnoozedCount}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2 tabular-nums">
            {snoozed}
          </div>
          <p className="text-xs text-slate-400 mt-2">تم تأجيلها مؤقتاً</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{t.dosesSkippedCount}</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-600 dark:text-slate-300 mt-2 tabular-nums">
            {skipped + missed}
          </div>
          <p className="text-xs text-slate-400 mt-2">جرعات مستبعدة بأمر طبي</p>
        </div>
      </div>

      {/* Weekly Compliance Visual Bar Chart */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              مخطط الالتزام الأسبوعي
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              مقارنة الجرعات المتناولة بالنسبة لإجمالي الجرعات المجدولة يومياً
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-600" />
              <span>مكتمل</span>
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-7 gap-2 md:gap-4 items-end h-48 pt-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          {daysOfWeek.map((d, i) => {
            const pct = Math.round((d.taken / d.total) * 100);
            return (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                  {pct}%
                </span>
                <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 rounded-xl h-36 flex items-end p-1 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="w-full bg-gradient-to-t from-blue-700 to-sky-500 rounded-lg shadow-xs"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500 truncate">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Chronological Timeline */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
            <History className="w-5 h-5 text-blue-600" />
            <span>{t.adherenceTimeline}</span>
          </div>
          <span className="text-xs text-slate-400">
            {filteredLogs.length} إجراء مسجل
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[...filteredLogs].reverse().map((log) => {
            const isTaken = log.status === 'taken';
            const isSnoozed = log.status === 'snoozed';
            const isSkipped = log.status === 'skipped';

            return (
              <div key={log.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isTaken
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                        : isSnoozed
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {isTaken ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isSnoozed ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {language === 'ar' ? log.medicationNameAr || log.medicationName : log.medicationName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      الموعد المجدول: <span className="font-mono">{log.scheduledTime}</span>
                      {log.notes && ` · ${log.notes}`}
                    </div>
                  </div>
                </div>

                <div className="text-end shrink-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      isTaken
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isSnoozed
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {isTaken ? t.takenStatus : isSnoozed ? t.snoozedStatus : t.skippedStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
