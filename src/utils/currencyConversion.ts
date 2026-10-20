import type { CurrencyCode, DailyExchangeRates, DropdownSettings } from '../types/index.ts';

/**
 * Returns safe, valid exchange rates with fallbacks
 */
export function getEffectiveRates(
  dailyRates?: Partial<DailyExchangeRates>,
  fallbackRmbRate = 16.85
): DailyExchangeRates {
  const date = dailyRates?.date || new Date().toISOString().split('T')[0];
  const usdToRmb = Number(dailyRates?.usdToRmb) > 0 ? Number(dailyRates?.usdToRmb) : 7.24;
  const rmbToBdt =
    Number(dailyRates?.rmbToBdt) > 0
      ? Number(dailyRates?.rmbToBdt)
      : Number(fallbackRmbRate) > 0
      ? Number(fallbackRmbRate)
      : 16.85;
  const derivedUsdToBdt = Math.round(usdToRmb * rmbToBdt * 100) / 100;
  const usdToBdt =
    Number(dailyRates?.usdToBdt) > 0 ? Number(dailyRates?.usdToBdt) : derivedUsdToBdt;

  return {
    date,
    usdToRmb,
    rmbToBdt,
    usdToBdt,
    notes: dailyRates?.notes || '',
    lastUpdated: dailyRates?.lastUpdated || new Date().toISOString(),
  };
}

/**
 * Converts USD amount to RMB
 */
export function convertUsdToRmb(usd: number, usdToRmbRate: number): number {
  const safeUsd = Math.max(0, Number(usd) || 0);
  const safeRate = Number(usdToRmbRate) > 0 ? Number(usdToRmbRate) : 7.24;
  return Math.round(safeUsd * safeRate * 100) / 100;
}

/**
 * Converts RMB amount to USD
 */
export function convertRmbToUsd(rmb: number, usdToRmbRate: number): number {
  const safeRmb = Math.max(0, Number(rmb) || 0);
  const safeRate = Number(usdToRmbRate) > 0 ? Number(usdToRmbRate) : 7.24;
  return Math.round((safeRmb / safeRate) * 100) / 100;
}

/**
 * Converts RMB amount to BDT (TK)
 */
export function convertRmbToBdt(rmb: number, rmbToBdtRate: number): number {
  const safeRmb = Math.max(0, Number(rmb) || 0);
  const safeRate = Number(rmbToBdtRate) > 0 ? Number(rmbToBdtRate) : 16.85;
  return Math.round(safeRmb * safeRate * 100) / 100;
}

/**
 * Converts BDT amount to RMB
 */
export function convertBdtToRmb(bdt: number, rmbToBdtRate: number): number {
  const safeBdt = Math.max(0, Number(bdt) || 0);
  const safeRate = Number(rmbToBdtRate) > 0 ? Number(rmbToBdtRate) : 16.85;
  return Math.round((safeBdt / safeRate) * 100) / 100;
}

/**
 * Converts USD amount to BDT (TK)
 */
export function convertUsdToBdt(usd: number, usdToBdtRate: number): number {
  const safeUsd = Math.max(0, Number(usd) || 0);
  const safeRate = Number(usdToBdtRate) > 0 ? Number(usdToBdtRate) : 122.00;
  return Math.round(safeUsd * safeRate * 100) / 100;
}

/**
 * Converts BDT amount to USD
 */
export function convertBdtToUsd(bdt: number, usdToBdtRate: number): number {
  const safeBdt = Math.max(0, Number(bdt) || 0);
  const safeRate = Number(usdToBdtRate) > 0 ? Number(usdToBdtRate) : 122.00;
  return Math.round((safeBdt / safeRate) * 100) / 100;
}

/**
 * Universal Currency Converter between any pair of supported currencies
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: DailyExchangeRates
): number {
  const safeAmount = Number(amount) || 0;
  if (from === to) return safeAmount;

  const effective = getEffectiveRates(rates);

  // Convert from origin to BDT base
  let amountInBdt = safeAmount;
  if (from === 'USD') {
    amountInBdt = safeAmount * effective.usdToBdt;
  } else if (from === 'RMB') {
    amountInBdt = safeAmount * effective.rmbToBdt;
  }

  // Convert from BDT to target currency
  if (to === 'BDT') {
    return Math.round(amountInBdt * 100) / 100;
  } else if (to === 'USD') {
    return Math.round((amountInBdt / effective.usdToBdt) * 100) / 100;
  } else if (to === 'RMB') {
    // If from USD to RMB directly, use usdToRmb for higher precision
    if (from === 'USD') {
      return convertUsdToRmb(safeAmount, effective.usdToRmb);
    }
    return Math.round((amountInBdt / effective.rmbToBdt) * 100) / 100;
  }

  return safeAmount;
}

/**
 * Calculates Return RMB settlement from USD contract
 * (e.g. Overseas buyer contracts in USD, remits in RMB, settles in BDT)
 */
export function calculateReturnRmbFromUsd(
  usdAmount: number,
  usdToRmbRate: number,
  rmbToBdtRate: number
) {
  const safeUsd = Math.max(0, Number(usdAmount) || 0);
  const safeUsdToRmb = Number(usdToRmbRate) > 0 ? Number(usdToRmbRate) : 7.24;
  const safeRmbToBdt = Number(rmbToBdtRate) > 0 ? Number(rmbToBdtRate) : 16.85;

  const rmbAmount = Math.round(safeUsd * safeUsdToRmb * 100) / 100;
  const bdtAmount = Math.round(rmbAmount * safeRmbToBdt * 100) / 100;
  const effectiveUsdToBdtRate = Math.round(safeUsdToRmb * safeRmbToBdt * 100) / 100;

  return {
    usdAmount: safeUsd,
    usdToRmbRate: safeUsdToRmb,
    rmbAmount,
    rmbToBdtRate: safeRmbToBdt,
    bdtAmount,
    effectiveUsdToBdtRate,
  };
}

export interface PnlCurrencyValues {
  purchaseCost: number;
  exportRevenue: number;
  returnRmb: number;
  totalRevenue: number;
  grossProfit: number;
  marginPercentage: number;
  isProfitable: boolean;
}

export interface MultiCurrencyPnlSummary {
  bdt: PnlCurrencyValues;
  usd: PnlCurrencyValues;
  rmb: PnlCurrencyValues;
  rates: DailyExchangeRates;
}

/**
 * Calculates Profit & Loss in all three supported currencies: BDT, USD, and RMB
 */
export function calculateMultiCurrencyPnl(
  purchaseCostBdt: number,
  exportRevenueBdt: number,
  returnRmbBdt: number,
  rates: DailyExchangeRates
): MultiCurrencyPnlSummary {
  const effective = getEffectiveRates(rates);

  const purchaseBdt = Math.max(0, Number(purchaseCostBdt) || 0);
  const exportBdt = Math.max(0, Number(exportRevenueBdt) || 0);
  const rmbBdt = Math.max(0, Number(returnRmbBdt) || 0);
  const totalRevBdt = exportBdt + rmbBdt;
  const profitBdt = totalRevBdt - purchaseBdt;
  const marginPct =
    purchaseBdt > 0 ? Math.round((profitBdt / purchaseBdt) * 10000) / 100 : 0;

  const bdt: PnlCurrencyValues = {
    purchaseCost: Math.round(purchaseBdt * 100) / 100,
    exportRevenue: Math.round(exportBdt * 100) / 100,
    returnRmb: Math.round(rmbBdt * 100) / 100,
    totalRevenue: Math.round(totalRevBdt * 100) / 100,
    grossProfit: Math.round(profitBdt * 100) / 100,
    marginPercentage: marginPct,
    isProfitable: profitBdt >= 0,
  };

  // Convert to USD
  const toUsd = (val: number) =>
    Math.round((val / (effective.usdToBdt || 122.0)) * 100) / 100;

  const usd: PnlCurrencyValues = {
    purchaseCost: toUsd(purchaseBdt),
    exportRevenue: toUsd(exportBdt),
    returnRmb: toUsd(rmbBdt),
    totalRevenue: toUsd(totalRevBdt),
    grossProfit: toUsd(profitBdt),
    marginPercentage: marginPct,
    isProfitable: profitBdt >= 0,
  };

  // Convert to RMB
  const toRmb = (val: number) =>
    Math.round((val / (effective.rmbToBdt || 16.85)) * 100) / 100;

  const rmb: PnlCurrencyValues = {
    purchaseCost: toRmb(purchaseBdt),
    exportRevenue: toRmb(exportBdt),
    returnRmb: toRmb(rmbBdt),
    totalRevenue: toRmb(totalRevBdt),
    grossProfit: toRmb(profitBdt),
    marginPercentage: marginPct,
    isProfitable: profitBdt >= 0,
  };

  return {
    bdt,
    usd,
    rmb,
    rates: effective,
  };
}

/**
 * Formats amount with clean currency symbol and comma separators
 */
export function formatCurrencyWithSymbol(
  amount: number,
  currency: CurrencyCode = 'BDT'
): string {
  const val = Number(amount) || 0;
  const formatted = val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  switch (currency) {
    case 'USD':
      return `$ ${formatted}`;
    case 'RMB':
      return `¥ ${formatted}`;
    case 'BDT':
    default:
      return `TK ${formatted}`;
  }
}
