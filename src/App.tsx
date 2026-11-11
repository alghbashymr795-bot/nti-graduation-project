/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AlarmModal } from './components/AlarmModal';
import { SplashScreen } from './components/SplashScreen';
import { DashboardView } from './views/DashboardView';
import { MedicationsView } from './views/MedicationsView';
import { PrescriptionScannerView } from './views/PrescriptionScannerView';
import { RefillInventoryView } from './views/RefillInventoryView';
import { CaregiverView } from './views/CaregiverView';
import { AnalyticsView } from './views/AnalyticsView';
import { MediAIChatView } from './views/MediAIChatView';
import { SafetyCheckerView } from './views/SafetyCheckerView';
import { NotificationsView } from './views/NotificationsView';
import { PatientProfileModal } from './components/PatientProfileModal';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();
  const [showSplash, setShowSplash] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-slate-950 text-[#172B4D] dark:text-slate-100 flex transition-colors">
      {/* Splash Screen Modal */}
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}

      {/* Patient Profile & Account Registration Modal (Guest Mode) */}
      <PatientProfileModal
        isOpen={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
      />

      {/* High-priority sleeping patient audio & visual flash alarm */}
      <AlarmModal />

      {/* Desktop Sidebar (260px) */}
      <Sidebar onOpenPatientProfile={() => setPatientModalOpen(true)} />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="relative w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl z-10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-lg text-slate-900 dark:text-white">
                    {t.appName}
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {[
                    { id: 'dashboard', label: t.navDashboard },
                    { id: 'medications', label: t.navMedications },
                    { id: 'scanner', label: t.navScanner },
                    { id: 'refills', label: t.navRefills },
                    { id: 'caregiver', label: t.navCaregiver },
                    { id: 'analytics', label: t.navAnalytics },
                    { id: 'chat', label: t.navChat },
                    { id: 'safety', label: t.navSafety },
                    { id: 'notifications', label: t.navNotifications },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-start px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenPatientProfile={() => setPatientModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'medications' && <MedicationsView />}
              {activeTab === 'scanner' && <PrescriptionScannerView />}
              {activeTab === 'refills' && <RefillInventoryView />}
              {activeTab === 'caregiver' && <CaregiverView />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'chat' && <MediAIChatView />}
              {activeTab === 'safety' && <SafetyCheckerView />}
              {activeTab === 'notifications' && <NotificationsView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile / Tablet Thumb Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
