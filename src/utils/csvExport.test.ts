import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeCsvCell,
  generatePurchaseCsv,
  generatePackingCsv,
  generatePaymentCsv,
} from './csvExport.ts';

test('escapeCsvCell handles quotes, commas, and nulls properly', () => {
  assert.equal(escapeCsvCell('Simple'), '"Simple"');
  assert.equal(escapeCsvCell('Contains, comma'), '"Contains, comma"');
  assert.equal(escapeCsvCell('Quote "Test"'), '"Quote ""Test"""');
  assert.equal(escapeCsvCell(null), '""');
  assert.equal(escapeCsvCell(123.45), '"123.45"');
});

test('generatePurchaseCsv generates proper CSV header and row content', () => {
  const records = [
    {
      id: '1',
      invoiceNumber: 'INV-2026-001',
      date: '2026-10-18',
      description: 'KS/3',
      contactNumber: '+8801700000000',
      items: [{ id: '1', item: 'F1', quantity: 10, rate: 200 }],
      totalQty: 10,
      totalAmount: 2000,
      previousAmount: 500,
      paidAmount: 2000,
      balance: 500,
      createdAt: '2026-10-18T10:00:00Z',
    },
  ];

  const csv = generatePurchaseCsv(records);
  assert.ok(csv.includes('"Invoice Number"'));
  assert.ok(csv.includes('"INV-2026-001"'));
  assert.ok(csv.includes('"KS/3"'));
  assert.ok(csv.includes('"2000"'));
});

test('generatePackingCsv includes weights and shipping details', () => {
  const records = [
    {
      id: '1',
      invoiceNumber: 'PL-2026-001',
      shippingMark: 'CHJ-22',
      flight: 'CZ',
      destination: 'GUANGZHOU',
      shipper: 'ZSB AQUATICS',
      packingDate: '2026-10-18',
      fromDate: '2026-10-18',
      toDate: '2026-10-19',
      items: [
        {
          id: '1',
          item: 'F1',
          box: 5,
          weight: 14,
          unit: 'KG',
          rate: 300,
          totalWeight: 70,
          amount: 21000,
        },
      ],
      totalBoxes: 5,
      totalWeight: 70,
      totalAmount: 21000,
      createdAt: '2026-10-18T10:00:00Z',
    },
  ];

  const csv = generatePackingCsv(records);
  assert.ok(csv.includes('"CHJ-22"'));
  assert.ok(csv.includes('"GUANGZHOU"'));
  assert.ok(csv.includes('"70"'));
  assert.ok(csv.includes('"21000"'));
});

test('generatePaymentCsv includes Return RMB and ledger amounts', () => {
  const records = [
    {
      id: '1',
      invoiceNumber: 'VCH-2026-001',
      date: '2026-10-18',
      partyType: 'Return RMB' as const,
      description: 'UZZAL VAI',
      contactNumber: '+8801800000000',
      items: [
        {
          id: '1',
          description: 'Export Return RMB',
          debitAmount: 84250,
          creditAmount: 0,
          balance: 84250,
        },
      ],
      totalAmount: 84250,
      previousAmount: 0,
      paidAmount: 84250,
      balance: 0,
      returnRmb: {
        rmbAmount: 5000,
        exchangeRate: 16.85,
        bdtAmount: 84250,
        linkedExportDocument: 'PL-2026-001',
      },
      createdAt: '2026-10-18T10:00:00Z',
    },
  ];

  const csv = generatePaymentCsv(records);
  assert.ok(csv.includes('"VCH-2026-001"'));
  assert.ok(csv.includes('"UZZAL VAI"'));
  assert.ok(csv.includes('"5000"'));
  assert.ok(csv.includes('"PL-2026-001"'));
});
