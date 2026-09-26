import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  Calendar, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Scale, 
  Building2, 
  Plus, 
  ArrowUpRight, 
  CheckSquare, 
  Download,
  AlertTriangle,
  ChevronRight,
  ClipboardCheck,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CaseRecord } from '../types/case';
import { formatCrore, formatTaka, toBengaliNumber } from '../utils/converter';
import { exportMonthlyMovementReturnDocx } from '../utils/docxExport';
import { printCaseTable } from '../utils/printReport';

interface MonthlyDynamicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: CaseRecord[];
  onUpdateCase: (updated: CaseRecord) => void;
}

const MONTH_NAMES = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 
  'মে', 'জুন', 'জুলাই', 'আগস্ট', 
  'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const MonthlyDynamicsModal: React.FC<MonthlyDynamicsModalProps> = ({
  isOpen,
  onClose,
  cases,
  onUpdateCase,
}) => {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentYearBn = toBengaliNumber(currentYear);

  const [selectedMonth, setSelectedMonth] = useState<string>(MONTH_NAMES[currentMonthIdx]);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearBn);
  const [officeName, setOfficeName] = useState<string>('কাস্টমস বন্ড কমিশনারেট, ঢাকা (দক্ষিণ), ঢাকা।');
  const [activeTab, setActiveTab] = useState<'newCases' | 'disposedCases' | 'revenueAnalysis' | 'monthlyReturn'>('monthlyReturn');
  
  // Quick Settle Modal State
  const [settlingCase, setSettlingCase] = useState<CaseRecord | null>(null);
  const [settleOutcome, setSettleOutcome] = useState<string>('সরকারের পক্ষে নিষ্পত্তি');
  const [settleAmountTaka, setSettleAmountTaka] = useState<number>(0);
  const [settleDetails, setSettleDetails] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // New case selector state
  const [isAddingNewCase, setIsAddingNewCase] = useState<boolean>(false);
  const [selectedCaseToMarkNew, setSelectedCaseToMarkNew] = useState<string>('');

  if (!isOpen) return null;

  const monthYearString = `${selectedMonth}, ${selectedYear} খ্রি.`;

  // Compute New cases for current month (either flagged isNewThisMonth or year 2024/recent)
  const newCases = cases.filter(c => {
    if (c.isNewThisMonth) return true;
    // Auto-detect recent additions if flag not explicitly set
    return c.caseYear === '2024' && (c.id === 'p1-328' || c.id === 'p1-12' || c.caseNo.includes('২০২৪') || c.caseNo.includes('2024'));
  });

  // Compute Disposed cases
  const disposedCases = cases.filter(c => c.isDisposed || c.statusCategory === 'disposed');

  // Compute Pending (Active) cases
  const pendingCases = cases.filter(c => !c.isDisposed && c.statusCategory !== 'disposed');

  // Total Revenue at stake (in active pending cases)
  const totalRevenueAtStakeCrore = pendingCases.reduce((sum, c) => sum + (c.amountCrore || 0), 0);
  const totalRevenueAtStakeTaka = pendingCases.reduce((sum, c) => sum + (c.amountTaka || 0), 0);

  // Revenue from new cases
  const newCasesRevenueCrore = newCases.reduce((sum, c) => sum + (c.amountCrore || 0), 0);

  // Recovered revenue from disposed cases
  const recoveredRevenueTaka = disposedCases.reduce((sum, c) => sum + (c.recoveredAmountTaka || c.amountTaka || 0), 0);
  const recoveredRevenueCrore = recoveredRevenueTaka / 10000000;

  // Case balance movement
  const openingPendingCount = pendingCases.length - newCases.length + disposedCases.length;
  const currentPendingCount = pendingCases.length;

  // Handler: Mark case as New this month
  const handleMarkAsNew = (caseId: string) => {
    const target = cases.find(c => c.id === caseId);
    if (!target) return;
    onUpdateCase({
      ...target,
      isNewThisMonth: true,
      filingDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString()
    });
    setSelectedCaseToMarkNew('');
    setIsAddingNewCase(false);
  };

  // Handler: Remove new tag
  const handleUnmarkNew = (c: CaseRecord) => {
    onUpdateCase({
      ...c,
      isNewThisMonth: false,
      updatedAt: new Date().toISOString()
    });
  };

  // Handler: Confirm Case Disposal
  const handleConfirmDisposal = () => {
    if (!settlingCase) return;
    onUpdateCase({
      ...settlingCase,
      isDisposed: true,
      statusCategory: 'disposed',
      disposalDate: new Date().toISOString().slice(0, 10),
      disposalOutcome: settleOutcome,
      recoveredAmountTaka: Number(settleAmountTaka) || 0,
      disposalSummary: settleDetails || 'মাননীয় আদালতের রায় অনুযায়ী চূড়ান্ত নিষ্পত্তি',
      latestStatus: `নিষ্পত্তি: ${settleOutcome} (${settleDetails || 'আদালতের আদেশ'})`,
      updatedAt: new Date().toISOString()
    });
    setSettlingCase(null);
  };

  // Handler: Restore/Reactivate a disposed case
  const handleReactivateCase = (c: CaseRecord) => {
    onUpdateCase({
      ...c,
      isDisposed: false,
      statusCategory: 'hearing',
      disposalDate: undefined,
      disposalOutcome: undefined,
      recoveredAmountTaka: 0,
      disposalSummary: undefined,
      latestStatus: 'মামলাটি পুনরায় চলমান হিসেবে সক্রিয় করা হয়েছে',
      updatedAt: new Date().toISOString()
    });
  };

  // Export to Word (.docx)
  const handleExportDocx = async () => {
    await exportMonthlyMovementReturnDocx({
      monthYear: monthYearString,
      officeName,
      openingPendingCount,
      newCases,
      disposedCases,
      currentPendingCount,
      totalRevenueAtStakeCrore,
      recoveredRevenueCrore
    });
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();

    // 1. Movement Summary Sheet
    const summaryData = [
      { 'বিবরণ': 'দপ্তরের নাম', 'তথ্য': officeName },
      { 'বিবরণ': 'মাসের নাম / সময়কাল', 'তথ্য': monthYearString },
      { 'বিবরণ': 'মাসের শুরুতে চলমান মামলা (Opening)', 'তথ্য': `${toBengaliNumber(openingPendingCount)} টি` },
      { 'বিবরণ': 'চলতি মাসে নতুন দায়েরকৃত মামলা (+)', 'তথ্য': `${toBengaliNumber(newCases.length)} টি` },
      { 'বিবরণ': 'চলতি মাসে নিষ্পত্তিকৃত মামলা (-)', 'তথ্য': `${toBengaliNumber(disposedCases.length)} টি` },
      { 'বিবরণ': 'বর্তমানে মোট বিচারাধীন মামলা (=)', 'তথ্য': `${toBengaliNumber(currentPendingCount)} টি` },
      { 'বিবরণ': 'বিচারাধীন মামলায় মোট জড়িত রাজস্ব', 'তথ্য': formatCrore(totalRevenueAtStakeCrore) },
      { 'বিবরণ': 'নতুন মামলায় জড়িত রাজস্ব', 'তথ্য': formatCrore(newCasesRevenueCrore) },
      { 'বিবরণ': 'সরকারের অনুকূলে অর্জিত/আদায়কৃত রাজস্ব', 'তথ্য': formatCrore(recoveredRevenueCrore) },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, wsSummary, 'মাসিক_রিটার্ন_সারসংক্ষেপ');

    // 2. New Cases Sheet
    const newCasesRows = newCases.map((c, idx) => ({
      'ক্র.নং': toBengaliNumber(idx + 1),
      'প্রতিষ্ঠানের নাম': c.companyName,
      'ঠিকানা': c.address || '—',
      'মামলা নম্বর': c.caseNo || '—',
      'আদালত': c.court,
      'জড়িত রাজস্ব (কোটি)': formatCrore(c.amountCrore),
      'জড়িত রাজস্ব (টাকা)': formatTaka(c.amountTaka),
      'দায়েরের বিবরণ': c.description || 'বন্ড সংক্রান্ত'
    }));
    const wsNew = XLSX.utils.json_to_sheet(newCasesRows);
    XLSX.utils.book_append_sheet(workbook, wsNew, 'নতুন_মামলা');

    // 3. Disposed Cases Sheet
    const disposedRows = disposedCases.map((c, idx) => ({
      'ক্র.নং': toBengaliNumber(idx + 1),
      'প্রতিষ্ঠানের নাম': c.companyName,
      'মামলা নম্বর': c.caseNo || '—',
      'আদালত': c.court,
      'জড়িত রাজস্ব (কোটি)': formatCrore(c.amountCrore),
      'আদায়কৃত রাজস্ব (টাকা)': formatTaka(c.recoveredAmountTaka || 0),
      'নিষ্পত্তির ফলাফল': c.disposalOutcome || 'সরকারের অনুকূলে',
      'নিষ্পত্তির আদেশ': c.disposalSummary || c.latestStatus
    }));
    const wsDisposed = XLSX.utils.json_to_sheet(disposedRows);
    XLSX.utils.book_append_sheet(workbook, wsDisposed, 'নিষ্পত্তিকৃত_মামলা');

    XLSX.writeFile(workbook, `মাসিক_মামলা_প্রবাহ_রিটার্ন_${selectedMonth}_${selectedYear}.xlsx`);
  };

  // Direct Print
  const handlePrint = () => {
    printCaseTable(newCases.length > 0 ? newCases : pendingCases, {
      title: `চলতি মাসের মামলা প্রবাহ ও রাজস্ব প্রতিবেদন (${monthYearString})`,
      subtitle: officeName
    });
  };

  // Copy Summary text
  const handleCopySummary = () => {
    const text = `
গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
${officeName}
মাসিক মামলা গতিশীলতা ও রাজস্ব রিটার্ন (${monthYearString})
--------------------------------------------------------
১. মাসের শুরুতে চলমান মামলা: ${toBengaliNumber(openingPendingCount)} টি
২. চলতি মাসে নতুন মামলা (+): ${toBengaliNumber(newCases.length)} টি (জড়িত রাজস্ব: ${formatCrore(newCasesRevenueCrore)})
৩. চলতি মাসে নিষ্পত্তিকৃত মামলা (-): ${toBengaliNumber(disposedCases.length)} টি (আদায়কৃত রাজস্ব: ${formatCrore(recoveredRevenueCrore)})
৪. বর্তমানে মোট বিচারাধীন মামলা: ${toBengaliNumber(currentPendingCount)} টি
৫. বিচারাধীন মোট জড়িত রাজস্ব: ${formatCrore(totalRevenueAtStakeCrore)} (টাকা: ${formatTaka(totalRevenueAtStakeTaka)})
--------------------------------------------------------
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50/80 via-white to-indigo-50/50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  মাসিক মামলা গতিশীলতা ও রাজস্ব রিটার্ন
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                  নতুন • জড়িত রাজস্ব • নিষ্পত্তি
                </span>
              </div>
              <p className="text-xs text-slate-500">
                চলতি মাসে নতুন মামলা, রাজস্ব স্থিতি ও নিষ্পত্তিকৃত মামলার মাসিক রিটার্ন তৈরি ও ট্র্যাকিং
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

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* Top Month & Office Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">সময়কাল:</span>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {MONTH_NAMES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-20 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-slate-100 text-center focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md min-w-[240px]">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={officeName}
                onChange={e => setOfficeName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
                placeholder="দপ্তরের নাম"
              />
            </div>
          </div>

          {/* KPI Dashboard Cards (4 Key Metrics) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. New Cases */}
            <div 
              onClick={() => setActiveTab('newCases')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'newCases' 
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm' 
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="font-semibold text-[11px] text-blue-700 dark:text-blue-300">এ মাসে নতুন মামলা</span>
                <span className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 flex items-center justify-center font-bold">
                  +
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                {toBengaliNumber(newCases.length)} <span className="text-xs font-normal text-slate-500">টি</span>
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                জড়িত: {formatCrore(newCasesRevenueCrore)}
              </div>
            </div>

            {/* 2. Total Revenue at Stake */}
            <div 
              onClick={() => setActiveTab('revenueAnalysis')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'revenueAnalysis' 
                  ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-sm' 
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="font-semibold text-[11px] text-amber-700 dark:text-amber-300">মামলায় মোট জড়িত রাজস্ব</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {formatCrore(totalRevenueAtStakeCrore)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1 truncate">
                মূল টাকা: {formatTaka(totalRevenueAtStakeTaka)}
              </div>
            </div>

            {/* 3. Disposed Cases */}
            <div 
              onClick={() => setActiveTab('disposedCases')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'disposedCases' 
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-sm' 
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-300">এ মাসে নিষ্পত্তিকৃত মামলা</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                {toBengaliNumber(disposedCases.length)} <span className="text-xs font-normal text-slate-500">টি</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                আদায়: {formatCrore(recoveredRevenueCrore)}
              </div>
            </div>

            {/* 4. Active Closing Pending Cases */}
            <div 
              onClick={() => setActiveTab('monthlyReturn')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'monthlyReturn' 
                  ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700 shadow-sm' 
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="font-semibold text-[11px] text-purple-700 dark:text-purple-300">মোট চলমান বিচারাধীন</span>
                <Scale className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl font-black text-purple-700 dark:text-purple-300">
                {toBengaliNumber(currentPendingCount)} <span className="text-xs font-normal text-slate-500">টি মামলা</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                পূর্বের স্থিতি: {toBengaliNumber(openingPendingCount)} টি
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('monthlyReturn')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'monthlyReturn'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>মাসিক রিটার্ন সারসংক্ষেপ</span>
            </button>

            <button
              onClick={() => setActiveTab('newCases')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'newCases'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন মামলা ({toBengaliNumber(newCases.length)})</span>
            </button>

            <button
              onClick={() => setActiveTab('disposedCases')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'disposedCases'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>নিষ্পত্তিকৃত মামলা ({toBengaliNumber(disposedCases.length)})</span>
            </button>

            <button
              onClick={() => setActiveTab('revenueAnalysis')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'revenueAnalysis'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>জড়িত রাজস্ব ও শীর্ষ খেলাপি</span>
            </button>
          </div>

          {/* TAB 1: MONTHLY RETURN SUMMARY & MOVEMENT FORM */}
          {activeTab === 'monthlyReturn' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Formal Return Table Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>চলতি মাসের সরকারি মামলা প্রবাহ বিবরণী (Movement Return)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {monthYearString}
                  </span>
                </div>

                <div className="p-4">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                        <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center w-12">ক্র.নং</th>
                        <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-left">বিবরণ / খাত</th>
                        <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center w-28">মামলার সংখ্যা</th>
                        <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-right w-36">জড়িত রাজস্ব (কোটি টাকা)</th>
                        <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-left">মন্তব্য / স্থিতি</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center font-bold">১</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 font-semibold">মাসের শুরুতে চলমান মামলা (Opening Balance)</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center font-bold">{toBengaliNumber(openingPendingCount)} টি</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-right font-mono font-bold text-slate-700 dark:text-slate-300">{formatCrore(totalRevenueAtStakeCrore - newCasesRevenueCrore)}</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-slate-500">পূর্ববর্তী মাস হতে আগত</td>
                      </tr>
                      <tr className="bg-blue-50/40 dark:bg-blue-950/20">
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center font-bold text-blue-600">২</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 font-semibold text-blue-700 dark:text-blue-300">(+) চলতি মাসে দায়েরকৃত নতুন মামলা</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center font-bold text-blue-600">{toBengaliNumber(newCases.length)} টি</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-right font-mono font-bold text-blue-600">{formatCrore(newCasesRevenueCrore)}</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-blue-600">{newCases.length > 0 ? 'রিট ও আপীল ট্রাইব্যুনাল' : 'নতুন মামলা নেই'}</td>
                      </tr>
                      <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center font-bold text-emerald-600">৩</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 font-semibold text-emerald-700 dark:text-emerald-300">(-) চলতি মাসে নিষ্পত্তিকৃত মামলা</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center font-bold text-emerald-600">{toBengaliNumber(disposedCases.length)} টি</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-right font-mono font-bold text-emerald-600">{formatCrore(recoveredRevenueCrore)}</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-emerald-600">আদায়কৃত/উদ্ধারকৃত রাজস্ব</td>
                      </tr>
                      <tr className="bg-slate-100/70 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-slate-100">
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">৪</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700">(=) মাসের শেষে মোট বিচারাধীন মামলা (Closing Balance)</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center text-indigo-600 dark:text-indigo-400 text-sm">{toBengaliNumber(currentPendingCount)} টি</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-right font-mono text-indigo-600 dark:text-indigo-400 text-sm">{formatCrore(totalRevenueAtStakeCrore)}</td>
                        <td className="p-2.5 border border-slate-200 dark:border-slate-700">পরবর্তী মাসে স্থানান্তরিত</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Instructions and Actions */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-indigo-950 dark:text-indigo-200 text-xs">
                    প্রতিবেদন তৈরি ও ফাইল সংরক্ষণ:
                  </div>
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                    এই রিটার্নটি সরাসরি Word (.docx) ফাইল হিসেবে ডাউনলোড করে স্মারক নং ও স্বাক্ষর সংযুক্ত করতে পারবেন।
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportDocx}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Word (.docx) রিটার্ন ডাউনলোড
                  </button>
                  <button
                    onClick={handleCopySummary}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <ClipboardCheck className="w-3.5 h-3.5" />}
                    <span>{copied ? 'কপি সম্পন্ন!' : 'সারসংক্ষেপ কপি'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEW CASES LIST & ADDITION */}
          {activeTab === 'newCases' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    চলতি মাসে নতুন দায়েরকৃত মামলাসমূহ ({toBengaliNumber(newCases.length)} টি)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    এ মাসে রাজস্ব দপ্তর বা কমিশনারেটের বিরুদ্ধে কিংবা পক্ষে দায়ের হওয়া মামলা
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingNewCase(prev => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>অন্য মামলাকে নতুন হিসেবে চিহ্নিত করুন</span>
                </button>
              </div>

              {/* Add New Case Selector dropdown */}
              {isAddingNewCase && (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-xs">
                    ডাটাবেস থেকে মামলা নির্বাচন করুন:
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCaseToMarkNew}
                      onChange={e => setSelectedCaseToMarkNew(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                    >
                      <option value="">-- মামলা নির্বাচন করুন --</option>
                      {pendingCases.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} | {c.caseNo} | {formatCrore(c.amountCrore)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleMarkAsNew(selectedCaseToMarkNew)}
                      disabled={!selectedCaseToMarkNew}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs disabled:opacity-50 transition-colors"
                    >
                      যুক্ত করুন
                    </button>
                    <button
                      onClick={() => setIsAddingNewCase(false)}
                      className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              )}

              {/* Table of New Cases */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 text-center w-12">ক্র.নং</th>
                      <th className="p-3">প্রতিষ্ঠান ও ঠিকানা</th>
                      <th className="p-3">মামলা নম্বর ও সাল</th>
                      <th className="p-3">আদালত</th>
                      <th className="p-3 text-right">জড়িত রাজস্ব (কোটি)</th>
                      <th className="p-3">দায়েরের কারণ / বিবরণ</th>
                      <th className="p-3 text-center w-24">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {newCases.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          চলতি মাসে কোনো নতুন মামলা হিসেবে চিহ্নিত নেই। ওপরের বোতাম ব্যবহার করে যুক্ত করতে পারেন।
                        </td>
                      </tr>
                    ) : (
                      newCases.map((c, idx) => (
                        <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                          <td className="p-3 text-center font-bold text-slate-400">{toBengaliNumber(idx + 1)}.</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{c.companyName}</div>
                            <div className="text-[11px] text-slate-400">{c.address || '—'}</div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                            {c.caseNo || `${c.caseType} (${toBengaliNumber(c.caseYear)})`}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{c.court}</td>
                          <td className="p-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            {formatCrore(c.amountCrore)}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {c.description || 'বন্ড সুবিধায় কাঁচামাল সংক্রান্ত'}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleUnmarkNew(c)}
                              className="text-[11px] text-rose-500 hover:text-rose-700 hover:underline"
                              title="নতুন তালিকা থেকে বাদ দিন"
                            >
                              রিমুভ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DISPOSED CASES & QUICK SETTLE */}
          {activeTab === 'disposedCases' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    চলতি মাসে নিষ্পত্তিকৃত মামলাসমূহ ({toBengaliNumber(disposedCases.length)} টি)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    আদালতের চূড়ান্ত রায়, খারিজ বা সরকারের পক্ষে নিষ্পত্তিকৃত মামলা
                  </p>
                </div>

                {/* Settle a Case Button */}
                <div className="flex items-center gap-2">
                  <select
                    onChange={e => {
                      const found = cases.find(c => c.id === e.target.value);
                      if (found) {
                        setSettlingCase(found);
                        setSettleAmountTaka(found.amountTaka || 0);
                        setSettleDetails(found.latestStatus || '');
                      }
                      e.target.value = '';
                    }}
                    className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold focus:outline-none"
                  >
                    <option value="">+ চলমান মামলা নিষ্পত্তি রেকর্ড করুন</option>
                    {pendingCases.slice(0, 40).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.caseNo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Settle Dialog */}
              {settlingCase && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                      মামলা নিষ্পত্তি বিবরণী পূরণ করুন: <strong>{settlingCase.companyName} ({settlingCase.caseNo})</strong>
                    </span>
                    <button onClick={() => setSettlingCase(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        নিষ্পত্তির ফলাফল
                      </label>
                      <select
                        value={settleOutcome}
                        onChange={e => setSettleOutcome(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                      >
                        <option value="সরকারের পক্ষে নিষ্পত্তি">সরকারের পক্ষে নিষ্পত্তি (Rule Discharged)</option>
                        <option value="আদায় সম্পন্ন পূর্বক নিষ্পত্তি">আদায় সম্পন্ন পূর্বক নিষ্পত্তি</option>
                        <option value="সরকারের বিপক্ষে নিষ্পত্তি">সরকারের বিপক্ষে নিষ্পত্তি</option>
                        <option value="পুনরায় পর্যালোচনার জন্য রিমান্ড">রিমান্ডে প্রেরিত (Remanded)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        সরকারের অনুকূলে আদায়কৃত রাজস্ব (টাকা)
                      </label>
                      <input
                        type="number"
                        value={settleAmountTaka}
                        onChange={e => setSettleAmountTaka(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold focus:outline-none"
                        placeholder="টাকার অংক"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        নিষ্পত্তির রায় / আদেশের বিবরণ
                      </label>
                      <input
                        type="text"
                        value={settleDetails}
                        onChange={e => setSettleDetails(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                        placeholder="রায়ের তারিখ ও সংক্ষিপ্ত সিদ্ধান্ত"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setSettlingCase(null)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={handleConfirmDisposal}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    >
                      নিষ্পত্তি নিশ্চিত করুন
                    </button>
                  </div>
                </div>
              )}

              {/* Table of Disposed Cases */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 text-center w-12">ক্র.নং</th>
                      <th className="p-3">প্রতিষ্ঠান</th>
                      <th className="p-3">মামলা নম্বর</th>
                      <th className="p-3">আদালত</th>
                      <th className="p-3 text-right">দাবিকৃত রাজস্ব</th>
                      <th className="p-3 text-right text-emerald-600">আদায়কৃত রাজস্ব</th>
                      <th className="p-3">নিষ্পত্তির ফলাফল ও আদেশ</th>
                      <th className="p-3 text-center w-24">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {disposedCases.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          চলতি মাসে কোনো মামলা নিষ্পত্তিকৃত হিসেবে রেকর্ড নেই।
                        </td>
                      </tr>
                    ) : (
                      disposedCases.map((c, idx) => (
                        <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                          <td className="p-3 text-center font-bold text-slate-400">{toBengaliNumber(idx + 1)}.</td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{c.companyName}</td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{c.caseNo}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{c.court}</td>
                          <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            {formatCrore(c.amountCrore)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {c.recoveredAmountTaka ? formatTaka(c.recoveredAmountTaka) : '—'}
                          </td>
                          <td className="p-3">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold mr-1">
                              {c.disposalOutcome || 'সরকারের পক্ষে'}
                            </span>
                            <span className="text-slate-500">{c.disposalSummary || c.latestStatus}</span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleReactivateCase(c)}
                              className="text-[11px] text-indigo-600 hover:underline"
                              title="পুনরায় চলমান মামলা হিসেবে স্থানান্তর করুন"
                            >
                              পুনরুজ্জীবিত
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REVENUE AT STAKE ANALYSIS */}
          {activeTab === 'revenueAnalysis' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  মামলায় মোট জড়িত রাজস্ব ও শীর্ষ খেলাপি প্রতিষ্ঠান
                </h3>
                <p className="text-[11px] text-slate-500">
                  সর্বোচ্চ রাজস্ব বকেয়া নিয়ে আদালতে বিচারাধীন শীর্ষ মামলাসমূহ
                </p>
              </div>

              {/* Highlights Cards (Like the footnotes in user's image 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingCases
                  .sort((a, b) => (b.amountCrore || 0) - (a.amountCrore || 0))
                  .slice(0, 4)
                  .map((c, idx) => (
                    <div 
                      key={c.id} 
                      className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                        {toBengaliNumber(idx + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {c.companyName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {c.caseNo} • {c.court}
                        </div>
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-300 mt-1">
                          জড়িত রাজস্ব: {formatCrore(c.amountCrore)} টাকা
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Full Pending Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200">
                  চলমান বিচারাধীন সকল মামলার রাজস্ব তালিকা ({toBengaliNumber(pendingCases.length)} টি)
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/80 sticky top-0 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-2.5 text-center w-12">ক্র.নং</th>
                        <th className="p-2.5">প্রতিষ্ঠানের নাম</th>
                        <th className="p-2.5">মামলা নম্বর</th>
                        <th className="p-2.5">আদালত</th>
                        <th className="p-2.5 text-right">বকেয়া (কোটি টাকা)</th>
                        <th className="p-2.5 text-right">মূল টাকা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pendingCases
                        .sort((a, b) => (b.amountCrore || 0) - (a.amountCrore || 0))
                        .map((c, idx) => (
                          <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                            <td className="p-2.5 text-center font-bold text-slate-400">{toBengaliNumber(idx + 1)}.</td>
                            <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{c.companyName}</td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">{c.caseNo}</td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">{c.court}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {formatCrore(c.amountCrore)}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-500">
                              {formatTaka(c.amountTaka)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
          <div className="text-xs text-slate-500">
            মাসিক রিটার্ন: <strong>{monthYearString}</strong> | মোট বিচারাধীন: <strong>{toBengaliNumber(currentPendingCount)} টি</strong>
          </div>

          <div className="flex items-center gap-2">
            {/* Word (.docx) */}
            <button
              onClick={handleExportDocx}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
              title="সম্পূর্ণ বিবরণী মাইক্রোসফট ওয়ার্ড (.docx) ফরম্যাটে ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
              <span>Word (.docx) ডাউনলোড</span>
            </button>

            {/* Excel (.xlsx) */}
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="মাসিক প্রবাহের এক্সেল রিটার্ন ডাউনলোড"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel ডাউনলোড</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="রিটার্ন সরাসরি প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>প্রিন্ট / PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
