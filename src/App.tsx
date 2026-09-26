import React, { useState, useEffect, useMemo } from 'react';
import { 
  loadCachedCases, 
  saveCachedCases, 
  resetToDefaultCases,
  loadUserSession,
  saveUserSession,
  generateSystemNotifications
} from './utils/storage';
import { CaseRecord, FilterState, UserSession, SystemNotification } from './types/case';
import { takaToCrore, getStatusCategory, formatCrore, formatTaka, toBengaliNumber } from './utils/converter';
import { printCaseTable } from './utils/printReport';

import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { CaseFilter } from './components/CaseFilter';
import { CaseTable } from './components/CaseTable';
import { CaseModal } from './components/CaseModal';
import { CaseDetailModal } from './components/CaseDetailModal';
import { ChartGallery } from './components/ChartGallery';
import { GoogleAppsScriptModal } from './components/GoogleAppsScriptModal';
import { ExportModal } from './components/ExportModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { MonthlyDynamicsModal } from './components/MonthlyDynamicsModal';
import { NotificationCenter } from './components/NotificationCenter';
import { AuthModal } from './components/AuthModal';

import { 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Scale, 
  Building2,
  Calendar,
  TrendingUp
} from 'lucide-react';

export default function App() {
  // 1. Core State
  const [cases, setCases] = useState<CaseRecord[]>(() => loadCachedCases());
  const [session, setSession] = useState<UserSession>(() => loadUserSession());
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => generateSystemNotifications(cases));

  // 2. Dark Mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('bd_court_theme');
    if (saved) return saved === 'dark';
    return false; // Default to Light Mode so light mode is active on load
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('bd_court_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('bd_court_theme', 'light');
    }
  }, [isDark]);

  // 3. Modals & Panels State
  const [isChartsOpen, setIsChartsOpen] = useState<boolean>(false);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState<boolean>(false);
  const [editingCase, setEditingCase] = useState<CaseRecord | null>(null);
  const [viewingCase, setViewingCase] = useState<CaseRecord | null>(null);
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState<boolean>(false);
  const [isMonthlyDynamicsOpen, setIsMonthlyDynamicsOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 4. Toast notification
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateCase = (updated: CaseRecord) => {
    setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
    showToast(`${updated.companyName} মামলার স্থিতি আপডেট করা হয়েছে!`);
  };

  // 5. Filters State
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    court: 'all',
    caseType: 'all',
    year: 'all',
    amountRange: 'all',
    statusCategory: 'all'
  });

  // Save to cache whenever cases change
  useEffect(() => {
    saveCachedCases(cases);
    setNotifications(generateSystemNotifications(cases));
  }, [cases]);

  // Derived options for dropdown filters
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(cases.map(c => c.caseYear).filter(Boolean))).sort().reverse();
    return years;
  }, [cases]);

  const availableCaseTypes = useMemo(() => {
    return Array.from(new Set(cases.map(c => c.caseType).filter(Boolean))).sort();
  }, [cases]);

  const availableCourts = useMemo(() => {
    return Array.from(new Set(cases.map(c => c.court).filter(Boolean))).sort();
  }, [cases]);

  // Filtered dataset
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Search query
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matches = 
          c.companyName.toLowerCase().includes(q) ||
          (c.caseNo && c.caseNo.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.latestStatus && c.latestStatus.toLowerCase().includes(q)) ||
          (c.remarks && c.remarks.toLowerCase().includes(q)) ||
          (c.supremeCourtUrl && c.supremeCourtUrl.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Court filter
      if (filter.court !== 'all') {
        if (!c.court.includes(filter.court)) return false;
      }

      // Case Type
      if (filter.caseType !== 'all') {
        if (c.caseType !== filter.caseType) return false;
      }

      // Year
      if (filter.year !== 'all') {
        if (c.caseYear !== filter.year) return false;
      }

      // Amount Range
      if (filter.amountRange !== 'all') {
        if (filter.amountRange === '50_plus' && c.amountCrore < 50) return false;
        if (filter.amountRange === '10_50' && (c.amountCrore < 10 || c.amountCrore >= 50)) return false;
        if (filter.amountRange === '1_10' && (c.amountCrore < 1 || c.amountCrore >= 10)) return false;
        if (filter.amountRange === 'under_1' && (c.amountCrore <= 0 || c.amountCrore >= 1)) return false;
        if (filter.amountRange === 'zero' && c.amountCrore > 0) return false;
      }

      // Status Category
      if (filter.statusCategory !== 'all') {
        const cat = getStatusCategory(c.latestStatus, c.remarks);
        if (cat !== filter.statusCategory) return false;
      }

      return true;
    });
  }, [cases, filter]);

  // CRUD Handlers
  const handleSaveCase = (formData: Partial<CaseRecord>) => {
    if (editingCase) {
      // Update existing
      setCases(prev => prev.map(item => {
        if (item.id === editingCase.id) {
          const taka = Number(formData.amountTaka) || 0;
          return {
            ...item,
            ...formData,
            amountTaka: taka,
            amountCrore: takaToCrore(taka),
            statusCategory: getStatusCategory(formData.latestStatus || item.latestStatus, formData.remarks || item.remarks),
            updatedAt: new Date().toISOString()
          } as CaseRecord;
        }
        return item;
      }));
      showToast('মামলার তথ্য সফলভাবে হালনাগাদ (Edit) করা হয়েছে!');
    } else {
      // Add new
      const taka = Number(formData.amountTaka) || 0;
      const newCase: CaseRecord = {
        id: 'case-' + Date.now(),
        slNo: formData.slNo || (cases.length + 1),
        companyName: formData.companyName || '',
        address: formData.address || '',
        circle: formData.circle || '',
        caseType: formData.caseType || 'রীট পিটিশন',
        caseYear: formData.caseYear || '২০২৬',
        caseNo: formData.caseNo || '',
        amountTaka: taka,
        amountCrore: takaToCrore(taka),
        court: formData.court || 'হাইকোর্ট',
        description: formData.description || '',
        latestStatus: formData.latestStatus || '',
        remarks: formData.remarks || '',
        supremeCourtUrl: formData.supremeCourtUrl || '',
        statusCategory: getStatusCategory(formData.latestStatus || '', formData.remarks || ''),
        updatedAt: new Date().toISOString()
      };
      setCases(prev => [newCase, ...prev]);
      showToast('নতুন মামলা সফলভাবে ডাটাবেসে যুক্ত ও ক্যাশ করা হয়েছে!');
    }
    setEditingCase(null);
  };

  const handleDeleteCase = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই মামলাটি ডাটাবেস থেকে মুছে ফেলতে চান?')) {
      setCases(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      showToast('মামলাটি মুছে ফেলা হয়েছে!', 'info');
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`আপনি কি নির্বাচিত ${selectedIds.length}টি মামলা একসাথে মুছে ফেলতে চান?`)) {
      setCases(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      showToast(`${selectedIds.length}টি মামলা সফলভাবে মুছে ফেলা হয়েছে!`, 'info');
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('সতর্কতা: এটি ক্যাশের সমস্ত পরিবর্তন মুছে মূল প্রাথমিক ডাটাবেস রিস্টোর করবে। আপনি কি এগিয়ে যেতে চান?')) {
      const def = resetToDefaultCases();
      setCases(def);
      setSelectedIds([]);
      showToast('ডাটাবেস সফলভাবে প্রাথমিক অবস্থায় রিস্টোর করা হয়েছে!');
    }
  };

  const handleQuickFilter = (field: string, value: string) => {
    if (field === 'court') {
      setFilter(prev => ({ ...prev, court: value }));
    } else if (field === 'status') {
      setFilter(prev => ({ ...prev, statusCategory: value }));
    }
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors`}>
      
      {/* Printable Header (Visible only when printed / saved to PDF) */}
      <div className="print-only p-6 border-b border-slate-300 mb-4 text-center">
        <h1 className="text-xl font-bold">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h1>
        <h2 className="text-base font-semibold">প্রতিষ্ঠান ভিত্তিক মামলাধীন রাজস্ব ও আইনি তথ্যাদি</h2>
        <p className="text-xs text-slate-600 mt-1">
          তারিখ: {new Date().toLocaleDateString('bn-BD')} | মোট মামলা: {toBengaliNumber(filteredCases.length)} টি | 
          মোট বকেয়া: {formatCrore(filteredCases.reduce((sum, c) => sum + c.amountCrore, 0))}
        </p>
      </div>

      {/* Main App Navigation Header */}
      <Header
        onAddNew={() => {
          setEditingCase(null);
          setIsCaseModalOpen(true);
        }}
        onOpenCharts={() => setIsChartsOpen(prev => !prev)}
        isChartsOpen={isChartsOpen}
        onOpenAppsScript={() => setIsAppsScriptModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenMonthlyReport={() => setIsMonthlyReportOpen(true)}
        onOpenMonthlyDynamics={() => setIsMonthlyDynamicsOpen(true)}
        onPrint={() => printCaseTable(filteredCases)}
        onOpenNotifications={() => setIsNotifOpen(true)}
        unreadNotificationsCount={unreadNotifCount}
        isDark={isDark}
        onToggleDark={() => setIsDark(prev => !prev)}
        onOpenAuth={() => setIsAuthOpen(true)}
        session={session}
        onResetData={handleResetToDefault}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner / Notice Bar */}
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-800/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>স্মার্ট মামলা ট্র্যাকিং ও গুগল শিট রূপান্তর ইঞ্জিন</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                  v2.0 ক্যাশ সচল
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5 leading-relaxed">
                সকল বকেয়ার পরিমাণ স্বয়ংক্রিয়ভাবে কোটি টাকায় রূপান্তর, সর্বোচ্চ রাজস্ব খেলাপিদের বিশ্লেষণ, এবং গুগল শিটের জন্য প্রস্তুত Apps Script কোড সংযুক্ত রয়েছে।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0 z-10">
            <button
              onClick={() => setIsMonthlyDynamicsOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-400/20"
              title="চলতি মাসের নতুন মামলা, জড়িত রাজস্ব ও নিষ্পত্তিকৃত মামলার গতিশীলতা রিটার্ন"
            >
              <TrendingUp className="w-4 h-4 text-slate-950" />
              নতুন মামলা ও রিটার্ন
            </button>
            <button
              onClick={() => setIsMonthlyReportOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/20"
              title="মাননীয় আদালতে বিচারাধীন মামলার মাসিক প্রতিবেদন তৈরি ও মুদ্রণ"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              মাসিক প্রতিবেদন
            </button>
            <button
              onClick={() => setIsAppsScriptModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Apps Script দেখুন
            </button>
            <button
              onClick={handleResetToDefault}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700"
              title="ডিফল্ট ডাটাবেস রিস্টোর করুন"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. Executive Stats Dashboard (KPI Cards) */}
        <StatsDashboard
          cases={cases}
          onQuickFilter={handleQuickFilter}
          activeFilterCourt={filter.court}
          activeFilterStatus={filter.statusCategory}
        />

        {/* 2. Interactive Chart Gallery (Collapsible / Toggleable) */}
        {isChartsOpen && (
          <div className="mb-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                📊 ডাটা ভিজ্যুয়ালাইজেশন ও চার্ট গ্যালারি
              </h2>
              <button
                onClick={() => setIsChartsOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline"
              >
                চার্ট লুকান
              </button>
            </div>
            <ChartGallery cases={filteredCases} />
          </div>
        )}

        {/* 3. Multi-Criteria Filter & Search */}
        <CaseFilter
          filter={filter}
          setFilter={setFilter}
          totalCount={cases.length}
          filteredCount={filteredCases.length}
          availableYears={availableYears}
          availableCaseTypes={availableCaseTypes}
          availableCourts={availableCourts}
        />

        {/* 4. Main Case Table */}
        <CaseTable
          cases={filteredCases}
          onView={(c) => setViewingCase(c)}
          onEdit={(c) => {
            setEditingCase(c);
            setIsCaseModalOpen(true);
          }}
          onDelete={handleDeleteCase}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onBulkDelete={handleBulkDelete}
          onExportSelected={() => setIsExportModalOpen(true)}
          isAdmin={session.role === 'admin'}
        />

      </main>

      {/* Footer */}
      <footer className="mt-auto py-5 border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © ২০২৬ প্রতিষ্ঠান ভিত্তিক রাজস্ব ও মামলা ট্র্যাকিং সিস্টেম • স্থানীয় ক্যাশ ও উচ্চ ক্ষমতাসম্পন্ন আর্কিটেকচার
          </span>
          <div className="flex items-center gap-4">
            <span>মোট সংরক্ষিত: {toBengaliNumber(cases.length)} টি প্রতিষ্ঠান</span>
            <button
              onClick={() => setIsAppsScriptModalOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              গুগল অ্যাপস স্ক্রিপ্ট ইন্টিগ্রেশন
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => {
          setIsCaseModalOpen(false);
          setEditingCase(null);
        }}
        onSave={handleSaveCase}
        initialData={editingCase}
      />

      <CaseDetailModal
        isOpen={!!viewingCase}
        caseData={viewingCase}
        onClose={() => setViewingCase(null)}
        onEdit={(c) => {
          setViewingCase(null);
          setEditingCase(c);
          setIsCaseModalOpen(true);
        }}
        isAdmin={session.role === 'admin'}
      />

      <GoogleAppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
        cases={cases}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        cases={selectedIds.length > 0 ? cases.filter(c => selectedIds.includes(c.id)) : filteredCases}
      />

      <MonthlyReportModal
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
        cases={cases}
      />

      <MonthlyDynamicsModal
        isOpen={isMonthlyDynamicsOpen}
        onClose={() => setIsMonthlyDynamicsOpen(false)}
        cases={cases}
        onUpdateCase={handleUpdateCase}
      />

      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }}
        onFilterByNotification={(notif) => {
          setIsNotifOpen(false);
          if (notif.id === 'notif-hearings-2026') {
            setFilter(prev => ({ ...prev, searchQuery: '2026' }));
          } else if (notif.id === 'notif-stay-orders') {
            setFilter(prev => ({ ...prev, statusCategory: 'stay' }));
          } else if (notif.id === 'notif-sc-cases') {
            setFilter(prev => ({ ...prev, court: 'সুপ্রিম কোর্ট' }));
          } else if (notif.id === 'notif-ag-action') {
            setFilter(prev => ({ ...prev, searchQuery: 'অ্যাটর্নি জেনারেল' }));
          }
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        session={session}
        setSession={setSession}
        totalCachedCases={cases.length}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500 shadow-rose-900/20'
              : toast.type === 'info'
              ? 'bg-slate-900 text-white border-slate-700 shadow-slate-900/30'
              : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/20'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast.text}</span>
          </div>
        </div>
      )}

    </div>
  );
}
