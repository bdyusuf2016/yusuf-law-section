import React from 'react';
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
  RotateCcw,
  Sparkles,
  Printer,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { UserSession } from '../types/case';

interface HeaderProps {
  onAddNew: () => void;
  onOpenCharts: () => void;
  isChartsOpen: boolean;
  onOpenAppsScript: () => void;
  onOpenExport: () => void;
  onOpenMonthlyReport?: () => void;
  onOpenMonthlyDynamics?: () => void;
  onPrint?: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenAuth: () => void;
  session: UserSession;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddNew,
  onOpenCharts,
  isChartsOpen,
  onOpenAppsScript,
  onOpenExport,
  onOpenMonthlyReport,
  onOpenMonthlyDynamics,
  onPrint,
  onOpenNotifications,
  unreadNotificationsCount,
  isDark,
  onToggleDark,
  onOpenAuth,
  session,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Branding & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                প্রতিষ্ঠান ভিত্তিক মামলা ব্যবস্থাপনা
              </h1>
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                কোটি টাকা রূপান্তর সহ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              রাজস্ব বকেয়া ট্র্যাকিং, গুগল অ্যাপস স্ক্রিপ্ট ও স্প্রেডশীট অটোমেশন ড্যাশবোর্ড
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Add New Case */}
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">নতুন মামলা যুক্ত করুন</span>
            <span className="sm:hidden">যুক্ত</span>
          </button>

          {/* Chart Gallery Toggle */}
          <button
            onClick={onOpenCharts}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isChartsOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="চার্ট গ্যালারি দেখুন"
          >
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <span className="hidden md:inline">চার্ট গ্যালারি</span>
          </button>

          {/* Google Apps Script Button */}
          <button
            onClick={onOpenAppsScript}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            title="Google Apps Script কোড ও স্প্রেডশীট ইন্টিগ্রেশন"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">Apps Script</span>
          </button>

          {/* Monthly Report Generator Button */}
          {onOpenMonthlyReport && (
            <button
              onClick={onOpenMonthlyReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-semibold transition-colors shadow-2xs"
              title="প্রতি মাসের সরকারি ছকে মামলার তথ্য প্রস্তুত ও মুদ্রণ করুন"
            >
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">মাসিক প্রতিবেদন</span>
            </button>
          )}

          {/* Monthly Dynamics & Return Button */}
          {onOpenMonthlyDynamics && (
            <button
              onClick={onOpenMonthlyDynamics}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-semibold transition-colors shadow-2xs"
              title="চলতি মাসের নতুন মামলা, জড়িত রাজস্ব ও নিষ্পত্তিকৃত মামলার তথ্য রিটার্ন"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xl:inline">মামলা গতিশীলতা ও রিটার্ন</span>
              <span className="xl:hidden">রিটার্ন</span>
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            title="Excel ও কলামভিত্তিক এক্সপোর্ট"
          >
            <FileDown className="w-4 h-4 text-teal-500" />
            <span className="hidden md:inline">এক্সপোর্ট</span>
          </button>

          {/* Direct Print Button */}
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-semibold transition-colors shadow-2xs"
              title="ফিল্টারকৃত তালিকার অফিশিয়াল সরকারি রিপোর্ট প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">প্রিন্ট</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="নোটিফিকেশন ও আইনি অ্যালার্ট"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'লাইট মোড সক্রিয় করুন' : 'ডার্ক মোড সক্রিয় করুন'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Security / Login Profile */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              session.isLoggedIn
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-700'
            }`}
            title="নিরাপদ লগইন ও ব্যবহারকারী নিয়ন্ত্রণ"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span className="hidden xl:inline">{session.username}</span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
              {session.role === 'admin' ? 'Admin' : 'Officer'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
