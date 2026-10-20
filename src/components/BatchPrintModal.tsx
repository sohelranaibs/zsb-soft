import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  CheckSquare,
  Square,
  FileText,
  PackageCheck,
  CreditCard,
  Layers,
  Filter,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateBatchSummary } from '../utils/batchPrint';
import { formatCurrency } from '../utils/calculations';
import { triggerCsvDownload } from '../utils/csvExport';
import { PurchaseRecord, PackingRecord, PaymentRecord } from '../types';
import { WatermarkOverlay } from './WatermarkOverlay';

interface BatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({ isOpen, onClose }) => {
  const { purchases, packings, payments, showToast } = useApp();

  const [activeView, setActiveView] = useState<'select' | 'preview'>('preview');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'purchase' | 'packing' | 'payment'>('all');

  // Track selected IDs for each module (initially select all in current month)
  const [selectedPurchaseIds, setSelectedPurchaseIds] = useState<Set<string>>(() => {
    return new Set(purchases.map((p) => p.id));
  });
  const [selectedPackingIds, setSelectedPackingIds] = useState<Set<string>>(() => {
    return new Set(packings.map((p) => p.id));
  });
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<Set<string>>(() => {
    return new Set(payments.map((p) => p.id));
  });

  // Filtered lists based on month
  const monthPurchases = useMemo(() => {
    if (!selectedMonth) return purchases;
    return purchases.filter((p) => p.date.startsWith(selectedMonth));
  }, [purchases, selectedMonth]);

  const monthPackings = useMemo(() => {
    if (!selectedMonth) return packings;
    return packings.filter((p) => p.packingDate.startsWith(selectedMonth));
  }, [packings, selectedMonth]);

  const monthPayments = useMemo(() => {
    if (!selectedMonth) return payments;
    return payments.filter((p) => p.date.startsWith(selectedMonth));
  }, [payments, selectedMonth]);

  // Selected records matching filter
  const activeSelectedPurchases = useMemo(() => {
    return monthPurchases.filter((p) => selectedPurchaseIds.has(p.id));
  }, [monthPurchases, selectedPurchaseIds]);

  const activeSelectedPackings = useMemo(() => {
    return monthPackings.filter((p) => selectedPackingIds.has(p.id));
  }, [monthPackings, selectedPackingIds]);

  const activeSelectedPayments = useMemo(() => {
    return monthPayments.filter((p) => selectedPaymentIds.has(p.id));
  }, [monthPayments, selectedPaymentIds]);

  // Calculated totals for selected records
  const batchTotals = useMemo(() => {
    return calculateBatchSummary(
      activeSelectedPurchases,
      activeSelectedPackings,
      activeSelectedPayments
    );
  }, [activeSelectedPurchases, activeSelectedPackings, activeSelectedPayments]);

  if (!isOpen) return null;

  const togglePurchase = (id: string) => {
    setSelectedPurchaseIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const togglePacking = (id: string) => {
    setSelectedPackingIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const togglePayment = (id: string) => {
    setSelectedPaymentIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const handleSelectAllCurrentMonth = () => {
    setSelectedPurchaseIds(new Set(monthPurchases.map((p) => p.id)));
    setSelectedPackingIds(new Set(monthPackings.map((p) => p.id)));
    setSelectedPaymentIds(new Set(monthPayments.map((p) => p.id)));
    showToast('Selected all records for ' + (selectedMonth || 'all time'));
  };

  const handleDeselectAll = () => {
    setSelectedPurchaseIds(new Set());
    setSelectedPackingIds(new Set());
    setSelectedPaymentIds(new Set());
    showToast('Deselected all records');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += `"ZSB AQUATICS - BATCH END-OF-MONTH REPORT","PERIOD: ${selectedMonth || 'ALL'}"\n\n`;

    csv += `"PURCHASE SUMMARY"\n`;
    csv += `"Invoice #","Date","Description","Qty","Amount (TK)","Balance (TK)"\n`;
    activeSelectedPurchases.forEach((p) => {
      csv += `"${p.invoiceNumber}","${p.date}","${p.description}",${p.totalQty},${p.totalAmount},${p.balance}\n`;
    });
    csv += `"Total Purchases",,"",${batchTotals.totalPurchaseQty},${batchTotals.totalPurchaseAmount},\n\n`;

    csv += `"PACKING & EXPORT SUMMARY"\n`;
    csv += `"Packing List #","Date","Shipping Mark","Flight","Destination","Boxes","Gross Weight (KG)","Export Value (TK)"\n`;
    activeSelectedPackings.forEach((p) => {
      csv += `"${p.invoiceNumber}","${p.packingDate}","${p.shippingMark}","${p.flight}","${p.destination}",${p.totalBoxes},${p.totalWeight},${p.totalAmount}\n`;
    });
    csv += `"Total Exports",,,,,${batchTotals.totalBoxes},${batchTotals.totalWeight},${batchTotals.totalPackingAmount}\n\n`;

    csv += `"PAYMENTS & RETURN RMB SUMMARY"\n`;
    csv += `"Voucher #","Date","Party","Category","Total Amount (TK)","Paid (TK)","Balance (TK)","Return RMB (¥)"\n`;
    activeSelectedPayments.forEach((p) => {
      csv += `"${p.invoiceNumber}","${p.date}","${p.description}","${p.partyType}",${p.totalAmount},${p.paidAmount},${p.balance},${p.returnRmb?.rmbAmount || 0}\n`;
    });
    csv += `"Total Payments",,,${batchTotals.totalPaymentAmount},,,\n`;

    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `ZSB_Aquatics_Batch_Report_${selectedMonth || 'All'}.csv`;
    link.click();
    showToast('Batch report exported to CSV');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-6xl max-h-[94vh] flex flex-col my-auto overflow-hidden animate-in fade-in duration-150">
        {/* Modal Top Header */}
        <div className="bg-[#12284c] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                BATCH PRINT &ndash; END-OF-MONTH CONSOLIDATED PDF REPORT
              </h3>
              <p className="text-[11px] text-blue-200">
                Print multiple selected records across all databases as a single unified multi-page document
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveView(activeView === 'select' ? 'preview' : 'select')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{activeView === 'select' ? 'Show Print Preview' : 'Select Records'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded text-xs font-bold flex items-center space-x-1 shadow-sm cursor-pointer transition"
              title="Print all selected records to a single PDF document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save Single PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-teal-700 hover:bg-teal-600 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition shadow-sm"
              title="Export all selected records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Batch CSV</span>
            </button>

            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="bg-gray-100 border-b border-gray-300 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-gray-700 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Reporting Month:</span>
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2 py-1 font-mono font-semibold text-gray-800"
            />
            {selectedMonth && (
              <button
                onClick={() => setSelectedMonth('')}
                className="text-[11px] text-gray-500 hover:text-gray-700 underline cursor-pointer"
              >
                All Months
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Category:</span>
            {(['all', 'purchase', 'packing', 'payment'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition ${
                  categoryFilter === cat
                    ? 'bg-[#12284c] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat === 'all'
                  ? 'All Modules'
                  : cat === 'purchase'
                  ? 'Purchases'
                  : cat === 'packing'
                  ? 'Packing Lists'
                  : 'Payments'}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAllCurrentMonth}
              className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 px-2.5 py-1 rounded font-semibold cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 px-2.5 py-1 rounded cursor-pointer"
            >
              Deselect All
            </button>
            <div className="font-mono text-gray-700 ml-2 font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
              {batchTotals.totalSelectedRecords} Records Selected
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
          {activeView === 'select' ? (
            /* Record Selection View */
            <div className="space-y-4">
              {/* Purchases Section */}
              {(categoryFilter === 'all' || categoryFilter === 'purchase') && (
                <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
                  <div className="bg-[#831843] text-white px-4 py-2 font-bold text-xs uppercase flex items-center justify-between">
                    <span>PURCHASE INVOICES ({monthPurchases.length})</span>
                    <span className="text-pink-200 font-mono">
                      Selected: {activeSelectedPurchases.length}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                    {monthPurchases.length === 0 ? (
                      <p className="p-4 text-xs text-gray-500 text-center">No purchases for this period.</p>
                    ) : (
                      monthPurchases.map((p) => {
                        const isSelected = selectedPurchaseIds.has(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => togglePurchase(p.id)}
                            className={`p-2.5 flex items-center justify-between text-xs hover:bg-pink-50/50 cursor-pointer transition ${
                              isSelected ? 'bg-pink-50/30' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-pink-700" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                              <div>
                                <strong className="text-pink-900 font-mono">{p.invoiceNumber}</strong>
                                <span className="text-gray-500 ml-2">({p.date})</span>
                                <p className="text-[11px] text-gray-600">
                                  {p.description} &bull; {p.totalQty} items
                                </p>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="font-bold text-gray-900">{formatCurrency(p.totalAmount)}</span>
                              <span className="text-[10px] text-pink-700 block">
                                Bal: {formatCurrency(p.balance)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Packing Lists Section */}
              {(categoryFilter === 'all' || categoryFilter === 'packing') && (
                <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
                  <div className="bg-[#ea580c] text-white px-4 py-2 font-bold text-xs uppercase flex items-center justify-between">
                    <span>PACKING &amp; EXPORT SHIPMENTS ({monthPackings.length})</span>
                    <span className="text-orange-200 font-mono">
                      Selected: {activeSelectedPackings.length}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                    {monthPackings.length === 0 ? (
                      <p className="p-4 text-xs text-gray-500 text-center">No packing lists for this period.</p>
                    ) : (
                      monthPackings.map((p) => {
                        const isSelected = selectedPackingIds.has(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => togglePacking(p.id)}
                            className={`p-2.5 flex items-center justify-between text-xs hover:bg-amber-50/50 cursor-pointer transition ${
                              isSelected ? 'bg-amber-50/30' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-orange-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                              <div>
                                <strong className="text-amber-950 font-mono">{p.invoiceNumber}</strong>
                                <span className="text-gray-500 ml-2">({p.packingDate})</span>
                                <p className="text-[11px] text-gray-600">
                                  Mark: <strong>{p.shippingMark}</strong> &bull; {p.flight} &rarr; {p.destination}
                                </p>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="font-bold text-emerald-800">{formatCurrency(p.totalAmount)}</span>
                              <span className="text-[10px] text-amber-800 block">
                                {p.totalWeight} KG ({p.totalBoxes} Boxes)
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Payments Section */}
              {(categoryFilter === 'all' || categoryFilter === 'payment') && (
                <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
                  <div className="bg-[#6b21a8] text-white px-4 py-2 font-bold text-xs uppercase flex items-center justify-between">
                    <span>PAYMENTS &amp; RETURN RMB VOUCHERS ({monthPayments.length})</span>
                    <span className="text-purple-200 font-mono">
                      Selected: {activeSelectedPayments.length}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                    {monthPayments.length === 0 ? (
                      <p className="p-4 text-xs text-gray-500 text-center">No payment vouchers for this period.</p>
                    ) : (
                      monthPayments.map((p) => {
                        const isSelected = selectedPaymentIds.has(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => togglePayment(p.id)}
                            className={`p-2.5 flex items-center justify-between text-xs hover:bg-purple-50/50 cursor-pointer transition ${
                              isSelected ? 'bg-purple-50/30' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-purple-700" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                              <div>
                                <strong className="text-purple-900 font-mono">{p.invoiceNumber}</strong>
                                <span className="text-gray-500 ml-2">({p.date})</span>
                                <p className="text-[11px] text-gray-600">
                                  {p.description} &bull; {p.partyType}
                                </p>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="font-bold text-gray-900">{formatCurrency(p.totalAmount)}</span>
                              {p.returnRmb && (
                                <span className="text-[10px] text-blue-700 block">
                                  RMB: ¥{p.returnRmb.rmbAmount}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Consolidated Printable Document Preview (Single Multi-Page PDF) */
            <div
              className="bg-white p-8 md:p-10 rounded-lg shadow-md border border-gray-300 max-w-5xl mx-auto print:p-0 print:m-0 print:border-none print:shadow-none relative"
              id="printable-document"
            >
              {/* Dynamic Watermark Branding */}
              <WatermarkOverlay />

              {/* Header Letterhead */}
              <div className="border-b-2 border-[#12284c] pb-4 mb-6 flex flex-wrap justify-between items-start">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-[#12284c] tracking-tight">
                    ZSB AQUATICS
                  </h1>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mt-0.5">
                    EXPORTERS OF QUALITY AQUATIC &amp; FISHERY PRODUCTS
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dhaka &bull; Khulna &bull; Chittagong &bull; Bangladesh
                  </p>
                  <p className="text-xs text-gray-500">
                    Air Cargo Hub: HSIA, Dhaka (Flights: CZ, BG, MU, YG, JD)
                  </p>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <div className="inline-block bg-blue-50 border border-blue-200 px-3 py-1.5 rounded text-right mb-1">
                    <span className="block text-[10px] uppercase font-bold text-blue-800">
                      DOCUMENT TYPE
                    </span>
                    <span className="text-sm font-bold text-gray-900 font-mono">
                      BATCH MONTHLY AUDIT STATEMENT
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Period:</strong> {selectedMonth ? `${selectedMonth}-01 to End` : 'All Dates'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Generated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Executive Summary Cards */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
                <h3 className="text-xs font-black uppercase text-gray-700 tracking-wider mb-2.5">
                  EXECUTIVE AUDIT SUMMARY ({batchTotals.totalSelectedRecords} Selected Records)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded border border-gray-200">
                    <span className="text-gray-500 font-sans block text-[11px]">Total Purchases:</span>
                    <strong className="text-pink-700 text-sm block">
                      {formatCurrency(batchTotals.totalPurchaseAmount)}
                    </strong>
                    <span className="text-[10px] text-gray-500 font-sans">
                      {batchTotals.purchaseCount} bills &bull; {batchTotals.totalPurchaseQty} units
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-gray-200">
                    <span className="text-gray-500 font-sans block text-[11px]">Total Export Value:</span>
                    <strong className="text-emerald-700 text-sm block">
                      {formatCurrency(batchTotals.totalPackingAmount)}
                    </strong>
                    <span className="text-[10px] text-gray-500 font-sans">
                      {batchTotals.packingCount} shipments
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-gray-200">
                    <span className="text-gray-500 font-sans block text-[11px]">Gross Export Weight:</span>
                    <strong className="text-amber-800 text-sm block">
                      {batchTotals.totalWeight} KG
                    </strong>
                    <span className="text-[10px] text-gray-500 font-sans">
                      {batchTotals.totalBoxes} total boxes
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-gray-200">
                    <span className="text-gray-500 font-sans block text-[11px]">Return RMB / Net:</span>
                    <strong className="text-blue-900 text-sm block">
                      {formatCurrency(batchTotals.netMargin)}
                    </strong>
                    <span className="text-[10px] text-gray-500 font-sans">
                      Return: {formatCurrency(batchTotals.totalReturnRmbBdt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 1: Purchases Table */}
              {activeSelectedPurchases.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-pink-900 bg-pink-100/70 border border-pink-200 px-3 py-1.5 rounded-t uppercase flex justify-between">
                    <span>1. Purchase Challans &amp; Procurement Records</span>
                    <span>Total: {formatCurrency(batchTotals.totalPurchaseAmount)}</span>
                  </h4>
                  <table className="w-full text-xs border border-gray-300">
                    <thead className="bg-[#831843] text-white">
                      <tr>
                        <th className="p-2 border border-gray-300 text-left">SL</th>
                        <th className="p-2 border border-gray-300 text-left">INVOICE #</th>
                        <th className="p-2 border border-gray-300 text-left">DATE</th>
                        <th className="p-2 border border-gray-300 text-left">DESCRIPTION</th>
                        <th className="p-2 border border-gray-300 text-right">TOTAL QTY</th>
                        <th className="p-2 border border-gray-300 text-right">TOTAL (TK)</th>
                        <th className="p-2 border border-gray-300 text-right">PAID (TK)</th>
                        <th className="p-2 border border-gray-300 text-right">BALANCE (TK)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono">
                      {activeSelectedPurchases.map((p, idx) => (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2 border border-gray-300 text-center text-gray-500 font-sans">{idx + 1}</td>
                          <td className="p-2 border border-gray-300 font-bold text-pink-900">{p.invoiceNumber}</td>
                          <td className="p-2 border border-gray-300 text-gray-600">{p.date}</td>
                          <td className="p-2 border border-gray-300 font-sans font-medium">{p.description}</td>
                          <td className="p-2 border border-gray-300 text-right">{p.totalQty}</td>
                          <td className="p-2 border border-gray-300 text-right font-bold text-gray-900">
                            {formatCurrency(p.totalAmount)}
                          </td>
                          <td className="p-2 border border-gray-300 text-right text-emerald-700">
                            {formatCurrency(p.paidAmount)}
                          </td>
                          <td className="p-2 border border-gray-300 text-right font-bold text-pink-700">
                            {formatCurrency(p.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Section 2: Packing Lists Table */}
              {activeSelectedPackings.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-amber-950 bg-amber-100/70 border border-amber-200 px-3 py-1.5 rounded-t uppercase flex justify-between">
                    <span>2. Export Shipments &amp; Packing Lists</span>
                    <span>Total: {formatCurrency(batchTotals.totalPackingAmount)} ({batchTotals.totalWeight} KG)</span>
                  </h4>
                  <table className="w-full text-xs border border-gray-300">
                    <thead className="bg-[#ea580c] text-white">
                      <tr>
                        <th className="p-2 border border-gray-300 text-left">SL</th>
                        <th className="p-2 border border-gray-300 text-left">PACKING #</th>
                        <th className="p-2 border border-gray-300 text-left">DATE</th>
                        <th className="p-2 border border-gray-300 text-left">SHIPPING MARK</th>
                        <th className="p-2 border border-gray-300 text-left">FLIGHT &bull; DESTINATION</th>
                        <th className="p-2 border border-gray-300 text-right">BOXES</th>
                        <th className="p-2 border border-gray-300 text-right">WEIGHT (KG)</th>
                        <th className="p-2 border border-gray-300 text-right">AMOUNT (TK)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono">
                      {activeSelectedPackings.map((p, idx) => (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2 border border-gray-300 text-center text-gray-500 font-sans">{idx + 1}</td>
                          <td className="p-2 border border-gray-300 font-bold text-amber-900">{p.invoiceNumber}</td>
                          <td className="p-2 border border-gray-300 text-gray-600">{p.packingDate}</td>
                          <td className="p-2 border border-gray-300 font-bold text-amber-950 font-sans">{p.shippingMark}</td>
                          <td className="p-2 border border-gray-300 font-sans">{p.flight} &rarr; {p.destination}</td>
                          <td className="p-2 border border-gray-300 text-right">{p.totalBoxes}</td>
                          <td className="p-2 border border-gray-300 text-right font-bold text-amber-800">{p.totalWeight}</td>
                          <td className="p-2 border border-gray-300 text-right font-bold text-emerald-800">
                            {formatCurrency(p.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Section 3: Payments & Return RMB Table */}
              {activeSelectedPayments.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-purple-950 bg-purple-100/70 border border-purple-200 px-3 py-1.5 rounded-t uppercase flex justify-between">
                    <span>3. Supplier &amp; Exporter Payments / Return RMB Vouchers</span>
                    <span>Total: {formatCurrency(batchTotals.totalPaymentAmount)}</span>
                  </h4>
                  <table className="w-full text-xs border border-gray-300">
                    <thead className="bg-[#6b21a8] text-white">
                      <tr>
                        <th className="p-2 border border-gray-300 text-left">SL</th>
                        <th className="p-2 border border-gray-300 text-left">VOUCHER #</th>
                        <th className="p-2 border border-gray-300 text-left">DATE</th>
                        <th className="p-2 border border-gray-300 text-left">PARTY / DESCRIPTION</th>
                        <th className="p-2 border border-gray-300 text-left">CATEGORY</th>
                        <th className="p-2 border border-gray-300 text-right">TOTAL (TK)</th>
                        <th className="p-2 border border-gray-300 text-right">RETURN RMB</th>
                        <th className="p-2 border border-gray-300 text-right">BALANCE (TK)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono">
                      {activeSelectedPayments.map((p, idx) => (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2 border border-gray-300 text-center text-gray-500 font-sans">{idx + 1}</td>
                          <td className="p-2 border border-gray-300 font-bold text-purple-900">{p.invoiceNumber}</td>
                          <td className="p-2 border border-gray-300 text-gray-600">{p.date}</td>
                          <td className="p-2 border border-gray-300 font-bold font-sans">{p.description}</td>
                          <td className="p-2 border border-gray-300 font-sans">{p.partyType}</td>
                          <td className="p-2 border border-gray-300 text-right font-bold text-gray-900">
                            {formatCurrency(p.totalAmount)}
                          </td>
                          <td className="p-2 border border-gray-300 text-right text-blue-700">
                            {p.returnRmb ? `¥${p.returnRmb.rmbAmount}` : '-'}
                          </td>
                          <td className="p-2 border border-gray-300 text-right font-bold text-purple-900">
                            {formatCurrency(p.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* End-of-Month Verification Sign-offs */}
              <div className="mt-12 pt-8 border-t-2 border-gray-300 grid grid-cols-3 gap-6 text-center text-xs text-gray-600">
                <div>
                  <div className="border-b border-gray-400 pb-1 mb-1 mx-4"></div>
                  <strong className="block text-gray-800">Accounts Executive</strong>
                  <span className="text-[10px] text-gray-500">Prepared &amp; Reconciled</span>
                </div>
                <div>
                  <div className="border-b border-gray-400 pb-1 mb-1 mx-4"></div>
                  <strong className="block text-gray-800">Internal Audit</strong>
                  <span className="text-[10px] text-gray-500">Checked &amp; Verified</span>
                </div>
                <div>
                  <div className="border-b border-gray-400 pb-1 mb-1 mx-4"></div>
                  <strong className="block text-gray-800">Managing Director</strong>
                  <span className="text-[10px] text-gray-500">Approved for Month-End Closing</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
