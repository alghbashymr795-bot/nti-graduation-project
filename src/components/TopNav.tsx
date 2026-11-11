import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Sun,
  Moon,
  Globe,
  Volume2,
  RotateCcw,
  Menu,
  Type,
  CheckCircle,
  User,
} from 'lucide-react';

interface TopNavProps {
  onOpenMobileMenu?: () => void;
  onOpenPatientProfile?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobileMenu, onOpenPatientProfile }) => {
  const {
    language,
    setLanguage,
    t,
    isDark,
    toggleTheme,
    largeText,
    toggleLargeText,
    triggerAlarmManually,
    resetDemoData,
    unreadNotificationsCount,
    setActiveTab,
    activeTab,
    state,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Brand title & Mobile Menu trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900 dark:text-white whitespace-nowrap">
            {t.appName}
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:inline capitalize">
            {activeTab}
          </span>
        </div>
      </div>

      {/* Zone 2: Action Controls (Single-line, no wraps) */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Test Audio Alarm (Sleeping Patient Mode) */}
        <button
          onClick={() => triggerAlarmManually()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-800/80 transition-all cursor-pointer shadow-xs active:scale-95"
          title={t.testAlarmBtn}
        >
          <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="hidden sm:inline whitespace-nowrap">{t.testAlarmBtn}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          title="Toggle Language / تغيير اللغة"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="whitespace-nowrap">{t.langToggle}</span>
        </button>

        {/* Accessibility Large Text */}
        <button
          onClick={toggleLargeText}
          className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            largeText
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={t.accessibilityLargeText}
        >
          <Type className="w-4 h-4" />
        </button>

        {/* Dark / Light Mode */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDark ? t.lightMode : t.darkMode}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Demo Reset */}
        <button
          onClick={() => {
            if (window.confirm('Reset database to initial clinical demo state?')) {
              resetDemoData();
            }
          }}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden md:flex"
          title={t.resetDemo}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={t.navNotifications}
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* Patient Account (Guest Mode) Button */}
        <button
          onClick={onOpenPatientProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-800/80 transition-colors cursor-pointer"
          title="ملف وحساب المريض"
        >
          <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline truncate max-w-[100px]">
            {state?.patient?.name?.split(' ')[0] || 'حساب المريض'}
          </span>
        </button>
      </div>
    </header>
  );
};
