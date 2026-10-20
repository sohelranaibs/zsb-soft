import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  DollarSign,
  Calendar,
  ArrowRightLeft,
  History,
  CheckCircle2,
  ListFilter,
  Calculator,
  TrendingUp,
  HelpCircle,
  ExternalLink,
  Stamp,
  Sliders,
  Eye,
  RotateCw,
  RotateCcw,
  Compass,
  ShieldCheck,
  Type,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  DropdownSettings,
  DailyExchangeRates,
  CurrencyCode,
  WatermarkPosition,
  WatermarkSettings,
} from '../../types';
import {
  getEffectiveRates,
  convertCurrency,
  formatCurrencyWithSymbol,
  convertUsdToRmb,
} from '../../utils/currencyConversion';
import {
  DEFAULT_WATERMARK_SETTINGS,
  getWatermarkStyles,
} from '../../utils/watermark';

export const SettingsSheet: React.FC = () => {
  const {
    dropdowns,
    addDropdownOption,
    deleteDropdownOption,
    updateDailyRates,
    watermarkSettings,
    updateWatermarkSettings,
    resetAllToDefault,
    purchases,
    setPreviewDoc,
    showToast,
  } = useApp();

  const currentRates = getEffectiveRates(dropdowns.dailyRates, dropdowns.rmbExchangeRate);

  // Sub-tab: 'rates' | 'dropdowns' | 'calculator' | 'watermark'
  const [settingsTab, setSettingsTab] = useState<'rates' | 'dropdowns' | 'calculator' | 'watermark'>('watermark');

  // Daily Exchange Rates Form State
  const [rateDate, setRateDate] = useState(currentRates.date || new Date().toISOString().split('T')[0]);
  const [usdToRmb, setUsdToRmb] = useState<string>(String(currentRates.usdToRmb || 7.24));
  const [rmbToBdt, setRmbToBdt] = useState<string>(String(currentRates.rmbToBdt || 16.85));
  const [usdToBdt, setUsdToBdt] = useState<string>(String(currentRates.usdToBdt || 122.00));
  const [autoDeriveUsdBdt, setAutoDeriveUsdBdt] = useState(true);
  const [rateNotes, setRateNotes] = useState(currentRates.notes || 'Daily export settlement benchmark');

  // Live Calculator State
  const [calcAmount, setCalcAmount] = useState<number | ''>(1000);
  const [calcSourceCurrency, setCalcSourceCurrency] = useState<CurrencyCode>('USD');

  // Dropdown Manager State
  const [activeCategory, setActiveCategory] = useState<keyof DropdownSettings>('purchaseDescriptions');
  const [newOptionInput, setNewOptionInput] = useState('');

  // Watermark Customization State
  const [wmText, setWmText] = useState(watermarkSettings.text || 'ZSB AQUATICS');
  const [wmEnabled, setWmEnabled] = useState(watermarkSettings.enabled ?? true);
  const [wmPosition, setWmPosition] = useState<WatermarkPosition>(watermarkSettings.position || 'center');
  const [wmOpacity, setWmOpacity] = useState<number>(watermarkSettings.opacity ?? 0.12);
  const [wmRotation, setWmRotation] = useState<number>(watermarkSettings.rotationAngle ?? -35);
  const [wmFontSize, setWmFontSize] = useState<number>(watermarkSettings.fontSize ?? 56);
  const [wmColor, setWmColor] = useState<string>(watermarkSettings.color || '#12284c');

  const handleSaveWatermark = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateWatermarkSettings({
      text: wmText.trim() || 'ZSB AQUATICS',
      enabled: wmEnabled,
      position: wmPosition,
      opacity: Number(wmOpacity),
      rotationAngle: Number(wmRotation),
      fontSize: Number(wmFontSize),
      color: wmColor,
    });
  };

  const handleApplyWatermarkPreset = (preset: {
    label: string;
    position: WatermarkPosition;
    opacity: number;
    rotation: number;
    fontSize: number;
    color?: string;
  }) => {
    setWmPosition(preset.position);
    setWmOpacity(preset.opacity);
    setWmRotation(preset.rotation);
    setWmFontSize(preset.fontSize);
    if (preset.color) setWmColor(preset.color);
    showToast(`Applied preset: ${preset.label}`);
  };

  const handleResetWatermark = () => {
    setWmText(DEFAULT_WATERMARK_SETTINGS.text);
    setWmEnabled(DEFAULT_WATERMARK_SETTINGS.enabled);
    setWmPosition(DEFAULT_WATERMARK_SETTINGS.position);
    setWmOpacity(DEFAULT_WATERMARK_SETTINGS.opacity);
    setWmRotation(DEFAULT_WATERMARK_SETTINGS.rotationAngle);
    setWmFontSize(DEFAULT_WATERMARK_SETTINGS.fontSize);
    setWmColor(DEFAULT_WATERMARK_SETTINGS.color);
    updateWatermarkSettings(DEFAULT_WATERMARK_SETTINGS);
    showToast('Reset watermark to default branding settings');
  };

  const handleTestInPreviewModal = () => {
    const sample = purchases[0] || {
      id: 'PUR-DEMO',
      invoiceNumber: 'INV-2026-DEMO',
      date: new Date().toISOString().split('T')[0],
      description: 'ZSB Fresh Tiger Catch',
      contactNumber: '+880 1712-345678',
      totalQty: 240,
      totalAmount: 185000,
      previousAmount: 15000,
      paidAmount: 150000,
      balance: 50000,
      items: [
        { id: '1', item: 'Fresh Tiger Shrimp (F1)', quantity: 120, rate: 850 },
        { id: '2', item: 'White Pomfret (M)', quantity: 80, rate: 650 },
        { id: '3', item: 'Mud Crab Grade A (XXL)', quantity: 40, rate: 780 },
      ],
    };
    setPreviewDoc({
      type: 'purchase',
      title: `Sample Invoice #${sample.invoiceNumber} (Live Watermark Test)`,
      data: sample,
    });
  };

  const categories: { key: keyof DropdownSettings; label: string; count: number }[] = [
    { key: 'purchaseDescriptions', label: 'Purchase Descriptions', count: dropdowns.purchaseDescriptions.length },
    { key: 'shippingMarks', label: 'Shipping Marks', count: dropdowns.shippingMarks.length },
    { key: 'flights', label: 'Flights', count: dropdowns.flights.length },
    { key: 'destinations', label: 'Destinations', count: dropdowns.destinations.length },
    { key: 'shippers', label: 'Shippers', count: dropdowns.shippers.length },
    { key: 'items', label: 'Items / Grades', count: dropdowns.items.length },
    { key: 'boxes', label: 'Boxes', count: dropdowns.boxes.length },
    { key: 'weights', label: 'Weights (KG)', count: dropdowns.weights.length },
    { key: 'suppliersAndExporters', label: 'Suppliers & Exporters', count: dropdowns.suppliersAndExporters.length },
  ];

  const handleUsdToRmbChange = (val: string) => {
    setUsdToRmb(val);
    const numUsdRmb = parseFloat(val);
    const numRmbBdt = parseFloat(rmbToBdt);
    if (autoDeriveUsdBdt && !isNaN(numUsdRmb) && !isNaN(numRmbBdt)) {
      setUsdToBdt((Math.round(numUsdRmb * numRmbBdt * 100) / 100).toFixed(2));
    }
  };

  const handleRmbToBdtChange = (val: string) => {
    setRmbToBdt(val);
    const numUsdRmb = parseFloat(usdToRmb);
    const numRmbBdt = parseFloat(val);
    if (autoDeriveUsdBdt && !isNaN(numUsdRmb) && !isNaN(numRmbBdt)) {
      setUsdToBdt((Math.round(numUsdRmb * numRmbBdt * 100) / 100).toFixed(2));
    }
  };

  const handleSaveRates = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const uRmb = parseFloat(usdToRmb);
    const rBdt = parseFloat(rmbToBdt);
    const uBdt = parseFloat(usdToBdt);

    if (isNaN(uRmb) || uRmb <= 0 || isNaN(rBdt) || rBdt <= 0) {
      alert('Please enter valid, positive exchange rates.');
      return;
    }

    const calculatedUsdBdt = !isNaN(uBdt) && uBdt > 0 ? uBdt : Math.round(uRmb * rBdt * 100) / 100;

    updateDailyRates({
      date: rateDate,
      usdToRmb: uRmb,
      rmbToBdt: rBdt,
      usdToBdt: calculatedUsdBdt,
      notes: rateNotes,
    });
  };

  const handleApplyPreset = (uRmb: number, rBdt: number, label: string) => {
    setUsdToRmb(String(uRmb));
    setRmbToBdt(String(rBdt));
    const derived = Math.round(uRmb * rBdt * 100) / 100;
    setUsdToBdt(String(derived));
    setRateNotes(`Preset: ${label}`);
    showToast(`Loaded ${label} preset`);
  };

  const handleAddDropdown = () => {
    if (!newOptionInput.trim()) return;
    addDropdownOption(activeCategory, newOptionInput.trim());
    setNewOptionInput('');
  };

  const currentOptions = (dropdowns[activeCategory] as string[]) || [];

  // Calculator conversions
  const calcNum = Number(calcAmount) || 0;
  const convertedUsd = convertCurrency(calcNum, calcSourceCurrency, 'USD', currentRates);
  const convertedRmb = convertCurrency(calcNum, calcSourceCurrency, 'RMB', currentRates);
  const convertedBdt = convertCurrency(calcNum, calcSourceCurrency, 'BDT', currentRates);

  return (
    <div className="p-3 md:p-5 max-w-[1500px] mx-auto space-y-5">
      {/* Top Banner */}
      <div className="bg-[#12284c] text-white rounded-lg px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-yellow-400" />
          <div>
            <h2 className="text-base md:text-lg font-black tracking-wide flex items-center space-x-2">
              <span>SETTINGS &amp; DAILY CURRENCY EXCHANGE CENTER</span>
              <span className="bg-emerald-600/80 text-emerald-100 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-normal">
                Multi-Currency Active
              </span>
            </h2>
            <p className="text-[11px] text-blue-200">
              Set daily exchange rates (USD &harr; RMB &harr; BDT) for Payment &amp; Profit/Loss modules and manage dropdown choices
            </p>
          </div>
        </div>

        {/* Live Active Rates Pill Bar */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="bg-white/10 border border-white/20 px-2.5 py-1 rounded font-mono text-[11px] flex items-center space-x-1.5">
            <span className="text-yellow-300 font-bold">1 USD</span>
            <span className="text-white/60">&rarr;</span>
            <span className="text-white font-bold">{currentRates.usdToRmb} RMB</span>
          </div>
          <div className="bg-white/10 border border-white/20 px-2.5 py-1 rounded font-mono text-[11px] flex items-center space-x-1.5">
            <span className="text-yellow-300 font-bold">1 RMB</span>
            <span className="text-white/60">&rarr;</span>
            <span className="text-white font-bold">{currentRates.rmbToBdt} TK</span>
          </div>
          <div className="bg-white/10 border border-white/20 px-2.5 py-1 rounded font-mono text-[11px] flex items-center space-x-1.5">
            <span className="text-yellow-300 font-bold">1 USD</span>
            <span className="text-white/60">&rarr;</span>
            <span className="text-emerald-300 font-bold">{currentRates.usdToBdt} TK</span>
          </div>
          <button
            onClick={() => {
              if (confirm('Reset entire system database and dropdown lists to original demo state?')) {
                resetAllToDefault();
              }
            }}
            className="bg-red-700/80 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition shadow-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-gray-300 space-x-2 bg-white px-4 pt-2 rounded-t-lg shadow-xs">
        <button
          onClick={() => setSettingsTab('rates')}
          className={`pb-2.5 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition cursor-pointer ${
            settingsTab === 'rates'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Daily Exchange Rates (USD &harr; RMB &harr; BDT)</span>
        </button>

        <button
          onClick={() => setSettingsTab('calculator')}
          className={`pb-2.5 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition cursor-pointer ${
            settingsTab === 'calculator'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Calculator className="w-4 h-4 text-purple-600" />
          <span>Live Currency Converter Tool</span>
        </button>

        <button
          onClick={() => setSettingsTab('dropdowns')}
          className={`pb-2.5 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition cursor-pointer ${
            settingsTab === 'dropdowns'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ListFilter className="w-4 h-4 text-amber-600" />
          <span>Dropdown Lists &amp; Master Data ({categories.length})</span>
        </button>

        <button
          onClick={() => setSettingsTab('watermark')}
          className={`pb-2.5 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition cursor-pointer ${
            settingsTab === 'watermark'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Stamp className="w-4 h-4 text-indigo-600" />
          <span>PDF Watermark &amp; Branding</span>
          {wmEnabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1 inline-block" title="Watermark active"></span>
          )}
        </button>
      </div>

      {/* TAB 1: DAILY EXCHANGE RATES */}
      {settingsTab === 'rates' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Rate Editor (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
              <div className="bg-[#0f2549] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  <span>SET DAILY EXCHANGE RATES</span>
                </span>
                <span className="text-[11px] text-blue-200 font-mono">
                  Active for: {currentRates.date}
                </span>
              </div>

              <form onSubmit={handleSaveRates} className="p-4 space-y-4">
                {/* Rate Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Effective Rate Date</span>
                  </label>
                  <input
                    type="date"
                    value={rateDate}
                    onChange={(e) => setRateDate(e.target.value)}
                    className="w-full sm:w-64 bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs font-mono font-bold text-gray-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Rates configured here will be applied to Payment entries, Return RMB settlements, and Profit &amp; Loss conversions for this date.
                  </p>
                </div>

                {/* Primary Currencies Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  {/* USD to RMB */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                        <span>1 USD ($) &rarr; RMB (¥)</span>
                      </span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
                        US Dollar / Yuan
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-500">¥</span>
                      <input
                        type="number"
                        step="0.001"
                        min="0.1"
                        placeholder="7.24"
                        value={usdToRmb}
                        onChange={(e) => handleUsdToRmbChange(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded px-2.5 py-1.5 text-sm font-mono font-bold text-amber-950 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-gray-600">
                      Standard Chinese Yuan conversion for overseas buyer contracts
                    </p>
                  </div>

                  {/* RMB to BDT */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 flex items-center space-x-1">
                        <span>1 RMB (¥) &rarr; BDT (TK)</span>
                      </span>
                      <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-mono font-bold">
                        Yuan / Taka
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-500">TK</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        placeholder="16.85"
                        value={rmbToBdt}
                        onChange={(e) => handleRmbToBdtChange(e.target.value)}
                        className="w-full bg-white border border-blue-300 rounded px-2.5 py-1.5 text-sm font-mono font-bold text-blue-950 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-gray-600">
                      Export Return RMB settlement rate into local Bangladeshi Taka
                    </p>
                  </div>
                </div>

                {/* USD to BDT (Triangulated or Direct) */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-emerald-950">
                        1 USD ($) &rarr; BDT (TK)
                      </span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">
                        Triangulated / Direct
                      </span>
                    </div>
                    <label className="flex items-center space-x-1.5 text-[11px] text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoDeriveUsdBdt}
                        onChange={(e) => {
                          setAutoDeriveUsdBdt(e.target.checked);
                          if (e.target.checked) {
                            const uRmb = parseFloat(usdToRmb) || 7.24;
                            const rBdt = parseFloat(rmbToBdt) || 16.85;
                            setUsdToBdt((Math.round(uRmb * rBdt * 100) / 100).toFixed(2));
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Auto-calculate (USD/RMB &times; RMB/BDT)</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-500">TK</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      placeholder="122.00"
                      value={usdToBdt}
                      onChange={(e) => {
                        setUsdToBdt(e.target.value);
                        setAutoDeriveUsdBdt(false);
                      }}
                      className="w-full sm:w-64 bg-white border border-emerald-300 rounded px-2.5 py-1.5 text-sm font-mono font-bold text-emerald-950 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-xs text-gray-500 font-mono">
                      ({usdToRmb} &times; {rmbToBdt} = {(Number(usdToRmb) * Number(rmbToBdt)).toFixed(2)} TK)
                    </span>
                  </div>
                </div>

                {/* Rate Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Rate Reference / Market Source
                  </label>
                  <input
                    type="text"
                    value={rateNotes}
                    onChange={(e) => setRateNotes(e.target.value)}
                    placeholder="e.g. Bangladesh Bank & PBoC daily benchmark..."
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[11px] font-bold text-gray-600 block mb-1.5">
                    Quick Rate Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(7.24, 16.85, 'Market Standard')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] px-2.5 py-1 rounded border border-gray-300 font-mono cursor-pointer transition"
                    >
                      Market Standard (7.24 / 16.85)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(7.23, 16.80, 'Bank Official')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] px-2.5 py-1 rounded border border-gray-300 font-mono cursor-pointer transition"
                    >
                      Bank Official (7.23 / 16.80)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(7.28, 17.00, 'Hedge / Peak Rate')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] px-2.5 py-1 rounded border border-gray-300 font-mono cursor-pointer transition"
                    >
                      Hedge Rate (7.28 / 17.00)
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Auto-syncs across Payment Vouchers &amp; P&amp;L Statements</span>
                  </span>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer transition"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Save Daily Exchange Rates</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Quick Summary & Rate History (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Live Conversion Preview Card */}
              <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
                <div className="bg-[#6b21a8] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-yellow-300" />
                    <span>LIVE CONVERSION TESTER</span>
                  </span>
                  <span className="text-[10px] text-purple-200 font-mono">Real-time formula</span>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-32 bg-white border border-gray-300 rounded px-2.5 py-1 font-mono font-bold text-gray-800"
                    />
                    <select
                      value={calcSourceCurrency}
                      onChange={(e) => setCalcSourceCurrency(e.target.value as CurrencyCode)}
                      className="bg-gray-100 border border-gray-300 rounded px-2 py-1 font-bold text-gray-700"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="RMB">RMB (¥)</option>
                      <option value="BDT">BDT (TK)</option>
                    </select>
                    <span className="text-gray-500 font-medium">equals:</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-gray-50 border border-gray-200 p-2.5 rounded text-center">
                      <span className="text-[10px] text-gray-500 block font-bold">USD ($)</span>
                      <span className="font-mono font-bold text-blue-900 text-sm block mt-0.5">
                        ${convertedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-center">
                      <span className="text-[10px] text-amber-800 block font-bold">RMB (¥)</span>
                      <span className="font-mono font-bold text-amber-950 text-sm block mt-0.5">
                        ¥{convertedRmb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded text-center">
                      <span className="text-[10px] text-emerald-800 block font-bold">BDT (TK)</span>
                      <span className="font-mono font-bold text-emerald-950 text-sm block mt-0.5 truncate">
                        TK {convertedBdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate History Log Table */}
              <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b font-bold text-xs uppercase text-gray-700 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <History className="w-3.5 h-3.5 text-blue-600" />
                    <span>DAILY EXCHANGE RATE HISTORY</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {dropdowns.rateHistory?.length || 0} recorded
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 text-xs">
                  {(!dropdowns.rateHistory || dropdowns.rateHistory.length === 0) ? (
                    <p className="text-gray-500 text-center py-4 text-xs">No historical rates recorded yet.</p>
                  ) : (
                    dropdowns.rateHistory.map((hist, idx) => (
                      <div key={idx} className="p-2.5 hover:bg-blue-50/40 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-gray-800">{hist.date}</span>
                            {hist.date === currentRates.date && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 rounded font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-[200px]">
                            {hist.notes || 'Benchmark rate'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-[11px] text-gray-700">
                            1 USD = <strong className="text-amber-800">{hist.usdToRmb}</strong> RMB | 1 RMB = <strong className="text-blue-800">{hist.rmbToBdt}</strong> TK
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setRateDate(hist.date);
                              setUsdToRmb(String(hist.usdToRmb));
                              setRmbToBdt(String(hist.rmbToBdt));
                              setUsdToBdt(String(hist.usdToBdt));
                              setRateNotes(hist.notes || '');
                              showToast(`Loaded rates for ${hist.date}`);
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            Load into form
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE CURRENCY CONVERTER CALCULATOR */}
      {settingsTab === 'calculator' && (
        <div className="bg-white rounded-lg border border-gray-300 shadow-xs p-6 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-gray-900 flex items-center justify-center space-x-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span>INTERACTIVE CURRENCY CONVERTER</span>
            </h3>
            <p className="text-xs text-gray-500">
              Instant triangular conversion between US Dollars (USD), Chinese Yuan (RMB), and Bangladeshi Taka (BDT)
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Enter Amount:</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-purple-300 rounded px-3 py-2 text-base font-mono font-bold text-purple-950 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  placeholder="e.g. 5000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">From Currency:</label>
                <select
                  value={calcSourceCurrency}
                  onChange={(e) => setCalcSourceCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-white border border-purple-300 rounded px-3 py-2 text-sm font-bold text-gray-800 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="USD">USD - United States Dollar ($)</option>
                  <option value="RMB">RMB - Chinese Yuan (¥)</option>
                  <option value="BDT">BDT - Bangladeshi Taka (TK)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-purple-200">
              <span className="text-xs font-bold text-purple-900 block mb-2">
                Equivalent Value at Today's Benchmark ({currentRates.date}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border-2 border-blue-400 p-3 rounded-lg text-center shadow-xs">
                  <span className="text-[11px] font-bold text-blue-900 block">UNITED STATES DOLLAR</span>
                  <span className="text-lg font-mono font-black text-blue-950 mt-1 block">
                    {formatCurrencyWithSymbol(convertedUsd, 'USD')}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">1 USD = {currentRates.usdToRmb} RMB</span>
                </div>

                <div className="bg-white border-2 border-amber-400 p-3 rounded-lg text-center shadow-xs">
                  <span className="text-[11px] font-bold text-amber-900 block">CHINESE YUAN</span>
                  <span className="text-lg font-mono font-black text-amber-950 mt-1 block">
                    {formatCurrencyWithSymbol(convertedRmb, 'RMB')}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">1 RMB = {currentRates.rmbToBdt} TK</span>
                </div>

                <div className="bg-white border-2 border-emerald-400 p-3 rounded-lg text-center shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-900 block">BANGLADESHI TAKA</span>
                  <span className="text-lg font-mono font-black text-emerald-950 mt-1 block truncate">
                    {formatCurrencyWithSymbol(convertedBdt, 'BDT')}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">1 USD = {currentRates.usdToBdt} TK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DROPDOWNS & MASTER DATA */}
      {settingsTab === 'dropdowns' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Category Selector (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
            <div className="bg-gray-100 px-4 py-2.5 border-b font-bold text-xs uppercase text-gray-700">
              DROPDOWN CATEGORIES
            </div>
            <div className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    activeCategory === cat.key
                      ? 'bg-blue-50 text-blue-800 font-bold border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-mono">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Category Item Editor (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden flex flex-col">
            <div className="bg-[#12284c] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>
                MANAGE {categories.find((c) => c.key === activeCategory)?.label} ({currentOptions.length})
              </span>
            </div>

            {/* Add New Item Form */}
            <div className="p-4 bg-gray-50 border-b flex space-x-2">
              <input
                type="text"
                placeholder={`Add new option to ${categories.find((c) => c.key === activeCategory)?.label}...`}
                value={newOptionInput}
                onChange={(e) => setNewOptionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddDropdown();
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={handleAddDropdown}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            </div>

            {/* Items Grid */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {currentOptions.map((opt) => (
                  <div
                    key={opt}
                    className="bg-gray-50 border border-gray-200 rounded p-2 flex items-center justify-between hover:bg-blue-50/50 hover:border-blue-200 group transition"
                  >
                    <span className="font-medium text-gray-800 truncate mr-1" title={opt}>
                      {opt}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${opt}" from ${String(activeCategory)}?`)) {
                          deleteDropdownOption(activeCategory, opt);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 p-1 rounded opacity-60 group-hover:opacity-100 transition cursor-pointer"
                      title={`Delete ${opt}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PDF WATERMARK & BRANDING */}
      {settingsTab === 'watermark' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Controls Column (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
              <div className="bg-[#0f2549] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Stamp className="w-4 h-4 text-yellow-400" />
                  <span>PDF WATERMARK &amp; BRAND PROTECTION SETTINGS</span>
                </span>
                <span className="text-[11px] text-blue-200 font-mono">
                  Applies to all generated invoices &amp; packing lists
                </span>
              </div>

              <div className="p-4 space-y-5">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-blue-950 block">Enable PDF Document Watermark</span>
                    <p className="text-[11px] text-blue-800/80">
                      Print and display dynamic brand watermark on all invoices, packing lists, and batch statements
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWmEnabled(!wmEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      wmEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                        wmEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Watermark Text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 flex items-center justify-between">
                    <span>Watermark Text / Brand Name</span>
                    <span className="text-[11px] text-gray-400 font-normal">Default: ZSB AQUATICS</span>
                  </label>
                  <div className="relative">
                    <Type className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={wmText}
                      onChange={(e) => setWmText(e.target.value)}
                      placeholder="e.g. ZSB AQUATICS"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold uppercase tracking-wider"
                    />
                  </div>
                </div>

                {/* Position Configuration */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                      <Compass className="w-3.5 h-3.5 text-blue-700" />
                      <span>Watermark Position on Document</span>
                    </label>
                    <span className="text-[11px] font-mono text-blue-700 font-bold uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Current: {wmPosition}
                    </span>
                  </div>

                  {/* 3x3 Grid Position Selector */}
                  <div className="grid grid-cols-3 gap-2 max-w-md mx-auto p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {[
                      { id: 'top-left' as WatermarkPosition, label: 'Top Left (↖)' },
                      { id: 'top-center' as WatermarkPosition, label: 'Top Center (↑)' },
                      { id: 'top-right' as WatermarkPosition, label: 'Top Right (↗)' },
                      { id: 'center' as WatermarkPosition, label: 'Center (Default ⦿)' },
                      { id: 'bottom-left' as WatermarkPosition, label: 'Bottom Left (↙)' },
                      { id: 'bottom-center' as WatermarkPosition, label: 'Bottom Center (↓)' },
                      { id: 'bottom-right' as WatermarkPosition, label: 'Bottom Right (↘)' },
                    ].map((pos) => {
                      const isSelected = wmPosition === pos.id;
                      const isCenter = pos.id === 'center';
                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setWmPosition(pos.id)}
                          className={`py-2 px-2.5 rounded text-[11px] font-bold border transition cursor-pointer flex flex-col items-center justify-center text-center ${
                            isCenter ? 'col-span-3 py-2.5' : ''
                          } ${
                            isSelected
                              ? 'bg-[#12284c] text-white border-[#091b38] shadow-sm ring-2 ring-blue-400'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50/70 hover:border-blue-300'
                          }`}
                        >
                          <span>{pos.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-gray-700 flex items-center space-x-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-700" />
                      <span>Opacity / Transparency Level</span>
                    </label>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
                      {Math.round(wmOpacity * 100)}% ({wmOpacity.toFixed(2)})
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.02"
                    max="0.40"
                    step="0.01"
                    value={wmOpacity}
                    onChange={(e) => setWmOpacity(parseFloat(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer h-2 bg-gray-200 rounded-lg"
                  />

                  {/* Opacity quick presets */}
                  <div className="flex items-center space-x-2 pt-1 text-[11px]">
                    <span className="text-gray-500 text-[10px]">Quick:</span>
                    {[
                      { val: 0.05, label: '5% (Faint)' },
                      { val: 0.10, label: '10% (Subtle)' },
                      { val: 0.12, label: '12% (Default)' },
                      { val: 0.20, label: '20% (Clear)' },
                      { val: 0.30, label: '30% (Prominent)' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setWmOpacity(p.val)}
                        className={`px-2 py-0.5 rounded border text-[10px] cursor-pointer transition ${
                          Math.abs(wmOpacity - p.val) < 0.005
                            ? 'bg-blue-700 text-white border-blue-700 font-bold'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rotation Angle Slider */}
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-gray-700 flex items-center space-x-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-blue-700" />
                      <span>Rotation Angle</span>
                    </label>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
                      {wmRotation}&deg; {wmRotation === 0 ? '(Horizontal)' : wmRotation < 0 ? '(Diagonal)' : '(Reverse)'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="5"
                    value={wmRotation}
                    onChange={(e) => setWmRotation(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-700 cursor-pointer h-2 bg-gray-200 rounded-lg"
                  />

                  {/* Rotation angle quick presets */}
                  <div className="flex items-center flex-wrap gap-1.5 pt-1 text-[11px]">
                    <span className="text-gray-500 text-[10px]">Presets:</span>
                    {[
                      { val: 0, label: '0° Horizontal' },
                      { val: -35, label: '-35° Standard' },
                      { val: -45, label: '-45° Diagonal' },
                      { val: 45, label: '+45° Reverse' },
                      { val: 90, label: '90° Vertical' },
                    ].map((r) => (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => setWmRotation(r.val)}
                        className={`px-2 py-0.5 rounded border text-[10px] cursor-pointer transition ${
                          wmRotation === r.val
                            ? 'bg-blue-700 text-white border-blue-700 font-bold'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size & Brand Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Font Size */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-gray-700">Watermark Font Size</label>
                      <span className="font-mono text-gray-600 font-bold text-xs">{wmFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="96"
                      step="2"
                      value={wmFontSize}
                      onChange={(e) => setWmFontSize(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-700 cursor-pointer h-2 bg-gray-200 rounded-lg"
                    />
                  </div>

                  {/* Brand Color Swatches */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">Brand Color</label>
                    <div className="flex items-center space-x-2">
                      {[
                        { hex: '#12284c', label: 'ZSB Navy' },
                        { hex: '#1e293b', label: 'Slate' },
                        { hex: '#1d4ed8', label: 'Royal' },
                        { hex: '#0f766e', label: 'Teal' },
                        { hex: '#831843', label: 'Crimson' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setWmColor(c.hex)}
                          className={`w-7 h-7 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                            wmColor === c.hex ? 'border-yellow-400 ring-2 ring-blue-500 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pre-packaged One-Click Combinations */}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <label className="block text-xs font-bold text-gray-700">Quick Branding Presets</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyWatermarkPreset({
                          label: 'Standard Center Diagonal',
                          position: 'center',
                          opacity: 0.12,
                          rotation: -35,
                          fontSize: 56,
                          color: '#12284c',
                        })
                      }
                      className="p-2 border border-gray-200 bg-gray-50 hover:bg-blue-50/60 rounded text-[11px] text-left cursor-pointer transition"
                    >
                      <strong className="block text-blue-900">Standard Diagonal</strong>
                      <span className="text-[10px] text-gray-500">Center • 12% • -35°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleApplyWatermarkPreset({
                          label: 'Horizontal Stamp',
                          position: 'center',
                          opacity: 0.10,
                          rotation: 0,
                          fontSize: 60,
                          color: '#12284c',
                        })
                      }
                      className="p-2 border border-gray-200 bg-gray-50 hover:bg-blue-50/60 rounded text-[11px] text-left cursor-pointer transition"
                    >
                      <strong className="block text-blue-900">Center Stamp</strong>
                      <span className="text-[10px] text-gray-500">Center • 10% • 0°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleApplyWatermarkPreset({
                          label: 'Top-Right Security Stamp',
                          position: 'top-right',
                          opacity: 0.15,
                          rotation: -20,
                          fontSize: 38,
                          color: '#12284c',
                        })
                      }
                      className="p-2 border border-gray-200 bg-gray-50 hover:bg-blue-50/60 rounded text-[11px] text-left cursor-pointer transition"
                    >
                      <strong className="block text-blue-900">Top-Right Corner</strong>
                      <span className="text-[10px] text-gray-500">Corner • 15% • -20°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleApplyWatermarkPreset({
                          label: 'High-Security Diagonal',
                          position: 'center',
                          opacity: 0.08,
                          rotation: -45,
                          fontSize: 72,
                          color: '#1e293b',
                        })
                      }
                      className="p-2 border border-gray-200 bg-gray-50 hover:bg-blue-50/60 rounded text-[11px] text-left cursor-pointer transition"
                    >
                      <strong className="block text-blue-900">High Security</strong>
                      <span className="text-[10px] text-gray-500">Large • 8% • -45°</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSaveWatermark}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm transition active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Watermark Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetWatermark}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition border border-gray-300"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestInPreviewModal}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 px-3 py-2 rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition"
                    title="Open Document Preview modal to test print/PDF output with real records"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Test on Real Invoice</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Preview Column (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
                <div className="bg-[#12284c] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>LIVE DOCUMENT WATERMARK PREVIEW</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500 text-gray-950 font-bold px-2 py-0.5 rounded">
                    REAL-TIME SYNC
                  </span>
                </div>

                <div className="p-4 bg-slate-100 flex flex-col items-center justify-center">
                  {/* Miniature Simulated A4 Invoice Document */}
                  <div
                    className="w-full max-w-[420px] bg-white rounded shadow-md border border-gray-300 p-5 relative overflow-hidden select-none"
                    style={{ minHeight: '460px' }}
                  >
                    {/* The Live Interactive Watermark Overlay */}
                    {wmEnabled ? (
                      <div
                        className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center z-10"
                        aria-hidden="true"
                      >
                        <div
                          className="font-black tracking-widest uppercase transition-all duration-150"
                          style={getWatermarkStyles({
                            text: wmText,
                            enabled: wmEnabled,
                            position: wmPosition,
                            opacity: wmOpacity,
                            rotationAngle: wmRotation,
                            fontSize: Math.round(wmFontSize * 0.75), // Scaled down for miniature container
                            color: wmColor,
                          })}
                        >
                          {wmText || 'ZSB AQUATICS'}
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <span className="bg-gray-100/90 text-gray-500 text-xs px-3 py-1 rounded border border-gray-300 font-mono">
                          Watermark Disabled
                        </span>
                      </div>
                    )}

                    {/* Simulated Document Content */}
                    <div className="opacity-90 pointer-events-none">
                      {/* Company Header */}
                      <div className="border-b-2 border-[#12284c] pb-2 mb-3 flex justify-between items-start">
                        <div>
                          <div className="text-base font-black text-[#12284c] tracking-tight">ZSB AQUATICS</div>
                          <div className="text-[9px] font-semibold text-gray-600 uppercase">
                            Exporters of Quality Aquatic Products
                          </div>
                          <div className="text-[8px] text-gray-500">Dhaka &bull; Khulna &bull; Chittagong &bull; HSIA Air Hub</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-mono font-bold bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded block text-blue-900">
                            INV-2026-001
                          </span>
                          <span className="text-[8px] text-gray-500 block mt-0.5">Date: 2026-10-18</span>
                        </div>
                      </div>

                      {/* Lot Summary */}
                      <div className="bg-pink-50/70 border border-pink-200 rounded p-1.5 mb-3 grid grid-cols-2 gap-1.5 text-[9px]">
                        <div>
                          <span className="text-gray-500 block">Lot Description:</span>
                          <strong className="text-gray-800">Fresh Tiger Catch Lot A</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500 block">Invoice Total:</span>
                          <strong className="text-pink-800">TK 185,000</strong>
                        </div>
                      </div>

                      {/* Sample Table */}
                      <table className="w-full text-[9px] border border-gray-200 mb-3">
                        <thead className="bg-[#831843] text-white">
                          <tr>
                            <th className="p-1 text-left border">SL</th>
                            <th className="p-1 text-left border">Item</th>
                            <th className="p-1 text-right border">Qty</th>
                            <th className="p-1 text-right border">Rate</th>
                            <th className="p-1 text-right border">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="p-1 border text-center">1</td>
                            <td className="p-1 border font-medium">Tiger Shrimp F1</td>
                            <td className="p-1 border text-right font-mono">120</td>
                            <td className="p-1 border text-right font-mono">850</td>
                            <td className="p-1 border text-right font-mono font-bold">102,000</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="p-1 border text-center">2</td>
                            <td className="p-1 border font-medium">Pomfret White (M)</td>
                            <td className="p-1 border text-right font-mono">80</td>
                            <td className="p-1 border text-right font-mono">650</td>
                            <td className="p-1 border text-right font-mono font-bold">52,000</td>
                          </tr>
                          <tr>
                            <td className="p-1 border text-center">3</td>
                            <td className="p-1 border font-medium">Mud Crab (XXL)</td>
                            <td className="p-1 border text-right font-mono">40</td>
                            <td className="p-1 border text-right font-mono">780</td>
                            <td className="p-1 border text-right font-mono font-bold">31,200</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100 font-bold">
                            <td colSpan={2} className="p-1 border text-right">TOTAL:</td>
                            <td className="p-1 border text-right font-mono">240</td>
                            <td className="p-1 border"></td>
                            <td className="p-1 border text-right font-mono text-pink-700">185,000</td>
                          </tr>
                        </tfoot>
                      </table>

                      {/* Balance box */}
                      <div className="bg-gray-50 border border-gray-200 rounded p-1.5 ml-auto w-44 text-[8px] space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Paid:</span>
                          <span className="font-mono text-emerald-700">TK 150,000</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-0.5">
                          <span className="text-gray-700">Net Due:</span>
                          <span className="font-mono text-pink-700">TK 35,000</span>
                        </div>
                      </div>

                      {/* Signatures */}
                      <div className="mt-6 pt-3 border-t border-gray-300 grid grid-cols-2 gap-4 text-center text-[8px] text-gray-500">
                        <div>
                          <div className="border-b border-gray-400 pb-0.5 mb-0.5 mx-2"></div>
                          <span>Prepared By</span>
                        </div>
                        <div>
                          <div className="border-b border-gray-400 pb-0.5 mb-0.5 mx-2"></div>
                          <span>Authorized Signatory</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges readout */}
                  <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-mono text-gray-600 bg-white p-2.5 rounded border border-gray-200">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      Pos: <strong className="text-blue-900">{wmPosition}</strong>
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      Opacity: <strong className="text-indigo-900">{Math.round(wmOpacity * 100)}%</strong>
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      Angle: <strong className="text-purple-900">{wmRotation}&deg;</strong>
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      Size: <strong className="text-gray-900">{wmFontSize}px</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
