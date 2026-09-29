export interface CompanyCircleProfile {
  id: string;
  companyName: string; // প্রতিষ্ঠানের নাম
  address: string; // ঠিকানা
  bondLicenseNo: string; // বন্ড লাইসেন্স নং
  bin: string; // বিআইএন (BIN) নং
  circle: string; // সার্কেল নং (যেমন: ১, ২, ৩)
  auditStatus: 'অডিট সম্পন্ন' | 'অডিট চলমান' | 'অডিট অনিষ্পন্ন' | 'আপত্তি উত্থাপিত' | 'প্রযোজ্য নয়';
  auditYear?: string; // অডিটের অর্থবছর (যেমন: ২০২২-২৩, ২০২৩-২৪)
  lastAuditDate?: string; // সর্বশেষ অডিটের তারিখ (যেমন: ২০২৪-১২-১০)
  auditObservations?: string; // অডিট আপত্তি বা নিরীক্ষা পর্যবেক্ষণ
  auditOfficer?: string; // অডিট গ্রহণকারী কর্মকর্তা
  arrearsTaka: number; // বকেয়ার পরিমাণ (টাকা)
  arrearsCrore: number; // বকেয়ার পরিমাণ (কোটি টাকা)
  linkedCaseNos?: string; // সংশ্লিষ্ট মামলার তথ্য/মামলা নং
  commercialManagerName: string; // কমার্শিয়াল ম্যানেজারের নাম
  commercialManagerMobile: string; // মোবাইল নম্বর
  commercialManagerEmail: string; // ই-মেইল ঠিকানা
  officerARO: string; // সহকারী রাজস্ব কর্মকর্তা (ARO)
  officerRO: string; // রাজস্ব কর্মকর্তা (RO)
  officerAC_DC: string; // সহকারী কমিশনার / উপ-কমিশনার (AC / DC)
  officerJC_ADC: string; // যুগ্ম কমিশনার / অতিরিক্ত কমিশনার (JC / ADC)
  remarks?: string; // মন্তব্য
  createdAt?: string;
  updatedAt?: string;
}

export interface CircleTaskItem {
  id: string;
  title: string; // কাজের বিষয় / চেকলিস্টের শিরোনাম
  companyName?: string; // সংশ্লিষ্ট প্রতিষ্ঠান
  circle: string; // সার্কেল নং
  taskType: 'শুনানি' | 'কারণ দর্শাও নোটিশ' | 'বিচারাদেশ' | 'বকেয়া তাগিদ' | 'অডিট নিষ্পত্তি' | 'প্রতিবেদন তৈরি' | 'অন্যান্য';
  dueDate: string; // নিষ্পত্তির শেষ তারিখ / সময়সীমা
  priority: 'high' | 'medium' | 'low'; // জরুরি / সাধারণ / অপেক্ষাকৃত কম
  status: 'pending' | 'in_progress' | 'completed'; // পেন্ডিং / চলমান / সম্পন্ন
  assignedOfficer?: string; // দায়িত্বপ্রাপ্ত কর্মকর্তা
  completedAt?: string;
  notes?: string;
}

export interface HearingNotice {
  id: string;
  memoNo: string; // স্মারক নং (যেমন: ০৮.০১.০০০০.০১২.০৩.০০১.২৬)
  date: string; // নোটিশ জারির তারিখ
  companyName: string; // প্রতিষ্ঠানের নাম
  address: string; // প্রতিষ্ঠানের ঠিকানা
  bin: string; // বিআইএন
  circle: string; // সার্কেল
  hearingDate: string; // শুনানির তারিখ
  hearingTime: string; // শুনানির সময় (যেমন: সকাল ১১:০০ ঘটিকা)
  hearingLocation: string; // শুনানির স্থান (যেমন: সম্মেলন কক্ষ / উপ-কমিশনারের কার্যালয়)
  subject: string; // শুনানির বিষয়
  caseOrDemandRef: string; // সূত্র / নথি নং / কারণ দর্শাও নোটিশ নং
  demandedAmountTaka: number; // দাবীকৃত রাজস্ব (টাকা)
  requiredDocuments: string; // শুনানিতে উপস্থাপনীয় নথিপত্র
  signatoryName: string; // শুনানি গ্রহণকারী কর্মকর্তার নাম
  signatoryDesignation: string; // কর্মকর্তার পদবি (যেমন: উপ-কমিশনার / যুগ্ম কমিশনার)
  status: 'draft' | 'issued' | 'completed' | 'adjourned'; // খসড়া / জারিকৃত / সম্পন্ন / মুলতবি
}

export interface ShowCauseAndOrderRecord {
  id: string;
  companyName: string; // প্রতিষ্ঠানের নাম
  circle: string; // সার্কেল নং
  bin?: string; // বিআইএন
  scnNo: string; // কারণ দর্শাও নোটিশ (SCN) নং
  scnDate: string; // এসসিএন জারির তারিখ
  demandAmountTaka: number; // দাবীকৃত রাজস্ব (টাকা)
  replyDeadline: string; // জবাব দাখিলের শেষ সময়সীমা
  replyStatus: 'জবাব দাখিলকৃত' | 'জবাবের অপেক্ষমাণ' | 'সময় বৃদ্ধির আবেদন' | 'জবাব না দেওয়ায় একতরফা বিচার';
  orderNo?: string; // বিচারাদেশ (Order-in-Original) নং
  orderDate?: string; // বিচারাদেশ জারির তারিখ
  adjudicatedDutyTaka?: number; // ধার্যকৃত শুল্ক-কর (টাকা)
  penaltyTaka?: number; // আরোপিত অর্থদণ্ড (টাকা)
  totalAdjudicatedTaka?: number; // সর্বমোট ধার্যকৃত রাজস্ব (টাকা)
  realizedAmountTaka?: number; // সরকারের অনুকূলে আদায়কৃত রাজস্ব (টাকা)
  outstandingAmountTaka?: number; // অবশিষ্ট বকেয়া রাজস্ব (টাকা)
  orderStatus: 'বিচারাদেশ প্রক্রিয়াধীন' | 'বিচারাদেশ জারি সম্পন্ন' | 'আপীল দায়েরকৃত' | 'সম্পূর্ণ আদায়ান্তে নিষ্পত্তি';
  adjudicatingAuthority: string; // বিচারাদেশকারী কর্মকর্তা (যেমন: কমিশনার / অতিরিক্ত কমিশনার / যুগ্ম কমিশনার / উপ-কমিশনার)
  remarks?: string;
}

export interface CircleReminder {
  id: string;
  title: string; // রিমাইন্ডারের শিরোনাম
  date: string; // তারিখ (YYYY-MM-DD)
  time?: string; // সময়
  companyName?: string; // প্রতিষ্ঠান
  circle: string; // সার্কেল
  type: 'hearing' | 'scn_reply' | 'order_due' | 'audit_deadline' | 'report' | 'general';
  completed: boolean;
  notes?: string;
}

export interface OfficerRecord {
  id: string;
  name: string; // কর্মকর্তার নাম
  designation: 'ARO' | 'RO' | 'AC' | 'DC' | 'JC' | 'ADC';
  designationBangla: string; // যেমন: সহকারী রাজস্ব কর্মকর্তা (ARO)
  mobile?: string; // মোবাইল নম্বর
  email?: string; // ই-মেইল
  assignedCircles: string[]; // নিযুক্ত সার্কেলসমূহ (যেমন: ['১'], ['২'])
  assignedCompanyIds?: string[]; // নির্দিষ্ট নিযুক্ত প্রতিষ্ঠানসমূহের ID
  assignedCompanyNames?: string[]; // নির্দিষ্ট নিযুক্ত প্রতিষ্ঠানসমূহের নাম
  active: boolean; // বর্তমানে কর্মরত কিনা
  roomNo?: string; // অফিস কক্ষ নম্বর
  remarks?: string; // মন্তব্য
}

export interface CircleAssignmentConfig {
  circle: string; // সার্কেল নং (যেমন: '১', '২', '৩', '৪', '৫', '৬')
  circleName: string; // সার্কেলের নাম/এলাকা
  circleOfficeAddress?: string; // সার্কেল অফিসের ঠিকানা
  circleOfficePhone?: string; // সার্কেল ফোন / হটলাইন
  revenueTargetCrore?: number; // রাজস্ব লক্ষ্যমাত্রা (কোটি টাকা)
  aroName: string; // নিযুক্ত সহকারী রাজস্ব কর্মকর্তা
  roName: string; // নিযুক্ত রাজস্ব কর্মকর্তা
  acDcName: string; // নিযুক্ত সহকারী/উপ-কমিশনার
  jcAdcName: string; // নিযুক্ত যুগ্ম/অতিরিক্ত কমিশনার
  updatedAt?: string;
}

export interface FileMovementRecord {
  id: string;
  fileNo: string; // নথি নং / ফাইল স্মারক (যেমন: ০৮.০১.০০০০.০১২.০৩.০০১.২৬)
  companyName: string; // সংশ্লিষ্ট প্রতিষ্ঠান
  subject: string; // নথির বিষয়
  circle: string; // সার্কেল নং
  senderBranch: string; // প্রেরক শাখা / সার্কেল
  senderOfficer: string; // প্রেরক কর্মকর্তা
  receiverBranch: string; // প্রাপক শাখা / আদালত / দপ্তর
  receiverOfficer: string; // প্রাপক কর্মকর্তা
  dispatchDate: string; // প্রেরণের তারিখ ও সময়
  receivedDate?: string; // গ্রহণের তারিখ
  status: 'চলমান/পথিমধ্যে' | 'গৃহীত' | 'নিষ্পন্ন' | 'ফেরত প্রেরিত';
  urgency: 'সাধারণ' | 'জরুরি' | 'অতি জরুরি';
  notes?: string; // নির্দেশনা / নোট
  updatedAt?: string;
}

