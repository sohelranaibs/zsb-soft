import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterPurchases,
  filterPackings,
  filterPayments,
} from './filterRecords.ts';
import type { PurchaseRecord, PackingRecord, PaymentRecord } from '../types/index.ts';

const samplePurchases: PurchaseRecord[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-001',
    date: '2026-10-15',
    description: 'KS/3',
    contactNumber: '+8801711111111',
    items: [{ id: '1', item: 'F1', quantity: 10, rate: 200 }],
    totalQty: 10,
    totalAmount: 2000,
    previousAmount: 0,
    paidAmount: 2000,
    balance: 0,
    createdAt: '',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-002',
    date: '2026-10-18',
    description: 'ABDULLAH VAI',
    contactNumber: '+8801722222222',
    items: [{ id: '1', item: 'FF1', quantity: 20, rate: 300 }],
    totalQty: 20,
    totalAmount: 6000,
    previousAmount: 0,
    paidAmount: 6000,
    balance: 0,
    createdAt: '',
  },
];

const samplePackings: PackingRecord[] = [
  {
    id: '1',
    invoiceNumber: 'PL-2026-001',
    shippingMark: 'CHJ-22',
    flight: 'CZ',
    destination: 'GUANGZHOU',
    shipper: 'ZSB AQUATICS',
    packingDate: '2026-10-16',
    fromDate: '2026-10-16',
    toDate: '2026-10-17',
    items: [],
    totalBoxes: 10,
    totalWeight: 140,
    totalAmount: 50000,
    createdAt: '',
  },
  {
    id: '2',
    invoiceNumber: 'PL-2026-002',
    shippingMark: 'AAD',
    flight: 'BG CAN',
    destination: 'KUNMING',
    shipper: 'SAJID INT.',
    packingDate: '2026-10-18',
    fromDate: '2026-10-18',
    toDate: '2026-10-19',
    items: [],
    totalBoxes: 8,
    totalWeight: 112,
    totalAmount: 40000,
    createdAt: '',
  },
];

const samplePayments: PaymentRecord[] = [
  {
    id: '1',
    invoiceNumber: 'VCH-2026-001',
    date: '2026-10-17',
    partyType: 'Supplier',
    description: 'ABDULLAH VAI',
    contactNumber: '',
    items: [],
    totalAmount: 50000,
    previousAmount: 0,
    paidAmount: 50000,
    balance: 0,
    createdAt: '',
  },
  {
    id: '2',
    invoiceNumber: 'VCH-2026-002',
    date: '2026-10-18',
    partyType: 'Return RMB',
    description: 'UZZAL VAI',
    contactNumber: '',
    items: [],
    totalAmount: 25000,
    previousAmount: 0,
    paidAmount: 25000,
    balance: 0,
    returnRmb: {
      rmbAmount: 1500,
      exchangeRate: 16.85,
      bdtAmount: 25000,
      linkedExportDocument: 'CHJ-22',
    },
    createdAt: '',
  },
];

test('filterPurchases filters by date range and supplier', () => {
  // Date filter
  const byDate = filterPurchases(samplePurchases, { dateFrom: '2026-10-17' });
  assert.equal(byDate.length, 1);
  assert.equal(byDate[0].invoiceNumber, 'INV-2026-002');

  // Supplier filter
  const bySupplier = filterPurchases(samplePurchases, { supplier: 'ABDULLAH' });
  assert.equal(bySupplier.length, 1);
  assert.equal(bySupplier[0].description, 'ABDULLAH VAI');
});

test('filterPackings filters by shipping mark, destination, and dates', () => {
  // Shipping mark filter
  const byMark = filterPackings(samplePackings, { shippingMark: 'CHJ-22' });
  assert.equal(byMark.length, 1);
  assert.equal(byMark[0].shippingMark, 'CHJ-22');

  // Destination filter
  const byDest = filterPackings(samplePackings, { destination: 'KUNMING' });
  assert.equal(byDest.length, 1);
  assert.equal(byDest[0].destination, 'KUNMING');
});

test('filterPayments filters by supplier and linked shipping mark', () => {
  // Supplier filter
  const bySupplier = filterPayments(samplePayments, { supplier: 'UZZAL' });
  assert.equal(bySupplier.length, 1);
  assert.equal(bySupplier[0].description, 'UZZAL VAI');

  // Shipping mark filter (matches linkedExportDocument)
  const byMark = filterPayments(samplePayments, { shippingMark: 'CHJ-22' });
  assert.equal(byMark.length, 1);
  assert.equal(byMark[0].invoiceNumber, 'VCH-2026-002');
});
