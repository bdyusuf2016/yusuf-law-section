import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Scale, 
  Coins, 
  Building,
  ShieldAlert,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { CaseRecord } from '../types/case';
import { formatCrore, formatTaka, toBengaliNumber } from '../utils/converter';

interface ChartGalleryProps {
  cases: CaseRecord[];
  onSelectCompany?: (companyName: string) => void;
}

export const ChartGallery: React.FC<ChartGalleryProps> = ({ cases, onSelectCompany }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'debtors' | 'courts' | 'years' | 'status'>('all');

  // 1. Top 10 Debtors (Crore Taka)
  const top10Debtors = [...cases]
    .filter(c => c.amountCrore > 0)
    .sort((a, b) => b.amountCrore - a.amountCrore)
    .slice(0, 10);

  const maxDebtorCrore = top10Debtors[0]?.amountCrore || 1;

  // 2. Court Distribution
  const courtCounts: Record<string, { count: number; totalCrore: number }> = {};
  cases.forEach(c => {
    let courtKey = 'হাইকোর্ট';
    if (c.court.includes('সুপ্রিম কোর্ট') || c.court.includes('আপীল বিভাগ')) {
      courtKey = 'সুপ্রিম কোর্ট (আপীল বিভাগ)';
    } else if (c.court.includes('ট্রাইব্যুনাল')) {
      courtKey = 'কাস্টমস আপীল ট্রাইব্যুনাল';
    }
    if (!courtCounts[courtKey]) {
      courtCounts[courtKey] = { count: 0, totalCrore: 0 };
    }
    courtCounts[courtKey].count += 1;
    courtCounts[courtKey].totalCrore += c.amountCrore;
  });

  // 3. Amount Range Brackets
  const ranges = [
    { label: '৫০+ কোটি টাকা', min: 50, max: Infinity, color: 'bg-rose-500' },
    { label: '১০ - ৫০ কোটি টাকা', min: 10, max: 50, color: 'bg-amber-500' },
    { label: '১ - ১০ কোটি টাকা', min: 1, max: 10, color: 'bg-indigo-500' },
    { label: '১ কোটির নিচে', min: 0.001, max: 1, color: 'bg-teal-500' },
    { label: 'শূন্য (০) / লাইসেন্স বিষয়', min: 0, max: 0.001, color: 'bg-slate-400' },
  ];

  const rangeStats = ranges.map(r => {
    const matched = cases.filter(c => {
      if (r.min === 0 && r.max === 0.001) return c.amountCrore === 0;
      return c.amountCrore >= r.min && c.amountCrore < r.max;
    });
    const totalCr = matched.reduce((sum, item) => sum + item.amountCrore, 0);
    return {
      ...r,
      count: matched.length,
      totalCrore: totalCr,
      percentage: cases.length ? (matched.length / cases.length) * 100 : 0
    };
  });

  // 4. Yearly Trend
  const yearCounts: Record<string, number> = {};
  cases.forEach(c => {
    const yr = c.caseYear?.trim() || 'অন্যান্য';
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;
  });

  const sortedYears = Object.keys(yearCounts)
    .sort((a, b) => {
      const na = parseInt(a) || 0;
      const nb = parseInt(b) || 0;
      return na - nb;
    })
    .filter(y => y !== 'অন্যান্য' && parseInt(y) > 2000);

  const maxYearCount = Math.max(...Object.values(yearCounts), 1);

  // 5. Status Breakdown
  const statusStats = {
    stay: cases.filter(c => c.latestStatus.includes('স্থগিতাদেশ') || c.latestStatus.includes('extended') || c.latestStatus.includes('Injunction')).length,
    rule: cases.filter(c => c.latestStatus.includes('Rule') || c.latestStatus.includes('রুল')).length,
    hearing: cases.filter(c => c.latestStatus.includes('শুনানি') || c.latestStatus.includes('hearing')).length,
    notInList: cases.filter(c => c.latestStatus.includes('কজলিস্ট')).length,
    disposed: cases.filter(c => c.latestStatus.includes('Disposed') || c.latestStatus.includes('Allowed') || c.latestStatus.includes('Absolute') || c.latestStatus.includes('বাতিল')).length,
  };

  return (
    <div className="space-y-6">
      {/* Gallery Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'all' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📊 সকল চার্ট একনজরে
          </button>
          <button
            onClick={() => setActiveTab('debtors')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'debtors' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🏢 শীর্ষ বকেয়াদার
          </button>
          <button
            onClick={() => setActiveTab('courts')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'courts' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🏛️ আদালত বণ্টন
          </button>
          <button
            onClick={() => setActiveTab('years')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'years' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📅 বছরভিত্তিক ধারা
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'status' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            ⚖️ আইনি পরিস্থিতি
          </button>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2">
          মোট বিশ্লেষণযোগ্য মামলা: <span className="font-bold text-indigo-600 dark:text-indigo-400">{toBengaliNumber(cases.length)} টি</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Top 10 Debtor Companies */}
        {(activeTab === 'all' || activeTab === 'debtors') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  শীর্ষ ১০ বকেয়াদার প্রতিষ্ঠান (কোটি টাকা)
                </h3>
                <p className="text-xs text-slate-400">সর্বোচ্চ রাজস্ব জড়িত শীর্ষ প্রতিষ্ঠানসমূহ</p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                কোটি টাকায়
              </span>
            </div>

            <div className="space-y-3.5 mt-4">
              {top10Debtors.map((item, idx) => {
                const pct = Math.max((item.amountCrore / maxDebtorCrore) * 100, 5);
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                        <span className="text-slate-400 mr-1.5 font-mono">#{toBengaliNumber(idx + 1)}</span>
                        {item.companyName}
                      </div>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCrore(item.amountCrore)}
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 2: Revenue Bracket Breakdown */}
        {(activeTab === 'all' || activeTab === 'debtors') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  বকেয়ার পরিমাণভিত্তিক ব্র্যাকেট বণ্টন
                </h3>
                <p className="text-xs text-slate-400">টাকার মাত্রা অনুযায়ী মামলার সংখ্যা ও অংশ</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {rangeStats.map((r, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                      <span className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                      <span>{r.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{toBengaliNumber(r.count)} টি মামলা</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">({toBengaliNumber(r.percentage.toFixed(1))}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full ${r.color} rounded-full`}
                      style={{ width: `${Math.max(r.percentage, 2)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>মোট জড়িত রাজস্ব:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatCrore(r.totalCrore)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHART 3: Court-wise Distribution */}
        {(activeTab === 'all' || activeTab === 'courts') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-500" />
                  আদালতভিত্তিক মামলার অনুপাত ও রাজস্ব
                </h3>
                <p className="text-xs text-slate-400">কোন আদালতে কতগুলো মামলা বিচারাধীন রয়েছে</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {Object.entries(courtCounts).map(([courtName, stat], idx) => {
                const pct = cases.length ? ((stat.count / cases.length) * 100).toFixed(1) : '0';
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700/60">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      {courtName}
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">
                      {toBengaliNumber(stat.count)} <span className="text-xs font-normal text-slate-500">টি</span>
                    </div>
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                      {formatCrore(stat.totalCrore)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      সার্বিক মামলার {toBengaliNumber(pct)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 4: Status Breakdown */}
        {(activeTab === 'all' || activeTab === 'status') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-500" />
                  মামলার আইনি পরিস্থিতি ও ফলাফল বিশ্লেষণ
                </h3>
                <p className="text-xs text-slate-400">রুল, স্থগিতাদেশ ও নিষ্পত্তির অনুপাত</p>
              </div>
            </div>

            <div className="space-y-3.5 mt-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <div className="text-xs">
                  <div className="font-bold text-amber-900 dark:text-amber-200">স্থগিতাদেশ বলবৎ (Stay Order / Extended)</div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">০৬ মাস বা ০১ বছরের স্থগিতাদেশ চলমান</div>
                </div>
                <div className="text-lg font-black text-amber-900 dark:text-amber-200">
                  {toBengaliNumber(statusStats.stay)} টি
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                <div className="text-xs">
                  <div className="font-bold text-blue-900 dark:text-blue-200">রুল জারী (Rule Issued)</div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-400">শুনানি পরবর্তী রুল জারীকৃত মামলা</div>
                </div>
                <div className="text-lg font-black text-blue-900 dark:text-blue-200">
                  {toBengaliNumber(statusStats.rule)} টি
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50">
                <div className="text-xs">
                  <div className="font-bold text-purple-900 dark:text-purple-200">শুনানি প্রক্রিয়াধীন / নির্ধারিত</div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-400">আদালতে শুনানির অপেক্ষায়</div>
                </div>
                <div className="text-lg font-black text-purple-900 dark:text-purple-200">
                  {toBengaliNumber(statusStats.hearing)} টি
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
                <div className="text-xs">
                  <div className="font-bold text-rose-900 dark:text-rose-200">কজলিস্ট বহির্ভূত (Not in Cause List)</div>
                  <div className="text-[11px] text-rose-700 dark:text-rose-400">এজি দপ্তরে চিঠি পাঠানো প্রয়োজন</div>
                </div>
                <div className="text-lg font-black text-rose-900 dark:text-rose-200">
                  {toBengaliNumber(statusStats.notInList)} টি
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                <div className="text-xs">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200">নিষ্পত্তি / রায় (Disposed / Allowed / Absolute)</div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">মামলা নিষ্পত্তি বা রাজস্বের অনুকূলে রায়</div>
                </div>
                <div className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                  {toBengaliNumber(statusStats.disposed)} টি
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHART 5: Yearly Distribution Bar Chart */}
        {(activeTab === 'all' || activeTab === 'years') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  বছরভিত্তিক মামলা দায়েরের প্রবণতা (Yearly Trends)
                </h3>
                <p className="text-xs text-slate-400">বিগত বছরগুলো থেকে ২০২৬ সাল পর্যন্ত দায়ের ও চলমান মামলা</p>
              </div>
            </div>

            <div className="h-56 flex items-end gap-2 pt-8 pb-2 overflow-x-auto">
              {sortedYears.map((yr) => {
                const count = yearCounts[yr] || 0;
                const heightPct = Math.max((count / maxYearCount) * 100, 8);
                const isCurrent = yr === '2026' || yr === '২০২৬';

                return (
                  <div key={yr} className="flex-1 min-w-[36px] flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {toBengaliNumber(count)}
                    </div>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-gradient-to-t from-teal-500 to-emerald-400' 
                          : 'bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {toBengaliNumber(yr)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
