import { 
  CompanyCircleProfile, 
  CircleTaskItem, 
  HearingNotice, 
  ShowCauseAndOrderRecord, 
  CircleReminder,
  OfficerRecord,
  CircleAssignmentConfig,
  FileMovementRecord
} from '../types/circle';
import { CaseRecord } from '../types/case';
import { takaToCrore } from './converter';

const CIRCLE_COMPANIES_KEY = 'bd_court_circle_companies_v1';
const CIRCLE_TASKS_KEY = 'bd_court_circle_tasks_v1';
const CIRCLE_NOTICES_KEY = 'bd_court_circle_notices_v1';
const CIRCLE_SCN_ORDERS_KEY = 'bd_court_circle_scn_orders_v1';
const CIRCLE_REMINDERS_KEY = 'bd_court_circle_reminders_v1';
const CIRCLE_ASSIGNMENTS_KEY = 'bd_court_circle_assignments_v1';
const CIRCLE_OFFICERS_KEY = 'bd_court_circle_officers_v1';
const CIRCLE_FILE_MOVEMENTS_KEY = 'bd_court_circle_file_movements_v1';

// Seed Initial Profiles
export function getInitialCircleProfiles(cases: CaseRecord[] = []): CompanyCircleProfile[] {
  return [
    {
      id: 'cp-1',
      companyName: 'মেসার্স ডেল্টা টেক্সটাইল মিলস লিমিটেড',
      address: 'প্লট নং- ১২, কোনাবাড়ী বিসিক শিল্প এলাকা, গাজীপুর',
      bondLicenseNo: 'বন্ড/লাইসেন্স/গা-০৪/২০১৮',
      bin: '001234567-0101',
      circle: '১',
      auditStatus: 'আপত্তি উত্থাপিত',
      auditYear: '২০২৩-২৪',
      lastAuditDate: '২০২৪-১১-১৫',
      auditObservations: 'বন্ডিং মেয়াদোত্তীর্ণ কাঁচামাল ও শুল্ক অব্যাহতিপ্রাপ্ত পণ্যের গরমিল চিহ্নিত।',
      arrearsTaka: 45000000,
      arrearsCrore: 4.5,
      linkedCaseNos: 'রীট পিটিশন নং- ১২৪১৭/২০২৪',
      commercialManagerName: 'জনাব সাজ্জাদ হোসেন',
      commercialManagerMobile: '01711-234567',
      commercialManagerEmail: 'sajjad.delta@gmail.com',
      officerARO: 'জনাব কামরুল হাসান, এআরও',
      officerRO: 'জনাব শফিকুল ইসলাম, আরও',
      officerAC_DC: 'জনাব মাহফুজুর রহমান, উপ-কমিশনার',
      officerJC_ADC: 'জনাব মোস্তাফিজুর রহমান, অতিরিক্ত কমিশনার',
      remarks: 'বন্ডিং মেয়াদোত্তীর্ণ কাঁচামালের অনিয়ম সংক্রান্ত আপত্তি চলমান।'
    },
    {
      id: 'cp-2',
      companyName: 'মেসার্স সাউথ এশিয়া স্পিনিং মিলস লিঃ',
      address: 'কাঁচপুর, সোনারগাঁও, নারায়ণগঞ্জ',
      bondLicenseNo: 'বন্ড/লাইসেন্স/না-১২/২০১৯',
      bin: '002345678-0202',
      circle: '২',
      auditStatus: 'অডিট চলমান',
      auditYear: '২০২২-২৩',
      lastAuditDate: '২০২৪-১০-০৮',
      auditObservations: 'ইনপুট-আউটপুট সহগ (Coefficient) যাচাই এবং বার্ষিক নিরীক্ষা কার্যক্রম চলমান।',
      arrearsTaka: 82500000,
      arrearsCrore: 8.25,
      linkedCaseNos: 'আপীল নং- ০৫/২০২৪ (কাস্টমস)',
      commercialManagerName: 'জনাব রফিকুল ইসলাম',
      commercialManagerMobile: '01819-876543',
      commercialManagerEmail: 'commercial@southasiaspinning.com',
      officerARO: 'জনাব জয়নাল আবেদীন, এআরও',
      officerRO: 'জনাব মাহবুব আলম, আরও',
      officerAC_DC: 'জনাব এনামুল হক, সহকারী কমিশনার',
      officerJC_ADC: 'জনাব সুলতান মাহমুদ, যুগ্ম কমিশনার',
      remarks: 'আপিলাত ট্রাইব্যুনালে ১০% প্রাক-জমা গৃহীত।'
    },
    {
      id: 'cp-3',
      companyName: 'মেসার্স পদ্মা সিনথেটিক ফ্যাব্রিক্স লিঃ',
      address: 'মদনপুর, বন্দর, নারায়ণগঞ্জ',
      bondLicenseNo: 'বন্ড/লাইসেন্স/না-০৮/২০১৭',
      bin: '003456789-0303',
      circle: '৩',
      auditStatus: 'অডিট অনিষ্পন্ন',
      auditYear: '২০২১-২২',
      lastAuditDate: '২০২৩-১২-২২',
      auditObservations: 'নিরীক্ষা আপত্তির বিপরীতে দাবীনামা জারি ও জবাব না পাওয়ায় পিডিআর কার্যধারা প্রযোজ্য।',
      arrearsTaka: 120000000,
      arrearsCrore: 12.0,
      linkedCaseNos: 'সার্টিফিকেট মামলা নং- ১৫/২০২৫-২৬',
      commercialManagerName: 'জনাব কাজী আনোয়ার',
      commercialManagerMobile: '01912-345678',
      commercialManagerEmail: 'anwar.padma@yahoo.com',
      officerARO: 'জনাব তারেক মাহমুদ, এআরও',
      officerRO: 'জনাব রফিকুল বারী, আরও',
      officerAC_DC: 'জনাব শামীম রেজা, উপ-কমিশনার',
      officerJC_ADC: 'জনাব মোস্তাফিজুর রহমান, অতিরিক্ত কমিশনার',
      remarks: 'কাস্টমস আইনের ধারা ২০২(১)(গ) অনুযায়ী ব্যাংক অ্যাকাউন্ট ফ্রিজ।'
    },
    {
      id: 'cp-4',
      companyName: 'মেসার্স অ্যাপোলো ডায়িং এন্ড প্যাকেজিং ইন্ডাস্ট্রিজ',
      address: 'টঙ্গী শিল্প এলাকা, গাজীপুর',
      bondLicenseNo: 'বন্ড/লাইসেন্স/গা-১৫/২০২০',
      bin: '004567890-0404',
      circle: '১',
      auditStatus: 'অডিট সম্পন্ন',
      auditYear: '২০২৩-২৪',
      lastAuditDate: '২০২৪-১২-১৮',
      auditObservations: 'অডিট সম্পন্নান্তে চূড়ান্ত নিরীক্ষা প্রত্যয়নপত্র ইস্যু করা হয়েছে।',
      arrearsTaka: 18500000,
      arrearsCrore: 1.85,
      linkedCaseNos: 'রীট পিটিশন নং- ৪৫০/২০২৫',
      commercialManagerName: 'জনাব নাজমুল হক',
      commercialManagerMobile: '01712-998877',
      commercialManagerEmail: 'commercial@apollodyeing.com',
      officerARO: 'জনাব কামরুল হাসান, এআরও',
      officerRO: 'জনাব শফিকুল ইসলাম, আরও',
      officerAC_DC: 'জনাব মাহফুজুর রহমান, উপ-কমিশনার',
      officerJC_ADC: 'জনাব মোস্তাফিজুর রহমান, অতিরিক্ত কমিশনার',
      remarks: 'কারণ দর্শাও নোটিশের জবাব দাখিলকৃত।'
    }
  ];
}

// Initial Tasks
export function getInitialCircleTasks(): CircleTaskItem[] {
  return [
    {
      id: 'task-1',
      title: 'মেসার্স ডেল্টা টেক্সটাইলের বন্ডিং অনিয়ম বিষয়ে শুনানির নোটিশ জারি',
      companyName: 'মেসার্স ডেল্টা টেক্সটাইল মিলস লিমিটেড',
      circle: '১',
      taskType: 'শুনানি',
      dueDate: '২০২৬-০৩-১৫',
      priority: 'high',
      status: 'pending',
      assignedOfficer: 'জনাব কামরুল হাসান, এআরও',
      notes: 'কাঁচামাল আমদানির ইউডি ও স্টক রেজিস্টার তলব করতে হবে।'
    },
    {
      id: 'task-2',
      title: 'সাউথ এশিয়া স্পিনিংয়ের কারণ দর্শাও নোটিশের জবাব পর্যালোচনা ও খসড়া তৈরি',
      companyName: 'মেসার্স সাউথ এশিয়া স্পিনিং মিলস লিঃ',
      circle: '২',
      taskType: 'কারণ দর্শাও নোটিশ',
      dueDate: '২০২৬-০৩-১৮',
      priority: 'medium',
      status: 'in_progress',
      assignedOfficer: 'জনাব মাহবুব আলম, আরও',
      notes: 'করদাতার সময় বৃদ্ধির আবেদন দাখিল করা হয়েছে।'
    },
    {
      id: 'task-3',
      title: 'পদ্মা সিনথেটিক ফ্যাব্রিক্সের ব্যাংক ফ্রিজ আদেশ বলবৎ রাখার তাগিদপত্র প্রেরণ',
      companyName: 'মেসার্স পদ্মা সিনথেটিক ফ্যাব্রিক্স লিঃ',
      circle: '৩',
      taskType: 'বকেয়া তাগিদ',
      dueDate: '২০২৬-০৩-১২',
      priority: 'high',
      status: 'pending',
      assignedOfficer: 'জনাব তারেক মাহমুদ, এআরও',
      notes: 'বাংলাদেশ ব্যাংকে ২০২(১)(গ) ধারার ফলোআপ পত্র।'
    },
    {
      id: 'task-4',
      title: 'সার্কেল-১ এর বিগত মাসের বকেয়া রাজস্ব আদায় মাসিক বিবরণী প্রস্তুত',
      companyName: 'সার্কেল-১ সকল প্রতিষ্ঠান',
      circle: '১',
      taskType: 'প্রতিবেদন তৈরি',
      dueDate: '২০২৬-০৩-১০',
      priority: 'medium',
      status: 'completed',
      assignedOfficer: 'জনাব শফিকুল ইসলাম, আরও',
      completedAt: '২০২৬-০৩-০৯',
      notes: 'মাসিক প্রতিবেদনে তথ্য অন্তর্ভুক্ত সম্পন্ন।'
    }
  ];
}

// Initial Hearing Notices
export function getInitialHearingNotices(): HearingNotice[] {
  return [
    {
      id: 'notice-1',
      memoNo: '০৮.০১.০০০০.০১২.০৩.০০১.২৬-১০৫',
      date: '২০২৬-০৩-০৫',
      companyName: 'মেসার্স ডেল্টা টেক্সটাইল মিলস লিমিটেড',
      address: 'প্লট নং- ১২, কোনাবাড়ী বিসিক শিল্প এলাকা, গাজীপুর',
      bin: '001234567-0101',
      circle: '১',
      hearingDate: '২০২৬-০৩-২২',
      hearingTime: 'সকাল ১১:৩০ ঘটিকা',
      hearingLocation: 'কমিশনার মহোদয়ের সভা কক্ষ (কক্ষ নং- ৩০২), কাস্টমস বন্ড কমিশনারেট',
      subject: 'বন্ড সুবিধায় শুল্কমুক্ত আমদানিকৃত কাঁচামাল অনিয়ম ও রাজস্ব বকেয়া দাবীর প্রেক্ষিতে শুনানিতে উপস্থিতি প্রসঙ্গে।',
      caseOrDemandRef: 'নথি নং- ০৮/বকেয়া/সার্কেল-১/কাস্টমস/২০২৫, তাং- ১৫/০১/২০২৫',
      demandedAmountTaka: 45000000,
      requiredDocuments: '১. কাঁচামাল আমদানি ইনভয়েস ও বিল অব এন্ট্রি\n২. ইউটিলাইজেশন ডিক্লারেশন (UD) ও রেজিস্টার\n৩. কাঁচামাল মজুদ রেজিস্টার ও রপ্তানি প্রত্যয়নপত্র\n৪. অনুমোদিত প্রতিনিধির ক্ষমতাপত্র',
      signatoryName: 'জনাব মাহফুজুর রহমান',
      signatoryDesignation: 'উপ-কমিশনার, সার্কেল-১, কাস্টমস বন্ড কমিশনারেট',
      status: 'issued'
    }
  ];
}

// Initial Show Cause & Orders
export function getInitialShowCauseAndOrders(): ShowCauseAndOrderRecord[] {
  return [
    {
      id: 'scn-1',
      companyName: 'মেসার্স ডেল্টা টেক্সটাইল মিলস লিমিটেড',
      circle: '১',
      bin: '001234567-0101',
      scnNo: 'এসসিএন নং- ০৪/সার্কেল-১/বন্ড/২০২৫',
      scnDate: '২০২৫-১০-১৫',
      demandAmountTaka: 45000000,
      replyDeadline: '২০২৫-১১-১৫',
      replyStatus: 'জবাব দাখিলকৃত',
      orderNo: 'বিচারাদেশ নং- ০৮/কমিশনার/বন্ড/২০২৫',
      orderDate: '২০২৫-১২-২০',
      adjudicatedDutyTaka: 45000000,
      penaltyTaka: 5000000,
      totalAdjudicatedTaka: 50000000,
      realizedAmountTaka: 0,
      outstandingAmountTaka: 50000000,
      orderStatus: 'বিচারাদেশ জারি সম্পন্ন',
      adjudicatingAuthority: 'কমিশনার, কাস্টমস বন্ড কমিশনারেট',
      remarks: 'করদাতা বিজ্ঞ হাইকোর্টে রীট পিটিশন দায়েরপূর্বক স্থগিতাদেশ গ্রহণ করেছে।'
    },
    {
      id: 'scn-2',
      companyName: 'মেসার্স সাউথ এশিয়া স্পিনিং মিলস লিঃ',
      circle: '২',
      bin: '002345678-0202',
      scnNo: 'এসসিএন নং- ১২/সার্কেল-২/বন্ড/২০২৪',
      scnDate: '২০২৪-০৭-১০',
      demandAmountTaka: 82500000,
      replyDeadline: '২০২৪-০৮-১০',
      replyStatus: 'জবাব দাখিলকৃত',
      orderNo: 'বিচারাদেশ নং- ০৫/অতিরিক্ত কমিশনার/২০২৪',
      orderDate: '২০২৪-০৯-১৫',
      adjudicatedDutyTaka: 82500000,
      penaltyTaka: 10000000,
      totalAdjudicatedTaka: 92500000,
      realizedAmountTaka: 8250000, // 10% pre-deposit
      outstandingAmountTaka: 84250000,
      orderStatus: 'আপীল দায়েরকৃত',
      adjudicatingAuthority: 'অতিরিক্ত কমিশনার, কাস্টমস বন্ড কমিশনারেট',
      remarks: 'আপিলাত ট্রাইব্যুনালে বিচারাধীন রয়েছে।'
    }
  ];
}

// Initial Reminders
export function getInitialCircleReminders(): CircleReminder[] {
  return [
    {
      id: 'rem-1',
      title: 'মেসার্স ডেল্টা টেক্সটাইলের চূড়ান্ত শুনানির দিন',
      date: '২০২৬-০৩-২২',
      time: '11:30',
      companyName: 'মেসার্স ডেল্টা টেক্সটাইল মিলস লিমিটেড',
      circle: '১',
      type: 'hearing',
      completed: false,
      notes: 'কক্ষ নং- ৩০২ তে শুনানির জন্য ফাইল প্রস্তুত রাখা।'
    },
    {
      id: 'rem-2',
      title: 'সার্কেল-২ এর অডিট নিষ্পত্তি সভার ফলোআপ',
      date: '২০২৬-০৩-২৫',
      time: '15:00',
      companyName: 'মেসার্স সাউথ এশিয়া স্পিনিং মিলস লিঃ',
      circle: '২',
      type: 'audit_deadline',
      completed: false,
      notes: 'অডিট দল কর্তৃক দাখিলকৃত কাগজপত্রের কপি সংগ্রহ।'
    }
  ];
}

// LocalStorage Handlers
export function loadCircleProfiles(): CompanyCircleProfile[] {
  try {
    const raw = localStorage.getItem(CIRCLE_COMPANIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load circle profiles', e);
  }
  return getInitialCircleProfiles();
}

export function saveCircleProfiles(items: CompanyCircleProfile[]): void {
  try {
    localStorage.setItem(CIRCLE_COMPANIES_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save circle profiles', e);
  }
}

export function loadCircleTasks(): CircleTaskItem[] {
  try {
    const raw = localStorage.getItem(CIRCLE_TASKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load circle tasks', e);
  }
  return getInitialCircleTasks();
}

export function saveCircleTasks(items: CircleTaskItem[]): void {
  try {
    localStorage.setItem(CIRCLE_TASKS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save circle tasks', e);
  }
}

export function loadHearingNotices(): HearingNotice[] {
  try {
    const raw = localStorage.getItem(CIRCLE_NOTICES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load hearing notices', e);
  }
  return getInitialHearingNotices();
}

export function saveHearingNotices(items: HearingNotice[]): void {
  try {
    localStorage.setItem(CIRCLE_NOTICES_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save hearing notices', e);
  }
}

export function loadShowCauseAndOrders(): ShowCauseAndOrderRecord[] {
  try {
    const raw = localStorage.getItem(CIRCLE_SCN_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load SCN and orders', e);
  }
  return getInitialShowCauseAndOrders();
}

export function saveShowCauseAndOrders(items: ShowCauseAndOrderRecord[]): void {
  try {
    localStorage.setItem(CIRCLE_SCN_ORDERS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save SCN and orders', e);
  }
}

export function loadCircleReminders(): CircleReminder[] {
  try {
    const raw = localStorage.getItem(CIRCLE_REMINDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load circle reminders', e);
  }
  return getInitialCircleReminders();
}

export function saveCircleReminders(items: CircleReminder[]): void {
  try {
    localStorage.setItem(CIRCLE_REMINDERS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save circle reminders', e);
  }
}

// Initial Circle Assignments (Default mappings per circle)
export function getInitialCircleAssignments(): CircleAssignmentConfig[] {
  return [
    {
      circle: '১',
      circleName: 'সার্কেল-১ (গাজীপুর ও সংলগ্ন এলাকা)',
      circleOfficeAddress: 'কাস্টমস, এক্সাইজ ও ভ্যাট ভবন, জয়দেবপুর রোড, গাজীপুর',
      circleOfficePhone: '০২-৯২৬১১২৩',
      revenueTargetCrore: 85.0,
      aroName: 'জনাব কামরুল হাসান, এআরও',
      roName: 'জনাব শফিকুল ইসলাম, আরও',
      acDcName: 'জনাব মাহফুজুর রহমান, উপ-কমিশনার',
      jcAdcName: 'জনাব মোস্তাফিজুর রহমান, অতিরিক্ত কমিশনার',
      updatedAt: '২০২৬-০১-১৫'
    },
    {
      circle: '২',
      circleName: 'সার্কেল-২ (নারায়ণগঞ্জ ও কাঁচপুর এলাকা)',
      circleOfficeAddress: 'ভ্যাট সার্কেল অফিস, ঢাকা-চট্টগ্রাম মহাসড়ক, কাঁচপুর, নারায়ণগঞ্জ',
      circleOfficePhone: '০২-৭৬৪৫৬৭৮',
      revenueTargetCrore: 120.0,
      aroName: 'জনাব জয়নাল আবেদীন, এআরও',
      roName: 'জনাব মাহবুব আলম, আরও',
      acDcName: 'জনাব এনামুল হক, সহকারী কমিশনার',
      jcAdcName: 'জনাব সুলতান মাহমুদ, যুগ্ম কমিশনার',
      updatedAt: '২০২৬-০১-১৫'
    },
    {
      circle: '৩',
      circleName: 'সার্কেল-৩ (বন্দর ও মেঘনা ঘাট এলাকা)',
      circleOfficeAddress: 'সার্কেল ভবন, মেঘনা ঘাট সংলগ্ন, সোনারগাঁও, নারায়ণগঞ্জ',
      circleOfficePhone: '০২-৭৬৫৮৯০০',
      revenueTargetCrore: 95.0,
      aroName: 'জনাব তারেক মাহমুদ, এআরও',
      roName: 'জনাব রফিকুল বারী, আরও',
      acDcName: 'জনাব শামীম রেজা, উপ-কমিশনার',
      jcAdcName: 'জনাব মোস্তাফিজুর রহমান, অতিরিক্ত কমিশনার',
      updatedAt: '২০২৬-০১-১৫'
    },
    {
      circle: '৪',
      circleName: 'সার্কেল-৪ (সাভার ও ধামরাই এলাকা)',
      circleOfficeAddress: 'ভ্যাট কমপ্লেক্স, থানা রোড, সাভার, ঢাকা',
      circleOfficePhone: '০২-৭৭৪১২৩৪',
      revenueTargetCrore: 75.0,
      aroName: 'জনাব আশরাফুল ইসলাম, এআরও',
      roName: 'জনাব জাকির হোসেন, আরও',
      acDcName: 'জনাব নাসির উদ্দিন, সহকারী কমিশনার',
      jcAdcName: 'জনাব সুলতান মাহমুদ, যুগ্ম কমিশনার',
      updatedAt: '২০২৬-০১-১৫'
    },
    {
      circle: '৫',
      circleName: 'সার্কেল-৫ (টঙ্গী ও আশুলিয়া এলাকা)',
      circleOfficeAddress: 'শিল্প এলাকা ভবন, চেরাগআলী মার্কেট, টঙ্গী, গাজীপুর',
      circleOfficePhone: '০২-৯৮১০৯৮৭',
      revenueTargetCrore: 110.0,
      aroName: 'জনাব শরিফুল ইসলাম, এআরও',
      roName: 'জনাব মিজানুর রহমান, আরও',
      acDcName: 'জনাব মোশাররফ হোসেন, উপ-কমিশনার',
      jcAdcName: 'জনাব মোস্তাফিজুর রহমান, অতিরিক্ত কমিশনার',
      updatedAt: '২০২৬-০১-১৫'
    },
    {
      circle: '৬',
      circleName: 'সার্কেল-৬ (নরসিংদী ও ভৈরব এলাকা)',
      circleOfficeAddress: 'কালেক্টরেট ভবন, ভেলানগর, নরসিংদী',
      circleOfficePhone: '০২-৯৪৬২৩৪৫',
      revenueTargetCrore: 65.0,
      aroName: 'জনাব হাসিবুল হক, এআরও',
      roName: 'জনাব তানভীর আহমেদ, আরও',
      acDcName: 'জনাব কামরুল হাসান, সহকারী কমিশনার',
      jcAdcName: 'জনাব সুলতান মাহমুদ, যুগ্ম কমিশনার',
      updatedAt: '২০২৬-০১-১৫'
    }
  ];
}

// Initial Officers Directory
export function getInitialOfficers(): OfficerRecord[] {
  return [
    {
      id: 'off-1',
      name: 'জনাব কামরুল হাসান',
      designation: 'ARO',
      designationBangla: 'সহকারী রাজস্ব কর্মকর্তা (ARO)',
      mobile: '01711-123456',
      email: 'kamrul.aro@customs.gov.bd',
      assignedCircles: ['১'],
      active: true,
      roomNo: 'কক্ষ নং- ২০৪'
    },
    {
      id: 'off-2',
      name: 'জনাব শফিকুল ইসলাম',
      designation: 'RO',
      designationBangla: 'রাজস্ব কর্মকর্তা (RO)',
      mobile: '01712-234567',
      email: 'shafiqul.ro@customs.gov.bd',
      assignedCircles: ['১'],
      active: true,
      roomNo: 'কক্ষ নং- ২০৫'
    },
    {
      id: 'off-3',
      name: 'জনাব মাহফুজুর রহমান',
      designation: 'DC',
      designationBangla: 'উপ-কমিশনার (DC)',
      mobile: '01713-345678',
      email: 'mahfuz.dc@customs.gov.bd',
      assignedCircles: ['১'],
      active: true,
      roomNo: 'কক্ষ নং- ৩০২'
    },
    {
      id: 'off-4',
      name: 'জনাব মোস্তাফিজুর রহমান',
      designation: 'ADC',
      designationBangla: 'অতিরিক্ত কমিশনার (ADC)',
      mobile: '01714-456789',
      email: 'mostafiz.adc@customs.gov.bd',
      assignedCircles: ['১', '৩', '৫'],
      active: true,
      roomNo: 'কক্ষ নং- ৪০১'
    },
    {
      id: 'off-5',
      name: 'জনাব জয়নাল আবেদীন',
      designation: 'ARO',
      designationBangla: 'সহকারী রাজস্ব কর্মকর্তা (ARO)',
      mobile: '01811-112233',
      email: 'zoynal.aro@customs.gov.bd',
      assignedCircles: ['২'],
      active: true,
      roomNo: 'কক্ষ নং- ২০৬'
    },
    {
      id: 'off-6',
      name: 'জনাব মাহবুব আলম',
      designation: 'RO',
      designationBangla: 'রাজস্ব কর্মকর্তা (RO)',
      mobile: '01812-223344',
      email: 'mahbub.ro@customs.gov.bd',
      assignedCircles: ['২'],
      active: true,
      roomNo: 'কক্ষ নং- ২০৭'
    },
    {
      id: 'off-7',
      name: 'জনাব এনামুল হক',
      designation: 'AC',
      designationBangla: 'সহকারী কমিশনার (AC)',
      mobile: '01813-334455',
      email: 'enamul.ac@customs.gov.bd',
      assignedCircles: ['২'],
      active: true,
      roomNo: 'কক্ষ নং- ৩০৩'
    },
    {
      id: 'off-8',
      name: 'জনাব সুলতান মাহমুদ',
      designation: 'JC',
      designationBangla: 'যুগ্ম কমিশনার (JC)',
      mobile: '01814-445566',
      email: 'sultan.jc@customs.gov.bd',
      assignedCircles: ['২', '৪', '৬'],
      active: true,
      roomNo: 'কক্ষ নং- ৪০২'
    },
    {
      id: 'off-9',
      name: 'জনাব তারেক মাহমুদ',
      designation: 'ARO',
      designationBangla: 'সহকারী রাজস্ব কর্মকর্তা (ARO)',
      mobile: '01911-556677',
      email: 'tarek.aro@customs.gov.bd',
      assignedCircles: ['৩'],
      active: true,
      roomNo: 'কক্ষ নং- ২০৮'
    },
    {
      id: 'off-10',
      name: 'জনাব রফিকুল বারী',
      designation: 'RO',
      designationBangla: 'রাজস্ব কর্মকর্তা (RO)',
      mobile: '01912-667788',
      email: 'rafiqul.ro@customs.gov.bd',
      assignedCircles: ['৩'],
      active: true,
      roomNo: 'কক্ষ নং- ২০৯'
    },
    {
      id: 'off-11',
      name: 'জনাব শামীম রেজা',
      designation: 'DC',
      designationBangla: 'উপ-কমিশনার (DC)',
      mobile: '01913-778899',
      email: 'shamim.dc@customs.gov.bd',
      assignedCircles: ['৩'],
      active: true,
      roomNo: 'কক্ষ নং- ৩০৪'
    }
  ];
}

export function loadCircleAssignments(): CircleAssignmentConfig[] {
  try {
    const raw = localStorage.getItem(CIRCLE_ASSIGNMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load circle assignments', e);
  }
  return getInitialCircleAssignments();
}

export function saveCircleAssignments(items: CircleAssignmentConfig[]): void {
  try {
    localStorage.setItem(CIRCLE_ASSIGNMENTS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save circle assignments', e);
  }
}

export function loadOfficers(): OfficerRecord[] {
  try {
    const raw = localStorage.getItem(CIRCLE_OFFICERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load officers', e);
  }
  return getInitialOfficers();
}

export function saveOfficers(items: OfficerRecord[]): void {
  try {
    localStorage.setItem(CIRCLE_OFFICERS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save officers', e);
  }
}

// Initial File Movement Register Records
export function getInitialFileMovements(): FileMovementRecord[] {
  return [
    {
      id: 'fm-1',
      fileNo: '০৮.০১.০০০০.০১২.০৩.০০১.২৬/নথি-১',
      companyName: 'মেসার্স ডেল্টা টেক্সটাইল মিলস লিমিটেড',
      subject: 'মেয়াদোত্তীর্ণ বন্ড লাইসেন্স নবায়ন ও অডিট আপত্তি নিষ্পত্তি সংক্রান্ত নথি',
      circle: '১',
      senderBranch: 'সার্কেল-১ (গাজীপুর)',
      senderOfficer: 'জনাব কামরুল হাসান, এআরও',
      receiverBranch: 'আইন ও আপীল শাখা (সদর দপ্তর)',
      receiverOfficer: 'জনাব মাহফুজুর রহমান, উপ-কমিশনার',
      dispatchDate: '২০২৬-০৩-১৫',
      receivedDate: '২০২৬-০৩-১৬',
      status: 'গৃহীত',
      urgency: 'জরুরি',
      notes: 'হাইকোর্টের রীট আদেশের প্রেক্ষিতে জবাব প্রস্তুতের জন্য প্রেরিত।'
    },
    {
      id: 'fm-2',
      fileNo: '০৮.০১.০০০০.০১২.০৪.০১৫.২৬/নথি-২',
      companyName: 'মেসার্স সাউথ এশিয়া স্পিনিং মিলস লিঃ',
      subject: 'কাস্টমস আইনের ধারা ২০২ অনুযায়ী ব্যাংক হিসাব ফ্রিজ সংক্রান্ত নথি',
      circle: '২',
      senderBranch: 'সার্কেল-২ (কাঁচপুর)',
      senderOfficer: 'জনাব মাহবুব আলম, আরও',
      receiverBranch: 'যুগ্ম কমিশনারের দপ্তর',
      receiverOfficer: 'জনাব সুলতান মাহমুদ, যুগ্ম কমিশনার',
      dispatchDate: '২০২৬-০৩-২০',
      status: 'চলমান/পথিমধ্যে',
      urgency: 'অতি জরুরি',
      notes: 'অনুমোদন ও স্বাক্ষরের জন্য উপস্থাপন করা হয়েছে।'
    },
    {
      id: 'fm-3',
      fileNo: '০৮.০১.০০০০.০১২.০৫.০২২.২৬/নথি-৩',
      companyName: 'মেসার্স অ্যাপোলো ডায়িং এন্ড প্যাকেজিং ইন্ডাস্ট্রিজ',
      subject: 'কারণ দর্শাও নোটিশ (SCN) এর বিপরীতে দাখিলকৃত জবাব ও শুনানীর নথি',
      circle: '১',
      senderBranch: 'সার্কেল-১ (টঙ্গী)',
      senderOfficer: 'জনাব শফিকুল ইসলাম, আরও',
      receiverBranch: 'কমিশনার বিচারিক আদালত',
      receiverOfficer: 'কমিশনার মহোদয়',
      dispatchDate: '২০২৬-০৩-২৫',
      receivedDate: '২০২৬-০৩-২৬',
      status: 'নিষ্পন্ন',
      urgency: 'সাধারণ',
      notes: 'বিচারাদেশ জারি সম্পন্ন এবং আদেশের অনুলিপি সার্কেলে প্রেরণ করা হয়েছে।'
    }
  ];
}

export function loadCircleFileMovements(): FileMovementRecord[] {
  try {
    const raw = localStorage.getItem(CIRCLE_FILE_MOVEMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load file movements', e);
  }
  return getInitialFileMovements();
}

export function saveCircleFileMovements(items: FileMovementRecord[]): void {
  try {
    localStorage.setItem(CIRCLE_FILE_MOVEMENTS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save file movements', e);
  }
}

/**
 * Bulk updates/syncs officers of all companies belonging to a circle
 */
export function syncCircleOfficersToCompanies(
  circle: string,
  config: CircleAssignmentConfig,
  companies: CompanyCircleProfile[]
): CompanyCircleProfile[] {
  return companies.map(c => {
    if (c.circle === circle) {
      return {
        ...c,
        officerARO: config.aroName || c.officerARO,
        officerRO: config.roName || c.officerRO,
        officerAC_DC: config.acDcName || c.officerAC_DC,
        officerJC_ADC: config.jcAdcName || c.officerJC_ADC,
        updatedAt: new Date().toISOString().split('T')[0]
      };
    }
    return c;
  });
}

/**
 * Assigns one or more officers to specified companies based on officer designation
 */
export function applyOfficerAssignmentToCompanies(
  officers: OfficerRecord[],
  companyIds: string[],
  companies: CompanyCircleProfile[]
): CompanyCircleProfile[] {
  const companyIdSet = new Set(companyIds);
  return companies.map(c => {
    if (!companyIdSet.has(c.id)) return c;
    const updated = { ...c };
    officers.forEach(off => {
      const formattedTitle = off.designation === 'ARO' 
        ? `${off.name}, এআরও` 
        : off.designation === 'RO'
        ? `${off.name}, আরও`
        : off.designation === 'DC'
        ? `${off.name}, উপ-কমিশনার`
        : off.designation === 'AC'
        ? `${off.name}, সহকারী কমিশনার`
        : off.designation === 'ADC'
        ? `${off.name}, অতিরিক্ত কমিশনার`
        : `${off.name}, যুগ্ম কমিশনার`;

      if (off.designation === 'ARO') updated.officerARO = formattedTitle;
      else if (off.designation === 'RO') updated.officerRO = formattedTitle;
      else if (off.designation === 'AC' || off.designation === 'DC') updated.officerAC_DC = formattedTitle;
      else if (off.designation === 'JC' || off.designation === 'ADC') updated.officerJC_ADC = formattedTitle;
    });
    updated.updatedAt = new Date().toISOString().split('T')[0];
    return updated;
  });
}

/**
 * Bulk updates designated officers to a set of company IDs
 */
export function bulkAssignOfficersToCompanies(
  companyIds: string[],
  officersData: {
    officerARO?: string;
    officerRO?: string;
    officerAC_DC?: string;
    officerJC_ADC?: string;
  },
  companies: CompanyCircleProfile[]
): CompanyCircleProfile[] {
  const companyIdSet = new Set(companyIds);
  return companies.map(c => {
    if (!companyIdSet.has(c.id)) return c;
    return {
      ...c,
      officerARO: officersData.officerARO !== undefined ? officersData.officerARO : c.officerARO,
      officerRO: officersData.officerRO !== undefined ? officersData.officerRO : c.officerRO,
      officerAC_DC: officersData.officerAC_DC !== undefined ? officersData.officerAC_DC : c.officerAC_DC,
      officerJC_ADC: officersData.officerJC_ADC !== undefined ? officersData.officerJC_ADC : c.officerJC_ADC,
      updatedAt: new Date().toISOString().split('T')[0]
    };
  });
}


