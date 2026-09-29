import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  FileText, 
  Building2, 
  User, 
  Calendar, 
  AlertCircle, 
  Save, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { FileMovementRecord, CompanyCircleProfile, OfficerRecord } from '../../types/circle';
import { formatBanglaNumber } from '../../utils/converter';

interface FileMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: FileMovementRecord) => void;
  initialData?: FileMovementRecord | null;
  companies: CompanyCircleProfile[];
  officers: OfficerRecord[];
  defaultCircle?: string;
}

export const FileMovementModal: React.FC<FileMovementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  companies,
  officers,
  defaultCircle = '১'
}) => {
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState<Partial<FileMovementRecord>>({
    fileNo: '',
    companyName: '',
    subject: '',
    circle: defaultCircle,
    senderBranch: `সার্কেল-${defaultCircle}`,
    senderOfficer: '',
    receiverBranch: 'আইন ও আপীল শাখা (সদর দপ্তর)',
    receiverOfficer: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    receivedDate: '',
    status: 'চলমান/পথিমধ্যে',
    urgency: 'সাধারণ',
    notes: ''
  });

  const [error, setError] = useState<string>('');

  // Find linked company object if companyName matches
  const linkedCompany = companies.find(
    c => c.companyName.trim().toLowerCase() === (formData.companyName || '').trim().toLowerCase()
  );

  const handleSelectCompany = (compName: string) => {
    const found = companies.find(
      c => c.companyName.trim().toLowerCase() === compName.trim().toLowerCase()
    );
    if (found) {
      const officer = found.officerRO || found.officerARO || found.officerAC_DC || '';
      setFormData(prev => ({
        ...prev,
        companyName: found.companyName,
        circle: found.circle || prev.circle || '১',
        senderBranch: `সার্কেল-${found.circle || '১'}`,
        senderOfficer: officer ? (officer.includes(',') ? officer : `${officer}, রাজস্ব কর্মকর্তা (সার্কেল-${found.circle})`) : prev.senderOfficer,
        subject: prev.subject ? prev.subject : `${found.companyName} এর রাজস্ব নথি ও নথি পর্যালোচনা প্রসঙ্গে`
      }));
    } else {
      setFormData(prev => ({ ...prev, companyName: compName }));
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        fileNo: `০৮.০১.০০০০.০১২.০${defaultCircle}.${Math.floor(100 + Math.random() * 900)}.২৬`,
        companyName: '',
        subject: '',
        circle: defaultCircle === 'all' ? '১' : defaultCircle,
        senderBranch: `সার্কেল-${defaultCircle === 'all' ? '১' : defaultCircle}`,
        senderOfficer: '',
        receiverBranch: 'আইন ও আপীল শাখা (সদর দপ্তর)',
        receiverOfficer: '',
        dispatchDate: new Date().toISOString().split('T')[0],
        receivedDate: '',
        status: 'চলমান/পথিমধ্যে',
        urgency: 'সাধারণ',
        notes: ''
      });
    }
    setError('');
  }, [initialData, defaultCircle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileNo?.trim()) {
      setError('নথি নং / ফাইল স্মারক আবশ্যক।');
      return;
    }
    if (!formData.subject?.trim()) {
      setError('নথির বিষয় আবশ্যক।');
      return;
    }

    const payload: FileMovementRecord = {
      id: initialData?.id || `fm-${Date.now()}`,
      fileNo: formData.fileNo.trim(),
      companyName: formData.companyName?.trim() || 'সাধারণ/অন্যান্য',
      subject: formData.subject.trim(),
      circle: formData.circle || '১',
      senderBranch: formData.senderBranch?.trim() || `সার্কেল-${formData.circle || '১'}`,
      senderOfficer: formData.senderOfficer?.trim() || '',
      receiverBranch: formData.receiverBranch?.trim() || 'আইন ও আপীল শাখা',
      receiverOfficer: formData.receiverOfficer?.trim() || '',
      dispatchDate: formData.dispatchDate || new Date().toISOString().split('T')[0],
      receivedDate: formData.receivedDate || '',
      status: formData.status || 'চলমান/পথিমধ্যে',
      urgency: formData.urgency || 'সাধারণ',
      notes: formData.notes?.trim() || '',
      updatedAt: new Date().toISOString()
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isEditing ? 'নথি চলাচল রেজিস্টার তথ্য হালনাগাদ' : 'নতুন নথি প্রেরণ / চলাচল এন্ট্রি'}
              </h3>
              <p className="text-xs text-blue-100">
                ফাইল নং, প্রেরক শাখা, প্রাপক দপ্তর, অগ্রগতির স্থিতি ও জরুরি মাত্রা সংরক্ষণ
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: File No & Circle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                নথি নম্বর / ফাইল স্মারক <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fileNo || ''}
                onChange={e => setFormData({ ...formData, fileNo: e.target.value })}
                placeholder="যেমন: ০৮.০১.০০০০.০১২.০৩.০০১.২৬"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                সংশ্লিষ্ট সার্কেল <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.circle || '১'}
                onChange={e => setFormData({ ...formData, circle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
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

          {/* Row 2: Company & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                সংশ্লিষ্ট প্রতিষ্ঠান (সার্চ / বাছুন)
              </label>
              <input
                type="text"
                list="file-movement-company-list"
                value={formData.companyName || ''}
                onChange={e => handleSelectCompany(e.target.value)}
                placeholder="প্রতিষ্ঠানের নাম টাইপ বা নির্বাচন করুন"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
              <datalist id="file-movement-company-list">
                {companies.map(c => (
                  <option key={c.id} value={c.companyName}>
                    {c.companyName} (সার্কেল-{c.circle})
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                জরুরি মাত্রা (Urgency)
              </label>
              <select
                value={formData.urgency || 'সাধারণ'}
                onChange={e => setFormData({ ...formData, urgency: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              >
                <option value="সাধারণ">🟢 সাধারণ</option>
                <option value="জরুরি">🟡 জরুরি</option>
                <option value="অতি জরুরি">🔴 অতি জরুরি (Immediate)</option>
              </select>
            </div>
          </div>

          {/* Linked Company Auto-populate feedback */}
          {linkedCompany && (
            <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl space-y-1.5 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between font-bold text-blue-950 dark:text-blue-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>লিংকড প্রতিষ্ঠান: {linkedCompany.companyName}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                  সার্কেল - {linkedCompany.circle}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-blue-200/50 dark:border-blue-900/40">
                <div>
                  <span className="text-slate-500">BIN:</span>{' '}
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{linkedCompany.bin || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500">দায়িত্বপ্রাপ্ত RO:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{linkedCompany.officerRO || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500">দায়িত্বপ্রাপ্ত ARO:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{linkedCompany.officerARO || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500">বকেয়া দাবি:</span>{' '}
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    ৳{formatBanglaNumber(linkedCompany.arrearsTaka || 0)}
                  </span>
                </div>
              </div>
              
              {/* Quick-apply officer buttons */}
              {(linkedCompany.officerRO || linkedCompany.officerARO || linkedCompany.officerAC_DC) && (
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] text-slate-500">প্রেরক কর্মকর্তা নির্বাচন করুন:</span>
                  {linkedCompany.officerRO && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        senderOfficer: `${linkedCompany.officerRO}, রাজস্ব কর্মকর্তা (সার্কেল-${linkedCompany.circle})`
                      }))}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-[10px] text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      RO: {linkedCompany.officerRO}
                    </button>
                  )}
                  {linkedCompany.officerARO && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        senderOfficer: `${linkedCompany.officerARO}, সহকারী রাজস্ব কর্মকর্তা (সার্কেল-${linkedCompany.circle})`
                      }))}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-[10px] text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      ARO: {linkedCompany.officerARO}
                    </button>
                  )}
                  {linkedCompany.officerAC_DC && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        senderOfficer: `${linkedCompany.officerAC_DC}, উপ/সহকারী কমিশনার (সার্কেল-${linkedCompany.circle})`
                      }))}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-[10px] text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      AC/DC: {linkedCompany.officerAC_DC}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              নথির বিষয় / বিবরণ <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.subject || ''}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              placeholder="যেমন: মেয়াদোত্তীর্ণ বন্ড লাইসেন্স নবায়ন, ১০% প্রাক-জমা চালান ও অডিট আপত্তি নিষ্পত্তি সংক্রান্ত মূল নথি..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Movement Flow: Sender -> Receiver */}
          <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-3">
            <div className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span>নথি প্রেরণ ও প্রাপ্তির বিবরণ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sender */}
              <div className="space-y-2 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">প্রেরক (Sender)</div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">প্রেরক শাখা / সার্কেল</label>
                  <input
                    type="text"
                    value={formData.senderBranch || ''}
                    onChange={e => setFormData({ ...formData, senderBranch: e.target.value })}
                    placeholder="যেমন: সার্কেল-১ (গাজীপুর)"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">প্রেরক কর্মকর্তা</label>
                  <input
                    type="text"
                    list="sender-officers"
                    value={formData.senderOfficer || ''}
                    onChange={e => setFormData({ ...formData, senderOfficer: e.target.value })}
                    placeholder="কর্মকর্তার নাম"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                  <datalist id="sender-officers">
                    {officers.map(o => (
                      <option key={o.id} value={`${o.name}, ${o.designation}`} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">প্রেরণের তারিখ</label>
                  <input
                    type="date"
                    value={formData.dispatchDate || ''}
                    onChange={e => setFormData({ ...formData, dispatchDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Receiver */}
              <div className="space-y-2 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">প্রাপক (Receiver)</div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">প্রাপক শাখা / দপ্তর / আদালত</label>
                  <input
                    type="text"
                    value={formData.receiverBranch || ''}
                    onChange={e => setFormData({ ...formData, receiverBranch: e.target.value })}
                    placeholder="যেমন: আইন ও আপীল শাখা / কমিশনার আদালত"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">প্রাপক কর্মকর্তা</label>
                  <input
                    type="text"
                    list="receiver-officers"
                    value={formData.receiverOfficer || ''}
                    onChange={e => setFormData({ ...formData, receiverOfficer: e.target.value })}
                    placeholder="কর্মকর্তার নাম"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                  <datalist id="receiver-officers">
                    {officers.map(o => (
                      <option key={o.id} value={`${o.name}, ${o.designation}`} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">গ্রহণের তারিখ (গৃহীত হলে)</label>
                  <input
                    type="date"
                    value={formData.receivedDate || ''}
                    onChange={e => setFormData({ ...formData, receivedDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                নথির বর্তমান স্থিতি (Current Status)
              </label>
              <select
                value={formData.status || 'চলমান/পথিমধ্যে'}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              >
                <option value="চলমান/পথিমধ্যে">🚚 চলমান / পথিমধ্যে (In Transit)</option>
                <option value="গৃহীত">📥 গৃহীত (Received by Receiver)</option>
                <option value="নিষ্পন্ন">✅ নিষ্পন্ন (Processed & Resolved)</option>
                <option value="ফেরত প্রেরিত">↩️ ফেরত প্রেরিত (Returned)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                নির্দেশনা বা বিশেষ মন্তব্য
              </label>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="যেমন: ৩ কার্যদিবসের মধ্যে প্রতিবেদন দাখিল করতে হবে"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'হালনাগাদ সংরক্ষণ' : 'নথি এন্ট্রি সংরক্ষণ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
