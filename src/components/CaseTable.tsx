import React, { useState } from 'react';
import { 
  Eye, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  CheckSquare, 
  Square,
  FileSpreadsheet,
  AlertCircle,
  Printer
} from 'lucide-react';
import { CaseRecord } from '../types/case';
import { formatCrore, formatTaka, toBengaliNumber, getStatusBadge, parseBengaliNumber } from '../utils/converter';
import { printCaseTable } from '../utils/printReport';

interface CaseTableProps {
  cases: CaseRecord[];
  onView: (c: CaseRecord) => void;
  onEdit: (c: CaseRecord) => void;
  onDelete: (id: string) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onBulkDelete: () => void;
  onExportSelected: () => void;
  isAdmin: boolean;
}

type SortField = 'amountCrore' | 'caseYear' | 'companyName' | 'slNo' | 'circle';

export const CaseTable: React.FC<CaseTableProps> = ({
  cases,
  onView,
  onEdit,
  onDelete,
  selectedIds,
  setSelectedIds,
  onBulkDelete,
  onExportSelected,
  isAdmin,
}) => {
  const [sortField, setSortField] = useState<SortField>('amountCrore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // For circle and slNo, start with ascending order (১, ২, ৩...)
      setSortDirection(field === 'amountCrore' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const sortedCases = [...cases].sort((a, b) => {
    let factor = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'amountCrore') {
      return ((a.amountCrore || 0) - (b.amountCrore || 0)) * factor;
    }
    if (sortField === 'caseYear') {
      const yA = parseBengaliNumber(String(a.caseYear || '0'));
      const yB = parseBengaliNumber(String(b.caseYear || '0'));
      return (yA - yB) * factor;
    }
    if (sortField === 'companyName') {
      return (a.companyName || '').localeCompare(b.companyName || '', 'bn') * factor;
    }
    if (sortField === 'slNo') {
      const sA = parseBengaliNumber(String(a.slNo || '0'));
      const sB = parseBengaliNumber(String(b.slNo || '0'));
      return (sA - sB) * factor;
    }
    if (sortField === 'circle') {
      const cA = parseBengaliNumber(String(a.circle || '0'));
      const cB = parseBengaliNumber(String(b.circle || '0'));
      return (cA - cB) * factor;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedCases.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentCases = sortedCases.slice(startIndex, startIndex + pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentCases.length && currentCases.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentCases.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 inline-block ml-1" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-indigo-500 inline-block ml-1" />
      : <ArrowDown className="w-3.5 h-3.5 text-indigo-500 inline-block ml-1" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Table Toolbar & Stats */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            তালিকাভুক্ত মোট মামলা: <span className="text-indigo-600 dark:text-indigo-400">{toBengaliNumber(cases.length)}</span> টি
          </span>
          <span className="text-[11px] text-slate-400">
            (সার্কেল কলামে শুধু সংখ্যা প্রদর্শিত)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => printCaseTable(sortedCases)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="বর্তমান ফিল্টার করা তালিকার সকল মামলা প্রিন্ট বা পিডিএফ করুন"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>প্রিন্ট রিপোর্ট</span>
          </button>
          <button
            onClick={onExportSelected}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="কলাম নির্বাচন করে এক্সেল, সিএসভি বা পিডিএফ এক্সপোর্ট"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>কলাম সিলেক্ট করে এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Table Header Controls / Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-950/60 px-5 py-3 border-b border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{toBengaliNumber(selectedIds.length)} টি মামলা নির্বাচিত হয়েছে</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const selectedCases = cases.filter(c => selectedIds.includes(c.id));
                printCaseTable(selectedCases, { title: 'নির্বাচিত বিচারাধীন মামলার প্রতিবেদন' });
              }}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-1.5 transition-colors shadow-xs"
              title="নির্বাচিত মামলাসমূহ প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              নির্বাচিতগুলো প্রিন্ট
            </button>
            <button
              onClick={onExportSelected}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100/50 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              নির্বাচিতগুলো কলাম সিলেক্ট করে এক্সপোর্ট
            </button>
            {isAdmin && (
              <button
                onClick={onBulkDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                নির্বাচিতগুলো ডিলিট
              </button>
            )}
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold select-none">
              <th className="py-3 px-4 w-10 text-center">
                <button onClick={toggleSelectAll} className="cursor-pointer">
                  {selectedIds.length === currentCases.length && currentCases.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>
              <th onClick={() => handleSort('slNo')} className="py-3.5 px-3 cursor-pointer whitespace-nowrap">
                ক্র.নং {getSortIcon('slNo')}
              </th>
              <th onClick={() => handleSort('companyName')} className="py-3.5 px-3 cursor-pointer min-w-[190px]">
                প্রতিষ্ঠানের নাম {getSortIcon('companyName')}
              </th>
              <th onClick={() => handleSort('circle')} className="py-3.5 px-3 cursor-pointer text-center min-w-[70px] bg-slate-100/60 dark:bg-slate-800/50">
                সার্কেল {getSortIcon('circle')}
              </th>
              <th className="py-3.5 px-3 min-w-[140px]">
                মামলা নং ও সাল {getSortIcon('caseYear')}
              </th>
              <th className="py-3.5 px-3 min-w-[120px]">
                আদালত
              </th>
              <th onClick={() => handleSort('amountCrore')} className="py-3.5 px-3 cursor-pointer text-right min-w-[130px] bg-indigo-50/50 dark:bg-indigo-950/20 font-bold text-indigo-900 dark:text-indigo-200">
                বকেয়া (কোটি টাকা) {getSortIcon('amountCrore')}
              </th>
              <th className="py-3.5 px-3 text-right min-w-[120px] text-slate-500">
                বকেয়ার পরিমাণ (টাকা)
              </th>
              <th className="py-3.5 px-3 min-w-[190px]">
                মামলার সংক্ষিপ্ত বিবরণ
              </th>
              <th className="py-3.5 px-3 min-w-[210px]">
                সর্বশেষ পরিস্থিতি ও শুনানি
              </th>
              <th className="py-3.5 px-3 min-w-[90px] text-center">
                সুপ্রিম কোর্ট
              </th>
              <th className="py-3.5 px-3 w-24 text-center sticky right-0 bg-slate-50 dark:bg-slate-800 shadow-sm">
                অ্যাকশন
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {currentCases.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  কোনো মামলার তথ্য পাওয়া যায়নি। অনুসন্ধান বা ফিল্টার পরিবর্তন করে দেখুন।
                </td>
              </tr>
            ) : (
              currentCases.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                const badge = getStatusBadge(c.latestStatus, c.remarks);
                const pureCircle = String(c.circle || '').replace(/[^0-9০-৯]/g, '') || '১';

                return (
                  <tr 
                    key={c.id} 
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleSelectOne(c.id)} className="cursor-pointer">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 bengali-num">
                      {toBengaliNumber(c.slNo)}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {c.companyName}
                      </div>
                      {c.address && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {c.address}
                        </div>
                      )}
                    </td>

                    {/* Dedicated Circle column with ONLY number */}
                    <td className="py-3 px-3 text-center whitespace-nowrap bg-slate-50/40 dark:bg-slate-800/20">
                      <span 
                        className="inline-flex items-center justify-center min-w-[30px] h-7 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm bengali-num border border-indigo-200 dark:border-indigo-800/80 shadow-2xs"
                        title={`সার্কেল: ${toBengaliNumber(pureCircle)}`}
                      >
                        {toBengaliNumber(pureCircle)}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-wide case-number-badge select-all">
                        {c.caseNo || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                        ধরণ: {c.caseType} • সাল: <span className="font-medium text-slate-700 dark:text-slate-300">{toBengaliNumber(c.caseYear)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        c.court.includes('সার্টিফিকেট') || c.caseType?.includes('সার্টিফিকেট') || c.court.includes('২০২') || c.caseType?.includes('২০২') || c.section202Status
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold'
                          : c.court.includes('ট্রাইব্যুনাল')
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold'
                          : c.court.includes('সুপ্রিম কোর্ট') 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {c.court}
                      </span>
                      {c.tribunalBench && (
                        <div className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                          {c.tribunalBench}
                        </div>
                      )}
                      {c.section202Status && (
                        <div className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold mt-0.5 max-w-[170px] truncate" title={c.section202Status}>
                          ২০২: {c.section202Status}
                        </div>
                      )}
                      {c.section7NoticeStatus && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-0.5 max-w-[170px] truncate" title={c.section7NoticeStatus}>
                          ৭ ধারা: {c.section7NoticeStatus}
                        </div>
                      )}
                    </td>

                    {/* বকেয়ার পরিমাণ (কোটি টাকা) - Highlighted requirement */}
                    <td className="py-3 px-3 text-right bg-indigo-50/30 dark:bg-indigo-950/10">
                      <div className="font-bold text-xs sm:text-[13px] text-indigo-700 dark:text-indigo-300">
                        {formatCrore(c.amountCrore)}
                      </div>
                      <div className="text-[10px] text-indigo-500/80 font-mono">
                        {c.amountCrore > 0 ? `${c.amountCrore.toFixed(4)} Cr` : '০.০০'}
                      </div>
                    </td>

                    {/* বকেয়ার পরিমাণ (টাকা) */}
                    <td className="py-3 px-3 text-right bengali-num font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {c.amountTaka > 0 ? formatTaka(c.amountTaka) : '— (শুল্কমুক্ত)'}
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs">
                      <div className="line-clamp-2" title={c.description}>
                        {c.description || '—'}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border mb-1 ${badge.bg} ${badge.color}`}>
                        {badge.label}
                      </span>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2" title={c.latestStatus}>
                        {c.latestStatus || '—'}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {c.supremeCourtUrl ? (
                        <a
                          href={c.supremeCourtUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-1 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors"
                          title="সুপ্রিম কোর্ট ডাটাবেসে মামলার হিস্টোরি দেখুন"
                        >
                          <ExternalLink className="w-3 h-3" />
                          লিংক
                        </a>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap sticky right-0 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onView(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="বিস্তারিত বিবরণ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onEdit(c)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="সম্পাদনা করুন"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(c.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            সর্বমোট {toBengaliNumber(sortedCases.length)} টির মধ্যে {toBengaliNumber(startIndex + 1)} - {toBengaliNumber(Math.min(startIndex + pageSize, sortedCases.length))} প্রদর্শন করা হচ্ছে
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <span>প্রতি পৃষ্ঠায়:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value={15}>১৫</option>
              <option value={30}>৩০</option>
              <option value={50}>৫০</option>
              <option value={100}>১০০</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            পূর্ববর্তী
          </button>
          <div className="px-3 py-1.5 font-semibold text-slate-800 dark:text-slate-200">
            পৃষ্ঠা {toBengaliNumber(currentPage)} / {toBengaliNumber(totalPages)}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            পরবর্তী
          </button>
        </div>
      </div>
    </div>
  );
};
