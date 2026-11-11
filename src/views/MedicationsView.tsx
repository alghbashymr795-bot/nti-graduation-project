import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Medication } from '../types';
import { audioAlarm } from '../utils/audioAlarm';
import {
  Pill,
  Plus,
  Search,
  Trash2,
  Edit2,
  Volume2,
  Clock,
  AlertTriangle,
  X,
  Check,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MedicationsView: React.FC = () => {
  const { state, t, language, addMedication, updateMedication, deleteMedication, largeText } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Form State
  const initialFormData: Partial<Medication> = {
    name: '',
    nameAr: '',
    genericName: '',
    form: 'tablet',
    strength: '500 mg',
    dosage: '1 tablet with meal',
    dosageAr: 'قرص واحد مع الوجبة',
    frequency: 'daily',
    scheduledTimes: ['09:00'],
    instructions: 'Take after eating with full glass of water.',
    instructionsAr: 'يؤخذ بعد الأكل مع كوب ماء كامل.',
    totalPills: 30,
    pillsPerDose: 1,
    minStockAlert: 7,
    color: '#2478D4',
    doctorName: 'Dr. Tarek El-Sayed',
    category: 'other',
  };

  const [formData, setFormData] = useState<Partial<Medication>>(initialFormData);
  const [timeInput, setTimeInput] = useState('09:00');

  if (!state) return null;

  const filteredMeds = state.medications.filter((med) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      med.name.toLowerCase().includes(q) ||
      (med.nameAr && med.nameAr.includes(q)) ||
      med.genericName.toLowerCase().includes(q);
    const matchesForm = selectedForm === 'all' || med.form === selectedForm;
    return matchesSearch && matchesForm;
  });

  const handleOpenAdd = () => {
    setFormData(initialFormData);
    setEditingMed(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (med: Medication) => {
    setFormData(med);
    setEditingMed(med);
    setShowAddModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMed) {
      await updateMedication(editingMed.id, formData);
    } else {
      await addMedication(formData);
    }
    setShowAddModal(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`${t.confirmDelete}\n(${name})`)) {
      await deleteMedication(id);
    }
  };

  const handleAddTime = () => {
    if (!timeInput) return;
    const existing = formData.scheduledTimes || [];
    if (!existing.includes(timeInput)) {
      setFormData({
        ...formData,
        scheduledTimes: [...existing, timeInput].sort(),
      });
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    const existing = formData.scheduledTimes || [];
    setFormData({
      ...formData,
      scheduledTimes: existing.filter((t) => t !== timeToRemove),
    });
  };

  const handleSpeak = (med: Medication) => {
    const name = language === 'ar' ? med.nameAr || med.name : med.name;
    const dose = language === 'ar' ? med.dosageAr || med.dosage : med.dosage;
    const instructions = language === 'ar' ? med.instructionsAr || med.instructions : med.instructions;
    audioAlarm.speakText(`${name}. ${dose}. ${instructions}`, language);
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto ${largeText ? 'text-lg' : ''}`}>
      {/* Header & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.medListTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.medListSubtitle}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>{t.addMedication}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchMedPlaceholder}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Form Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'tablet', 'capsule', 'syrup', 'injection'] as const).map((form) => (
            <button
              key={form}
              onClick={() => setSelectedForm(form)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedForm === form
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {form === 'all'
                ? t.allCategories
                : form === 'tablet'
                ? t.formTablet
                : form === 'capsule'
                ? t.formCapsule
                : form === 'syrup'
                ? t.formSyrup
                : t.formInjection}
            </button>
          ))}
        </div>
      </div>

      {/* Medication List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMeds.map((med) => {
          const isLowStock = med.totalPills <= med.minStockAlert;
          const medName = language === 'ar' ? med.nameAr || med.name : med.name;
          const medDosage = language === 'ar' ? med.dosageAr || med.dosage : med.dosage;

          return (
            <motion.div
              key={med.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: med.color || '#2478D4' }}
                    >
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {med.form} · {med.strength}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                        {medName}
                      </h3>
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">
                        {med.genericName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSpeak(med)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={t.listenInstructions}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(med)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={t.editMed}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id, medName)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title={t.deleteMed}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dosage & Times */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {medDosage}
                  </div>

                  {/* Scheduled Times */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {med.scheduledTimes.map((time) => (
                      <span
                        key={time}
                        className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold"
                      >
                        {time}
                      </span>
                    ))}
                  </div>

                  {/* Instructions */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {language === 'ar' ? med.instructionsAr || med.instructions : med.instructions}
                  </p>
                </div>
              </div>

              {/* Stock Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {isLowStock ? (
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  <span className={isLowStock ? 'text-red-600 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                    {med.totalPills} {t.pillsUnit} {t.pillsLeft}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                  {med.doctorName?.split('(')[0]}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add / Edit Medication Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingMed ? t.editMed : t.formModalTitle}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.medNameAr}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameAr || ''}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      placeholder="مثال: جلوكوفاج 500 ملجم"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.medNameEn}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Glucophage 500mg"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.genericNameLabel}
                    </label>
                    <input
                      type="text"
                      value={formData.genericName || ''}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                      placeholder="Metformin HCl"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.filterByForm}
                    </label>
                    <select
                      value={formData.form || 'tablet'}
                      onChange={(e) => setFormData({ ...formData, form: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="tablet">{t.formTablet}</option>
                      <option value="capsule">{t.formCapsule}</option>
                      <option value="syrup">{t.formSyrup}</option>
                      <option value="injection">{t.formInjection}</option>
                      <option value="inhaler">{t.formInhaler}</option>
                      <option value="drops">{t.formDrops}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.strengthLabel}
                    </label>
                    <input
                      type="text"
                      value={formData.strength || ''}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                      placeholder="500 mg"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Dosage text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.dosageLabelAr}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.dosageAr || ''}
                      onChange={(e) => setFormData({ ...formData, dosageAr: e.target.value })}
                      placeholder="قرص واحد مع الأكل"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.dosageLabelEn}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.dosage || ''}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="1 tablet with food"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Scheduled Times Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.scheduleTimesLabel}
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="time"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddTime}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      {t.addTimeBtn}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.scheduledTimes?.map((time) => (
                      <span
                        key={time}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-xs font-bold"
                      >
                        <span>{time}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTime(time)}
                          className="hover:text-red-600 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stock Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.initialStockLabel}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalPills || 30}
                      onChange={(e) => setFormData({ ...formData, totalPills: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.pillsPerDoseLabel}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.pillsPerDose || 1}
                      onChange={(e) => setFormData({ ...formData, pillsPerDose: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.minStockThreshold}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.minStockAlert || 7}
                      onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.instructionsLabel} (عربي)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.instructionsAr || ''}
                    onChange={(e) => setFormData({ ...formData, instructionsAr: e.target.value })}
                    placeholder="تعليمات تناول الدواء مع الطعام أو الماء..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    {t.saveMedicationBtn}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
