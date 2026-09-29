import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  FileUp, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Check, 
  Database,
  ArrowRight,
  ClipboardPaste
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CaseRecord } from '../types/case';
import { 
  takaToCrore, 
  croreToTaka, 
  parseBengaliNumber, 
  toBengaliNumber, 
  formatCrore, 
  formatTaka, 
  getStatusCategory 
} from '../utils/converter';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedCases: CaseRecord[], mode: 'append' | 'replace') => void;
  currentCount: number;
}

interface ParsedPreviewState {
  cases: CaseRecord[];
  validCount: number;
  invalidCount: number;
  totalCrore: number;
  errors: string[];
  filename?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentCount
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'template'>('upload');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [pasteContent, setPasteContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ParsedPreviewState | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Clean value string/number
  const cleanStr = (val: any): string => {
    if (val === undefined || val === null) return '';
    return String(val).trim();
  };

  // Helper to map row fields intelligently across Bengali and English headers
  const mapRowToCase = (row: Record<string, any>, index: number): CaseRecord | null => {
    // Normalization map
    const keys = Object.keys(row);
    const getVal = (possibleKeys: string[]): any => {
      for (const pk of possibleKeys) {
        // direct match
        if (row[pk] !== undefined && row[pk] !== null && String(row[pk]).trim() !== '') {
          return row[pk];
        }
        // case-insensitive match
        const found = keys.find(k => k.trim().toLowerCase() === pk.toLowerCase());
        if (found && row[found] !== undefined && row[found] !== null && String(row[found]).trim() !== '') {
          return row[found];
        }
      }
      return '';
    };

    const companyName = cleanStr(getVal([
      'companyName', 'company_name', 'company', 'institution',
      'প্রতিষ্ঠানের নাম', 'প্রতিষ্ঠানের_নাম', 'প্রতিষ্ঠান', 'নাম'
    ]));

    const caseNo = cleanStr(getVal([
      'caseNo', 'case_no', 'caseno', 'case number',
      'মামলা নং', 'মামলা নম্বর', 'মামলা_নং', 'নথি নং', 'নথি নম্বর'
    ]));

    // If both company name and case no are missing, skip row as empty
    if (!companyName && !caseNo) {
      return null;
    }

    const slNoRaw = getVal(['slNo', 'sl_no', 'sl', 'ক্র.নং', 'ক্রমিক নং', 'ক্রমিক']);
    const slNo = cleanStr(slNoRaw) || String(index + 1);

    const circleRaw = cleanStr(getVal(['circle', 'সার্কেল', 'সার্কেল নং']));
    const circle = circleRaw.replace(/[^0-9০-৯]/g, '') || '১';

    const address = cleanStr(getVal(['address', 'ঠিকানা', 'কার্যালয়ের ঠিকানা']));
    const caseType = cleanStr(getVal(['caseType', 'case_type', 'মামলার ধরণ', 'ধরণ'])) || 'রীট পিটিশন';
    const caseYearRaw = cleanStr(getVal(['caseYear', 'case_year', 'year', 'মামলার সাল', 'সাল', 'বছর']));
    const caseYear = caseYearRaw ? String(parseBengaliNumber(caseYearRaw) || caseYearRaw) : '২০২৬';

    const court = cleanStr(getVal(['court', 'court_name', 'আদালত', 'কোন আদালতে মামলাধীন'])) || 'হাইকোর্ট';
    const courtHierarchy = cleanStr(getVal(['courtHierarchy', 'আদালত স্তর', 'আদালতের স্তর'])) || (court.includes('হাইকোর্ট') ? 'মাননীয় সুপ্রিম কোর্টের হাইকোর্ট বিভাগ' : court);

    // Amounts
    const takaRaw = getVal(['amountTaka', 'amount_taka', 'taka', 'বকেয়ার পরিমাণ (টাকা)', 'টাকা', 'বকেয়া টাকা']);
    const croreRaw = getVal(['amountCrore', 'amount_crore', 'crore', 'বকেয়া (কোটি টাকা)', 'কোটি টাকা']);

    let amountTaka = 0;
    let amountCrore = 0;

    if (takaRaw !== '') {
      amountTaka = typeof takaRaw === 'number' ? takaRaw : parseBengaliNumber(String(takaRaw));
    }
    if (croreRaw !== '') {
      amountCrore = typeof croreRaw === 'number' ? croreRaw : parseBengaliNumber(String(croreRaw));
    }

    if (amountTaka > 0 && amountCrore === 0) {
      amountCrore = takaToCrore(amountTaka);
    } else if (amountCrore > 0 && amountTaka === 0) {
      amountTaka = croreToTaka(amountCrore);
    }

    const description = cleanStr(getVal([
      'description', 'details', 'মামলার বিষয়বস্তু ও বকেয়ার উদ্ভবের কারণ', 
      'মামলার বিষয়বস্তু', 'বকেয়া উদ্ভবের কারণ', 'বিবরণ'
    ]));

    const latestStatus = cleanStr(getVal([
      'latestStatus', 'latest_status', 'status', 'মামলার সর্বশেষ পরিস্থিতি ও শুনানি', 
      'মামলার সর্বশেষ পরিস্থিতি', 'সর্বশেষ পরিস্থিতি', 'অবস্থা'
    ]));

    const remarks = cleanStr(getVal(['remarks', 'মন্তব্য', 'আইনি অগ্রগতি']));
    const supremeCourtUrl = cleanStr(getVal(['supremeCourtUrl', 'url', 'link', 'সুপ্রিম কোর্ট লিংক', 'সুপ্রিম কোর্ট অনলাইন লিংক']));
    
    // Tribunal specific
    const tribunalBench = cleanStr(getVal(['tribunalBench', 'bench', 'ট্রাইব্যুনাল বেঞ্চ', 'বেঞ্চ']));
    const originalOrderNo = cleanStr(getVal(['originalOrderNo', 'মূল দাবীনামা / আপীল আদেশ নং', 'মূল দাবীনামা নং', 'আপীল আদেশ নং']));
    const preDepositStatus = cleanStr(getVal(['preDepositStatus', '১০% প্রাক-জমা (Pre-deposit) স্থিতি', '১০% প্রাক-জমা স্থিতি', 'প্রাক-জমা']));

    // Certificate and Section 202 specific
    const section202Status = cleanStr(getVal([
      'section202Status', 'ধারা ২০২ পদক্ষেপ', 'কাস্টমস আইনের ধারা ২০২ অনুযায়ী পদক্ষেপ', '২০২ ধারা স্থিতি'
    ]));
    const section202Ref = cleanStr(getVal([
      'section202Ref', 'ধারা ২০২ নথি / ফাইল নং ও তারিখ', 'ধারা ২০২ নথি নং', '২০২ ফাইল নং'
    ]));
    const certificateCourtName = cleanStr(getVal([
      'certificateCourtName', 'সার্টিফিকেট আদালত / দপ্তর', 'সার্টিফিকেট আদালত'
    ]));
    const section7NoticeStatus = cleanStr(getVal([
      'section7NoticeStatus', '৭ ধারার নোটিশ স্থিতি', '৭ ধারা নোটিশ স্থিতি', '৭ ধারা নোটিশ'
    ]));
    const distressWarrantStatus = cleanStr(getVal([
      'distressWarrantStatus', 'ক্রোক পরোয়ানা / রিকভারি স্থিতি', 'ক্রোক পরোয়ানা', 'ওয়ারেন্ট'
    ]));
    const certificateDebtor = cleanStr(getVal([
      'certificateDebtor', 'সার্টিফিকেট খাতক / দেনাদারের বিবরণ', 'সার্টিফিকেট খাতক', 'দেনাদার'
    ]));

    const statusCategory = getStatusCategory(latestStatus, remarks);

    return {
      id: `case-imported-${Date.now()}-${index}`,
      slNo,
      companyName: companyName || 'নামবিহীন প্রতিষ্ঠান',
      address,
      circle,
      caseType,
      caseYear,
      caseNo: caseNo || '—',
      amountTaka,
      amountCrore,
      court,
      courtHierarchy,
      description,
      latestStatus,
      remarks,
      supremeCourtUrl,
      tribunalBench,
      originalOrderNo,
      preDepositStatus,
      section202Status,
      section202Ref,
      certificateCourtName,
      section7NoticeStatus,
      distressWarrantStatus,
      certificateDebtor,
      statusCategory,
      updatedAt: new Date().toISOString()
    };
  };

  // Process raw object rows
  const processRawRows = (rows: any[], filename?: string) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      setParsedData({
        cases: [],
        validCount: 0,
        invalidCount: 0,
        totalCrore: 0,
        errors: ['কোনো ডেটা বা সারি শনাক্ত করা যায়নি। ফাইলটি সঠিক ফরম্যাটের কিনা পরীক্ষা করুন।'],
        filename
      });
      return;
    }

    const validCases: CaseRecord[] = [];
    const errors: string[] = [];
    let invalidCount = 0;

    rows.forEach((row, i) => {
      try {
        const item = mapRowToCase(row, i);
        if (item) {
          validCases.push(item);
        } else {
          invalidCount++;
        }
      } catch (err) {
        invalidCount++;
        errors.push(`সারি নং ${i + 1} প্রক্রিয়াকরণে ত্রুটি: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

    const totalCrore = validCases.reduce((acc, c) => acc + (c.amountCrore || 0), 0);

    setParsedData({
      cases: validCases,
      validCount: validCases.length,
      invalidCount,
      totalCrore,
      errors: errors.slice(0, 5),
      filename
    });
  };

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    setIsLoading(true);
    const filename = file.name;
    const isJson = filename.endsWith('.json');

    const reader = new FileReader();

    if (isJson) {
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const json = JSON.parse(content);
          const rows = Array.isArray(json) ? json : [json];
          processRawRows(rows, filename);
        } catch (err) {
          setParsedData({
            cases: [],
            validCount: 0,
            invalidCount: 0,
            totalCrore: 0,
            errors: ['JSON ফাইল পার্সিং ত্রুটি: ফাইলটি বৈধ JSON নয়।'],
            filename
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } else {
      // Excel or CSV via XLSX
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          processRawRows(jsonRows, filename);
        } catch (err) {
          setParsedData({
            cases: [],
            validCount: 0,
            invalidCount: 0,
            totalCrore: 0,
            errors: ['এক্সেল / CSV ফাইল পড়তে ত্রুটি দেখা দিয়েছে।'],
            filename
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Process text pasted
  const handleProcessPastedText = () => {
    if (!pasteContent.trim()) return;
    setIsLoading(true);

    try {
      const trimmed = pasteContent.trim();
      // Try JSON
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          const json = JSON.parse(trimmed);
          const rows = Array.isArray(json) ? json : [json];
          processRawRows(rows, 'কপিকৃত JSON ডেটা');
          setIsLoading(false);
          return;
        } catch {
          // not JSON, fallback to TSV/CSV
        }
      }

      // Try CSV / TSV through XLSX.read
      const workbook = XLSX.read(trimmed, { type: 'string' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      processRawRows(jsonRows, 'কপিকৃত টেবিল / CSV ডেটা');
    } catch (err) {
      setParsedData({
        cases: [],
        validCount: 0,
        invalidCount: 0,
        totalCrore: 0,
        errors: ['পেস্টকৃত তথ্য পার্স করা সম্ভব হয়নি। অনুগ্রহ করে এক্সেল থেকে কপি করুন অথবা নমুনা টেমপ্লেট ব্যবহার করুন।'],
        filename: 'টেক্সট ডেটা'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Download Sample Excel Template
  const handleDownloadSampleExcel = () => {
    const sampleRows = [
      {
        'ক্র.নং': '১',
        'প্রতিষ্ঠানের নাম': 'মেসার্স ডেল্টা টেক্সটাইল মিলস লিমিটেড',
        'সার্কেল': '১',
        'ঠিকানা': 'গাজীপুর, ঢাকা',
        'মামলার ধরণ': 'রীট পিটিশন',
        'মামলা নং': 'রীট পিটিশন নং- ১২৪১৭/২০২৪',
        'মামলার সাল': '২০২৪',
        'কোন আদালতে মামলাধীন': 'হাইকোর্ট',
        'আদালত স্তর': 'মাননীয় সুপ্রিম কোর্টের হাইকোর্ট বিভাগ',
        'বকেয়ার পরিমাণ (টাকা)': 45000000,
        'বকেয়া (কোটি টাকা)': 4.5,
        'মামলার বিষয়বস্তু ও বকেয়া উদ্ভবের কারণ': 'বন্ড সুবিধায় আমদানিকৃত কাঁচামাল অনিয়মের দায়ে দাবীকৃত শুল্ক-কর ও অর্থদণ্ড।',
        'মামলার সর্বশেষ পরিস্থিতি': 'বিজ্ঞ হাইকোর্ট বিভাগ কর্তৃক স্থগিতাদেশ প্রদান করা হয়েছে।',
        'মন্তব্য': 'স্থগিতাদেশ বলবৎ রয়েছে',
        'সুপ্রিম কোর্ট অনলাইন লিংক': 'https://supremecourt.gov.bd',
        'ট্রাইব্যুনাল বেঞ্চ': '',
        '১০% প্রাক-জমা স্থিতি': '',
        'মূল দাবীনামা / আপীল আদেশ নং': '',
        'কাস্টমস আইনের ধারা ২০২ অনুযায়ী পদক্ষেপ': '',
        'ধারা ২০২ নথি / ফাইল নং ও তারিখ': '',
        'সার্টিফিকেট আদালত / দপ্তর': '',
        '৭ ধারার নোটিশ স্থিতি': '',
        'ক্রোক পরোয়ানা / রিকভারি স্থিতি': '',
        'সার্টিফিকেট খাতক / দেনাদারের বিবরণ': ''
      },
      {
        'ক্র.নং': '২',
        'প্রতিষ্ঠানের নাম': 'মেসার্স সাউথ এশিয়া স্পিনিং মিলস লিঃ',
        'সার্কেল': '২',
        'ঠিকানা': 'টঙ্গী, গাজীপুর',
        'মামলার ধরণ': 'কাস্টমস আপীল',
        'মামলা নং': 'আপীল নং- ০৫/২০২৪ (কাস্টমস)',
        'মামলার সাল': '২০২৪',
        'কোন আদালতে মামলাধীন': 'কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল',
        'আদালত স্তর': 'কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল',
        'বকেয়ার পরিমাণ (টাকা)': 82500000,
        'বকেয়া (কোটি টাকা)': 8.25,
        'মামলার বিষয়বস্তু ও বকেয়া উদ্ভবের কারণ': 'বন্ডেড ওয়্যারহাউস অডিট আপত্তি ও অপরিশোধিত শুল্ক আদায়।',
        'মামলার সর্বশেষ পরিস্থিতি': '১০% প্রাক-জমা চালানের মাধ্যমে জমা সাপেক্ষে ট্রাইব্যুনালে শুনানির দিন ধার্য রয়েছে।',
        'মন্তব্য': 'শুনানি অপেক্ষমাণ',
        'সুপ্রিম কোর্ট অনলাইন লিংক': '',
        'ট্রাইব্যুনাল বেঞ্চ': '১ম বেঞ্চ',
        '১০% প্রাক-জমা স্থিতি': '১০% প্রাক-জমা সম্পন্ন',
        'মূল দাবীনামা / আপীল আদেশ নং': 'আদেশ নং- ১২/কাস্টমস/২০২৩',
        'কাস্টমস আইনের ধারা ২০২ অনুযায়ী পদক্ষেপ': '',
        'ধারা ২০২ নথি / ফাইল নং ও তারিখ': '',
        'সার্টিফিকেট আদালত / দপ্তর': '',
        '৭ ধারার নোটিশ স্থিতি': '',
        'ক্রোক পরোয়ানা / রিকভারি স্থিতি': '',
        'সার্টিফিকেট খাতক / দেনাদারের বিবরণ': ''
      },
      {
        'ক্র.নং': '৩',
        'প্রতিষ্ঠানের নাম': 'মেসার্স পদ্মা সিনথেটিক ফ্যাব্রিক্স লিঃ',
        'সার্কেল': '৩',
        'ঠিকানা': 'সিদ্ধিরগঞ্জ, নারায়ণগঞ্জ',
        'মামলার ধরণ': 'সার্টিফিকেট ও ধারা ২০২ মামলা',
        'মামলা নং': 'সার্টিফিকেট মামলা নং- ১৫/২০২৫-২৬',
        'মামলার সাল': '২০২৫',
        'কোন আদালতে মামলাধীন': 'সার্টিফিকেট ও ধারা ২০২',
        'আদালত স্তর': 'জেনারেল সার্টিফিকেট আদালত ও কাস্টমস আইনের ধারা ২০২',
        'বকেয়ার পরিমাণ (টাকা)': 120000000,
        'বকেয়া (কোটি টাকা)': 12.0,
        'মামলার বিষয়বস্তু ও বকেয়া উদ্ভবের কারণ': 'বকেয়া দাবীনামা চূড়ান্ত হওয়ায় কাস্টমস আইনের ধারা ২০২ ও পিডিআর অ্যাক্টের আওতায় রাজস্ব আদায় কার্যক্রম।',
        'মামলার সর্বশেষ পরিস্থিতি': '২০২(১)(গ) অনুযায়ী ব্যাংক হিসাব অবরুদ্ধ এবং সার্টিফিকেট আদালতে ৭ ধারা নোটিশ জারি সম্পন্ন হয়েছে।',
        'মন্তব্য': 'ব্যাংক হিসাব ফ্রিজ ও রিকভারি চলমান',
        'সুপ্রিম কোর্ট অনলাইন লিংক': '',
        'ট্রাইব্যুনাল বেঞ্চ': '',
        '১০% প্রাক-জমা স্থিতি': '',
        'মূল দাবীনামা / আপীল আদেশ নং': '',
        'কাস্টমস আইনের ধারা ২০২ অনুযায়ী পদক্ষেপ': '২০২(১)(গ) অনুযায়ী ব্যাংক হিসাব অবরুদ্ধ (Bank Freeze)',
        'ধারা ২০২ নথি / ফাইল নং ও তারিখ': 'নথি নং- ০৮/ধারা-২০২/বকেয়া/কাস্টমস/২০২৫, তাং- ১০/১০/২০২৫',
        'সার্টিফিকেট আদালত / দপ্তর': 'জেনারেল সার্টিফিকেট আদালত, ঢাকা কালেক্টরেট',
        '৭ ধারার নোটিশ স্থিতি': '৭ ধারা নোটিশ জারি সম্পন্ন',
        'ক্রোক পরোয়ানা / রিকভারি স্থিতি': '২৯ ধারা অনুযায়ী ব্যাংক ও সম্পত্তি ক্রোকাদেশ',
        'সার্টিফিকেট খাতক / দেনাদারের বিবরণ': 'ব্যবস্থাপনা পরিচালক, জনাব আহমেদ হোসেন (এনআইডি: ১৯৬৮২৬৯...'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'মামলা_নমুনা');

    // Auto widths
    worksheet['!cols'] = Object.keys(sampleRows[0]).map(k => ({
      wch: Math.max(k.length * 2, 16)
    }));

    XLSX.writeFile(workbook, 'মামলা_ইমপোর্ট_নমুনা_টেমপ্লেট.xlsx');
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (!parsedData || parsedData.cases.length === 0) return;
    onImport(parsedData.cases, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                মামলার তথ্য ইমপোর্ট (Import Cases)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Excel (.xlsx, .xls), CSV অথবা JSON ফাইল থেকে এক ক্লিকে বহু মামলার তথ্য ডাটাবেসে যুক্ত করুন
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

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/50 dark:bg-slate-800/50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'upload'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              ফাইল আপলোড (.xlsx / .csv)
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'paste'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ClipboardPaste className="w-4 h-4 text-blue-600" />
              টেবিল / ডাটা পেস্ট করুন
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'template'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Download className="w-4 h-4 text-amber-600" />
              নমুনা টেমপ্লেট
            </button>
          </div>

          {/* Quick template download button */}
          <button
            onClick={handleDownloadSampleExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-semibold transition-colors"
            title="Excel নমুনা টেমপ্লেট ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" />
            <span>নমুনা Excel ডাউনলোড</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".xlsx, .xls, .csv, .json" 
                  className="hidden" 
                />
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <FileUp className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                  এখানে ফাইল ড্রপ করুন অথবা ব্রাউজ করতে ক্লিক করুন
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  সাপোর্ট করে: Microsoft Excel (<span className="font-semibold text-emerald-600">.xlsx, .xls</span>), CSV (<span className="font-semibold text-blue-600">.csv</span>) বা JSON (<span className="font-semibold text-purple-600">.json</span>)
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <span>💡 বাংলা ও ইংরেজি যেকোনো কলামের নাম স্বয়ংক্রিয়ভাবে শনাক্ত হবে</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Direct Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  এক্সেল শিট বা CSV থেকে কপি করা তথ্য এখানে পেস্ট করুন:
                </label>
                <button
                  type="button"
                  onClick={() => setPasteContent('')}
                  className="text-[11px] text-slate-400 hover:text-rose-500"
                >
                  ক্লিয়ার করুন
                </button>
              </div>
              <textarea
                rows={6}
                value={pasteContent}
                onChange={e => setPasteContent(e.target.value)}
                placeholder="এক্সেল শিট থেকে সারি ও কলাম কপি করে সরাসরি এখানে Ctrl+V দিন (বা CSV / JSON পেস্ট করুন)..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleProcessPastedText}
                disabled={!pasteContent.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>পেস্টকৃত তথ্য লোড ও যাচাই করুন</span>
              </button>
            </div>
          )}

          {/* TAB 3: Sample Template & Guide */}
          {activeTab === 'template' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3 text-xs text-amber-950 dark:text-amber-200">
              <div className="flex items-center justify-between">
                <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-100">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  এক্সেল ফাইলের কলামের গঠন ও উদাহরণ
                </div>
                <button
                  onClick={handleDownloadSampleExcel}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  ডাউনলোড করুন (.xlsx)
                </button>
              </div>

              <p className="leading-relaxed">
                আপনার বিদ্যমান এক্সেল শিটটি নিচের কলামগুলোর যেকোনো নামের সাথে মিলিয়ে সাজিয়ে আপলোড করুন। যেকোনো ক্রমেই কলাম থাকতে পারে:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>প্রতিষ্ঠানের নাম</b> (companyName) *
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>মামলা নং</b> (caseNo) *
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>বকেয়ার পরিমাণ (টাকা)</b> (amountTaka)
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>বকেয়া (কোটি টাকা)</b> (amountCrore)
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>কোন আদালতে মামলাধীন</b> (court)
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>মামলার ধরণ</b> (caseType)
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>সার্কেল</b> (circle - শুধু সংখ্যা)
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>মামলার সর্বশেষ পরিস্থিতি</b> (latestStatus)
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>কাস্টমস আইনের ধারা ২০২ পদক্ষেপ</b> (section202Status)
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>ধারা ২০২ নথি / ফাইল নং</b> (section202Ref)
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>সার্টিফিকেট আদালত</b> (certificateCourtName)
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                  • <b>৭ ধারার নোটিশ স্থিতি</b> (section7NoticeStatus)
                </div>
              </div>
            </div>
          )}

          {/* PARSED DATA PREVIEW BOX */}
          {isLoading && (
            <div className="p-8 text-center text-slate-500">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs">ফাইল বিশ্লেষণ করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
            </div>
          )}

          {parsedData && !isLoading && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              
              {/* Summary Metrics */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      শনাক্তকৃত ডেটার সারসংক্ষেপ {parsedData.filename && <span className="font-normal text-slate-500 font-mono">({parsedData.filename})</span>}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      সফলভাবে প্রস্তুত: <span className="font-bold text-emerald-600 dark:text-emerald-400">{toBengaliNumber(parsedData.validCount)} টি মামলা</span>
                      {parsedData.invalidCount > 0 && (
                        <span className="text-rose-500 font-medium ml-2">• বাদ পড়া ফাঁকা সারি: {toBengaliNumber(parsedData.invalidCount)} টি</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">মোট বকেয়া রাজস্ব</span>
                  <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                    {formatCrore(parsedData.totalCrore)}
                  </span>
                </div>
              </div>

              {/* Warnings / Errors */}
              {parsedData.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    সতর্কতা / ত্রুটি:
                  </div>
                  {parsedData.errors.map((err, i) => (
                    <div key={i} className="text-[11px]">• {err}</div>
                  ))}
                </div>
              )}

              {/* Preview Table */}
              {parsedData.cases.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                    <span>প্রাক-অবলোকন (প্রথম {Math.min(5, parsedData.cases.length)}টি মামলা):</span>
                    <span className="text-[11px] text-slate-400">সর্বমোট {toBengaliNumber(parsedData.cases.length)}টি মামলা প্রস্তুত</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2 px-3">ক্র.নং</th>
                          <th className="py-2 px-3">প্রতিষ্ঠানের নাম</th>
                          <th className="py-2 px-3">মামলা নং</th>
                          <th className="py-2 px-3">আদালত</th>
                          <th className="py-2 px-3 text-right">বকেয়া (কোটি)</th>
                          <th className="py-2 px-3">পরিস্থিতি</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedData.cases.slice(0, 5).map((c, i) => (
                          <tr key={i} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-semibold bengali-num">{toBengaliNumber(c.slNo || i + 1)}</td>
                            <td className="py-2 px-3 font-medium max-w-xs truncate">{c.companyName}</td>
                            <td className="py-2 px-3 font-mono text-[11px]">{c.caseNo}</td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
                                {c.court}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                              {formatCrore(c.amountCrore, false)}
                            </td>
                            <td className="py-2 px-3 max-w-xs truncate text-[11px] text-slate-500">
                              {c.latestStatus || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Mode Selection */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-500" />
                  ইমপোর্ট মোড নির্বাচন করুন:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    importMode === 'append'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-bold text-xs">বর্তমান মামলার সাথে যুক্ত করুন (Append)</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        বর্তমান {toBengaliNumber(currentCount)}টি মামলার সাথে নতুন {toBengaliNumber(parsedData.validCount)}টি মামলা যুক্ত হবে (মোট: {toBengaliNumber(currentCount + parsedData.validCount)}টি)।
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    importMode === 'replace'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200 ring-1 ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-bold text-xs text-rose-700 dark:text-rose-300">বর্তমান সব মামলা প্রতিস্থাপন করুন (Replace All)</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        বর্তমান {toBengaliNumber(currentCount)}টি মামলা মুছে শুধুমাত্র নতুন {toBengaliNumber(parsedData.validCount)}টি মামলা ডাটাবেসে থাকবে।
                      </div>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          )}

        </div>

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
              onClick={handleConfirmImport}
              disabled={!parsedData || parsedData.validCount === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Check className="w-4 h-4" />
              <span>
                {parsedData && parsedData.validCount > 0 
                  ? `ডাটাবেসে ইমপোর্ট সম্পন্ন করুন (${toBengaliNumber(parsedData.validCount)}টি মামলা)`
                  : 'ইমপোর্ট সম্পন্ন করুন'
                }
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
