import { CaseRecord } from '../types/case';
import { formatCrore, formatTaka, toBengaliNumber } from './converter';

export interface PrintColumn {
  key: string;
  label: string;
  getValue: (c: CaseRecord) => any;
}

/**
 * Triggers a clean print dialog using a dedicated hidden iframe.
 * Avoids window.open and doesn't disrupt modal or SPA state.
 */
function printHtmlContent(htmlContent: string) {
  let iframe = document.getElementById('printable-report-iframe') as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'printable-report-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);
  }

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    // Fallback: in case iframe is inaccessible
    console.error('Print iframe could not be initialized.');
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Allow styles and fonts to render
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Direct iframe print encountered an issue:', e);
      // Fallback to window.print if iframe print is restricted
      window.print();
    }
  }, 400);
}

/**
 * Generates and prints an official government-style tabular report
 */
export function printCaseTable(
  cases: CaseRecord[],
  options?: {
    title?: string;
    subtitle?: string;
    columns?: PrintColumn[];
  }
) {
  const title = options?.title || 'প্রতিষ্ঠান ভিত্তিক বিচারাধীন মামলা ও রাজস্ব সংক্রান্ত প্রতিবেদন';
  const subtitle = options?.subtitle || 'কাস্টমস, এক্সাইজ ও ভ্যাট কমিশনারেট / কর অঞ্চল';
  const printDate = new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalCrore = cases.reduce((sum, c) => sum + (c.amountCrore || 0), 0);
  const totalTaka = cases.reduce((sum, c) => sum + (c.amountTaka || 0), 0);

  const defaultCols: PrintColumn[] = [
    { key: 'slNo', label: 'ক্র.নং', getValue: c => toBengaliNumber(c.slNo) },
    { key: 'companyName', label: 'প্রতিষ্ঠানের নাম', getValue: c => c.companyName },
    { key: 'circle', label: 'সার্কেল', getValue: c => toBengaliNumber(String(c.circle || '').replace(/[^0-9০-৯]/g, '')) || '১' },
    { key: 'caseNo', label: 'মামলা নং ও সাল', getValue: c => `${c.caseNo || '—'} (${toBengaliNumber(c.caseYear)})` },
    { key: 'court', label: 'আদালত', getValue: c => c.court },
    { key: 'amountCrore', label: 'বকেয়া (কোটি টাকা)', getValue: c => formatCrore(c.amountCrore) },
    { key: 'amountTaka', label: 'বকেয়া (টাকা)', getValue: c => (c.amountTaka > 0 ? formatTaka(c.amountTaka) : '—') },
    { key: 'latestStatus', label: 'সর্বশেষ পরিস্থিতি', getValue: c => c.latestStatus || '—' },
    { key: 'remarks', label: 'মন্তব্য', getValue: c => c.remarks || '—' }
  ];

  const cols = options?.columns && options.columns.length > 0 ? options.columns : defaultCols;

  const tableHeaders = cols.map(c => `<th style="padding: 7px 5px; font-weight: bold; border: 1px solid #475569; background-color: #f1f5f9; text-align: center; font-size: 11px;">${c.label}</th>`).join('');

  const tableRows = cases.map((c, idx) => {
    const cells = cols.map(col => {
      const val = col.getValue(c);
      const isNum = col.key === 'slNo' || col.key === 'circle' || col.key === 'amountCrore' || col.key === 'amountTaka';
      const isRight = col.key === 'amountCrore' || col.key === 'amountTaka';
      const isCenter = col.key === 'slNo' || col.key === 'circle' || col.key === 'caseYear';
      const align = isRight ? 'right' : (isCenter ? 'center' : 'left');

      return `<td style="padding: 6px 5px; border: 1px solid #64748b; text-align: ${align}; font-size: 11px; vertical-align: top; ${isNum ? "font-family: 'NikoshBAN', 'Nikosh', 'Noto Sans Bengali', sans-serif;" : ''}">${val ?? '—'}</td>`;
    }).join('');

    const bg = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
    return `<tr style="background-color: ${bg};">${cells}</tr>`;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @font-face {
      font-family: 'NikoshBAN';
      src: local('NikoshBAN'), local('Nikosh BAN'), local('Nikosh'),
           url('https://cdn.jsdelivr.net/gh/hmoazzem/bangla-fonts@master/NikoshBAN.ttf') format('truetype');
      font-weight: 400 700;
    }
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'NikoshBAN', 'Nikosh', 'SolaimanLipi', 'Noto Sans Bengali', sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.4;
    }
    .header {
      text-align: center;
      margin-bottom: 12px;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
    }
    .gov-title {
      font-size: 16px;
      font-weight: bold;
      color: #000000;
      margin: 0;
    }
    .sub-title {
      font-size: 14px;
      font-weight: bold;
      color: #1e293b;
      margin: 3px 0;
    }
    .doc-title {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin: 2px 0;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #334155;
      margin-top: 6px;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    th, td {
      border: 1px solid #475569;
    }
    .total-row {
      background-color: #e2e8f0 !important;
      font-weight: bold;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 45px;
      padding-top: 10px;
      page-break-inside: avoid;
    }
    .sig-box {
      text-align: center;
      width: 28%;
      border-top: 1px dashed #64748b;
      padding-top: 5px;
      font-size: 11px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="gov-title">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
    <div class="sub-title">${subtitle}</div>
    <div class="doc-title">${title}</div>
    <div class="meta-bar">
      <span>প্রতিবেদনের তারিখ: ${printDate}</span>
      <span>মোট মামলা: ${toBengaliNumber(cases.length)} টি</span>
      <span>মোট রাজস্ব বকেয়া: <strong>${formatCrore(totalCrore)}</strong> (টাকা: ${formatTaka(totalTaka)})</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>${tableHeaders}</tr>
    </thead>
    <tbody>
      ${tableRows}
      <tr class="total-row">
        <td colspan="5" style="padding: 7px; text-align: right; font-weight: bold; font-size: 11px;">সর্বমোট বকেয়ার পরিমাণ:</td>
        <td style="padding: 7px 5px; text-align: right; font-weight: bold; font-size: 11px; color: #1e3a8a;">${formatCrore(totalCrore)}</td>
        <td style="padding: 7px 5px; text-align: right; font-weight: bold; font-size: 11px;">${formatTaka(totalTaka)}</td>
        <td colspan="${Math.max(cols.length - 7, 1)}" style="padding: 7px 5px; font-size: 10px; color: #475569;">${toBengaliNumber(cases.length)} টি মামলার সমন্বিত ফলাফল</td>
      </tr>
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-box">
      প্রস্তুতকারীর স্বাক্ষর<br>
      <span style="font-weight: normal; font-size: 10px; color: #64748b;">উচ্চমান সহকারী / ডাটা এন্ট্রি অপারেটর</span>
    </div>
    <div class="sig-box">
      যাচাইকারীর স্বাক্ষর<br>
      <span style="font-weight: normal; font-size: 10px; color: #64748b;">রাজস্ব কর্মকর্তা / পরিদর্শক</span>
    </div>
    <div class="sig-box">
      দায়িত্বপ্রাপ্ত কর্মকর্তা<br>
      <span style="font-weight: normal; font-size: 10px; color: #64748b;">সহকারী / উপ-কমিশনার</span>
    </div>
  </div>
</body>
</html>
  `;

  printHtmlContent(html);
}

/**
 * Generates and prints an official single-case dossier sheet
 */
export function printSingleCase(c: CaseRecord) {
  const printDate = new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const pureCircle = String(c.circle || '').replace(/[^0-9০-৯]/g, '') || '১';

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>মামলা বিবরণী - ${c.companyName} (${c.caseNo})</title>
  <style>
    @font-face {
      font-family: 'NikoshBAN';
      src: local('NikoshBAN'), local('Nikosh BAN'), local('Nikosh'),
           url('https://cdn.jsdelivr.net/gh/hmoazzem/bangla-fonts@master/NikoshBAN.ttf') format('truetype');
      font-weight: 400 700;
    }
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'NikoshBAN', 'Nikosh', 'SolaimanLipi', 'Noto Sans Bengali', sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
    }
    .gov-title {
      font-size: 17px;
      font-weight: bold;
      color: #000000;
      margin: 0;
    }
    .sub-title {
      font-size: 14px;
      font-weight: bold;
      color: #1e293b;
      margin: 3px 0;
    }
    .doc-title {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin: 2px 0;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #334155;
      margin-top: 8px;
    }
    .section-title {
      font-size: 13px;
      font-weight: bold;
      background: #f1f5f9;
      padding: 6px 10px;
      border-left: 4px solid #1e40af;
      margin: 14px 0 8px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    th, td {
      border: 1px solid #94a3b8;
      padding: 8px 10px;
      font-size: 12px;
    }
    th {
      width: 25%;
      background-color: #f8fafc;
      font-weight: bold;
      text-align: left;
    }
    .highlight-card {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      margin-top: 8px;
    }
    .revenue-amount {
      font-size: 18px;
      font-weight: bold;
      color: #1e3a8a;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
      padding-top: 10px;
      page-break-inside: avoid;
    }
    .sig-box {
      text-align: center;
      width: 28%;
      border-top: 1px dashed #64748b;
      padding-top: 5px;
      font-size: 11px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="gov-title">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
    <div class="sub-title">কাস্টমস, এক্সাইজ ও ভ্যাট কমিশনারেট</div>
    <div class="doc-title">বিচারাধীন মামলার একক তথ্য বিবরণী ও রাজস্ব নথি</div>
    <div class="meta-bar">
      <span>মুদ্রণ তারিখ: ${printDate}</span>
      <span>ক্রমিক নং: ${toBengaliNumber(c.slNo)}</span>
      <span>সার্কেল: ${toBengaliNumber(pureCircle)}</span>
    </div>
  </div>

  <div class="section-title">১. প্রতিষ্ঠান ও সাধারণ পরিচিতি</div>
  <table>
    <tr>
      <th>প্রতিষ্ঠানের নাম</th>
      <td><strong>${c.companyName}</strong></td>
    </tr>
    <tr>
      <th>প্রতিষ্ঠানের ঠিকানা</th>
      <td>${c.address || 'তথ্য প্রদান করা হয়নি'}</td>
    </tr>
    <tr>
      <th>সংশ্লিষ্ট সার্কেল</th>
      <td>সার্কেল ${toBengaliNumber(pureCircle)}</td>
    </tr>
  </table>

  <div class="section-title">২. মামলার পরিচিতি ও আদালতের তথ্য</div>
  <table>
    <tr>
      <th>মামলা নং</th>
      <td><strong>${c.caseNo || '—'}</strong></td>
    </tr>
    <tr>
      <th>মামলার সাল</th>
      <td>${toBengaliNumber(c.caseYear)} খ্রি.</td>
    </tr>
    <tr>
      <th>মামলার ধরণ</th>
      <td>${c.caseType}</td>
    </tr>
    <tr>
      <th>আদালত / ট্রাইব্যুনাল</th>
      <td>${c.court}</td>
    </tr>
  </table>

  <div class="section-title">৩. রাজস্ব ও দাবিকৃত বকেয়ার পরিমাণ</div>
  <div class="highlight-card">
    <table style="border: none;">
      <tr style="border: none;">
        <td style="border: none; width: 50%;">
          <div style="font-size: 11px; color: #475569;">বকেয়া (কোটি টাকায়):</div>
          <div class="revenue-amount">${formatCrore(c.amountCrore)}</div>
        </td>
        <td style="border: none; width: 50%;">
          <div style="font-size: 11px; color: #475569;">মূল টাকা (অংকে):</div>
          <div style="font-size: 15px; font-weight: bold; color: #0f172a;">${formatTaka(c.amountTaka)}</div>
        </td>
      </tr>
    </table>
  </div>

  <div class="section-title">৪. মামলার সংক্ষিপ্ত বিবরণ ও আইনি বিষয়বস্তু</div>
  <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background-color: #ffffff; min-height: 50px;">
    ${c.description || 'কোনো বিবরণ প্রদান করা হয়নি।'}
  </div>

  <div class="section-title">৫. সর্বশেষ পরিস্থিতি ও আদালতের আদেশ</div>
  <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background-color: #ffffff; min-height: 50px;">
    <strong>সর্বশেষ স্থিতি:</strong> ${c.latestStatus || 'তথ্য নেই'}<br><br>
    <strong>মন্তব্য:</strong> ${c.remarks || '—'}
  </div>

  <div class="signatures">
    <div class="sig-box">
      প্রস্তুতকারী
    </div>
    <div class="sig-box">
      যাচাইকারী রাজস্ব কর্মকর্তা
    </div>
    <div class="sig-box">
      সহকারী / উপ-কমিশনার
    </div>
  </div>
</body>
</html>
  `;

  printHtmlContent(html);
}

/**
 * Generates and prints the exact official monthly case report shown in government format:
 * "মাননীয় আদালতে বিচারাধীন গুরুত্বপূর্ণ মামলার তথ্য"
 * "কাস্টমস বন্ড কমিশনারেট, ঢাকা (দক্ষিণ), ঢাকা।"
 */
export function printMonthlyCaseReport(
  cases: CaseRecord[],
  options?: {
    title?: string;
    officeName?: string;
    monthYear?: string;
    formatMode?: 'official3Col' | 'fullAudit';
  }
) {
  const title = options?.title || 'মাননীয় আদালতে বিচারাধীন গুরুত্বপূর্ণ মামলার তথ্য';
  const officeName = options?.officeName || 'কাস্টমস বন্ড কমিশনারেট, ঢাকা (দক্ষিণ), ঢাকা।';
  const monthYear = options?.monthYear || '';
  const formatMode = options?.formatMode || 'official3Col';

  let tableContent = '';

  if (formatMode === 'official3Col') {
    const rows = cases.map((c, idx) => {
      const partyAndAddress = `${c.companyName}${c.address ? `, ${c.address}` : ''}`;
      const caseNumberText = c.caseNo ? c.caseNo : `${c.caseType} নং- ${toBengaliNumber(c.caseYear)}`;
      return `
        <tr>
          <td style="padding: 7px 5px; border: 1px solid #000000; text-align: center; vertical-align: top; font-family: 'NikoshBAN', 'Nikosh', 'SolaimanLipi', sans-serif; font-size: 13px;">
            ${toBengaliNumber(idx + 1)}.
          </td>
          <td style="padding: 7px 10px; border: 1px solid #000000; vertical-align: top; line-height: 1.4; font-size: 13px;">
            ${partyAndAddress}
          </td>
          <td style="padding: 7px 10px; border: 1px solid #000000; vertical-align: top; font-family: 'NikoshBAN', 'Nikosh', 'SolaimanLipi', sans-serif; font-size: 13px;">
            ${caseNumberText}
          </td>
        </tr>
      `;
    }).join('');

    tableContent = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #ffffff;">
            <th style="width: 7%; padding: 8px 4px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 13px;">
              ক্র.<br>নং
            </th>
            <th style="width: 58%; padding: 8px 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 13px;">
              পিটিশনার/সরকারের প্রতিপক্ষের নাম ঠিকানা
            </th>
            <th style="width: 35%; padding: 8px 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 13px;">
              মামলা নম্বর
            </th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  } else {
    // 8-Column Format from user's second document (or Full Audit)
    const topCases = [...cases].sort((a, b) => (b.amountCrore || 0) - (a.amountCrore || 0)).slice(0, 3);
    const totalCrore = cases.reduce((sum, c) => sum + (c.amountCrore || 0), 0);
    const totalTaka = cases.reduce((sum, c) => sum + (c.amountTaka || 0), 0);

    const rows = cases.map((c, idx) => {
      const party = `${c.companyName}${c.address ? `, ${c.address}` : ''}`;
      const caseNoText = c.caseNo || `${c.caseType} (${toBengaliNumber(c.caseYear)})`;
      const courtHierarchy = c.courtHierarchy || (c.court.includes('সুপ্রিম') ? c.court : `মাননীয় সুপ্রিম কোর্টের ${c.court} বিভাগ`);
      const originPeriod = c.originPeriod || `${toBengaliNumber(c.caseYear)} সাল`;
      const croreText = (c.amountCrore || 0).toFixed(2).replace(/\.00$/, '');
      const croreBn = toBengaliNumber(croreText);

      return `
        <tr>
          <td style="padding: 7px 4px; border: 1px solid #000000; text-align: center; vertical-align: top; font-family: 'NikoshBAN', sans-serif;">
            ${toBengaliNumber(idx + 1)}.
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000000; vertical-align: top; line-height: 1.4;">
            ${party}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000000; vertical-align: top; font-family: 'NikoshBAN', sans-serif;">
            ${caseNoText}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000000; vertical-align: top; font-size: 11px; line-height: 1.4;">
            ${c.description || 'বন্ড সুবিধায় আমদানিকৃত কাঁচামাল সংক্রান্ত'}
          </td>
          <td style="padding: 7px 6px; border: 1px solid #000000; text-align: right; vertical-align: top; font-weight: bold; font-family: 'NikoshBAN', sans-serif;">
            ${croreBn}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000000; vertical-align: top; font-size: 11px;">
            ${courtHierarchy}
          </td>
          <td style="padding: 7px 4px; border: 1px solid #000000; text-align: center; vertical-align: top; font-family: 'NikoshBAN', sans-serif;">
            ${originPeriod}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000000; vertical-align: top; font-size: 11px; line-height: 1.4;">
            ${c.latestStatus || 'শুনানি প্রক্রিয়াধীন'}
          </td>
        </tr>
      `;
    }).join('');

    const footnotes = topCases.map(c => 
      `<div style="font-weight: bold; font-size: 12px; margin-top: 6px;">***** ${c.companyName} প্রতিষ্ঠানের বিরুদ্ধে মামলায় জড়িত রাজস্বের পরিমাণ ${formatCrore(c.amountCrore)}।</div>`
    ).join('');

    tableContent = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #ffffff;">
            <th style="width: 5%; padding: 6px 3px; border: 1px solid #000000; text-align: center; font-size: 11px;">ক্র. নং</th>
            <th style="width: 20%; padding: 6px 6px; border: 1px solid #000000; text-align: center; font-size: 11px;">পিটিশনার/সরকারের প্রতিপক্ষের নাম ঠিকানা</th>
            <th style="width: 13%; padding: 6px 6px; border: 1px solid #000000; text-align: center; font-size: 11px;">মামলা নম্বর</th>
            <th style="width: 22%; padding: 6px 6px; border: 1px solid #000000; text-align: center; font-size: 11px;">মামলার বিষয়বস্তু ও বকেয়ার উদ্ভবের কারণ</th>
            <th style="width: 9%; padding: 6px 4px; border: 1px solid #000000; text-align: center; font-size: 11px;">বকেয়ার পরিমাণ (কোটি টাকা)</th>
            <th style="width: 13%; padding: 6px 6px; border: 1px solid #000000; text-align: center; font-size: 10px;">কোন আদালতে মামলাধীন রয়েছে(আপীল কমিশনারেট/আপীলাত ট্রাইব্যুনাল/হাইকোর্ট/আপীল বিভাগ মাননীয় সুপ্রিম কোর্ট)</th>
            <th style="width: 6%; padding: 6px 3px; border: 1px solid #000000; text-align: center; font-size: 11px;">সংশ্লিষ্ট বকেয়া উদ্ভবের সময়কাল</th>
            <th style="width: 12%; padding: 6px 6px; border: 1px solid #000000; text-align: center; font-size: 11px;">সর্বশেষ পরিস্থিতি</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="4" style="padding: 7px; border: 1px solid #000000; text-align: right;">সর্বমোট বকেয়ার পরিমাণ:</td>
            <td style="padding: 7px 6px; border: 1px solid #000000; text-align: right; font-family: 'NikoshBAN', sans-serif;">${formatCrore(totalCrore)}</td>
            <td colspan="3" style="padding: 7px; border: 1px solid #000000; font-size: 11px; color: #475569;">টাকা: ${formatTaka(totalTaka)} (মোট ${toBengaliNumber(cases.length)} টি মামলা)</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 18px; margin-bottom: 8px;">
        ${footnotes}
      </div>
    `;
  }

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${title} - ${officeName}</title>
  <style>
    @font-face {
      font-family: 'NikoshBAN';
      src: local('NikoshBAN'), local('Nikosh BAN'), local('Nikosh'),
           url('https://cdn.jsdelivr.net/gh/hmoazzem/bangla-fonts@master/NikoshBAN.ttf') format('truetype');
      font-weight: 400 700;
    }
    @page {
      size: A4 landscape;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'NikoshBAN', 'Nikosh', 'SolaimanLipi', 'Noto Sans Bengali', sans-serif;
      margin: 0;
      padding: 0;
      color: #000000;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.4;
    }
    .report-header {
      text-align: center;
      margin-bottom: 14px;
    }
    .report-title {
      font-size: 18px;
      font-weight: bold;
      color: #000000;
      margin: 0 0 4px 0;
      text-decoration: none;
    }
    .report-office {
      font-size: 15px;
      font-weight: bold;
      color: #000000;
      margin: 0 0 4px 0;
    }
    .report-meta {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #000000;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 45px;
      padding-top: 10px;
      page-break-inside: avoid;
    }
    .sig-box {
      text-align: center;
      width: 30%;
      border-top: 1px dashed #475569;
      padding-top: 6px;
      font-size: 11px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="report-title">${title}</div>
    <div class="report-office">${officeName}</div>
    ${monthYear ? `<div class="report-meta">মাসের নাম / তারিখ: ${monthYear}</div>` : ''}
  </div>

  ${tableContent}

  <div class="signatures">
    <div class="sig-box">
      প্রস্তুতকারীর স্বাক্ষর<br>
      <span style="font-weight: normal; font-size: 10px; color: #475569;">উচ্চমান সহকারী / পরিদর্শক</span>
    </div>
    <div class="sig-box">
      যাচাইকারীর স্বাক্ষর<br>
      <span style="font-weight: normal; font-size: 10px; color: #475569;">রাজস্ব কর্মকর্তা / সুপারিনটেনডেন্ট</span>
    </div>
    <div class="sig-box">
      দায়িত্বপ্রাপ্ত কর্মকর্তা<br>
      <span style="font-weight: normal; font-size: 10px; color: #475569;">সহকারী / উপ-কমিশনার</span>
    </div>
  </div>
</body>
</html>
  `;

  printHtmlContent(html);
}
