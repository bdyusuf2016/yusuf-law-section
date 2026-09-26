import React, { useState, useEffect } from 'react';
import { X, Save, Calculator, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
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
  const [formData, setFormData] = useState<Partial<CaseRecord>>({
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
    description: '',
    latestStatus: '',
    remarks: '',
    supremeCourtUrl: ''
  });

  const [takaInput, setTakaInput] = useState<string>('0');
  const [croreInput, setCroreInput] = useState<string>('0');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setTakaInput(String(initialData.amountTaka || 0));
      setCroreInput(String(initialData.amountCrore || 0));
    } else {
      setFormData({
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
        description: '',
        latestStatus: '',
        remarks: '',
        supremeCourtUrl: ''
      });
      setTakaInput('0');
      setCroreInput('0');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

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
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {initialData ? '✏️ মামলার তথ্য সম্পাদনা (Edit Case)' : '➕ নতুন মামলার তথ্য এন্ট্রি (Add Case)'}
            </h2>
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

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
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
                onChange={e => setFormData({ ...formData, court: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="হাইকোর্ট">হাইকোর্ট</option>
                <option value="সুপ্রিম কোর্ট (আপীল বিভাগ)">সুপ্রিম কোর্ট (আপীল বিভাগ)</option>
                <option value="কাস্টমস আপীল ট্রাইব্যুনাল">কাস্টমস আপীল ট্রাইব্যুনাল</option>
                <option value="বিজ্ঞ সিভিল কোর্ট">বিজ্ঞ সিভিল কোর্ট</option>
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
                মামলার ধরণ
              </label>
              <input
                type="text"
                list="caseTypesList"
                value={formData.caseType || ''}
                onChange={e => setFormData({ ...formData, caseType: e.target.value })}
                placeholder="যেমন: রীট পিটিশন / কাস্টমস আপীল / সিপি"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <datalist id="caseTypesList">
                <option value="রীট পিটিশন" />
                <option value="কাস্টমস আপীল" />
                <option value="সিভিল পিটিশন (সিপি)" />
                <option value="টাইটেল স্যুট" />
                <option value="কোম্পানি ম্যাটার" />
              </datalist>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মামলা নং *
              </label>
              <input
                type="text"
                required
                value={formData.caseNo || ''}
                onChange={e => setFormData({ ...formData, caseNo: e.target.value })}
                placeholder="যেমন: রীট পিটিশন নং- ১২৪১৭/২০২৪"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                placeholder="যেমন: মাননীয় সুপ্রিম কোর্টের হাইকোর্ট বিভাগ / আপীল বিভাগ"
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
              placeholder="বন্ড সুবিধায় আমদানিকৃত কাঁচামালের বন্ডিং মেয়াদ উত্তীর্ণ করায় প্রযোজ্য শুল্ক করাদি... ও অর্থদণ্ড বাবদ সর্বমোট রাজস্ব ফাঁকির উদ্ভব হয়।"
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
                className="px-2 py-0.5 text-[11px] rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors font-medium"
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
                className="px-2 py-0.5 text-[11px] rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors font-medium"
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
                className="px-2 py-0.5 text-[11px] rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors font-medium"
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
                className="px-2 py-0.5 text-[11px] rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors font-medium"
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
                className="px-2 py-0.5 text-[11px] rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors font-medium"
              >
                + নিষ্পত্তি
              </button>
            </div>

            <textarea
              rows={2}
              value={formData.latestStatus || ''}
              onChange={e => setFormData({ ...formData, latestStatus: e.target.value })}
              placeholder="শুনানির তারিখ, আদালতের অন্তর্বর্তীকালীন আদেশ, রুল জারী, স্থগিতাদেশ বা বর্তমান স্থিতি..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Row 8: মন্তব্য ও সুপ্রিম কোর্ট লিংক */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মন্তব্য (আইনি প্রস্তুতি / পদক্ষেপ)
              </label>
              <input
                type="text"
                value={formData.remarks || ''}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="বিজ্ঞ অ্যাটর্নি জেনারেল মহোদয় বরাবর পত্র প্রেরণ..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-teal-500" /> সুপ্রিম কোর্ট অনলাইন লিংক
              </label>
              <input
                type="url"
                value={formData.supremeCourtUrl || ''}
                onChange={e => setFormData({ ...formData, supremeCourtUrl: e.target.value })}
                placeholder="www.supremecourt.gov.bd/web/case_history..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              সংরক্ষণ করুন
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
