export interface PurchaseLineItem {
  id: string;
  item: string;
  quantity: number | '';
  rate: number | '';
  previousAmount?: number | '';
  paidAmount?: number | '';
}

export interface PackingLineItem {
  id: string;
  item: string;
  box: number;
  weight: number;
  unit: string;
  rate: number;
}

export interface PaymentLineItem {
  id: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
}

/**
 * Calculates a single purchase row's total and balance
 */
export function calculatePurchaseRow(qty: number, rate: number, prevAmount = 0, paidAmount = 0) {
  const safeQty = Math.max(0, Number(qty) || 0);
  const safeRate = Math.max(0, Number(rate) || 0);
  const safePrev = Number(prevAmount) || 0;
  const safePaid = Number(paidAmount) || 0;

  const totalAmount = safeQty * safeRate;
  const balance = totalAmount + safePrev - safePaid;

  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
    balance: Math.round(balance * 100) / 100,
  };
}

/**
 * Calculates overall totals for a purchase form
 */
export function calculatePurchaseTotals(
  rows: PurchaseLineItem[],
  reviewPrevAmount = 0,
  reviewPaidAmount = 0
) {
  let totalQty = 0;
  let totalAmount = 0;

  for (const r of rows) {
    const q = Math.max(0, Number(r.quantity) || 0);
    const rate = Math.max(0, Number(r.rate) || 0);
    totalQty += q;
    totalAmount += q * rate;
  }

  const safePrev = Number(reviewPrevAmount) || 0;
  const safePaid = Number(reviewPaidAmount) || 0;
  // Per excel formula in image: Balance = Previous Amount - Paid Amount (or Total + Prev - Paid)
  // When reviewing challan balance:
  const balance = Math.round((totalAmount + safePrev - safePaid) * 100) / 100;

  return {
    totalQty: Math.round(totalQty * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    balance,
  };
}

/**
 * Calculates packing row total weight (Box * Weight) and amount (Total Weight * Rate)
 */
export function calculatePackingRow(box: number, weight: number, rate: number) {
  const safeBox = Math.max(0, Number(box) || 0);
  const safeWeight = Math.max(0, Number(weight) || 0);
  const safeRate = Math.max(0, Number(rate) || 0);

  const totalWeight = safeBox * safeWeight;
  const amount = totalWeight * safeRate;

  return {
    totalWeight: Math.round(totalWeight * 100) / 100,
    amount: Math.round(amount * 100) / 100,
  };
}

/**
 * Calculates overall totals for a packing list
 */
export function calculatePackingTotals(rows: PackingLineItem[]) {
  let totalBoxes = 0;
  let totalWeight = 0;
  let totalAmount = 0;

  for (const r of rows) {
    const b = Math.max(0, Number(r.box) || 0);
    const w = Math.max(0, Number(r.weight) || 0);
    const rate = Math.max(0, Number(r.rate) || 0);

    const lineWeight = b * w;
    const lineAmt = lineWeight * rate;

    totalBoxes += b;
    totalWeight += lineWeight;
    totalAmount += lineAmt;
  }

  return {
    totalBoxes,
    totalWeight: Math.round(totalWeight * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

/**
 * Calculates payment rows and review balance
 */
export function calculatePaymentTotals(
  rows: PaymentLineItem[],
  previousAmount = 0,
  paidAmount = 0
) {
  let totalDebit = 0;
  let totalCredit = 0;

  for (const r of rows) {
    totalDebit += Math.max(0, Number(r.debitAmount) || 0);
    totalCredit += Math.max(0, Number(r.creditAmount) || 0);
  }

  const safePrev = Number(previousAmount) || 0;
  const safePaid = Number(paidAmount) || 0;

  // Formula as shown in Excel screenshot: Balance = Previous Amount - Paid Amount
  // or net accounting balance = Previous Amount + totalDebit - totalCredit - Paid
  const standardFormulaBalance = Math.round((safePrev - safePaid) * 100) / 100;
  const totalAmount = Math.round(totalDebit * 100) / 100;
  const ledgerBalance = Math.round((safePrev + totalDebit - totalCredit - safePaid) * 100) / 100;

  return {
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    totalAmount,
    balance: standardFormulaBalance,
    ledgerBalance,
  };
}

/**
 * Calculates profit & loss between purchase and export amounts
 */
export function calculateProfitAndLoss(
  totalPurchaseCost: number,
  totalExportAmount: number,
  returnRmbBdt = 0
) {
  const purchase = Math.max(0, Number(totalPurchaseCost) || 0);
  const exportVal = Math.max(0, Number(totalExportAmount) || 0);
  const rmbBdt = Math.max(0, Number(returnRmbBdt) || 0);

  const totalRevenue = exportVal + rmbBdt;
  const grossProfit = totalRevenue - purchase;
  const marginPercentage =
    purchase > 0 ? Math.round((grossProfit / purchase) * 10000) / 100 : 0;

  return {
    purchaseCost: Math.round(purchase * 100) / 100,
    exportRevenue: Math.round(exportVal * 100) / 100,
    returnRmbBdt: Math.round(rmbBdt * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    marginPercentage,
    isProfitable: grossProfit >= 0,
  };
}

/**
 * Formats currency values cleanly with 2 decimals
 */
export function formatCurrency(amount: number, symbol = 'TK') {
  const val = Number(amount) || 0;
  return `${symbol} ${val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
