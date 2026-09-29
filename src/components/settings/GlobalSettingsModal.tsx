import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Monitor,
  Scale,
  Database,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Sparkles,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { GlobalSettings, DEFAULT_SETTINGS } from '../../types/settings';
import {
  saveGlobalSettings,
  exportFullSystemBackup,
  restoreFullSystemBackup,
  applyScreenOptimizations
} from '../../utils/settingsStorage';

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GlobalSettings;
  onSaveSettings: (newSettings: GlobalSettings) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  isDark,
  onToggleDark
}) => {
  const [formData, setFormData] = useState<GlobalSettings>(settings);
  const [activeTab, setActiveTab] = useState<'branding' | 'screen' | 'revenue' | 'backup'>('branding');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveGlobalSettings(formData);
    onSaveSettings(formData);
    showToast('গ্লোবাল সেটিংস ও স্ক্রিন অপটিমাইজেশন সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleResetToDefault = () => {
    if (window.confirm('আপনি কি সকল সেটিংস ডিফল্ট মানে রিসেট করতে চান?')) {
      setFormData(DEFAULT_SETTINGS);
      saveGlobalSettings(DEFAULT_SETTINGS);
      onSaveSettings(DEFAULT_SETTINGS);
      showToast('সকল সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে আনা হয়েছে!');
    }
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm('সতর্কতা: ব্যাকআপ ফাইল রিস্টোর করলে বর্তমান তথ্য প্রতিস্থাপিত হতে পারে। আপনি কি অগ্রসর হতে চান?')) {
      try {
        await restoreFullSystemBackup(file);
        alert('সফলভাবে সিস্টেম ব্যাকআপ রিস্টোর সম্পন্ন হয়েছে! পৃষ্ঠাটি রিলোড দেওয়া হচ্ছে...');
        window.location.reload();
      } catch (err) {
        alert('ব্যাকআপ ফাইলটি সঠিক নয় বা রিস্টোর করতে সমস্যা হয়েছে।');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold">
                  গ্লোবাল সেটিংস, স্ক্রীন অপটিমাইজেশন ও সিস্টেম কনফিগারেশন
                </h2>
                <p className="text-xs text-slate-300">
                  দপ্তর পরিচিতি, স্ক্রিনের তথ্য ঘনত্ব, ডিসপ্লে লেআউট ও আর্থিক প্যারামিটার নিয়ন্ত্রণ
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Subsystem Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-3 border-t border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'branding'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>দপ্তর ও ব্র্যান্ডিং</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('screen')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'screen'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>স্ক্রীন ও লেআউট অপটিমাইজেশন</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('revenue')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'revenue'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>আর্থিক ও আইনি প্যারামিটার</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'backup'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>সিস্টেম ব্যাকআপ ও রক্ষণাবেক্ষণ</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[68vh] overflow-y-auto text-xs">
            {toastMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{toastMsg}</span>
              </div>
            )}

            {/* TAB 1: BRANDING & OFFICE */}
            {activeTab === 'branding' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    কমিশনারেট ও দপ্তর সংক্রান্ত তথ্য
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    এ তথ্য শুনানির চিঠি, এক্সপোর্ট রিপোর্ট ও অফিশিয়াল প্রিন্ট নথিতে স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      কমিশনারেটের নাম
                    </label>
                    <input
                      type="text"
                      value={formData.commissionerateName}
                      onChange={(e) => setFormData({ ...formData, commissionerateName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      শাখা / বিভাগের নাম
                    </label>
                    <input
                      type="text"
                      value={formData.divisionName}
                      onChange={(e) => setFormData({ ...formData, divisionName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      কমিশনার মহোদয়ের নাম ও পদবি
                    </label>
                    <input
                      type="text"
                      value={formData.commissionerName}
                      onChange={(e) => setFormData({ ...formData, commissionerName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      অফিসের ঠিকানা
                    </label>
                    <input
                      type="text"
                      value={formData.officeAddress}
                      onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      অফিশিয়াল টেলিফোন / মোবাইল
                    </label>
                    <input
                      type="text"
                      value={formData.officePhone}
                      onChange={(e) => setFormData({ ...formData, officePhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      অফিশিয়াল ইমেইল
                    </label>
                    <input
                      type="email"
                      value={formData.officeEmail}
                      onChange={(e) => setFormData({ ...formData, officeEmail: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SCREEN & LAYOUT OPTIMIZATION */}
            {activeTab === 'screen' && (
              <div className="space-y-5">
                <div className="border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    ডিসপ্লে রেজোলিউশন ও স্ক্রীন অপটিমাইজেশন
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ল্যাপটপ, ডেস্কটপ বা বড় প্রজেক্টরের জন্য তথ্যের ঘনত্ব ও স্ক্রিন লেআউট নির্ধারণ করুন
                  </p>
                </div>

                {/* 1. Screen Density */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    তথ্যের ঘনত্ব (Screen Density)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, screenDensity: 'compact' })}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        formData.screenDensity === 'compact'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100">কম্প্যাক্ট মোড (Compact)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        টেবিল রো ছোট, কম স্ক্রলিংয়ে বেশি তথ্য দেখা যায়।
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, screenDensity: 'comfortable' })}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        formData.screenDensity === 'comfortable'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100">স্ট্যান্ডার্ড মোড (Default)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        আদর্শ প্যাডিং ও ভারসাম্যপূর্ণ ভিজ্যুয়াল স্পেসিং।
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, screenDensity: 'spacious' })}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        formData.screenDensity === 'spacious'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100">প্রশস্ত মোড (Spacious)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        বড় মনিটর ও প্রেজেন্টেশনের জন্য উপযুক্ত।
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Font Scale & Fullscreen */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="font-bold text-slate-800 dark:text-slate-200 block">
                      ফন্ট স্কেল (Font Scaling)
                    </label>
                    <div className="flex items-center gap-2">
                      {(['sm', 'md', 'lg'] as const).map(scale => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => setFormData({ ...formData, fontScale: scale })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            formData.fontScale === scale
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {scale === 'sm' ? 'ছোট (90%)' : scale === 'md' ? 'স্বাভাবিক (100%)' : 'বড় (115%)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="font-bold text-slate-800 dark:text-slate-200 block">
                      পূর্ণ স্ক্রীন মোড (Fullscreen)
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleFullscreen}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      <span>{isFullscreen ? 'ফুলস্ক্রিন বন্ধ করুন' : 'প্রেজেন্টেশন ফুলস্ক্রিন সক্রিয় করুন'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        ওয়াইড লেআউট মোড (Full Width Layout)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        স্ক্রীনের উভয় পাশের মার্জিন কমিয়ে আল্ট্রা-ওয়াইড ডিসপ্লে সর্বাধিক ব্যবহার করবে
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.fullWidthLayout}
                      onChange={(e) => setFormData({ ...formData, fullWidthLayout: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        স্মুথ এনিমেশন ও ইন্টারঅ্যাকশন
                      </div>
                      <div className="text-[11px] text-slate-500">
                        মোডাল, কার্ড ও চার্টের মাইক্রো-এনিমেশন চালু রাখবে
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableAnimations}
                      onChange={(e) => setFormData({ ...formData, enableAnimations: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: REVENUE & LEGAL */}
            {activeTab === 'revenue' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    আর্থিক বছর ও রাজস্ব আইনি প্যারামিটার
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    অর্থবছর, টাকার ডিসপ্লে ফরম্যাট এবং নোটিশ ও বকেয়া সতর্কবার্তা নির্ধারণ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      চলতি অর্থবছর
                    </label>
                    <select
                      value={formData.currentFiscalYear}
                      onChange={(e) => setFormData({ ...formData, currentFiscalYear: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                    >
                      <option value="২০২৫-২০২৬">২০২৫-২০২৬</option>
                      <option value="২০২৪-২০২৫">২০২৪-২০২৫</option>
                      <option value="২০২৩-২০২৪">২০২৩-২০২৪</option>
                      <option value="২০২৬-২০২৭">২০২৬-২০২৭</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      সংখ্যা প্রদর্শনের ভাষা
                    </label>
                    <select
                      value={formData.numberFormat}
                      onChange={(e) => setFormData({ ...formData, numberFormat: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                    >
                      <option value="bangla">বাংলা সংখ্যা (যেমন: ১২,৩৪৫.০০)</option>
                      <option value="english">ইংরেজি সংখ্যা (e.g. 12,345.00)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      শুনানি নোটিশ সতর্কবার্তা (দিন পূর্বে)
                    </label>
                    <input
                      type="number"
                      value={formData.hearingAlertDays}
                      onChange={(e) => setFormData({ ...formData, hearingAlertDays: parseInt(e.target.value, 10) || 7 })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      উচ্চ বকেয়া রেড অ্যালার্ট সীমা (কোটি টাকায়)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.redAlertArrearsCrore}
                      onChange={(e) => setFormData({ ...formData, redAlertArrearsCrore: parseFloat(e.target.value) || 1.0 })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BACKUP & SYSTEM MAINTENANCE */}
            {activeTab === 'backup' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    সিস্টেম ডেটা ব্যাকআপ ও রক্ষণাবেক্ষণ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    সম্পূর্ণ ডাটাবেসের একক ফাইল ব্যাকআপ ডাউনলোড ও যে কোনো সময় পুনরুদ্ধার
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Export Full Backup */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold">
                      <Download className="w-4 h-4" />
                      <span>সম্পূর্ণ ডাটা ব্যাকআপ ডাউনলোড</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      সকল মামলা, প্রতিষ্ঠান পরিচিতি, কর্মকর্তা ডিরেক্টরি, শুনানির চিঠি ও বিচারাদেশের সকল তথ্য একটি একক JSON ফাইলে ডাউনলোড হবে।
                    </p>
                    <button
                      type="button"
                      onClick={exportFullSystemBackup}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ব্যাকআপ ডাউনলোড করুন (JSON)</span>
                    </button>
                  </div>

                  {/* Restore Backup */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold">
                      <Upload className="w-4 h-4" />
                      <span>ব্যাকআপ থেকে ডাটা রিস্টোর</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      পূর্বে ডাউনলোড করা ব্যাকআপ JSON ফাইল সিলেক্ট করে সমস্ত ডাটা তাৎক্ষণিকভাবে সিস্টেমে ফিরিয়ে আনুন।
                    </p>
                    <label className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ব্যাকআপ ফাইল আপলোড করুন</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileRestore}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Reset Defaults */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-rose-600">ডিফল্ট সেটিংস রিসেট</div>
                    <div className="text-[11px] text-slate-400">সকল কনফিগারেশন ফ্যাক্টরি ডিফল্টে ফিরিয়ে আনুন</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-4 py-2 border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-colors"
                  >
                    রিসেট করুন
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 font-bold"
            >
              বাতিল
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>সেটিংস সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
