import React, { useState, useEffect, useMemo } from 'react';
import { X, Users, Building2, Check, Search, Filter, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { OfficerRecord, CompanyCircleProfile } from '../../types/circle';

interface AssignOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  officers: OfficerRecord[]; // One or more officers being assigned
  companies: CompanyCircleProfile[];
  onSave: (
    officerIds: string[],
    assignedCircles: string[],
    assignedCompanyIds: string[],
    syncToCompanies: boolean
  ) => void;
}

export const AssignOfficerModal: React.FC<AssignOfficerModalProps> = ({
  isOpen,
  onClose,
  officers,
  companies,
  onSave
}) => {
  const [selectedCircles, setSelectedCircles] = useState<string[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [searchCompany, setSearchCompany] = useState<string>('');
  const [filterCircle, setFilterCircle] = useState<string>('all');
  const [syncToCompanies, setSyncToCompanies] = useState<boolean>(true);

  // Initialize from the first officer (if single officer)
  useEffect(() => {
    if (officers.length === 1) {
      const o = officers[0];
      setSelectedCircles(o.assignedCircles || []);
      setSelectedCompanyIds(o.assignedCompanyIds || []);
    } else {
      setSelectedCircles([]);
      setSelectedCompanyIds([]);
    }
  }, [officers, isOpen]);

  const allCircles = ['১', '২', '৩', '৪', '৫', '৬'];

  // Toggle circle selection
  const handleToggleCircle = (circle: string) => {
    setSelectedCircles(prev => {
      const exists = prev.includes(circle);
      const nextCircles = exists ? prev.filter(c => c !== circle) : [...prev, circle];
      
      // Auto-select or offer companies belonging to that circle
      if (!exists) {
        const circleComps = companies.filter(c => c.circle === circle).map(c => c.id);
        setSelectedCompanyIds(current => Array.from(new Set([...current, ...circleComps])));
      }
      return nextCircles;
    });
  };

  // Toggle company selection
  const handleToggleCompany = (id: string) => {
    setSelectedCompanyIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  // Filtered companies in the modal
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const circleMatch = filterCircle === 'all' || c.circle === filterCircle;
      const searchMatch =
        !searchCompany.trim() ||
        c.companyName.toLowerCase().includes(searchCompany.toLowerCase()) ||
        c.bin.toLowerCase().includes(searchCompany.toLowerCase()) ||
        c.address.toLowerCase().includes(searchCompany.toLowerCase());
      return circleMatch && searchMatch;
    });
  }, [companies, filterCircle, searchCompany]);

  // Bulk company select helpers
  const handleSelectAllFiltered = () => {
    const ids = filteredCompanies.map(c => c.id);
    setSelectedCompanyIds(prev => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAllFiltered = () => {
    const filteredIdSet = new Set(filteredCompanies.map(c => c.id));
    setSelectedCompanyIds(prev => prev.filter(id => !filteredIdSet.has(id)));
  };

  const handleSelectByCircle = (circleNo: string) => {
    const ids = companies.filter(c => c.circle === circleNo).map(c => c.id);
    setSelectedCompanyIds(prev => Array.from(new Set([...prev, ...ids])));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const officerIds = officers.map(o => o.id);
    onSave(officerIds, selectedCircles, selectedCompanyIds, syncToCompanies);
    onClose();
  };

  if (!isOpen || officers.length === 0) return null;

  const isBulk = officers.length > 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-2xl">
              <Users className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isBulk
                  ? `${officers.length} জন কর্মকর্তার সার্কেল ও প্রতিষ্ঠান অ্যাসাইনমেন্ট`
                  : `${officers[0].name} (${officers[0].designationBangla}) এর অ্যাসাইনমেন্ট`}
              </h2>
              <p className="text-xs text-teal-200/90 mt-0.5">
                নিযুক্ত সার্কেল ও সংশ্লিষ্ট প্রতিষ্ঠানসমূহ নির্ধারণ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Officer Preview */}
          <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-teal-900">নির্বাচিত কর্মকর্তাবৃন্দ:</span>
            {officers.map(o => (
              <span
                key={o.id}
                className="px-2.5 py-1 bg-white text-teal-900 border border-teal-200 rounded-lg text-xs font-semibold shadow-2xs"
              >
                {o.name} <span className="text-teal-600 font-mono text-[10px]">({o.designation})</span>
              </span>
            ))}
          </div>

          {/* 1. Circle Assignment Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>১. নিযুক্ত সার্কেলসমূহ নির্বাচন করুন:</span>
              </label>
              <span className="text-[11px] text-slate-500">
                নির্বাচিত: {selectedCircles.length} টি সার্কেল
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {allCircles.map(circleNo => {
                const isChecked = selectedCircles.includes(circleNo);
                return (
                  <button
                    key={circleNo}
                    type="button"
                    onClick={() => handleToggleCircle(circleNo)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      isChecked
                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-600/30'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>সার্কেল - {circleNo}</span>
                    <span className="text-[10px] font-normal opacity-85">
                      ({companies.filter(c => c.circle === circleNo).length} প্রতিষ্ঠান)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Specific Institutions Assignment */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>২. প্রতিষ্ঠান অ্যাসাইনমেন্ট (নির্দিষ্ট প্রতিষ্ঠানসমূহ নির্বাচন করুন):</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  কর্মকর্তা উক্ত প্রতিষ্ঠানসমূহের দায়িত্বপ্রাপ্ত হিসেবে সরাসরি প্রোফাইলে অন্তর্ভুক্ত হবেন
                </p>
              </div>
              <div className="text-xs font-bold text-teal-800 bg-teal-100/70 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                নির্বাচিত: {selectedCompanyIds.length} টি প্রতিষ্ঠান
              </div>
            </div>

            {/* Quick Circle Filters & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchCompany}
                  onChange={e => setSearchCompany(e.target.value)}
                  placeholder="প্রতিষ্ঠানের নাম বা বিন দিয়ে খুঁজুন..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <select
                value={filterCircle}
                onChange={e => setFilterCircle(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium"
              >
                <option value="all">সকল সার্কেল</option>
                <option value="১">সার্কেল - ১</option>
                <option value="২">সার্কেল - ২</option>
                <option value="৩">সার্কেল - ৩</option>
                <option value="৪">সার্কেল - ৪</option>
                <option value="৫">সার্কেল - ৫</option>
                <option value="৬">সার্কেল - ৬</option>
              </select>

              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap"
              >
                দৃশ্যমান সব বাছুন
              </button>

              <button
                type="button"
                onClick={handleDeselectAllFiltered}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap"
              >
                সব মুছুন
              </button>
            </div>

            {/* Quick Circle selector pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 font-medium">সার্কেল ভিত্তিক সব বাছুন:</span>
              {['১', '২', '৩', '৪', '৫', '৬'].map(cNo => (
                <button
                  key={cNo}
                  type="button"
                  onClick={() => handleSelectByCircle(cNo)}
                  className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold transition-colors"
                >
                  সার্কেল-{cNo}
                </button>
              ))}
            </div>

            {/* Companies Checklist Box */}
            <div className="border border-slate-200 rounded-2xl max-h-56 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
              {filteredCompanies.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  কোন প্রতিষ্ঠান পাওয়া যায়নি
                </div>
              ) : (
                filteredCompanies.map(comp => {
                  const isChecked = selectedCompanyIds.includes(comp.id);
                  return (
                    <div
                      key={comp.id}
                      onClick={() => handleToggleCompany(comp.id)}
                      className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-teal-50/80 hover:bg-teal-100/60' : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isChecked ? 'text-teal-950' : 'text-slate-900'}`}>
                            {comp.companyName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            সার্কেল-{comp.circle} | বিন: {comp.bin || '—'} | বন্ড নং: {comp.bondLicenseNo || '—'}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                        সার্কেল - {comp.circle}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sync Checkbox */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="sync-officer-to-companies"
              checked={syncToCompanies}
              onChange={e => setSyncToCompanies(e.target.checked)}
              className="mt-1 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <label htmlFor="sync-officer-to-companies" className="text-xs text-amber-950 font-medium cursor-pointer">
              <span className="font-bold block">
                নির্বাচিত সকল প্রতিষ্ঠানের প্রোফাইলে কর্মকর্তাদের নাম তাৎক্ষণিক সিঙ্ক (হালনাগাদ) করুন
              </span>
              <span className="text-amber-800/80 text-[11px] block mt-0.5">
                টিক দেওয়া থাকলে প্রতিষ্ঠানগুলোর সংশ্লিষ্ট কর্মকর্তা ফিল্ডে (ARO, RO, AC/DC, বা JC/ADC) উক্ত কর্মকর্তাদের নাম হালনাগাদ হবে।
              </span>
            </label>
          </div>

          {/* Action Buttons */}
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
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-xl shadow-md shadow-teal-600/30 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>অ্যাসাইনমেন্ট নিশ্চিত করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
