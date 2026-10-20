import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPurchaseWorksheet,
  createPackingWorksheet,
  createPaymentWorksheet,
  createSummaryWorksheet,
  createSettingsWorksheet,
} from './excelExport.ts';
import type { PurchaseRecord, PackingRecord, PaymentRecord, DropdownSettings } from '../types/index.ts';

test('createPurchaseWorksheet generates valid worksheet with headers and data', () => {
  const purchases: PurchaseRecord[] = [
    {
      id: 'p1',
      invoiceNumber: 'INV-2026-101',
      date: '2026-10-18',
      description: 'LOT-99',
      contactNumber: '01711111111',
      items: [{ id: 'i1', item: 'Crab Large', quantity: 25, rate: 450 }],
      totalQty: 25,
      totalAmount: 11250,
      previousAmount: 1000,
      paidAmount: 11000,
      balance: 1250,
      createdAt: '2026-10-18T12:00:00Z',
    },
  ];

  const ws = createPurchaseWorksheet(purchases);
  assert.ok(ws, 'Worksheet should be created');
  assert.equal(ws['A1']?.v, 'Invoice Number');
  assert.equal(ws['A2']?.v, 'INV-2026-101');
  assert.equal(ws['C2']?.v, 'LOT-99');
  assert.equal(ws['G2']?.v, 11250);
});

test('createPackingWorksheet generates valid worksheet with weights and totals', () => {
  const packings: PackingRecord[] = [
    {
      id: 'pk1',
      invoiceNumber: 'PK-900',
      shippingMark: 'MARK-X',
      flight: 'SQ-445',
      destination: 'SINGAPORE',
      shipper: 'ZSB AQUATICS',
      packingDate: '2026-10-18',
      fromDate: '2026-10-18',
      toDate: '2026-10-19',
      items: [
        {
          id: 'i1',
          item: 'Eel Fish',
          box: 8,
          weight: 12.5,
          unit: 'KG',
          rate: 650,
          totalWeight: 100,
          amount: 65000,
        },
      ],
      totalBoxes: 8,
      totalWeight: 100,
      totalAmount: 65000,
      createdAt: '2026-10-18T14:00:00Z',
    },
  ];

  const ws = createPackingWorksheet(packings);
  assert.ok(ws, 'Worksheet should be created');
  assert.equal(ws['A1']?.v, 'Packing List No');
  assert.equal(ws['A2']?.v, 'PK-900');
  assert.equal(ws['B2']?.v, 'MARK-X');
  assert.equal(ws['K2']?.v, 100);
});

test('createPaymentWorksheet includes Return RMB fields', () => {
  const payments: PaymentRecord[] = [
    {
      id: 'pm1',
      invoiceNumber: 'PAY-501',
      date: '2026-10-18',
      description: 'CHENG CO',
      partyType: 'Supplier',
      contactNumber: '01822222222',
      items: [
        {
          id: 'i1',
          description: 'Payment for shipment',
          debitAmount: 50000,
          creditAmount: 0,
          balance: 50000,
        },
      ],
      totalAmount: 50000,
      previousAmount: 0,
      paidAmount: 50000,
      balance: 0,
      returnRmb: {
        rmbAmount: 3000,
        exchangeRate: 16.85,
        bdtAmount: 50550,
        linkedExportDocument: 'PK-900',
      },
      createdAt: '2026-10-18T16:00:00Z',
    },
  ];

  const ws = createPaymentWorksheet(payments);
  assert.ok(ws, 'Worksheet should be created');
  assert.equal(ws['A1']?.v, 'Voucher Number');
  assert.equal(ws['A2']?.v, 'PAY-501');
  assert.equal(ws['K2']?.v, 3000);
});

test('createSummaryWorksheet creates KPIs overview', () => {
  const ws = createSummaryWorksheet([], [], []);
  assert.ok(ws, 'Summary Worksheet should be created');
  assert.equal(ws['A1']?.v, 'ZSB AQUATICS | BUSINESS CONTROL CENTER - GOOGLE SHEETS & EXCEL WORKBOOK');
});

test('createSettingsWorksheet creates reference catalog', () => {
  const dropdowns: DropdownSettings = {
    purchaseDescriptions: ['LOT-1'],
    shippingMarks: ['MARK-1'],
    flights: ['TG-322'],
    destinations: ['CHINA'],
    shippers: ['ZSB AQUATICS'],
    items: ['Crab'],
    boxes: ['5'],
    weights: ['10'],
    units: ['KG'],
    suppliersAndExporters: ['SUPPLIER A'],
    rmbExchangeRate: 16.85,
  };
  const ws = createSettingsWorksheet(dropdowns);
  assert.ok(ws, 'Settings Worksheet should be created');
  assert.equal(ws['A1']?.v, 'ZSB AQUATICS | MASTER CATALOG, DROPDOWNS & EXCHANGE RATES');
  assert.equal(ws['A10']?.v, 'REGISTERED SUPPLIERS & EXPORTERS');
  assert.equal(ws['A11']?.v, 'SUPPLIER A');
});

