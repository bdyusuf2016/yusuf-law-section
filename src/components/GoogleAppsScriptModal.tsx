import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Send, 
  HelpCircle, 
  Code2, 
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { CaseRecord } from '../types/case';
import { generateGoogleAppsScript } from '../utils/googleAppsScript';
import { loadWebhookUrl, saveWebhookUrl } from '../utils/storage';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: CaseRecord[];
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
  cases,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [webhookUrl, setWebhookUrl] = useState<string>(loadWebhookUrl());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'script' | 'instructions' | 'sync'>('script');

  if (!isOpen) return null;

  const scriptCode = generateGoogleAppsScript(cases);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSyncToSheets = async () => {
    if (!webhookUrl.trim()) {
      setSyncMessage('⚠️ অনুগ্রহ করে আপনার Google Apps Script Web App URL প্রদান করুন।');
      return;
    }
    saveWebhookUrl(webhookUrl);
    setIsSyncing(true);
    setSyncMessage('');

    try {
      // In web browser context, sending POST or GET to script.google.com
      const samplePayload = {
        action: 'bulk_sync',
        timestamp: new Date().toISOString(),
        totalCases: cases.length,
        cases: cases
      };

      // We send beacon/fetch or test endpoint
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samplePayload),
        mode: 'no-cors' // Google Apps Script Web Apps usually require no-cors or redirect handling
      });

      setSyncMessage('✅ গুগল স্প্রেডশীটে ডাটা প্রেরণের অনুরোধ সফলভাবে সম্পন্ন হয়েছে!');
    } catch (err: any) {
      setSyncMessage('❌ সিঙ্ক ত্রুটি: ' + (err.message || 'নেটওয়ার্ক সমস্যা। ইউআরএল ও ডিপ্লয়মেন্ট সেটিংস চেক করুন।'));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Google Apps Script কোড ও স্প্রেডশীট ইন্টিগ্রেশন
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  সরাসরি সিঙ্ক
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                এই স্ক্রিপ্টটি আপনার Google Sheet-এ কাস্টম মেনু, কোটি টাকায় রূপান্তরের ফর্মুলা এবং এন্ট্রি ফর্ম যুক্ত করবে।
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-2.5 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'script'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code.gs স্ক্রিপ্ট
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'instructions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            ব্যবহার নির্দেশিকা (গাইড)
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            সরাসরি স্প্রেডশীট সিঙ্ক (API)
          </button>
        </div>

        {/* Tab 1: Script Viewer */}
        {activeTab === 'script' && (
          <div className="p-6 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                গুগল শিটে <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-indigo-600">Extensions &gt; Apps Script</code> এ গিয়ে নিচের কোডটি পেস্ট করুন:
              </span>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'কোড কপি হয়েছে!' : 'সম্পূর্ণ কোড কপি করুন'}
              </button>
            </div>

            <div className="flex-1 bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-[11px] overflow-auto border border-slate-800 shadow-inner">
              <pre className="whitespace-pre">{scriptCode}</pre>
            </div>
          </div>
        )}

        {/* Tab 2: Instructions */}
        {activeTab === 'instructions' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
              <h3 className="font-bold text-indigo-950 dark:text-indigo-200 text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                কীভাবে গুগল স্প্রেডশীটে এই স্ক্রিপ্ট সেটআপ করবেন:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-indigo-900 dark:text-indigo-300 leading-relaxed">
                <li>আপনার গুগল ড্রাইভে একটি নতুন Google Spreadsheet তৈরি করুন অথবা বিদ্যমান শিট ওপেন করুন।</li>
                <li>উপরের মেনুবার থেকে <strong className="font-semibold text-indigo-950 dark:text-indigo-100">Extensions &gt; Apps Script</strong> এ ক্লিক করুন।</li>
                <li>সেখানে থাকা ডিফল্ট <code className="bg-white dark:bg-slate-800 px-1 rounded">myFunction()</code> কোড মুছে দিয়ে এই অ্যাপের সম্পূর্ণ কোড কপি করে পেস্ট করুন।</li>
                <li>উপরের <strong className="font-semibold">Save 💾</strong> আইকনে ক্লিক করে স্ক্রিপ্টটি সংরক্ষণ করুন।</li>
                <li><strong className="font-semibold">initializeCaseSheet</strong> সিলেক্ট করে <strong className="font-semibold">Run</strong> এ ক্লিক করুন (প্রথমবার প্রয়োজনীয় পারমিশন দিন)।</li>
                <li>এবার স্প্রেডশীটে ফিরে এলে দেখতে পাবেন স্বয়ংক্রিয়ভাবে <strong className="font-semibold">⚖️ মামলা ব্যবস্থাপনা</strong> মেনু এবং <strong className="font-semibold">বকেয়ার পরিমাণ (কোটি টাকা)</strong> কলাম তৈরি হয়ে গেছে!</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                  🧮 কাস্টম কোটি টাকার ফর্মুলা
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  স্প্রেডশীটের যেকোনো সেলে নিচের ফর্মুলা লিখলেই টাকার পরিমাণ স্বয়ংক্রিয়ভাবে কোটিতে রূপান্তরিত হবে:
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs">
                  =CONVERT_TO_CRORE(H2)
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  অথবা স্ট্যান্ডার্ড ফর্মুলা: <code className="text-indigo-600 font-mono">=ROUND(H2/10000000, 4)</code>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                  📥 কাস্টম ইউজার ফর্ম (Dialog)
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  গুগল শিটে <strong className="text-slate-800 dark:text-slate-200">⚖️ মামলা ব্যবস্থাপনা &gt; নতুন মামলা এন্ট্রি ফর্ম</strong> এ ক্লিক করলে সরাসরি স্প্রেডশীটের ভেতর একটি সুন্দর ফর্ম চালু হবে, যেখানে তথ্য লিখে সেভ করলেই নতুন সারি যোগ হবে।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Direct Webhook Sync */}
        {activeTab === 'sync' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2">
                🌐 গুগল স্প্রেডশীট ওয়েব অ্যাপের সাথে সরাসরি দুইমুখী সিঙ্ক
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                আপনি যদি চান এই ওয়েব অ্যাপ থেকে সরাসরি এক ক্লিকে গুগল স্প্রেডশীটে ডাটা পাঠাতে, তবে আপনার Apps Script-এ <strong className="font-semibold text-slate-800 dark:text-slate-200">Deploy &gt; New Deployment &gt; Web app</strong> হিসেবে ডিপ্লয় করে URL-টি এখানে দিন:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Google Apps Script Web App URL
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSyncToSheets}
                    disabled={isSyncing}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'ডাটা সিঙ্ক হচ্ছে...' : 'স্প্রেডশীটে সরাসরি ডাটা সিঙ্ক করুন'}
                  </button>
                  <span className="text-slate-400">({cases.length} টি মামলা পাঠানো হবে)</span>
                </div>

                {syncMessage && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    {syncMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 shrink-0">
          <div className="text-[11px] text-slate-400">
            স্প্রেডশীটে ১০০% বাংলা ইউনিকোড ফন্ট ও ফর্মুলা সামঞ্জস্যপূর্ণ
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
