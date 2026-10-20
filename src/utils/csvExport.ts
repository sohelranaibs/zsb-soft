import type { PurchaseRecord, PackingRecord, PaymentRecord } from '../types/index.ts';

/**
 * Escapes a cell value for standard RFC 4180 CSV compliance
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // If string contains comma, quote, or newline, escape inner quotes with double quotes and wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates formatted CSV for Purchase records, ready for Excel/Google Sheets & data analysis
 */
export function generatePurchaseCsv(records: PurchaseRecord[]): string {
  const headers = [
    'Invoice Number',
    'Date',
    'Description (Lot)',
    'Contact Number',
    'Item Summary',
    'Total Quantity',
    'Total Amount (TK)',
    'Previous Amount (TK)',
    'Paid Amount (TK)',
    'Balance (TK)',
    'Remarks',
    'Created At',
  ];

  const rows = records.map((p) => {
    const itemSummary = (p.items || [])
      .map((it) => `${it.item || 'Item'}: Qty ${it.quantity} @ ${it.rate}`)
      .join('; ');

    return [
      escapeCsvCell(p.invoiceNumber),
      escapeCsvCell(p.date),
      escapeCsvCell(p.description),
      escapeCsvCell(p.contactNumber || ''),
      escapeCsvCell(itemSummary),
      escapeCsvCell(p.totalQty ?? 0),
      escapeCsvCell(p.totalAmount ?? 0),
      escapeCsvCell(p.previousAmount ?? 0),
      escapeCsvCell(p.paidAmount ?? 0),
      escapeCsvCell(p.balance ?? 0),
      escapeCsvCell(p.remarks || ''),
      escapeCsvCell(p.createdAt || ''),
    ].join(',');
  });

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

/**
 * Generates formatted CSV for Packing List records
 */
export function generatePackingCsv(records: PackingRecord[]): string {
  const headers = [
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

  const rows = records.map((p) => {
    const itemSummary = (p.items || [])
      .map(
        (it) =>
          `${it.item || 'Item'} (${it.box} boxes x ${it.weight} kg = ${it.totalWeight} ${it.unit || 'KG'} @ ${it.rate} = ${it.amount})`
      )
      .join('; ');

    return [
      escapeCsvCell(p.invoiceNumber),
      escapeCsvCell(p.shippingMark),
      escapeCsvCell(p.flight),
      escapeCsvCell(p.destination),
      escapeCsvCell(p.shipper),
      escapeCsvCell(p.packingDate),
      escapeCsvCell(p.fromDate || ''),
      escapeCsvCell(p.toDate || ''),
      escapeCsvCell(itemSummary),
      escapeCsvCell(p.totalBoxes ?? 0),
      escapeCsvCell(p.totalWeight ?? 0),
      escapeCsvCell(p.totalAmount ?? 0),
      escapeCsvCell(p.remarks || ''),
      escapeCsvCell(p.createdAt || ''),
    ].join(',');
  });

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

/**
 * Generates formatted CSV for Payment records (including Return RMB details)
 */
export function generatePaymentCsv(records: PaymentRecord[]): string {
  const headers = [
    'Voucher Number',
    'Date',
    'Party Name',
    'Category',
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

  const rows = records.map((p) => {
    const itemsSummary = (p.items || [])
      .map(
        (it) =>
          `${it.description || 'Entry'}: Debit ${it.debitAmount} | Credit ${it.creditAmount}`
      )
      .join('; ');

    return [
      escapeCsvCell(p.invoiceNumber),
      escapeCsvCell(p.date),
      escapeCsvCell(p.description),
      escapeCsvCell(p.partyType),
      escapeCsvCell(p.contactNumber || ''),
      escapeCsvCell(itemsSummary),
      escapeCsvCell(p.totalAmount ?? 0),
      escapeCsvCell(p.previousAmount ?? 0),
      escapeCsvCell(p.paidAmount ?? 0),
      escapeCsvCell(p.balance ?? 0),
      escapeCsvCell(p.returnRmb?.rmbAmount ?? 0),
      escapeCsvCell(p.returnRmb?.exchangeRate ?? ''),
      escapeCsvCell(p.returnRmb?.bdtAmount ?? 0),
      escapeCsvCell(p.returnRmb?.linkedExportDocument || ''),
      escapeCsvCell(p.remarks || ''),
      escapeCsvCell(p.createdAt || ''),
    ].join(',');
  });

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

/**
 * Triggers browser file download with BOM for Excel UTF-8 compatibility
 */
export function triggerCsvDownload(csvString: string, filename: string): void {
  // \uFEFF BOM ensures Microsoft Excel recognizes UTF-8 correctly
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
