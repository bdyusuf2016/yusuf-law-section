import React, { useState, useEffect } from 'react';
import { X, Building2, User, Phone, Mail, ShieldCheck, FileText, Calculator } from 'lucide-react';
import { CompanyCircleProfile, CircleAssignmentConfig } from '../../types/circle';
import { takaToCrore, croreToTaka, formatCrore, formatTaka } from '../../utils/converter';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CompanyCircleProfile) => void;
  initialData?: CompanyCircleProfile | null;
  assignments?: CircleAssignmentConfig[];
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  assignments = []
}) => {
  const [formData, setFormData] = useState<Partial<CompanyCircleProfile>>({
    companyName: '',
    address: '',
    bondLicenseNo: '',
    bin: '',
    circle: '১',
    auditStatus: 'অডিট সম্পন্ন',
    auditYear: '২০২৩-২৪',
    arrearsTaka: 0,
    arrearsCrore: 0,
    linkedCaseNos: '',
    commercialManagerName: '',
    commercialManagerMobile: '',
    commercialManagerEmail: '',
    officerARO: '',
    officerRO: '',
    officerAC_DC: '',
    officerJC_ADC: '',
    remarks: ''
  });

  const [takaInput, setTakaInput] = useState<string>('0');
  const [croreInput, setCroreInput] = useState<string>('0');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setTakaInput(String(initialData.arrearsTaka || 0));
      setCroreInput(String(initialData.arrearsCrore || 0));
    } else {
      setFormData({
        companyName: '',
        address: '',
        bondLicenseNo: '',
        bin: '',
        circle: '১',
        auditStatus: 'অডিট সম্পন্ন',
        auditYear: '২০২৩-২৪',
        arrearsTaka: 0,
        arrearsCrore: 0,
        linkedCaseNos: '',
        commercialManagerName: '',
        commercialManagerMobile: '',
        commercialManagerEmail: '',
        officerARO: '',
        officerRO: '',
        officerAC_DC: '',
        officerJC_ADC: '',
        remarks: ''
      });
      setTakaInput('0');
      setCroreInput('0');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTakaChange = (val: string) => {
    setTakaInput(val);
    const num = parseFloat(val) || 0;
    const cr = takaToCrore(num);
    setCroreInput(String(cr));
    setFormData(prev => ({ ...prev, arrearsTaka: num, arrearsCrore: cr }));
  };

  const handleCroreChange = (val: string) => {
    setCroreInput(val);
    const cr = parseFloat(val) || 0;
    const tk = croreToTaka(cr);
    setTakaInput(String(tk));
    setFormData(prev => ({ ...prev, arrearsCrore: cr, arrearsTaka: tk }));
  };

  const handleCircleChange = (newCircle: string) => {
    const matched = assignments?.find(a => a.circle === newCircle);
    const prevMatched = assignments?.find(a => a.circle === formData.circle);
    
    setFormData(prev => {
      // Auto fill officer fields if currently empty or if they were set from previous circle's default assignment
      const shouldUpdateARO = !prev.officerARO || prev.officerARO === prevMatched?.aroName;
      const shouldUpdateRO = !prev.officerRO || prev.officerRO === prevMatched?.roName;
      const shouldUpdateACDC = !prev.officerAC_DC || prev.officerAC_DC === prevMatched?.acDcName;
      const shouldUpdateJCADC = !prev.officerJC_ADC || prev.officerJC_ADC === prevMatched?.jcAdcName;

      return {
        ...prev,
        circle: newCircle,
        officerARO: shouldUpdateARO ? (matched?.aroName || prev.officerARO) : prev.officerARO,
        officerRO: shouldUpdateRO ? (matched?.roName || prev.officerRO) : prev.officerRO,
        officerAC_DC: shouldUpdateACDC ? (matched?.acDcName || prev.officerAC_DC) : prev.officerAC_DC,
        officerJC_ADC: shouldUpdateJCADC ? (matched?.jcAdcName || prev.officerJC_ADC) : prev.officerJC_ADC,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName?.trim()) {
      setError('অনুগ্রহ করে প্রতিষ্ঠানের নাম লিখুন।');
      return;
    }

    const payload: CompanyCircleProfile = {
      id: initialData?.id || `cp-${Date.now()}`,
      companyName: formData.companyName || '',
      address: formData.address || '',
      bondLicenseNo: formData.bondLicenseNo || '',
      bin: formData.bin || '',
      circle: formData.circle || '১',
      auditStatus: formData.auditStatus || 'অডিট সম্পন্ন',
      auditYear: formData.auditYear || '',
      lastAuditDate: formData.lastAuditDate || '',
      auditObservations: formData.auditObservations || '',
      auditOfficer: formData.auditOfficer || '',
      arrearsTaka: parseFloat(takaInput) || 0,
      arrearsCrore: parseFloat(croreInput) || 0,
      linkedCaseNos: formData.linkedCaseNos || '',
      commercialManagerName: formData.commercialManagerName || '',
      commercialManagerMobile: formData.commercialManagerMobile || '',
      commercialManagerEmail: formData.commercialManagerEmail || '',
      officerARO: formData.officerARO || '',
      officerRO: formData.officerRO || '',
      officerAC_DC: formData.officerAC_DC || '',
      officerJC_ADC: formData.officerJC_ADC || '',
      remarks: formData.remarks || '',
      updatedAt: new Date().toISOString()
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialData?.id ? '✏️ প্রতিষ্ঠান ও সার্কেল প্রোফাইল সম্পাদনা' : '➕ নতুন প্রতিষ্ঠান প্রোফাইল অন্তর্ভুক্তি'}
              </h2>
              <p className="text-xs text-slate-500">
                প্রতিষ্ঠানের তথ্যাদি, বন্ড লাইসেন্স, বিআইএন, কর্মকর্তা ও ম্যানেজারের যোগাযোগের বিবরণ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* SECTION 1: মূল প্রতিষ্ঠান তথ্য */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              প্রতিষ্ঠানের মূল বিবরণ
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                প্রতিষ্ঠানের নাম *
              </label>
              <input
                type="text"
                required
                value={formData.companyName || ''}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="যেমন: মেসার্স ডেল্টা টেক্সটাইল মিলস লিমিটেড"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                কারখানার ঠিকানা
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="যেমন: প্লট নং- ১২, কোনাবাড়ী বিসিক শিল্প এলাকা, গাজীপুর"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বন্ড লাইসেন্স নং *
                </label>
                <input
                  type="text"
                  value={formData.bondLicenseNo || ''}
                  onChange={e => setFormData({ ...formData, bondLicenseNo: e.target.value })}
                  placeholder="যেমন: বন্ড/লাইসেন্স/গা-০৪/২০১৮"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিআইএন (BIN) নম্বর *
                </label>
                <input
                  type="text"
                  value={formData.bin || ''}
                  onChange={e => setFormData({ ...formData, bin: e.target.value })}
                  placeholder="যেমন: 001234567-0101"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সার্কেল নং *
                </label>
                <select
                  value={formData.circle || '১'}
                  onChange={e => handleCircleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="১">সার্কেল-১ (গাজীপুর/টঙ্গী)</option>
                  <option value="২">সার্কেল-২ (নারায়ণগঞ্জ)</option>
                  <option value="৩">সার্কেল-৩ (ঢাকা উত্তর/দক্ষিণ)</option>
                  <option value="৪">সার্কেল-৪ (সাভার/ধামরাই)</option>
                  <option value="৫">সার্কেল-৫</option>
                  <option value="অন্যান্য">অন্যান্য সার্কেল</option>
                </select>
                {assignments && assignments.find(a => a.circle === formData.circle) && (
                  <p className="mt-1 text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                    ⚡ সার্কেল কর্মকর্তা লিংকড: {assignments.find(a => a.circle === formData.circle)?.roName || assignments.find(a => a.circle === formData.circle)?.aroName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: অডিট ও বকেয়া রাজস্ব */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-3">
            <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              অডিট ও বকেয়া রাজস্ব তথ্য
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                  অডিট স্ট্যাটাস
                </label>
                <select
                  value={formData.auditStatus || 'অডিট সম্পন্ন'}
                  onChange={e => setFormData({ ...formData, auditStatus: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="অডিট সম্পন্ন">✅ অডিট সম্পন্ন</option>
                  <option value="অডিট চলমান">⏳ অডিট চলমান</option>
                  <option value="অডিট অনিষ্পন্ন">⚠️ অডিট অনিষ্পন্ন</option>
                  <option value="আপত্তি উত্থাপিত">🚨 আপত্তি উত্থাপিত</option>
                  <option value="প্রযোজ্য নয়">প্রযোজ্য নয়</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                  অডিটের অর্থবছর
                </label>
                <input
                  type="text"
                  value={formData.auditYear || ''}
                  onChange={e => setFormData({ ...formData, auditYear: e.target.value })}
                  placeholder="যেমন: ২০২২-২৩ বা ২০২৩-২৪"
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                  সর্বশেষ অডিটের তারিখ
                </label>
                <input
                  type="date"
                  value={formData.lastAuditDate || ''}
                  onChange={e => setFormData({ ...formData, lastAuditDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                  নিরীক্ষাকারী কর্মকর্তা / শাখা
                </label>
                <input
                  type="text"
                  value={formData.auditOfficer || ''}
                  onChange={e => setFormData({ ...formData, auditOfficer: e.target.value })}
                  placeholder="যেমন: নিরীক্ষা ও তদন্ত শাখা / সিএজি অডিট"
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                  অডিট আপত্তি / নিরীক্ষা পর্যবেক্ষণ
                </label>
                <textarea
                  rows={2}
                  value={formData.auditObservations || ''}
                  onChange={e => setFormData({ ...formData, auditObservations: e.target.value })}
                  placeholder="যেমন: কাঁচামাল ও তৈরি পণ্যের ঘাটতি বাবদ ভ্যাট ও সম্পূরক শুল্ক ফাঁকি চিহ্নিত..."
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* BOKEYA CALCULATOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                  দাবীকৃত বকেয়া রাজস্ব (টাকা)
                </label>
                <input
                  type="number"
                  step="any"
                  value={takaInput}
                  onChange={e => handleTakaChange(e.target.value)}
                  placeholder="যেমন: 45000000"
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">{formatTaka(parseFloat(takaInput) || 0)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                  বকেয়া (কোটি টাকা) [স্বয়ংক্রিয়]
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={croreInput}
                  onChange={e => handleCroreChange(e.target.value)}
                  placeholder="যেমন: 4.5"
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 block">{formatCrore(parseFloat(croreInput) || 0)}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                সংশ্লিষ্ট মামলার তথ্য / মামলা নং (যদি থাকে)
              </label>
              <input
                type="text"
                value={formData.linkedCaseNos || ''}
                onChange={e => setFormData({ ...formData, linkedCaseNos: e.target.value })}
                placeholder="যেমন: রীট পিটিশন নং- ১২৪১৭/২০২৪ বা আপীল নং- ০৫/২০২৪"
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 3: কমার্শিয়াল ম্যানেজার ও যোগাযোগ */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-3">
            <div className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              প্রতিষ্ঠানের কমার্শিয়াল ম্যানেজার / ফোকাল পয়েন্ট
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-amber-950 dark:text-amber-200 mb-1">
                  ম্যানেজারের নাম
                </label>
                <input
                  type="text"
                  value={formData.commercialManagerName || ''}
                  onChange={e => setFormData({ ...formData, commercialManagerName: e.target.value })}
                  placeholder="যেমন: জনাব সাজ্জাদ হোসেন"
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-950 dark:text-amber-200 mb-1">
                  মোবাইল নম্বর *
                </label>
                <input
                  type="text"
                  value={formData.commercialManagerMobile || ''}
                  onChange={e => setFormData({ ...formData, commercialManagerMobile: e.target.value })}
                  placeholder="যেমন: 01711-234567"
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-950 dark:text-amber-200 mb-1">
                  ই-মেইল ঠিকানা
                </label>
                <input
                  type="email"
                  value={formData.commercialManagerEmail || ''}
                  onChange={e => setFormData({ ...formData, commercialManagerEmail: e.target.value })}
                  placeholder="commercial@company.com"
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: সার্কেল ও শাখার দায়িত্বপ্রাপ্ত কর্মকর্তাগণ */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                সার্কেলের দায়িত্বপ্রাপ্ত কর্মকর্তাবৃন্দ
              </div>
              {assignments && assignments.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const matched = assignments.find(a => a.circle === formData.circle);
                    if (matched) {
                      setFormData(prev => ({
                        ...prev,
                        officerARO: matched.aroName || prev.officerARO,
                        officerRO: matched.roName || prev.officerRO,
                        officerAC_DC: matched.acDcName || prev.officerAC_DC,
                        officerJC_ADC: matched.jcAdcName || prev.officerJC_ADC
                      }));
                    }
                  }}
                  className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-900 bg-teal-100/80 hover:bg-teal-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  title="সার্কেল নম্বর অনুযায়ী নির্ধারিত কর্মকর্তাদের স্বয়ংক্রিয়ভাবে বসান"
                >
                  ⚡ সার্কেল অনুযায়ী স্বয়ংক্রিয় পূরণ
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-teal-950 dark:text-teal-200 mb-1">
                  সহকারী রাজস্ব কর্মকর্তা (ARO)
                </label>
                <input
                  type="text"
                  value={formData.officerARO || ''}
                  onChange={e => setFormData({ ...formData, officerARO: e.target.value })}
                  placeholder="যেমন: জনাব কামরুল হাসান, এআরও"
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-teal-950 dark:text-teal-200 mb-1">
                  রাজস্ব কর্মকর্তা (RO)
                </label>
                <input
                  type="text"
                  value={formData.officerRO || ''}
                  onChange={e => setFormData({ ...formData, officerRO: e.target.value })}
                  placeholder="যেমন: জনাব শফিকুল ইসলাম, আরও"
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-teal-950 dark:text-teal-200 mb-1">
                  সহকারী কমিশনার / উপ-কমিশনার (AC / DC)
                </label>
                <input
                  type="text"
                  value={formData.officerAC_DC || ''}
                  onChange={e => setFormData({ ...formData, officerAC_DC: e.target.value })}
                  placeholder="যেমন: জনাব মাহফুজুর রহমান, উপ-কমিশনার"
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-teal-950 dark:text-teal-200 mb-1">
                  যুগ্ম কমিশনার / অতিরিক্ত কমিশনার (JC / ADC)
                </label>
                <input
                  type="text"
                  value={formData.officerJC_ADC || ''}
                  onChange={e => setFormData({ ...formData, officerJC_ADC: e.target.value })}
                  placeholder="যেমন: জনাব মোস্তাফিজুর রহমান, অতিরিক্ত কমিশনার"
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              সার্কেল মন্তব্য / বিশেষ নোট
            </label>
            <textarea
              rows={2}
              value={formData.remarks || ''}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="সার্কেল কার্যক্রম বা করদাতার কোনো বিশেষ গতিবিধি..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              সংরক্ষণ করুন
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
