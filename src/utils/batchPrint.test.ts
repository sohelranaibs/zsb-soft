import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBatchSummary } from './batchPrint.ts';
import type { PurchaseRecord, PackingRecord, PaymentRecord } from '../types/index.ts';

test('calculateBatchSummary aggregates purchases, packings, and payments', () => {
  const purchases: PurchaseRecord[] = [
    {
      id: '1',
      invoiceNumber: 'INV-001',
      date: '2026-10-10',
      description: 'KS/3',
      contactNumber: '',
      items: [],
      totalQty: 100,
      totalAmount: 50000,
      previousAmount: 0,
      paidAmount: 50000,
      balance: 0,
      createdAt: '',
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      date: '2026-10-15',
      description: 'FF1',
      contactNumber: '',
      items: [],
      totalQty: 200,
      totalAmount: 80000,
      previousAmount: 0,
      paidAmount: 80000,
      balance: 0,
      createdAt: '',
    },
  ];

  const packings: PackingRecord[] = [
    {
      id: '1',
      invoiceNumber: 'PL-001',
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
      totalAmount: 110000,
      createdAt: '',
    },
  ];

  const payments: PaymentRecord[] = [
    {
      id: '1',
      invoiceNumber: 'VCH-001',
      date: '2026-10-17',
      partyType: 'Return RMB',
      description: 'UZZAL VAI',
      contactNumber: '',
      items: [],
      totalAmount: 33700,
      previousAmount: 0,
      paidAmount: 33700,
      balance: 0,
      returnRmb: {
        rmbAmount: 2000,
        exchangeRate: 16.85,
        bdtAmount: 33700,
      },
      createdAt: '',
    },
  ];

  const summary = calculateBatchSummary(purchases, packings, payments);

  assert.equal(summary.purchaseCount, 2);
  assert.equal(summary.totalPurchaseAmount, 130000);
  assert.equal(summary.totalPurchaseQty, 300);
  assert.equal(summary.packingCount, 1);
  assert.equal(summary.totalPackingAmount, 110000);
  assert.equal(summary.totalWeight, 140);
  assert.equal(summary.paymentCount, 1);
  assert.equal(summary.totalReturnRmb, 2000);
  assert.equal(summary.totalReturnRmbBdt, 33700);
  assert.equal(summary.totalSelectedRecords, 4);
  // Revenue = 110000 + 33700 = 143700; Purchase = 130000; Margin = 13700
  assert.equal(summary.netMargin, 13700);
});
