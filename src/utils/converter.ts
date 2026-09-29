// Utility functions for Bengali numeral formatting and Crore calculations

export const CRORE_DIVISOR = 10000000; // 1 Crore = 10,000,000 Taka (১ কোটি = ১,০০,০০,০০০)

/**
 * Converts raw Taka amount to Crore (কোটি টাকা)
 * @param taka Amount in Taka
 * @param decimals Number of decimal places (default 4 for precision, display 2 or 4)
 */
export function takaToCrore(taka: number, decimals: number = 4): number {
  if (isNaN(taka) || taka === 0) return 0;
  const crore = taka / CRORE_DIVISOR;
  return Number(crore.toFixed(decimals));
}

/**
 * Converts Crore to raw Taka
 */
export function croreToTaka(crore: number): number {
  if (isNaN(crore) || crore === 0) return 0;
  return Math.round(crore * CRORE_DIVISOR);
}

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Converts English digits to Bengali digits
 */
export function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '০';
  const str = String(val);
  return str.replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

/**
 * Converts Bengali digits string to English number
 */
export function parseBengaliNumber(str: string): number {
  if (!str) return 0;
  let engStr = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const idx = bengaliDigits.indexOf(char);
    if (idx !== -1) {
      engStr += englishDigits[idx];
    } else if (char === '.' || (char >= '0' && char <= '9') || char === '-') {
      engStr += char;
    }
  }
  const parsed = parseFloat(engStr);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a number in Bangladeshi currency comma format (12,34,56,789.00)
 */
export function formatTaka(num: number): string {
  if (isNaN(num)) return '০ টাকা';
  const parts = Math.round(num).toString().split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return toBengaliNumber(formatted) + ' টাকা';
}

/**
 * Formats crore amount with Bengali text (যেমন: ৭২০.৭৮ কোটি টাকা)
 */
export function formatCrore(crore: number, showSymbol: boolean = true): string {
  if (isNaN(crore) || crore === 0) return '০.০০ কোটি টাকা';
  const formattedEng = crore >= 1 ? crore.toFixed(2) : crore.toFixed(4);
  const bn = toBengaliNumber(formattedEng);
  return showSymbol ? `${bn} কোটি টাকা` : `${bn} কোটি`;
}

export const formatCurrencyCrore = formatCrore;
export const formatBanglaNumber = toBengaliNumber;

/**
 * Categorizes latest status string into standardized category
 */
export function getStatusCategory(status: string = '', remarks: string = ''): 'rule' | 'stay' | 'hearing' | 'not_in_causelist' | 'disposed' | 'other' {
  const s = (status + ' ' + remarks).toLowerCase();
  if (s.includes('কজলিস্ট') || s.includes('কজ লিস্ট') || s.includes('not in cause list') || s.includes('causelist')) return 'not_in_causelist';
  if (s.includes('disposed') || s.includes('allowed') || s.includes('নিষ্পত্তি') || s.includes('খারিজ') || s.includes('বাতিল') || s.includes('absolute')) return 'disposed';
  if (s.includes('স্থগিতাদেশ') || s.includes('injunction') || s.includes('stay') || s.includes('extended')) return 'stay';
  if (s.includes('শুনানি') || s.includes('hearing') || s.includes('ready for hearing')) return 'hearing';
  if (s.includes('rule') || s.includes('রুল')) return 'rule';
  return 'other';
}

export function getStatusBadge(status: string = '', remarks: string = ''): { label: string; color: string; bg: string } {
  const cat = getStatusCategory(status, remarks);
  switch (cat) {
    case 'stay':
      return { label: 'স্থগিতাদেশ', color: 'text-amber-800 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800' };
    case 'rule':
      return { label: 'রুল জারী', color: 'text-blue-800 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800' };
    case 'hearing':
      return { label: 'শুনানি পর্যায়', color: 'text-purple-800 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800' };
    case 'not_in_causelist':
      return { label: 'কজলিস্ট বহির্ভূত', color: 'text-rose-800 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800' };
    case 'disposed':
      return { label: 'নিষ্পত্তি / রায়', color: 'text-emerald-800 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800' };
    default:
      return { label: 'মামলাধীন', color: 'text-slate-800 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700' };
  }
}
