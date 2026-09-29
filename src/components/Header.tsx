import React, { useState, useRef, useEffect } from 'react';
import { 
  Scale, 
  Plus, 
  BarChart3, 
  FileSpreadsheet, 
  FileDown, 
  Bell, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Printer, 
  Calendar, 
  TrendingUp, 
  Landmark, 
  ScrollText, 
  Upload, 
  Settings, 
  Maximize2,
  Minimize2,
  ChevronDown,
  RotateCcw,
  Monitor,
  Layout,
  Type,
  Eye,
  Check,
  Sparkles
} from 'lucide-react';
import { UserSession } from '../types/case';
import { GlobalSettings } from '../types/settings';
import { loadAuthState } from '../utils/authStorage';

interface HeaderProps {
  activeModule?: 'cases' | 'circle' | 'auth';
  onChangeModule?: (module: 'cases' | 'circle' | 'auth') => void;
  onAddNew: () => void;
  onAddNewTribunal?: () => void;
  onAddNewCertificate?: () => void;
  onOpenCharts: () => void;
  isChartsOpen: boolean;
  onOpenAppsScript: () => void;
  onOpenExport: () => void;
  onOpenImport?: () => void;
  onOpenMonthlyReport?: () => void;
  onOpenMonthlyDynamics?: () => void;
  onPrint?: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenAuth: () => void;
  onOpenSettings?: () => void;
  session: UserSession;
  onResetData: () => void;
  globalSettings?: GlobalSettings;
  onUpdateSettings?: (settings: GlobalSettings) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule = 'cases',
  onChangeModule,
  onAddNew,
  onAddNewTribunal,
  onAddNewCertificate,
  onOpenCharts,
  isChartsOpen,
  onOpenAppsScript,
  onOpenExport,
  onOpenImport,
  onOpenMonthlyReport,
  onOpenMonthlyDynamics,
  onPrint,
  onOpenNotifications,
  unreadNotificationsCount,
  isDark,
  onToggleDark,
  onOpenAuth,
  onOpenSettings,
  session,
  onResetData,
  globalSettings,
  onUpdateSettings,
}) => {
  const [isEntryDropdownOpen, setIsEntryDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isScreenOptOpen, setIsScreenOptOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentUserDesignation, setCurrentUserDesignation] = useState('কমিশনার / সুপার অ্যাডমিন');

  const entryDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const screenOptRef = useRef<HTMLDivElement>(null);

  // Sync designation from persistent auth storage
  useEffect(() => {
    try {
      const auth = loadAuthState();
      if (auth.currentUser?.designationBangla) {
        setCurrentUserDesignation(auth.currentUser.designationBangla);
      } else if (session.role === 'admin') {
        setCurrentUserDesignation('কমিশনার / সুপার অ্যাডমিন');
      } else {
        setCurrentUserDesignation('কর্মকর্তা');
      }
    } catch {
      setCurrentUserDesignation(session.role === 'admin' ? 'কমিশনার / সুপার অ্যাডমিন' : 'কর্মকর্তা');
    }
  }, [session]);

  // Sync fullscreen change events (F11 or Escape from native browser)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (entryDropdownRef.current && !entryDropdownRef.current.contains(event.target as Node)) {
        setIsEntryDropdownOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
      if (screenOptRef.current && !screenOptRef.current.contains(event.target as Node)) {
        setIsScreenOptOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsEntryDropdownOpen(false);
        setIsToolsDropdownOpen(false);
        setIsScreenOptOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSafeReset = () => {
    setIsToolsDropdownOpen(false);
    if (window.confirm('আপনি কি নিশ্চিত যে সকল ডেমো ডাটা রিসেট করতে চান? আপনার সংরক্ষিত পরিবর্তনসমূহ ডিফল্ট অবস্থায় ফিরে যাবে।')) {
      onResetData();
    }
  };

  const handleQuickSettingChange = (patch: Partial<GlobalSettings>) => {
    if (globalSettings && onUpdateSettings) {
      onUpdateSettings({ ...globalSettings, ...patch });
    }
  };

  const isCompact = globalSettings?.screenDensity === 'compact';
  const isSpacious = globalSettings?.screenDensity === 'spacious';
  const isFullWidth = Boolean(globalSettings?.fullWidthLayout);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all duration-200 shadow-2xs w-full max-w-full">
      <div 
        className={`header-inner mx-auto flex items-center justify-between gap-1.5 sm:gap-2.5 lg:gap-4 w-full px-2 sm:px-4 lg:px-6 transition-all duration-200 ${
          isFullWidth ? 'max-w-full' : 'max-w-[1720px]'
        } ${
          isCompact ? 'h-13' : isSpacious ? 'h-18' : 'h-16'
        }`}
      >
        
        {/* ========================================================
            LEFT SECTION: BRANDING & SEGMENTED MODULE NAVIGATION
           ======================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3.5 min-w-0 shrink">
          
          {/* Logo Emblem & Compact Title */}
          <div className="flex items-center gap-2 shrink-0">
            <div 
              className={`app-logo-box rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0 transition-all ${
                isCompact ? 'w-8 h-8 rounded-lg' : 'w-9 h-9'
              }`}
            >
              <Scale className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
            </div>
            
            <div className="hidden sm:block min-w-0">
              <h1 className="font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1 leading-tight text-xs sm:text-sm lg:text-[14px] whitespace-nowrap">
                <span>মামলা ও রাজস্ব ড্যাশবোর্ড</span>
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5 truncate max-w-[120px] md:max-w-[180px] xl:max-w-[280px] hidden md:block">
                {globalSettings?.commissionerateName || 'কাস্টমস, এক্সাইজ ও ভ্যাট কমিশনারেট'}
              </p>
            </div>
          </div>

          {/* Module Switcher Segmented Control */}
          {onChangeModule && (
            <nav 
              aria-label="মডিউল নির্বাচন" 
              className="bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-0.5 shrink-0 shadow-inner"
            >
              {/* Tab 1: মামলা ড্যাশবোর্ড */}
              <button
                onClick={() => onChangeModule('cases')}
                className={`module-nav-btn px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 sm:gap-1.5 ${
                  activeModule === 'cases'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
                title="মামলা ব্যবস্থাপনা, হাইকোর্ট, ট্রাইব্যুনাল ও ধারা ২০২ রিকভারি ড্যাশবোর্ড"
              >
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">মামলা ড্যাশবোর্ড</span>
                <span className="xl:hidden">মামলা</span>
              </button>

              {/* Tab 2: সার্কেল কার্যপ্রবাহ */}
              <button
                onClick={() => onChangeModule('circle')}
                className={`module-nav-btn px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 sm:gap-1.5 ${
                  activeModule === 'circle'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
                title="সার্কেল কার্যপ্রবাহ, চেকলিস্ট, নোটিশ, বিচারাদেশ ও অফিসার অ্যাসাইনমেন্ট"
              >
                <ScrollText className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span className="hidden xl:inline">সার্কেল কার্যপ্রবাহ</span>
                <span className="xl:hidden">সার্কেল</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5 shrink-0" />
              </button>

              {/* Tab 3: নিরাপত্তা সাবসিস্টেম */}
              <button
                onClick={() => onChangeModule('auth')}
                className={`module-nav-btn hidden lg:flex px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all duration-150 items-center gap-1 sm:gap-1.5 ${
                  activeModule === 'auth'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
                title="অফিসিয়াল নিরাপত্তা, রোল পারমিশন ও অ্যাক্সেস কন্ট্রোল"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                <span>নিরাপত্তা</span>
              </button>
            </nav>
          )}

        </div>

        {/* ========================================================
            RIGHT SECTION: STREAMLINED ACTION CLUSTER & CONTROLS
           ======================================================== */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

          {/* 1. PRIMARY ACTION DROPDOWN: + নতুন এন্ট্রি */}
          <div className="relative" ref={entryDropdownRef}>
            <button
              onClick={() => setIsEntryDropdownOpen(!isEntryDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={isEntryDropdownOpen}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all duration-150 active:scale-[0.98] ${
                isCompact ? 'px-2 py-1.5' : 'px-2.5 sm:px-3 py-1.5 sm:py-2'
              }`}
              title="নতুন মামলা বা ট্রাইব্যুনাল এন্ট্রি করুন"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">নতুন এন্ট্রি</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 shrink-0 ${isEntryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isEntryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  রেকর্ড বা মামলা সংযোজন
                </div>

                {/* Option 1: High Court / General Case */}
                <button
                  onClick={() => {
                    setIsEntryDropdownOpen(false);
                    onAddNew();
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 shadow-2xs">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">সাধারণ / হাইকোর্ট মামলা</div>
                    <div className="text-[10px] text-slate-400">রীট, দেওয়ানি রিভিশন, কাস্টমস ও মূসক আপীল</div>
                  </div>
                </button>

                {/* Option 2: Tribunal Case */}
                {onAddNewTribunal && (
                  <button
                    onClick={() => {
                      setIsEntryDropdownOpen(false);
                      onAddNewTribunal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors border-t border-slate-100 dark:border-slate-700/60"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 shadow-2xs">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">আপিলাত ট্রাইব্যুনাল এন্ট্রি</div>
                      <div className="text-[10px] text-slate-400">বেঞ্চ তথ্য ও ১০% প্রাক-জমা সহ ট্রাইব্যুনাল মামলা</div>
                    </div>
                  </button>
                )}

                {/* Option 3: Certificate & Section 202 Case */}
                {onAddNewCertificate && (
                  <button
                    onClick={() => {
                      setIsEntryDropdownOpen(false);
                      onAddNewCertificate();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/50 text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors border-t border-slate-100 dark:border-slate-700/60"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                      <ScrollText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">সার্টিফিকেট মামলা ও ধারা ২০২</div>
                      <div className="text-[10px] text-slate-400">পিডিআর অ্যাক্ট ও কাস্টমস ধারা ২০২ রিকভারি</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. SECONDARY ACTION DROPDOWN: রিপোর্ট ও টুলস */}
          <div className="relative" ref={toolsDropdownRef}>
            <button
              onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={isToolsDropdownOpen}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-2xs ${
                isCompact ? 'px-2 py-1.5' : 'px-2 sm:px-2.5 py-1.5 sm:py-2'
              }`}
              title="রিপোর্ট তৈরি, এক্সপোর্ট, ইমপোর্ট ও চার্ট বিশ্লেষণ"
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="hidden lg:inline">রিপোর্ট ও টুলস</span>
              <span className="hidden sm:inline lg:hidden">রিপোর্ট</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 shrink-0 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isToolsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Section 1: Analytics & Reports */}
                <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  অ্যানালিটিক্স ও রিপোর্ট
                </div>

                {/* Charts Toggle */}
                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    onOpenCharts();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    <span>চার্ট গ্যালারি ও গ্রাফিক্যাল বিশ্লেষণ</span>
                  </div>
                  {isChartsOpen && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900" />
                  )}
                </button>

                {/* Monthly Dynamics */}
                {onOpenMonthlyDynamics && (
                  <button
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onOpenMonthlyDynamics();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>চলতি মাসের গতিশীলতা ও রিটার্ন</span>
                  </button>
                )}

                {/* Monthly Report */}
                {onOpenMonthlyReport && (
                  <button
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onOpenMonthlyReport();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>মাসিক সরকারি প্রতিবেদন (ফরম্যাট)</span>
                  </button>
                )}

                <div className="my-1.5 border-t border-slate-100 dark:border-slate-700" />

                {/* Section 2: Data & Cloud Sync */}
                <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ডাটা ও ক্লাউড সিঙ্ক
                </div>

                {/* Apps Script */}
                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    onOpenAppsScript();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Google Apps Script সিঙ্ক</span>
                </button>

                {/* Import */}
                {onOpenImport && (
                  <button
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onOpenImport();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>ফাইল ইমপোর্ট (Excel / CSV)</span>
                  </button>
                )}

                {/* Export */}
                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    onOpenExport();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                >
                  <FileDown className="w-4 h-4 text-teal-500" />
                  <span>ডাটা এক্সপোর্ট (Excel / CSV)</span>
                </button>

                {/* Print */}
                {onPrint && (
                  <button
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onPrint();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>অফিশিয়াল রিপোর্ট প্রিন্ট</span>
                  </button>
                )}

                <div className="my-1.5 border-t border-slate-100 dark:border-slate-700" />

                {/* Section 3: Maintenance */}
                <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ডাটাবেজ রক্ষণাবেক্ষণ
                </div>

                <button
                  onClick={handleSafeReset}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-rose-500" />
                  <span>ডাটাবেজ রিসেট ও ডেমো রিস্টোর</span>
                </button>

              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* ========================================================
              3. COMPACT UTILITY CLUSTER (No Overflows)
             ======================================================== */}
          <div className="flex items-center gap-0.5 sm:gap-1">

            {/* QUICK SCREEN OPTIMIZER BUTTON & POPOVER */}
            <div className="relative" ref={screenOptRef}>
              <button
                onClick={() => setIsScreenOptOpen(!isScreenOptOpen)}
                aria-haspopup="true"
                aria-expanded={isScreenOptOpen}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs transition-colors"
                title="স্ক্রিন অপটিমাইজার (ঘনত্ব, লেআউট বিস্তার ও ফন্ট স্কেলিং)"
              >
                <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {isScreenOptOpen && (
                <div className="absolute right-0 mt-2 w-76 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/80">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        স্ক্রিন ও ডিসপ্লে অপটিমাইজার
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded font-mono">
                      {window.innerWidth}px
                    </span>
                  </div>

                  {/* 1. Screen Density */}
                  <div className="mb-3">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                      স্ক্রিন ঘনত্ব (Screen Density)
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
                      <button
                        onClick={() => handleQuickSettingChange({ screenDensity: 'compact' })}
                        className={`py-1.5 px-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                          globalSettings?.screenDensity === 'compact'
                            ? 'bg-indigo-600 text-white shadow-xs font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                        title="কমপ্যাক্ট ঘনত্ব: ল্যাপটপ বা ছোট রেজুল্যুশনে বেশি ডাটা সারি দেখতে উপযুক্ত"
                      >
                        ⚡ কমপ্যাক্ট
                      </button>
                      <button
                        onClick={() => handleQuickSettingChange({ screenDensity: 'comfortable' })}
                        className={`py-1.5 px-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                          (!globalSettings || globalSettings.screenDensity === 'comfortable')
                            ? 'bg-indigo-600 text-white shadow-xs font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                        title="স্বাভাবিক ঘনত্ব: ব্যালান্সড ভিউ"
                      >
                        📱 স্বাভাবিক
                      </button>
                      <button
                        onClick={() => handleQuickSettingChange({ screenDensity: 'spacious' })}
                        className={`py-1.5 px-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                          globalSettings?.screenDensity === 'spacious'
                            ? 'bg-indigo-600 text-white shadow-xs font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                        title="প্রশস্ত ঘনত্ব: বড় মনিটরের জন্য রিল্যাক্সড ভিউ"
                      >
                        🖥️ প্রশস্ত
                      </button>
                    </div>
                  </div>

                  {/* 2. Full Width Layout Toggle */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">পূর্ণ পর্দা বিস্তার (100% Width)</div>
                          <div className="text-[10px] text-slate-400">সম্পূর্ণ মনিটরের প্রস্থ ব্যবহার করুন</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isFullWidth}
                        onChange={(e) => handleQuickSettingChange({ fullWidthLayout: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 3. Font Scale */}
                  <div className="mb-3">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                      টেক্সট ও ফন্ট সাইজ (Font Scale)
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
                      <button
                        onClick={() => handleQuickSettingChange({ fontScale: 'sm' })}
                        className={`py-1 text-center rounded-lg text-xs font-bold transition-all ${
                          globalSettings?.fontScale === 'sm'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        A- ছোট
                      </button>
                      <button
                        onClick={() => handleQuickSettingChange({ fontScale: 'md' })}
                        className={`py-1 text-center rounded-lg text-xs font-bold transition-all ${
                          (!globalSettings || globalSettings.fontScale === 'md')
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        A স্বাভাবিক
                      </button>
                      <button
                        onClick={() => handleQuickSettingChange({ fontScale: 'lg' })}
                        className={`py-1 text-center rounded-lg text-xs font-bold transition-all ${
                          globalSettings?.fontScale === 'lg'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        A+ বড়
                      </button>
                    </div>
                  </div>

                  {/* 4. Fullscreen & High Contrast */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                    <button
                      onClick={handleToggleFullscreen}
                      className="py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      <span>{isFullscreen ? 'ফুলস্ক্রিন অফ' : 'ফুলস্ক্রিন (F11)'}</span>
                    </button>

                    <button
                      onClick={() => handleQuickSettingChange({ highContrastMode: !globalSettings?.highContrastMode })}
                      className={`py-1.5 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        globalSettings?.highContrastMode
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>হাই-কনট্রাস্ট</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shadow-2xs"
              title="আইনি অ্যালার্ট ও নোটিফিকেশন"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Fullscreen Quick Toggle (visible on xl+) */}
            <button
              onClick={handleToggleFullscreen}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 items-center justify-center transition-colors hidden xl:flex shadow-2xs"
              title={isFullscreen ? 'ফুলস্ক্রিন বন্ধ করুন' : 'পূর্ণ স্ক্রীন মোড (F11)'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Global Settings Gear */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors group shadow-2xs"
                title="গ্লোবাল সেটিংস, ব্র্যান্ডিং ও ব্যাকআপ"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 group-hover:rotate-45 transition-transform duration-200" />
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDark}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shadow-2xs"
              title={isDark ? 'লাইট মোড সক্রিয় করুন' : 'ডার্ক মোড সক্রিয় করুন'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />}
            </button>

          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* 4. USER PROFILE & ACCESS CAPSULE */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 rounded-xl border text-xs font-medium transition-all shadow-2xs px-1.5 py-1 ${
              session.isLoggedIn
                ? 'bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
            title="নিরাপদ লগইন, পদবী পরিবর্তন ও ব্যবহারকারী নিয়ন্ত্রণ"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
              {session.username ? session.username.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="text-left hidden 2xl:block leading-tight">
              <div className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[90px] text-xs">
                {session.username}
              </div>
              <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[90px]">
                {currentUserDesignation}
              </div>
            </div>

            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                session.isLoggedIn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
          </button>

        </div>

      </div>
    </header>
  );
};
