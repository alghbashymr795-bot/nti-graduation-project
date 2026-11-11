import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Volume2, CheckCircle2, Clock, X, Droplets, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AlarmModal: React.FC = () => {
  const { activeAlarm, t, language, dismissAlarm, snoozeAlarm, logDose } = useApp();

  if (!activeAlarm) return null;

  const med = activeAlarm.medication;
  const medName = language === 'ar' ? med.nameAr || med.name : med.name;
  const medDosage = language === 'ar' ? med.dosageAr || med.dosage : med.dosage;
  const medInstructions = language === 'ar' ? med.instructionsAr || med.instructions : med.instructions;

  const handleTakeNow = () => {
    logDose(med.id, activeAlarm.scheduledTime, 'taken', 'Confirmed via Sleeping Patient Alarm');
    dismissAlarm();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md alarm-screen-flash">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Bell className="w-8 h-8 animate-bounce" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600"></span>
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t.alarmModalTitle}
                </h2>
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mt-1">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>{t.alarmModalSubtitle}</span>
                </div>
              </div>
            </div>

            <button
              onClick={dismissAlarm}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t.alarmDismiss}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Medication details */}
          <div className="my-6 space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider">
                  {med.form.toUpperCase()} · {med.strength}
                </span>
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                  {activeAlarm.scheduledTime}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {medName}
              </h3>
              <p className="text-base font-semibold text-blue-700 dark:text-blue-300 mt-1">
                {medDosage}
              </p>
              {medInstructions && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  {medInstructions}
                </p>
              )}
            </div>

            {/* Water reminder */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-sm">
              <Droplets className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{t.waterReminder}</span>
            </div>
          </div>

          {/* Action buttons (Large touch targets for seniors) */}
          <div className="space-y-3">
            <button
              onClick={handleTakeNow}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#22A06B] hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>{t.alarmTakeNow}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => snoozeAlarm(15)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold text-sm border border-amber-200 dark:border-amber-800/50 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>{t.alarmSnooze15}</span>
              </button>

              <button
                onClick={dismissAlarm}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>{t.alarmDismiss}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
