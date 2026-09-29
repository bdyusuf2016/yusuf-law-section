import React, { useState } from 'react';
import { X, Building2, Users, Save, CheckCircle2 } from 'lucide-react';
import { OfficerRecord, CompanyCircleProfile } from '../../types/circle';

interface BulkCompanyAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCompanies: CompanyCircleProfile[];
  officers: OfficerRecord[];
  onApply: (
    companyIds: string[],
    officersData: {
      officerARO?: string;
      officerRO?: string;
      officerAC_DC?: string;
      officerJC_ADC?: string;
    }
  ) => void;
}

export const BulkCompanyAssignModal: React.FC<BulkCompanyAssignModalProps> = ({
  isOpen,
  onClose,
  selectedCompanies,
  officers,
  onApply
}) => {
  const [aro, setAro] = useState('');
  const [ro, setRo] = useState('');
  const [acDc, setAcDc] = useState('');
  const [jcAdc, setJcAdc] = useState('');

  if (!isOpen || selectedCompanies.length === 0) return null;

  const aros = officers.filter(o => o.designation === 'ARO');
  const ros = officers.filter(o => o.designation === 'RO');
  const acDcs = officers.filter(o => o.designation === 'AC' || o.designation === 'DC');
  const jcAdcs = officers.filter(o => o.designation === 'JC' || o.designation === 'ADC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const companyIds = selectedCompanies.map(c => c.id);
    onApply(companyIds, {
      officerARO: aro.trim() || undefined,
      officerRO: ro.trim() || undefined,
      officerAC_DC: acDc.trim() || undefined,
      officerJC_ADC: jcAdc.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-2xl">
              <Building2 className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                নির্বাচিত প্রতিষ্ঠানে একযোগে কর্মকর্তা নিয়োগ (Bulk Assign)
              </h2>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                {selectedCompanies.length} টি প্রতিষ্ঠানে একসাথে কর্মকর্তা নিযুক্ত করুন
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selected Companies Preview Pill */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl">
            <span className="text-xs font-bold text-indigo-900 block mb-1.5">
              নির্বাচিত প্রতিষ্ঠানসমূহ ({selectedCompanies.length} টি):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {selectedCompanies.map(c => (
                <span
                  key={c.id}
                  className="px-2 py-0.5 bg-white text-indigo-950 border border-indigo-200 rounded-md text-[11px] font-semibold"
                >
                  {c.companyName}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            যে যে পদের কর্মকর্তা আপডেট করতে চান সেগুলো পূরণ করুন (ফাঁকা রাখলে পূর্বের তথ্য অপরিবর্তিত থাকবে):
          </p>

          <div className="space-y-3">
            {/* ARO */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সহকারী রাজস্ব কর্মকর্তা (ARO)
              </label>
              <input
                type="text"
                list="bulk-aro-list"
                value={aro}
                onChange={e => setAro(e.target.value)}
                placeholder="যেমন: জনাব কামরুল হাসান, এআরও"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <datalist id="bulk-aro-list">
                {aros.map(o => (
                  <option key={o.id} value={`${o.name}, এআরও`} />
                ))}
              </datalist>
            </div>

            {/* RO */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                রাজস্ব কর্মকর্তা (RO)
              </label>
              <input
                type="text"
                list="bulk-ro-list"
                value={ro}
                onChange={e => setRo(e.target.value)}
                placeholder="যেমন: জনাব শফিকুল ইসলাম, আরও"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <datalist id="bulk-ro-list">
                {ros.map(o => (
                  <option key={o.id} value={`${o.name}, আরও`} />
                ))}
              </datalist>
            </div>

            {/* AC / DC */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সহকারী / উপ-কমিশনার (AC / DC)
              </label>
              <input
                type="text"
                list="bulk-acdc-list"
                value={acDc}
                onChange={e => setAcDc(e.target.value)}
                placeholder="যেমন: জনাব মাহফুজুর রহমান, উপ-কমিশনার"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <datalist id="bulk-acdc-list">
                {acDcs.map(o => (
                  <option key={o.id} value={`${o.name}, ${o.designation === 'DC' ? 'উপ-কমিশনার' : 'সহকারী কমিশনার'}`} />
                ))}
              </datalist>
            </div>

            {/* JC / ADC */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                যুগ্ম / অতিরিক্ত কমিশনার (JC / ADC)
              </label>
              <input
                type="text"
                list="bulk-jcadc-list"
                value={jcAdc}
                onChange={e => setJcAdc(e.target.value)}
                placeholder="যেমন: জনাব মোস্তাফিজুর রহমান, অতিরিক্ত কমিশনার"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <datalist id="bulk-jcadc-list">
                {jcAdcs.map(o => (
                  <option key={o.id} value={`${o.name}, ${o.designation === 'ADC' ? 'অতিরিক্ত কমিশনার' : 'যুগ্ম কমিশনার'}`} />
                ))}
              </datalist>
            </div>
          </div>

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
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{selectedCompanies.length} টি প্রতিষ্ঠানে প্রয়োগ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
