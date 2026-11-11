import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ScanLine,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PrescriptionScannerView: React.FC = () => {
  const { t, language, addMedication, setActiveTab, largeText } = useApp();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pre-configured clinical samples for quick NTI Evaluation demonstration
  const sampleRxList = [
    {
      id: 'sample-augmentin',
      label: t.sampleRxAugmentin,
      imageSvgPlaceholder: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23f0f7ff"/><text x="20" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%232478d4">DR. TAREK EL-KHOLY CLINIC - RX</text><text x="20" y="70" font-family="sans-serif" font-size="14" fill="%23333">Rx: Augmentin 1000mg Tab</text><text x="20" y="100" font-family="sans-serif" font-size="13" fill="%23555">Sig: 1 tab q12h po pc x 7 days</text><text x="20" y="130" font-family="sans-serif" font-size="13" fill="%23555">Qty: 14 tablets</text><text x="20" y="170" font-family="sans-serif" font-size="12" fill="%23888">Date: 2026-11-10 | Sign: Dr. Tarek</text></svg>',
      preset: {
        medicationName: 'Augmentin (Amoxicillin/Clavulanate)',
        medicationNameAr: 'أوجمنتين (مضاد حيوي 1 جم)',
        genericName: 'Amoxicillin + Clavulanic Acid',
        form: 'tablet',
        strength: '1g (1000 mg)',
        dosage: '1 tablet every 12 hours after meals',
        dosageAr: 'قرص واحد كل 12 ساعة بعد الأكل مباشرة',
        frequency: 'twice_daily',
        scheduledTimes: ['09:00', '21:00'],
        instructions: 'Take with food to reduce stomach upset. Complete full 7-day course.',
        instructionsAr: 'يؤخذ مع الطعام لتجنب اضطراب المعدة. يجب إكمال كورس العلاج كاملاً 7 أيام.',
        durationDays: 7,
        totalPills: 14,
        doctorName: 'Dr. Tarek El-Kholy (Chest Clinic)',
        confidenceNotes: 'Legible prescription. Verified dosage for adult respiratory infection.',
        confidenceNotesAr: 'روشتة واضحة ومقروءة بالكامل. الجرعة معتمدة لعلاج عدوى الجهاز التنفسي.',
      },
    },
    {
      id: 'sample-diabetes',
      label: t.sampleRxDiabetes,
      imageSvgPlaceholder: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23f7fafc"/><text x="20" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%2322a06b">DIABETES & METABOLISM SPECIALTY CLINIC</text><text x="20" y="70" font-family="sans-serif" font-size="14" fill="%23333">Rx: Glucophage 500mg (Metformin)</text><text x="20" y="100" font-family="sans-serif" font-size="13" fill="%23555">Sig: 1 tab bid with breakfast and dinner</text><text x="20" y="130" font-family="sans-serif" font-size="13" fill="%23555">Qty: 60 tablets (1 month)</text><text x="20" y="170" font-family="sans-serif" font-size="12" fill="%23888">Date: 2026-11-05 | Sign: Dr. Sayed</text></svg>',
      preset: {
        medicationName: 'Glucophage (Metformin)',
        medicationNameAr: 'جلوكوفاج (ميتفورمين)',
        genericName: 'Metformin Hydrochloride',
        form: 'tablet',
        strength: '500 mg',
        dosage: '1 tablet twice daily with meals',
        dosageAr: 'قرص واحد مرتين يومياً مع الإفطار والعشاء',
        frequency: 'twice_daily',
        scheduledTimes: ['08:00', '20:00'],
        instructions: 'Take immediately after eating with a large glass of water.',
        instructionsAr: 'يؤخذ مباشرة بعد الأكل مع كوب ماء كبير لتجنب الغثيان.',
        durationDays: 30,
        totalPills: 60,
        doctorName: 'Dr. Tarek El-Sayed (Endocrinologist)',
        confidenceNotes: 'Standard oral hypoglycemic dosage. Patient should monitor blood sugar.',
        confidenceNotesAr: 'جرعة قياسية لتنظيم السكر. يُنصح بمتابعة القياسات الدورية.',
      },
    },
    {
      id: 'sample-cardio',
      label: t.sampleRxCardio,
      imageSvgPlaceholder: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23fdfaf6"/><text x="20" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23f4b740">CAIRO HEART INSTITUTE - CARDIOLOGY RX</text><text x="20" y="70" font-family="sans-serif" font-size="14" fill="%23333">Rx: Concor 5mg (Bisoprolol)</text><text x="20" y="100" font-family="sans-serif" font-size="13" fill="%23555">Sig: 1 tab once daily in morning</text><text x="20" y="130" font-family="sans-serif" font-size="13" fill="%23555">Qty: 30 tablets</text><text x="20" y="170" font-family="sans-serif" font-size="12" fill="%23888">Date: 2026-10-28 | Sign: Dr. Mansour</text></svg>',
      preset: {
        medicationName: 'Concor (Bisoprolol)',
        medicationNameAr: 'كونكور 5 ملجم',
        genericName: 'Bisoprolol Fumarate',
        form: 'tablet',
        strength: '5 mg',
        dosage: '1 tablet once daily in the morning',
        dosageAr: 'قرص واحد يومياً صباحاً قبل الإفطار',
        frequency: 'daily',
        scheduledTimes: ['09:00'],
        instructions: 'Take every morning at the same hour. Monitor resting pulse regularly.',
        instructionsAr: 'يؤخذ يومياً في نفس الموعد صباحاً، مع قياس النبض بانتظام.',
        durationDays: 30,
        totalPills: 30,
        doctorName: 'Dr. Nadia Mansour (Cardiologist)',
        confidenceNotes: 'Clear handwriting. Beta-blocker antihypertensive maintenance.',
        confidenceNotesAr: 'خط واضح. دواء منتظم لضغط الدم والقلب.',
      },
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setExtractedData(null);
      setError(null);
      processOcrImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: (typeof sampleRxList)[0]) => {
    setSelectedImage(sample.imageSvgPlaceholder);
    setIsScanning(true);
    setError(null);

    // Simulate scanning animation then load sample
    setTimeout(() => {
      setExtractedData(sample.preset);
      setIsScanning(false);
    }, 1200);
  };

  const processOcrImage = async (base64: string) => {
    setIsScanning(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/scan-rx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await res.json();
      if (res.ok && data.extracted) {
        setExtractedData(data.extracted);
      } else {
        setError(data.error || 'Failed to analyze prescription');
      }
    } catch (err: any) {
      setError(err.message || 'Network error scanning prescription');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!extractedData) return;

    const newMedication = {
      name: extractedData.medicationName,
      nameAr: extractedData.medicationNameAr || extractedData.medicationName,
      genericName: extractedData.genericName || '',
      form: (extractedData.form || 'tablet') as any,
      strength: extractedData.strength || '',
      dosage: extractedData.dosage,
      dosageAr: extractedData.dosageAr || extractedData.dosage,
      frequency: (extractedData.frequency || 'daily') as any,
      scheduledTimes: Array.isArray(extractedData.scheduledTimes) && extractedData.scheduledTimes.length > 0
        ? extractedData.scheduledTimes
        : ['09:00'],
      instructions: extractedData.instructions,
      instructionsAr: extractedData.instructionsAr || extractedData.instructions,
      totalPills: Number(extractedData.totalPills) || 30,
      pillsPerDose: 1,
      minStockAlert: 7,
      color: '#2478D4',
      doctorName: extractedData.doctorName || 'Prescribing Physician',
      category: 'other' as const,
    };

    const success = await addMedication(newMedication);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setActiveTab('medications');
      }, 1500);
    }
  };

  return (
    <div className={`space-y-6 max-w-5xl mx-auto ${largeText ? 'text-lg' : ''}`}>
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
          <Sparkles className="w-4 h-4" />
          <span>Gemini 3.8 Flash Vision OCR</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
          {t.scannerTitle}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.scannerSubtitle}
        </p>
      </div>

      {/* Upload Zone & Quick Sample selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload box */}
        <div className="md:col-span-2">
          <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-300 dark:border-blue-800 hover:border-blue-500 rounded-3xl bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 transition-all cursor-pointer group text-center min-h-[220px]">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform mb-3">
              <Upload className="w-7 h-7" />
            </div>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">
              {t.scannerDragDrop}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.scannerSupport}
            </span>
          </label>
        </div>

        {/* 1-Click Samples for Evaluator */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t.orTrySamples}
          </div>
          <div className="space-y-2">
            {sampleRxList.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="w-full text-start p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate">{sample.label}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Scanning Animation */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-blue-600 text-white flex flex-col items-center justify-center text-center space-y-4 shadow-xl shadow-blue-500/20"
        >
          <RefreshCw className="w-10 h-10 animate-spin" />
          <h3 className="text-lg font-bold">
            {t.analyzingPrescription}
          </h3>
          <p className="text-xs text-blue-100 max-w-md">
            Analyzing text handwriting, active ingredients, dosage schedules, and food recommendations.
          </p>
        </motion.div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Extracted Data Confirmation Screen (Human-in-the-loop control) */}
      <AnimatePresence>
        {extractedData && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t.extractedTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {extractedData.doctorName} · {extractedData.durationDays} {t.daysUnit}
                  </p>
                </div>
              </div>

              {/* Safety notice badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{t.humanReviewNotice}</span>
              </div>
            </div>

            {/* Editable Form Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.medNameAr}
                </label>
                <input
                  type="text"
                  value={extractedData.medicationNameAr || ''}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, medicationNameAr: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.medNameEn}
                </label>
                <input
                  type="text"
                  value={extractedData.medicationName || ''}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, medicationName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.strengthLabel}
                </label>
                <input
                  type="text"
                  value={extractedData.strength || ''}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, strength: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.initialStockLabel}
                </label>
                <input
                  type="number"
                  value={extractedData.totalPills || 14}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, totalPills: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.scheduleTimesLabel}
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(extractedData.scheduledTimes)
                      ? extractedData.scheduledTimes.join(', ')
                      : '09:00'
                  }
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      scheduledTimes: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  placeholder="09:00, 21:00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.dosageLabelAr}
              </label>
              <input
                type="text"
                value={extractedData.dosageAr || extractedData.dosage || ''}
                onChange={(e) =>
                  setExtractedData({ ...extractedData, dosageAr: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.instructionsLabel}
              </label>
              <textarea
                rows={2}
                value={extractedData.instructionsAr || extractedData.instructions || ''}
                onChange={(e) =>
                  setExtractedData({ ...extractedData, instructionsAr: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            {/* Legibility notes */}
            {extractedData.confidenceNotes && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                <strong>ملاحظة الذكاء الاصطناعي:</strong>{' '}
                {language === 'ar'
                  ? extractedData.confidenceNotesAr || extractedData.confidenceNotes
                  : extractedData.confidenceNotes}
              </div>
            )}

            {/* Confirmation CTA */}
            <div className="pt-2 flex items-center justify-end gap-3">
              {saveSuccess ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تم حفظ الدواء بنجاح في قاعدة البيانات! جاري التحويل...</span>
                </div>
              ) : (
                <button
                  onClick={handleConfirmAndSave}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t.confirmAndSaveToDb}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
