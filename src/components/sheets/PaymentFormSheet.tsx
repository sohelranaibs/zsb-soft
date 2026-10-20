import React, { useState, useEffect } from 'react';
import {
  Save,
  FileText,
  Search,
  Trash2,
  Printer,
  Plus,
  ArrowRight,
  CreditCard,
  DollarSign,
  ArrowRightLeft,
  RefreshCw,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DropdownSelect } from '../DropdownSelect';
import { PaymentLineItem, PaymentRecord, CurrencyCode } from '../../types';
import { calculatePaymentTotals, formatCurrency } from '../../utils/calculations';
import {
  getEffectiveRates,
  convertCurrency,
  formatCurrencyWithSymbol,
  calculateReturnRmbFromUsd,
} from '../../utils/currencyConversion';

export const PaymentFormSheet: React.FC = () => {
  const { payments, addPayment, setActiveTab, setPreviewDoc, showToast, dropdowns } = useApp();

  const currentRates = getEffectiveRates(dropdowns.dailyRates, dropdowns.rmbExchangeRate);

  const nextVoucherNo = `VCH-2026-${String(payments.length + 1).padStart(3, '0')}`;

  const [invoiceNumber, setInvoiceNumber] = useState(nextVoucherNo);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [partyType, setPartyType] = useState<'Supplier' | 'Exporter' | 'Return RMB'>('Supplier');
  const [description, setDescription] = useState('ABDULLAH VAI');
  const [contactNumber, setContactNumber] = useState('');
  const [searchDesc, setSearchDesc] = useState('');

  // Voucher Currency & Exchange Rate State
  const [voucherCurrency, setVoucherCurrency] = useState<CurrencyCode>('BDT');
  const [customUsdToRmb, setCustomUsdToRmb] = useState<number>(currentRates.usdToRmb);
  const [customRmbToBdt, setCustomRmbToBdt] = useState<number>(currentRates.rmbToBdt);
  const [customUsdToBdt, setCustomUsdToBdt] = useState<number>(currentRates.usdToBdt);

  // Return RMB / Overseas Settlement specific fields
  const [returnRmbMode, setReturnRmbMode] = useState<'direct_rmb' | 'usd_to_rmb'>('direct_rmb');
  const [contractUsdAmount, setContractUsdAmount] = useState<number | ''>('');
  const [rmbAmount, setRmbAmount] = useState<number | ''>('');
  const [exchangeRate, setExchangeRate] = useState<number>(currentRates.rmbToBdt);
  const [linkedDoc, setLinkedDoc] = useState('');

  // Sync rates when dropdown daily rates change
  useEffect(() => {
    setCustomUsdToRmb(currentRates.usdToRmb);
    setCustomRmbToBdt(currentRates.rmbToBdt);
    setCustomUsdToBdt(currentRates.usdToBdt);
    setExchangeRate(currentRates.rmbToBdt);
  }, [dropdowns.dailyRates, dropdowns.rmbExchangeRate]);

  // Initial 8 rows
  const initialRows: PaymentLineItem[] = Array.from({ length: 8 }, (_, i) => ({
    id: String(i + 1),
    description: '',
    debitAmount: '',
    creditAmount: '',
    balance: 0,
    currency: 'BDT',
  }));

  const [rows, setRows] = useState<PaymentLineItem[]>(initialRows);
  const [previousAmount, setPreviousAmount] = useState<number | ''>('');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');

  // When USD to RMB conversion in Return RMB mode is active
  const usdReturnCalc = calculateReturnRmbFromUsd(
    Number(contractUsdAmount) || 0,
    customUsdToRmb,
    customRmbToBdt
  );

  // Keep rmbAmount synced if in usd_to_rmb mode
  const effectiveRmbAmount =
    returnRmbMode === 'usd_to_rmb' && Number(contractUsdAmount) > 0
      ? usdReturnCalc.rmbAmount
      : Number(rmbAmount) || 0;

  const convertedBdt =
    returnRmbMode === 'usd_to_rmb' && Number(contractUsdAmount) > 0
      ? usdReturnCalc.bdtAmount
      : effectiveRmbAmount * (Number(exchangeRate) || currentRates.rmbToBdt);

  const handleRowChange = (index: number, field: keyof PaymentLineItem, val: any) => {
    setRows((prev) => {
      const copy = [...prev];
      const updated = { ...copy[index], [field]: val };

      const debit = Number(field === 'debitAmount' ? val : updated.debitAmount) || 0;
      const credit = Number(field === 'creditAmount' ? val : updated.creditAmount) || 0;
      updated.balance = debit - credit;

      copy[index] = updated;
      return copy;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        description: '',
        debitAmount: '',
        creditAmount: '',
        balance: 0,
        currency: voucherCurrency,
      },
    ]);
  };

  // Raw totals as entered in the voucher currency
  const rawTotals = calculatePaymentTotals(
    rows.map((r) => ({
      ...r,
      debitAmount: Number(r.debitAmount) || 0,
      creditAmount: Number(r.creditAmount) || 0,
    })),
    Number(previousAmount) || 0,
    Number(paidAmount) || 0
  );

  // Converted to local BDT (TK) for accounting consistency
  const activeRateObj = {
    date,
    usdToRmb: customUsdToRmb,
    rmbToBdt: customRmbToBdt,
    usdToBdt: customUsdToBdt,
  };

  const totalAmountBdt =
    partyType === 'Return RMB' || Number(effectiveRmbAmount) > 0
      ? convertedBdt
      : convertCurrency(rawTotals.totalAmount, voucherCurrency, 'BDT', activeRateObj);

  const handleResetToTodayRates = () => {
    setCustomUsdToRmb(currentRates.usdToRmb);
    setCustomRmbToBdt(currentRates.rmbToBdt);
    setCustomUsdToBdt(currentRates.usdToBdt);
    setExchangeRate(currentRates.rmbToBdt);
    showToast("Reset to Settings' daily exchange rates");
  };

  const handleClear = () => {
    if (window.confirm('Clear all fields in Payment Data Entry Form?')) {
      setDescription('');
      setContactNumber('');
      setRmbAmount('');
      setContractUsdAmount('');
      setLinkedDoc('');
      setRows(initialRows);
      setPreviousAmount('');
      setPaidAmount('');
      setVoucherCurrency('BDT');
      showToast('Payment form cleared');
    }
  };

  const handleSavePDF = () => {
    const validItems = rows.filter(
      (r) => r.description || Number(r.debitAmount) > 0 || Number(r.creditAmount) > 0
    );

    if (!description && validItems.length === 0 && !effectiveRmbAmount && !contractUsdAmount) {
      alert('Please select a Supplier/Exporter Description and enter line details.');
      return;
    }

    const returnRmbData =
      partyType === 'Return RMB' || Number(effectiveRmbAmount) > 0
        ? {
            rmbAmount: effectiveRmbAmount,
            exchangeRate: Number(exchangeRate) || customRmbToBdt,
            bdtAmount: convertedBdt,
            linkedExportDocument: linkedDoc || 'PL-2026-001',
            usdAmount: returnRmbMode === 'usd_to_rmb' ? Number(contractUsdAmount) || undefined : undefined,
            usdToRmbRate: returnRmbMode === 'usd_to_rmb' ? customUsdToRmb : undefined,
          }
        : undefined;

    const conversionDetails =
      voucherCurrency !== 'BDT' || returnRmbMode === 'usd_to_rmb'
        ? {
            originalCurrency: returnRmbMode === 'usd_to_rmb' ? ('USD' as CurrencyCode) : voucherCurrency,
            originalAmount:
              returnRmbMode === 'usd_to_rmb'
                ? Number(contractUsdAmount) || 0
                : rawTotals.totalAmount,
            usdToRmbRate: customUsdToRmb,
            rmbToBdtRate: customRmbToBdt,
            usdToBdtRate: customUsdToBdt,
            convertedRmb:
              returnRmbMode === 'usd_to_rmb'
                ? effectiveRmbAmount
                : convertCurrency(rawTotals.totalAmount, voucherCurrency, 'RMB', activeRateObj),
            convertedBdt: totalAmountBdt,
          }
        : undefined;

    const newRecord: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      invoiceNumber: invoiceNumber || nextVoucherNo,
      date,
      partyType,
      description: description || 'General Party',
      contactNumber,
      currency: voucherCurrency,
      conversionDetails,
      items:
        validItems.length > 0
          ? validItems
          : [
              {
                id: '1',
                description:
                  partyType === 'Return RMB'
                    ? returnRmbMode === 'usd_to_rmb'
                      ? `Export Settlement ($${contractUsdAmount} USD @ ${customUsdToRmb} = ¥${effectiveRmbAmount} RMB)`
                      : `Export Return RMB settlement (${linkedDoc || 'Export lot'})`
                    : 'Payment transaction',
                debitAmount: totalAmountBdt || 10000,
                creditAmount: 0,
                balance: totalAmountBdt || 10000,
                currency: voucherCurrency,
                originalAmount: rawTotals.totalAmount || undefined,
              },
            ],
      totalAmount: totalAmountBdt,
      previousAmount: Number(previousAmount) || 0,
      paidAmount: Number(paidAmount) || totalAmountBdt,
      balance: rawTotals.balance,
      returnRmb: returnRmbData,
      createdAt: new Date().toISOString(),
    };

    addPayment(newRecord);

    setPreviewDoc({
      type: 'payment',
      title: `Payment Voucher #${newRecord.invoiceNumber}`,
      data: newRecord,
    });

    setInvoiceNumber(`VCH-2026-${String(payments.length + 2).padStart(3, '0')}`);
    setRows(initialRows);
    setRmbAmount('');
    setContractUsdAmount('');
    setPaidAmount('');
    showToast('Saved to Payment DB and generated PDF');
  };

  const handleMonthlyStatement = () => {
    setPreviewDoc({
      type: 'monthly_statement',
      title: `Monthly Payment & Ledger Statement - ${description || 'All Parties'}`,
      data: {
        description,
        partyType,
        contactNumber,
        payments: payments.filter((p) => !description || p.description === description),
      },
    });
    showToast('Generated Monthly Statement PDF');
  };

  const handlePrintSelected = () => {
    window.print();
  };

  return (
    <div className="p-3 md:p-5 max-w-[1500px] mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-[#12284c] text-white rounded-lg px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-black text-yellow-400">ZSB AQUATICS</span>
          <span className="text-gray-400 font-light">|</span>
          <span className="text-sm md:text-base font-bold text-white tracking-wide">
            SUPPLIER &amp; EXPORTER PAYMENT SYSTEM
          </span>
          <span className="hidden sm:inline-block bg-purple-700/80 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
            Multi-Currency Engine
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-blue-200">Daily Rate:</span>
          <span className="bg-white/10 px-2 py-0.5 rounded font-mono text-[11px] font-bold text-yellow-300">
            1 USD = {currentRates.usdToRmb} RMB | 1 RMB = {currentRates.rmbToBdt} TK
          </span>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-xs text-blue-300 hover:text-white underline cursor-pointer"
          >
            Adjust Rates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Main Form Left (8 cols) */}
        <div className="xl:col-span-8 bg-white rounded-lg border-2 border-purple-800 shadow-sm flex flex-col">
          {/* Header Card */}
          <div className="bg-[#581c87] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-yellow-400" />
              <span>SUPPLIER &amp; EXPORTER PAYMENT &ndash; DATA ENTRY VOUCHER</span>
            </span>
            <span className="text-xs font-mono font-normal text-purple-200">
              VOUCHER NO: {invoiceNumber}
            </span>
          </div>

          {/* Form Meta Controls */}
          <div className="p-4 bg-purple-50/40 border-b border-purple-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <label className="font-bold text-gray-800 w-32 shrink-0">INVOICE NUMBER</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="font-bold text-gray-800 w-24 shrink-0">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="font-bold text-gray-800 w-32 shrink-0">DESCRIPTION</label>
              <div className="w-full">
                <DropdownSelect
                  category="suppliersAndExporters"
                  value={description}
                  onChange={setDescription}
                  placeholder="Select Supplier / Exporter (Abdullah Vai, Uzzal Vai, Napal Vai)..."
                  selectClassName="border-purple-300"
                  showInlineButtons={true}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="font-bold text-gray-800 w-24 shrink-0">Contact Number:</label>
              <input
                type="text"
                placeholder="+880 1..."
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            {/* Payment Category selector */}
            <div className="col-span-1 md:col-span-2 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-200 text-xs">
              <div className="flex items-center space-x-4">
                <span className="font-bold text-purple-900">Payment Category:</span>
                {(['Supplier', 'Exporter', 'Return RMB'] as const).map((type) => (
                  <label key={type} className="flex items-center space-x-1.5 cursor-pointer font-medium text-gray-700">
                    <input
                      type="radio"
                      name="partyType"
                      checked={partyType === type}
                      onChange={() => setPartyType(type)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>
                      {type === 'Return RMB' ? 'Return RMB / Overseas Settlement' : `${type} Payment`}
                    </span>
                  </label>
                ))}
              </div>

              {/* Voucher Currency Selector */}
              <div className="flex items-center space-x-1.5 bg-white border border-purple-300 rounded px-2 py-1">
                <Coins className="w-3.5 h-3.5 text-purple-700" />
                <span className="font-bold text-gray-700 text-[11px]">Voucher Currency:</span>
                {(['BDT', 'USD', 'RMB'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setVoucherCurrency(curr)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                      voucherCurrency === curr
                        ? 'bg-purple-700 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {curr === 'BDT' ? 'BDT (TK)' : curr === 'USD' ? 'USD ($)' : 'RMB (¥)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Currency Conversion Details Bar (if foreign currency voucher) */}
          {voucherCurrency !== 'BDT' && (
            <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold text-amber-950">
                    FOREIGN CURRENCY VOUCHER ({voucherCurrency}):
                  </span>
                  <p className="text-[11px] text-amber-800">
                    Amounts entered in {voucherCurrency} will be automatically converted to BDT (TK) using daily rates.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 font-mono text-[11px]">
                {voucherCurrency === 'USD' ? (
                  <>
                    <span className="bg-white border border-amber-300 px-2 py-1 rounded">
                      1 USD = <strong className="text-amber-950">{customUsdToRmb}</strong> RMB
                    </span>
                    <span className="bg-white border border-amber-300 px-2 py-1 rounded">
                      1 USD = <strong className="text-emerald-800">{customUsdToBdt}</strong> TK
                    </span>
                  </>
                ) : (
                  <span className="bg-white border border-amber-300 px-2 py-1 rounded">
                    1 RMB = <strong className="text-emerald-800">{customRmbToBdt}</strong> TK
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetToTodayRates}
                  className="text-amber-800 hover:text-amber-950 underline text-[10px] cursor-pointer"
                  title="Reset to rates set in Settings sheet"
                >
                  Sync Settings
                </button>
              </div>
            </div>
          )}

          {/* Special Feature: Return RMB on Base of Export Goods / International Remittance */}
          {partyType === 'Return RMB' && (
            <div className="p-3.5 bg-blue-50 border-b border-blue-200 text-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-bold text-blue-900 flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>RETURN RMB &amp; USD CURRENCY SETTLEMENT ENGINE</span>
                </h4>
                {/* Conversion Mode Toggle */}
                <div className="flex items-center space-x-1 bg-white border border-blue-300 rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => setReturnRmbMode('direct_rmb')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                      returnRmbMode === 'direct_rmb'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Direct RMB (¥) &rarr; BDT
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnRmbMode('usd_to_rmb')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                      returnRmbMode === 'usd_to_rmb'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    USD ($) &rarr; RMB (¥) &rarr; BDT
                  </button>
                </div>
              </div>

              {/* Mode 1: USD to RMB Conversion Flow */}
              {returnRmbMode === 'usd_to_rmb' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {/* Step 1: USD Amount */}
                    <div className="bg-white p-2 border border-blue-300 rounded-md">
                      <label className="block text-[11px] font-bold text-blue-900 mb-0.5">
                        1. Contract / Remit USD ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 2000"
                        value={contractUsdAmount}
                        onChange={(e) =>
                          setContractUsdAmount(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full bg-blue-50/50 border border-blue-200 rounded px-2 py-1 font-mono font-bold text-blue-950 focus:bg-white focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-500">Overseas buyer contract</span>
                    </div>

                    {/* Step 2: USD to RMB Rate */}
                    <div className="bg-white p-2 border border-blue-300 rounded-md">
                      <label className="block text-[11px] font-bold text-amber-900 mb-0.5">
                        2. USD &rarr; RMB Rate (¥)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={customUsdToRmb}
                        onChange={(e) => setCustomUsdToRmb(Number(e.target.value) || 7.24)}
                        className="w-full bg-amber-50/50 border border-amber-200 rounded px-2 py-1 font-mono font-bold text-amber-950 focus:bg-white focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-500">1 USD = {customUsdToRmb} RMB</span>
                    </div>

                    {/* Step 3: Resulting RMB Amount */}
                    <div className="bg-white p-2 border border-blue-300 rounded-md">
                      <label className="block text-[11px] font-bold text-amber-900 mb-0.5">
                        3. Converted RMB (¥)
                      </label>
                      <div className="bg-amber-100/60 border border-amber-300 rounded px-2 py-1 font-mono font-black text-amber-950 text-sm">
                        ¥ {usdReturnCalc.rmbAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-gray-500">${contractUsdAmount || 0} &times; {customUsdToRmb}</span>
                    </div>

                    {/* Step 4: RMB to BDT Rate */}
                    <div className="bg-white p-2 border border-blue-300 rounded-md">
                      <label className="block text-[11px] font-bold text-emerald-900 mb-0.5">
                        4. RMB &rarr; BDT Rate (TK)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={customRmbToBdt}
                        onChange={(e) => {
                          setCustomRmbToBdt(Number(e.target.value) || 16.85);
                          setExchangeRate(Number(e.target.value) || 16.85);
                        }}
                        className="w-full bg-emerald-50/50 border border-emerald-200 rounded px-2 py-1 font-mono font-bold text-emerald-950 focus:bg-white focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-500">1 RMB = {customRmbToBdt} TK</span>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="bg-emerald-100/60 border border-emerald-300 p-2.5 rounded-md flex flex-wrap items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-emerald-950">
                        Total Converted BDT: {formatCurrency(usdReturnCalc.bdtAmount)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 font-mono text-[11px] text-emerald-900">
                      <span>Effective Rate: 1 USD = <strong>{usdReturnCalc.effectiveUsdToBdtRate} TK</strong></span>
                      <input
                        type="text"
                        placeholder="Linked Packing # (e.g. PL-2026-001)"
                        value={linkedDoc}
                        onChange={(e) => setLinkedDoc(e.target.value)}
                        className="bg-white border border-emerald-300 rounded px-2 py-0.5 text-xs font-mono font-normal text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode 2: Direct RMB to BDT Flow */
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Return RMB Amount (¥)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      value={rmbAmount}
                      onChange={(e) =>
                        setRmbAmount(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full bg-white border border-blue-300 rounded px-2 py-1 font-mono font-bold text-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Daily RMB Rate (TK)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(Number(e.target.value) || 16.85)}
                      className="w-full bg-white border border-blue-300 rounded px-2 py-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Converted BDT (TK)
                    </label>
                    <div className="bg-white border border-blue-300 rounded px-2 py-1 font-mono font-bold text-emerald-700">
                      {formatCurrency(convertedBdt)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Export Packing / Bill Doc #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PL-2026-001"
                      value={linkedDoc}
                      onChange={(e) => setLinkedDoc(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded px-2 py-1 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Table: DESCRIPTION | DEBIT AMOUNT | CREDIT AMOUNT | BALANCE matching Screenshot 4 */}
          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-xs border border-gray-300">
              <thead>
                <tr className="bg-[#6b21a8] text-white font-bold text-center">
                  <th className="p-2 border border-purple-900 w-72 text-left">DESCRIPTION</th>
                  <th className="p-2 border border-purple-900 w-36">
                    DEBIT AMOUNT ({voucherCurrency})
                  </th>
                  <th className="p-2 border border-purple-900 w-36">
                    CREDIT AMOUNT ({voucherCurrency})
                  </th>
                  <th className="p-2 border border-purple-900 w-36">
                    BALANCE ({voucherCurrency})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-purple-50/40">
                    <td className="p-1 border border-gray-300">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                        placeholder="Particulars / invoice details..."
                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800 focus:outline-none"
                      />
                    </td>
                    <td className="p-1 border border-gray-300">
                      <input
                        type="number"
                        min="0"
                        value={row.debitAmount}
                        onChange={(e) =>
                          handleRowChange(idx, 'debitAmount', e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full text-right px-2 py-1 bg-white border border-gray-200 rounded focus:bg-purple-50 focus:outline-none text-blue-700 font-semibold"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-1 border border-gray-300">
                      <input
                        type="number"
                        min="0"
                        value={row.creditAmount}
                        onChange={(e) =>
                          handleRowChange(idx, 'creditAmount', e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full text-right px-2 py-1 bg-white border border-gray-200 rounded focus:bg-purple-50 focus:outline-none text-emerald-700 font-semibold"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-1 border border-gray-300 text-right px-2 font-bold text-purple-900 bg-gray-50/50">
                      {row.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {/* Total Row */}
                <tr className="bg-[#6b21a8] text-white font-bold">
                  <td className="p-2 border border-purple-900 text-left font-sans">
                    TOTAL AMOUNT ({voucherCurrency}):
                  </td>
                  <td className="p-2 border border-purple-900 text-right font-mono text-yellow-300">
                    {formatCurrencyWithSymbol(rawTotals.totalDebit, voucherCurrency)}
                  </td>
                  <td className="p-2 border border-purple-900 text-right font-mono text-yellow-300">
                    {formatCurrencyWithSymbol(rawTotals.totalCredit, voucherCurrency)}
                  </td>
                  <td className="p-2 border border-purple-900 text-right font-mono text-yellow-300">
                    {formatCurrencyWithSymbol(rawTotals.totalAmount, voucherCurrency)}
                  </td>
                </tr>

                {/* Converted BDT Total Row if foreign currency */}
                {voucherCurrency !== 'BDT' && (
                  <tr className="bg-[#4c1d95] text-white font-bold text-[11px]">
                    <td className="p-2 border border-purple-900 text-left font-sans text-yellow-200">
                      EQUIVALENT IN BANGLADESHI TAKA (BDT @ {voucherCurrency === 'USD' ? customUsdToBdt : customRmbToBdt} TK):
                    </td>
                    <td className="p-2 border border-purple-900 text-right font-mono text-emerald-300">
                      {formatCurrency(convertCurrency(rawTotals.totalDebit, voucherCurrency, 'BDT', activeRateObj))}
                    </td>
                    <td className="p-2 border border-purple-900 text-right font-mono text-emerald-300">
                      {formatCurrency(convertCurrency(rawTotals.totalCredit, voucherCurrency, 'BDT', activeRateObj))}
                    </td>
                    <td className="p-2 border border-purple-900 text-right font-mono text-emerald-300 font-black">
                      {formatCurrency(totalAmountBdt)}
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>

            <div className="mt-2 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={handleAddRow}
                className="text-purple-700 hover:text-purple-900 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Insert Extra Ledger Row</span>
              </button>
            </div>
          </div>

          {/* Review Section */}
          <div className="p-3 bg-purple-50/50 border-t border-gray-300 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="font-bold text-gray-800 text-sm block">ACCOUNTING LEDGER SUMMARY</span>
                <p className="text-[11px] text-gray-500">
                  Transactions maintain double-entry balance and store currency conversion metadata for auditing.
                </p>
                {voucherCurrency !== 'BDT' && (
                  <div className="bg-white border border-purple-200 rounded p-2 text-[11px] space-y-0.5">
                    <span className="font-bold text-purple-900">Exchange Conversion:</span>
                    <p className="text-gray-700 font-mono">
                      {rawTotals.totalAmount} {voucherCurrency} &rarr; {formatCurrency(totalAmountBdt)}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">PREVIOUS AMOUNT:</span>
                  <input
                    type="number"
                    value={previousAmount}
                    onChange={(e) =>
                      setPreviousAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="0.00"
                    className="w-36 text-right px-2 py-1 bg-white border border-gray-300 rounded font-mono"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">PAID AMOUNT:</span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) =>
                      setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="0.00"
                    className="w-36 text-right px-2 py-1 bg-white border border-gray-300 rounded font-mono"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-gray-300 pt-1 font-bold text-sm">
                  <span className="text-gray-900">BALANCE:</span>
                  <span className="font-mono text-purple-900 text-base">
                    {rawTotals.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Controls (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          {/* Action Buttons */}
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-xs">
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 font-bold text-xs uppercase text-blue-900">
              ACTION BUTTONS
            </div>
            <div className="p-3 space-y-2.5">
              <button
                type="button"
                onClick={handleSavePDF}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition active:scale-[0.99]"
              >
                <Save className="w-5 h-5" />
                <span className="text-sm">SAVE (PDF)</span>
              </button>

              <button
                type="button"
                onClick={handleMonthlyStatement}
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition active:scale-[0.99]"
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs">MONTHLY STATEMENT (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('payment_db')}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition active:scale-[0.99]"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs">SEARCH PAYMENT DB</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition active:scale-[0.99]"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs">CLEAR</span>
              </button>

              <button
                type="button"
                onClick={handlePrintSelected}
                className="w-full bg-[#0891b2] hover:bg-[#0e7490] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition active:scale-[0.99]"
              >
                <Printer className="w-4 h-4" />
                <span className="text-xs">PRINT (Selected Cells)</span>
              </button>
            </div>
          </div>

          {/* Quick Rate Indicator Card */}
          <div className="bg-white rounded-lg border border-gray-300 p-3.5 shadow-xs space-y-2 text-xs">
            <h4 className="font-bold text-gray-800 uppercase flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>ACTIVE DAILY RATES FOR DATE: {date}</span>
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded p-2.5 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-600">USD &rarr; RMB:</span>
                <span className="font-bold text-amber-900">1 USD = {customUsdToRmb} RMB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RMB &rarr; BDT:</span>
                <span className="font-bold text-blue-900">1 RMB = {customRmbToBdt} TK</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1">
                <span className="text-gray-600">USD &rarr; BDT:</span>
                <span className="font-bold text-emerald-800">1 USD = {customUsdToBdt} TK</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-500">
              Need to update daily exchange rates? Change them globally in the Settings sheet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
