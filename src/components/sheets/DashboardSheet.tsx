import React from 'react';
import {
  CreditCard,
  PackageCheck,
  TrendingUp,
  ExternalLink,
  Clock,
  ArrowRight,
  Eye,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';

export const DashboardSheet: React.FC = () => {
  const {
    purchases,
    packings,
    payments,
    setActiveTab,
    setPreviewDoc,
    setIsBatchPrintOpen,
  } = useApp();

  const totalPurchaseValue = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalPackingValue = packings.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalWeight = packings.reduce((sum, p) => sum + (p.totalWeight || 0), 0);

  const latestPurchaseDate = purchases[0]?.date || 'None';
  const latestPaymentDate = payments[0]?.date || 'None';
  const latestPackingDate = packings[0]?.packingDate || 'None';

  // Combine recent activities
  const recentActivities = [
    ...purchases.map(p => ({
      id: p.id,
      type: 'Purchase',
      title: `Invoice #${p.invoiceNumber}`,
      subtitle: `${p.description} • ${p.totalQty} items`,
      date: p.date,
      amount: p.totalAmount,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      action: () => setPreviewDoc({ type: 'purchase', title: `Purchase Invoice #${p.invoiceNumber}`, data: p }),
    })),
    ...packings.map(p => ({
      id: p.id,
      type: 'Packing',
      title: `Packing List #${p.invoiceNumber}`,
      subtitle: `${p.shippingMark} • ${p.flight} &rarr; ${p.destination}`,
      date: p.packingDate,
      amount: p.totalAmount,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      action: () => setPreviewDoc({ type: 'packing', title: `Packing List #${p.invoiceNumber}`, data: p }),
    })),
    ...payments.map(p => ({
      id: p.id,
      type: 'Payment',
      title: `Voucher #${p.invoiceNumber}`,
      subtitle: `${p.description} (${p.partyType})`,
      date: p.date,
      amount: p.totalAmount,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      action: () => setPreviewDoc({ type: 'payment', title: `Payment Voucher #${p.invoiceNumber}`, data: p }),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Banner exactly from Image 1 with Batch Print button */}
      <div className="bg-[#12284c] text-white rounded-lg p-5 shadow-sm border border-blue-900/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-wide flex items-center gap-2">
            <span>ZSB AQUATICS</span>
            <span className="text-blue-300 font-light">|</span>
            <span className="font-extrabold text-white text-xl md:text-2xl">BUSINESS CONTROL CENTER</span>
          </h2>
          <p className="text-xs md:text-sm font-semibold tracking-wider text-blue-200 mt-1 uppercase">
            PURCHASE &bull; SUPPLIER PAYMENTS &bull; PACKING &amp; SHIPMENT RECORDS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsBatchPrintOpen(true)}
            className="bg-blue-700 hover:bg-blue-600 border border-blue-400 text-white px-3.5 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center space-x-2 cursor-pointer shadow-md transition active:scale-[0.98]"
            title="Batch print multiple selected records as a single PDF document for end-of-month reporting"
          >
            <Printer className="w-4 h-4" />
            <span>Batch Print (PDF)</span>
          </button>
        </div>
      </div>

      {/* 4 Formula KPI Cards matching Sheet 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Purchase Records Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition">
          <div className="bg-[#1d4ed8] text-white px-4 py-2 font-black text-xs uppercase tracking-wider">
            PURCHASE RECORDS
          </div>
          <div className="p-4">
            <div className="text-3xl font-black text-[#1d4ed8] font-mono">
              {purchases.length} Records
            </div>
            <p className="text-xs text-gray-500 mt-1">Updates as database records are added</p>
          </div>
        </div>

        {/* Payment Records Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition">
          <div className="bg-[#7c3aed] text-white px-4 py-2 font-black text-xs uppercase tracking-wider">
            PAYMENT RECORDS
          </div>
          <div className="p-4">
            <div className="text-3xl font-black text-[#7c3aed] font-mono">
              {payments.length} Records
            </div>
            <p className="text-xs text-gray-500 mt-1">Updates as database records are added</p>
          </div>
        </div>

        {/* Packing Records Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition">
          <div className="bg-[#0f766e] text-white px-4 py-2 font-black text-xs uppercase tracking-wider">
            PACKING RECORDS
          </div>
          <div className="p-4">
            <div className="text-3xl font-black text-[#0f766e] font-mono">
              {packings.length} Records
            </div>
            <p className="text-xs text-gray-500 mt-1">Updates as database records are added</p>
          </div>
        </div>

        {/* Purchase Value (TK) Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition">
          <div className="bg-[#ea580c] text-white px-4 py-2 font-black text-xs uppercase tracking-wider">
            PURCHASE VALUE (TK)
          </div>
          <div className="p-4">
            <div className="text-2xl font-black text-[#ea580c] font-mono truncate">
              {formatCurrency(totalPurchaseValue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Auto-sum from Purchase DB</p>
          </div>
        </div>
      </div>

      {/* Middle Row: Workspace Navigation & Live System Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Workspace Navigation Card */}
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-xs">
          <div className="bg-[#12284c] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>WORKSPACE NAVIGATION</span>
            <span className="text-[10px] text-blue-200 font-normal">Select active data entry form</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Purchase Form Button */}
            <button
              onClick={() => setActiveTab('purchase_form')}
              className="text-left p-4 rounded-lg border-2 border-blue-600 bg-blue-50/20 hover:bg-blue-50 hover:border-blue-700 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-bold text-sm tracking-wide">
                  PURCHASE FORM
                </span>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-gray-600 mt-1">Enter purchase invoices</p>
            </button>

            {/* Payment Form Button */}
            <button
              onClick={() => setActiveTab('payment_form')}
              className="text-left p-4 rounded-lg border-2 border-purple-600 bg-purple-50/20 hover:bg-purple-50 hover:border-purple-700 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-purple-700 font-bold text-sm tracking-wide">
                  PAYMENT FORM
                </span>
                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-gray-600 mt-1">Record debit / credit</p>
            </button>

            {/* Packing List Button */}
            <button
              onClick={() => setActiveTab('packing_form')}
              className="text-left p-4 rounded-lg border-2 border-orange-500 bg-orange-50/20 hover:bg-orange-50 hover:border-orange-600 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-orange-700 font-bold text-sm tracking-wide">
                  PACKING LIST
                </span>
                <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-gray-600 mt-1">Shipment &amp; weight details</p>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setActiveTab('settings')}
              className="text-left p-4 rounded-lg border-2 border-slate-500 bg-slate-50/30 hover:bg-slate-100 hover:border-slate-700 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-800 font-bold text-sm tracking-wide">
                  SETTINGS
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-gray-600 mt-1">Prefixes &amp; configuration</p>
            </button>
          </div>
        </div>

        {/* Live System Summary */}
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="bg-[#0f766e] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>LIVE SYSTEM SUMMARY</span>
              <span className="text-[10px] text-teal-100 font-normal">Real-time sync</span>
            </div>
            <div className="p-4">
              <table className="w-full text-xs border border-gray-200">
                <thead>
                  <tr className="bg-emerald-50 text-gray-700 font-bold">
                    <th className="p-2.5 text-left border-b border-gray-200">MODULE</th>
                    <th className="p-2.5 text-left border-b border-gray-200">RECORDS</th>
                    <th className="p-2.5 text-left border-b border-gray-200">LATEST DATE</th>
                    <th className="p-2.5 text-right border-b border-gray-200">OPEN SHEET</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="p-2.5 font-semibold text-gray-800">Purchases</td>
                    <td className="p-2.5 font-mono text-blue-700 font-bold">{purchases.length}</td>
                    <td className="p-2.5 text-gray-600">{latestPurchaseDate}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => setActiveTab('purchase_db')}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Purchase DB</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-2.5 font-semibold text-gray-800">Payments</td>
                    <td className="p-2.5 font-mono text-purple-700 font-bold">{payments.length}</td>
                    <td className="p-2.5 text-gray-600">{latestPaymentDate}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => setActiveTab('payment_db')}
                        className="text-purple-600 hover:text-purple-800 font-semibold inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Payment DB</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-2.5 font-semibold text-gray-800">Packing lists</td>
                    <td className="p-2.5 font-mono text-teal-700 font-bold">{packings.length}</td>
                    <td className="p-2.5 text-gray-600">{latestPackingDate}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => setActiveTab('packing_db')}
                        className="text-teal-600 hover:text-teal-800 font-semibold inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Packing DB</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[11px] text-gray-500 italic mt-3">
                Quick links open the matching workbook tab.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Database & Reports + Recommended Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Database & Reports */}
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-xs">
          <div className="bg-[#6b21a8] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider">
            DATABASE &amp; REPORTS
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={() => setActiveTab('purchase_db')}
              className="text-left p-3.5 bg-blue-50/40 hover:bg-blue-50 rounded-lg border border-blue-200 transition cursor-pointer"
            >
              <h4 className="font-bold text-blue-900 text-xs">PURCHASE DB</h4>
              <p className="text-[11px] text-gray-600 mt-0.5">Saved purchase records ({purchases.length})</p>
            </button>

            <button
              onClick={() => setActiveTab('payment_db')}
              className="text-left p-3.5 bg-purple-50/40 hover:bg-purple-50 rounded-lg border border-purple-200 transition cursor-pointer"
            >
              <h4 className="font-bold text-purple-900 text-xs">PAYMENT DB</h4>
              <p className="text-[11px] text-gray-600 mt-0.5">Saved payment records ({payments.length})</p>
            </button>

            <button
              onClick={() => setActiveTab('packing_db')}
              className="text-left p-3.5 bg-teal-50/40 hover:bg-teal-50 rounded-lg border border-teal-200 transition cursor-pointer"
            >
              <h4 className="font-bold text-teal-900 text-xs">PACKING DB</h4>
              <p className="text-[11px] text-gray-600 mt-0.5">Saved shipment records ({packings.length})</p>
            </button>

            <button
              onClick={() => setActiveTab('pnl_summary')}
              className="text-left p-3.5 bg-emerald-50/50 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition cursor-pointer"
            >
              <h4 className="font-bold text-emerald-900 text-xs">PROFIT &amp; LOSS &amp; SUMMARY</h4>
              <p className="text-[11px] text-gray-600 mt-0.5">Calculated margin &amp; daily export report</p>
            </button>

            {/* Batch Monthly Report Card */}
            <button
              onClick={() => setIsBatchPrintOpen(true)}
              className="text-left p-3.5 bg-indigo-50/60 hover:bg-indigo-100/70 rounded-lg border-2 border-indigo-300 transition cursor-pointer col-span-1 sm:col-span-2 flex items-center justify-between group"
            >
              <div>
                <h4 className="font-bold text-indigo-950 text-xs flex items-center space-x-1.5">
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>BATCH PRINT MULTIPLE RECORDS (END-OF-MONTH PDF)</span>
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Select and print multiple purchase, packing, and payment records into a single consolidated audit report
                </p>
              </div>
              <span className="bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-xs shrink-0 ml-2 group-hover:bg-indigo-800 transition">
                Open Batch Report &rarr;
              </span>
            </button>
          </div>
        </div>

        {/* Recommended Workflow */}
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-xs">
          <div className="bg-[#1d4ed8] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider">
            RECOMMENDED WORKFLOW
          </div>
          <div className="p-4 space-y-2.5 text-xs text-gray-700">
            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <span>Enter a record in the matching form.</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <span>Check calculated totals and dates in real time.</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                3
              </span>
              <span>Use <strong>Save (PDF)</strong> to archive the entry into the database and download/print challan.</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                4
              </span>
              <span>Search records or create monthly statements and daily summary reports.</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                5
              </span>
              <span>Review database tabs for saved records, edit or export to CSV.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Recent Activities Section */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-xs">
        <div className="bg-[#0f2e59] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span>RECENT ACTIVITIES PREVIEW (LIVE AUDIT TRAIL)</span>
          </div>
          <span className="text-[10px] text-blue-200">Latest 5 Database Transactions</span>
        </div>
        <div className="p-4">
          {recentActivities.length === 0 ? (
            <p className="text-xs text-gray-500 py-3 text-center">No recent activities found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-gray-50 px-2 rounded">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${act.badgeColor}`}>
                      {act.type}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900">{act.title}</div>
                      <div className="text-[11px] text-gray-500" dangerouslySetInnerHTML={{ __html: act.subtitle }} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500 font-mono text-[11px]">{act.date}</span>
                    <span className="font-mono font-bold text-gray-900">{formatCurrency(act.amount)}</span>
                    <button
                      onClick={act.action}
                      className="p-1 hover:bg-gray-200 text-blue-600 rounded cursor-pointer"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer note from screenshot */}
      <div className="text-center text-[11px] text-gray-500 pt-2 pb-4">
        Note: Apps Script actions must be installed in Google Sheets; Excel hyperlinks only navigate between tabs. &bull;{' '}
        <span className="font-bold text-gray-700">ZSB AQUATICS</span> &bull; Professional Dashboard Preview
      </div>
    </div>
  );
};
