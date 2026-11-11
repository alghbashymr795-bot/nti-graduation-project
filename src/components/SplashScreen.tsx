import React from 'react';
import { useApp } from '../context/AppContext';
import { HeartPulse, Sparkles, Globe, ArrowRight, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const { language, setLanguage, t } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6"
      >
        {/* Animated Brand Mark */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/25 relative">
          <HeartPulse className="w-10 h-10 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500"></span>
          </span>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            MediCare<span className="text-blue-600 dark:text-blue-400">+</span>
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {t.appSubname}
          </p>
        </div>

        {/* Feature bullets */}
        <div className="space-y-2.5 text-xs text-start bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>نظام تنبيه صوتي ذكي ونبضات إضاءة لإيقاظ المريض النائم في موعد دوائه.</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>ماسح الروشتات الطبي بالرؤية الحاسوبية مع تحكم بشري كامل في الجرعات.</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>قاعدة بيانات شاملة مع بوابة مرافق صحي وتتبع آلي لمخزون الأقراص.</span>
          </div>
        </div>

        {/* Language selector buttons */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => setLanguage('ar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              language === 'ar'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            العربية (RTL)
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            English (LTR)
          </button>
        </div>

        {/* CTA Button */}
        <button
          onClick={onDismiss}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 active:scale-98 transition-all cursor-pointer"
        >
          <span>{language === 'ar' ? 'ابدأ الاستخدام الآن' : 'Get Started Now'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};
