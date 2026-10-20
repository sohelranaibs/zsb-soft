import React from 'react';
import { Printer, Settings, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';

interface ExcelHeaderProps {
  sheetTitle?: string;
  sheetSubtitle?: string;
}

export const ExcelHeader: React.FC<ExcelHeaderProps> = ({
  sheetTitle = 'ZSB AQUATICS | BUSINESS CONTROL CENTER',
  sheetSubtitle = 'PURCHASE • SUPPLIER PAYMENTS • PACKING & SHIPMENT RECORDS',
}) => {
  const {
    purchases,
    packings,
    payments,
    setActiveTab,
    setPreviewDoc,
    setIsBatchPrintOpen,
  } = useApp();

  const totalPurchaseValue = purchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalPackingValue = packings.reduce((acc, p) => acc + (p.totalAmount || 0), 0);

  const handlePrintWholeSheet = () => {
    window.print();
  };

  const handleOpenDailySummary = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayPurchases = purchases.filter(p => p.date === today);
    const todayPackings = packings.filter(p => p.packingDate === today);
    const todayPayments = payments.filter(p => p.date === today);

    setPreviewDoc({
      type: 'daily_summary',
      title: `Daily Summary Report - ${today}`,
      data: {
        date: today,
        purchases: todayPurchases.length > 0 ? todayPurchases : purchases.slice(0, 5),
        packings: todayPackings.length > 0 ? todayPackings : packings.slice(0, 5),
        payments: todayPayments.length > 0 ? todayPayments : payments.slice(0, 5),
      },
    });
  };

  return (
    <header className="bg-[#12284c] text-white border-b-2 border-[#091b38] select-none shadow-md">
      {/* Excel Title Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-wide text-white flex items-center gap-2">
            <span className="text-yellow-400 font-extrabold tracking-wider">ZSB AQUATICS</span>
            <span className="text-blue-300 font-light">|</span>
            <span className="text-white text-base md:text-xl font-bold tracking-tight">
              {sheetTitle.replace('ZSB AQUATICS | ', '')}
            </span>
          </h1>
          <p className="text-[11px] md:text-xs font-semibold tracking-wider text-blue-200 mt-0.5">
            {sheetSubtitle}
          </p>
        </div>

        {/* Top Action Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="bg-[#0b1b36] border border-blue-900/60 rounded px-2.5 py-1 text-blue-200 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px]">DB LIVE: {purchases.length + packings.length + payments.length} entries</span>
          </div>

          <button
            onClick={() => setIsBatchPrintOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/60 text-white px-2.5 py-1 rounded font-semibold flex items-center space-x-1 cursor-pointer transition shadow-xs"
            title="Batch print multiple selected records as a single PDF document for end-of-month reporting"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Batch Print (PDF)</span>
          </button>

          <button
            onClick={handleOpenDailySummary}
            className="bg-indigo-700 hover:bg-indigo-600 border border-indigo-500/50 text-white px-2.5 py-1 rounded font-semibold flex items-center space-x-1 cursor-pointer transition shadow-xs"
            title="View Daily Summary Report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Daily Report</span>
          </button>

          <button
            onClick={handlePrintWholeSheet}
            className="bg-teal-700 hover:bg-teal-600 border border-teal-500/50 text-white px-2.5 py-1 rounded font-semibold flex items-center space-x-1 cursor-pointer transition shadow-xs"
            title="Print entire sheet page"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-2.5 py-1 rounded font-medium flex items-center space-x-1 cursor-pointer transition shadow-xs"
            title="Configure settings and dropdown lists"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Excel Formula & Status Ribbon Bar */}
      <div className="bg-[#1b3a6b] px-4 py-1 flex items-center text-xs border-t border-blue-900/60 overflow-x-auto text-blue-100 font-mono">
        <div className="flex items-center space-x-2 shrink-0 pr-3 border-r border-blue-400/30">
          <span className="bg-[#0f2549] text-yellow-300 font-bold px-2 py-0.5 rounded text-[11px]">
            ACTIVE CELL [ A1 ]
          </span>
          <span className="font-serif italic font-bold text-amber-300">fx</span>
        </div>
        <div className="px-3 flex-1 text-[11px] truncate flex items-center space-x-4">
          <span>=SUM(PURCHASE_DB): <strong className="text-yellow-300 font-mono">{formatCurrency(totalPurchaseValue)}</strong></span>
          <span className="text-blue-300/40">•</span>
          <span>=SUM(PACKING_DB): <strong className="text-emerald-300 font-mono">{formatCurrency(totalPackingValue)}</strong></span>
          <span className="text-blue-300/40">•</span>
          <span>EXCEL FORMULAS &amp; MACROS: <strong className="text-green-300 font-semibold">ENABLED [ACTIVE]</strong></span>
        </div>
      </div>
    </header>
  );
};
