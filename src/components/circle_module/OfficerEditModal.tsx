import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Building, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';
import { OfficerRecord } from '../../types/circle';

interface OfficerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  officer: OfficerRecord | null;
  onSave: (updatedOfficer: OfficerRecord, syncToCompanies: boolean) => void;
  availableCircles?: string[];
}

const DESIGNATION_OPTIONS: { id: OfficerRecord['designation']; labelBangla: string; short: string; badgeColor: string }[] = [
  { id: 'ARO', labelBangla: 'সহকারী রাজস্ব কর্মকর্তা (ARO)', short: 'ARO', badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
  { id: 'RO', labelBangla: 'রাজস্ব কর্মকর্তা (RO)', short: 'RO', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' },
  { id: 'AC', labelBangla: 'সহকারী কমিশনার (AC)', short: 'AC', badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300' },
  { id: 'DC', labelBangla: 'উপ-কমিশনার (DC)', short: 'DC', badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300' },
  { id: 'JC', labelBangla: 'যুগ্ম কমিশনার (JC)', short: 'JC', badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' },
  { id: 'ADC', labelBangla: 'অতিরিক্ত কমিশনার (ADC)', short: 'ADC', badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' }
];

export const OfficerEditModal: React.FC<OfficerEditModalProps> = ({
  isOpen,
  onClose,
  officer,
  onSave,
  availableCircles = ['১', '২', '৩', '৪', '৫', '৬']
}) => {
  const isEditing = Boolean(officer && officer.id);

  const [formData, setFormData] = useState<Partial<OfficerRecord>>({
    name: '',
    designation: 'RO',
    designationBangla: 'রাজস্ব কর্মকর্তা (RO)',
    mobile: '',
    email: '',
    roomNo: '',
    active: true,
    assignedCircles: ['১'],
    remarks: ''
  });

  const [syncToCompanies, setSyncToCompanies] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (officer) {
      setFormData({
        ...officer,
        assignedCircles: officer.assignedCircles || []
      });
    } else {
      setFormData({
        name: '',
        designation: 'RO',
        designationBangla: 'রাজস্ব কর্মকর্তা (RO)',
        mobile: '',
        email: '',
        roomNo: '',
        active: true,
        assignedCircles: ['১'],
        remarks: ''
      });
    }
    setError('');
  }, [officer, isOpen]);

  if (!isOpen) return null;

  const handleDesignationChange = (desig: OfficerRecord['designation']) => {
    const found = DESIGNATION_OPTIONS.find(d => d.id === desig);
    setFormData(prev => ({
      ...prev,
      designation: desig,
      designationBangla: found ? found.labelBangla : desig
    }));
  };

  const handleToggleCircle = (circleNo: string) => {
    setFormData(prev => {
      const current = prev.assignedCircles || [];
      const updated = current.includes(circleNo)
        ? current.filter(c => c !== circleNo)
        : [...current, circleNo].sort();
      return { ...prev, assignedCircles: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('দয়া করে কর্মকর্তার পূর্ণ নাম প্রদান করুন।');
      return;
    }

    const officerToSave: OfficerRecord = {
      id: officer?.id || `off-${Date.now()}`,
      name: formData.name.trim(),
      designation: formData.designation || 'RO',
      designationBangla: formData.designationBangla || 'রাজস্ব কর্মকর্তা (RO)',
      mobile: formData.mobile?.trim() || '',
      email: formData.email?.trim() || '',
      roomNo: formData.roomNo?.trim() || '',
      active: formData.active !== undefined ? formData.active : true,
      assignedCircles: formData.assignedCircles || [],
      assignedCompanyIds: officer?.assignedCompanyIds || [],
      assignedCompanyNames: officer?.assignedCompanyNames || [],
      remarks: formData.remarks?.trim() || ''
    };

    onSave(officerToSave, syncToCompanies);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-teal-600 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isEditing ? 'কর্মকর্তার তথ্য আপডেট ও সম্পাদনা' : 'নতুন কর্মকর্তা সংযোজন'}
              </h3>
              <p className="text-xs text-teal-100">
                {isEditing 
                  ? `${officer?.name} - পদবি ও যোগাযোগের তথ্যাদি সংশোধন` 
                  : 'সার্কেল ও প্রতিষ্ঠানে দায়িত্বপ্রাপ্ত কর্মকর্তার পূর্ণ প্রোফাইল'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              কর্মকর্তার পূর্ণ নাম <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="যেমন: জনাব মোঃ আরিফুল ইসলাম"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* 2. Designation Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              অফিসিয়াল পদবি (Designation) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DESIGNATION_OPTIONS.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDesignationChange(d.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                    formData.designation === d.id
                      ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/50 shadow-xs ring-1 ring-teal-500'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold text-slate-900 dark:text-slate-100">{d.short}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {d.labelBangla.split(' (')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Mobile & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                মোবাইল নম্বর
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                অফিসিয়াল ই-মেইল
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="যেমন: officer@vat.gov.bd"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Room No & Active Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                অফিস কক্ষ / ডেস্ক নম্বর
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.roomNo || ''}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  placeholder="যেমন: কক্ষ নং-৪০২ (৪র্থ তলা)"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                বর্তমান কর্মরত স্থিতি
              </label>
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex-1">
                  <input
                    type="checkbox"
                    checked={formData.active !== false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>বর্তমানে কর্মরত (Active)</span>
                </label>
              </div>
            </div>
          </div>

          {/* 5. Assigned Circles Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              দায়িত্বপ্রাপ্ত সার্কেলসমূহ (বহু-সার্কেল নির্বাচন সম্ভব)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {availableCircles.map(c => {
                const isAssigned = (formData.assignedCircles || []).includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleToggleCircle(c)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      isAssigned
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    সার্কেল-{c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Remarks / Special Duties */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              বিশেষ দায়িত্ব / মন্তব্য (Remarks)
            </label>
            <textarea
              rows={2}
              value={formData.remarks || ''}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="যেমন: অডিট ও আইনি শাখার ফোকাল পয়েন্ট, সার্কেল-২ এর রিকভারি কার্যক্রম তত্ত্বাবধান..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 dark:text-slate-100 outline-none resize-none"
            />
          </div>

          {/* 7. Auto-Sync to Companies */}
          <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 rounded-2xl flex items-start gap-3">
            <RefreshCw className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncToCompanies}
                  onChange={(e) => setSyncToCompanies(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-teal-950 dark:text-teal-200">
                  প্রতিষ্ঠান ও সার্কেল অ্যাসাইনমেন্টে স্বয়ংক্রিয় সিঙ্ক (Auto-Sync)
                </span>
              </label>
              <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-1">
                এই কর্মকর্তার সাথে পূর্বে যুক্ত সার্কেল ও প্রতিষ্ঠানসমূহে নতুন নাম ও পদবি স্বয়ংক্রিয়ভাবে হালনাগাদ হবে।
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'তথ্য আপডেট ও সংরক্ষণ' : 'কর্মকর্তা সংরক্ষণ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
