import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber
} from 'docx';
import { CaseRecord } from '../types/case';
import { toBengaliNumber, formatCrore, formatTaka } from './converter';
import JSZip from 'jszip';

class NikoshRun extends TextRun {
  constructor(options: string | Record<string, any>) {
    if (typeof options === 'string') {
      super({
        text: options,
        font: 'NikoshBAN',
        noProof: true,
      });
    } else {
      super({
        font: 'NikoshBAN',
        noProof: true,
        ...options,
      });
    }
  }
}

/**
 * Creates an official Word (.docx) document for Monthly Case Reports
 */
export async function exportMonthlyReportToDocx(
  cases: CaseRecord[],
  options: {
    title: string;
    officeName: string;
    monthYear: string;
    formatMode: 'official3Col' | 'fullAudit8Col';
    fileName?: string;
  }
) {
  const { title, officeName, monthYear, formatMode, fileName } = options;

  const fontName = 'NikoshBAN';

  // Title paragraphs
  const titleParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new NikoshRun({
          text: title,
          bold: true,
          size: 32, // 16pt
          font: fontName,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new NikoshRun({
          text: officeName,
          bold: true,
          size: 26, // 13pt
          font: fontName,
          color: '1E293B',
        }),
      ],
    }),
  ];

  if (monthYear) {
    titleParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new NikoshRun({
            text: `মাসের নাম / সময়কাল: ${monthYear}  |  মোট মামলা: ${toBengaliNumber(cases.length)} টি`,
            bold: true,
            size: 22, // 11pt
            font: fontName,
            color: '334155',
          }),
        ],
      })
    );
  }

  let table: Table;

  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  };

  if (formatMode === 'official3Col') {
    // 3-Column Official Format from user's first document
    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          shading: { fill: 'F1F5F9' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new NikoshRun({ text: 'ক্র. নং', bold: true, size: 22, font: fontName })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 55, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          shading: { fill: 'F1F5F9' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new NikoshRun({ text: 'পিটিশনার/সরকারের প্রতিপক্ষের নাম ঠিকানা', bold: true, size: 22, font: fontName })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          shading: { fill: 'F1F5F9' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new NikoshRun({ text: 'মামলা নম্বর', bold: true, size: 22, font: fontName })],
            }),
          ],
        }),
      ],
    });

    const dataRows = cases.map((c, idx) => {
      const party = `${c.companyName}${c.address ? `, ${c.address}` : ''}`;
      const caseNoText = c.caseNo || `${c.caseType} (${toBengaliNumber(c.caseYear)})`;

      return new TableRow({
        children: [
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new NikoshRun({ text: `${toBengaliNumber(idx + 1)}.`, size: 22, font: fontName })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new NikoshRun({ text: party, size: 22, font: fontName })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new NikoshRun({ text: caseNoText, size: 22, font: fontName })],
              }),
            ],
          }),
        ],
      });
    });

    table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    });
  } else {
    // 8-Column Format from user's second document
    const colDefs = [
      { label: 'ক্র. নং', width: 6 },
      { label: 'পিটিশনার/সরকারের প্রতিপক্ষের নাম ঠিকানা', width: 22 },
      { label: 'মামলা নম্বর', width: 14 },
      { label: 'মামলার বিষয়বস্তু ও বকেয়ার উদ্ভবের কারণ', width: 22 },
      { label: 'বকেয়ার পরিমাণ (কোটি টাকা)', width: 10 },
      { label: 'কোন আদালতে মামলাধীন রয়েছে', width: 13 },
      { label: 'সংশ্লিষ্ট বকেয়া উদ্ভবের সময়কাল', width: 7 },
      { label: 'সর্বশেষ পরিস্থিতি', width: 16 },
    ];

    const headerRow = new TableRow({
      tableHeader: true,
      children: colDefs.map(col =>
        new TableCell({
          width: { size: col.width, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          shading: { fill: 'F8FAFC' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new NikoshRun({ text: col.label, bold: true, size: 18, font: fontName })],
            }),
          ],
        })
      ),
    });

    const dataRows = cases.map((c, idx) => {
      const party = `${c.companyName}${c.address ? `, ${c.address}` : ''}`;
      const caseNoText = c.caseNo || `${c.caseType} (${toBengaliNumber(c.caseYear)})`;
      const courtHierarchy = c.courtHierarchy || (c.court.includes('সুপ্রিম') ? c.court : `মাননীয় সুপ্রিম কোর্টের ${c.court} বিভাগ`);
      const originPeriod = c.originPeriod || `${toBengaliNumber(c.caseYear)} সাল`;
      const croreText = (c.amountCrore || 0).toFixed(2).replace(/\.00$/, '');
      const croreBn = toBengaliNumber(croreText);

      return new TableRow({
        children: [
          new TableCell({
            width: { size: 6, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new NikoshRun({ text: `${toBengaliNumber(idx + 1)}.`, size: 18, font: fontName })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new NikoshRun({ text: party, size: 18, font: fontName })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 14, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new NikoshRun({ text: caseNoText, size: 18, font: fontName })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new NikoshRun({ text: c.description || 'বন্ড সুবিধায় আমদানিকৃত কাঁচামাল সংক্রান্ত', size: 18, font: fontName })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new NikoshRun({ text: croreBn, bold: true, size: 18, font: fontName })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 13, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new NikoshRun({ text: courtHierarchy, size: 18, font: fontName })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 7, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new NikoshRun({ text: originPeriod, size: 18, font: fontName })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 16, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new NikoshRun({ text: c.latestStatus || 'শুনানি প্রক্রিয়াধীন', size: 18, font: fontName })],
              }),
            ],
          }),
        ],
      });
    });

    table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    });
  }

  // Highlights/Footnotes at the bottom (like in user's image 2)
  const footnoteParagraphs: Paragraph[] = [];
  const topCases = [...cases].sort((a, b) => (b.amountCrore || 0) - (a.amountCrore || 0)).slice(0, 3);

  footnoteParagraphs.push(new Paragraph({ spacing: { before: 200 } }));
  topCases.forEach(c => {
    footnoteParagraphs.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new NikoshRun({
            text: `***** ${c.companyName} প্রতিষ্ঠানের বিরুদ্ধে মামলায় জড়িত রাজস্বের পরিমাণ ${formatCrore(c.amountCrore)}।`,
            bold: true,
            size: 20,
            font: fontName,
            noProof: true,
          }),
        ],
      })
    );
  });

  // Signature Block
  const sigRow = new TableRow({
    children: [
      new TableCell({
        borders: {
          top: { style: BorderStyle.DASHED, size: 6, color: '64748B' },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new NikoshRun({ text: 'প্রস্তুতকারীর স্বাক্ষর\n', bold: true, size: 20, font: fontName }),
              new NikoshRun({ text: 'উচ্চমান সহকারী / পরিদর্শক', size: 16, color: '64748B', font: fontName }),
            ],
          }),
        ],
      }),
      new TableCell({
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [new Paragraph({})],
      }),
      new TableCell({
        borders: {
          top: { style: BorderStyle.DASHED, size: 6, color: '64748B' },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new NikoshRun({ text: 'যাচাইকারীর স্বাক্ষর\n', bold: true, size: 20, font: fontName }),
              new NikoshRun({ text: 'রাজস্ব কর্মকর্তা / সুপারিনটেনডেন্ট', size: 16, color: '64748B', font: fontName }),
            ],
          }),
        ],
      }),
      new TableCell({
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [new Paragraph({})],
      }),
      new TableCell({
        borders: {
          top: { style: BorderStyle.DASHED, size: 6, color: '64748B' },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new NikoshRun({ text: 'দায়িত্বপ্রাপ্ত কর্মকর্তা\n', bold: true, size: 20, font: fontName }),
              new NikoshRun({ text: 'সহকারী / উপ-কমিশনার', size: 16, color: '64748B', font: fontName }),
            ],
          }),
        ],
      }),
    ],
  });

  const sigTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [sigRow],
  });

  // Construct Document in Landscape orientation
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: fontName,
            noProof: true,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: 'landscape',
            },
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          ...titleParagraphs,
          table,
          ...footnoteParagraphs,
          new Paragraph({ spacing: { before: 400 } }),
          sigTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const outName = fileName || `মাসিক_মামলার_তথ্য_${monthYear || 'প্রতিবেদন'}.docx`;
  downloadBlob(blob, outName);
}

/**
 * Creates an official Word (.docx) document for Monthly Dynamics Return (নতুন মামলা, নিষ্পত্তিকৃত মামলা ও জড়িত রাজস্ব)
 */
export async function exportMonthlyMovementReturnDocx(
  data: {
    monthYear: string;
    officeName: string;
    openingPendingCount: number;
    newCases: CaseRecord[];
    disposedCases: CaseRecord[];
    currentPendingCount: number;
    totalRevenueAtStakeCrore: number;
    recoveredRevenueCrore: number;
  }
) {
  const fontName = 'NikoshBAN';

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: fontName,
            noProof: true,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: 'landscape' },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new NikoshRun({
                text: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার',
                bold: true,
                size: 30,
                font: fontName,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new NikoshRun({
                text: data.officeName,
                bold: true,
                size: 26,
                font: fontName,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new NikoshRun({
                text: `চলতি মাসের মামলা প্রবাহ, জড়িত রাজস্ব ও নিষ্পত্তিকৃত মামলার মাসিক বিবরণী (${data.monthYear})`,
                bold: true,
                size: 24,
                font: fontName,
                color: '1E3A8A',
              }),
            ],
          }),

          // Summary KPI Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createSummaryCell('মাসের শুরুতে চলমান মামলা', `${toBengaliNumber(data.openingPendingCount)} টি`, fontName, 'F8FAFC'),
                  createSummaryCell('চলতি মাসে নতুন মামলা (+)', `${toBengaliNumber(data.newCases.length)} টি`, fontName, 'EFF6FF'),
                  createSummaryCell('চলতি মাসে নিষ্পত্তিকৃত মামলা (-)', `${toBengaliNumber(data.disposedCases.length)} টি`, fontName, 'ECFDF5'),
                  createSummaryCell('বর্তমানে মোট চলমান মামলা (=)', `${toBengaliNumber(data.currentPendingCount)} টি`, fontName, 'FEF3C7'),
                ],
              }),
              new TableRow({
                children: [
                  createSummaryCell('মামলায় মোট জড়িত রাজস্ব', `${formatCrore(data.totalRevenueAtStakeCrore)}`, fontName, 'F1F5F9'),
                  createSummaryCell('নতুন মামলায় জড়িত রাজস্ব', `${formatCrore(data.newCases.reduce((s, c) => s + c.amountCrore, 0))}`, fontName, 'EFF6FF'),
                  createSummaryCell('সরকারের অনুকূলে আদায়কৃত রাজস্ব', `${formatCrore(data.recoveredRevenueCrore)}`, fontName, 'ECFDF5'),
                  createSummaryCell('নিষ্পত্তির সার্বিক স্থিতি', 'নিয়মিত ট্র্যাকিংাধীন', fontName, 'FEF3C7'),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 250, after: 100 }, children: [new NikoshRun({ text: '১. চলতি মাসে দায়েরকৃত নতুন মামলাসমূহ:', bold: true, size: 22, font: fontName })] }),
          createCasesDocxTable(data.newCases, fontName, 'নতুন'),

          new Paragraph({ spacing: { before: 250, after: 100 }, children: [new NikoshRun({ text: '২. চলতি মাসে নিষ্পত্তিকৃত মামলাসমূহ ও সরকারের অর্জিত রাজস্ব:', bold: true, size: 22, font: fontName })] }),
          createCasesDocxTable(data.disposedCases, fontName, 'নিষ্পত্তি'),

          new Paragraph({ spacing: { before: 300 } }),
        ],
      },
    ],
  });

  await saveCleanDocx(doc, `মাসিক_মামলা_প্রবাহ_রিটার্ন_${data.monthYear}.docx`);
}

function createSummaryCell(title: string, value: string, fontName: string, fillColor: string): TableCell {
  return new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
      left: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
      right: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
    },
    shading: { fill: fillColor },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new NikoshRun({ text: title, size: 16, color: '475569', font: fontName })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40 },
        children: [new NikoshRun({ text: value, bold: true, size: 22, color: '0F172A', font: fontName })],
      }),
    ],
  });
}

function createCasesDocxTable(cases: CaseRecord[], fontName: string, type: 'নতুন' | 'নিষ্পত্তি'): Table {
  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, borders: tableBorders, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new NikoshRun({ text: 'ক্র.নং', bold: true, size: 18, font: fontName })] })] }),
      new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: tableBorders, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new NikoshRun({ text: 'প্রতিষ্ঠানের নাম ও ঠিকানা', bold: true, size: 18, font: fontName })] })] }),
      new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, borders: tableBorders, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new NikoshRun({ text: 'মামলা নম্বর ও সাল', bold: true, size: 18, font: fontName })] })] }),
      new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, borders: tableBorders, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new NikoshRun({ text: 'আদালত', bold: true, size: 18, font: fontName })] })] }),
      new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, borders: tableBorders, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new NikoshRun({ text: 'জড়িত রাজস্ব (কোটি)', bold: true, size: 18, font: fontName })] })] }),
      new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, borders: tableBorders, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new NikoshRun({ text: type === 'নতুন' ? 'দায়েরের বিবরণ' : 'নিষ্পত্তির ফলাফল / আদেশ', bold: true, size: 18, font: fontName })] })] }),
    ],
  });

  if (cases.length === 0) {
    const emptyRow = new TableRow({
      children: [
        new TableCell({
          columnSpan: 6,
          borders: tableBorders,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new NikoshRun({ text: `চলতি মাসে কোনো ${type} মামলা নেই।`, size: 18, color: '64748B', font: fontName })],
            }),
          ],
        }),
      ],
    });
    return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, emptyRow] });
  }

  const rows = cases.map((c, idx) => {
    return new TableRow({
      children: [
        new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, borders: tableBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new NikoshRun({ text: `${toBengaliNumber(idx + 1)}.`, size: 18, font: fontName })] })] }),
        new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: tableBorders, children: [new Paragraph({ children: [new NikoshRun({ text: `${c.companyName}${c.address ? `, ${c.address}` : ''}`, size: 18, font: fontName })] })] }),
        new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, borders: tableBorders, children: [new Paragraph({ children: [new NikoshRun({ text: c.caseNo || `${c.caseType} (${toBengaliNumber(c.caseYear)})`, size: 18, font: fontName })] })] }),
        new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, borders: tableBorders, children: [new Paragraph({ children: [new NikoshRun({ text: c.court, size: 18, font: fontName })] })] }),
        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, borders: tableBorders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new NikoshRun({ text: formatCrore(c.amountCrore), bold: true, size: 18, font: fontName })] })] }),
        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, borders: tableBorders, children: [new Paragraph({ children: [new NikoshRun({ text: type === 'নতুন' ? (c.latestStatus || 'নতুন দায়েরকৃত') : (c.disposalOutcome || c.latestStatus || 'সরকারের অনুকূলে নিষ্পত্তি'), size: 18, font: fontName })] })] }),
      ],
    });
  });

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...rows] });
}

async function saveCleanDocx(doc: Document, filename: string) {
  const rawBlob = await Packer.toBlob(doc);
  try {
    const arrayBuffer = await rawBlob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 1. Inject hideSpellingErrors, hideGrammaticalErrors, clean proofState in settings.xml
    let settingsXml = await zip.file('word/settings.xml')?.async('string');
    if (settingsXml) {
      const settingsTagIndex = settingsXml.indexOf('<w:settings');
      if (settingsTagIndex !== -1) {
        const closeIndex = settingsXml.indexOf('>', settingsTagIndex);
        if (closeIndex !== -1) {
          settingsXml =
            settingsXml.slice(0, closeIndex + 1) +
            '<w:hideSpellingErrors/><w:hideGrammaticalErrors/><w:proofState w:spelling="clean" w:grammar="clean"/>' +
            settingsXml.slice(closeIndex + 1);
          zip.file('word/settings.xml', settingsXml);
        }
      }
    }

    // 2. Ensure styles.xml has noProof
    let stylesXml = await zip.file('word/styles.xml')?.async('string');
    if (stylesXml) {
      if (!stylesXml.includes('<w:noProof/>')) {
        stylesXml = stylesXml.replace(
          '<w:rPr>',
          '<w:rPr><w:noProof/>'
        );
        zip.file('word/styles.xml', stylesXml);
      }
    }

    // 3. Remove any proofErr or spellErr tags from document.xml
    let docXml = await zip.file('word/document.xml')?.async('string');
    if (docXml) {
      docXml = docXml.replace(/<w:proofErr[^>]*\/>/g, '');
      zip.file('word/document.xml', docXml);
    }

    const cleanBlob = await zip.generateAsync({
      type: 'blob',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    downloadBlob(cleanBlob, filename);
  } catch (err) {
    console.warn('Docx clean post-processing warning:', err);
    downloadBlob(rawBlob, filename);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
