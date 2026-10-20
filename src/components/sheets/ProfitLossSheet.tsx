import React, { useState } from 'react';
import {
  TrendingUp,
  Scale,
  DollarSign,
  Printer,
  Calendar,
  FileText,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Coins,
  Settings,
  ArrowRightLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types';
import { calculateProfitAndLoss, formatCurrency } from '../../utils/calculations';
import {
  getEffectiveRates,
  calculateMultiCurrencyPnl,
  formatCurrencyWithSymbol,
  convertCurrency,
} from '../../utils/currencyConversion';

export const ProfitLossSheet: React.FC = () => {
  const { purchases, packings, payments, setPreviewDoc, showToast, dropdowns, setActiveTab } = useApp();

  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [viewCurrency, setViewCurrency] = useState<CurrencyCode | 'ALL'>('BDT');

  // Rates from settings (or date-matched rate if available in rateHistory)
  const matchingHistRate = dropdowns.rateHistory?.find((h) => h.date === filterDate);
  const effectiveRates = getEffectiveRates(
    matchingHistRate || dropdowns.dailyRates,
    dropdowns.rmbExchangeRate
  );

  // Daily filtered records
  const dailyPurchases = purchases.filter((p) => p.date === filterDate);
  const dailyPackings = packings.filter((p) => p.packingDate === filterDate);
  const dailyPayments = payments.filter((p) => p.date === filterDate);

  // Overall totals in BDT
  const totalPurchaseAll = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalExportAll = packings.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalWeightAll = packings.reduce((sum, p) => sum + (p.totalWeight || 0), 0);
  const totalReturnRmbBdt = payments.reduce(
    (sum, p) => sum + (p.returnRmb?.bdtAmount || 0),
    0
  );

  const overallPnlBdt = calculateProfitAndLoss(totalPurchaseAll, totalExportAll, totalReturnRmbBdt);
  const overallMultiPnl = calculateMultiCurrencyPnl(
    totalPurchaseAll,
    totalExportAll,
    totalReturnRmbBdt,
    effectiveRates
  );

  // Daily totals in BDT
  const dailyPurchaseVal = dailyPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const dailyExportVal = dailyPackings.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const dailyWeight = dailyPackings.reduce((sum, p) => sum + (p.totalWeight || 0), 0);
  const dailyReturnRmbVal = dailyPayments.reduce(
    (sum, p) => sum + (p.returnRmb?.bdtAmount || 0),
    0
  );

  const dailyPnlBdt = calculateProfitAndLoss(dailyPurchaseVal, dailyExportVal, dailyReturnRmbVal);
  const dailyMultiPnl = calculateMultiCurrencyPnl(
    dailyPurchaseVal,
    dailyExportVal,
    dailyReturnRmbVal,
    effectiveRates
  );

  // Active currency display helper
  const formatActive = (amountBdt: number) => {
    if (viewCurrency === 'ALL' || viewCurrency === 'BDT') {
      return formatCurrency(amountBdt);
    }
    const converted = convertCurrency(amountBdt, 'BDT', viewCurrency, effectiveRates);
    return formatCurrencyWithSymbol(converted, viewCurrency);
  };

  // Document Search logic
  const searchResults = docSearchQuery.trim()
    ? {
        purchases: purchases.filter(
          (p) =>
            p.invoiceNumber.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
            p.date.includes(docSearchQuery)
        ),
        packings: packings.filter(
          (p) =>
            p.invoiceNumber.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
            p.shippingMark.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
            p.destination.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
            p.flight.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
            p.shipper.toLowerCase().includes(docSearchQuery.toLowerCase())
        ),
        payments: payments.filter(
          (p) =>
            p.invoiceNumber.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
            p.returnRmb?.linkedExportDocument?.toLowerCase().includes(docSearchQuery.toLowerCase())
        ),
      }
    : null;

  const handleExportDailyReportPDF = () => {
    setPreviewDoc({
      type: 'daily_summary',
      title: `Daily Summary & P&L Statement (${filterDate})`,
      data: {
        date: filterDate,
        purchases: dailyPurchases.length > 0 ? dailyPurchases : purchases.slice(0, 5),
        packings: dailyPackings.length > 0 ? dailyPackings : packings.slice(0, 5),
        payments: dailyPayments.length > 0 ? dailyPayments : payments.slice(0, 5),
        pnl: dailyPnlBdt,
        multiPnl: dailyMultiPnl,
        effectiveRates,
        viewCurrency,
      },
    });
    showToast(`Generated Multi-Currency Daily Summary PDF for ${filterDate}`);
  };

  return (
    <div className="p-3 md:p-5 max-w-[1500px] mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-[#12284c] text-white rounded-lg px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-black text-yellow-400">ZSB AQUATICS</span>
          <span className="text-gray-400 font-light">|</span>
          <span className="text-sm md:text-base font-bold text-white tracking-wide">
            PROFIT &amp; LOSS &amp; DAILY SUMMARY REPORT
          </span>
          <span className="hidden sm:inline-block bg-emerald-700/80 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
            Multi-Currency Reporting
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-blue-200">Date:</span>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-[#0f2549] text-white border border-blue-400/50 rounded px-2 py-1 text-xs font-mono"
          />
          <button
            onClick={handleExportDailyReportPDF}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>SAVE DAILY REPORT (PDF)</span>
          </button>
        </div>
      </div>

      {/* Currency View Switcher & Benchmark Bar */}
      <div className="bg-white rounded-lg border border-gray-300 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Coins className="w-4 h-4 text-purple-700 shrink-0" />
          <span className="font-bold text-gray-800">Display Currency:</span>
          <div className="flex items-center space-x-1 bg-gray-100 p-0.5 rounded border border-gray-300">
            <button
              type="button"
              onClick={() => setViewCurrency('BDT')}
              className={`px-3 py-1 rounded font-bold cursor-pointer transition ${
                viewCurrency === 'BDT'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              BDT (TK)
            </button>
            <button
              type="button"
              onClick={() => setViewCurrency('USD')}
              className={`px-3 py-1 rounded font-bold cursor-pointer transition ${
                viewCurrency === 'USD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setViewCurrency('RMB')}
              className={`px-3 py-1 rounded font-bold cursor-pointer transition ${
                viewCurrency === 'RMB'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              RMB (¥)
            </button>
            <button
              type="button"
              onClick={() => setViewCurrency('ALL')}
              className={`px-3 py-1 rounded font-bold cursor-pointer transition ${
                viewCurrency === 'ALL'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Multi-Currency Table (All 3)
            </button>
          </div>
        </div>

        {/* Applied Daily Rate Info */}
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span className="text-gray-500 font-sans">Exchange Rates for {filterDate}:</span>
          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-bold">
            1 USD = {effectiveRates.usdToRmb} RMB
          </span>
          <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-bold">
            1 RMB = {effectiveRates.rmbToBdt} TK
          </span>
          <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded font-bold">
            1 USD = {effectiveRates.usdToBdt} TK
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="text-blue-600 hover:text-blue-800 font-sans underline cursor-pointer text-xs"
            title="Update exchange rate settings"
          >
            Configure
          </button>
        </div>
      </div>

      {/* Daily Summary Report Section */}
      <div className="bg-white rounded-lg border-2 border-emerald-500 overflow-hidden shadow-sm">
        <div className="bg-[#065f46] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
          <span>
            DAILY SUMMARY REPORT &bull; {filterDate} (Display: {viewCurrency === 'ALL' ? 'Multi-Currency' : viewCurrency})
          </span>
          <span className="text-[11px] text-emerald-200 font-mono">
            Purchases: {dailyPurchases.length} | Exports: {dailyPackings.length}
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200">
            <span className="text-xs font-bold text-amber-900 block">DAILY TOTAL WEIGHT (EXPORT)</span>
            <div className="text-2xl font-black text-amber-900 font-mono mt-1">
              {dailyWeight > 0 ? `${dailyWeight} KG` : `${totalWeightAll} KG (All)`}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Total packed gross weight</p>
          </div>

          <div className="bg-pink-50 p-3.5 rounded-lg border border-pink-200">
            <span className="text-xs font-bold text-pink-900 block">DAILY PURCHASE AMOUNT</span>
            <div className="text-2xl font-black text-pink-900 font-mono mt-1 truncate">
              {dailyPurchaseVal > 0 ? formatActive(dailyPurchaseVal) : `${formatActive(totalPurchaseAll)} (All)`}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {viewCurrency !== 'BDT' && viewCurrency !== 'ALL'
                ? `Base: ${formatCurrency(dailyPurchaseVal || totalPurchaseAll)}`
                : 'Material procurement cost'}
            </p>
          </div>

          <div className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200">
            <span className="text-xs font-bold text-emerald-900 block">DAILY EXPORT VALUE</span>
            <div className="text-2xl font-black text-emerald-900 font-mono mt-1 truncate">
              {dailyExportVal > 0 ? formatActive(dailyExportVal) : `${formatActive(totalExportAll)} (All)`}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {viewCurrency !== 'BDT' && viewCurrency !== 'ALL'
                ? `Base: ${formatCurrency(dailyExportVal || totalExportAll)}`
                : 'Total invoiced export goods'}
            </p>
          </div>

          <div className="bg-blue-50 p-3.5 rounded-lg border border-blue-200">
            <span className="text-xs font-bold text-blue-900 block">DAILY NET MARGIN / PROFIT</span>
            <div className="text-2xl font-black text-blue-900 font-mono mt-1 truncate">
              {dailyExportVal > 0
                ? formatActive(dailyPnlBdt.grossProfit)
                : formatActive(overallPnlBdt.grossProfit)}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Margin: {dailyExportVal > 0 ? dailyPnlBdt.marginPercentage : overallPnlBdt.marginPercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Cumulative Profit & Loss Calculation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* P&L Statement Grid (7 cols or 12 if ALL) */}
        <div className={`${viewCurrency === 'ALL' ? 'lg:col-span-8' : 'lg:col-span-7'} bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden`}>
          <div className="bg-[#12284c] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>FINANCIAL PROFIT &amp; LOSS STATEMENT (ALL TIME)</span>
            </span>
            <span className="text-emerald-300 font-mono text-[11px]">
              Net Profit: {formatActive(overallPnlBdt.grossProfit)}
            </span>
          </div>
          <div className="p-4 space-y-3">
            {viewCurrency === 'ALL' ? (
              /* Multi-Currency Comparative Table */
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 font-bold">
                      <th className="p-2 text-left border">Particulars</th>
                      <th className="p-2 text-right border bg-emerald-50 text-emerald-900">BDT (TK)</th>
                      <th className="p-2 text-right border bg-blue-50 text-blue-900">USD ($)</th>
                      <th className="p-2 text-right border bg-amber-50 text-amber-900">RMB (¥)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono">
                    <tr>
                      <td className="p-2 border font-medium font-sans">Gross Export Revenue</td>
                      <td className="p-2 border text-right font-bold text-emerald-700">
                        {formatCurrencyWithSymbol(overallMultiPnl.bdt.exportRevenue, 'BDT')}
                      </td>
                      <td className="p-2 border text-right text-blue-700">
                        {formatCurrencyWithSymbol(overallMultiPnl.usd.exportRevenue, 'USD')}
                      </td>
                      <td className="p-2 border text-right text-amber-800">
                        {formatCurrencyWithSymbol(overallMultiPnl.rmb.exportRevenue, 'RMB')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium font-sans">Return RMB (Export Settlement)</td>
                      <td className="p-2 border text-right font-bold text-blue-700">
                        {formatCurrencyWithSymbol(overallMultiPnl.bdt.returnRmb, 'BDT')}
                      </td>
                      <td className="p-2 border text-right text-blue-700">
                        {formatCurrencyWithSymbol(overallMultiPnl.usd.returnRmb, 'USD')}
                      </td>
                      <td className="p-2 border text-right text-amber-800">
                        {formatCurrencyWithSymbol(overallMultiPnl.rmb.returnRmb, 'RMB')}
                      </td>
                    </tr>
                    <tr className="bg-blue-50/50 font-bold">
                      <td className="p-2 border font-sans">Total Realized Revenue</td>
                      <td className="p-2 border text-right text-blue-950 font-black">
                        {formatCurrencyWithSymbol(overallMultiPnl.bdt.totalRevenue, 'BDT')}
                      </td>
                      <td className="p-2 border text-right text-blue-950 font-black">
                        {formatCurrencyWithSymbol(overallMultiPnl.usd.totalRevenue, 'USD')}
                      </td>
                      <td className="p-2 border text-right text-blue-950 font-black">
                        {formatCurrencyWithSymbol(overallMultiPnl.rmb.totalRevenue, 'RMB')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium font-sans text-pink-900">Total Purchase Costs</td>
                      <td className="p-2 border text-right font-bold text-pink-700">
                        - {formatCurrencyWithSymbol(overallMultiPnl.bdt.purchaseCost, 'BDT')}
                      </td>
                      <td className="p-2 border text-right font-bold text-pink-700">
                        - {formatCurrencyWithSymbol(overallMultiPnl.usd.purchaseCost, 'USD')}
                      </td>
                      <td className="p-2 border text-right font-bold text-pink-700">
                        - {formatCurrencyWithSymbol(overallMultiPnl.rmb.purchaseCost, 'RMB')}
                      </td>
                    </tr>
                    <tr className="bg-emerald-100 font-black text-sm">
                      <td className="p-2.5 border font-sans text-emerald-950">GROSS PROFIT / LOSS</td>
                      <td className="p-2.5 border text-right text-emerald-950 font-mono">
                        {formatCurrencyWithSymbol(overallMultiPnl.bdt.grossProfit, 'BDT')}
                      </td>
                      <td className="p-2.5 border text-right text-emerald-950 font-mono">
                        {formatCurrencyWithSymbol(overallMultiPnl.usd.grossProfit, 'USD')}
                      </td>
                      <td className="p-2.5 border text-right text-emerald-950 font-mono">
                        {formatCurrencyWithSymbol(overallMultiPnl.rmb.grossProfit, 'RMB')}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="p-2 border font-sans">Profit Margin %</td>
                      <td colSpan={3} className="p-2 border text-center font-mono text-emerald-800 text-sm">
                        {overallPnlBdt.marginPercentage}% (Gross Profit / Cost)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              /* Single Currency View */
              <table className="w-full text-xs border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 font-bold">
                    <th className="p-2 text-left border">Particulars</th>
                    <th className="p-2 text-right border">Calculation Formula</th>
                    <th className="p-2 text-right border">Amount ({viewCurrency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono">
                  <tr>
                    <td className="p-2 border font-medium font-sans">Gross Export Revenue</td>
                    <td className="p-2 border text-right text-gray-500">SUM(Packing DB Total Amount)</td>
                    <td className="p-2 border text-right font-bold text-emerald-700">
                      {formatActive(overallPnlBdt.exportRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium font-sans">Return RMB (Export Settlement)</td>
                    <td className="p-2 border text-right text-gray-500">SUM(Return RMB converted)</td>
                    <td className="p-2 border text-right font-bold text-blue-700">
                      {formatActive(overallPnlBdt.returnRmbBdt)}
                    </td>
                  </tr>
                  <tr className="bg-blue-50/50 font-bold">
                    <td className="p-2 border font-sans">Total Realized Revenue</td>
                    <td className="p-2 border text-right text-gray-500">Export + Return RMB</td>
                    <td className="p-2 border text-right text-blue-900">
                      {formatActive(overallPnlBdt.totalRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium font-sans text-pink-900">Total Purchase Costs</td>
                    <td className="p-2 border text-right text-gray-500">SUM(Purchase DB Total Amount)</td>
                    <td className="p-2 border text-right font-bold text-pink-700">
                      - {formatActive(overallPnlBdt.purchaseCost)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-100 font-black text-sm">
                    <td className="p-2.5 border font-sans text-emerald-950">GROSS PROFIT / LOSS</td>
                    <td className="p-2.5 border text-right text-emerald-900 font-sans text-xs">
                      Total Revenue &ndash; Purchase Cost
                    </td>
                    <td className="p-2.5 border text-right text-emerald-950 font-mono text-base">
                      {formatActive(overallPnlBdt.grossProfit)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="p-2 border font-sans">Profit Margin %</td>
                    <td className="p-2 border text-right text-gray-500">(Gross Profit / Purchase Cost) &times; 100</td>
                    <td className="p-2 border text-right font-mono text-emerald-800">
                      {overallPnlBdt.marginPercentage}%
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Document Search & Filter Box (5 cols or 4 if ALL) */}
        <div className={`${viewCurrency === 'ALL' ? 'lg:col-span-4' : 'lg:col-span-5'} bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden flex flex-col`}>
          <div className="bg-[#6b21a8] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>SEARCH BY DOCUMENTS &amp; ARCHIVE</span>
            <Search className="w-3.5 h-3.5" />
          </div>
          <div className="p-4 flex-1 space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search Invoice #, Shipping Mark, Flight, Supplier..."
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-600 focus:outline-none"
              />
              {docSearchQuery && (
                <button
                  onClick={() => setDocSearchQuery('')}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {searchResults ? (
              <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-gray-100 text-xs">
                {searchResults.purchases.length === 0 &&
                searchResults.packings.length === 0 &&
                searchResults.payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No matching documents found.</p>
                ) : (
                  <>
                    {searchResults.purchases.map((p) => (
                      <div
                        key={p.id}
                        onClick={() =>
                          setPreviewDoc({
                            type: 'purchase',
                            title: `Purchase #${p.invoiceNumber}`,
                            data: p,
                          })
                        }
                        className="py-2 flex items-center justify-between hover:bg-pink-50/50 px-2 rounded cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-pink-800">{p.invoiceNumber}</span>
                          <p className="text-[11px] text-gray-600">{p.description} &bull; {p.date}</p>
                        </div>
                        <span className="font-mono font-bold text-pink-700">
                          {formatActive(p.totalAmount)}
                        </span>
                      </div>
                    ))}
                    {searchResults.packings.map((p) => (
                      <div
                        key={p.id}
                        onClick={() =>
                          setPreviewDoc({
                            type: 'packing',
                            title: `Packing #${p.invoiceNumber}`,
                            data: p,
                          })
                        }
                        className="py-2 flex items-center justify-between hover:bg-amber-50/50 px-2 rounded cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-amber-800">{p.invoiceNumber}</span>
                          <p className="text-[11px] text-gray-600">
                            {p.shippingMark} &bull; {p.flight} &rarr; {p.destination}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-amber-700">
                          {p.totalWeight} KG
                        </span>
                      </div>
                    ))}
                    {searchResults.payments.map((p) => (
                      <div
                        key={p.id}
                        onClick={() =>
                          setPreviewDoc({
                            type: 'payment',
                            title: `Payment #${p.invoiceNumber}`,
                            data: p,
                          })
                        }
                        className="py-2 flex items-center justify-between hover:bg-purple-50/50 px-2 rounded cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-purple-800">{p.invoiceNumber}</span>
                            {p.currency && p.currency !== 'BDT' && (
                              <span className="bg-purple-100 text-purple-800 text-[9px] px-1 rounded font-bold">
                                {p.currency}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600">{p.description} &bull; {p.partyType}</p>
                        </div>
                        <span className="font-mono font-bold text-purple-700">
                          {formatActive(p.totalAmount)}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-xs py-4 text-center border border-dashed rounded p-4">
                Type an invoice #, shipping mark (e.g. <code>CHJ-22</code>), destination (e.g. <code>GUANGZHOU</code>), or flight (e.g. <code>CZ</code>) to preview document.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
