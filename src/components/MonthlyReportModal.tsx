import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Printer, 
  FileSpreadsheet, 
  ClipboardCheck, 
  Check, 
  SlidersHorizontal,
  Building2,
  FileText,
  Sparkles,
  CheckSquare,
  Square,
  Search,
  Eye,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CaseRecord } from '../types/case';
import { toBengaliNumber, formatCrore, formatTaka } from '../utils/converter';
import { printMonthlyCaseReport } from '../utils/printReport';
import { exportMonthlyReportToDocx } from '../utils/docxExport';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: CaseRecord[];
}

const MONTH_NAMES = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 
  'মে', 'জুন', 'জুলাই', 'আগস্ট', 
  'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  cases,
}) => {
  const currentMonthIdx = new Date().getMonth();
  const currentYearBn = toBengaliNumber(new Date().getFullYear());

  const [selectedMonth, setSelectedMonth] = useState<string>(MONTH_NAMES[currentMonthIdx]);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearBn);
  const [title, setTitle] = useState<string>('মাননীয় আদালতে বিচারাধীন গুরুত্বপূর্ণ মামলার তথ্য');
  const [officeName, setOfficeName] = useState<string>('কাস্টমস বন্ড কমিশনারেট, ঢাকা (দক্ষিণ), ঢাকা।');
  const [formatMode, setFormatMode] = useState<'official3Col' | 'fullAudit8Col' | 'fullAudit'>('official3Col');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [circleFilter, setCircleFilter] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Default to selecting all cases or top active cases
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>(() => {
    return cases.map(c => c.id);
  });

  // Filter cases for the modal table selector
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        c.companyName.toLowerCase().includes(q) || 
        (c.address && c.address.toLowerCase().includes(q)) || 
        (c.caseNo && c.caseNo.toLowerCase().includes(q)) ||
        (c.court && c.court.toLowerCase().includes(q));

      const matchCircle = circleFilter === 'all' || 
        String(c.circle || '').replace(/[^0-9০-৯]/g, '') === circleFilter ||
        toBengaliNumber(String(c.circle || '').replace(/[^0-9০-৯]/g, '')) === circleFilter;

      return matchSearch && matchCircle;
    });
  }, [cases, searchQuery, circleFilter]);

  // Selected cases in order
  const activeCases = useMemo(() => {
    return cases.filter(c => selectedCaseIds.includes(c.id));
  }, [cases, selectedCaseIds]);

  if (!isOpen) return null;

  const toggleSelectOne = (id: string) => {
    setSelectedCaseIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredCases.map(c => c.id);
    setSelectedCaseIds(prev => Array.from(new Set([...prev, ...ids])));
  };

  const deselectAllFiltered = () => {
    const idsToRemove = new Set(filteredCases.map(c => c.id));
    setSelectedCaseIds(prev => prev.filter(id => !idsToRemove.has(id)));
  };

  // Preset: "অফিসের ১৬টি গুরুত্বপূর্ণ মামলা" (from user's official sheet)
  const selectOfficialPreset16 = () => {
    const keyCompanies = ['দেশবন্ধু সুগার', 'আব্দুল মোনেম সুগার', 'সাউথ চায়না', 'হপইক বিডি'];
    const matched = cases.filter(c => 
      keyCompanies.some(k => c.companyName.includes(k))
    ).slice(0, 16);
    setSelectedCaseIds(matched.map(c => c.id));
  };

  const monthYearString = `${selectedMonth}, ${selectedYear} খ্রি.`;

  // 1. Trigger Official Print
  const handlePrint = () => {
    if (activeCases.length === 0) return;
    printMonthlyCaseReport(activeCases, {
      title,
      officeName,
      monthYear: monthYearString,
      formatMode: formatMode === 'official3Col' ? 'official3Col' : 'fullAudit'
    });
  };

  // 2. Export to Word (.docx)
  const handleExportDocx = async () => {
    if (activeCases.length === 0) return;
    await exportMonthlyReportToDocx(activeCases, {
      title,
      officeName,
      monthYear: monthYearString,
      formatMode: formatMode === 'fullAudit8Col' ? 'fullAudit8Col' : 'official3Col',
      fileName: `মাসিক_মামলার_তথ্য_${selectedMonth}_${selectedYear}.docx`
    });
  };

  // 3. Export to Excel
  const handleExportExcel = () => {
    if (activeCases.length === 0) return;

    let rows: Record<string, any>[] = [];

    if (formatMode === 'official3Col') {
      rows = activeCases.map((c, idx) => ({
        'ক্র. নং': `${toBengaliNumber(idx + 1)}.`,
        'পিটিশনার/সরকারের প্রতিপক্ষের নাম ঠিকানা': `${c.companyName}${c.address ? `, ${c.address}` : ''}`,
        'মামলা নম্বর': c.caseNo || `${c.caseType} (${toBengaliNumber(c.caseYear)})`
      }));
    } else if (formatMode === 'fullAudit8Col') {
      rows = activeCases.map((c, idx) => ({
        'ক্র. নং': `${toBengaliNumber(idx + 1)}.`,
        'পিটিশনার/সরকারের প্রতিপক্ষের নাম ঠিকানা': `${c.companyName}${c.address ? `, ${c.address}` : ''}`,
        'মামলা নম্বর': c.caseNo || `${c.caseType} (${toBengaliNumber(c.caseYear)})`,
        'মামলার বিষয়বস্তু ও বকেয়ার উদ্ভবের কারণ': c.description || 'বন্ড সুবিধায় কাঁচামাল সংক্রান্ত',
        'বকেয়ার পরিমাণ (কোটি টাকা)': (c.amountCrore || 0).toFixed(2),
        'কোন আদালতে মামলাধীন রয়েছে': c.courtHierarchy || (c.court.includes('সুপ্রিম') ? c.court : `মাননীয় সুপ্রিম কোর্টের ${c.court} বিভাগ`),
        'সংশ্লিষ্ট বকেয়া উদ্ভবের সময়কাল': c.originPeriod || `${toBengaliNumber(c.caseYear)} সাল`,
        'সর্বশেষ পরিস্থিতি': c.latestStatus || 'শুনানি প্রক্রিয়াধীন'
      }));
    } else {
      rows = activeCases.map((c, idx) => ({
        'ক্র. নং': `${toBengaliNumber(idx + 1)}.`,
        'প্রতিষ্ঠানের নাম': c.companyName,
        'ঠিকানা': c.address || '—',
        'সার্কেল': toBengaliNumber(String(c.circle || '').replace(/[^0-9০-৯]/g, '')),
        'মামলা নম্বর': c.caseNo || '—',
        'মামলার সাল': toBengaliNumber(c.caseYear),
        'আদালত': c.court,
        'বকেয়া (কোটি টাকা)': formatCrore(c.amountCrore),
        'বকেয়া (টাকা)': formatTaka(c.amountTaka),
        'সর্বশেষ পরিস্থিতি': c.latestStatus || '—',
        'মন্তব্য': c.remarks || '—'
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'মাসিক_মামলার_তথ্য');

    worksheet['!cols'] = formatMode === 'official3Col' 
      ? [{ wch: 8 }, { wch: 45 }, { wch: 30 }]
      : [{ wch: 8 }, { wch: 35 }, { wch: 25 }, { wch: 28 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 30 }];

    XLSX.writeFile(workbook, `মাসিক_মামলার_তথ্য_${selectedMonth}_${selectedYear}.xlsx`);
  };

  // 3. Copy to Clipboard (TSV)
  const handleCopy = () => {
    if (activeCases.length === 0) return;

    let text = `${title}\n${officeName}\n${monthYearString}\n\n`;

    if (formatMode === 'official3Col') {
      text += 'ক্র. নং\tপিটিশনার/সরকারের প্রতিপক্ষের নাম ঠিকানা\tমামলা নম্বর\n';
      activeCases.forEach((c, idx) => {
        const partyAndAddress = `${c.companyName}${c.address ? `, ${c.address}` : ''}`;
        const caseNumber = c.caseNo || `${c.caseType} (${toBengaliNumber(c.caseYear)})`;
        text += `${toBengaliNumber(idx + 1)}.\t${partyAndAddress}\t${caseNumber}\n`;
      });
    } else {
      text += 'ক্র. নং\tপ্রতিষ্ঠানের নাম\tসার্কেল\tমামলা নম্বর\tআদালত\tবকেয়া (কোটি টাকা)\tবকেয়া (টাকা)\tসর্বশেষ পরিস্থিতি\n';
      activeCases.forEach((c, idx) => {
        text += `${toBengaliNumber(idx + 1)}.\t${c.companyName}\t${c.circle}\t${c.caseNo || '—'}\t${c.court}\t${formatCrore(c.amountCrore)}\t${formatTaka(c.amountTaka)}\t${c.latestStatus || '—'}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  মাসিক মামলার তথ্য প্রতিবেদন
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                  অফিসিয়াল ফরম্যাট
                </span>
              </div>
              <p className="text-xs text-slate-500">
                প্রতি মাসে ঊর্ধ্বতন কর্তৃপক্ষে জমা দেওয়ার জন্য নির্ধারিত সরকারি ছকে মামলার তথ্য প্রস্তুত ও মুদ্রণ
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

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* 1. Official Header & Month Configuration Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-500" />
                প্রতিবেদনের শিরোনাম ও দপ্তরের তথ্য
              </span>
              <span className="text-[11px] text-slate-400">সরকারি নথিপত্রের জন্য</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  প্রধান শিরোনাম
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="যেমন: মাননীয় আদালতে বিচারাধীন গুরুত্বপূর্ণ মামলার তথ্য"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  কমিশনারেট / দপ্তরের নাম
                </label>
                <input
                  type="text"
                  value={officeName}
                  onChange={e => setOfficeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="যেমন: কাস্টমস বন্ড কমিশনারেট, ঢাকা (দক্ষিণ), ঢাকা।"
                />
              </div>
            </div>

            {/* Month & Format Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  মাসের নাম
                </label>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {MONTH_NAMES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  সাল / বছর
                </label>
                <input
                  type="text"
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="২০২৬"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  ছক বা ফরম্যাট ধরণ
                </label>
                <select
                  value={formatMode}
                  onChange={e => setFormatMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-indigo-600 dark:text-indigo-400"
                >
                  <option value="official3Col">📋 ৩-কলাম অফিসিয়াল ছক (সংযুক্ত ১ম নথির হুবহু ফরম্যাট)</option>
                  <option value="fullAudit8Col">📑 ৮-কলাম পূর্ণাঙ্গ ছক ও রাজস্ব ফুটনোট (সংযুক্ত ২য় নথির হুবহু সরকারি ফরম্যাট)</option>
                  <option value="fullAudit">📊 সাধারণ রাজস্ব ও নিরীক্ষা ছক (কোটি টাকা সহ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Quick Preset Selection */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">কুইক সিলেক্ট:</span>
              <button
                type="button"
                onClick={selectOfficialPreset16}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-xs transition-colors flex items-center gap-1"
                title="দেশবন্ধু, আব্দুল মোনেম, সাউথ চায়না ও হপইক বিডির মামলাসমূহ"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                অফিসের গুরুত্বপূর্ণ ১৬টি মামলার সেট
              </button>
              <button
                type="button"
                onClick={() => setSelectedCaseIds(cases.map(c => c.id))}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
              >
                সকল মামলা ({toBengaliNumber(cases.length)})
              </button>
            </div>

            <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
              নির্বাচিত: {toBengaliNumber(activeCases.length)} টি মামলা
            </div>
          </div>

          {/* 3. Search and Case Selection Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="প্রতিষ্ঠান, ঠিকানা বা মামলা নং দিয়ে খুঁজুন..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={circleFilter}
                  onChange={e => setCircleFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                >
                  <option value="all">সকল সার্কেল</option>
                  <option value="১">সার্কেল ১</option>
                  <option value="২">সার্কেল ২</option>
                  <option value="৩">সার্কেল ৩</option>
                  <option value="৪">সার্কেল ৪</option>
                  <option value="৫">সার্কেল ৫</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  ফিল্টারকৃত সবগুলো নির্বাচন
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={deselectAllFiltered}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                >
                  নির্বাচন বাতিল
                </button>
              </div>
            </div>

            {/* List of cases */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCases.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  কোনো মামলা পাওয়া যায়নি।
                </div>
              ) : (
                filteredCases.map((c, idx) => {
                  const isChecked = selectedCaseIds.includes(c.id);
                  const pureCircle = String(c.circle || '').replace(/[^0-9০-৯]/g, '') || '১';
                  return (
                    <div 
                      key={c.id}
                      onClick={() => toggleSelectOne(c.id)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isChecked ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <button type="button" className="text-slate-400 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>

                      <div className="w-7 text-center font-bold text-slate-400 bengali-num">
                        {toBengaliNumber(idx + 1)}.
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {c.companyName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {c.address ? `${c.address} • ` : ''}সার্কেল: {toBengaliNumber(pureCircle)}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs case-number-badge">
                          {c.caseNo || '—'}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400">
                          {c.court}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 4. Live Official Format Preview Header Box */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-center">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {title}
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              {officeName}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              মাসিক প্রতিবেদন: <strong>{monthYearString}</strong> | অন্তর্ভুক্ত মামলার সংখ্যা: <strong>{toBengaliNumber(activeCases.length)} টি</strong>
            </div>
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
          <div className="text-xs text-slate-500">
            {activeCases.length === 0 ? (
              <span className="text-rose-500 font-semibold">কমপক্ষে একটি মামলা নির্বাচন করুন</span>
            ) : (
              <span>মুদ্রণ বা এক্সপোর্টের জন্য প্রস্তুত ({toBengaliNumber(activeCases.length)} টি)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={activeCases.length === 0}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Word বা Google Docs-এ পেস্ট করতে কপি করুন"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <ClipboardCheck className="w-4 h-4" />}
              <span>{copied ? 'কপি হয়েছে!' : 'ক্লিপবোর্ডে কপি'}</span>
            </button>

            {/* Word (.docx) Download */}
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={activeCases.length === 0}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="মাইক্রোসফট ওয়ার্ড (.docx) ফরম্যাটে ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
              <span>Word (.docx) ডাউনলোড</span>
            </button>

            {/* Excel Download */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={activeCases.length === 0}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="সরকারি ছকে এক্সেল ফাইল ডাউনলোড"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel ডাউনলোড</span>
            </button>

            {/* Direct Official Print / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={activeCases.length === 0}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="ছবিতে প্রদর্শিত সরকারি ৩-কলাম ছকে সরাসরি প্রিন্ট বা PDF সেভ করুন"
            >
              <Printer className="w-4 h-4" />
              <span>অফিসিয়াল প্রিন্ট / PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
