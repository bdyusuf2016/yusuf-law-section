import React, { useState, useEffect } from 'react';
import { X, Printer, Copy, Check, FileText, Calendar, Clock, MapPin, Building2, Send } from 'lucide-react';
import { HearingNotice, CompanyCircleProfile } from '../../types/circle';
import { formatTaka, toBengaliNumber } from '../../utils/converter';

interface HearingNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: HearingNotice) => void;
  notice?: HearingNotice | null;
  initialNotice?: HearingNotice | null;
  companies: CompanyCircleProfile[];
  prefilledCompany?: CompanyCircleProfile;
}

export const HearingNoticeModal: React.FC<HearingNoticeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  notice,
  initialNotice,
  companies,
  prefilledCompany
}) => {
  const [formData, setFormData] = useState<Partial<HearingNotice>>({
    memoNo: '০৮.০১.০০০০.০১২.০৩.০০১.২৬-',
    date: new Date().toISOString().split('T')[0],
    companyName: '',
    address: '',
    bin: '',
    circle: '১',
    hearingDate: '',
    hearingTime: 'সকাল ১১:০০ ঘটিকা',
    hearingLocation: 'উপ-কমিশনারের কার্যালয় (কক্ষ নং- ৩০২), কাস্টমস বন্ড কমিশনারেট',
    subject: 'বন্ড সুবিধায় শুল্কমুক্ত আমদানিকৃত কাঁচামাল অনিয়ম ও রাজস্ব বকেয়া দাবীর প্রেক্ষিতে শুনানিতে উপস্থিতি প্রসঙ্গে।',
    caseOrDemandRef: 'নথি নং- ০৮/বকেয়া/কাস্টমস/২০২৬',
    demandedAmountTaka: 0,
    requiredDocuments: '১. কাঁচামাল আমদানির ইনভয়েস, প্যাকিং লিস্ট ও বিল অব এন্ট্রি (কপি)\n২. ইউটিলাইজেশন পারমিশন (UP) ও ইউটিলাইজেশন ডিক্লারেশন (UD)\n৩. কাঁচামাল প্রাপ্তি ও বিতরণ রেজিস্টার (পরিশিষ্ট-ক ও খ)\n৪. প্রতিষ্ঠানের হালনাগাদ বন্ড লাইসেন্স ও আয়কর প্রত্যয়নপত্র\n৫. ক্ষমতাপ্রাপ্ত প্রতিনিধির যথাযথ ক্ষমতাপত্র',
    signatoryName: 'মাহফুজুর রহমান',
    signatoryDesignation: 'উপ-কমিশনার, সার্কেল-১, কাস্টমস বন্ড কমিশনারেট',
    status: 'draft'
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (initialNotice) {
      setFormData(initialNotice);
    } else {
      setFormData({
        memoNo: `০৮.০১.০০০০.০১২.০৩.০০১.২৬-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        companyName: companies[0]?.companyName || '',
        address: companies[0]?.address || '',
        bin: companies[0]?.bin || '',
        circle: companies[0]?.circle || '১',
        hearingDate: '',
        hearingTime: 'সকাল ১১:০০ ঘটিকা',
        hearingLocation: 'উপ-কমিশনারের কার্যালয় (কক্ষ নং- ৩০২), কাস্টমস বন্ড কমিশনারেট',
        subject: 'বন্ড সুবিধায় শুল্কমুক্ত আমদানিকৃত কাঁচামাল অনিয়ম ও রাজস্ব বকেয়া দাবীর প্রেক্ষিতে শুনানিতে উপস্থিতি প্রসঙ্গে।',
        caseOrDemandRef: 'নথি নং- ০৮/বকেয়া/কাস্টমস/২০২৬',
        demandedAmountTaka: companies[0]?.arrearsTaka || 0,
        requiredDocuments: '১. কাঁচামাল আমদানির ইনভয়েস, প্যাকিং লিস্ট ও বিল অব এন্ট্রি (কপি)\n২. ইউটিলাইজেশন পারমিশন (UP) ও ইউটিলাইজেশন ডিক্লারেশন (UD)\n৩. কাঁচামাল প্রাপ্তি ও বিতরণ রেজিস্টার (পরিশিষ্ট-ক ও খ)\n৪. প্রতিষ্ঠানের হালনাগাদ বন্ড লাইসেন্স ও আয়কর প্রত্যয়নপত্র\n৫. ক্ষমতাপ্রাপ্ত প্রতিনিধির যথাযথ ক্ষমতাপত্র',
        signatoryName: 'মাহফুজুর রহমান',
        signatoryDesignation: 'উপ-কমিশনার, সার্কেল-১, কাস্টমস বন্ড কমিশনারেট',
        status: 'draft'
      });
    }
  }, [initialNotice, isOpen, companies]);

  if (!isOpen) return null;

  const handleSelectCompany = (compName: string) => {
    const found = companies.find(
      c => c.companyName.trim().toLowerCase() === compName.trim().toLowerCase()
    );
    if (found) {
      let sigName = 'মাহফুজুর রহমান';
      let sigDesig = `উপ-কমিশনার, সার্কেল-${toBengaliNumber(found.circle)}, কাস্টমস বন্ড কমিশনারেট`;

      if (found.officerAC_DC) {
        const parts = found.officerAC_DC.split(',');
        sigName = parts[0].trim();
        sigDesig = parts[1]
          ? `${parts[1].trim()}, সার্কেল-${toBengaliNumber(found.circle)}, কাস্টমস বন্ড কমিশনারেট`
          : `উপ-কমিশনার, সার্কেল-${toBengaliNumber(found.circle)}, কাস্টমস বন্ড কমিশনারেট`;
      }

      setFormData(prev => ({
        ...prev,
        companyName: found.companyName,
        address: found.address,
        bin: found.bin,
        circle: found.circle,
        demandedAmountTaka: found.arrearsTaka || prev.demandedAmountTaka || 0,
        caseOrDemandRef: found.linkedCaseNos
          ? `মামলা নং- ${found.linkedCaseNos}`
          : found.bondLicenseNo
          ? `বন্ড লাইসেন্স: ${found.bondLicenseNo}`
          : prev.caseOrDemandRef,
        signatoryName: sigName,
        signatoryDesignation: sigDesig,
        hearingLocation: `উপ-কমিশনারের কার্যালয় (সার্কেল-${toBengaliNumber(found.circle)}), কাস্টমস বন্ড কমিশনারেট`
      }));
    } else {
      setFormData(prev => ({ ...prev, companyName: compName }));
    }
  };

  const handlePrint = () => {
    const printArea = document.getElementById('hearing-letter-printable');
    if (!printArea) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>শুনানির নোটিশ - ${formData.companyName}</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'SolaimanLipi', 'Nikosh', 'Kalpurush', 'Times New Roman', sans-serif; font-size: 13pt; line-height: 1.6; color: #000; margin: 0; padding: 10px; }
            .header { text-align: center; margin-bottom: 25px; line-height: 1.3; }
            .header h3 { margin: 0; font-size: 15pt; font-weight: bold; }
            .header h4 { margin: 3px 0; font-size: 13pt; font-weight: normal; }
            .memo-date { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 11pt; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .to-section { margin-bottom: 20px; }
            .subject { font-weight: bold; margin-bottom: 15px; text-decoration: underline; }
            .content { text-align: justify; margin-bottom: 20px; }
            .docs-box { margin: 15px 0 20px 20px; font-size: 11.5pt; }
            .signatory { margin-top: 50px; float: right; text-align: center; }
            .sign-line { border-top: 1px dotted #000; padding-top: 5px; min-width: 200px; }
            .copy-to { clear: both; margin-top: 40px; font-size: 10.5pt; border-top: 1px solid #aaa; padding-top: 10px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyText = () => {
    const text = `
গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
কাস্টমস বন্ড কমিশনারেট
সার্কেল-${toBengaliNumber(formData.circle)} শাখা

স্মারক নং: ${formData.memoNo}                     তারিখ: ${formData.date}

প্রাপক:
ব্যবস্থাপনা পরিচালক / প্রধান নির্বাহী
${formData.companyName}
ঠিকানা: ${formData.address}
বিআইএন: ${formData.bin}

বিষয়: ${formData.subject}
সূত্র: ${formData.caseOrDemandRef}

মহোদয়,
উপর্যুক্ত বিষয় ও সূত্রের প্রেক্ষিতে জানানো যাচ্ছে যে, আপনার প্রতিষ্ঠানের অনুকূলে শুল্কমুক্ত সুবিধায় আমদানিকৃত বন্ডেড কাঁচামালের অনিয়ম / বকেয়া দাবীকৃত রাজস্ব ${formatTaka(formData.demandedAmountTaka || 0)} সংক্রান্ত বিষয়টি নিষ্পত্তির লক্ষ্যে নিম্নবর্ণিত তারিখ ও সময়ে এক শুনানি অনুষ্ঠানের দিন ধার্য করা হয়েছে:

১. শুনানির তারিখ: ${formData.hearingDate || 'নির্ধারিত নয়'}
২. শুনানির সময়: ${formData.hearingTime}
৩. শুনানির স্থান: ${formData.hearingLocation}

এমতাবস্থায়, শুনানিতে উল্লিখিত তারিখ ও সময়ে প্রয়োজনীয় যাবতীয় মূল নথিপত্রসহ স্বয়ং অথবা ক্ষমতাপ্রাপ্ত প্রতিনিধির মাধ্যমে শুনানিতে উপস্থিত থাকার জন্য অনুরোধ করা হলো:
উপস্থাপনযোগ্য দলিলাদি:
${formData.requiredDocuments}

স্বাক্ষরিত,
(${formData.signatoryName})
${formData.signatoryDesignation}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveNotice = (status: 'draft' | 'issued') => {
    const payload: HearingNotice = {
      id: initialNotice?.id || `notice-${Date.now()}`,
      memoNo: formData.memoNo || '',
      date: formData.date || new Date().toISOString().split('T')[0],
      companyName: formData.companyName || '',
      address: formData.address || '',
      bin: formData.bin || '',
      circle: formData.circle || '১',
      hearingDate: formData.hearingDate || '',
      hearingTime: formData.hearingTime || '',
      hearingLocation: formData.hearingLocation || '',
      subject: formData.subject || '',
      caseOrDemandRef: formData.caseOrDemandRef || '',
      demandedAmountTaka: Number(formData.demandedAmountTaka) || 0,
      requiredDocuments: formData.requiredDocuments || '',
      signatoryName: formData.signatoryName || '',
      signatoryDesignation: formData.signatoryDesignation || '',
      status
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                শুনানীর চিঠি ও অফিসিয়াল নোটিশ প্রস্তুতকারক
              </h2>
              <p className="text-xs text-slate-500">
                জাতীয় রাজস্ব বোর্ড ও কাস্টমস বন্ড কমিশনারেটের সরকারি মানদণ্ডে শুনানির চিঠি প্রস্তুত ও প্রিন্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
              className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              {activeTab === 'edit' ? '👁️ অফিসিয়াল প্রিভিউ দেখুন' : '✏️ তথ্য সম্পাদনা করুন'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Edit Form */}
        {activeTab === 'edit' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            
            {/* Quick Auto-Fill from Registered Companies */}
            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-bold text-indigo-950 dark:text-indigo-200 text-xs">
                <Building2 className="w-4 h-4 text-indigo-600" />
                নিবন্ধিত প্রতিষ্ঠান হতে স্বয়ংক্রিয়ভাবে তথ্য লোড করুন:
              </div>
              <select
                onChange={e => handleSelectCompany(e.target.value)}
                value={formData.companyName || ''}
                className="px-3 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none"
              >
                <option value="">-- প্রতিষ্ঠান নির্বাচন করুন --</option>
                {companies.map(c => (
                  <option key={c.id} value={c.companyName}>
                    {c.companyName} (সার্কেল-{toBengaliNumber(c.circle)})
                  </option>
                ))}
              </select>
            </div>

            {/* Linked Company & Officer Info Banner */}
            {companies.find(c => c.companyName.trim().toLowerCase() === (formData.companyName || '').trim().toLowerCase()) && (() => {
              const matched = companies.find(c => c.companyName.trim().toLowerCase() === (formData.companyName || '').trim().toLowerCase())!;
              return (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-indigo-950 dark:text-indigo-200 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>সংযুক্ত প্রতিষ্ঠান: {matched.companyName}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                      সার্কেল-{toBengaliNumber(matched.circle)} | বকেয়া: ৳{formatTaka(matched.arrearsTaka || 0)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400">ARO:</span>{' '}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{matched.officerARO || 'নিযুক্ত নেই'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">RO:</span>{' '}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{matched.officerRO || 'নিযুক্ত নেই'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">AC/DC:</span>{' '}
                      <span className="font-semibold text-indigo-700 dark:text-indigo-300">{matched.officerAC_DC || 'নিযুক্ত নেই'}</span>
                    </div>
                  </div>
                  {matched.commercialManagerName && (
                    <div className="text-[11px] text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/50 flex items-center justify-between">
                      <span>ম্যানেজার: <strong>{matched.commercialManagerName}</strong></span>
                      {matched.commercialManagerMobile && <span>মোবাইল: {matched.commercialManagerMobile}</span>}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Row 1: স্মারক নং ও তারিখ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  স্মারক নম্বর (অফিসিয়াল নথি স্মারক) *
                </label>
                <input
                  type="text"
                  value={formData.memoNo || ''}
                  onChange={e => setFormData({ ...formData, memoNo: e.target.value })}
                  placeholder="যেমন: ০৮.০১.০০০০.০১২.০৩.০০১.২৬-১০৫"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  নোটিশ জারির তারিখ *
                </label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 2: প্রতিষ্ঠান ও সার্কেল */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  প্রতিষ্ঠানের নাম ও প্রাপক *
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="যেমন: মেসার্স ডেল্টা টেক্সটাইল মিলস লিমিটেড"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সার্কেল
                </label>
                <input
                  type="text"
                  value={formData.circle || ''}
                  onChange={e => setFormData({ ...formData, circle: e.target.value })}
                  placeholder="যেমন: ১ বা ২"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 3: ঠিকানা ও বিআইএন */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  প্রতিষ্ঠানের কারখানা / অফিসের ঠিকানা
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="যেমন: কোনাবাড়ী, গাজীপুর"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিআইএন (BIN) নম্বর
                </label>
                <input
                  type="text"
                  value={formData.bin || ''}
                  onChange={e => setFormData({ ...formData, bin: e.target.value })}
                  placeholder="যেমন: 001234567-0101"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 4: শুনানির সময়সূচি */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                শুনানির তারিখ, সময় ও স্থান
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-950 dark:text-amber-200 mb-1">
                    শুনানির তারিখ *
                  </label>
                  <input
                    type="date"
                    value={formData.hearingDate || ''}
                    onChange={e => setFormData({ ...formData, hearingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-950 dark:text-amber-200 mb-1">
                    শুনানির সময় *
                  </label>
                  <input
                    type="text"
                    value={formData.hearingTime || ''}
                    onChange={e => setFormData({ ...formData, hearingTime: e.target.value })}
                    placeholder="যেমন: সকাল ১১:০০ ঘটিকা"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-950 dark:text-amber-200 mb-1">
                    দাবীকৃত রাজস্ব (টাকা)
                  </label>
                  <input
                    type="number"
                    value={formData.demandedAmountTaka || 0}
                    onChange={e => setFormData({ ...formData, demandedAmountTaka: parseFloat(e.target.value) || 0 })}
                    placeholder="যেমন: 45000000"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-950 dark:text-amber-200 mb-1">
                  শুনানির স্থান (কক্ষ ও দপ্তর) *
                </label>
                <input
                  type="text"
                  value={formData.hearingLocation || ''}
                  onChange={e => setFormData({ ...formData, hearingLocation: e.target.value })}
                  placeholder="যেমন: উপ-কমিশনারের কার্যালয় (কক্ষ নং- ৩০২), কাস্টমস বন্ড কমিশনারেট"
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 5: বিষয় ও সূত্র */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                চিঠির বিষয় (Subject) *
              </label>
              <input
                type="text"
                value={formData.subject || ''}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                সূত্র / নথি নং / এসসিএন নং (Reference) *
              </label>
              <input
                type="text"
                value={formData.caseOrDemandRef || ''}
                onChange={e => setFormData({ ...formData, caseOrDemandRef: e.target.value })}
                placeholder="যেমন: নথি নং- ০৮/বকেয়া/কাস্টমস/২০২৬, তাং- ১৫/০১/২০২৬"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Row 6: দলিলাদি */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                শুনানিতে উপস্থাপনীয় প্রয়োজনীয় দলিলাদির তালিকা
              </label>
              <textarea
                rows={4}
                value={formData.requiredDocuments || ''}
                onChange={e => setFormData({ ...formData, requiredDocuments: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Row 7: স্বাক্ষরকারী কর্মকর্তা */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শুনানি গ্রহণকারী কর্মকর্তার নাম *
                </label>
                <input
                  type="text"
                  value={formData.signatoryName || ''}
                  onChange={e => setFormData({ ...formData, signatoryName: e.target.value })}
                  placeholder="যেমন: মাহফুজুর রহমান"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  কর্মকর্তার পদবি ও দপ্তর *
                </label>
                <input
                  type="text"
                  value={formData.signatoryDesignation || ''}
                  onChange={e => setFormData({ ...formData, signatoryDesignation: e.target.value })}
                  placeholder="যেমন: উপ-কমিশনার, সার্কেল-১, কাস্টমস বন্ড কমিশনারেট"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Official Letter Preview */}
        {activeTab === 'preview' && (
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            
            {/* Quick Action Toolbar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="text-xs font-semibold text-slate-500">
                অফিসিয়াল সরকারি ছকে প্রিন্ট ও কপি করুন:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'টেক্সট কপি'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট / PDF সংরক্ষণ</span>
                </button>
              </div>
            </div>

            {/* Printable Formal Letter */}
            <div 
              id="hearing-letter-printable"
              className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm font-serif max-w-2xl mx-auto text-sm leading-relaxed"
            >
              {/* National Emblem / Govt Header */}
              <div className="text-center space-y-1 mb-8">
                <div className="text-xs tracking-wider uppercase font-semibold text-slate-600">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
                <div className="text-base font-bold text-slate-950">কাস্টমস বন্ড কমিশনারেট</div>
                <div className="text-xs text-slate-700">সার্কেল-{toBengaliNumber(formData.circle)} শাখা</div>
                <div className="text-[11px] text-slate-500">৩৪২/১, সেগুনবাগিচা, ঢাকা-১০০০</div>
              </div>

              {/* Memo & Date */}
              <div className="flex justify-between items-center text-xs font-mono border-b border-slate-300 pb-2 mb-6">
                <div>স্মারক নং: <b>{formData.memoNo || '০৮.০১.০০০০.০১২.০৩.০০১.২৬'}</b></div>
                <div>তারিখ: <b>{formData.date ? toBengaliNumber(formData.date) : '—'}</b></div>
              </div>

              {/* To Recipient */}
              <div className="mb-6 space-y-0.5 text-xs">
                <div className="font-semibold">প্রাপক:</div>
                <div className="font-bold text-sm">{formData.companyName || 'ব্যবস্থাপনা পরিচালক'}</div>
                <div>কারখানা / অফিস: {formData.address || '—'}</div>
                <div>বিআইএন (BIN): {formData.bin || '—'}</div>
              </div>

              {/* Subject & Reference */}
              <div className="mb-5 space-y-1">
                <div className="font-bold underline text-slate-900">
                  বিষয়: {formData.subject}
                </div>
                <div className="text-xs text-slate-700">
                  সূত্র: {formData.caseOrDemandRef || 'দাবীনামা নথি'}
                </div>
              </div>

              {/* Letter Body */}
              <div className="text-xs leading-relaxed text-justify space-y-3 mb-6">
                <p>
                  মহোদয়,
                  <br />
                  উপর্যুক্ত বিষয় ও সূত্রের প্রেক্ষিতে জানানো যাচ্ছে যে, আপনার প্রতিষ্ঠানের অনুকূলে শুল্কমুক্ত সুবিধায় আমদানিকৃত বন্ডেড কাঁচামালের অনিয়ম এবং দাবীকৃত রাজস্ব <b>{formatTaka(formData.demandedAmountTaka || 0)}</b> সংক্রান্ত বিষয়টি শুনানিপূর্বক চূড়ান্ত নিষ্পত্তির লক্ষ্যে নিম্নবর্ণিত সময়সূচি অনুযায়ী শুনানির দিন ধার্য করা হয়েছে:
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-sans space-y-1 my-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold min-w-[120px]">১. শুনানির তারিখ:</span>
                    <span className="font-bold text-indigo-700">{formData.hearingDate ? toBengaliNumber(formData.hearingDate) : 'নির্ধারিত হয়নি'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold min-w-[120px]">২. শুনানির সময়:</span>
                    <span>{formData.hearingTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold min-w-[120px]">৩. শুনানির স্থান:</span>
                    <span>{formData.hearingLocation}</span>
                  </div>
                </div>

                <p>
                  এমতাবস্থায়, শুনানিতে যথাসময়ে স্বয়ং অথবা ক্ষমতাপ্রাপ্ত আইনানুগ প্রতিনিধির মাধ্যমে নিম্নবর্ণিত যাবতীয় মূল কাগজপত্রসহ উপস্থিত থাকার জন্য অনুরোধ করা হলো:
                </p>

                <div className="pl-4 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-700">
                  {formData.requiredDocuments}
                </div>

                <p className="text-[11px] text-slate-600 italic pt-2">
                  উল্লেখ্য, নির্ধারিত তারিখে শুনানিতে উপস্থিত হতে ব্যর্থ হলে অথবা কোনো সন্তোষজনক কারণ ব্যতিরেকে অনুপস্থিত থাকলে আপনার কোনো বক্তব্য নেই মর্মে গণ্য করে নথিতে রক্ষিত কাগজপত্রের ভিত্তিতে আইন অনুযায়ী একতরফা চূড়ান্ত সিদ্ধান্ত গ্রহণ করা হবে।
                </p>
              </div>

              {/* Signatory */}
              <div className="mt-12 flex justify-end text-center">
                <div className="inline-block border-t border-dotted border-slate-600 pt-2 min-w-[220px] text-xs">
                  <div className="font-bold">({formData.signatoryName || 'কর্মকর্তার স্বাক্ষর'})</div>
                  <div className="text-slate-600 text-[11px]">{formData.signatoryDesignation}</div>
                  <div className="text-slate-500 text-[10px]">ফোন: ০২-২২২২২২২২</div>
                </div>
              </div>

              {/* Copy Forwarded */}
              <div className="mt-10 pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                <div className="font-semibold text-slate-700">সদয় অবগতি ও প্রয়োজনীয় কার্যার্থে অনুলিপি প্রেরিত হলো:</div>
                <div>১. কমিশনার, কাস্টমস বন্ড কমিশনারেট, ঢাকা (মহোদয়ের সদয় অবগতির জন্য)।</div>
                <div>২. অতিরিক্ত কমিশনার / যুগ্ম কমিশনার, কাস্টমস বন্ড কমিশনারেট।</div>
                <div>৩. সংশ্লিষ্ট রাজস্ব কর্মকর্তা (আরও) / সহকারী রাজস্ব কর্মকর্তা (এআরও), সার্কেল-{toBengaliNumber(formData.circle)}।</div>
                <div>৪. গার্ড ফাইল / অফিস কপি।</div>
              </div>

            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            বাতিল
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveNotice('draft')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              খসড়া সংরক্ষণ (Draft)
            </button>
            <button
              type="button"
              onClick={() => handleSaveNotice('issued')}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>নোটিশ জারি ও সংরক্ষণ (Issue Notice)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
