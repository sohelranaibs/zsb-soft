import type { PurchaseRecord, PackingRecord, PaymentRecord } from '../types/index.ts';

export interface BatchSummaryTotals {
  purchaseCount: number;
  totalPurchaseAmount: number;
  totalPurchaseQty: number;
  packingCount: number;
  totalPackingAmount: number;
  totalBoxes: number;
  totalWeight: number;
  paymentCount: number;
  totalPaymentAmount: number;
  totalReturnRmbBdt: number;
  totalReturnRmb: number;
  totalSelectedRecords: number;
  netMargin: number;
}

/**
 * Pure calculation helper for Batch Print and End-of-Month summary
 */
export function calculateBatchSummary(
  selectedPurchases: PurchaseRecord[],
  selectedPackings: PackingRecord[],
  selectedPayments: PaymentRecord[]
): BatchSummaryTotals {
  let totalPurchaseAmount = 0;
  let totalPurchaseQty = 0;

  for (const p of selectedPurchases) {
    totalPurchaseAmount += Number(p.totalAmount) || 0;
    totalPurchaseQty += Number(p.totalQty) || 0;
  }

  let totalPackingAmount = 0;
  let totalBoxes = 0;
  let totalWeight = 0;

  for (const p of selectedPackings) {
    totalPackingAmount += Number(p.totalAmount) || 0;
    totalBoxes += Number(p.totalBoxes) || 0;
    totalWeight += Number(p.totalWeight) || 0;
  }

  let totalPaymentAmount = 0;
  let totalReturnRmbBdt = 0;
  let totalReturnRmb = 0;

  for (const p of selectedPayments) {
    totalPaymentAmount += Number(p.totalAmount) || 0;
    if (p.returnRmb) {
      totalReturnRmb += Number(p.returnRmb.rmbAmount) || 0;
      totalReturnRmbBdt += Number(p.returnRmb.bdtAmount) || 0;
    }
  }

  const totalSelectedRecords =
    selectedPurchases.length + selectedPackings.length + selectedPayments.length;

  const totalRevenue = totalPackingAmount + totalReturnRmbBdt;
  const netMargin = totalRevenue - totalPurchaseAmount;

  return {
    purchaseCount: selectedPurchases.length,
    totalPurchaseAmount: Math.round(totalPurchaseAmount * 100) / 100,
    totalPurchaseQty: Math.round(totalPurchaseQty * 100) / 100,
    packingCount: selectedPackings.length,
    totalPackingAmount: Math.round(totalPackingAmount * 100) / 100,
    totalBoxes,
    totalWeight: Math.round(totalWeight * 100) / 100,
    paymentCount: selectedPayments.length,
    totalPaymentAmount: Math.round(totalPaymentAmount * 100) / 100,
    totalReturnRmbBdt: Math.round(totalReturnRmbBdt * 100) / 100,
    totalReturnRmb: Math.round(totalReturnRmb * 100) / 100,
    totalSelectedRecords,
    netMargin: Math.round(netMargin * 100) / 100,
  };
}
