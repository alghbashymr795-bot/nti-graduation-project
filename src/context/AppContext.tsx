import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Language,
  ActiveTab,
  DatabaseState,
  Medication,
  Caregiver,
  PatientProfile,
  AlarmItem,
  NotificationItem,
} from '../types';
import { translations } from '../utils/translations';
import { audioAlarm } from '../utils/audioAlarm';

interface AppContextType {
  language: Language;
  t: typeof translations['ar'];
  isDark: boolean;
  largeText: boolean;
  activeTab: ActiveTab;
  state: DatabaseState | null;
  loading: boolean;
  activeAlarm: AlarmItem | null;
  unreadNotificationsCount: number;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  toggleLargeText: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  refreshState: () => Promise<void>;
  addMedication: (med: Partial<Medication>) => Promise<boolean>;
  updateMedication: (id: string, med: Partial<Medication>) => Promise<boolean>;
  deleteMedication: (id: string) => Promise<boolean>;
  logDose: (medicationId: string, scheduledTime: string, status: 'taken' | 'snoozed' | 'skipped', notes?: string) => Promise<boolean>;
  updateCaregiver: (data: Partial<Caregiver>) => Promise<boolean>;
  updatePatient: (data: Partial<PatientProfile>) => Promise<boolean>;
  markNotificationsRead: (id?: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  triggerAlarmManually: (medication?: Medication) => void;
  dismissAlarm: () => void;
  snoozeAlarm: (minutes?: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [largeText, setLargeText] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [state, setState] = useState<DatabaseState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeAlarm, setActiveAlarm] = useState<AlarmItem | null>(null);

  // Apply language, RTL/LTR direction, and font changes to <html>
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  // Sync theme
  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const toggleLargeText = () => {
    setLargeText((prev) => !prev);
  };

  // Initial load
  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (e) {
      console.error('Failed to fetch MediCare+ state from server:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set initial Arabic RTL
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    fetchState();
  }, [fetchState]);

  // Medication CRUD
  const addMedication = async (med: Partial<Medication>): Promise<boolean> => {
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(med),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error adding medication:', e);
      return false;
    }
  };

  const updateMedication = async (id: string, med: Partial<Medication>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/medications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(med),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error updating medication:', e);
      return false;
    }
  };

  const deleteMedication = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/medications/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error deleting medication:', e);
      return false;
    }
  };

  // Dose logging (Taken / Snoozed / Skipped)
  const logDose = async (
    medicationId: string,
    scheduledTime: string,
    status: 'taken' | 'snoozed' | 'skipped',
    notes?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/doses/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationId, scheduledTime, status, notes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
        if (status === 'taken') {
          audioAlarm.playSuccessTone();
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error logging dose:', e);
      return false;
    }
  };

  const updateCaregiver = async (data: Partial<Caregiver>): Promise<boolean> => {
    try {
      const res = await fetch('/api/caregiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.state) setState(result.state);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error updating caregiver:', e);
      return false;
    }
  };

  const updatePatient = async (data: Partial<PatientProfile>): Promise<boolean> => {
    try {
      const res = await fetch('/api/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.state) setState(result.state);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error updating patient profile:', e);
      return false;
    }
  };

  const markNotificationsRead = async (id?: string): Promise<void> => {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && state) {
          setState({ ...state, notifications: data.notifications });
        }
      }
    } catch (e) {
      console.error('Error marking notifications read:', e);
    }
  };

  const resetDemoData = async (): Promise<void> => {
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
      }
    } catch (e) {
      console.error('Error resetting demo data:', e);
    }
  };

  // Smart Alarm Controls for sleeping patients
  const triggerAlarmManually = (med?: Medication) => {
    const targetMed =
      med ||
      (state && state.medications.length > 0
        ? state.medications[0]
        : {
            id: 'sample-alarm',
            name: 'Concor 5mg',
            nameAr: 'كونكور 5 ملجم',
            genericName: 'Bisoprolol',
            form: 'tablet' as const,
            strength: '5 mg',
            dosage: '1 tablet with water',
            dosageAr: 'قرص واحد مع كوب ماء',
            frequency: 'daily' as const,
            scheduledTimes: ['09:00'],
            instructions: 'Take in morning with plenty of water',
            instructionsAr: 'يؤخذ صباحاً مع كوب ماء كامل',
            totalPills: 8,
            pillsPerDose: 1,
            minStockAlert: 10,
            color: '#2478D4',
            startDate: '2026-01-01',
            category: 'cardio' as const,
            createdAt: new Date().toISOString(),
          });

    const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setActiveAlarm({
      medication: targetMed,
      scheduledTime: nowTime,
      isTriggered: true,
    });

    // Start synthesized gentle harmonic chime and spoken voice announcement
    const medDisplayName = language === 'ar' ? targetMed.nameAr : targetMed.name;
    const doseDisplayName = language === 'ar' ? targetMed.dosageAr : targetMed.dosage;
    audioAlarm.startSleepingPatientAlarm(medDisplayName, doseDisplayName, language);
  };

  const dismissAlarm = () => {
    audioAlarm.stopAlarm();
    setActiveAlarm(null);
  };

  const snoozeAlarm = (minutes = 15) => {
    if (activeAlarm) {
      logDose(activeAlarm.medication.id, activeAlarm.scheduledTime, 'snoozed', `Snoozed for ${minutes} minutes`);
    }
    audioAlarm.stopAlarm();
    setActiveAlarm(null);
  };

  const unreadNotificationsCount = state
    ? state.notifications.filter((n) => !n.read).length
    : 0;

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        t,
        isDark,
        largeText,
        activeTab,
        state,
        loading,
        activeAlarm,
        unreadNotificationsCount,
        setLanguage,
        toggleTheme,
        toggleLargeText,
        setActiveTab,
        refreshState: fetchState,
        addMedication,
        updateMedication,
        deleteMedication,
        logDose,
        updateCaregiver,
        updatePatient,
        markNotificationsRead,
        resetDemoData,
        triggerAlarmManually,
        dismissAlarm,
        snoozeAlarm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
