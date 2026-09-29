import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calculator, FileText, CheckCircle2 } from 'lucide-react';
import { ShowCauseAndOrderRecord, CompanyCircleProfile } from '../../types/circle';
import { takaToCrore, formatCurrencyCrore, formatBanglaNumber } from '../../utils/converter';

interface ShowCauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: ShowCauseAndOrderRecord) => void;
  record?: ShowCauseAndOrderRecord | null;
  companies: CompanyCircleProfile[];
}

export const ShowCauseModal: React.FC<ShowCauseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  record,
  companies
}) => {
  const [formData, setFormData] = useState<Partial<ShowCauseAndOrderRecord>>({
    companyName: '',
    circle: '১',
    bin: '',
    scnNo: '',
    scnDate: new Date().toISOString().split('T')[0],
    demandAmountTaka: 0,
    replyDeadline: '',
    replyStatus: 'জবাবের অপেক্ষমাণ',
    orderNo: '',
    orderDate: '',
    adjudicatedDutyTaka: 0,
    penaltyTaka: 0,
    totalAdjudicatedTaka: 0,
    realizedAmountTaka: 0,
    outstandingAmountTaka: 0,
    orderStatus: 'বিচারাদেশ প্রক্রিয়াধীন',
    adjudicatingAuthority: 'উপ-কমিশনার, কাস্টমস বন্ড কমিশনারেট',
    remarks: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        id: `scn-${Date.now()}`,
        companyName: '',
        circle: '১',
        bin: '',
        scnNo: `এসসিএন নং- /সার্কেল-১/বন্ড/${new Date().getFullYear()}`,
        scnDate: new Date().toISOString().split('T')[0],
        demandAmountTaka: 0,
        replyDeadline: '',
        replyStatus: 'জবাবের অপেক্ষমাণ',
        orderNo: '',
        orderDate: '',
        adjudicatedDutyTaka: 0,
        penaltyTaka: 0,
        totalAdjudicatedTaka: 0,
        realizedAmountTaka: 0,
        outstandingAmountTaka: 0,
        orderStatus: 'বিচারাদেশ প্রক্রিয়াধীন',
        adjudicatingAuthority: 'উপ-কমিশনার, কাস্টমস বন্ড কমিশনারেট',
        remarks: ''
      });
    }
    setErrors({});
  }, [record, isOpen]);

  // Recalculate totals
  const handleFinancialChange = (field: 'adjudicatedDutyTaka' | 'penaltyTaka' | 'realizedAmountTaka', val: number) => {
    const duty = field === 'adjudicatedDutyTaka' ? val : (formData.adjudicatedDutyTaka || 0);
    const penalty = field === 'penaltyTaka' ? val : (formData.penaltyTaka || 0);
    const realized = field === 'realizedAmountTaka' ? val : (formData.realizedAmountTaka || 0);

    const total = duty + penalty;
    const outstanding = Math.max(0, total - realized);

    setFormData(prev => ({
      ...prev,
      [field]: val,
      totalAdjudicatedTaka: total,
      outstandingAmountTaka: outstanding
    }));
  };

  const handleCompanySelect = (compName: string) => {
    const comp = companies.find(
      c => c.companyName.trim().toLowerCase() === compName.trim().toLowerCase()
    );
    if (comp) {
      const demand = comp.arrearsTaka || 0;
      setFormData(prev => ({
        ...prev,
        companyName: comp.companyName,
        circle: comp.circle,
        bin: comp.bin || prev.bin,
        demandAmountTaka: demand > 0 ? demand : (prev.demandAmountTaka || 0),
        scnNo: prev.scnNo?.replace(/সার্কেল-\d+/, `সার্কেল-${comp.circle}`) || `এসসিএন নং- /সার্কেল-${comp.circle}/বন্ড/${new Date().getFullYear()}`,
        adjudicatingAuthority: comp.officerAC_DC
          ? `${comp.officerAC_DC}, কাস্টমস বন্ড কমিশনারেট`
          : `উপ-কমিশনার, সার্কেল-${comp.circle}, কাস্টমস বন্ড কমিশনারেট`,
        remarks: comp.linkedCaseNos
          ? `সংশ্লিষ্ট মামলা নং: ${comp.linkedCaseNos}`
          : (prev.remarks || '')
      }));
    } else {
      setFormData(prev => ({ ...prev, companyName: compName }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.companyName?.trim()) newErrors.companyName = 'প্রতিষ্ঠানের নাম আবশ্যক';
    if (!formData.scnNo?.trim()) newErrors.scnNo = 'এসসিএন স্মারক নম্বর আবশ্যক';
    if (!formData.demandAmountTaka || formData.demandAmountTaka <= 0) {
      newErrors.demandAmountTaka = 'দাবীকৃত রাজস্ব টাকার পরিমাণ প্রদান করুন';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: ShowCauseAndOrderRecord = {
      id: formData.id || `scn-${Date.now()}`,
      companyName: formData.companyName || '',
      circle: formData.circle || '১',
      bin: formData.bin,
      scnNo: formData.scnNo || '',
      scnDate: formData.scnDate || new Date().toISOString().split('T')[0],
      demandAmountTaka: Number(formData.demandAmountTaka) || 0,
      replyDeadline: formData.replyDeadline || '',
      replyStatus: formData.replyStatus as any,
      orderNo: formData.orderNo,
      orderDate: formData.orderDate,
      adjudicatedDutyTaka: Number(formData.adjudicatedDutyTaka) || 0,
      penaltyTaka: Number(formData.penaltyTaka) || 0,
      totalAdjudicatedTaka: Number(formData.totalAdjudicatedTaka) || 0,
      realizedAmountTaka: Number(formData.realizedAmountTaka) || 0,
      outstandingAmountTaka: Number(formData.outstandingAmountTaka) || 0,
      orderStatus: formData.orderStatus as any,
      adjudicatingAuthority: formData.adjudicatingAuthority || 'উপ-কমিশনার, কাস্টমস বন্ড কমিশনারেট',
      remarks: formData.remarks
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <FileText className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {record ? 'কারণ দর্শাও নোটিশ ও বিচারাদেশ সম্পাদনা' : 'নতুন কারণ দর্শাও নোটিশ ও বিচারাদেশ হিসাব এন্ট্রি'}
              </h2>
              <p className="text-xs text-amber-200/90 mt-0.5">
                এসসিএন দাবি, জবাবের অবস্থা, বিচারাদেশের শুল্ক-অর্থদণ্ড ও বকেয়া হিসাব সংরক্ষণ
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Institution & SCN Base */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-semibold border-b border-amber-200/80 pb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>১. প্রতিষ্ঠান ও কারণ দর্শাও নোটিশ (SCN) সংক্রান্ত তথ্য</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  প্রতিষ্ঠানের নাম <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="company-list-scn"
                    value={formData.companyName || ''}
                    onChange={(e) => handleCompanySelect(e.target.value)}
                    placeholder="প্রতিষ্ঠানের নাম লিখুন বা তালিকা থেকে নির্বাচন করুন"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                      errors.companyName ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  <datalist id="company-list-scn">
                    {companies.map(c => (
                      <option key={c.id} value={c.companyName}>
                        সার্কেল-{c.circle} | বিন: {c.bin}
                      </option>
                    ))}
                  </datalist>
                </div>
                {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}

                {companies.find(c => c.companyName.trim().toLowerCase() === (formData.companyName || '').trim().toLowerCase()) && (() => {
                  const comp = companies.find(c => c.companyName.trim().toLowerCase() === (formData.companyName || '').trim().toLowerCase())!;
                  return (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-1 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-amber-950 font-bold">
                        <span>✓ প্রতিষ্ঠান সংযুক্ত (সার্কেল-{comp.circle})</span>
                        <span className="font-mono text-[11px] text-amber-800">বকেয়া: ৳{formatBanglaNumber(comp.arrearsTaka || 0)}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 flex items-center justify-between">
                        <span>দায়িত্বপ্রাপ্ত AC/DC: <strong>{comp.officerAC_DC || 'নিযুক্ত নেই'}</strong></span>
                        <span>RO: <strong>{comp.officerRO || '—'}</strong></span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সার্কেল নম্বর <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.circle || '১'}
                  onChange={(e) => setFormData({ ...formData, circle: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium"
                >
                  <option value="১">সার্কেল - ১</option>
                  <option value="২">সার্কেল - ২</option>
                  <option value="৩">সার্কেল - ৩</option>
                  <option value="৪">সার্কেল - ৪</option>
                  <option value="৫">সার্কেল - ৫</option>
                  <option value="৬">সার্কেল - ৬</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বিআইএন (BIN)</label>
                <input
                  type="text"
                  value={formData.bin || ''}
                  onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
                  placeholder="যেমন: 001234567-0101"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  কারণ দর্শাও নোটিশ (SCN) নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.scnNo || ''}
                  onChange={(e) => setFormData({ ...formData, scnNo: e.target.value })}
                  placeholder="যেমন: এসসিএন নং- ০৮/সার্কেল-১/বন্ড/২০২৬"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                    errors.scnNo ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.scnNo && <p className="text-xs text-red-500 mt-1">{errors.scnNo}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SCN জারির তারিখ</label>
                <input
                  type="date"
                  value={formData.scnDate || ''}
                  onChange={(e) => setFormData({ ...formData, scnDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  দাবীকৃত রাজস্ব (টাকা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.demandAmountTaka || ''}
                  onChange={(e) => setFormData({ ...formData, demandAmountTaka: Number(e.target.value) })}
                  placeholder="টাকায় লিখুন"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-semibold text-amber-900"
                />
                <span className="text-[11px] text-amber-700 font-medium">
                  {formatCurrencyCrore(takaToCrore(formData.demandAmountTaka || 0))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">জবাব দাখিলের শেষ তারিখ</label>
                <input
                  type="date"
                  value={formData.replyDeadline || ''}
                  onChange={(e) => setFormData({ ...formData, replyDeadline: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">জবাব দাখিলের অবস্থা</label>
                <select
                  value={formData.replyStatus || 'জবাবের অপেক্ষমাণ'}
                  onChange={(e) => setFormData({ ...formData, replyStatus: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium"
                >
                  <option value="জবাবের অপেক্ষমাণ">জবাবের অপেক্ষমাণ</option>
                  <option value="জবাব দাখিলকৃত">জবাব দাখিলকৃত</option>
                  <option value="সময় বৃদ্ধির আবেদন">সময় বৃদ্ধির আবেদন</option>
                  <option value="জবাব না দেওয়ায় একতরফা বিচার">জবাব না দেওয়ায় একতরফা বিচার</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Adjudication Order & Financial Tally */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>২. বিচারাদেশ (Order-in-Original) ও রাজস্ব/অর্থদণ্ড হিসাব</span>
              </div>
              <span className="text-xs bg-slate-200/80 px-2 py-0.5 rounded text-slate-600">
                স্বয়ংক্রিয় হিসাব সংযোজিত
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বিচারাদেশ নম্বর (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={formData.orderNo || ''}
                  onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                  placeholder="যেমন: ০৮/কমিশনার/বন্ড/২০২৬"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বিচারাদেশ জারির তারিখ</label>
                <input
                  type="date"
                  value={formData.orderDate || ''}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বিচারাদেশকারী কর্তৃপক্ষ</label>
                <select
                  value={formData.adjudicatingAuthority || 'উপ-কমিশনার, কাস্টমস বন্ড কমিশনারেট'}
                  onChange={(e) => setFormData({ ...formData, adjudicatingAuthority: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-xs"
                >
                  <option value="কমিশনার, কাস্টমস বন্ড কমিশনারেট">কমিশনার</option>
                  <option value="অতিরিক্ত কমিশনার, কাস্টমস বন্ড কমিশনারেট">অতিরিক্ত কমিশনার (ADC)</option>
                  <option value="যুগ্ম কমিশনার, কাস্টমস বন্ড কমিশনারেট">যুগ্ম কমিশনার (JC)</option>
                  <option value="উপ-কমিশনার, কাস্টমস বন্ড কমিশনারেট">উপ-কমিশনার (DC)</option>
                  <option value="সহকারী কমিশনার, কাস্টমস বন্ড কমিশনারেট">সহকারী কমিশনার (AC)</option>
                </select>
              </div>

              {/* Duty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ধার্যকৃত শুল্ক-কর (টাকা)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.adjudicatedDutyTaka || ''}
                  onChange={(e) => handleFinancialChange('adjudicatedDutyTaka', Number(e.target.value))}
                  placeholder="টাকায় লিখুন"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                />
                <span className="text-[11px] text-slate-600">
                  {formatCurrencyCrore(takaToCrore(formData.adjudicatedDutyTaka || 0))}
                </span>
              </div>

              {/* Penalty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">আরোপিত অর্থদণ্ড (টাকা)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.penaltyTaka || ''}
                  onChange={(e) => handleFinancialChange('penaltyTaka', Number(e.target.value))}
                  placeholder="অর্থদণ্ড থাকলে লিখুন"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-red-600"
                />
                <span className="text-[11px] text-red-600">
                  {formatCurrencyCrore(takaToCrore(formData.penaltyTaka || 0))}
                </span>
              </div>

              {/* Total Adjudicated */}
              <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                <span className="block text-xs font-semibold text-emerald-800">
                  সর্বমোট ধার্যকৃত রাজস্ব (শুল্ক+দণ্ড)
                </span>
                <p className="text-base font-bold text-emerald-950 mt-1">
                  ৳ {formatBanglaNumber(formData.totalAdjudicatedTaka || 0)}
                </p>
                <span className="text-xs text-emerald-700 font-medium">
                  {formatCurrencyCrore(takaToCrore(formData.totalAdjudicatedTaka || 0))}
                </span>
              </div>

              {/* Realized */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">আদায়কৃত রাজস্ব (টাকা)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.realizedAmountTaka || ''}
                  onChange={(e) => handleFinancialChange('realizedAmountTaka', Number(e.target.value))}
                  placeholder="আদায়কৃত পরিমাণ"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-emerald-700"
                />
                <span className="text-[11px] text-emerald-600">
                  {formatCurrencyCrore(takaToCrore(formData.realizedAmountTaka || 0))}
                </span>
              </div>

              {/* Outstanding */}
              <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200">
                <span className="block text-xs font-semibold text-rose-800">
                  অবশিষ্ট বকেয়া রাজস্ব (দাবি - আদায়)
                </span>
                <p className="text-base font-bold text-rose-900 mt-1">
                  ৳ {formatBanglaNumber(formData.outstandingAmountTaka || 0)}
                </p>
                <span className="text-xs text-rose-700 font-medium">
                  {formatCurrencyCrore(takaToCrore(formData.outstandingAmountTaka || 0))}
                </span>
              </div>

              {/* Order Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বিচারাদেশ ও নিষ্পত্তির অবস্থা</label>
                <select
                  value={formData.orderStatus || 'বিচারাদেশ প্রক্রিয়াধীন'}
                  onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                >
                  <option value="বিচারাদেশ প্রক্রিয়াধীন">বিচারাদেশ প্রক্রিয়াধীন</option>
                  <option value="বিচারাদেশ জারি সম্পন্ন">বিচারাদেশ জারি সম্পন্ন</option>
                  <option value="আপীল দায়েরকৃত">আপীল দায়েরকৃত</option>
                  <option value="সম্পূর্ণ আদায়ান্তে নিষ্পত্তি">সম্পূর্ণ আদায়ান্তে নিষ্পত্তি</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মন্তব্য / মামলার হালনাগাদ</label>
              <textarea
                rows={2}
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="যেমন: করদাতা মহামান্য হাইকোর্টে রীট দায়ের করেছে কিংবা আপিলাত ট্রাইব্যুনালে বিচারাধীন..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>{record ? 'তথ্য আপডেট করুন' : 'সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
