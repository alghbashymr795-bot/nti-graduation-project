export type Language = 'ar' | 'en';
export type ActiveTab =
  | 'dashboard'
  | 'medications'
  | 'scanner'
  | 'refills'
  | 'caregiver'
  | 'analytics'
  | 'chat'
  | 'safety'
  | 'notifications';

export interface Medication {
  id: string;
  name: string;
  nameAr: string;
  genericName: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'inhaler' | 'drops';
  strength: string;
  dosage: string;
  dosageAr: string;
  frequency: 'daily' | 'twice_daily' | 'thrice_daily' | 'as_needed' | 'custom';
  scheduledTimes: string[];
  instructions: string;
  instructionsAr: string;
  totalPills: number;
  pillsPerDose: number;
  minStockAlert: number;
  color: string;
  startDate: string;
  endDate?: string;
  doctorName?: string;
  category: 'cardio' | 'diabetes' | 'antibiotic' | 'vitamins' | 'pain' | 'other';
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  medicationNameAr: string;
  scheduledTime: string;
  actionTime: string;
  status: 'taken' | 'snoozed' | 'skipped' | 'missed';
  notes?: string;
}

export interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  notifyOnMissedDoses: boolean;
  consecutiveMissedThreshold: number;
  status: 'active' | 'pending';
}

export interface NotificationItem {
  id: string;
  type: 'reminder' | 'refill' | 'caregiver' | 'safety';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'alert';
}

export interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  phone?: string;
  isGuest?: boolean;
  chronicConditions: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface DatabaseState {
  patient: PatientProfile;
  medications: Medication[];
  doseLogs: DoseLog[];
  caregiver: Caregiver;
  notifications: NotificationItem[];
}

export interface AlarmItem {
  medication: Medication;
  scheduledTime: string;
  isTriggered: boolean;
}
