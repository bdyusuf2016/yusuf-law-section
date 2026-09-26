import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  FileDown, 
  Printer, 
  ClipboardCheck, 
  Check, 
  Copy,
  TableProperties,
  CheckSquare,
  Square,
  SlidersHorizontal
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CaseRecord } from '../types/case';
import { formatCrore, formatTaka, toBengaliNumber } from '../utils/converter';
import { printCaseTable } from '../utils/printReport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: CaseRecord[];
}

export interface ExportColumnDef {
  key: keyof CaseRecord | 'amountCroreFormatted' | 'amountTakaFormatted';
  label: string;
  defaultSelected: boolean;
  getValue: (c: CaseRecord) => any;
}

const AVAILABLE_COLUMNS: ExportColumnDef[] = [
  { key: 'slNo', label: 'ক্র.নং', defaultSelected: true, getValue: c => toBengaliNumber(c.slNo) },
  { key: 'companyName', label: 'প্রতিষ্ঠানের নাম', defaultSelected: true, getValue: c => c.companyName },
  { key: 'circle', label: 'সার্কেল (শুধু সংখ্যা)', defaultSelected: true, getValue: c => toBengaliNumber(String(c.circle || '').replace(/[^0-9০-৯]/g, '')) || '১' },
  { key: 'address', label: 'ঠিকানা', defaultSelected: false, getValue: c => c.address || '—' },
  { key: 'caseNo', label: 'মামলা নং', defaultSelected: true, getValue: c => c.caseNo || '—' },
  { key: 'caseYear', label: 'মামলার সাল', defaultSelected: true, getValue: c => toBengaliNumber(c.caseYear) },
  { key: 'caseType', label: 'মামলার ধরণ', defaultSelected: true, getValue: c => c.caseType },
  { key: 'court', label: 'আদালত', defaultSelected: true, getValue: c => c.court },
  { key: 'amountCrore', label: 'বকেয়া (কোটি টাকা)', defaultSelected: true, getValue: c => formatCrore(c.amountCrore) },
  { key: 'amountTaka', label: 'বকেয়ার পরিমাণ (টাকা)', defaultSelected: true, getValue: c => formatTaka(c.amountTaka) },
  { key: 'description', label: 'মামলার সংক্ষিপ্ত বিবরণ', defaultSelected: true, getValue: c => c.description },
  { key: 'latestStatus', label: 'সর্বশেষ পরিস্থিতি', defaultSelected: true, getValue: c => c.latestStatus },
  { key: 'remarks', label: 'মন্তব্য', defaultSelected: true, getValue: c => c.remarks },
  { key: 'supremeCourtUrl', label: 'সুপ্রিম কোর্ট অনলাইন লিংক', defaultSelected: false, getValue: c => c.supremeCourtUrl || '' }
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  cases,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedColKeys, setSelectedColKeys] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(c => c.defaultSelected).map(c => c.key)
  );

  if (!isOpen) return null;

  const dataset = cases;

  const toggleColumn = (key: string) => {
    setSelectedColKeys(prev => 
      prev.includes(key) 
        ? (prev.length > 1 ? prev.filter(k => k !== key) : prev) 
        : [...prev, key]
    );
  };

  const selectAllColumns = () => {
    setSelectedColKeys(AVAILABLE_COLUMNS.map(c => c.key));
  };

  const resetDefaultColumns = () => {
    setSelectedColKeys(AVAILABLE_COLUMNS.filter(c => c.defaultSelected).map(c => c.key));
  };

  const activeCols = AVAILABLE_COLUMNS.filter(c => selectedColKeys.includes(c.key));

  // 1. Export as Excel (.xlsx) with only selected columns
  const handleExportExcel = () => {
    const rows = dataset.map((c) => {
      const rowObj: Record<string, any> = {};
      activeCols.forEach(col => {
        rowObj[col.label] = col.getValue(c);
      });
      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'মামলা_তালিকা');

    // Auto column widths
    worksheet['!cols'] = activeCols.map(col => ({
      wch: Math.max(col.label.length * 2, 14)
    }));

    XLSX.writeFile(workbook, `মামলা_ডাটাবেস_${activeCols.length}_কলাম_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 2. Export as CSV (UTF-8 with BOM)
  const handleExportCSV = () => {
    const headers = activeCols.map(c => c.label);

    const escapeCsv = (val: any) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    let csvContent = '\uFEFF'; // BOM for Excel
    csvContent += headers.map(escapeCsv).join(',') + '\n';

    dataset.forEach((c) => {
      const row = activeCols.map(col => col.getValue(c));
      csvContent += row.map(escapeCsv).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `মামলা_ডাটাবেস_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // 3. Print / Save as PDF
  const handlePrintPDF = () => {
    printCaseTable(dataset, { 
      columns: activeCols,
      title: 'প্রতিষ্ঠান ভিত্তিক বিচারাধীন মামলা ও রাজস্ব সংক্রান্ত প্রতিবেদন'
    });
  };

  // 4. Copy to Clipboard (TSV for Google Sheets / Excel)
  const handleCopyToClipboard = () => {
    const headers = activeCols.map(c => c.label);
    let tsv = headers.join('\t') + '\n';

    dataset.forEach(c => {
      const row = activeCols.map(col => {
        const val = col.getValue(c);
        return String(val ?? '').replace(/\r?\n|\r/g, ' ');
      });
      tsv += row.join('\t') + '\n';
    });

    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const totalCrore = dataset.reduce((sum, c) => sum + c.amountCrore, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                ডাটা এক্সপোর্ট ও কলাম নির্বাচন
              </h2>
              <p className="text-xs text-slate-500">
                যেসব কলাম এক্সপোর্টে রাখতে চান সেগুলো সিলেক্ট করুন
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <div>
              <span className="text-slate-500 dark:text-slate-400">এক্সপোর্টযোগ্য মামলা:</span>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {toBengaliNumber(dataset.length)} টি প্রতিষ্ঠান
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400">মোট বকেয়ার পরিমাণ:</span>
              <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                {formatCrore(totalCrore)}
              </div>
            </div>
          </div>

          {/* Column Selection Feature */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                এক্সপোর্ট কলামসমূহ ({toBengaliNumber(activeCols.length)} / {toBengaliNumber(AVAILABLE_COLUMNS.length)})
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAllColumns}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  সবগুলো নির্বাচন
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={resetDefaultColumns}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                >
                  ডিফল্ট
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_COLUMNS.map(col => {
                const isSelected = selectedColKeys.includes(col.key);
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => toggleColumn(col.key)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className="truncate">{col.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Live Preview of Selected Columns */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center justify-between">
                <span>নির্বাচিত কলামসমূহের প্রিভিউ (প্রথম ৩টি রেকর্ড):</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{toBengaliNumber(activeCols.length)}টি কলাম সক্রিয়</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <table className="w-full text-[10px] text-left">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      {activeCols.map(col => (
                        <th key={col.key} className="py-2 px-2.5 whitespace-nowrap border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {dataset.slice(0, 3).map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        {activeCols.map(col => (
                          <td key={col.key} className="py-1.5 px-2.5 whitespace-nowrap border-r border-slate-100 dark:border-slate-800/60 last:border-r-0">
                            {String(col.getValue(item) ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Export Options Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* 1. Excel (.xlsx) */}
            <button
              onClick={handleExportExcel}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-800/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-left transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  Excel ওয়ার্কবুক (.xlsx)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  নির্বাচিত {activeCols.length}টি কলাম সহ এক্সেল ডাউনলোড
                </div>
              </div>
            </button>

            {/* 2. PDF / Print */}
            <button
              onClick={handlePrintPDF}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/60 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-left transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  PDF / প্রিন্ট রিপোর্ট
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  অফিশিয়াল লেআউটে প্রিন্ট বা পিডিএফ সেভ করুন
                </div>
              </div>
            </button>

            {/* 3. CSV */}
            <button
              onClick={handleExportCSV}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 bg-white dark:bg-slate-800/60 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 text-left transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <TableProperties className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  CSV ফাইল (UTF-8)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  গুগল শিট বা ডাটাবেসের জন্য স্ট্যান্ডার্ড CSV
                </div>
              </div>
            </button>

            {/* 4. Copy to Clipboard */}
            <button
              onClick={handleCopyToClipboard}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-800/60 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <ClipboardCheck className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {copied ? 'ক্লিপবোর্ডে কপি সম্পন্ন হয়েছে!' : 'ক্লিপবোর্ডে কপি (Google Sheets)'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  গুগল শিটে সরাসরি Ctrl+V প্রেস করে পেস্ট করুন
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
