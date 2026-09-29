export interface GlobalSettings {
  // ১. দপ্তর ও ব্র্যান্ডিং
  commissionerateName: string;
  divisionName: string;
  commissionerName: string;
  officeAddress: string;
  officePhone: string;
  officeEmail: string;
  officeWebsite?: string;

  // ২. আর্থিক ও আইনি কনফিগারেশন
  currentFiscalYear: string; // যেমন: '২০২৫-২০২৬'
  currencyDisplay: 'crore' | 'lakh' | 'taka';
  numberFormat: 'bangla' | 'english';
  hearingAlertDays: number; // কত দিন আগের শুনানী সতর্কবার্তা দেখাবে
  redAlertArrearsCrore: number; // কত কোটি টাকার বকেয়া লাল সতর্কবার্তা হবে
  defaultInterestRatePercent: number; // ধারা বা নিয়ম অনুযায়ী বার্ষিক সুদের হার (যেমন: ২০%)

  // ৩. স্ক্রিন ও ডিসপ্লে অপটিমাইজেশন
  screenDensity: 'compact' | 'comfortable' | 'spacious';
  fontScale: 'sm' | 'md' | 'lg';
  fullWidthLayout: boolean;
  enableAnimations: boolean;
  highContrastMode: boolean;

  // ৪. স্বয়ংক্রিয় কার্যপ্রবাহ ও নিরাপত্তা
  autoSyncCircleOfficers: boolean;
  requireLoginOnStartup: boolean;
  enableAutoSave: boolean;
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  commissionerateName: 'কাস্টমস, এক্সাইজ ও ভ্যাট কমিশনারেট, ঢাকা (পূর্ব)',
  divisionName: 'সদর দপ্তর ও আপীল/আইন শাখা',
  commissionerName: 'ড. মুহাম্মদ মোফিজুর রহমান, কমিশনার',
  officeAddress: 'কাস্টমস, এক্সাইজ ও ভ্যাট ভবন, কাকরাইল, ঢাকা-১০০০',
  officePhone: '০২-২২২২২৩৪৪',
  officeEmail: 'vat.dhakaeast@nbr.gov.bd',
  officeWebsite: 'www.vatdhakaeast.gov.bd',

  currentFiscalYear: '২০২৫-২০২৬',
  currencyDisplay: 'crore',
  numberFormat: 'bangla',
  hearingAlertDays: 7,
  redAlertArrearsCrore: 1.0,
  defaultInterestRatePercent: 20,

  screenDensity: 'comfortable',
  fontScale: 'md',
  fullWidthLayout: false,
  enableAnimations: true,
  highContrastMode: false,

  autoSyncCircleOfficers: true,
  requireLoginOnStartup: false,
  enableAutoSave: true
};
