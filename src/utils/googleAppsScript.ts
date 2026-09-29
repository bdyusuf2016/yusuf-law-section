import { CaseRecord } from '../types/case';

/**
 * Generates ready-to-run Google Apps Script (Code.gs) for Google Sheets
 */
export function generateGoogleAppsScript(cases: CaseRecord[]): string {
  const jsonSample = JSON.stringify(cases.slice(0, 10), null, 2);

  return `/**
 * =========================================================================
 * প্রতিষ্ঠান ভিত্তিক মামলা ও রাজস্ব ব্যবস্থাপনা সিস্টেম (Google Apps Script)
 * =========================================================================
 * বৈশিষ্ট্যসমূহ:
 * ১. স্প্রেডশীটে স্বয়ংক্রিয় ডাটা ফরম্যাটিং এবং কোটি টাকায় রূপান্তর
 * ২. কাস্টম মেনু '⚖️ মামলা ব্যবস্থাপনা'
 * ৩. নতুন মামলা যুক্ত করার ইউজার ফর্ম (HTML Dialog)
 * ৪. ওয়েব ড্যাশবোর্ডের সাথে দুইমুখী সিঙ্ক (doGet ও doPost Webhook)
 * ৫. বকেয়ার পরিমাণ স্বয়ংক্রিয়ভাবে কোটি টাকায় রূপান্তরের কাস্টম ফাংশন
 */

const SHEET_NAME = 'মামলা_ডাটাবেস';
const SUMMARY_SHEET_NAME = 'মামলা_সামারি_ড্যাশবোর্ড';

/**
 * স্প্রেডশীট ওপেন হলে কাস্টম মেনু যুক্ত করে
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚖️ মামলা ব্যবস্থাপনা')
    .addItem('📥 নতুন মামলা এন্ট্রি ফর্ম', 'showAddCaseDialog')
    .addItem('📊 স্প্রেডশীট প্রস্তুত / ডাটা সিঙ্ক করুন', 'initializeCaseSheet')
    .addItem('🧮 বকেয়া কোটি টাকায় পুনরায় রূপান্তর', 'recalculateCrores')
    .addItem('📈 সামারি ড্যাশবোর্ড ও রিপোর্ট তৈরি', 'generateSummaryDashboard')
    .addSeparator()
    .addItem('⚙️ ওয়েব অ্যাপ API তথ্য ও গাইড', 'showApiInstructions')
    .addToUi();
}

/**
 * কাস্টম ফাংশন: টাকা থেকে কোটিতে রূপান্তর
 * ব্যবহার: =CONVERT_TO_CRORE(H2)
 * @customfunction
 */
function CONVERT_TO_CRORE(taka) {
  if (!taka || isNaN(taka)) return 0;
  return Number((taka / 10000000).toFixed(4));
}

/**
 * কাস্টম ফাংশন: ইংরেজি সংখ্যাকে বাংলায় রূপান্তর
 * @customfunction
 */
function TO_BANGLA_NUM(num) {
  if (num === null || num === undefined) return '';
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(num).replace(/[0-9]/g, function(d) {
    return bn[d];
  });
}

/**
 * প্রাথমিক শিট তৈরি ও ফরম্যাটিং
 */
function initializeCaseSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // হেডার কলামসমূহ
  const headers = [
    'ক্র.নং',
    'প্রতিষ্ঠানের নাম',
    'ঠিকানা',
    'সার্কেল',
    'মামলার ধরণ',
    'মামলার সাল',
    'মামলা নং',
    'বকেয়ার পরিমাণ (টাকা)',
    'বকেয়ার পরিমাণ (কোটি টাকা)',
    'কোন আদালতে মামলাধীন রয়েছে',
    'মামলার সংক্ষিপ্ত বিবরণ',
    'মামলার সর্বশেষ পরিস্থিতি',
    'মন্তব্য',
    'সুপ্রিম কোর্ট অনলাইন লিংক'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // হেডার স্টাইলিং
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1e293b')
             .setFontColor('#ffffff')
             .setFontWeight('bold')
             .setHorizontalAlignment('center')
             .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);
  
  // কলাম উইডথ অ্যাডজাস্ট
  sheet.setColumnWidth(1, 70);   // ক্র.নং
  sheet.setColumnWidth(2, 230);  // প্রতিষ্ঠানের নাম
  sheet.setColumnWidth(3, 110);  // ঠিকানা
  sheet.setColumnWidth(4, 90);   // সার্কেল
  sheet.setColumnWidth(5, 110);  // মামলার ধরণ
  sheet.setColumnWidth(6, 90);   // সাল
  sheet.setColumnWidth(7, 180);  // মামলা নং
  sheet.setColumnWidth(8, 160);  // টাকা
  sheet.setColumnWidth(9, 160);  // কোটি টাকা
  sheet.setColumnWidth(10, 150); // আদালত
  sheet.setColumnWidth(11, 260); // বিবরণ
  sheet.setColumnWidth(12, 260); // পরিস্থিতি
  sheet.setColumnWidth(13, 200); // মন্তব্য
  sheet.setColumnWidth(14, 220); // লিংক
  
  sheet.setFrozenRows(1);
  SpreadsheetApp.getUi().alert('সাফল্য', 'মামলা_ডাটাবেস শিট সফলভাবে প্রস্তুত করা হয়েছে!', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * সকল সারির কোটি টাকার কলাম পুনরায় ফর্মুলা দিয়ে আপডেট করা
 */
function recalculateCrores() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert('প্রথমে শিট প্রস্তুত করুন!');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  
  for (let r = 2; r <= lastRow; r++) {
    sheet.getRange(r, 9).setFormula('=IF(ISBLANK(H' + r + '), 0, ROUND(H' + r + ' / 10000000, 4))');
  }
  
  sheet.getRange(2, 8, lastRow - 1, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 9, lastRow - 1, 1).setNumberFormat('#,##0.00" কোটি"');
  
  SpreadsheetApp.getUi().alert('সম্পন্ন', 'সকল বকেয়া সফলভাবে কোটি টাকায় রূপান্তর ও ফরম্যাট করা হয়েছে।', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * নতুন মামলা যোগ করার পপআপ ডায়ালগ
 */
function showAddCaseDialog() {
  const html = HtmlService.createHtmlOutput(\`
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Hind Siliguri', sans-serif; padding: 15px; background: #f8fafc; color: #1e293b; }
          .form-group { margin-bottom: 12px; }
          label { display: block; font-weight: 600; font-size: 13px; margin-bottom: 4px; }
          input, select, textarea { width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-family: inherit; }
          input:focus, select:focus, textarea:focus { border-color: #0284c7; outline: none; }
          .row { display: flex; gap: 10px; }
          .col { flex: 1; }
          .crore-box { background: #e0f2fe; padding: 8px 12px; border-radius: 6px; font-weight: 600; color: #0369a1; font-size: 14px; margin-top: 5px; }
          .btn { background: #0284c7; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; width: 100%; }
          .btn:hover { background: #0369a1; }
        </style>
      </head>
      <body>
        <h3>⚖️ নতুন মামলার তথ্য এন্ট্রি</h3>
        <div class="row">
          <div class="col form-group">
            <label>ক্র.নং</label>
            <input type="text" id="slNo" placeholder="যেমন: ৩৫০">
          </div>
          <div class="col form-group">
            <label>মামলার সাল</label>
            <input type="text" id="caseYear" value="২০২৬">
          </div>
        </div>
        <div class="form-group">
          <label>প্রতিষ্ঠানের নাম *</label>
          <input type="text" id="companyName" required placeholder="প্রতিষ্ঠানের পূর্ণ নাম">
        </div>
        <div class="row">
          <div class="col form-group">
            <label>মামলার ধরণ</label>
            <select id="caseType">
              <option value="রীট পিটিশন">রীট পিটিশন</option>
              <option value="কাস্টমস আপীল">কাস্টমস আপীল</option>
              <option value="সিভিল পিটিশন (সিপি)">সিভিল পিটিশন (সিপি)</option>
              <option value="টাইটেল স্যুট">টাইটেল স্যুট</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>
          <div class="col form-group">
            <label>কোন আদালতে মামলাধীন</label>
            <select id="court">
              <option value="কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল">কাস্টমস, এক্সাইজ ও মূসক আপিলাত ট্রাইব্যুনাল</option>
              <option value="হাইকোর্ট">হাইকোর্ট</option>
              <option value="সুপ্রিম কোর্ট (আপীল বিভাগ)">সুপ্রিম কোর্ট (আপীল বিভাগ)</option>
              <option value="আপীল ট্রাইব্যুনাল">আপীল ট্রাইব্যুনাল</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>মামলা নং *</label>
          <input type="text" id="caseNo" placeholder="যেমন: রীট পিটিশন নং-১২৩৪/২০২৬">
        </div>
        <div class="form-group">
          <label>বকেয়ার পরিমাণ (টাকা) *</label>
          <input type="number" id="amountTaka" placeholder="যেমন: 50000000" oninput="calcCrore()">
          <div id="crorePreview" class="crore-box">বকেয়ার পরিমাণ: ০.০০ কোটি টাকা</div>
        </div>
        <div class="form-group">
          <label>মামলার সংক্ষিপ্ত বিবরণ</label>
          <textarea id="description" rows="2" placeholder="বন্ড সুবিধায় আমদানিকৃত কাঁচামাল..."></textarea>
        </div>
        <div class="form-group">
          <label>সর্বশেষ পরিস্থিতি ও শুনানি</label>
          <textarea id="latestStatus" rows="2" placeholder="গত শুনানির তারিখ ও বর্তমান পরিস্থিতি..."></textarea>
        </div>
        <button class="btn" onclick="saveCase()">স্প্রেডশীটে সংরক্ষণ করুন</button>

        <script>
          function calcCrore() {
            var taka = parseFloat(document.getElementById('amountTaka').value) || 0;
            var crore = (taka / 10000000).toFixed(4);
            document.getElementById('crorePreview').innerText = 'বকেয়ার পরিমাণ: ' + crore + ' কোটি টাকা';
          }

          function saveCase() {
            var data = {
              slNo: document.getElementById('slNo').value,
              companyName: document.getElementById('companyName').value,
              address: '',
              circle: '',
              caseType: document.getElementById('caseType').value,
              caseYear: document.getElementById('caseYear').value,
              caseNo: document.getElementById('caseNo').value,
              amountTaka: parseFloat(document.getElementById('amountTaka').value) || 0,
              court: document.getElementById('court').value,
              description: document.getElementById('description').value,
              latestStatus: document.getElementById('latestStatus').value,
              remarks: '',
              supremeCourtUrl: ''
            };
            if (!data.companyName) {
              alert('অনুগ্রহ করে প্রতিষ্ঠানের নাম প্রদান করুন!');
              return;
            }
            google.script.run
              .withSuccessHandler(function() {
                alert('মামলাটি সফলভাবে স্প্রেডশীটে সংরক্ষিত হয়েছে!');
                google.script.host.close();
              })
              .appendCaseRow(data);
          }
        </script>
      </body>
    </html>
  \`).setWidth(460).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'নতুন মামলা এন্ট্রি');
}

/**
 * নতুন সারি শিটে যুক্ত করা
 */
function appendCaseRow(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    initializeCaseSheet();
    sheet = ss.getSheetByName(SHEET_NAME);
  }
  
  const lastRow = sheet.getLastRow();
  const nextRow = lastRow + 1;
  const taka = Number(item.amountTaka) || 0;
  
  const rowData = [
    item.slNo || nextRow - 1,
    item.companyName || '',
    item.address || '',
    item.circle || '',
    item.caseType || 'রীট পিটিশন',
    item.caseYear || '',
    item.caseNo || '',
    taka,
    '=ROUND(H' + nextRow + ' / 10000000, 4)',
    item.court || 'হাইকোর্ট',
    item.description || '',
    item.latestStatus || '',
    item.remarks || '',
    item.supremeCourtUrl || ''
  ];
  
  sheet.appendRow(rowData);
  sheet.getRange(nextRow, 8).setNumberFormat('#,##0');
  sheet.getRange(nextRow, 9).setNumberFormat('#,##0.00" কোটি"');
}

/**
 * সামারি রিপোর্ট তৈরি
 */
function generateSummaryDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName(SHEET_NAME);
  if (!dataSheet) return;
  
  let summarySheet = ss.getSheetByName(SUMMARY_SHEET_NAME);
  if (summarySheet) {
    ss.deleteSheet(summarySheet);
  }
  summarySheet = ss.insertSheet(SUMMARY_SHEET_NAME);
  
  summarySheet.getRange('A1:D1').merge()
    .setValue('📊 প্রতিষ্ঠান ভিত্তিক মামলা ও রাজস্ব সামারি ড্যাশবোর্ড')
    .setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold').setFontSize(14).setHorizontalAlignment('center');
    
  summarySheet.getRange('A3').setValue('মোট মামলার সংখ্যা:');
  summarySheet.getRange('B3').setFormula('=COUNTA(' + SHEET_NAME + '!B2:B)');
  
  summarySheet.getRange('A4').setValue('মোট বকেয়ার পরিমাণ (টাকা):');
  summarySheet.getRange('B4').setFormula('=SUM(' + SHEET_NAME + '!H2:H)');
  summarySheet.getRange('B4').setNumberFormat('#,##0" টাকা"');
  
  summarySheet.getRange('A5').setValue('মোট বকেয়ার পরিমাণ (কোটি টাকা):');
  summarySheet.getRange('B5').setFormula('=B4 / 10000000');
  summarySheet.getRange('B5').setNumberFormat('#,##0.00" কোটি টাকা"').setFontWeight('bold');
  
  SpreadsheetApp.getUi().alert('সামারি ড্যাশবোর্ড প্রস্তুত হয়েছে!');
}

/**
 * ওয়েব অ্যাপ API (doGet): ডাটা JSON হিসেবে প্রদান করে
 */
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  
  const results = rows.map(function(row, idx) {
    return {
      slNo: row[0],
      companyName: row[1],
      address: row[2],
      circle: row[3],
      caseType: row[4],
      caseYear: row[5],
      caseNo: row[6],
      amountTaka: Number(row[7]) || 0,
      amountCrore: Number(row[8]) || (Number(row[7]) / 10000000),
      court: row[9],
      description: row[10],
      latestStatus: row[11],
      remarks: row[12],
      supremeCourtUrl: row[13]
    };
  });
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', total: results.length, data: results }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ওয়েব অ্যাপ API (doPost): নতুন মামলা বা বাল্ক সিঙ্ক গ্রহণ করে
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    if (postData.action === 'add' && postData.case) {
      appendCaseRow(postData.case);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Case added successfully' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid payload' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
}
