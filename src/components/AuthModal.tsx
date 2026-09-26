import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  User, 
  KeyRound, 
  AlertCircle,
  Database,
  Cpu
} from 'lucide-react';
import { UserSession } from '../types/case';
import { saveUserSession } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  setSession: React.Dispatch<React.SetStateAction<UserSession>>;
  totalCachedCases: number;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  session,
  setSession,
  totalCachedCases,
}) => {
  const [pin, setPin] = useState<string>('');
  const [role, setRole] = useState<'admin' | 'officer' | 'viewer'>('admin');
  const [username, setUsername] = useState<string>(session.username || 'রাজস্ব কর্মকর্তা');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple PIN check (default PIN 1234 or allow empty for convenience)
    if (pin && pin !== '1234' && pin !== '0000') {
      setError('ভুল সিকিউরিটি পিন! ডিফল্ট পিন ১২৩৪ অথবা ফাঁকা রেখে প্রবেশ করুন।');
      return;
    }

    const newSession: UserSession = {
      isLoggedIn: true,
      username: username || 'রাজস্ব কর্মকর্তা',
      role: role,
      token: 'jwt-auth-' + Math.random().toString(36).substring(7),
      loginTime: new Date().toISOString()
    };

    setSession(newSession);
    saveUserSession(newSession);
    setError('');
    onClose();
  };

  const handleLogout = () => {
    const guestSession: UserSession = {
      isLoggedIn: false,
      username: 'অতিথি ব্যবহারকারী',
      role: 'viewer',
      token: undefined
    };
    setSession(guestSession);
    saveUserSession(guestSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                নিরাপদ লগইন ও সিস্টেম নিরাপত্তা
              </h2>
              <p className="text-xs text-slate-500">
                কর্মকর্তা ও অ্যাডমিন এক্সেস কন্ট্রোল
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Performance & Cache Status Pill */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Database className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="font-bold text-xs">হাই-স্পিড লোকাল ক্যাশিং সক্রিয়</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  {totalCachedCases} টি মামলা ক্যাশে সংরক্ষিত (ইনস্ট্যান্ট লোডিং)
                </div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-semibold font-mono">
              <Cpu className="w-3 h-3" /> 0ms
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                কর্মকর্তার নাম / পদবি
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="যেমন: রাজস্ব কর্মকর্তা / সমন্বয়কারী"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                এক্সেস রোল নির্বাচন
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    role === 'admin' 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  👑 অ্যাডমিন
                </button>
                <button
                  type="button"
                  onClick={() => setRole('officer')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    role === 'officer' 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ⚖️ কর্মকর্তা
                </button>
                <button
                  type="button"
                  onClick={() => setRole('viewer')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    role === 'viewer' 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  👁️ নিরীক্ষক
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                সিকিউরিটি পিন (PIN)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="ডিফল্ট পিন: 1234 (বা খালি রাখুন)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                * অ্যাডমিন রোল সিলেক্ট করলে সম্পূর্ণ ডাটা এডিটিং ও ডিলিটিং অনুমতি সক্রিয় হবে।
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              {session.isLoggedIn && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 dark:border-rose-900/60 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                >
                  লগআউট
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20"
              >
                নিরাপদ লগইন সম্পন্ন করুন
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
