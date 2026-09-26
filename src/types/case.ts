export interface CaseRecord {
  id: string;
  slNo: string | number; // ক্র.নং
  companyName: string; // প্রতিষ্ঠানের নাম
  address?: string; // ঠিকানা
  circle?: string; // সার্কেল
  caseType: string; // মামলার ধরণ (রীট পিটিশন, কাস্টমস আপীল, ইত্যাদি)
  caseYear: string; // মামলার সাল
  caseNo: string; // মামলা নং
  amountTaka: number; // বকেয়ার পরিমাণ (টাকা)
  amountCrore: number; // বকেয়ার পরিমাণ (কোটি টাকা) - calculated/converted
  court: string; // কোন আদালতে মামলাধীন রয়েছে (হাইকোর্ট, আপীলাত বিভাগ, ইত্যাদি)
  description: string; // মামলার বিষয়বস্তু ও বকেয়ার উদ্ভবের কারণ
  caseSubjectReason?: string; // বিকল্প ফিল্ড নাম (বিষয়বস্তু ও উদ্ভবের কারণ)
  latestStatus: string; // মামলার সর্বশেষ পরিস্থিতি
  remarks: string; // মন্তব্য (বিচারাদেশ, ট্রাইব্যুনাল, শুনানি ও আইনি অগ্রগতি)
  supremeCourtUrl?: string; // সুপ্রিম কোর্ট লিংক
  hearingDate?: string; // পরবর্তী/পূর্ববর্তী শুনানির তারিখ (if available)
  statusCategory?: 'rule' | 'stay' | 'hearing' | 'not_in_causelist' | 'disposed' | 'other';
  originPeriod?: string; // সংশ্লিষ্ট বকেয়া উদ্ভবের সময়কাল (যেমন: ২০১৭ সাল, ২০২১ সাল)
  courtHierarchy?: string; // কোন আদালতে মামলাধীন রয়েছে (যেমন: মাননীয় সুপ্রিম কোর্টের হাইকোর্ট বিভাগ)
  isNewThisMonth?: boolean; // এ মাসে দায়েরকৃত নতুন মামলা
  filingDate?: string; // মামলা দায়েরের তারিখ
  isDisposed?: boolean; // নিষ্পত্তিকৃত মামলা
  disposalDate?: string; // মামলা নিষ্পত্তির তারিখ
  disposalOutcome?: string; // নিষ্পত্তির ফলাফল (সরকারের পক্ষে/বিপক্ষে/আংশিক/রিমান্ড)
  recoveredAmountTaka?: number; // সরকারের অনুকূলে আদায়কৃত রাজস্ব (টাকা)
  disposalSummary?: string; // নিষ্পত্তির আদেশ/রায়ের সংক্ষিপ্ত বিবরণ
  updatedAt?: string;
}

export type CourtFilter = 'all' | 'হাইকোর্ট' | 'সুপ্রিম কোর্ট' | 'আপীল ট্রাইব্যুনাল' | 'অন্যান্য';

export interface FilterState {
  searchQuery: string;
  court: string;
  caseType: string;
  year: string;
  amountRange: string; // 'all' | '50_plus' | '10_50' | '1_10' | 'under_1' | 'zero'
  statusCategory: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  username: string;
  role: 'admin' | 'officer' | 'viewer';
  token?: string;
  loginTime?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  caseId?: string;
  date: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  read: boolean;
}
