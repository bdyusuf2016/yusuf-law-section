import React, { useState, useEffect } from 'react';
import { X, Bell, Save, Calendar, Clock, Building2 } from 'lucide-react';
import { CircleReminder, CompanyCircleProfile } from '../../types/circle';

interface CircleReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: CircleReminder) => void;
  reminder?: CircleReminder | null;
  companies: CompanyCircleProfile[];
}

export const CircleReminderModal: React.FC<CircleReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reminder,
  companies
}) => {
  const [formData, setFormData] = useState<Partial<CircleReminder>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    companyName: '',
    circle: '১',
    type: 'hearing',
    completed: false,
    notes: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (reminder) {
      setFormData(reminder);
    } else {
      setFormData({
        id: `rem-${Date.now()}`,
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '11:00',
        companyName: '',
        circle: '১',
        type: 'hearing',
        completed: false,
        notes: ''
      });
    }
    setError('');
  }, [reminder, isOpen]);

  const handleSelectCompany = (compName: string) => {
    const found = companies.find(
      c => c.companyName.trim().toLowerCase() === compName.trim().toLowerCase()
    );
    if (found) {
      setFormData(prev => ({
        ...prev,
        companyName: found.companyName,
        circle: found.circle,
        notes: prev.notes || (found.commercialManagerName ? `ম্যানেজার: ${found.commercialManagerName} (${found.commercialManagerMobile || ''})` : '')
      }));
    } else {
      setFormData(prev => ({ ...prev, companyName: compName }));
    }
  };

  const linkedCompany = companies.find(
    c => c.companyName.trim().toLowerCase() === (formData.companyName || '').trim().toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setError('রিমাইন্ডারের শিরোনাম বা বিবরণ আবশ্যক');
      return;
    }
    if (!formData.date) {
      setError('রিমাইন্ডারের তারিখ নির্বাচন করুন');
      return;
    }

    const payload: CircleReminder = {
      id: formData.id || `rem-${Date.now()}`,
      title: formData.title.trim(),
      date: formData.date,
      time: formData.time || '10:00',
      companyName: formData.companyName,
      circle: formData.circle || '১',
      type: formData.type || 'general',
      completed: formData.completed || false,
      notes: formData.notes
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Bell className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {reminder ? 'রিমাইন্ডার সম্পাদনা' : 'নতুন রিমাইন্ডার ও নোটিফিকেশন যুক্ত'}
              </h2>
              <p className="text-xs text-indigo-200">শুনানি, নোটিশ, অডিট ইত্যাদির সময়সীমা নোটিশ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              রিমাইন্ডারের বিষয় / শিরোনাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="যেমন: ডেল্টা টেক্সটাইলের শুনানি নথি প্রস্তুত রাখা"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                তারিখ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সময়</label>
              <input
                type="time"
                value={formData.time || '11:00'}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">রিমাইন্ডারের ধরন</label>
              <select
                value={formData.type || 'hearing'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="hearing">শুনানি ফলোআপ</option>
                <option value="scn_reply">এসসিএন জবাব ডেডলাইন</option>
                <option value="order_due">বিচারাদেশ জারির শেষ সময়</option>
                <option value="audit_deadline">অডিট প্রতিবেদন ফলোআপ</option>
                <option value="report">মাসিক প্রতিবেদন দাখিল</option>
                <option value="general">সাধারণ রিমাইন্ডার</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সার্কেল</label>
              <select
                value={formData.circle || '১'}
                onChange={(e) => setFormData({ ...formData, circle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
              >
                <option value="১">সার্কেল - ১</option>
                <option value="২">সার্কেল - ২</option>
                <option value="৩">সার্কেল - ৩</option>
                <option value="৪">সার্কেল - ৪</option>
                <option value="৫">সার্কেল - ৫</option>
                <option value="৬">সার্কেল - ৬</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              সংশ্লিষ্ট প্রতিষ্ঠান (সার্চ / বাছুন)
            </label>
            <input
              type="text"
              list="reminder-company-list"
              value={formData.companyName || ''}
              onChange={(e) => handleSelectCompany(e.target.value)}
              placeholder="প্রতিষ্ঠানের নাম লিখুন বা তালিকা থেকে বাছুন"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <datalist id="reminder-company-list">
              {companies.map(c => (
                <option key={c.id} value={c.companyName}>
                  {c.companyName} (সার্কেল-{c.circle})
                </option>
              ))}
            </datalist>

            {linkedCompany && (
              <div className="mt-1.5 p-2 bg-indigo-50 border border-indigo-200/80 rounded-lg flex items-center justify-between text-xs text-indigo-950 font-bold animate-in fade-in duration-150">
                <span>✓ প্রতিষ্ঠান লিংকড: সার্কেল-{linkedCompany.circle}</span>
                {linkedCompany.commercialManagerName && (
                  <span className="text-[11px] font-normal text-slate-600">
                    ম্যানেজার: {linkedCompany.commercialManagerName}
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">অতিরিক্ত নোট / নির্দেশাবলী</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="প্রয়োজনীয় নথিপত্র বা দিকনির্দেশনা..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{reminder ? 'আপডেট করুন' : 'রিমাইন্ডার সংরক্ষণ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
