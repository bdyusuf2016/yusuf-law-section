import React from 'react';
import { Search, Filter, RotateCcw, X, Building, Scale, Calendar, DollarSign, Activity } from 'lucide-react';
import { FilterState } from '../types/case';
import { toBengaliNumber } from '../utils/converter';

interface CaseFilterProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCount: number;
  filteredCount: number;
  availableYears: string[];
  availableCaseTypes: string[];
  availableCourts: string[];
}

export const CaseFilter: React.FC<CaseFilterProps> = ({
  filter,
  setFilter,
  totalCount,
  filteredCount,
  availableYears,
  availableCaseTypes,
  availableCourts,
}) => {
  const isFiltered = 
    filter.searchQuery !== '' || 
    filter.court !== 'all' || 
    filter.caseType !== 'all' || 
    filter.year !== 'all' || 
    filter.amountRange !== 'all' || 
    filter.statusCategory !== 'all';

  const resetFilters = () => {
    setFilter({
      searchQuery: '',
      court: 'all',
      caseType: 'all',
      year: 'all',
      amountRange: 'all',
      statusCategory: 'all'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
      {/* Search Bar + Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="প্রতিষ্ঠানের নাম, মামলা নং, বিবরণ বা সুপ্রিম কোর্ট লিংক দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
          {filter.searchQuery && (
            <button
              onClick={() => setFilter(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            ফিল্টার রিসেট ({toBengaliNumber(filteredCount)} / {toBengaliNumber(totalCount)})
          </button>
        )}
      </div>

      {/* Criteria Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* আদালত */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Scale className="w-3 h-3 text-indigo-500" /> আদালত
          </label>
          <select
            value={filter.court}
            onChange={(e) => setFilter(prev => ({ ...prev, court: e.target.value }))}
            className="w-full py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">সকল আদালত</option>
            {availableCourts.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* মামলার ধরণ */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-500" /> মামলার ধরণ
          </label>
          <select
            value={filter.caseType}
            onChange={(e) => setFilter(prev => ({ ...prev, caseType: e.target.value }))}
            className="w-full py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">সকল ধরণ</option>
            {availableCaseTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* মামলার সাল */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-500" /> মামলার সাল
          </label>
          <select
            value={filter.year}
            onChange={(e) => setFilter(prev => ({ ...prev, year: e.target.value }))}
            className="w-full py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">সকল সাল</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{toBengaliNumber(y)}</option>
            ))}
          </select>
        </div>

        {/* বকেয়ার পরিমাণ (কোটি টাকা রেঞ্জ) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-teal-500" /> বকেয়া রেঞ্জ (কোটি টাকা)
          </label>
          <select
            value={filter.amountRange}
            onChange={(e) => setFilter(prev => ({ ...prev, amountRange: e.target.value }))}
            className="w-full py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">সকল বকেয়া পরিমাণ</option>
            <option value="50_plus">৫০ কোটি টাকার বেশি</option>
            <option value="10_50">১০ কোটি - ৫০ কোটি টাকা</option>
            <option value="1_10">১ কোটি - ১০ কোটি টাকা</option>
            <option value="under_1">১ কোটি টাকার নিচে</option>
            <option value="zero">শূন্য (০) / নন-ট্যাক্স</option>
          </select>
        </div>

        {/* সর্বশেষ পরিস্থিতি */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-rose-500" /> মামলার পরিস্থিতি
          </label>
          <select
            value={filter.statusCategory}
            onChange={(e) => setFilter(prev => ({ ...prev, statusCategory: e.target.value }))}
            className="w-full py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">সকল পরিস্থিতি</option>
            <option value="stay">স্থগিতাদেশ (Stay Order)</option>
            <option value="rule">রুল জারী (Rule Issued)</option>
            <option value="hearing">শুনানি পর্যায় (Hearing)</option>
            <option value="not_in_causelist">কজলিস্ট বহির্ভূত</option>
            <option value="disposed">নিষ্পত্তি / রায়</option>
          </select>
        </div>
      </div>
    </div>
  );
};
