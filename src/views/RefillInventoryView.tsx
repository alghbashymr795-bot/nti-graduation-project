import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Medication } from '../types';
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Pill,
  TrendingDown,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { motion } from 'motion/react';

export const RefillInventoryView: React.FC = () => {
  const { state, t, language, updateMedication, largeText } = useApp();
  const [restockAmount, setRestockAmount] = useState<{ [medId: string]: number }>({});

  if (!state) return null;

  const { medications } = state;

  const handleRestock = async (med: Medication, amount: number) => {
    const newTotal = med.totalPills + amount;
    await updateMedication(med.id, { totalPills: newTotal });
  };

  // Helper to compute daily consumption
  const getDailyDoseCount = (med: Medication): number => {
    const timesPerDay = med.scheduledTimes.length || 1;
    return timesPerDay * (med.pillsPerDose || 1);
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto ${largeText ? 'text-lg' : ''}`}>
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t.refillTitle}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.refillSubtitle}
        </p>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {medications.map((med) => {
          const dailyBurn = getDailyDoseCount(med);
          const daysRemaining = dailyBurn > 0 ? Math.floor(med.totalPills / dailyBurn) : 99;
          const isCritical = med.totalPills <= 3;
          const isLow = med.totalPills <= med.minStockAlert && !isCritical;
          const isSafe = !isCritical && !isLow;

          const medName = language === 'ar' ? med.nameAr || med.name : med.name;

          return (
            <motion.div
              key={med.id}
              layout
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                isCritical
                  ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 shadow-xs'
                  : isLow
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: med.color || '#2478D4' }}
                    >
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {med.form} · {med.strength}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {medName}
                      </h3>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isCritical
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : isLow
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {isCritical ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{t.statusCritical}</span>
                      </>
                    ) : isLow ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>{t.statusLow}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.statusSafe}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Stock Gauge */}
                <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {med.totalPills}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ms-1">
                        {t.pillsUnit} {t.pillsLeft}
                      </span>
                    </div>

                    <div className="text-end">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                        ~{daysRemaining}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ms-1">
                        {t.daysUnit}
                      </span>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical
                          ? 'bg-red-500'
                          : isLow
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(5, (med.totalPills / 40) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>
                      {language === 'ar' ? 'الاستهلاك:' : 'Burn rate:'} {dailyBurn}{' '}
                      {t.pillsUnit}/{t.daysUnit}
                    </span>
                    <span>
                      {t.minStockThreshold}: {med.minStockAlert} {t.pillsUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Restock Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {t.quickRestock}:
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestock(med, 30)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t.restock30}
                  </button>

                  <button
                    onClick={() => handleRestock(med, 60)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t.restock60}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
