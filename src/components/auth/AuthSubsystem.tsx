import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  CheckCircle2,
  ArrowRight,
  LogOut,
  Users,
  Shield,
  Layers,
  Scale,
  Sparkles,
  RefreshCw,
  Phone,
  Mail
} from 'lucide-react';
import { AuthState, UserAccount, PRESET_USERS, SystemRole } from '../../types/auth';
import { authenticateUser, saveAuthState } from '../../utils/authStorage';

interface AuthSubsystemProps {
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export const AuthSubsystem: React.FC<AuthSubsystemProps> = ({
  authState,
  setAuthState,
  onClose,
  isStandalonePage = false
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'quick_roles' | 'profile'>(
    authState.isLoggedIn ? 'profile' : 'login'
  );

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!usernameInput.trim()) {
      setErrorMsg('ইউজারনেম বা ইমেইল ঠিকানা প্রদান করুন');
      return;
    }

    const authResult = authenticateUser(usernameInput, passwordInput);
    if (!authResult.success || !authResult.user) {
      setErrorMsg(authResult.error || 'লগইন ব্যর্থ হয়েছে');
      return;
    }

    const userWithCircle: UserAccount = {
      ...authResult.user,
      circle: selectedCircle !== 'all' ? selectedCircle : authResult.user.circle
    };

    const newAuthState: AuthState = {
      isLoggedIn: true,
      currentUser: userWithCircle,
      token: 'jwt-auth-' + Math.random().toString(36).substring(7),
      loginTime: new Date().toISOString()
    };

    setAuthState(newAuthState);
    saveAuthState(newAuthState);
    setSuccessMsg(`স্বাগতম, ${userWithCircle.fullName}! লগইন সফল হয়েছে।`);

    setTimeout(() => {
      if (onClose) onClose();
    }, 600);
  };

  const handleQuickRoleLogin = (user: UserAccount) => {
    const newAuthState: AuthState = {
      isLoggedIn: true,
      currentUser: user,
      token: 'jwt-auth-' + Math.random().toString(36).substring(7),
      loginTime: new Date().toISOString()
    };

    setAuthState(newAuthState);
    saveAuthState(newAuthState);
    setSuccessMsg(`স্বাগতম, ${user.fullName} (${user.designationBangla}) হিসেবে লগইন সম্পন্ন হয়েছে!`);

    setTimeout(() => {
      if (onClose) onClose();
    }, 600);
  };

  const handleLogout = () => {
    const loggedOutState: AuthState = {
      isLoggedIn: false,
      currentUser: null,
      token: undefined,
      loginTime: undefined
    };
    setAuthState(loggedOutState);
    saveAuthState(loggedOutState);
    setActiveTab('login');
    setUsernameInput('');
    setPasswordInput('');
    setSuccessMsg('সফলভাবে লগআউট করা হয়েছে।');
  };

  const handleGuestLogin = () => {
    const guestUser = PRESET_USERS.find(u => u.role === 'viewer') || PRESET_USERS[PRESET_USERS.length - 1];
    handleQuickRoleLogin(guestUser);
  };

  return (
    <div className={`relative ${isStandalonePage ? 'min-h-[85vh] flex items-center justify-center py-8' : ''}`}>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-400/20 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>সরকারি সুরক্ষা ও প্রবেশাধিকার নিয়ন্ত্রণ সাবসিস্টেম</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  কাস্টমস, এক্সাইজ ও ভ্যাট কমিশনারেট
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  প্রতিষ্ঠান-ভিত্তিক মামলা ব্যবস্থাপনা ও রাজস্ব ড্যাশবোর্ড
                </p>
              </div>
            </div>

            {/* Close button if modal */}
            {onClose && (
              <button
                onClick={onClose}
                className="self-start sm:self-auto p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            )}
          </div>

          {/* Subsystem Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>লগইন এক্সেস</span>
            </button>
            <button
              onClick={() => setActiveTab('quick_roles')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'quick_roles'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>পদবী ভিত্তিক ডেমো এক্সেস</span>
            </button>
            {authState.isLoggedIn && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>বর্তমান প্রোফাইল ও অনুমতি</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Credentials Login */}
          {activeTab === 'login' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Form */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    অফিসিয়াল একাউন্টে প্রবেশ করুন
                  </h3>
                  <p className="text-xs text-slate-500">
                    আপনার ইউজারনেম, ইমেইল অথবা পদবী সিলেক্ট করে সিস্টেমে প্রবেশ করুন
                  </p>
                </div>

                <form onSubmit={handleManualLogin} className="space-y-4">
                  {/* Username / Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ব্যবহারকারীর নাম / অফিসিয়াল ইমেইল
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="যেমন: commissioner, dc_circle1, ro_circle1"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      পাসওয়ার্ড / সিকিউরিটি পিন (ডিফল্ট: 1234)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="ডিফল্ট পিন: 1234 (বা ফাঁকা রাখুন)"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Assigned Circle Filter (Optional Override) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      সংশ্লিষ্ট সার্কেল নির্বাচন (ঐচ্ছিক)
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {['all', '১', '২', '৩', '৪', '৫', '৬'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedCircle(c)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                            selectedCircle === c
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {c === 'all' ? 'সকল' : `সার্কেল-${c}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>নিরাপদ লগইন সম্পন্ন করুন</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGuestLogin}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      অতিথি হিসেবে প্রবেশ
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar Quick Info */}
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>দ্রুত টেস্ট লগইন একাউন্টসমূহ</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div
                    onClick={() => {
                      setUsernameInput('commissioner');
                      setPasswordInput('1234');
                    }}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">কমিশনার (সুপার অ্যাডমিন)</div>
                      <div className="text-[11px] text-slate-500 font-mono">user: commissioner</div>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                      পূর্ণ এক্সেস
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      setUsernameInput('dc_circle1');
                      setPasswordInput('1234');
                    }}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">উপ-কমিশনার (সার্কেল-১)</div>
                      <div className="text-[11px] text-slate-500 font-mono">user: dc_circle1</div>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                      সার্কেল প্রধান
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      setUsernameInput('ro_circle1');
                      setPasswordInput('1234');
                    }}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">রাজস্ব কর্মকর্তা (RO)</div>
                      <div className="text-[11px] text-slate-500 font-mono">user: ro_circle1</div>
                    </div>
                    <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                      অপারেশনাল
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-200 pt-3">
                  * যে কোনো কার্ডে ক্লিক করলে ইউজারনেম ও পিন স্বয়ংক্রিয়ভাবে ইনপুট বক্সে বসে যাবে।
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Quick Role Selector Grid */}
          {activeTab === 'quick_roles' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  পদবী ভিত্তিক ডেমো প্রোফাইল নির্বাচন করুন
                </h3>
                <p className="text-xs text-slate-500">
                  যেকোনো একটি পদবীর কার্ডে ক্লিক করে সরাসরি সেই কর্মকর্তার ক্ষমতা ও পারমিশন নিয়ে সিস্টেমে প্রবেশ করুন
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {PRESET_USERS.map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleQuickRoleLogin(user)}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 p-5 shadow-xs hover:shadow-lg transition-all cursor-pointer space-y-3 group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {user.role === 'super_admin' ? '👑' : user.role === 'dc_ac' ? '⚖️' : '👤'}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'dc_ac'
                            ? 'bg-indigo-100 text-indigo-800'
                            : user.role === 'ro'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.circle === 'all' ? 'সকল সার্কেল' : `সার্কেল-${user.circle}`}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {user.fullName}
                      </h4>
                      <p className="text-xs text-indigo-900 font-semibold">{user.designationBangla}</p>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 font-mono pt-2 border-t border-slate-100">
                      <div>ইউজার: {user.username}</div>
                      <div>ইমেইল: {user.email}</div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        className="w-full py-2 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>এই প্রোফাইলে প্রবেশ</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Active Profile & Permissions */}
          {activeTab === 'profile' && authState.currentUser && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                    {authState.currentUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {authState.currentUser.fullName}
                    </h3>
                    <p className="text-xs text-indigo-700 font-bold">
                      {authState.currentUser.designationBangla}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ইউজার আইডি: {authState.currentUser.username} | সার্কেল: {authState.currentUser.circle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors flex items-center gap-2 self-start sm:self-auto"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট করুন</span>
                </button>
              </div>

              {/* Roles & Permissions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>প্রদত্ত এক্সেস পারমিশনসমূহ</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {authState.currentUser.permissions.map(perm => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-semibold"
                      >
                        ✓ {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>দায়িত্বপ্রাপ্ত সার্কেল এখতিয়ার</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    বর্তমানে আপনার একাউন্টে <strong>সার্কেল - {authState.currentUser.circle}</strong> এর মামলা,
                    প্রতিষ্ঠান ও নোটিশ পরিচালনার অধিকার সংরক্ষিত আছে।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
