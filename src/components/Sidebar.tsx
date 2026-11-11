import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Pill,
  ScanLine,
  Package,
  Users,
  BarChart3,
  Bot,
  ShieldCheck,
  Bell,
  HeartPulse,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  onOpenPatientProfile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenPatientProfile }) => {
  const { activeTab, setActiveTab, t, language, unreadNotificationsCount, state } = useApp();

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'medications', label: t.navMedications, icon: Pill },
    { id: 'scanner', label: t.navScanner, icon: ScanLine },
    { id: 'refills', label: t.navRefills, icon: Package },
    { id: 'caregiver', label: t.navCaregiver, icon: Users },
    { id: 'analytics', label: t.navAnalytics, icon: BarChart3 },
    { id: 'chat', label: t.navChat, icon: Bot },
    { id: 'safety', label: t.navSafety, icon: ShieldCheck },
    { id: 'notifications', label: t.navNotifications, icon: Bell, badge: unreadNotificationsCount },
  ];

  const patient = state?.patient;

  return (
    <aside className="w-68 shrink-0 hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 p-4 justify-between select-none z-20">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  MediCare<span className="text-blue-600 dark:text-blue-400">+</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                {t.appSubname}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute ${language === 'ar' ? 'right-0' : 'left-0'} top-2 bottom-2 w-1 rounded-full bg-blue-600 dark:bg-blue-400`}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Patient Profile Card at bottom (Clickable to edit/register) */}
      {patient && (
        <div
          onClick={onOpenPatientProfile}
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group"
          title="تعديل ملف وحساب المريض"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-500/20 group-hover:scale-105 transition-transform">
                {patient.bloodType}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {patient.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {patient.age} {language === 'ar' ? 'سنة' : 'years'} · {patient.bloodType}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold group-hover:underline">
              {language === 'ar' ? 'تعديل' : 'Edit'}
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {patient.emergencyContact.relation}:
            </span>
            <a
              href={`tel:${patient.emergencyContact.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <PhoneCall className="w-3 h-3" />
              <span>{patient.emergencyContact.phone}</span>
            </a>
          </div>
        </div>
      )}
    </aside>
  );
};
