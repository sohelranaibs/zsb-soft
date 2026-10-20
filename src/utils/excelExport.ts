import * as XLSX from 'xlsx';
import type { PurchaseRecord, PackingRecord, PaymentRecord, DropdownSettings } from '../types/index.ts';

/**
 * Calculates optimal column widths for Excel/Google Sheets based on content length
 */
function getColWidths(rows: (string | number | null | undefined)[][], minWidth = 12): { wch: number }[] {
  if (rows.length === 0) return [];
  const colCount = Math.max(...rows.map((r) => r.length));
  const widths: number[] = new Array(colCount).fill(minWidth);

  rows.forEach((row) => {
    row.forEach((cell, colIdx) => {
      if (cell !== null && cell !== undefined) {
        const len = String(cell).length;
        if (len + 3 > widths[colIdx]) {
          widths[colIdx] = Math.min(len + 3, 50); // cap max width at 50 for readability
        }
      }
    });
  });

  return widths.map((w) => ({ wch: w }));
}

/**
 * Creates formatted worksheet for Purchases
 */
export function createPurchaseWorksheet(purchases: PurchaseRecord[]): XLSX.WorkSheet {
  const header = [
    'Invoice Number',
    'Date',
    'Description (Lot / Supplier)',
    'Contact Number',
    'Item Summary',
    'Total Quantity',
    'Total Amount (TK)',
    'Previous Balance (TK)',
    'Paid Amount (TK)',
    'Balance Due (TK)',
    'Remarks',
    'Created At',
  ];

  const dataRows: (string | number)[][] = purchases.map((p) => {
    const itemSummary = (p.items || [])
      .map((it) => `${it.item || 'Item'}: Qty ${it.quantity} @ ${it.rate}`)
      .join('; ');

    return [
      p.invoiceNumber,
      p.date,
      p.description,
      p.contactNumber || '',
      itemSummary,
      p.totalQty ?? 0,
      p.totalAmount ?? 0,
      p.previousAmount ?? 0,
      p.paidAmount ?? 0,
      p.balance ?? 0,
      p.remarks || '',
      p.createdAt || '',
    ];
  });

  // Calculate totals
  const totalQty = purchases.reduce((acc, p) => acc + (p.totalQty || 0), 0);
  const totalAmount = purchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalPrevious = purchases.reduce((acc, p) => acc + (p.previousAmount || 0), 0);
  const totalPaid = purchases.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const totalBalance = purchases.reduce((acc, p) => acc + (p.balance || 0), 0);

  const totalRow: (string | number)[] = [
    'TOTAL / SUMMARY',
    '',
    `${purchases.length} Invoices`,
    '',
    '',
    totalQty,
    totalAmount,
    totalPrevious,
    totalPaid,
    totalBalance,
    '',
    '',
  ];

  const allRows = [header, ...dataRows, totalRow];
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = getColWidths(allRows, 14);

  return ws;
}

/**
 * Creates formatted worksheet for Packing Lists
 */
export function createPackingWorksheet(packings: PackingRecord[]): XLSX.WorkSheet {
  const header = [
    'Packing List No',
    'Shipping Mark',
    'Flight',
    'Destination',
    'Shipper',
    'Packing Date',
    'From Date',
    'To Date',
    'Items Breakdown',
    'Total Boxes',
    'Total Weight (KG)',
    'Total Amount (TK)',
    'Remarks',
    'Created At',
  ];

  const dataRows: (string | number)[][] = packings.map((p) => {
    const itemSummary = (p.items || [])
      .map(
        (it) =>
          `${it.item || 'Item'} (${it.box} boxes x ${it.weight} kg = ${it.totalWeight} ${it.unit || 'KG'} @ ${it.rate} = ${it.amount})`
      )
      .join('; ');

    return [
      p.invoiceNumber,
      p.shippingMark,
      p.flight,
      p.destination,
      p.shipper,
      p.packingDate,
      p.fromDate || '',
      p.toDate || '',
      itemSummary,
      p.totalBoxes ?? 0,
      p.totalWeight ?? 0,
      p.totalAmount ?? 0,
      p.remarks || '',
      p.createdAt || '',
    ];
  });

  const totalBoxes = packings.reduce((acc, p) => acc + (p.totalBoxes || 0), 0);
  const totalWeight = packings.reduce((acc, p) => acc + (p.totalWeight || 0), 0);
  const totalAmount = packings.reduce((acc, p) => acc + (p.totalAmount || 0), 0);

  const totalRow: (string | number)[] = [
    'TOTAL / SUMMARY',
    '',
    '',
    '',
    `${packings.length} Shipments`,
    '',
    '',
    '',
    '',
    totalBoxes,
    totalWeight,
    totalAmount,
    '',
    '',
  ];

  const allRows = [header, ...dataRows, totalRow];
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = getColWidths(allRows, 15);

  return ws;
}

/**
 * Creates formatted worksheet for Payments & Exporter records
 */
export function createPaymentWorksheet(payments: PaymentRecord[]): XLSX.WorkSheet {
  const header = [
    'Voucher Number',
    'Date',
    'Party / Supplier Name',
    'Party Type',
    'Contact Number',
    'Particulars Breakdown',
    'Total Amount (TK)',
    'Previous Ledger (TK)',
    'Paid Amount (TK)',
    'Balance Due (TK)',
    'Return RMB (¥)',
    'RMB Exchange Rate (TK)',
    'Return RMB Converted (TK)',
    'Linked Export Document',
    'Remarks',
    'Created At',
  ];

  const dataRows: (string | number)[][] = payments.map((p) => {
    const itemsSummary = (p.items || [])
      .map(
        (it) =>
          `${it.description || 'Entry'}: Debit ${it.debitAmount} | Credit ${it.creditAmount}`
      )
      .join('; ');

    return [
      p.invoiceNumber,
      p.date,
      p.description,
      p.partyType,
      p.contactNumber || '',
      itemsSummary,
      p.totalAmount ?? 0,
      p.previousAmount ?? 0,
      p.paidAmount ?? 0,
      p.balance ?? 0,
      p.returnRmb?.rmbAmount ?? 0,
      p.returnRmb?.exchangeRate ?? 0,
      p.returnRmb?.bdtAmount ?? 0,
      p.returnRmb?.linkedExportDocument || '',
      p.remarks || '',
      p.createdAt || '',
    ];
  });

  const totalAmount = payments.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const totalBalance = payments.reduce((acc, p) => acc + (p.balance || 0), 0);
  const totalRmb = payments.reduce((acc, p) => acc + (p.returnRmb?.rmbAmount || 0), 0);
  const totalRmbBdt = payments.reduce((acc, p) => acc + (p.returnRmb?.bdtAmount || 0), 0);

  const totalRow: (string | number)[] = [
    'TOTAL / SUMMARY',
    '',
    `${payments.length} Payments`,
    '',
    '',
    '',
    totalAmount,
    0,
    totalPaid,
    totalBalance,
    totalRmb,
    '',
    totalRmbBdt,
    '',
    '',
    '',
  ];

  const allRows = [header, ...dataRows, totalRow];
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = getColWidths(allRows, 15);

  return ws;
}

/**
 * Creates executive Summary worksheet for Google Sheets / Excel
 */
export function createSummaryWorksheet(
  purchases: PurchaseRecord[],
  packings: PackingRecord[],
  payments: PaymentRecord[],
  dropdowns?: DropdownSettings
): XLSX.WorkSheet {
  const totalPurchaseValue = purchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalPurchaseQty = purchases.reduce((acc, p) => acc + (p.totalQty || 0), 0);
  const totalPackingValue = packings.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalPackingBoxes = packings.reduce((acc, p) => acc + (p.totalBoxes || 0), 0);
  const totalPackingWeight = packings.reduce((acc, p) => acc + (p.totalWeight || 0), 0);
  const totalPaymentsPaid = payments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const totalReturnRmb = payments.reduce((acc, p) => acc + (p.returnRmb?.rmbAmount || 0), 0);
  const totalReturnRmbBdt = payments.reduce((acc, p) => acc + (p.returnRmb?.bdtAmount || 0), 0);

  const estGrossMargin = totalPackingValue - totalPurchaseValue;
  const today = new Date().toISOString().split('T')[0];

  const rows: (string | number)[][] = [
    ['ZSB AQUATICS | BUSINESS CONTROL CENTER - GOOGLE SHEETS & EXCEL WORKBOOK'],
    [`Generated On: ${today}`, `Database Status: Live Synchronized`],
    [],
    ['KEY PERFORMANCE INDICATOR (KPI)', 'METRIC VALUE', 'CURRENCY / UNIT', 'NOTES & FORMULAS'],
    ['Total Purchase Value', totalPurchaseValue, 'BDT (TK)', '=SUM(Purchase_DB!G:G)'],
    ['Total Purchase Quantity', totalPurchaseQty, 'PCS / LOTS', '=SUM(Purchase_DB!F:F)'],
    ['Total Packing / Export Value', totalPackingValue, 'BDT (TK)', '=SUM(Packing_DB!L:L)'],
    ['Total Export Boxes', totalPackingBoxes, 'BOXES', '=SUM(Packing_DB!J:J)'],
    ['Total Export Weight', totalPackingWeight, 'KG', '=SUM(Packing_DB!K:K)'],
    ['Total Payments Disbursed', totalPaymentsPaid, 'BDT (TK)', '=SUM(Payment_DB!I:I)'],
    ['Total Return RMB Received', totalReturnRmb, 'RMB (¥)', '=SUM(Payment_DB!K:K)'],
    ['Total Return RMB Converted', totalReturnRmbBdt, 'BDT (TK)', '=SUM(Payment_DB!M:M)'],
    ['Estimated Gross Trade Margin', estGrossMargin, 'BDT (TK)', 'Total Export Value - Total Purchase Value'],
    [],
    ['EXCHANGE RATES REFERENCE', 'RATE VALUE', 'PAIR', 'SETTINGS'],
    ['Base RMB Exchange Rate', dropdowns?.rmbExchangeRate || 16.85, 'BDT / 1 RMB', 'Active in system'],
    ['USD to RMB', dropdowns?.dailyRates?.usdToRmb || 7.24, 'RMB / 1 USD', 'Daily rate'],
    ['RMB to BDT', dropdowns?.dailyRates?.rmbToBdt || 16.85, 'BDT / 1 RMB', 'Daily rate'],
    ['USD to BDT', dropdowns?.dailyRates?.usdToBdt || 122.0, 'BDT / 1 USD', 'Daily rate'],
    [],
    ['HOW TO USE IN GOOGLE SHEETS: '],
    ['1. Go to sheets.new in your web browser.'],
    ['2. Click File > Import > Upload, and select this downloaded .xlsx file.'],
    ['3. All sheets (Summary, Purchase_DB, Packing_DB, Payment_DB) will load with formulas intact.'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 35 }, { wch: 22 }, { wch: 18 }, { wch: 45 }];
  return ws;
}

/**
 * Creates settings, dropdown lists, and exchange rates worksheet for master reference
 */
export function createSettingsWorksheet(dropdowns?: DropdownSettings): XLSX.WorkSheet {
  const rows: (string | number)[][] = [
    ['ZSB AQUATICS | MASTER CATALOG, DROPDOWNS & EXCHANGE RATES'],
    ['Reference tables for suppliers, shippers, destinations, and currency conversions'],
    [],
    ['EXCHANGE RATES REFERENCE', 'RATE VALUE', 'CURRENCY PAIR', 'STATUS'],
    ['Base RMB Exchange Rate', dropdowns?.rmbExchangeRate || 16.85, '1 RMB = BDT', 'Active'],
    ['USD to RMB', dropdowns?.dailyRates?.usdToRmb || 7.24, '1 USD = RMB', 'Daily Live'],
    ['RMB to BDT', dropdowns?.dailyRates?.rmbToBdt || 16.85, '1 RMB = BDT', 'Daily Live'],
    ['USD to BDT', dropdowns?.dailyRates?.usdToBdt || 122.0, '1 USD = BDT', 'Daily Live'],
    [],
    ['REGISTERED SUPPLIERS & EXPORTERS', 'REGISTERED SHIPPERS', 'SHIPPING MARKS', 'DESTINATIONS', 'FLIGHTS'],
  ];

  const maxLen = Math.max(
    dropdowns?.suppliersAndExporters?.length || 0,
    dropdowns?.shippers?.length || 0,
    dropdowns?.shippingMarks?.length || 0,
    dropdowns?.destinations?.length || 0,
    dropdowns?.flights?.length || 0,
    dropdowns?.items?.length || 0
  );

  for (let i = 0; i < maxLen; i++) {
    rows.push([
      dropdowns?.suppliersAndExporters?.[i] || '',
      dropdowns?.shippers?.[i] || '',
      dropdowns?.shippingMarks?.[i] || '',
      dropdowns?.destinations?.[i] || '',
      dropdowns?.flights?.[i] || '',
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 32 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 18 }];
  return ws;
}

/**
 * Downloads a complete multi-sheet .xlsx workbook compatible with Google Sheets and Microsoft Excel
 */
export function exportAllToGoogleExcel(
  purchases: PurchaseRecord[],
  packings: PackingRecord[],
  payments: PaymentRecord[],
  dropdowns?: DropdownSettings,
  customFilename?: string
): void {
  const wb = XLSX.utils.book_new();
  const today = new Date().toISOString().split('T')[0];

  // 1. Executive Summary Sheet
  const summaryWs = createSummaryWorksheet(purchases, packings, payments, dropdowns);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Overview_Summary');

  // 2. Purchase Database Sheet
  const purchaseWs = createPurchaseWorksheet(purchases);
  XLSX.utils.book_append_sheet(wb, purchaseWs, 'Purchase_DB');

  // 3. Packing Database Sheet
  const packingWs = createPackingWorksheet(packings);
  XLSX.utils.book_append_sheet(wb, packingWs, 'Packing_DB');

  // 4. Payment Database Sheet
  const paymentWs = createPaymentWorksheet(payments);
  XLSX.utils.book_append_sheet(wb, paymentWs, 'Payment_DB');

  // 5. Catalog and Settings Sheet
  const settingsWs = createSettingsWorksheet(dropdowns);
  XLSX.utils.book_append_sheet(wb, settingsWs, 'Catalog_And_Rates');

  const filename = customFilename || `ZSB_Aquatics_Master_Database_${today}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Downloads a complete database JSON archive for full offline backup and restoration
 */
export function exportFullJsonBackup(
  purchases: PurchaseRecord[],
  packings: PackingRecord[],
  payments: PaymentRecord[],
  dropdowns?: DropdownSettings,
  customFilename?: string
): void {
  const today = new Date().toISOString().split('T')[0];
  const payload = {
    appName: 'ZSB Aquatics Master Business Database',
    exportedAt: new Date().toISOString(),
    version: '2.0',
    summary: {
      totalPurchases: purchases.length,
      totalPackings: packings.length,
      totalPayments: payments.length,
    },
    purchases,
    packings,
    payments,
    dropdowns,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = customFilename || `ZSB_Aquatics_Full_Backup_${today}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a single database table as .xlsx
 */
export function exportSingleDbToGoogleExcel(
  type: 'purchase_db' | 'packing_db' | 'payment_db',
  records: (PurchaseRecord | PackingRecord | PaymentRecord)[],
  customFilename?: string
): void {
  const wb = XLSX.utils.book_new();
  const today = new Date().toISOString().split('T')[0];

  if (type === 'purchase_db') {
    const ws = createPurchaseWorksheet(records as PurchaseRecord[]);
    XLSX.utils.book_append_sheet(wb, ws, 'Purchase_DB');
    XLSX.writeFile(wb, customFilename || `ZSB_Purchase_DB_${today}.xlsx`);
  } else if (type === 'packing_db') {
    const ws = createPackingWorksheet(records as PackingRecord[]);
    XLSX.utils.book_append_sheet(wb, ws, 'Packing_DB');
    XLSX.writeFile(wb, customFilename || `ZSB_Packing_DB_${today}.xlsx`);
  } else {
    const ws = createPaymentWorksheet(records as PaymentRecord[]);
    XLSX.utils.book_append_sheet(wb, ws, 'Payment_DB');
    XLSX.writeFile(wb, customFilename || `ZSB_Payment_DB_${today}.xlsx`);
  }
}

/**
 * Converts tabular records to Tab-Separated Values (TSV) ready to be copied and pasted directly
 * into Google Sheets (where Ctrl+V cleanly populates all cells into rows and columns)
 */
export function copyRecordsForGoogleSheets(
  type: 'purchase_db' | 'packing_db' | 'payment_db',
  records: (PurchaseRecord | PackingRecord | PaymentRecord)[]
): Promise<boolean> {
  let lines: string[] = [];

  if (type === 'purchase_db') {
    const recs = records as PurchaseRecord[];
    lines.push([
      'Invoice Number',
      'Date',
      'Description',
      'Contact',
      'Items Breakdown',
      'Total Qty',
      'Total Amount (TK)',
      'Previous Balance (TK)',
      'Paid Amount (TK)',
      'Balance Due (TK)',
      'Remarks',
    ].join('\t'));

    recs.forEach((p) => {
      const itemsStr = (p.items || []).map((it) => `${it.item}: ${it.quantity}@${it.rate}`).join('; ');
      lines.push([
        p.invoiceNumber,
        p.date,
        p.description,
        p.contactNumber || '',
        itemsStr,
        p.totalQty ?? 0,
        p.totalAmount ?? 0,
        p.previousAmount ?? 0,
        p.paidAmount ?? 0,
        p.balance ?? 0,
        p.remarks || '',
      ].join('\t'));
    });
  } else if (type === 'packing_db') {
    const recs = records as PackingRecord[];
    lines.push([
      'Packing List No',
      'Shipping Mark',
      'Flight',
      'Destination',
      'Shipper',
      'Packing Date',
      'From Date',
      'To Date',
      'Items Breakdown',
      'Total Boxes',
      'Total Weight (KG)',
      'Total Amount (TK)',
      'Remarks',
    ].join('\t'));

    recs.forEach((p) => {
      const itemsStr = (p.items || [])
        .map((it) => `${it.item} (${it.box}bx, ${it.totalWeight}kg, ${it.amount}tk)`)
        .join('; ');
      lines.push([
        p.invoiceNumber,
        p.shippingMark,
        p.flight,
        p.destination,
        p.shipper,
        p.packingDate,
        p.fromDate || '',
        p.toDate || '',
        itemsStr,
        p.totalBoxes ?? 0,
        p.totalWeight ?? 0,
        p.totalAmount ?? 0,
        p.remarks || '',
      ].join('\t'));
    });
  } else {
    const recs = records as PaymentRecord[];
    lines.push([
      'Voucher Number',
      'Date',
      'Party Name',
      'Category',
      'Contact',
      'Particulars',
      'Total Amount (TK)',
      'Previous Ledger (TK)',
      'Paid Amount (TK)',
      'Balance Due (TK)',
      'Return RMB (¥)',
      'Rate (TK)',
      'Converted RMB (TK)',
      'Linked Export Doc',
      'Remarks',
    ].join('\t'));

    recs.forEach((p) => {
      const itemsStr = (p.items || []).map((it) => `${it.description}: ${it.debitAmount}/${it.creditAmount}`).join('; ');
      lines.push([
        p.invoiceNumber,
        p.date,
        p.description,
        p.partyType,
        p.contactNumber || '',
        itemsStr,
        p.totalAmount ?? 0,
        p.previousAmount ?? 0,
        p.paidAmount ?? 0,
        p.balance ?? 0,
        p.returnRmb?.rmbAmount ?? 0,
        p.returnRmb?.exchangeRate ?? '',
        p.returnRmb?.bdtAmount ?? 0,
        p.returnRmb?.linkedExportDocument || '',
        p.remarks || '',
      ].join('\t'));
    });
  }

  const tsvText = lines.join('\n');
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(tsvText).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}
