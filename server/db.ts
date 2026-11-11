import fs from 'fs';
import path from 'path';

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
  scheduledTimes: string[]; // ["08:00", "20:00"]
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
  scheduledTime: string; // YYYY-MM-DD HH:mm
  actionTime: string;    // ISO timestamp
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
  chronicConditions: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface DatabaseSchema {
  patient: PatientProfile;
  medications: Medication[];
  doseLogs: DoseLog[];
  caregiver: Caregiver;
  notifications: NotificationItem[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'medicare_db.json');

// Get today's date formatted as YYYY-MM-DD
function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Get dates offset from today
function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// Initial realistic demo seed data for NTI Evaluation Committee
export function getInitialSeedData(): DatabaseSchema {
  const today = getTodayDateString();
  const yesterday = getDateOffset(-1);
  const twoDaysAgo = getDateOffset(-2);
  const threeDaysAgo = getDateOffset(-3);

  const medications: Medication[] = [
    {
      id: 'med-1',
      name: 'Glucophage (Metformin)',
      nameAr: 'جلوكوفاج (ميتفورمين)',
      genericName: 'Metformin Hydrochloride',
      form: 'tablet',
      strength: '500 mg',
      dosage: '1 tablet with meal',
      dosageAr: 'قرص واحد مع وجبة الإفطار والعشاء',
      frequency: 'twice_daily',
      scheduledTimes: ['08:00', '20:00'],
      instructions: 'Take immediately after food with plenty of water. Do not crush.',
      instructionsAr: 'يؤخذ بعد الأكل مباشرة مع كوب ماء كبير. تجنب سحق القرص.',
      totalPills: 28,
      pillsPerDose: 1,
      minStockAlert: 10,
      color: '#2478D4', // Medical blue
      startDate: getDateOffset(-60),
      doctorName: 'Dr. Tarek El-Sayed (Endocrinologist)',
      category: 'diabetes',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'med-2',
      name: 'Concor (Bisoprolol)',
      nameAr: 'كونكور (بيسوبرولول)',
      genericName: 'Bisoprolol Fumarate',
      form: 'tablet',
      strength: '5 mg',
      dosage: '1 tablet in morning',
      dosageAr: 'قرص واحد صباحاً على الريق',
      frequency: 'daily',
      scheduledTimes: ['09:00'],
      instructions: 'Take every morning before breakfast. Monitor pulse regularly.',
      instructionsAr: 'يؤخذ يومياً صباحاً قبل الإفطار بانتظام، مع مراقبة النبض.',
      totalPills: 8, // Low stock demo!
      pillsPerDose: 1,
      minStockAlert: 10,
      color: '#22A06B', // Medical green
      startDate: getDateOffset(-90),
      doctorName: 'Dr. Nadia Mansour (Cardiologist)',
      category: 'cardio',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'med-3',
      name: 'Lipitor (Atorvastatin)',
      nameAr: 'ليبيتور (أتورفاستاتين)',
      genericName: 'Atorvastatin Calcium',
      form: 'capsule',
      strength: '20 mg',
      dosage: '1 capsule at bedtime',
      dosageAr: 'كبسولة واحدة قبل النوم ليلاً',
      frequency: 'daily',
      scheduledTimes: ['22:00'],
      instructions: 'Take at night before sleeping. Avoid consuming grapefruit juice.',
      instructionsAr: 'تؤخذ كبسولة واحدة مساءً قبل النوم. تجنب تناول عصير الجريب فروت.',
      totalPills: 3, // Critical low stock demo!
      pillsPerDose: 1,
      minStockAlert: 7,
      color: '#F4B740', // Amber
      startDate: getDateOffset(-45),
      doctorName: 'Dr. Nadia Mansour (Cardiologist)',
      category: 'cardio',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'med-4',
      name: 'Panadol Extra',
      nameAr: 'بانادول إكسترا (مسكن)',
      genericName: 'Paracetamol + Caffeine',
      form: 'tablet',
      strength: '500/65 mg',
      dosage: '1-2 tablets as needed',
      dosageAr: 'قرص أو قرصان عند اللزوم (صداع أو ألم)',
      frequency: 'as_needed',
      scheduledTimes: ['14:00'],
      instructions: 'Take when having severe headache. Maximum 6 tablets in 24 hours.',
      instructionsAr: 'يؤخذ عند الشعور بصداع أو ألم شديد. الحد الأقصى 6 أقراص يومياً.',
      totalPills: 20,
      pillsPerDose: 1,
      minStockAlert: 5,
      color: '#8B5CF6',
      startDate: getDateOffset(-10),
      doctorName: 'Dr. Ahmed Rashed (General Practitioner)',
      category: 'pain',
      createdAt: new Date().toISOString(),
    }
  ];

  const doseLogs: DoseLog[] = [
    // Today's morning doses (already taken)
    {
      id: 'log-today-1',
      medicationId: 'med-1',
      medicationName: 'Glucophage (Metformin)',
      medicationNameAr: 'جلوكوفاج (ميتفورمين)',
      scheduledTime: `${today} 08:00`,
      actionTime: `${today}T08:04:12.000Z`,
      status: 'taken',
      notes: 'Taken on time with breakfast',
    },
    {
      id: 'log-today-2',
      medicationId: 'med-2',
      medicationName: 'Concor (Bisoprolol)',
      medicationNameAr: 'كونكور (بيسوبرولول)',
      scheduledTime: `${today} 09:00`,
      actionTime: `${today}T09:02:45.000Z`,
      status: 'taken',
      notes: 'Morning pulse normal (72 bpm)',
    },
    // Yesterday
    {
      id: 'log-yest-1',
      medicationId: 'med-1',
      medicationName: 'Glucophage (Metformin)',
      medicationNameAr: 'جلوكوفاج (ميتفورمين)',
      scheduledTime: `${yesterday} 08:00`,
      actionTime: `${yesterday}T08:15:00.000Z`,
      status: 'taken',
    },
    {
      id: 'log-yest-2',
      medicationId: 'med-2',
      medicationName: 'Concor (Bisoprolol)',
      medicationNameAr: 'كونكور (بيسوبرولول)',
      scheduledTime: `${yesterday} 09:00`,
      actionTime: `${yesterday}T09:00:00.000Z`,
      status: 'taken',
    },
    {
      id: 'log-yest-3',
      medicationId: 'med-1',
      medicationName: 'Glucophage (Metformin)',
      medicationNameAr: 'جلوكوفاج (ميتفورمين)',
      scheduledTime: `${yesterday} 20:00`,
      actionTime: `${yesterday}T20:10:00.000Z`,
      status: 'taken',
    },
    {
      id: 'log-yest-4',
      medicationId: 'med-3',
      medicationName: 'Lipitor (Atorvastatin)',
      medicationNameAr: 'ليبيتور (أتورفاستاتين)',
      scheduledTime: `${yesterday} 22:00`,
      actionTime: `${yesterday}T22:05:00.000Z`,
      status: 'taken',
    },
    // 2 Days ago
    {
      id: 'log-2d-1',
      medicationId: 'med-1',
      medicationName: 'Glucophage (Metformin)',
      medicationNameAr: 'جلوكوفاج (ميتفورمين)',
      scheduledTime: `${twoDaysAgo} 08:00`,
      actionTime: `${twoDaysAgo}T08:05:00.000Z`,
      status: 'taken',
    },
    {
      id: 'log-2d-2',
      medicationId: 'med-2',
      medicationName: 'Concor (Bisoprolol)',
      medicationNameAr: 'كونكور (بيسوبرولول)',
      scheduledTime: `${twoDaysAgo} 09:00`,
      actionTime: `${twoDaysAgo}T09:30:00.000Z`,
      status: 'taken',
    },
    {
      id: 'log-2d-3',
      medicationId: 'med-1',
      medicationName: 'Glucophage (Metformin)',
      medicationNameAr: 'جلوكوفاج (ميتفورمين)',
      scheduledTime: `${twoDaysAgo} 20:00`,
      actionTime: `${twoDaysAgo}T20:45:00.000Z`,
      status: 'snoozed',
      notes: 'Delayed 45 mins due to late dinner',
    },
    {
      id: 'log-2d-4',
      medicationId: 'med-3',
      medicationName: 'Lipitor (Atorvastatin)',
      medicationNameAr: 'ليبيتور (أتورفاستاتين)',
      scheduledTime: `${twoDaysAgo} 22:00`,
      actionTime: `${twoDaysAgo}T22:00:00.000Z`,
      status: 'taken',
    },
    // 3 Days ago (one skipped dose demo)
    {
      id: 'log-3d-1',
      medicationId: 'med-1',
      medicationName: 'Glucophage (Metformin)',
      medicationNameAr: 'جلوكوفاج (ميتفورمين)',
      scheduledTime: `${threeDaysAgo} 08:00`,
      actionTime: `${threeDaysAgo}T08:00:00.000Z`,
      status: 'taken',
    },
    {
      id: 'log-3d-2',
      medicationId: 'med-2',
      medicationName: 'Concor (Bisoprolol)',
      medicationNameAr: 'كونكور (بيسوبرولول)',
      scheduledTime: `${threeDaysAgo} 09:00`,
      actionTime: `${threeDaysAgo}T09:10:00.000Z`,
      status: 'taken',
    },
    {
      id: 'log-3d-3',
      medicationId: 'med-1',
      medicationName: 'Glucophage (Metformin)',
      medicationNameAr: 'جلوكوفاج (ميتفورمين)',
      scheduledTime: `${threeDaysAgo} 20:00`,
      actionTime: `${threeDaysAgo}T20:00:00.000Z`,
      status: 'skipped',
      notes: 'Patient fasting for medical test next morning',
    },
    {
      id: 'log-3d-4',
      medicationId: 'med-3',
      medicationName: 'Lipitor (Atorvastatin)',
      medicationNameAr: 'ليبيتور (أتورفاستاتين)',
      scheduledTime: `${threeDaysAgo} 22:00`,
      actionTime: `${threeDaysAgo}T22:00:00.000Z`,
      status: 'taken',
    }
  ];

  const caregiver: Caregiver = {
    id: 'cg-1',
    name: 'Sarah Mahmoud (Daughter)',
    relationship: 'Daughter / Primary Caregiver',
    phone: '+20 100 234 5678',
    email: 'sarah.mahmoud@example.com',
    notifyOnMissedDoses: true,
    consecutiveMissedThreshold: 2,
    status: 'active',
  };

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      type: 'refill',
      title: 'Low Medication Stock: Lipitor',
      titleAr: 'تنبيه نقص المخزون: دواء ليبيتور',
      message: 'Only 3 capsules remaining (3 days left). Please request a refill from the pharmacy.',
      messageAr: 'متبقي 3 كبسولات فقط (تكفي 3 أيام). يرجى طلب إعادة صرف الدواء من الصيدلية.',
      timestamp: new Date().toISOString(),
      read: false,
      severity: 'alert',
    },
    {
      id: 'notif-2',
      type: 'refill',
      title: 'Restock Notice: Concor 5mg',
      titleAr: 'تنبيه اقتراب نفاد: كونكور 5 ملجم',
      message: '8 tablets remaining. Stock has fallen below your minimum alert threshold of 10 pills.',
      messageAr: 'متبقي 8 أقراص. انخفض المخزون عن حد الأمان المحدد (10 أقراص).',
      timestamp: getDateOffset(-1) + 'T14:30:00.000Z',
      read: true,
      severity: 'warning',
    },
    {
      id: 'notif-3',
      type: 'caregiver',
      title: 'Caregiver Synced',
      titleAr: 'تم ربط المرافق الصحي بنجاح',
      message: 'Sarah Mahmoud is active and receiving automated adherence updates.',
      messageAr: 'سارة محمود متصلة بنجاح وتتلقى تقارير الالتزام الدوائي بانتظام.',
      timestamp: getDateOffset(-2) + 'T10:00:00.000Z',
      read: true,
      severity: 'info',
    }
  ];

  const patient: PatientProfile = {
    name: 'Hajj Mahmoud El-Ghandour',
    age: 68,
    gender: 'Male',
    bloodType: 'O+',
    chronicConditions: ['Type 2 Diabetes (السكري النوع الثاني)', 'Hypertension (ارتفاع ضغط الدم)', 'Hyperlipidemia (ارتفاع الكوليسترول)'],
    allergies: ['Penicillin (بنسيلين)', 'Sulfa drugs (سلفا)'],
    emergencyContact: {
      name: 'Sarah Mahmoud (Daughter)',
      phone: '+20 100 234 5678',
      relation: 'Daughter (الابنة)'
    }
  };

  return {
    patient,
    medications,
    doseLogs,
    caregiver,
    notifications,
  };
}

// Read database from disk
export function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file, returning seed fallback:', err);
    return getInitialSeedData();
  }
}

// Write database to disk
export function writeDatabase(data: DatabaseSchema): boolean {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

// Reset database to initial seed data
export function resetDatabase(): DatabaseSchema {
  const initial = getInitialSeedData();
  writeDatabase(initial);
  return initial;
}
