import React, { useState, useEffect } from 'react';
import { X, Users, Save, ShieldCheck, Check, AlertCircle, RefreshCw, Plus, Phone, Mail, Building } from 'lucide-react';
import { CircleAssignmentConfig, OfficerRecord } from '../../types/circle';

interface OfficerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: CircleAssignmentConfig[];
  officers: OfficerRecord[];
  onSaveAssignment: (config: CircleAssignmentConfig, syncToCompanies: boolean) => void;
  onSaveOfficer: (officer: OfficerRecord) => void;
  initialCircle?: string;
  totalCompaniesInCircle?: number;
}

export const OfficerAssignmentModal: React.FC<OfficerAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignments,
  officers,
  onSaveAssignment,
  onSaveOfficer,
  initialCircle = '১',
  totalCompaniesInCircle = 0
}) => {
  const [activeTab, setActiveTab] = useState<'assign' | 'add_officer'>('assign');
  const [selectedCircle, setSelectedCircle] = useState<string>(initialCircle);

  // Assignment Form State
  const [assignmentData, setAssignmentData] = useState<CircleAssignmentConfig>({
    circle: '১',
    circleName: '',
    aroName: '',
    roName: '',
    acDcName: '',
    jcAdcName: ''
  });
  const [syncToCompanies, setSyncToCompanies] = useState<boolean>(true);

  // New Officer Form State
  const [newOfficer, setNewOfficer] = useState<Partial<OfficerRecord>>({
    name: '',
    designation: 'ARO',
    designationBangla: 'সহকারী রাজস্ব কর্মকর্তা (ARO)',
    mobile: '',
    email: '',
    assignedCircles: ['১'],
    active: true,
    roomNo: ''
  });
  const [officerSuccess, setOfficerSuccess] = useState('');

  // Load config when selectedCircle changes
  useEffect(() => {
    setSelectedCircle(initialCircle);
  }, [initialCircle, isOpen]);

  useEffect(() => {
    const existing = assignments.find(a => a.circle === selectedCircle);
    if (existing) {
      setAssignmentData(existing);
    } else {
      setAssignmentData({
        circle: selectedCircle,
        circleName: `সার্কেল-${selectedCircle}`,
        aroName: '',
        roName: '',
        acDcName: '',
        jcAdcName: '',
        updatedAt: new Date().toISOString().split('T')[0]
      });
    }
  }, [selectedCircle, assignments]);

  if (!isOpen) return null;

  // Filter officers by designation for easy picking
  const aros = officers.filter(o => o.designation === 'ARO');
  const ros = officers.filter(o => o.designation === 'RO');
  const acDcs = officers.filter(o => o.designation === 'AC' || o.designation === 'DC');
  const jcAdcs = officers.filter(o => o.designation === 'JC' || o.designation === 'ADC');

  const handleSaveAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAssignment(
      {
        ...assignmentData,
        circle: selectedCircle,
        updatedAt: new Date().toISOString().split('T')[0]
      },
      syncToCompanies
    );
    onClose();
  };

  const handleAddOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficer.name?.trim()) return;

    let desBangla = 'সহকারী রাজস্ব কর্মকর্তা (ARO)';
    if (newOfficer.designation === 'RO') desBangla = 'রাজস্ব কর্মকর্তা (RO)';
    if (newOfficer.designation === 'AC') desBangla = 'সহকারী কমিশনার (AC)';
    if (newOfficer.designation === 'DC') desBangla = 'উপ-কমিশনার (DC)';
    if (newOfficer.designation === 'JC') desBangla = 'যুগ্ম কমিশনার (JC)';
    if (newOfficer.designation === 'ADC') desBangla = 'অতিরিক্ত কমিশনার (ADC)';

    const officer: OfficerRecord = {
      id: `off-${Date.now()}`,
      name: newOfficer.name.trim(),
      designation: (newOfficer.designation as any) || 'ARO',
      designationBangla: desBangla,
      mobile: newOfficer.mobile?.trim(),
      email: newOfficer.email?.trim(),
      assignedCircles: newOfficer.assignedCircles || [selectedCircle],
      active: true,
      roomNo: newOfficer.roomNo?.trim()
    };

    onSaveOfficer(officer);
    setOfficerSuccess(`${officer.name} (${officer.designation}) সফলভাবে যুক্ত হয়েছে!`);
    setNewOfficer({
      name: '',
      designation: 'ARO',
      designationBangla: 'সহকারী রাজস্ব কর্মকর্তা (ARO)',
      mobile: '',
      email: '',
      assignedCircles: [selectedCircle],
      active: true,
      roomNo: ''
    });
    setTimeout(() => {
      setOfficerSuccess('');
      setActiveTab('assign');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-indigo-900 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Users className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                কর্মকর্তা সার্কেল অ্যাসাইনমেন্ট
              </h2>
              <p className="text-xs text-teal-200/90 mt-0.5">
                সার্কেল অনুযায়ী ARO, RO, AC/DC এবং JC/ADC কর্মকর্তা নির্ধারণ ও সিঙ্ক্রোনাইজেশন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('assign')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'assign'
                ? 'bg-white border-t-2 border-teal-600 text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>সার্কেল অনুযায়ী কর্মকর্তা নিয়োগ</span>
          </button>

          <button
            onClick={() => setActiveTab('add_officer')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'add_officer'
                ? 'bg-white border-t-2 border-indigo-600 text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>নতুন কর্মকর্তা ডিরেক্টরিতে যোগ</span>
          </button>
        </div>

        {/* TAB 1: CIRCLE ASSIGNMENT */}
        {activeTab === 'assign' && (
          <form onSubmit={handleSaveAssignmentSubmit} className="p-6 space-y-5">
            {/* Circle Selection Pill Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                যে সার্কেলের কর্মকর্তাদের অ্যাসাইন করতে চান:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {['১', '২', '৩', '৪', '৫', '৬'].map(circleNo => (
                  <button
                    key={circleNo}
                    type="button"
                    onClick={() => setSelectedCircle(circleNo)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      selectedCircle === circleNo
                        ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/25 scale-[1.02]'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    সার্কেল - {circleNo}
                  </button>
                ))}
              </div>
            </div>

            {/* Circle Name / Description */}
            <div className="bg-teal-50/40 p-3.5 rounded-2xl border border-teal-100">
              <label className="block text-xs font-semibold text-teal-950 mb-1">
                সার্কেলের নাম বা অঞ্চল পরিচিতি
              </label>
              <input
                type="text"
                value={assignmentData.circleName || ''}
                onChange={(e) => setAssignmentData({ ...assignmentData, circleName: e.target.value })}
                placeholder={`যেমন: সার্কেল-${selectedCircle} (গাজীপুর ও সংলগ্ন এলাকা)`}
                className="w-full px-3 py-2 text-xs bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium"
              />
            </div>

            {/* Officers Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>সার্কেল-{selectedCircle} এর নিযুক্ত কর্মকর্তাবৃন্দ:</span>
                <span className="text-[11px] text-teal-700 font-normal">
                  সরাসরি লিখুন অথবা তালিকা হতে বাছুন
                </span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ARO */}
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      সহকারী রাজস্ব কর্মকর্তা (ARO)
                    </label>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.2 rounded font-bold">
                      ARO
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      list="aro-list"
                      value={assignmentData.aroName}
                      onChange={(e) => setAssignmentData({ ...assignmentData, aroName: e.target.value })}
                      placeholder="নাম লিখুন বা নির্বাচন করুন"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <datalist id="aro-list">
                      {aros.map(o => (
                        <option key={o.id} value={`${o.name}, এআরও`}>
                          {o.mobile ? `মোবাইল: ${o.mobile}` : ''}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* RO */}
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      রাজস্ব কর্মকর্তা (RO)
                    </label>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.2 rounded font-bold">
                      RO
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      list="ro-list"
                      value={assignmentData.roName}
                      onChange={(e) => setAssignmentData({ ...assignmentData, roName: e.target.value })}
                      placeholder="নাম লিখুন বা নির্বাচন করুন"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <datalist id="ro-list">
                      {ros.map(o => (
                        <option key={o.id} value={`${o.name}, আরও`}>
                          {o.mobile ? `মোবাইল: ${o.mobile}` : ''}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* AC / DC */}
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      সহকারী / উপ-কমিশনার (AC / DC)
                    </label>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-mono px-1.5 py-0.2 rounded font-bold">
                      AC/DC
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      list="acdc-list"
                      value={assignmentData.acDcName}
                      onChange={(e) => setAssignmentData({ ...assignmentData, acDcName: e.target.value })}
                      placeholder="যেমন: জনাব মাহফুজুর রহমান, উপ-কমিশনার"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <datalist id="acdc-list">
                      {acDcs.map(o => (
                        <option key={o.id} value={`${o.name}, ${o.designation === 'DC' ? 'উপ-কমিশনার' : 'সহকারী কমিশনার'}`}>
                          {o.mobile ? `মোবাইল: ${o.mobile}` : ''}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* JC / ADC */}
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      যুগ্ম / অতিরিক্ত কমিশনার (JC / ADC)
                    </label>
                    <span className="text-[10px] bg-purple-100 text-purple-700 font-mono px-1.5 py-0.2 rounded font-bold">
                      JC/ADC
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      list="jcadc-list"
                      value={assignmentData.jcAdcName}
                      onChange={(e) => setAssignmentData({ ...assignmentData, jcAdcName: e.target.value })}
                      placeholder="যেমন: জনাব মোস্তাফিজুর রহমান, অতিরিক্ত কমিশনার"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <datalist id="jcadc-list">
                      {jcAdcs.map(o => (
                        <option key={o.id} value={`${o.name}, ${o.designation === 'ADC' ? 'অতিরিক্ত কমিশনার' : 'যুগ্ম কমিশনার'}`}>
                          {o.mobile ? `মোবাইল: ${o.mobile}` : ''}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync to all companies checkbox */}
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-start gap-3">
              <input
                type="checkbox"
                id="sync-companies-checkbox"
                checked={syncToCompanies}
                onChange={(e) => setSyncToCompanies(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="sync-companies-checkbox" className="text-xs text-amber-950 font-medium cursor-pointer">
                <span className="font-bold block">
                  সার্কেল-{selectedCircle} এর অন্তর্ভুক্ত সকল প্রতিষ্ঠানের তথ্য একযোগে সিঙ্ক (হালনাগাদ) করুন
                </span>
                <span className="text-amber-800/80 block mt-0.5">
                  চিহ্নিত থাকলে এই সার্কেলের সকল বর্তমান প্রতিষ্ঠানের প্রোফাইলে উল্লিখিত কর্মকর্তাদের নাম স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-xl shadow-md shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>অ্যাসাইনমেন্ট সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ADD NEW OFFICER TO DIRECTORY */}
        {activeTab === 'add_officer' && (
          <form onSubmit={handleAddOfficerSubmit} className="p-6 space-y-4">
            {officerSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-medium animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{officerSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কর্মকর্তার নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newOfficer.name || ''}
                onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                placeholder="যেমন: জনাব কামরুল হাসান"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পদবি <span className="text-red-500">*</span>
                </label>
                <select
                  value={newOfficer.designation || 'ARO'}
                  onChange={(e) => setNewOfficer({ ...newOfficer, designation: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                >
                  <option value="ARO">সহকারী রাজস্ব কর্মকর্তা (ARO)</option>
                  <option value="RO">রাজস্ব কর্মকর্তা (RO)</option>
                  <option value="AC">সহকারী কমিশনার (AC)</option>
                  <option value="DC">উপ-কমিশনার (DC)</option>
                  <option value="JC">যুগ্ম কমিশনার (JC)</option>
                  <option value="ADC">অতিরিক্ত কমিশনার (ADC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মোবাইল নম্বর
                </label>
                <input
                  type="text"
                  value={newOfficer.mobile || ''}
                  onChange={(e) => setNewOfficer({ ...newOfficer, mobile: e.target.value })}
                  placeholder="যেমন: 01711-234567"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ই-মেইল ঠিকানা
                </label>
                <input
                  type="email"
                  value={newOfficer.email || ''}
                  onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                  placeholder="যেমন: officer@customs.gov.bd"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অফিস কক্ষ নম্বর
                </label>
                <input
                  type="text"
                  value={newOfficer.roomNo || ''}
                  onChange={(e) => setNewOfficer({ ...newOfficer, roomNo: e.target.value })}
                  placeholder="যেমন: কক্ষ নং- ২০৪"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('assign')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ফিরে যান
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>কর্মকর্তা যুক্ত করুন</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
