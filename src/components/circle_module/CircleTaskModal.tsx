import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Save, Building2, CheckCircle2, UserCheck } from 'lucide-react';
import { CircleTaskItem, CompanyCircleProfile } from '../../types/circle';

interface CircleTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: CircleTaskItem) => void;
  task?: CircleTaskItem | null;
  companies: CompanyCircleProfile[];
}

export const CircleTaskModal: React.FC<CircleTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  companies
}) => {
  const [formData, setFormData] = useState<Partial<CircleTaskItem>>({
    title: '',
    companyName: '',
    circle: '১',
    taskType: 'শুনানি',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'pending',
    assignedOfficer: '',
    notes: ''
  });

  const [error, setError] = useState('');

  // Find linked company object if companyName matches
  const linkedCompany = companies.find(
    c => c.companyName.trim().toLowerCase() === (formData.companyName || '').trim().toLowerCase()
  );

  const handleSelectCompany = (compName: string) => {
    const found = companies.find(
      c => c.companyName.trim().toLowerCase() === compName.trim().toLowerCase()
    );
    if (found) {
      setFormData(prev => ({
        ...prev,
        companyName: found.companyName,
        circle: found.circle,
        assignedOfficer: found.officerRO || found.officerARO || found.officerAC_DC || prev.assignedOfficer || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, companyName: compName }));
    }
  };

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        id: `task-${Date.now()}`,
        title: '',
        companyName: '',
        circle: '১',
        taskType: 'শুনানি',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
        status: 'pending',
        assignedOfficer: '',
        notes: ''
      });
    }
    setError('');
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setError('কাজের বিষয় / চেকলিস্টের বিবরণ লিখুন');
      return;
    }
    if (!formData.dueDate) {
      setError('নিষ্পত্তির শেষ তারিখ নির্বাচন করুন');
      return;
    }

    const payload: CircleTaskItem = {
      id: formData.id || `task-${Date.now()}`,
      title: formData.title.trim(),
      companyName: formData.companyName,
      circle: formData.circle || '১',
      taskType: formData.taskType as any || 'শুনানি',
      dueDate: formData.dueDate,
      priority: formData.priority as any || 'medium',
      status: formData.status as any || 'pending',
      assignedOfficer: formData.assignedOfficer,
      notes: formData.notes
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <CheckSquare className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {task ? 'চেকলিস্ট টাস্ক সম্পাদনা' : 'নতুন চেকলিস্ট কাজ যুক্ত করুন'}
              </h2>
              <p className="text-xs text-blue-200">কখন কোন কাজ করতে হবে তার করণীয় শিডিউল</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              কাজের বিষয় / কার্যক্রম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="যেমন: এসসিএন জবাবের ফাইল প্রস্তুত ও শুনানির নোটিশ প্রেরণ"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">কাজের ধরন</label>
              <select
                value={formData.taskType || 'শুনানি'}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="শুনানি">শুনানি গ্রহণ/প্রস্তুতি</option>
                <option value="কারণ দর্শাও নোটিশ">কারণ দর্শাও নোটিশ</option>
                <option value="বিচারাদেশ">বিচারাদেশ জারি</option>
                <option value="বকেয়া তাগিদ">বকেয়া তাগিদ</option>
                <option value="অডিট নিষ্পত্তি">অডিট নিষ্পত্তি</option>
                <option value="প্রতিবেদন তৈরি">প্রতিবেদন তৈরি</option>
                <option value="অন্যান্য">অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সার্কেল</label>
              <select
                value={formData.circle || '১'}
                onChange={(e) => setFormData({ ...formData, circle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সম্পন্নের শেষ তারিখ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">অগ্রাধিকার (Priority)</label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
              >
                <option value="high">জরুরি (High)</option>
                <option value="medium">সাধারণ (Medium)</option>
                <option value="low">কম জরুরি (Low)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সংশ্লিষ্ট প্রতিষ্ঠান (সার্চ / বাছুন)
              </label>
              <input
                type="text"
                list="task-company-list"
                value={formData.companyName || ''}
                onChange={(e) => handleSelectCompany(e.target.value)}
                placeholder="প্রতিষ্ঠানের নাম টাইপ বা বাছুন"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <datalist id="task-company-list">
                {companies.map(c => (
                  <option key={c.id} value={c.companyName}>
                    {c.companyName} (সার্কেল-{c.circle})
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                দায়িত্বপ্রাপ্ত কর্মকর্তা (ARO/RO/AC)
              </label>
              <input
                type="text"
                value={formData.assignedOfficer || ''}
                onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                placeholder="যেমন: কামরুল হাসান, এআরও"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Linked Company Auto-populate feedback */}
          {linkedCompany && (
            <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl space-y-1.5 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-indigo-950 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>প্রতিষ্ঠান লিংকড: {linkedCompany.companyName}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  সার্কেল - {linkedCompany.circle}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-indigo-200/50">
                <div>
                  <span className="text-slate-500">দায়িত্বপ্রাপ্ত RO:</span>{' '}
                  <span className="font-semibold text-slate-800">{linkedCompany.officerRO || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500">দায়িত্বপ্রাপ্ত ARO:</span>{' '}
                  <span className="font-semibold text-slate-800">{linkedCompany.officerARO || '—'}</span>
                </div>
              </div>
              {(linkedCompany.officerRO || linkedCompany.officerARO || linkedCompany.officerAC_DC) && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">কর্মকর্তা পরিবর্তন:</span>
                  {linkedCompany.officerRO && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, assignedOfficer: linkedCompany.officerRO }))}
                      className="px-2 py-0.5 rounded bg-white hover:bg-indigo-100 text-[10px] font-semibold text-slate-700 hover:text-indigo-800 border border-slate-200 transition-colors"
                    >
                      RO: {linkedCompany.officerRO}
                    </button>
                  )}
                  {linkedCompany.officerARO && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, assignedOfficer: linkedCompany.officerARO }))}
                      className="px-2 py-0.5 rounded bg-white hover:bg-indigo-100 text-[10px] font-semibold text-slate-700 hover:text-indigo-800 border border-slate-200 transition-colors"
                    >
                      ARO: {linkedCompany.officerARO}
                    </button>
                  )}
                  {linkedCompany.officerAC_DC && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, assignedOfficer: linkedCompany.officerAC_DC }))}
                      className="px-2 py-0.5 rounded bg-white hover:bg-indigo-100 text-[10px] font-semibold text-slate-700 hover:text-indigo-800 border border-slate-200 transition-colors"
                    >
                      AC/DC: {linkedCompany.officerAC_DC}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">অবস্থা (Status)</label>
            <select
              value={formData.status || 'pending'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
            >
              <option value="pending">অপেক্ষমাণ (Pending)</option>
              <option value="in_progress">চলমান (In Progress)</option>
              <option value="completed">সম্পন্ন (Completed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">নোট / বিস্তারিত বিবরণ</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="কাজের বিস্তারিত নির্দেশনা..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{task ? 'আপডেট করুন' : 'টাস্ক যোগ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
