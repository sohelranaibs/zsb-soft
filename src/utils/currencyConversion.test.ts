import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getEffectiveRates,
  convertUsdToRmb,
  convertRmbToUsd,
  convertRmbToBdt,
  convertBdtToRmb,
  convertUsdToBdt,
  convertBdtToUsd,
  convertCurrency,
  calculateReturnRmbFromUsd,
  calculateMultiCurrencyPnl,
  formatCurrencyWithSymbol,
} from './currencyConversion.ts';

describe('currencyConversion utility', () => {
  const sampleRates = {
    date: '2026-10-18',
    usdToRmb: 7.24,
    rmbToBdt: 16.85,
    usdToBdt: 122.00,
  };

  it('getEffectiveRates provides valid defaults and calculates derived rates', () => {
    const rates = getEffectiveRates({ usdToRmb: 7.25, rmbToBdt: 16.80 });
    assert.strictEqual(rates.usdToRmb, 7.25);
    assert.strictEqual(rates.rmbToBdt, 16.80);
    assert.strictEqual(rates.usdToBdt, 121.80);
    assert.ok(rates.date);
  });

  it('converts USD to RMB accurately', () => {
    // $1,000 * 7.24 = 7,240 RMB
    const rmb = convertUsdToRmb(1000, 7.24);
    assert.strictEqual(rmb, 7240);

    // $2,500.50 * 7.24 = 18,103.62 RMB
    const rmbDecimal = convertUsdToRmb(2500.50, 7.24);
    assert.strictEqual(rmbDecimal, 18103.62);
  });

  it('converts RMB to USD accurately', () => {
    // 7,240 RMB / 7.24 = $1,000 USD
    const usd = convertRmbToUsd(7240, 7.24);
    assert.strictEqual(usd, 1000);
  });

  it('converts RMB to BDT accurately', () => {
    // 5,000 RMB * 16.85 = 84,250 TK
    const bdt = convertRmbToBdt(5000, 16.85);
    assert.strictEqual(bdt, 84250);
  });

  it('converts BDT to RMB accurately', () => {
    // 84,250 TK / 16.85 = 5,000 RMB
    const rmb = convertBdtToRmb(84250, 16.85);
    assert.strictEqual(rmb, 5000);
  });

  it('converts USD to BDT accurately', () => {
    // $1,500 * 122.00 = 183,000 TK
    const bdt = convertUsdToBdt(1500, 122.00);
    assert.strictEqual(bdt, 183000);
  });

  it('universal convertCurrency works across all currency pairs', () => {
    // Same currency
    assert.strictEqual(convertCurrency(500, 'USD', 'USD', sampleRates), 500);

    // USD to RMB
    assert.strictEqual(convertCurrency(1000, 'USD', 'RMB', sampleRates), 7240);

    // USD to BDT
    assert.strictEqual(convertCurrency(1000, 'USD', 'BDT', sampleRates), 122000);

    // RMB to BDT
    assert.strictEqual(convertCurrency(1000, 'RMB', 'BDT', sampleRates), 16850);
  });

  it('calculateReturnRmbFromUsd triangulates contract USD to RMB then to BDT', () => {
    // Contract: $2,000 USD @ 7.24 = ¥14,480 RMB @ 16.85 = 243,988 BDT
    const result = calculateReturnRmbFromUsd(2000, 7.24, 16.85);
    assert.strictEqual(result.usdAmount, 2000);
    assert.strictEqual(result.rmbAmount, 14480);
    assert.strictEqual(result.bdtAmount, 243988);
    assert.strictEqual(result.effectiveUsdToBdtRate, 121.99);
  });

  it('calculateMultiCurrencyPnl computes multi-currency figures consistently', () => {
    const purchaseCost = 122000; // = $1,000 USD or ~7,240.36 RMB
    const exportRevenue = 183000; // = $1,500 USD
    const returnRmb = 24400; // ~ $200 USD

    const multi = calculateMultiCurrencyPnl(
      purchaseCost,
      exportRevenue,
      returnRmb,
      sampleRates
    );

    // BDT Check
    assert.strictEqual(multi.bdt.purchaseCost, 122000);
    assert.strictEqual(multi.bdt.exportRevenue, 183000);
    assert.strictEqual(multi.bdt.totalRevenue, 207400);
    assert.strictEqual(multi.bdt.grossProfit, 85400);
    assert.strictEqual(multi.bdt.isProfitable, true);

    // USD Check ($)
    assert.strictEqual(multi.usd.purchaseCost, 1000);
    assert.strictEqual(multi.usd.exportRevenue, 1500);
    assert.strictEqual(multi.usd.totalRevenue, 1700);
    assert.strictEqual(multi.usd.grossProfit, 700);

    // Margin percentages should match
    assert.strictEqual(multi.usd.marginPercentage, multi.bdt.marginPercentage);
    assert.strictEqual(multi.rmb.marginPercentage, multi.bdt.marginPercentage);
  });

  it('formatCurrencyWithSymbol displays symbols and decimals cleanly', () => {
    assert.strictEqual(formatCurrencyWithSymbol(1250, 'USD'), '$ 1,250.00');
    assert.strictEqual(formatCurrencyWithSymbol(5400.5, 'RMB'), '¥ 5,400.50');
    assert.strictEqual(formatCurrencyWithSymbol(85000, 'BDT'), 'TK 85,000.00');
  });
});
