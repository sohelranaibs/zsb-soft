import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePurchaseRow,
  calculatePurchaseTotals,
  calculatePackingRow,
  calculatePackingTotals,
  calculatePaymentTotals,
  calculateProfitAndLoss,
} from './calculations.ts';

test('calculatePurchaseRow computes qty * rate and line balance', () => {
  const row = calculatePurchaseRow(10, 150, 500, 200);
  assert.equal(row.totalAmount, 1500);
  assert.equal(row.balance, 1800); // 1500 + 500 - 200
});

test('calculatePurchaseTotals sums quantities and amounts', () => {
  const items = [
    { id: '1', item: 'F1', quantity: 20, rate: 100 },
    { id: '2', item: 'F2', quantity: 15, rate: 200 },
  ];
  const totals = calculatePurchaseTotals(items, 1000, 4000);
  assert.equal(totals.totalQty, 35);
  assert.equal(totals.totalAmount, 5000); // 20*100 + 15*200 = 2000 + 3000
  assert.equal(totals.balance, 2000); // 5000 + 1000 - 4000
});

test('calculatePackingRow computes Box * Weight and Total Weight * Rate', () => {
  // e.g. 5 boxes of 14 kg = 70 kg at rate 250 = 17,500
  const row = calculatePackingRow(5, 14, 250);
  assert.equal(row.totalWeight, 70);
  assert.equal(row.amount, 17500);
});

test('calculatePackingTotals sums boxes, weights and total values', () => {
  const items = [
    { id: '1', item: 'XL', box: 4, weight: 15, unit: 'KG', rate: 300 }, // 60 kg, 18,000
    { id: '2', item: 'XXL', box: 6, weight: 12, unit: 'KG', rate: 400 }, // 72 kg, 28,800
  ];
  const totals = calculatePackingTotals(items);
  assert.equal(totals.totalBoxes, 10);
  assert.equal(totals.totalWeight, 132);
  assert.equal(totals.totalAmount, 46800);
});

test('calculatePaymentTotals computes debits, credits, and balance', () => {
  const items = [
    { id: '1', description: 'Advance payment', debitAmount: 5000, creditAmount: 0 },
    { id: '2', description: 'Invoice payment', debitAmount: 10000, creditAmount: 2000 },
  ];
  const totals = calculatePaymentTotals(items, 20000, 12000);
  assert.equal(totals.totalDebit, 15000);
  assert.equal(totals.totalCredit, 2000);
  assert.equal(totals.totalAmount, 15000);
  assert.equal(totals.balance, 8000); // 20000 - 12000 per excel formula
});

test('calculateProfitAndLoss accurately calculates gross profit and margin %', () => {
  // Purchase: 100,000 TK, Export: 140,000 TK, Return RMB: 10,000 TK
  const pnl = calculateProfitAndLoss(100000, 140000, 10000);
  assert.equal(pnl.totalRevenue, 150000);
  assert.equal(pnl.grossProfit, 50000);
  assert.equal(pnl.marginPercentage, 50.0);
  assert.equal(pnl.isProfitable, true);
});
