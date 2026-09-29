import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Building2, 
  Phone, 
  MapPin, 
  DollarSign, 
  UserCheck, 
  Save, 
  Shield, 
  CheckCircle2,
  TrendingUp,
  Landmark
} from 'lucide-react';
import { CircleAssignmentConfig, OfficerRecord } from '../../types/circle';

interface CircleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: CircleAssignmentConfig[];
  officers: OfficerRecord[];
  onSaveCircleConfig: (updatedConfig: CircleAssignmentConfig) => void;
  initialCircle?: string;
}

export const CircleSettingsModal: React.FC<CircleSettingsModalProps> = ({
  isOpen,
  onClose,
  assignments,
  officers,
  onSaveCircleConfig,
  initialCircle = '১'
}) => {
  const [selectedCircle, setSelectedCircle] = useState<string>(initialCircle);
  const [formData, setFormData] = useState<Partial<CircleAssignmentConfig>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSelectedCircle(initialCircle === 'all' ? '১' : initialCircle);
  }, [initialCircle, isOpen]);

  useEffect(() => {
    const config = assignments.find(a => a.circle === selectedCircle) || {
      circle: selectedCircle,
      circleName: `সার্কেল-${selectedCircle}`,
      circleOfficeAddress: '',
      circleOfficePhone: '',
      revenueTargetCrore: 50,
      aroName: '',
      roName: '',
      acDcName: '',
      jcAdcName: ''
    };
    setFormData(config);
    setSavedSuccess(false);
  }, [selectedCircle, assignments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CircleAssignmentConfig = {
      circle: selectedCircle,
      circleName: formData.circleName?.trim() || `সার্কেল-${selectedCircle}`,
      circleOfficeAddress: formData.circleOfficeAddress?.trim() || '',
      circleOfficePhone: formData.circleOfficePhone?.trim() || '',
      revenueTargetCrore: Number(formData.revenueTargetCrore) || 0,
      aroName: formData.aroName?.trim() || '',
      roName: formData.roName?.trim() || '',
      acDcName: formData.acDcName?.trim() || '',
      jcAdcName: formData.jcAdcName?.trim() || '',
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveCircleConfig(payload);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-teal-700 via-slate-800 to-indigo-900 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Settings className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">সার্কেল ব্যবস্থাপনা ও কনফিগারেশন</h3>
              <p className="text-xs text-teal-100">
                সার্কেল এলাকা, অফিস কার্যালয়, ফোন, রাজস্ব লক্ষ্যমাত্রা ও দায়িত্বপ্রাপ্ত কর্মকর্তা নির্ধারণ
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Circle Selector Strip */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-3 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">সার্কেল নির্বাচন:</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {['১', '২', '৩', '৪', '৫', '৬'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCircle(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCircle === c
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-50'
                }`}
              >
                সার্কেল-{c}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>সার্কেল-{selectedCircle} এর কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!</span>
            </div>
          )}

          {/* Section 1: Office info & Target */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-teal-600" />
              <span>সার্কেলের পরিচিতি ও লক্ষ্যমাত্রা</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সার্কেলের পূর্ণ নাম / এলাকা <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.circleName || ''}
                  onChange={e => setFormData({ ...formData, circleName: e.target.value })}
                  placeholder={`যেমন: সার্কেল-${selectedCircle} (গাজীপুর ও সংলগ্ন এলাকা)`}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বার্ষিক রাজস্ব লক্ষ্যমাত্রা (কোটি টাকা)
                </label>
                <div className="relative">
                  <TrendingUp className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.1"
                    value={formData.revenueTargetCrore ?? 0}
                    onChange={e => setFormData({ ...formData, revenueTargetCrore: parseFloat(e.target.value) || 0 })}
                    placeholder="যেমন: ৮৫.০"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সার্কেল অফিসের কার্যালয়ের ঠিকানা
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.circleOfficeAddress || ''}
                    onChange={e => setFormData({ ...formData, circleOfficeAddress: e.target.value })}
                    placeholder="যেমন: কাস্টমস, এক্সাইজ ও ভ্যাট ভবন, জয়দেবপুর রোড"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  অফিসিয়াল ফোন / হটলাইন
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.circleOfficePhone || ''}
                    onChange={e => setFormData({ ...formData, circleOfficePhone: e.target.value })}
                    placeholder="যেমন: ০২-৯২৬১১২৩"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Designated Officers */}
          <div className="p-4 bg-teal-50/60 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900/60 space-y-3">
            <div className="font-bold text-teal-950 dark:text-teal-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>সার্কেল-{selectedCircle} এর দায়িত্বপ্রাপ্ত কর্মকর্তা তালিকা</span>
              </div>
              <span className="text-[10px] text-teal-700 bg-teal-100 dark:bg-teal-900 px-2 py-0.5 rounded-full font-bold">
                ডিফল্ট সার্কেল সাইনিং
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  সহকারী রাজস্ব কর্মকর্তা (ARO)
                </label>
                <input
                  type="text"
                  list="aro-list"
                  value={formData.aroName || ''}
                  onChange={e => setFormData({ ...formData, aroName: e.target.value })}
                  placeholder="এআরও নির্বাচন বা লিখুন"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
                <datalist id="aro-list">
                  {officers.filter(o => o.designation === 'ARO').map(o => (
                    <option key={o.id} value={`${o.name}, এআরও`} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  রাজস্ব কর্মকর্তা (RO)
                </label>
                <input
                  type="text"
                  list="ro-list"
                  value={formData.roName || ''}
                  onChange={e => setFormData({ ...formData, roName: e.target.value })}
                  placeholder="আরও নির্বাচন বা লিখুন"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
                <datalist id="ro-list">
                  {officers.filter(o => o.designation === 'RO').map(o => (
                    <option key={o.id} value={`${o.name}, আরও`} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  সহকারী / উপ-কমিশনার (AC / DC)
                </label>
                <input
                  type="text"
                  list="acdc-list"
                  value={formData.acDcName || ''}
                  onChange={e => setFormData({ ...formData, acDcName: e.target.value })}
                  placeholder="এসি/ডিসি নির্বাচন বা লিখুন"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
                <datalist id="acdc-list">
                  {officers.filter(o => o.designation === 'AC' || o.designation === 'DC').map(o => (
                    <option key={o.id} value={`${o.name}, ${o.designation === 'AC' ? 'সহকারী কমিশনার' : 'উপ-কমিশনার'}`} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  যুগ্ম / অতিরিক্ত কমিশনার (JC / ADC)
                </label>
                <input
                  type="text"
                  list="jcadc-list"
                  value={formData.jcAdcName || ''}
                  onChange={e => setFormData({ ...formData, jcAdcName: e.target.value })}
                  placeholder="জেসি/এডিসি নির্বাচন বা লিখুন"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
                <datalist id="jcadc-list">
                  {officers.filter(o => o.designation === 'JC' || o.designation === 'ADC').map(o => (
                    <option key={o.id} value={`${o.name}, ${o.designation === 'ADC' ? 'অতিরিক্ত কমিশনার' : 'যুগ্ম কমিশনার'}`} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/25 active:scale-[0.98] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>সার্কেল কনফিগারেশন সংরক্ষণ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
