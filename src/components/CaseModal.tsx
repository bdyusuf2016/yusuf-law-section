import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calculator, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  Landmark, 
  Scale, 
  FileCheck2, 
  Building,
  CheckCircle2,
  FileText,
  ScrollText
} from 'lucide-react';
import { CaseRecord } from '../types/case';
import { takaToCrore, croreToTaka, formatCrore, formatTaka, toBengaliNumber, getStatusBadge } from '../utils/converter';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Partial<CaseRecord>) => void;
  initialData?: CaseRecord | null;
}

export const CaseModal: React.FC<CaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const getDefaultState = (forumType: 'tribunal' | 'certificate' | 'highCourt' = 'highCourt'): Partial<CaseRecord> => {
    if (forumType === 'tribunal') {
      return {
        slNo: '',
        companyName: '',
        address: '',
        circle: '',
        caseType: 'কাস্টমস আপীল',
        caseYear: '২০২৬',
        caseNo: '',
        amountTaka: 0,
        amountCrore: 0,
        court: 'কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল',
        courtHierarchy: 'কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল',
        description: '',
        latestStatus: '',
        remarks: '',
        supremeCourtUrl: '',
        tribunalBench: '১ম বেঞ্চ',
        originalOrderNo: '',
        preDepositStatus: '১০% প্রাক-জমা সম্পন্ন',
        certificateCourtName: '',
        section7NoticeStatus: '',
        distressWarrantStatus: '',
        certificateDebtor: '',
        section202Status: '',
        section202Ref: ''
      };
    }
    if (forumType === 'certificate') {
      return {
        slNo: '',
        companyName: '',
        address: '',
        circle: '',
        caseType: 'সার্টিফিকেট ও ধারা ২০২ মামলা',
        caseYear: '২০২৬',
        caseNo: '',
        amountTaka: 0,
        amountCrore: 0,
        court: 'সার্টিফিকেট ও ধারা ২০২',
        courtHierarchy: 'জেনারেল সার্টিফিকেট আদালত ও কাস্টমস আইনের ধারা ২০২',
        description: '',
        latestStatus: '',
        remarks: '',
        supremeCourtUrl: '',
        tribunalBench: '',
        originalOrderNo: '',
        preDepositStatus: '',
        certificateCourtName: 'জেনারেল সার্টিফিকেট আদালত, ঢাকা কালেক্টরেট',
        section7NoticeStatus: '৭ ধারা নোটিশ জারি সম্পন্ন',
        distressWarrantStatus: 'রিকভারি কার্যক্রম চলমান',
        certificateDebtor: '',
        section202Status: '২০২ ধারার নোটিশ জারি সম্পন্ন',
        section202Ref: ''
      };
    }
    return {
      slNo: '',
      companyName: '',
      address: '',
      circle: '',
      caseType: 'রীট পিটিশন',
      caseYear: '২০২৬',
      caseNo: '',
      amountTaka: 0,
      amountCrore: 0,
      court: 'হাইকোর্ট',
      courtHierarchy: 'মাননীয় সুপ্রিম কোর্টের হাইকোর্ট বিভাগ',
      description: '',
      latestStatus: '',
      remarks: '',
      supremeCourtUrl: '',
      tribunalBench: '',
      originalOrderNo: '',
      preDepositStatus: '',
      certificateCourtName: '',
      section7NoticeStatus: '',
      distressWarrantStatus: '',
      certificateDebtor: '',
      section202Status: '',
      section202Ref: ''
    };
  };

  const [formData, setFormData] = useState<Partial<CaseRecord>>(() => getDefaultState('highCourt'));
  const [takaInput, setTakaInput] = useState<string>('0');
  const [croreInput, setCroreInput] = useState<string>('0');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      const courtStr = initialData.court || '';
      const caseTypeStr = initialData.caseType || '';
      let fType: 'tribunal' | 'certificate' | 'highCourt' = 'highCourt';
      if (courtStr.includes('ট্রাইব্যুনাল')) fType = 'tribunal';
      else if (courtStr.includes('সার্টিফিকেট') || courtStr.includes('২০২') || caseTypeStr.includes('সার্টিফিকেট') || caseTypeStr.includes('২০২') || initialData.section202Status) fType = 'certificate';

      const base = getDefaultState(fType);
      setFormData(Object.assign({}, base, initialData));
      setTakaInput(String(initialData.amountTaka || 0));
      setCroreInput(String(initialData.amountCrore || 0));
    } else {
      setFormData(getDefaultState('highCourt'));
      setTakaInput('0');
      setCroreInput('0');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isTribunal = Boolean((formData.court || '').includes('ট্রাইব্যুনাল'));
  const isSection202 = Boolean((formData.court || '').includes('২০২') || (formData.caseType || '').includes('২০২') || Boolean(formData.section202Status) || Boolean(formData.section202Ref));
  const isCertificate = Boolean((formData.court || '').includes('সার্টিফিকেট') || (formData.caseType || '').includes('সার্টিফিকেট'));
  const isRecoveryOrCert = isCertificate || isSection202;

  // Helper to quickly select forum
  const selectForum = (courtName: string) => {
    if (courtName.includes('ট্রাইব্যুনাল')) {
      setFormData(prev => ({
        ...prev,
        court: 'কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল',
        courtHierarchy: 'কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল',
        caseType: prev.caseType === 'রীট পিটিশন' || (prev.caseType || '').includes('সার্টিফিকেট') ? 'কাস্টমস আপীল' : (prev.caseType || 'কাস্টমস আপীল'),
        tribunalBench: prev.tribunalBench || '১ম বেঞ্চ',
        preDepositStatus: prev.preDepositStatus || '১০% প্রাক-জমা সম্পন্ন'
      }));
    } else if (courtName.includes('সার্টিফিকেট') || courtName.includes('২০২')) {
      setFormData(prev => ({
        ...prev,
        court: 'সার্টিফিকেট ও ধারা ২০২',
        courtHierarchy: 'জেনারেল সার্টিফিকেট আদালত ও কাস্টমস আইনের ধারা ২০২',
        caseType: prev.caseType?.includes('২০২') ? prev.caseType : 'সার্টিফিকেট ও ধারা ২০২ মামলা',
        certificateCourtName: prev.certificateCourtName || 'জেনারেল সার্টিফিকেট আদালত, ঢাকা কালেক্টরেট',
        section7NoticeStatus: prev.section7NoticeStatus || '৭ ধারা নোটিশ জারি সম্পন্ন',
        distressWarrantStatus: prev.distressWarrantStatus || 'রিকভারি কার্যক্রম চলমান',
        section202Status: prev.section202Status || '২০২ ধারার নোটিশ জারি সম্পন্ন',
        section202Ref: prev.section202Ref || ''
      }));
    } else if (courtName.includes('আপীল বিভাগ')) {
      setFormData(prev => ({
        ...prev,
        court: 'সুপ্রিম কোর্ট (আপীল বিভাগ)',
        courtHierarchy: 'মাননীয় সুপ্রিম কোর্টের আপীল বিভাগ',
        caseType: prev.caseType === 'রীট পিটিশন' ? 'সিভিল পিটিশন (সিপি)' : prev.caseType
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        court: courtName,
        courtHierarchy: courtName === 'হাইকোর্ট' ? 'মাননীয় সুপ্রিম কোর্টের হাইকোর্ট বিভাগ' : courtName,
        caseType: (prev.caseType === 'কাস্টমস আপীল' || prev.caseType === 'মূসক আপীল' || (prev.caseType || '').includes('সার্টিফিকেট') || (prev.caseType || '').includes('২০২')) ? 'রীট পিটিশন' : (prev.caseType || 'রীট পিটিশন')
      }));
    }
  };

  // Real-time bidirectional converter
  const handleTakaChange = (val: string) => {
    setTakaInput(val);
    const num = parseFloat(val) || 0;
    const crore = takaToCrore(num);
    setCroreInput(String(crore));
    setFormData(prev => ({
      ...prev,
      amountTaka: num,
      amountCrore: crore
    }));
  };

  const handleCroreChange = (val: string) => {
    setCroreInput(val);
    const croreNum = parseFloat(val) || 0;
    const taka = croreToTaka(croreNum);
    setTakaInput(String(taka));
    setFormData(prev => ({
      ...prev,
      amountCrore: croreNum,
      amountTaka: taka
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName?.trim()) {
      setError('অনুগ্রহ করে প্রতিষ্ঠানের নাম প্রদান করুন।');
      return;
    }
    if (!formData.caseNo?.trim()) {
      setError('অনুগ্রহ করে মামলা নং প্রদান করুন।');
      return;
    }

    onSave({
      ...formData,
      amountTaka: parseFloat(takaInput) || 0,
      amountCrore: parseFloat(croreInput) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {initialData?.id ? '✏️ মামলার তথ্য সম্পাদনা (Edit Case)' : '➕ মামলার তথ্য এন্ট্রি (Add Case)'}
              </h2>
              {isTribunal && (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] border border-teal-300 dark:border-teal-800 flex items-center gap-1">
                  <Landmark className="w-3 h-3" /> আপিলাত ট্রাইব্যুনাল
                </span>
              )}
              {isRecoveryOrCert && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <ScrollText className="w-3 h-3" /> সার্টিফিকেট মামলা ও ধারা ২০২
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              প্রয়োজনীয় তথ্য পূরণ করুন। বকেয়ার পরিমাণ স্বয়ংক্রিয়ভাবে কোটি টাকায় হিসাব হবে।
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Forum / Court Selector Tabs */}
        <div className="px-6 pt-3 pb-1 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-indigo-500" /> আদালত / ট্রাইব্যুনাল / সার্টিফিকেট ফোরাম নির্বাচন:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pb-2">
            <button
              type="button"
              onClick={() => selectForum('হাইকোর্ট')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                !isTribunal && !isRecoveryOrCert && formData.court === 'হাইকোর্ট'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>হাইকোর্ট বিভাগ</span>
            </button>

            <button
              type="button"
              onClick={() => selectForum('কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                isTribunal
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/30 ring-2 ring-teal-400'
                  : 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/40'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-amber-300" />
              <span>আপীল ট্রাইব্যুনাল</span>
            </button>

            <button
              type="button"
              onClick={() => selectForum('সার্টিফিকেট ও ধারা ২০২')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                isRecoveryOrCert
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-600/30 ring-2 ring-amber-400'
                  : 'bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5 text-yellow-300" />
              <span>সার্টিফিকেট ও ধারা ২০২</span>
            </button>

            <button
              type="button"
              onClick={() => selectForum('সুপ্রিম কোর্ট (আপীল বিভাগ)')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                formData.court === 'সুপ্রিম কোর্ট (আপীল বিভাগ)'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>আপীল বিভাগ/অন্যান্য</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Tribunal Specialized Box */}
          {isTribunal && (
            <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border-2 border-teal-300 dark:border-teal-800 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-teal-950 dark:text-teal-200 font-bold text-xs">
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল সংক্রান্ত বিশেষ তথ্য
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 font-bold">
                  কাস্টমস আইন / মূসক আইন
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* ট্রাইব্যুনাল বেঞ্চ */}
                <div>
                  <label className="block text-[11px] font-bold text-teal-900 dark:text-teal-300 mb-1">
                    ট্রাইব্যুনাল বেঞ্চ *
                  </label>
                  <select
                    value={formData.tribunalBench || '১ম বেঞ্চ'}
                    onChange={e => setFormData({ ...formData, tribunalBench: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="১ম বেঞ্চ">১ম বেঞ্চ (সভাপতি ও কারিগরি সদস্য)</option>
                    <option value="২য় বেঞ্চ">২য় বেঞ্চ (সদস্য-বিচারিক ও সদস্য-কারিগরি)</option>
                    <option value="৩য় বেঞ্চ">৩য় বেঞ্চ</option>
                    <option value="পূর্ণাঙ্গ / বিশেষ বেঞ্চ">পূর্ণাঙ্গ / বিশেষ বেঞ্চ</option>
                  </select>
                </div>

                {/* ধারা অনুযায়ী ১০% প্রাক-জমা স্থিতি */}
                <div>
                  <label className="block text-[11px] font-bold text-teal-900 dark:text-teal-300 mb-1">
                    ১০% প্রাক-জমা (Pre-deposit) স্থিতি
                  </label>
                  <select
                    value={formData.preDepositStatus || '১০% প্রাক-জমা সম্পন্ন'}
                    onChange={e => setFormData({ ...formData, preDepositStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="১০% প্রাক-জমা সম্পন্ন">১০% প্রাক-জমা চালানের মাধ্যমে জমা সম্পন্ন</option>
                    <option value="১০% প্রাক-জমা হতে অব্যাহতি প্রাপ্ত">আদালত/ট্রাইব্যুনাল হতে অব্যাহতি প্রাপ্ত</option>
                    <option value="১০% প্রাক-জমা প্রদান প্রক্রিয়াধীন">১০% প্রাক-জমা প্রদান প্রক্রিয়াধীন</option>
                    <option value="প্রযোজ্য নয়">প্রযোজ্য নয়</option>
                  </select>
                </div>

                {/* মূল দাবীনামা / আদেশ নং */}
                <div>
                  <label className="block text-[11px] font-bold text-teal-900 dark:text-teal-300 mb-1">
                    মূল দাবীনামা / আপীল আদেশ নং
                  </label>
                  <input
                    type="text"
                    value={formData.originalOrderNo || ''}
                    onChange={e => setFormData({ ...formData, originalOrderNo: e.target.value })}
                    placeholder="যেমন: আদেশ নং- ০৮/আপীল/কাস্টমস/২০২৪"
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Certificate Case & Customs Act Section 202 Specialized Box */}
          {isRecoveryOrCert && (
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between text-amber-950 dark:text-amber-200 font-bold text-xs">
                <div className="flex items-center gap-1.5">
                  <ScrollText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  সার্টিফিকেট মামলা (PDR Act, 1913) ও কাস্টমস আইনের ধারা ২০২ (সরকারি পাওনা আদায়)
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                  পিডিআর অ্যাক্ট ও ধারা ২০২
                </span>
              </div>

              {/* কাস্টমস আইনের ধারা ২০২ সংক্রান্ত তথ্য */}
              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-200 dark:border-amber-800/80 space-y-2.5">
                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                  কাস্টমস আইনের ধারা ২০২ সংক্রান্ত তথ্য (সরকারি পাওনা আদায় কার্যক্রম)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      ধারা ২০২ অনুযায়ী গৃহীত পদক্ষেপ *
                    </label>
                    <select
                      value={formData.section202Status || '২০২ ধারার নোটিশ জারি সম্পন্ন'}
                      onChange={e => setFormData({ ...formData, section202Status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="২০২ ধারার নোটিশ জারি সম্পন্ন">২০২ ধারার নোটিশ জারি সম্পন্ন (ডিমান্ড নোটিশ)</option>
                      <option value="২০২(১)(খ) অনুযায়ী সকল পোর্টে খালাস স্থগিত ও BIN লক">২০২(১)(খ) অনুযায়ী সকল পোর্টে পণ্য চালান খালাস স্থগিত ও BIN লক</option>
                      <option value="২০২(১)(গ) অনুযায়ী ব্যাংক হিসাব অবরুদ্ধ (Bank Freeze)">২০২(১)(গ) অনুযায়ী ব্যাংক হিসাব অবরুদ্ধ (Bank Freeze)</option>
                      <option value="২০২(১)(ঘ) অনুযায়ী মালামাল ক্রোক ও নিলাম বিক্রয়">২০২(১)(ঘ) অনুযায়ী মালামাল ক্রোক ও নিলাম বিক্রয়</option>
                      <option value="২০২(১)(ঙ) অনুযায়ী পিডিআর আদালতে সার্টিফিকেট প্রেরণ">২০২(১)(ঙ) অনুযায়ী পিডিআর আদালতে সার্টিফিকেট প্রেরণ</option>
                      <option value="কিস্তিতে বকেয়া রাজস্ব আদায় চলমান">কিস্তিতে বকেয়া রাজস্ব আদায় চলমান</option>
                      <option value="বকেয়া সম্পূর্ণ আদায় সাপেক্ষে ধারা ২০২ প্রত্যাহার">বকেয়া সম্পূর্ণ আদায় সাপেক্ষে ধারা ২০২ প্রত্যাহার</option>
                      <option value="প্রযোজ্য নয়">প্রযোজ্য নয়</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      ধারা ২০২ নথি / ফাইল নং ও তারিখ
                    </label>
                    <input
                      type="text"
                      value={formData.section202Ref || ''}
                      onChange={e => setFormData({ ...formData, section202Ref: e.target.value })}
                      placeholder="যেমন: নথি নং- ০৮/ধারা-২০২/বকেয়া/কাস্টমস/২০২৫"
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* পিডিআর অ্যাক্ট, ১৯১৩ এর অধীনে সার্টিফিকেট আদালতের তথ্য */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* সার্টিফিকেট আদালত / দপ্তর */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                    সার্টিফিকেট আদালত / দপ্তর *
                  </label>
                  <select
                    value={formData.certificateCourtName || 'জেনারেল সার্টিফিকেট আদালত, ঢাকা কালেক্টরেট'}
                    onChange={e => setFormData({ ...formData, certificateCourtName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="জেনারেল সার্টিফিকেট আদালত, ঢাকা কালেক্টরেট">জেনারেল সার্টিফিকেট আদালত, ঢাকা কালেক্টরেট</option>
                    <option value="উপ-কমিশনারের কার্যালয় (সার্টিফিকেট শাখা), ঢাকা">উপ-কমিশনারের কার্যালয় (সার্টিফিকেট শাখা), ঢাকা</option>
                    <option value="সার্টিফিকেট অফিসারের কার্যালয়, গাজীপুর">সার্টিফিকেট অফিসারের কার্যালয়, গাজীপুর</option>
                    <option value="সার্টিফিকেট অফিসারের কার্যালয়, নারায়ণগঞ্জ">সার্টিফিকেট অফিসারের কার্যালয়, নারায়ণগঞ্জ</option>
                    <option value="জেলা প্রশাসকের রাজস্ব আদালত">জেলা প্রশাসকের রাজস্ব আদালত</option>
                    <option value="অন্যান্য জেলা সার্টিফিকেট কোর্ট">অন্যান্য জেলা সার্টিফিকেট কোর্ট</option>
                  </select>
                </div>

                {/* ৭ ধারার নোটিশ স্থিতি */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                    ৭ ধারার নোটিশ স্থিতি *
                  </label>
                  <select
                    value={formData.section7NoticeStatus || '৭ ধারা নোটিশ জারি সম্পন্ন'}
                    onChange={e => setFormData({ ...formData, section7NoticeStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="৭ ধারা নোটিশ জারি সম্পন্ন">৭ ধারা নোটিশ জারি সম্পন্ন</option>
                    <option value="৭ ধারা নোটিশ প্রেরিত (জারি প্রক্রিয়াধীন)">৭ ধারা নোটিশ প্রেরিত (জারি প্রক্রিয়াধীন)</option>
                    <option value="৯ ধারায় আপত্তি দাখিল ও শুনানি দিন ধার্য">৯ ধারায় আপত্তি দাখিল ও শুনানি দিন ধার্য</option>
                    <option value="৯ ধারার আপত্তি নামঞ্জুর">৯ ধারার আপত্তি নামঞ্জুর</option>
                    <option value="নোটিশ জারির অপেক্ষায়">নোটিশ জারির অপেক্ষায়</option>
                  </select>
                </div>

                {/* ক্রোক পরোয়ানা / ওয়ারেন্ট স্থিতি */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                    ক্রোক পরোয়ানা / রিকভারি স্থিতি
                  </label>
                  <select
                    value={formData.distressWarrantStatus || 'রিকভারি কার্যক্রম চলমান'}
                    onChange={e => setFormData({ ...formData, distressWarrantStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="রিকভারি কার্যক্রম চলমান">রিকভারি কার্যক্রম চলমান</option>
                    <option value="২৯ ধারা অনুযায়ী ব্যাংক ও সম্পত্তি ক্রোকাদেশ">২৯ ধারা অনুযায়ী ব্যাংক ও সম্পত্তি ক্রোকাদেশ</option>
                    <option value="গ্রেফতারি পরোয়ানা (Warrant of Arrest) জারি">গ্রেফতারি পরোয়ানা (Warrant of Arrest) জারি</option>
                    <option value="কিস্তিতে রাজস্ব পরিশোধ চলমান">কিস্তিতে রাজস্ব পরিশোধ চলমান</option>
                    <option value="কোনো পরোয়ানা জারি হয়নি">কোনো পরোয়ানা জারি হয়নি</option>
                  </select>
                </div>
              </div>

              {/* সার্টিফিকেট খাতক / দেনাদার */}
              <div>
                <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                  সার্টিফিকেট খাতক / দেনাদারের বিবরণ (মালিক/পরিচালকগণের নাম ও এনআইডি)
                </label>
                <input
                  type="text"
                  value={formData.certificateDebtor || ''}
                  onChange={e => setFormData({ ...formData, certificateDebtor: e.target.value })}
                  placeholder="যেমন: ব্যবস্থাপনা পরিচালক, জনাব... (জাতীয় পরিচয়পত্র/টিআইএন সহ)"
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Row 1: ক্র.নং, সাল, আদালত */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ক্র.নং
              </label>
              <input
                type="text"
                value={formData.slNo || ''}
                onChange={e => setFormData({ ...formData, slNo: e.target.value })}
                placeholder="যেমন: ১০৬"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মামলার সাল
              </label>
              <input
                type="text"
                value={formData.caseYear || ''}
                onChange={e => setFormData({ ...formData, caseYear: e.target.value })}
                placeholder="যেমন: ২০২৬"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                কোন আদালতে মামলাধীন *
              </label>
              <select
                value={formData.court || 'হাইকোর্ট'}
                onChange={e => selectForum(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
              >
                <option value="হাইকোর্ট">🏛️ হাইকোর্ট (মাননীয় সুপ্রিম কোর্ট)</option>
                <option value="কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল">🏢 কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল</option>
                <option value="সার্টিফিকেট ও ধারা ২০২">📜 সার্টিফিকেট আদালত ও ধারা ২০২ (রাজস্ব আদায়)</option>
                <option value="সুপ্রিম কোর্ট (আপীল বিভাগ)">⚖️ সুপ্রিম কোর্ট (আপীল বিভাগ)</option>
                <option value="আপীল কমিশনারেট">📋 কাস্টমস/মূসক আপীল কমিশনারেট</option>
                <option value="বিজ্ঞ সিভিল কোর্ট">🏛️ বিজ্ঞ সিভিল কোর্ট</option>
                <option value="অন্যান্য">অন্যান্য আদালত / ট্রাইব্যুনাল</option>
              </select>
            </div>
          </div>

          {/* Row 2: প্রতিষ্ঠানের নাম */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              প্রতিষ্ঠানের নাম *
            </label>
            <input
              type="text"
              required
              value={formData.companyName || ''}
              onChange={e => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="যেমন: সাউথ চায়না ব্লিচিং এন্ড ডাইং ফ্যাক্টরী লিঃ"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Row 3: ঠিকানা ও সার্কেল */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ঠিকানা
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="যেমন: ঢাকা / গাজীপুর / নরসিংদী"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                সার্কেল (শুধু সংখ্যা) *
              </label>
              <input
                type="text"
                value={formData.circle || ''}
                onChange={e => {
                  const numOnly = e.target.value.replace(/[^0-9০-৯]/g, '');
                  setFormData({ ...formData, circle: numOnly });
                }}
                placeholder="যেমন: ১, ২, ৩ বা 4"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 bengali-num font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">শুধুমাত্র সংখ্যা প্রবেশ করান (কোনো টেক্সট নয়)</p>
            </div>
          </div>

          {/* Row 4: মামলার ধরণ ও মামলা নং */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মামলার ধরণ {isRecoveryOrCert ? <span className="text-amber-600 font-normal">(সার্টিফিকেট / ধারা ২০২)</span> : isTribunal ? <span className="text-teal-600 font-normal">(ট্রাইব্যুনাল)</span> : null}
              </label>
              <input
                type="text"
                list="caseTypesList"
                value={formData.caseType || ''}
                onChange={e => setFormData({ ...formData, caseType: e.target.value })}
                placeholder={isRecoveryOrCert ? "যেমন: সার্টিফিকেট ও ধারা ২০২ মামলা / ধারা ২০২ কার্যক্রম" : isTribunal ? "যেমন: কাস্টমস আপীল / মূসক আপীল" : "যেমন: রীট পিটিশন / সিপি"}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <datalist id="caseTypesList">
                <option value="সার্টিফিকেট ও ধারা ২০২ মামলা" />
                <option value="সার্টিফিকেট মামলা" />
                <option value="ধারা ২০২ কার্যক্রম" />
                <option value="কাস্টমস আপীল" />
                <option value="মূসক আপীল" />
                <option value="এক্সাইজ আপীল" />
                <option value="ট্রাইব্যুনাল রিভিশন" />
                <option value="রীট পিটিশন" />
                <option value="সিভিল পিটিশন (সিপি)" />
                <option value="টাইটেল স্যুট" />
              </datalist>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মামলা / সার্টিফিকেট / নথি নং *
              </label>
              <input
                type="text"
                required
                value={formData.caseNo || ''}
                onChange={e => setFormData({ ...formData, caseNo: e.target.value })}
                placeholder={isRecoveryOrCert ? "যেমন: সার্টিফিকেট মামলা নং- ১২/২০২৫-২৬ বা নথি নং- ২০২/কাস্টমস/২০২৫" : isTribunal ? "যেমন: আপীল নং- ০৫/২০২৪ (কাস্টমস) বা ১২/২০২৫ (মূসক)" : "যেমন: রীট পিটিশন নং- ১২৪১৭/২০২৪"}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 5: বকেয়ার পরিমাণ - DUAL SYNC CALCULATION */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
            <div className="flex items-center gap-1.5 font-bold text-indigo-950 dark:text-indigo-200 text-xs mb-3">
              <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              বকেয়ার হিসাব ও কোটি টাকায় স্বয়ংক্রিয় রূপান্তর (১ কোটি = ১,০০,০০,০০০ টাকা)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                  বকেয়ার পরিমাণ (টাকা)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={takaInput}
                    onChange={e => handleTakaChange(e.target.value)}
                    placeholder="যেমন: 7207767986"
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">টাকা</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  বাংলা ফরম্যাট: {formatTaka(parseFloat(takaInput) || 0)}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                  বকেয়ার পরিমাণ (কোটি টাকা) [স্বয়ংক্রিয় রূপান্তর]
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={croreInput}
                    onChange={e => handleCroreChange(e.target.value)}
                    placeholder="যেমন: 720.78"
                    className="w-full px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-bold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 font-bold">কোটি</span>
                </div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                  কথায়: {formatCrore(parseFloat(croreInput) || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Row 5.5: সংশ্লিষ্ট বকেয়া উদ্ভবের সময়কাল ও আদালত স্তর */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                সংশ্লিষ্ট বকেয়া উদ্ভবের সময়কাল
              </label>
              <input
                type="text"
                value={formData.originPeriod || ''}
                onChange={e => setFormData({ ...formData, originPeriod: e.target.value })}
                placeholder="যেমন: ২০১৭ সাল, ২০২১ সাল বা ২০২৩ সাল"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                আদালত স্তর (ছকের ৬ষ্ঠ কলাম)
              </label>
              <input
                type="text"
                value={formData.courtHierarchy || ''}
                onChange={e => setFormData({ ...formData, courtHierarchy: e.target.value })}
                placeholder={isRecoveryOrCert ? "জেনারেল সার্টিফিকেট আদালত ও কাস্টমস আইনের ধারা ২০২" : isTribunal ? "কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল" : "যেমন: মাননীয় সুপ্রিম কোর্টের হাইকোর্ট বিভাগ / আপীল বিভাগ"}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 6: মামলার বিষয়বস্তু ও বকেয়ার উদ্ভবের কারণ */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                মামলার বিষয়বস্তু ও বকেয়া উদ্ভবের কারণ *
              </label>
              <span className="text-[11px] text-slate-400">প্রতিবেদনের ৪র্থ কলাম</span>
            </div>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value, caseSubjectReason: e.target.value })}
              placeholder={isRecoveryOrCert ? "করদাতার নিকট সরকারের দাবীকৃত রাজস্ব বকেয়া আদায়ে ব্যর্থ হওয়ায় কাস্টমস আইনের ধারা ২০২ অনুযায়ী কার্যক্রম গ্রহণ এবং পিডিআর অ্যাক্ট, ১৯১৩ মোতাবেক জেনারেল সার্টিফিকেট অফিসারের নিকট সার্টিফিকেট মামলা দায়ের..." : isTribunal ? "বন্ড সুবিধায় আমদানিকৃত কাঁচামাল/মূলধনী যন্ত্রপাতির অনিয়মের দায়ে দাবীকৃত শুল্ক-কর ও অর্থদণ্ডের বিরুদ্ধে করদাতা কর্তৃক আপিলাত ট্রাইব্যুনালে দায়েরকৃত আপীল..." : "বন্ড সুবিধায় আমদানিকৃত কাঁচামালের বন্ডিং মেয়াদ উত্তীর্ণ করায় প্রযোজ্য শুল্ক করাদি... ও অর্থদণ্ড বাবদ সর্বমোট রাজস্ব ফাঁকির উদ্ভব হয়।"}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans leading-relaxed"
            />
          </div>

          {/* Row 7: মামলার সর্বশেষ পরিস্থিতি ও শুনানি */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                মামলার সর্বশেষ পরিস্থিতি ও শুনানি
              </label>
              {/* Live Auto-Detection Badge Preview */}
              {(() => {
                const detectedBadge = getStatusBadge(formData.latestStatus || '', formData.remarks || '');
                return (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" /> অটো স্ট্যাটাস:
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${detectedBadge.bg} ${detectedBadge.color}`}>
                      {detectedBadge.label}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Quick Auto-Fill Status Presets */}
            {isRecoveryOrCert ? (
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">সার্টিফিকেট ও ২০২ কুইক সিলেক্ট:</span>
                
                {/* Section 202 Presets */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'কাস্টমস আইনের ধারা ২০২ অনুযায়ী সরকারি পাওনা রাজস্ব পরিশোধের চূড়ান্ত নোটিশ জারি করা হয়েছে।',
                      remarks: prev.remarks || '২০২ ধারার নোটিশ জারি',
                      section202Status: '২০২ ধারার নোটিশ জারি সম্পন্ন'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 transition-colors font-bold"
                >
                  + ধারা ২০২ নোটিশ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'কাস্টমস আইনের ধারা ২০২(১)(খ) অনুযায়ী সকল কাস্টম হাউসে পণ্য চালান খালাস স্থগিত ও বিআইএন লক করার জন্য পত্র জারি করা হয়েছে।',
                      remarks: prev.remarks || 'পোর্টে খালাস ও BIN লক',
                      section202Status: '২০২(১)(খ) অনুযায়ী সকল পোর্টে খালাস স্থগিত ও BIN লক'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-800 transition-colors font-semibold"
                >
                  + ২০২(১)(খ) পোর্ট ও BIN লক
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'কাস্টমস আইনের ধারা ২০২(১)(গ) অনুযায়ী দেনাদারের সকল ব্যাংক হিসাব অবরুদ্ধ (Freeze) করার জন্য বাংলাদেশ ব্যাংক ও সংশ্লিষ্ট ব্যাংকে পত্র প্রেরণ করা হয়েছে।',
                      remarks: prev.remarks || 'ব্যাংক হিসাব অবরুদ্ধ',
                      section202Status: '২০২(১)(গ) অনুযায়ী ব্যাংক হিসাব অবরুদ্ধ (Bank Freeze)'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800 transition-colors font-semibold"
                >
                  + ২০২(১)(গ) ব্যাংক ফ্রিজ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'কাস্টমস আইনের ধারা ২০২(১)(ঙ) অনুযায়ী সার্টিফিকেট প্রস্তুতপূর্বক পিডিআর অ্যাক্টের আওতায় সার্টিফিকেট মামলা দায়েরার্থে জেনারেল সার্টিফিকেট অফিসারের নিকট প্রেরণ করা হয়েছে।',
                      remarks: prev.remarks || 'পিডিআর আদালতে প্রেরণ',
                      section202Status: '২০২(১)(ঙ) অনুযায়ী পিডিআর আদালতে সার্টিফিকেট প্রেরণ'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 transition-colors font-medium"
                >
                  + ২০২(১)(ঙ) পিডিআর মামলা প্রেরণ
                </button>

                {/* PDR Act Presets */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'পিডিআর অ্যাক্টের ৭ ধারা মোতাবেক দেনাদারের বরাবরে নোটিশ জারি করা হয়েছে।',
                      remarks: prev.remarks || '৭ ধারা নোটিশ জারি',
                      section7NoticeStatus: '৭ ধারা নোটিশ জারি সম্পন্ন'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 transition-colors font-medium"
                >
                  + ৭ ধারা নোটিশ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'দেনাদার কর্তৃক ৯ ধারায় আপত্তি দাখিলান্তে সার্টিফিকেট অফিসারের নিকট শুনানির দিন ধার্য রয়েছে।',
                      remarks: prev.remarks || '৯ ধারার শুনানি',
                      section7NoticeStatus: '৯ ধারায় আপত্তি দাখিল ও শুনানি দিন ধার্য'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 transition-colors font-medium"
                >
                  + ৯ ধারায় শুনানি
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: '২৯ ধারা মোতাবেক দেনাদারের ব্যাংক হিসাব ও স্থাবর-অস্থাবর সম্পত্তি ক্রোকের আদেশ প্রদান করা হয়েছে।',
                      remarks: prev.remarks || 'ক্রোকাদেশ বলবৎ',
                      distressWarrantStatus: '২৯ ধারা অনুযায়ী ব্যাংক ও সম্পত্তি ক্রোকাদেশ'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 transition-colors font-medium"
                >
                  + ২৯ ধারায় ক্রোক
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'বকেয়া রাজস্ব পরিশোধ না করায় দেনাদারের বিরুদ্ধে সার্টিফিকেট অফিসার কর্তৃক গ্রেফতারি পরোয়ানা জারি করা হয়েছে।',
                      remarks: prev.remarks || 'গ্রেফতারি পরোয়ানা',
                      distressWarrantStatus: 'গ্রেফতারি পরোয়ানা (Warrant of Arrest) জারি'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 transition-colors font-medium"
                >
                  + গ্রেফতারি পরোয়ানা
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'সার্টিফিকেট আদালতের মাধ্যমে কিস্তিতে রাজস্ব আদায় কার্যক্রম চলমান রয়েছে।',
                      remarks: prev.remarks || 'কিস্তিতে আদায়'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 transition-colors font-medium"
                >
                  + কিস্তিতে আদায়
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'দাবীকৃত সমগ্র বকেয়া রাজস্ব আদায় সাপেক্ষে ধারা ২০২ ও সার্টিফিকেট মামলা প্রত্যাহার/নিষ্পত্তি করা হয়েছে।',
                      remarks: prev.remarks || 'সম্পূর্ণ আদায়ান্তে নিষ্পত্তি',
                      section202Status: 'বকেয়া সম্পূর্ণ আদায় সাপেক্ষে ধারা ২০২ প্রত্যাহার'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 transition-colors font-medium"
                >
                  + সম্পূর্ণ আদায় ও ২০২ প্রত্যাহার
                </button>
              </div>
            ) : isTribunal ? (
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold">ট্রাইব্যুনাল কুইক সিলেক্ট:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'আপীল মেমো দাখিলান্তে গ্রহণযোগ্যতা শুনানির জন্য নির্ধারিত রয়েছে।',
                      remarks: prev.remarks || 'আপীল গ্রহণ পর্যায়'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 transition-colors font-medium"
                >
                  + মেমো দাখিল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: '১০% প্রাক-জমা চালানের মাধ্যমে পরিশোধ সাপেক্ষে আপীল শুনানির জন্য গৃহীত হয়েছে।',
                      remarks: prev.remarks || '১০% প্রাক-জমা সম্পন্ন'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 transition-colors font-medium"
                >
                  + ১০% প্রাক-জমা গৃহীত
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'আপিলাত ট্রাইব্যুনালে মামলাটির চূড়ান্ত শুনানি অনুষ্ঠানের জন্য অপেক্ষমাণ রয়েছে।',
                      remarks: prev.remarks || 'শুনানি পর্যায়'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 transition-colors font-medium"
                >
                  + শুনানি অপেক্ষমাণ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'ট্রাইব্যুনাল কর্তৃক বকেয়া রাজস্ব দাবীর উপর অন্তর্বর্তীকালীন স্থগিতাদেশ প্রদান করা হয়েছে।',
                      remarks: prev.remarks || 'স্থগিতাদেশ'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 transition-colors font-medium"
                >
                  + স্থগিতাদেশ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'আপিলাত ট্রাইব্যুনাল কর্তৃক সরকারের অনুকূলে আপীল নিষ্পত্তি হয়েছে এবং দাবীকৃত রাজস্ব আদায়যোগ্য।',
                      remarks: prev.remarks || 'নিষ্পত্তি (সরকারের পক্ষে)'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 transition-colors font-medium"
                >
                  + নিষ্পত্তি (সরকারের পক্ষে)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'মামলাটি পূনঃশুনানি ও নিষ্পত্তির জন্য আপীল কমিশনারেটে রিমান্ডে প্রেরণ করা হয়েছে।',
                      remarks: prev.remarks || 'রিমান্ডে প্রেরণ'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 transition-colors font-medium"
                >
                  + কমিশনারেটে রিমান্ড
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="text-[10px] text-slate-400 font-medium">কুইক সিলেক্ট:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'মামলাটি হাইকোর্টে এখনো কজলিস্ট ভুক্ত করা হয়নি।',
                      remarks: prev.remarks || 'কজলিস্ট বহির্ভূত'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors font-medium"
                >
                  + কজলিস্ট বহির্ভূত
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'মামলাটি শুনানির জন্য অপেক্ষমাণ রয়েছে।',
                      remarks: prev.remarks || 'শুনানি পর্যায়'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors font-medium"
                >
                  + শুনানি পর্যায়
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'মাননীয় আদালত কর্তৃক রুল জারী করা হয়েছে।',
                      remarks: prev.remarks || 'রুল জারী'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors font-medium"
                >
                  + রুল জারী
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'মাননীয় আদালত কর্তৃক কার্যধারার উপর অন্তর্বর্তীকালীন স্থগিতাদেশ প্রদান করা হয়েছে।',
                      remarks: prev.remarks || 'স্থগিতাদেশ'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors font-medium"
                >
                  + স্থগিতাদেশ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      latestStatus: 'মামলাটি চূড়ান্ত নিষ্পত্তি হয়েছে।',
                      remarks: prev.remarks || 'নিষ্পত্তি'
                    }));
                  }}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors font-medium"
                >
                  + নিষ্পত্তি
                </button>
              </div>
            )}

            <textarea
              rows={2}
              value={formData.latestStatus || ''}
              onChange={e => setFormData({ ...formData, latestStatus: e.target.value })}
              placeholder={isCertificate ? "সার্টিফিকেট অফিসারের নিকট শুনানির অগ্রগতি, ৭ ধারা নোটিশ বা পরোয়ানা সংক্রান্ত বিবরণ..." : isTribunal ? "আপিলাত ট্রাইব্যুনালে শুনানির অগ্রগতি, আদেশের বিবরণ বা বর্তমান স্থিতি..." : "শুনানির তারিখ, আদালতের অন্তর্বর্তীকালীন আদেশ, রুল জারী, স্থগিতাদেশ বা বর্তমান স্থিতি..."}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Row 8: মন্তব্য ও অনলাইন লিংক */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মন্তব্য (আইনি প্রস্তুতি / পদক্ষেপ)
              </label>
              <input
                type="text"
                value={formData.remarks || ''}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                placeholder={isCertificate ? "সার্টিফিকেট আদালতের মাধ্যমে ক্রোক বা রিকভারি পদক্ষেপ..." : isTribunal ? "ট্রাইব্যুনালে শুনানির জন্য নথি প্রস্তুত ও আইনি পদক্ষেপ..." : "বিজ্ঞ অ্যাটর্নি জেনারেল মহোদয় বরাবর পত্র প্রেরণ..."}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-teal-500" /> {isCertificate ? 'সার্টিফিকেট নথি / অনলাইন লিংক' : isTribunal ? 'অনলাইন / ট্রাইব্যুনাল বা সুপ্রিম কোর্ট লিংক' : 'সুপ্রিম কোর্ট অনলাইন লিংক'}
              </label>
              <input
                type="url"
                value={formData.supremeCourtUrl || ''}
                onChange={e => setFormData({ ...formData, supremeCourtUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">
              বর্তমান আদালত: <span className="font-bold text-slate-700 dark:text-slate-300">{formData.court}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg transition-all ${
                  isCertificate
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                    : isTribunal
                    ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                }`}
              >
                <Save className="w-4 h-4" />
                {isCertificate ? 'সার্টিফিকেট মামলা সংরক্ষণ' : isTribunal ? 'ট্রাইব্যুনাল মামলা সংরক্ষণ' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
