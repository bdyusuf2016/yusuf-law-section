import React from 'react';
import { 
  Building2, 
  Coins, 
  Scale, 
  ShieldAlert, 
  TrendingUp, 
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CaseRecord } from '../types/case';
import { formatCrore, formatTaka, toBengaliNumber } from '../utils/converter';

interface StatsDashboardProps {
  cases: CaseRecord[];
  onQuickFilter: (field: string, value: string) => void;
  activeFilterCourt: string;
  activeFilterStatus: string;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  cases,
  onQuickFilter,
  activeFilterCourt,
  activeFilterStatus,
}) => {
  // Calculations
  const totalCases = cases.length;
  const totalTaka = cases.reduce((acc, c) => acc + (c.amountTaka || 0), 0);
  const totalCrore = totalTaka / 10000000;

  const highCourtCases = cases.filter(c => c.court.includes('হাইকোর্ট')).length;
  const supremeCourtCases = cases.filter(c => c.court.includes('সুপ্রিম কোর্ট') || c.court.includes('আপীল বিভাগ')).length;
  
  const stayOrderCases = cases.filter(c => 
    c.latestStatus.includes('স্থগিতাদেশ') || 
    c.latestStatus.includes('extended') || 
    c.latestStatus.includes('Injunction')
  ).length;

  const ruleIssuedCases = cases.filter(c => 
    c.latestStatus.includes('Rule') || 
    c.latestStatus.includes('রুল')
  ).length;

  const disposedCases = cases.filter(c => 
    c.latestStatus.includes('Disposed') || 
    c.latestStatus.includes('Allowed') || 
    c.latestStatus.includes('Absolute') ||
    c.latestStatus.includes('Order passed') ||
    c.latestStatus.includes('বাতিল')
  ).length;

  // Top debtor
  const topDebtor = [...cases].sort((a, b) => b.amountTaka - a.amountTaka)[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. মোট বকেয়ার পরিমাণ (কোটি টাকা) */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-indigo-800/40 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-indigo-200">
            মোট বকেয়ার পরিমাণ
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold tracking-tight text-white mb-1">
            {formatCrore(totalCrore)}
          </div>
          <div className="text-xs text-indigo-200/90 font-medium">
            মোট টাকা: <span className="font-mono text-emerald-300">{formatTaka(totalTaka)}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-indigo-800/60 flex items-center justify-between text-[11px] text-indigo-300">
          <span>সর্বোচ্চ: {topDebtor ? topDebtor.companyName.slice(0, 18) + '...' : 'N/A'}</span>
          <span className="font-semibold text-amber-300">{topDebtor ? formatCrore(topDebtor.amountCrore, false) : ''}</span>
        </div>
      </div>

      {/* 2. মোট মামলা সংখ্যা */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            মোট মামলা সংখ্যা
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">
            {toBengaliNumber(totalCases)} <span className="text-sm font-normal text-slate-500">টি মামলা</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            গড় বকেয়া: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCrore(totalCrore / (totalCases || 1))}</span> প্রতি মামলা
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
            {toBengaliNumber(disposedCases)} নিষ্পত্তি / রায়
          </span>
          <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
            {toBengaliNumber(ruleIssuedCases)} রুল জারী
          </span>
        </div>
      </div>

      {/* 3. আদালত ভিত্তিক মামলা */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            আদালতের অবস্থান
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => onQuickFilter('court', activeFilterCourt === 'হাইকোর্ট' ? 'all' : 'হাইকোর্ট')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
              activeFilterCourt === 'হাইকোর্ট' 
                ? 'bg-blue-500 text-white font-semibold' 
                : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>হাইকোর্ট বিভাগ</span>
            <span className="font-bold">{toBengaliNumber(highCourtCases)} টি</span>
          </button>
          <button
            onClick={() => onQuickFilter('court', activeFilterCourt === 'সুপ্রিম কোর্ট' ? 'all' : 'সুপ্রিম কোর্ট')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
              activeFilterCourt === 'সুপ্রিম কোর্ট' 
                ? 'bg-purple-600 text-white font-semibold' 
                : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>সুপ্রিম কোর্ট (আপীল বিভাগ)</span>
            <span className="font-bold">{toBengaliNumber(supremeCourtCases)} টি</span>
          </button>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          ক্লিক করে সরাসরি ফিল্টার করুন
        </div>
      </div>

      {/* 4. আইনি পরিস্থিতি ও সতর্কতা */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            স্থগিতাদেশ ও তদারকি
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => onQuickFilter('status', activeFilterStatus === 'stay' ? 'all' : 'stay')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
              activeFilterStatus === 'stay' 
                ? 'bg-amber-600 text-white font-semibold' 
                : 'bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200/50 dark:border-amber-800/40'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              স্থগিতাদেশ বলবৎ
            </span>
            <span className="font-bold">{toBengaliNumber(stayOrderCases)} টি</span>
          </button>
          <div className="flex items-center justify-between p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              কজলিস্ট বহির্ভূত
            </span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {toBengaliNumber(cases.filter(c => c.latestStatus.includes('কজলিস্ট')).length)} টি
            </span>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400 text-center font-medium">
          জরুরি পদক্ষেপের সুপারিশ প্রযোজ্য
        </div>
      </div>
    </div>
  );
};
