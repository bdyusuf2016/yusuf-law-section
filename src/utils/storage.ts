import { CaseRecord, SystemNotification, UserSession } from '../types/case';
import { getInitialCases } from '../data/initialCases';

const STORAGE_KEY_CASES = 'bd_court_cases_cache_v5_all_pdf_cases';
const STORAGE_KEY_SESSION = 'bd_court_cases_session';
const STORAGE_KEY_NOTIFS = 'bd_court_cases_notifications';
const STORAGE_KEY_WEBHOOK = 'bd_court_cases_webhook_url';

export function loadCachedCases(): CaseRecord[] {
  const initial = getInitialCases();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CASES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= initial.length) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load cases from localStorage cache:', err);
  }
  saveCachedCases(initial);
  return initial;
}

export function saveCachedCases(cases: CaseRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save cases to cache:', err);
  }
}

export function resetToDefaultCases(): CaseRecord[] {
  const initial = getInitialCases();
  saveCachedCases(initial);
  return initial;
}

export function loadUserSession(): UserSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  return {
    isLoggedIn: true,
    username: 'রাজস্ব কর্মকর্তা',
    role: 'admin',
    loginTime: new Date().toISOString()
  };
}

export function saveUserSession(session: UserSession): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error(e);
  }
}

export function loadWebhookUrl(): string {
  return localStorage.getItem(STORAGE_KEY_WEBHOOK) || '';
}

export function saveWebhookUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_WEBHOOK, url);
}

/**
 * Generates dynamic system notifications from cases dataset
 */
export function generateSystemNotifications(cases: CaseRecord[]): SystemNotification[] {
  const notifications: SystemNotification[] = [];

  // Urgent hearings in 2026
  const upcomingHearings = cases.filter(c => c.latestStatus.includes('2026') || c.latestStatus.includes('২০২৬'));
  if (upcomingHearings.length > 0) {
    notifications.push({
      id: 'notif-hearings-2026',
      title: '🚨 ২০২৬ সালের নির্ধারিত শুনানি সতর্কতা',
      message: `${upcomingHearings.length}টি মামলার শুনানি ও আদেশের তারিখ ২০২৬ সালে নির্ধারিত রয়েছে। প্রয়োজনীয় নথিপত্র প্রস্তুত রাখুন।`,
      date: 'আজ',
      type: 'urgent',
      read: false
    });
  }

  // Attorney general correspondence required
  const agCases = cases.filter(c => c.latestStatus.includes('অ্যাটর্নি জেনারেল') || c.remarks.includes('অ্যাটর্নি জেনারেল'));
  if (agCases.length > 0) {
    notifications.push({
      id: 'notif-ag-action',
      title: '⚖️ বিজ্ঞ অ্যাটর্নি জেনারেল মহোদয়ের দপ্তরে তাগিদ',
      message: `${agCases.length}টি মামলা দ্রুত কজলিস্টভুক্ত ও নিষ্পত্তির লক্ষ্যে বিজ্ঞ অ্যাটর্নি জেনারেল মহোদয় বরাবর পত্র প্রেরণ ও তদারকি প্রয়োজন।`,
      date: 'গতকাল',
      type: 'warning',
      read: false
    });
  }

  // Stay order cases
  const stayCases = cases.filter(c => c.latestStatus.includes('স্থগিতাদেশ') || c.latestStatus.includes('extended'));
  if (stayCases.length > 0) {
    notifications.push({
      id: 'notif-stay-orders',
      title: '⏱️ স্থগিতাদেশ (Stay Order) পর্যবেক্ষণ',
      message: `${stayCases.length}টি মামলায় ৬ মাস/১ বছরের অন্তর্বর্তীকালীন স্থগিতাদেশ চলমান। মেয়াদ উত্তীর্ণের পূর্বে ভ্যাকুয়াম অ্যাপ্লিকেশন দাখিলের উদ্যোগ নিন।`,
      date: '৩ দিন আগে',
      type: 'info',
      read: false
    });
  }

  // Supreme court appeals
  const scCases = cases.filter(c => c.court.includes('সুপ্রিম কোর্ট') || c.latestStatus.includes('সিভিল পিটিশন'));
  if (scCases.length > 0) {
    notifications.push({
      id: 'notif-sc-cases',
      title: '🏛️ সুপ্রিম কোর্ট (আপীল বিভাগ) সিভিল পিটিশন',
      message: `${scCases.length}টি মামলা সুপ্রিম কোর্টের আপীল বিভাগে চলমান। লিভ টু আপিল নিষ্পত্তির পদক্ষেপ চলমান।`,
      date: '৫ দিন আগে',
      type: 'info',
      read: true
    });
  }

  return notifications;
}
