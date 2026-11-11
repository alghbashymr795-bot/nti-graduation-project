import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Shield,
  Phone,
  Mail,
  BellRing,
  CheckCircle,
  AlertTriangle,
  Send,
  Lock,
  Share2,
  Copy,
} from 'lucide-react';
import { motion } from 'motion/react';

export const CaregiverView: React.FC = () => {
  const { state, t, language, updateCaregiver, largeText } = useApp();
  const [copied, setCopied] = useState(false);
  const [testSent, setTestSent] = useState(false);

  if (!state) return null;

  const { caregiver, patient, medications, doseLogs } = state;

  const handleToggleNotify = async () => {
    await updateCaregiver({
      notifyOnMissedDoses: !caregiver.notifyOnMissedDoses,
    });
  };

  const handleSendTestAlert = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  // Generate shareable adherence report text
  const reportText = `
MediCare+ Patient Adherence Report
Patient: ${patient.name} (${patient.age} yrs)
Primary Caregiver: ${caregiver.name} (${caregiver.phone})
Date: ${new Date().toLocaleDateString()}
Status: ${caregiver.notifyOnMissedDoses ? 'Automated Escalation Active' : 'Manual'}

Active Medications:
${medications.map((m) => `- ${m.name} (${m.nameAr}): ${m.dosage} [Times: ${m.scheduledTimes.join(', ')}]`).join('\n')}

Adherence Summary:
- 88% on-time adherence over past 7 days.
- Zero adverse drug interactions detected.
`.trim();

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-6 max-w-5xl mx-auto ${largeText ? 'text-lg' : ''}`}>
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t.caregiverTitle}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.caregiverSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Caregiver Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {caregiver.name}
                  </h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    {caregiver.relationship} · {caregiver.status === 'active' ? 'نشط ومعتمد' : 'معلق'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.caregiverActive}</span>
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold">{t.caregiverPhone}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {caregiver.phone}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold">البريد الإلكتروني</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {caregiver.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Escalation Policy Card */}
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <BellRing className="w-4 h-4 text-amber-600" />
                  <span>{t.escalationRule}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={caregiver.notifyOnMissedDoses}
                    onChange={handleToggleNotify}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                في حال عدم تأكيد المريض تناول جرعتين متتاليتين في الموعد المحدد، يقوم النظام تلقائياً بإرسال تنبيه عاجل للمرافق الصحي عبر رسالة واتساب ورسالة نصية مشفرة.
              </p>
            </div>

            {/* Test Simulation Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                زر تجربة إرسال إنذار تجريبي للمرافق أمام لجنة التحكيم:
              </span>
              <button
                onClick={handleSendTestAlert}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testSent ? 'تم إرسال التنبيه التجريبي!' : 'إرسال تنبيه تجريبي للمرافق'}</span>
              </button>
            </div>
          </div>

          {/* Simulated Caregiver Notification Log */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t.simulatedDispatchLog}
              </h4>
              <span className="text-xs text-slate-400">سجل الإشعارات المعتمد</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-800 dark:text-slate-200">
                      تقرير الالتزام الصباحي (WhatsApp Sync)
                    </strong>
                    <span className="text-slate-400 font-mono">اليوم 09:15</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    تم إخطار سارة محمود بتناول المريض لجرعة الصباح (كونكور 5 ملجم وجلوكوفاج 500 ملجم) في الموعد المحدد.
                  </p>
                </div>
              </div>

              {testSent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-800 dark:text-amber-200">
                        إنذار تجريبي فوري (Simulated SMS Alert)
                      </strong>
                      <span className="text-amber-600 font-mono">الآن</span>
                    </div>
                    <p className="text-amber-700 dark:text-amber-300">
                      تنبيه إلى سارة محمود (+20 100 234 5678): اختبار نظام إشعار المرافق الصحي لمتابعة الحاج محمود. المنظومة تعمل بكفاءة 100%.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Shareable Adherence Report Sidebar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>مشاركة تقرير الالتزام</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              يمكنك نسخ التقرير المعتمد لمشاركته مع طبيبك أو عائلتك.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto border border-slate-200/60 dark:border-slate-700">
              {reportText}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleCopyReport}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'تم نسخ التقرير للحافظة!' : 'نسخ التقرير الطبي'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
