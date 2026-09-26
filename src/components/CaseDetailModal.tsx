import React from 'react';
import { 
  X, 
  ExternalLink, 
  Building, 
  Scale, 
  Calendar, 
  Coins, 
  FileText, 
  Clock, 
  Printer, 
  Pencil,
  MapPin,
  CircleDot
} from 'lucide-react';
import { CaseRecord } from '../types/case';
import { formatCrore, formatTaka, toBengaliNumber, getStatusBadge } from '../utils/converter';
import { printSingleCase } from '../utils/printReport';

interface CaseDetailModalProps {
  caseData: CaseRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (c: CaseRecord) => void;
  isAdmin: boolean;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseData,
  isOpen,
  onClose,
  onEdit,
  isAdmin,
}) => {
  if (!isOpen || !caseData) return null;

  const badge = getStatusBadge(caseData.latestStatus);

  const handlePrint = () => {
    printSingleCase(caseData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200 dark:border-indigo-800">
              ক্র.নং {toBengaliNumber(caseData.slNo)}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.bg} ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Company Title */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 leading-snug">
              {caseData.companyName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              {caseData.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {caseData.address}
                </span>
              )}
              {caseData.circle && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 bengali-num text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                  <CircleDot className="w-3.5 h-3.5 text-indigo-500" />
                  সার্কেল {toBengaliNumber(String(caseData.circle).replace(/[^0-9০-৯]/g, ''))}
                </span>
              )}
            </div>
          </div>

          {/* Revenue Amount Hero Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md border border-indigo-800/40">
            <div className="text-xs text-indigo-200 font-semibold mb-1 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-300" />
              বকেয়ার পরিমাণ (কোটি টাকা ও মূল টাকা)
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
              {formatCrore(caseData.amountCrore)}
            </div>
            <div className="text-xs text-indigo-200 font-mono mt-1">
              মূল অংক: <span className="text-white font-bold">{formatTaka(caseData.amountTaka)}</span> ({caseData.amountCrore > 0 ? `${caseData.amountCrore.toFixed(4)} কোটি টাকা` : '০.০০'})
            </div>
          </div>

          {/* Case Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-slate-400 font-semibold mb-1">মামলা নং</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide case-number-badge select-all break-words">
                {caseData.caseNo || '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-slate-400 font-semibold mb-1">মামলার সাল</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {toBengaliNumber(caseData.caseYear)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-slate-400 font-semibold mb-1">মামলার ধরণ</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {caseData.caseType}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-3">
              <div className="text-[11px] text-slate-400 font-semibold mb-1">কোন আদালতে বিচারাধীন</div>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                🏛️ {caseData.court}
              </div>
            </div>
          </div>

          {/* Brief Description */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              মামলার সংক্ষিপ্ত বিবরণ
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {caseData.description || 'বিবরণ উল্লেখ নেই।'}
            </p>
          </div>

          {/* Latest Status */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <div className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              সর্বশেষ পরিস্থিতি ও শুনানির আপডেট
            </div>
            <p className="text-xs text-blue-950 dark:text-blue-100 leading-relaxed whitespace-pre-wrap">
              {caseData.latestStatus || 'পরিস্থিতি তথ্য নেই।'}
            </p>
          </div>

          {/* Remarks & Legal Step */}
          {caseData.remarks && (
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
                📌 মন্তব্য ও পরবর্তী করণীয়
              </div>
              <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
                {caseData.remarks}
              </p>
            </div>
          )}

          {/* Supreme Court Portal Link */}
          {caseData.supremeCourtUrl && (
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  বাংলাদেশ সুপ্রিম কোর্ট অফিসিয়াল ডাটাবেস
                </div>
                <div className="text-[11px] text-teal-700 dark:text-teal-400 font-mono truncate max-w-sm mt-0.5">
                  {caseData.supremeCourtUrl}
                </div>
              </div>
              <a
                href={caseData.supremeCourtUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                সরাসরি দেখুন
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="text-[11px] text-slate-400">
            সর্বশেষ আপডেট: {caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString('bn-BD') : 'আজ'}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(caseData);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5" />
                সম্পাদনা
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
