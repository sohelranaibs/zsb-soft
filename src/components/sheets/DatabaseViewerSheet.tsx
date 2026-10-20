import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Eye,
  Trash2,
  Download,
  Plus,
  Calendar,
  X,
  FileCode,
  CheckCircle2,
  Filter,
  UserCheck,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import {
  generatePurchaseCsv,
  generatePackingCsv,
  generatePaymentCsv,
  triggerCsvDownload,
} from '../../utils/csvExport';
import {
  filterPurchases,
  filterPackings,
  filterPayments,
} from '../../utils/filterRecords';
import { SheetTab, PurchaseRecord, PackingRecord, PaymentRecord } from '../../types';

interface DatabaseViewerProps {
  type: 'purchase_db' | 'packing_db' | 'payment_db';
}

export const DatabaseViewerSheet: React.FC<DatabaseViewerProps> = ({ type }) => {
  const {
    purchases,
    deletePurchase,
    packings,
    deletePacking,
    payments,
    deletePayment,
    dropdowns,
    setActiveTab,
    setPreviewDoc,
    showToast,
  } = useApp();

  // Global search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedShippingMark, setSelectedShippingMark] = useState('');

  // Extract unique suppliers from dropdowns and records
  const availableSuppliers = useMemo(() => {
    const set = new Set<string>();
    (dropdowns.suppliersAndExporters || []).forEach((s) => s && set.add(s));
    (dropdowns.shippers || []).forEach((s) => s && set.add(s));
    purchases.forEach((p) => p.description && set.add(p.description));
    payments.forEach((p) => p.description && set.add(p.description));
    packings.forEach((p) => p.shipper && set.add(p.shipper));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [dropdowns, purchases, payments, packings]);

  // Extract unique shipping marks from dropdowns and records
  const availableShippingMarks = useMemo(() => {
    const set = new Set<string>();
    (dropdowns.shippingMarks || []).forEach((m) => m && set.add(m));
    packings.forEach((p) => p.shippingMark && set.add(p.shippingMark));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [dropdowns, packings]);

  // 1. Filtered records computation for current view using decoupled filterRecords logic
  const filteredPurchases = useMemo(() => {
    return filterPurchases(purchases, {
      query: searchTerm,
      dateFrom: fromDate,
      dateTo: toDate,
      supplier: selectedSupplier,
      shippingMark: selectedShippingMark,
    });
  }, [purchases, searchTerm, fromDate, toDate, selectedSupplier, selectedShippingMark]);

  const filteredPackings = useMemo(() => {
    return filterPackings(packings, {
      query: searchTerm,
      dateFrom: fromDate,
      dateTo: toDate,
      supplier: selectedSupplier,
      shippingMark: selectedShippingMark,
    });
  }, [packings, searchTerm, fromDate, toDate, selectedSupplier, selectedShippingMark]);

  const filteredPayments = useMemo(() => {
    return filterPayments(payments, {
      query: searchTerm,
      dateFrom: fromDate,
      dateTo: toDate,
      supplier: selectedSupplier,
      shippingMark: selectedShippingMark,
    });
  }, [payments, searchTerm, fromDate, toDate, selectedSupplier, selectedShippingMark]);

  // Current view records count
  const currentViewCount =
    type === 'purchase_db'
      ? filteredPurchases.length
      : type === 'packing_db'
      ? filteredPackings.length
      : filteredPayments.length;

  const totalDbCount =
    type === 'purchase_db'
      ? purchases.length
      : type === 'packing_db'
      ? packings.length
      : payments.length;

  const hasActiveFilters = Boolean(
    searchTerm || fromDate || toDate || selectedSupplier || selectedShippingMark
  );

  const resetFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setSelectedSupplier('');
    setSelectedShippingMark('');
    showToast('Filters reset to default view');
  };

  const handleSetDatePreset = (preset: 'today' | 'this_month' | 'last_month' | 'all') => {
    const today = new Date();
    if (preset === 'today') {
      const d = today.toISOString().split('T')[0];
      setFromDate(d);
      setToDate(d);
    } else if (preset === 'this_month') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
      setFromDate(`${year}-${month}-01`);
      setToDate(`${year}-${month}-${String(lastDay).padStart(2, '0')}`);
    } else if (preset === 'last_month') {
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const year = lastMonthDate.getFullYear();
      const month = String(lastMonthDate.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, lastMonthDate.getMonth() + 1, 0).getDate();
      setFromDate(`${year}-${month}-01`);
      setToDate(`${year}-${month}-${String(lastDay).padStart(2, '0')}`);
    } else {
      setFromDate('');
      setToDate('');
    }
  };

  /**
   * Export only the records visible in the current view/filters to CSV
   */
  const handleExportCurrentViewCSV = () => {
    const today = new Date().toISOString().split('T')[0];

    if (type === 'purchase_db') {
      if (filteredPurchases.length === 0) {
        showToast('No records match current view to export');
        return;
      }
      const csv = generatePurchaseCsv(filteredPurchases);
      const filename = `ZSB_Purchase_DB_CurrentView_${today}.csv`;
      triggerCsvDownload(csv, filename);
      showToast(`Exported ${filteredPurchases.length} current view records to CSV`);
    } else if (type === 'packing_db') {
      if (filteredPackings.length === 0) {
        showToast('No records match current view to export');
        return;
      }
      const csv = generatePackingCsv(filteredPackings);
      const filename = `ZSB_Packing_DB_CurrentView_${today}.csv`;
      triggerCsvDownload(csv, filename);
      showToast(`Exported ${filteredPackings.length} current view packing records to CSV`);
    } else {
      if (filteredPayments.length === 0) {
        showToast('No records match current view to export');
        return;
      }
      const csv = generatePaymentCsv(filteredPayments);
      const filename = `ZSB_Payment_DB_CurrentView_${today}.csv`;
      triggerCsvDownload(csv, filename);
      showToast(`Exported ${filteredPayments.length} current view payment records to CSV`);
    }
  };

  /**
   * Export all records in this database
   */
  const handleExportFullDbCSV = () => {
    const today = new Date().toISOString().split('T')[0];

    if (type === 'purchase_db') {
      const csv = generatePurchaseCsv(purchases);
      triggerCsvDownload(csv, `ZSB_Purchase_DB_FullBackup_${today}.csv`);
      showToast(`Exported all ${purchases.length} Purchase records to CSV`);
    } else if (type === 'packing_db') {
      const csv = generatePackingCsv(packings);
      triggerCsvDownload(csv, `ZSB_Packing_DB_FullBackup_${today}.csv`);
      showToast(`Exported all ${packings.length} Packing records to CSV`);
    } else {
      const csv = generatePaymentCsv(payments);
      triggerCsvDownload(csv, `ZSB_Payment_DB_FullBackup_${today}.csv`);
      showToast(`Exported all ${payments.length} Payment records to CSV`);
    }
  };

  /**
   * Export JSON Backup for offline restore or system transfer
   */
  const handleExportJsonBackup = () => {
    const today = new Date().toISOString().split('T')[0];
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      databaseType: type,
      records:
        type === 'purchase_db'
          ? filteredPurchases
          : type === 'packing_db'
          ? filteredPackings
          : filteredPayments,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ZSB_${type}_Backup_${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Saved JSON backup (${currentViewCount} records)`);
  };



  const getTitle = () => {
    if (type === 'purchase_db') return 'PURCHASE DATABASE (PURCHASE DB)';
    if (type === 'packing_db') return 'PACKING LIST DATABASE (PACKING DB)';
    return 'SUPPLIER & EXPORTER PAYMENT DATABASE (PAYMENT DB)';
  };

  const getTargetForm = (): SheetTab => {
    if (type === 'purchase_db') return 'purchase_form';
    if (type === 'packing_db') return 'packing_form';
    return 'payment_form';
  };

  return (
    <div className="p-3 md:p-5 max-w-[1500px] mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-[#12284c] text-white rounded-lg px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-yellow-400" />
          <div>
            <h2 className="text-base md:text-lg font-black tracking-wide">{getTitle()}</h2>
            <p className="text-[11px] text-blue-200">
              Complete data table &bull; Real-time storage &bull; Global Search &bull; CSV Export &amp; Backup
            </p>
          </div>
        </div>

        {/* Database Quick Switcher Tabs */}
        <div className="flex items-center bg-blue-950/60 p-1 rounded-md border border-blue-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('purchase_db')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              type === 'purchase_db'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Purchase DB ({purchases.length})
          </button>
          <button
            onClick={() => setActiveTab('packing_db')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              type === 'packing_db'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Packing DB ({packings.length})
          </button>
          <button
            onClick={() => setActiveTab('payment_db')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              type === 'payment_db'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Payment DB ({payments.length})
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab(getTargetForm())}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open Entry Form</span>
          </button>

          {/* Download CSV File */}
          <button
            onClick={handleExportCurrentViewCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition shadow-xs"
            title="Download CSV spreadsheet file for the records currently visible"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
            <span className="bg-emerald-900/60 text-emerald-100 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {currentViewCount}
            </span>
          </button>

          {/* Full Database CSV Backup */}
          <button
            onClick={handleExportFullDbCSV}
            className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center space-x-1 cursor-pointer transition shadow-xs"
            title="Download complete database as a CSV file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full CSV</span>
          </button>

          {/* Backup JSON */}
          <button
            onClick={handleExportJsonBackup}
            className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center space-x-1 cursor-pointer transition shadow-xs"
            title="Export structured JSON file for backup and analysis"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden md:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* Global Search & Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-300 p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-800 uppercase tracking-wide">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Global Search &amp; Filter Bar</span>
          </div>

          {/* Quick Record Counter */}
          <div className="text-xs font-mono text-gray-600 flex items-center space-x-2">
            <span>
              Showing <strong className="text-gray-900 font-bold">{currentViewCount}</strong> of{' '}
              <strong className="text-gray-700">{totalDbCount}</strong> records
            </span>
            {hasActiveFilters && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Filtered View
              </span>
            )}
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Global Search Input */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Search Any Keyword
            </label>
            <div className="flex items-center space-x-1 px-2.5 py-1.5 border border-gray-300 rounded bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Invoice, item, remark, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs border-none outline-none p-0 text-gray-800"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                  title="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Supplier / Party Dropdown Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center space-x-1">
              <UserCheck className="w-3 h-3 text-indigo-600" />
              <span>Supplier / Party Name</span>
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            >
              <option value="">(All Suppliers &amp; Parties)</option>
              {availableSuppliers.map((supp) => (
                <option key={supp} value={supp}>
                  {supp}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Shipping Mark Dropdown Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center space-x-1">
              <Tag className="w-3 h-3 text-amber-600" />
              <span>Shipping Mark</span>
            </label>
            <select
              value={selectedShippingMark}
              onChange={(e) => setSelectedShippingMark(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            >
              <option value="">(All Shipping Marks)</option>
              {availableShippingMarks.map((mark) => (
                <option key={mark} value={mark}>
                  {mark}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Date Range Inputs */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>Date Range (From &ndash; To)</span>
            </label>
            <div className="flex items-center space-x-1">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                title="Filter records from date"
              />
              <span className="text-gray-400 text-xs">&ndash;</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                title="Filter records to date"
              />
            </div>
          </div>
        </div>

        {/* Date Presets & Filter Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          {/* Quick Date Presets */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[11px] text-gray-500 font-semibold mr-1">Date presets:</span>
            <button
              onClick={() => handleSetDatePreset('today')}
              className="px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-100 text-gray-700 text-[11px] font-medium cursor-pointer transition"
            >
              Today
            </button>
            <button
              onClick={() => handleSetDatePreset('this_month')}
              className="px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-100 text-gray-700 text-[11px] font-medium cursor-pointer transition"
            >
              This Month
            </button>
            <button
              onClick={() => handleSetDatePreset('last_month')}
              className="px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-100 text-gray-700 text-[11px] font-medium cursor-pointer transition"
            >
              Last Month
            </button>
            {(fromDate || toDate) && (
              <button
                onClick={() => handleSetDatePreset('all')}
                className="px-2 py-0.5 rounded text-red-600 hover:bg-red-50 text-[11px] font-medium cursor-pointer transition"
              >
                Clear Dates
              </button>
            )}
          </div>

          {/* Reset All Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded cursor-pointer transition font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Active Filter Chips / Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100">
            <span className="text-[11px] text-gray-500 font-semibold">Active Filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-[11px]">
                <span>Query: &ldquo;{searchTerm}&rdquo;</span>
                <button onClick={() => setSearchTerm('')} className="hover:text-blue-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSupplier && (
              <span className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full text-[11px]">
                <span>Supplier: {selectedSupplier}</span>
                <button
                  onClick={() => setSelectedSupplier('')}
                  className="hover:text-indigo-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedShippingMark && (
              <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                <span>Mark: {selectedShippingMark}</span>
                <button
                  onClick={() => setSelectedShippingMark('')}
                  className="hover:text-amber-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(fromDate || toDate) && (
              <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                <span>
                  Date: {fromDate || 'Start'} &rarr; {toDate || 'End'}
                </span>
                <button
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                  }}
                  className="hover:text-emerald-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Current View CSV Export Hint */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded px-3 py-1.5 text-[11px] text-emerald-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              <strong>Current View CSV Export:</strong> Clicking &ldquo;Export Current View (CSV)&rdquo; downloads precisely the records currently matching your search and filter criteria.
            </span>
          </div>
          <button
            onClick={handleExportCurrentViewCSV}
            className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer shrink-0 ml-2"
          >
            Download CSV ({currentViewCount})
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm overflow-hidden">
        {type === 'purchase_db' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#831843] text-white font-bold">
                <tr>
                  <th className="p-2.5 text-left border-r border-pink-900">INVOICE #</th>
                  <th className="p-2.5 text-left border-r border-pink-900">DATE</th>
                  <th className="p-2.5 text-left border-r border-pink-900">DESCRIPTION (SUPPLIER)</th>
                  <th className="p-2.5 text-left border-r border-pink-900">CONTACT</th>
                  <th className="p-2.5 text-right border-r border-pink-900">ITEMS</th>
                  <th className="p-2.5 text-right border-r border-pink-900">TOTAL QTY</th>
                  <th className="p-2.5 text-right border-r border-pink-900">TOTAL AMOUNT</th>
                  <th className="p-2.5 text-right border-r border-pink-900">PAID</th>
                  <th className="p-2.5 text-right border-r border-pink-900">BALANCE</th>
                  <th className="p-2.5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500 font-sans">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Filter className="w-8 h-8 text-gray-300" />
                        <p className="font-semibold text-gray-700">No purchase records found matching your filters.</p>
                        {hasActiveFilters && (
                          <button
                            onClick={resetFilters}
                            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded cursor-pointer transition border border-blue-200"
                          >
                            Clear Filters &amp; View All Records
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-pink-50/30">
                      <td className="p-2.5 font-bold text-pink-900">{p.invoiceNumber}</td>
                      <td className="p-2.5 text-gray-600">{p.date}</td>
                      <td className="p-2.5 font-sans font-semibold text-gray-800">{p.description}</td>
                      <td className="p-2.5 text-gray-500 font-sans">{p.contactNumber || '-'}</td>
                      <td className="p-2.5 text-right">{p.items?.length || 0}</td>
                      <td className="p-2.5 text-right font-bold">{p.totalQty}</td>
                      <td className="p-2.5 text-right font-bold text-gray-900">
                        {formatCurrency(p.totalAmount)}
                      </td>
                      <td className="p-2.5 text-right text-emerald-700">{formatCurrency(p.paidAmount)}</td>
                      <td className="p-2.5 text-right font-bold text-pink-700">
                        {formatCurrency(p.balance)}
                      </td>
                      <td className="p-2.5 text-center space-x-1 font-sans">
                        <button
                          onClick={() =>
                            setPreviewDoc({
                              type: 'purchase',
                              title: `Purchase Challan #${p.invoiceNumber}`,
                              data: p,
                            })
                          }
                          className="p-1 hover:bg-gray-100 text-blue-600 rounded cursor-pointer"
                          title="View & Print PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete Purchase record ${p.invoiceNumber}?`)) {
                              deletePurchase(p.id);
                            }
                          }}
                          className="p-1 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {type === 'packing_db' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#ea580c] text-white font-bold">
                <tr>
                  <th className="p-2.5 text-left border-r border-orange-700">PACKING LIST #</th>
                  <th className="p-2.5 text-left border-r border-orange-700">SHIPPING MARK</th>
                  <th className="p-2.5 text-left border-r border-orange-700">FLIGHT</th>
                  <th className="p-2.5 text-left border-r border-orange-700">DESTINATION</th>
                  <th className="p-2.5 text-left border-r border-orange-700">SHIPPER</th>
                  <th className="p-2.5 text-left border-r border-orange-700">PACKING DATE</th>
                  <th className="p-2.5 text-right border-r border-orange-700">BOXES</th>
                  <th className="p-2.5 text-right border-r border-orange-700">TOTAL WEIGHT</th>
                  <th className="p-2.5 text-right border-r border-orange-700">AMOUNT</th>
                  <th className="p-2.5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {filteredPackings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500 font-sans">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Filter className="w-8 h-8 text-gray-300" />
                        <p className="font-semibold text-gray-700">No packing records found matching your filters.</p>
                        {hasActiveFilters && (
                          <button
                            onClick={resetFilters}
                            className="text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold px-3 py-1.5 rounded cursor-pointer transition border border-amber-200"
                          >
                            Clear Filters &amp; View All Records
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPackings.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/30">
                      <td className="p-2.5 font-bold text-amber-900">{p.invoiceNumber}</td>
                      <td className="p-2.5 font-bold text-amber-950 font-sans">{p.shippingMark}</td>
                      <td className="p-2.5 font-semibold text-gray-800">{p.flight}</td>
                      <td className="p-2.5 font-sans text-gray-700">{p.destination}</td>
                      <td className="p-2.5 font-sans text-gray-600">{p.shipper}</td>
                      <td className="p-2.5 text-gray-600">{p.packingDate}</td>
                      <td className="p-2.5 text-right font-bold">{p.totalBoxes}</td>
                      <td className="p-2.5 text-right font-bold text-amber-800">
                        {p.totalWeight} KG
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-800">
                        {formatCurrency(p.totalAmount)}
                      </td>
                      <td className="p-2.5 text-center space-x-1 font-sans">
                        <button
                          onClick={() =>
                            setPreviewDoc({
                              type: 'packing',
                              title: `Packing List #${p.invoiceNumber}`,
                              data: p,
                            })
                          }
                          className="p-1 hover:bg-gray-100 text-blue-600 rounded cursor-pointer"
                          title="View & Print PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete Packing record ${p.invoiceNumber}?`)) {
                              deletePacking(p.id);
                            }
                          }}
                          className="p-1 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {type === 'payment_db' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#6b21a8] text-white font-bold">
                <tr>
                  <th className="p-2.5 text-left border-r border-purple-900">VOUCHER #</th>
                  <th className="p-2.5 text-left border-r border-purple-900">DATE</th>
                  <th className="p-2.5 text-left border-r border-purple-900">PARTY / DESCRIPTION</th>
                  <th className="p-2.5 text-left border-r border-purple-900">CATEGORY</th>
                  <th className="p-2.5 text-right border-r border-purple-900">TOTAL AMOUNT</th>
                  <th className="p-2.5 text-right border-r border-purple-900">PAID</th>
                  <th className="p-2.5 text-right border-r border-purple-900">BALANCE</th>
                  <th className="p-2.5 text-right border-r border-purple-900">RETURN RMB</th>
                  <th className="p-2.5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500 font-sans">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Filter className="w-8 h-8 text-gray-300" />
                        <p className="font-semibold text-gray-700">No payment records found matching your filters.</p>
                        {hasActiveFilters && (
                          <button
                            onClick={resetFilters}
                            className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold px-3 py-1.5 rounded cursor-pointer transition border border-purple-200"
                          >
                            Clear Filters &amp; View All Records
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-purple-50/30">
                      <td className="p-2.5 font-bold text-purple-900">{p.invoiceNumber}</td>
                      <td className="p-2.5 text-gray-600">{p.date}</td>
                      <td className="p-2.5 font-sans font-bold text-gray-800">{p.description}</td>
                      <td className="p-2.5 font-sans">
                        <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          {p.partyType}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold text-gray-900">
                        {formatCurrency(p.totalAmount)}
                      </td>
                      <td className="p-2.5 text-right text-emerald-700">{formatCurrency(p.paidAmount)}</td>
                      <td className="p-2.5 text-right font-bold text-purple-900">
                        {formatCurrency(p.balance)}
                      </td>
                      <td className="p-2.5 text-right text-blue-700">
                        {p.returnRmb ? `¥ ${p.returnRmb.rmbAmount}` : '-'}
                      </td>
                      <td className="p-2.5 text-center space-x-1 font-sans">
                        <button
                          onClick={() =>
                            setPreviewDoc({
                              type: 'payment',
                              title: `Payment Voucher #${p.invoiceNumber}`,
                              data: p,
                            })
                          }
                          className="p-1 hover:bg-gray-100 text-blue-600 rounded cursor-pointer"
                          title="View & Print PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete Payment record ${p.invoiceNumber}?`)) {
                              deletePayment(p.id);
                            }
                          }}
                          className="p-1 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
