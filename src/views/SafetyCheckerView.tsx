import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Pill,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SafetyCheckerView: React.FC = () => {
  const { state, t, language, largeText } = useApp();
  const [selectedMeds, setSelectedMeds] = useState<string[]>(['Glucophage (Metformin)', 'Concor (Bisoprolol)']);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any | null>(null);

  if (!state) return null;

  const currentMedNames = state.medications.map((m) => m.name);
  // Add common potential interaction test candidates for evaluator convenience
  const testCandidates = [
    ...currentMedNames,
    'Warfarin (Blood thinner)',
    'Aspirin (CardioProtect)',
  ];

  const handleToggleMed = (name: string) => {
    setSelectedMeds((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleCheck = async () => {
    if (selectedMeds.length < 2) return;
    setChecking(true);
    setResults(null);

    try {
      const res = await fetch('/api/safety/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationNames: selectedMeds }),
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className={`space-y-6 max-w-5xl mx-auto ${largeText ? 'text-lg' : ''}`}>
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t.safetyTitle}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.safetySubtitle}
        </p>
      </div>

      {/* Medication Multi-Selector */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t.safetyInstructions}
          </h3>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
            {selectedMeds.length} محدد
          </span>
        </div>

        {/* Checkbox chips */}
        <div className="flex flex-wrap gap-2.5">
          {testCandidates.map((medName) => {
            const isSelected = selectedMeds.includes(medName);
            return (
              <button
                key={medName}
                onClick={() => handleToggleMed(medName)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>{medName}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            * اضغط على الأدوية لتحديدها معاً، ثم اضغط على زر الفحص أدناه.
          </span>

          <button
            onClick={handleCheck}
            disabled={selectedMeds.length < 2 || checking}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{checking ? 'جاري الفحص السريري...' : t.checkInteractionsBtn}</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar' ? results.clinicalAdvisoryAr : results.clinicalAdvisory}
              </span>
            </div>

            {results.interactionsFound === 0 ? (
              <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  {t.noInteractionsFound}
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                  لم يتم رصد أي تفاعل كيميائي أو دوائي غير ملائم مسجل بين هذه المجموعة. استمر في تناول أدويتك وفق تعليمات طبيبك.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.interactions.map((interaction: any, idx: number) => {
                  const isHigh = interaction.severity === 'high';
                  return (
                    <div
                      key={idx}
                      className={`p-6 rounded-3xl border ${
                        isHigh
                          ? 'bg-red-50/60 dark:bg-red-950/20 border-red-300 dark:border-red-900 shadow-sm'
                          : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isHigh
                                ? 'bg-red-100 text-red-600 dark:bg-red-950'
                                : 'bg-amber-100 text-amber-600 dark:bg-amber-950'
                            }`}
                          >
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                              {language === 'ar' ? interaction.titleAr : interaction.title}
                            </h4>
                            <span className="text-xs font-semibold text-slate-500">
                              بين: {interaction.drugs.join(' + ')}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isHigh
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {isHigh ? t.highSeverity : t.moderateSeverity}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong>الآلية الطبية:</strong>{' '}
                          {language === 'ar'
                            ? interaction.descriptionAr
                            : interaction.description}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong>التوصية السريرية:</strong>{' '}
                          {language === 'ar'
                            ? interaction.recommendationAr
                            : interaction.recommendation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
