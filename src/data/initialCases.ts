import { CaseRecord } from '../types/case';
import { takaToCrore, getStatusCategory } from '../utils/converter';
import { casesPage1to10 } from './casesPage1to10';
import { casesPage11to20 } from './casesPage11to20';
import { casesPage21to29 } from './casesPage21to29';

// Combine all 29 pages of case records
export const allCasesRaw: Omit<CaseRecord, 'amountCrore' | 'statusCategory'>[] = [
  ...casesPage1to10,
  ...casesPage11to20,
  ...casesPage21to29
];

export function getInitialCases(): CaseRecord[] {
  return allCasesRaw.map((item) => {
    // Ensure circle has only numbers (strip any non-numeric characters if present)
    const rawCircle = String(item.circle || '').replace(/[^0-9০-৯]/g, '').trim();
    const finalCircle = rawCircle || '১';

    return {
      ...item,
      circle: finalCircle,
      amountCrore: takaToCrore(item.amountTaka),
      statusCategory: getStatusCategory(item.latestStatus),
      updatedAt: new Date().toISOString()
    };
  });
}
