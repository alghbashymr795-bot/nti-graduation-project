import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { audioAlarm } from '../utils/audioAlarm';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Pill,
  Sparkles,
  Volume2,
  Calendar,
  ArrowRight,
  Plus,
  ScanLine,
  Activity,
  Droplets,
  PackageCheck,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

export const DashboardView: React.FC = () => {
  const { state, t, language, logDose, setActiveTab, triggerAlarmManually, largeText } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateString, setCurrentDateString] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Real-time clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDateString(
        now.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [language]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { patient, medications, doseLogs } = state;

  // Determine greeting based on current hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t.greetingMorning
      : hour < 18
      ? t.greetingAfternoon
      : t.greetingEvening;

  const todayStr = new Date().toISOString().split('T')[0];

  // Compute today's scheduled doses
  interface DoseSlot {
    medication: (typeof medications)[0];
    time: string;
    log?: (typeof doseLogs)[0];
  }

  const allTodayDoses: DoseSlot[] = [];
  medications.forEach((med) => {
    med.scheduledTimes.forEach((time) => {
      const scheduledDateTime = `${todayStr} ${time}`;
      const log = doseLogs.find(
        (l) => l.medicationId === med.id && l.scheduledTime === scheduledDateTime
      );
      allTodayDoses.push({
        medication: med,
        time,
        log,
      });
    });
  });

  // Sort chronologically
  allTodayDoses.sort((a, b) => a.time.localeCompare(b.time));

  // Compute metrics
  const totalDoses = allTodayDoses.length;
  const takenDoses = allTodayDoses.filter((d) => d.log?.status === 'taken').length;
  const adherencePercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;
  const upcomingDoses = allTodayDoses.filter((d) => !d.log || d.log.status === 'snoozed');

  // Find next upcoming dose
  const nextDose = upcomingDoses.length > 0 ? upcomingDoses[0] : null;

  // Filter doses for display
  const filteredDoses = allTodayDoses.filter((dose) => {
    if (activeFilter === 'all') return true;
    const hourNum = parseInt(dose.time.split(':')[0], 10);
    if (activeFilter === 'morning') return hourNum >= 6 && hourNum < 12;
    if (activeFilter === 'afternoon') return hourNum >= 12 && hourNum < 18;
    if (activeFilter === 'evening') return hourNum >= 18 || hourNum < 6;
    return true;
  });

  const handleMarkTaken = (medId: string, time: string) => {
    const scheduledDateTime = `${todayStr} ${time}`;
    logDose(medId, scheduledDateTime, 'taken');
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // ignore
    }
  };

  const handleSnooze = (medId: string, time: string) => {
    const scheduledDateTime = `${todayStr} ${time}`;
    logDose(medId, scheduledDateTime, 'snoozed', 'Snoozed 15 mins');
  };

  const handleListen = (medName: string, dosage: string, instructions: string) => {
    const textToSpeak = `${medName}. ${dosage}. ${instructions}`;
    audioAlarm.speakText(textToSpeak, language);
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto ${largeText ? 'text-lg' : ''}`}>
      {/* 1. Hero Greeting Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 text-white p-6 md:p-8 shadow-xl shadow-blue-500/15"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {greeting}، {patient.name.split(' ')[0]}
            </h1>
            <p className="text-blue-100 text-sm md:text-base max-w-xl">
              {t.welcomeBack} · {patient.chronicConditions[0]}
            </p>
          </div>

          {/* Live Clock & Date */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 shrink-0">
            <div className="p-3 rounded-xl bg-white/20 text-white">
              <Clock className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs text-blue-100 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{currentDateString}</span>
              </div>
              <div className="text-2xl font-black font-mono tracking-wider tabular-nums mt-0.5">
                {currentTime || '08:00:00'}
              </div>
            </div>
          </div>
        </div>

        {/* Background decorative medical wave circles */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-48 h-48 bg-sky-400/10 rounded-full blur-xl pointer-events-none" />
      </motion.div>

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Adherence Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.todayAdherence}</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {adherencePercent}%
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {adherencePercent >= 80 ? 'ممتاز' : 'مطلوب متابعة'}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${adherencePercent}%` }}
            />
          </div>
        </div>

        {/* Doses Completed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.completedDoses}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
              {takenDoses}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {totalDoses} {t.pillsUnit}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 truncate">
            {takenDoses === totalDoses ? 'اكتملت جميع جرعات اليوم' : 'باقي جرعات قادمة'}
          </p>
        </div>

        {/* Upcoming Doses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.upcomingDoses}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
              {upcomingDoses.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.pillsUnit}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 truncate">
            {nextDose ? `${t.dueIn}: ${nextDose.time}` : 'لا توجد جرعات متبقية'}
          </p>
        </div>

        {/* Inventory Stock Alert */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t.navRefills}</span>
            <PackageCheck className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {medications.filter((m) => m.totalPills <= m.minStockAlert).length}
            </span>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              أدوية قاربت على النفاد
            </span>
          </div>
          <button
            onClick={() => setActiveTab('refills')}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-3 flex items-center gap-1 cursor-pointer"
          >
            <span>عرض تفاصيل المخزون</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Next Dose Spotlight Card */}
      {nextDose && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 md:p-6 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800/60 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
              <Pill className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-xs font-black font-mono">
                  {nextDose.time}
                </span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  {t.nextDoseCardTitle}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {nextDose.medication.form}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                {language === 'ar'
                  ? nextDose.medication.nameAr || nextDose.medication.name
                  : nextDose.medication.name}
              </h3>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {language === 'ar'
                  ? nextDose.medication.dosageAr || nextDose.medication.dosage
                  : nextDose.medication.dosage}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar'
                  ? nextDose.medication.instructionsAr || nextDose.medication.instructions
                  : nextDose.medication.instructions}
              </p>
            </div>
          </div>

          {/* Action buttons (Large touch targets for seniors) */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handleMarkTaken(nextDose.medication.id, nextDose.time)}
              className="flex items-center gap-2.5 py-3.5 px-6 rounded-2xl bg-[#22A06B] hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t.markAsTaken}</span>
            </button>

            <button
              onClick={() => handleSnooze(nextDose.medication.id, nextDose.time)}
              className="flex items-center gap-2 py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-sm border border-amber-200 dark:border-amber-800/50 transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>{t.snooze}</span>
            </button>

            <button
              onClick={() =>
                handleListen(
                  language === 'ar' ? nextDose.medication.nameAr : nextDose.medication.name,
                  language === 'ar' ? nextDose.medication.dosageAr : nextDose.medication.dosage,
                  language === 'ar'
                    ? nextDose.medication.instructionsAr
                    : nextDose.medication.instructions
                )
              }
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
              title={t.listenInstructions}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. Quick Action Shortcuts */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <ScanLine className="w-4 h-4" />
          <span>{t.scanPrescription}</span>
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addMedication}</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-semibold text-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>{t.navChat}</span>
        </button>
      </div>

      {/* 5. Today's Medications Regimen */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.todaysSchedule}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({allTodayDoses.length} {t.totalScheduled})
            </span>
          </div>

          {/* Time Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['all', 'morning', 'afternoon', 'evening'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setActiveFilter(filterKey)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeFilter === filterKey
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {filterKey === 'all'
                  ? 'الكل'
                  : filterKey === 'morning'
                  ? 'الصباح'
                  : filterKey === 'afternoon'
                  ? 'الظهيرة'
                  : 'المساء'}
              </button>
            ))}
          </div>
        </div>

        {/* Medication Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoses.map((dose, index) => {
            const med = dose.medication;
            const isTaken = dose.log?.status === 'taken';
            const isSnoozed = dose.log?.status === 'snoozed';
            const medName = language === 'ar' ? med.nameAr || med.name : med.name;
            const medDosage = language === 'ar' ? med.dosageAr || med.dosage : med.dosage;
            const medInstructions =
              language === 'ar' ? med.instructionsAr || med.instructions : med.instructions;

            return (
              <motion.div
                key={`${med.id}-${dose.time}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 rounded-2xl border transition-all ${
                  isTaken
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                    : isSnoozed
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: med.color || '#2478D4' }}
                    >
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {dose.time}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {med.form} · {med.strength}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {medName}
                      </h4>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {isTaken ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.takenStatus}</span>
                    </span>
                  ) : isSnoozed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.snoozedStatus}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                      <span>{t.upcomingStatus}</span>
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {medDosage}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {medInstructions}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <span>
                      {t.pillsLeft}:{' '}
                      <strong
                        className={
                          med.totalPills <= med.minStockAlert
                            ? 'text-red-600 font-bold'
                            : 'text-slate-700 dark:text-slate-300 font-semibold'
                        }
                      >
                        {med.totalPills} {t.pillsUnit}
                      </strong>
                    </span>
                    <span>{med.doctorName?.split('(')[0]}</span>
                  </div>
                </div>

                {/* Card Actions (Large touch targets for seniors) */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleListen(medName, medDosage, medInstructions)}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title={t.listenInstructions}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {!isTaken && (
                      <button
                        onClick={() => handleSnooze(med.id, dose.time)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 transition-colors cursor-pointer"
                      >
                        {t.snooze}
                      </button>
                    )}

                    <button
                      onClick={() => handleMarkTaken(med.id, dose.time)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isTaken
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
                          : 'bg-[#22A06B] hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:scale-95'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isTaken ? 'تم التناول' : t.markAsTaken}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
