import React, { useState } from 'react';
import {
  Save,
  FileText,
  Search,
  Trash2,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DropdownSelect } from '../DropdownSelect';
import { PurchaseLineItem, PurchaseRecord } from '../../types';
import {
  calculatePurchaseRow,
  calculatePurchaseTotals,
  formatCurrency,
} from '../../utils/calculations';

export const PurchaseFormSheet: React.FC = () => {
  const { purchases, addPurchase, setActiveTab, setPreviewDoc, showToast } = useApp();

  const nextInvoiceNo = `INV-2026-${String(purchases.length + 1).padStart(3, '0')}`;

  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNo);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [searchDesc, setSearchDesc] = useState('');

  // 10 initial rows as shown in the screenshot
  const initialRows: PurchaseLineItem[] = Array.from({ length: 8 }, (_, i) => ({
    id: String(i + 1),
    item: '',
    quantity: '',
    rate: '',
    previousAmount: '',
    paidAmount: '',
  }));

  const [rows, setRows] = useState<PurchaseLineItem[]>(initialRows);
  const [reviewPrevAmount, setReviewPrevAmount] = useState<number | ''>('');
  const [reviewPaidAmount, setReviewPaidAmount] = useState<number | ''>('');

  const handleRowChange = (index: number, field: keyof PurchaseLineItem, val: any) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        item: '',
        quantity: '',
        rate: '',
        previousAmount: '',
        paidAmount: '',
      },
    ]);
  };

  // Calculations
  const calculatedTotals = calculatePurchaseTotals(
    rows,
    Number(reviewPrevAmount) || 0,
    Number(reviewPaidAmount) || 0
  );

  const handleClear = () => {
    if (window.confirm('Clear all fields in Purchase Data Entry Form?')) {
      setDescription('');
      setContactNumber('');
      setRows(initialRows);
      setReviewPrevAmount('');
      setReviewPaidAmount('');
      showToast('Form cleared');
    }
  };

  const handleSavePDF = () => {
    const validItems = rows.filter((r) => r.item && Number(r.quantity) > 0);
    if (!description && validItems.length === 0) {
      alert('Please select a Description and enter at least one item with Quantity & Rate.');
      return;
    }

    const newRecord: PurchaseRecord = {
      id: `PUR-${Date.now()}`,
      invoiceNumber: invoiceNumber || nextInvoiceNo,
      date,
      description: description || 'General Lot',
      contactNumber,
      items: validItems.length > 0 ? validItems : [
        { id: '1', item: 'F1', quantity: 1, rate: calculatedTotals.totalAmount || 100 }
      ],
      totalQty: calculatedTotals.totalQty,
      totalAmount: calculatedTotals.totalAmount,
      previousAmount: Number(reviewPrevAmount) || 0,
      paidAmount: Number(reviewPaidAmount) || 0,
      balance: calculatedTotals.balance,
      createdAt: new Date().toISOString(),
    };

    addPurchase(newRecord);

    // Open PDF preview immediately
    setPreviewDoc({
      type: 'purchase',
      title: `Purchase Challan / Invoice #${newRecord.invoiceNumber}`,
      data: newRecord,
    });

    // Auto-advance invoice number & clear line entries
    setInvoiceNumber(`INV-2026-${String(purchases.length + 2).padStart(3, '0')}`);
    setRows(initialRows);
    setReviewPaidAmount('');
    showToast('Saved to Purchase DB and generated PDF');
  };

  const handlePrintSelected = () => {
    const validItems = rows.filter((r) => r.item && Number(r.quantity) > 0);
    setPreviewDoc({
      type: 'purchase',
      title: `Purchase Challan Preview #${invoiceNumber}`,
      data: {
        invoiceNumber,
        date,
        description: description || 'General Purchase',
        contactNumber,
        items: validItems.length > 0 ? validItems : rows.slice(0, 3),
        totalQty: calculatedTotals.totalQty,
        totalAmount: calculatedTotals.totalAmount,
        previousAmount: Number(reviewPrevAmount) || 0,
        paidAmount: Number(reviewPaidAmount) || 0,
        balance: calculatedTotals.balance,
      },
    });
  };

  const handleMonthlyStatement = () => {
    // Collect all purchases for current description or month
    const currentMonth = date.substring(0, 7);
    const monthPurchases = purchases.filter((p) => p.date.startsWith(currentMonth));

    setPreviewDoc({
      type: 'daily_summary',
      title: `Monthly Statement (${currentMonth}) - Purchase Summary`,
      data: {
        date: currentMonth,
        purchases: monthPurchases.length > 0 ? monthPurchases : purchases,
        packings: [],
        payments: [],
      },
    });
  };

  const handleSearch = () => {
    setActiveTab('purchase_db');
  };

  return (
    <div className="p-3 md:p-5 max-w-[1500px] mx-auto space-y-4">
      {/* Top Bar matching Sheet 2 image */}
      <div className="bg-[#12284c] text-white rounded-lg px-4 py-2.5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-black text-yellow-400">ZSB AQUATICS</span>
          <span className="text-gray-400 font-light">|</span>
          <span className="text-sm md:text-base font-bold text-white tracking-wide">
            Purchase Challan / Bill &ndash; Data Entry Form
          </span>
        </div>
        <span className="text-[11px] bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded font-mono border border-blue-700">
          SHEET 2 &bull; DATA ENTRY
        </span>
      </div>

      {/* Main Grid: Left Form Box (75%) + Right Controls & Flow (25%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Form Box */}
        <div className="xl:col-span-8 bg-white rounded-lg border-2 border-gray-300 shadow-sm overflow-hidden flex flex-col">
          {/* Header Banner */}
          <div className="bg-[#831843] text-white text-center py-2.5 border-b border-pink-900">
            <h2 className="text-lg md:text-xl font-black tracking-wider">ZSB AQUATICS</h2>
            <h3 className="text-xs md:text-sm font-bold tracking-widest text-pink-100 uppercase">
              PURCHASE DATA ENTRY FORM
            </h3>
          </div>

          {/* Form Meta Fields */}
          <div className="p-3 bg-gray-50 border-b border-gray-300 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <label className="font-bold text-gray-800 w-32 shrink-0">INVOICE NUMBER</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono font-semibold text-gray-800 shadow-2xs focus:ring-1 focus:ring-pink-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="font-bold text-gray-800 w-24 shrink-0">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-800 shadow-2xs focus:ring-1 focus:ring-pink-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="font-bold text-gray-800 w-32 shrink-0">DESCRIPTION</label>
              <div className="w-full">
                <DropdownSelect
                  category="purchaseDescriptions"
                  value={description}
                  onChange={setDescription}
                  placeholder="Select Description (e.g. KS/3, FF1, XXL)..."
                  selectClassName="border-pink-300"
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
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 shadow-2xs focus:ring-1 focus:ring-pink-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Excel Grid Table */}
          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-xs border border-gray-300">
              <thead>
                <tr className="bg-[#831843] text-white font-bold text-center">
                  <th className="p-2 border border-pink-900 w-36">ITEM</th>
                  <th className="p-2 border border-pink-900 w-24">QUANTITY</th>
                  <th className="p-2 border border-pink-900 w-24">RATE</th>
                  <th className="p-2 border border-pink-900 w-28">TOTAL AMOUNT</th>
                  <th className="p-2 border border-pink-900 w-28">PREVIOUS AMOUNT</th>
                  <th className="p-2 border border-pink-900 w-28">PAID AMOUNT</th>
                  <th className="p-2 border border-pink-900 w-28">BALANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {rows.map((row, idx) => {
                  const rowCalc = calculatePurchaseRow(
                    Number(row.quantity),
                    Number(row.rate),
                    Number(row.previousAmount),
                    Number(row.paidAmount)
                  );
                  return (
                    <tr key={row.id} className="hover:bg-pink-50/30">
                      <td className="p-1 border border-gray-300">
                        <DropdownSelect
                          category="items"
                          value={row.item}
                          onChange={(val) => handleRowChange(idx, 'item', val)}
                          placeholder="Select Item"
                          allowDelete={true}
                        />
                      </td>
                      <td className="p-1 border border-gray-300">
                        <input
                          type="number"
                          min="0"
                          value={row.quantity}
                          onChange={(e) =>
                            handleRowChange(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className="w-full text-right px-1.5 py-1 bg-white border border-gray-200 rounded focus:bg-pink-50 focus:outline-none"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-1 border border-gray-300">
                        <input
                          type="number"
                          min="0"
                          value={row.rate}
                          onChange={(e) =>
                            handleRowChange(idx, 'rate', e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className="w-full text-right px-1.5 py-1 bg-white border border-gray-200 rounded focus:bg-pink-50 focus:outline-none"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-1 border border-gray-300 text-right px-2 font-semibold text-gray-800 bg-gray-50/50">
                        {rowCalc.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-1 border border-gray-300">
                        <input
                          type="number"
                          value={row.previousAmount ?? ''}
                          onChange={(e) =>
                            handleRowChange(idx, 'previousAmount', e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className="w-full text-right px-1.5 py-1 bg-white border border-gray-200 rounded focus:bg-pink-50 focus:outline-none"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-1 border border-gray-300">
                        <input
                          type="number"
                          value={row.paidAmount ?? ''}
                          onChange={(e) =>
                            handleRowChange(idx, 'paidAmount', e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className="w-full text-right px-1.5 py-1 bg-white border border-gray-200 rounded focus:bg-pink-50 focus:outline-none"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-1 border border-gray-300 text-right px-2 font-semibold text-pink-700 bg-gray-50/50">
                        {rowCalc.balance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {/* Total Row */}
                <tr className="bg-[#831843] text-white font-bold">
                  <td className="p-2 border border-pink-900 text-left font-sans">TOTAL QTY:</td>
                  <td className="p-2 border border-pink-900 text-right font-mono text-yellow-300">
                    {calculatedTotals.totalQty}
                  </td>
                  <td className="p-2 border border-pink-900 text-right font-sans">TOTAL AMOUNT (TK):</td>
                  <td className="p-2 border border-pink-900 text-right font-mono text-yellow-300" colSpan={4}>
                    {calculatedTotals.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-2 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={handleAddRow}
                className="text-pink-700 hover:text-pink-900 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Insert Extra Line Item Row</span>
              </button>
            </div>
          </div>

          {/* Review Section matching image */}
          <div className="p-3 bg-pink-50/50 border-t border-gray-300 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <span className="font-bold text-gray-800 text-sm">REVIEW</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">PREVIOUS AMOUNT:</span>
                  <input
                    type="number"
                    value={reviewPrevAmount}
                    onChange={(e) =>
                      setReviewPrevAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="0.00"
                    className="w-36 text-right px-2 py-1 bg-white border border-gray-300 rounded font-mono"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">PAID AMOUNT:</span>
                  <input
                    type="number"
                    value={reviewPaidAmount}
                    onChange={(e) =>
                      setReviewPaidAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="0.00"
                    className="w-36 text-right px-2 py-1 bg-white border border-gray-300 rounded font-mono"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-gray-300 pt-1 font-bold text-sm">
                  <span className="text-gray-900">BALANCE:</span>
                  <span className="font-mono text-pink-800 text-base">
                    {calculatedTotals.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons, Search, System Flow */}
        <div className="xl:col-span-4 space-y-4">
          {/* Action Buttons */}
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-xs">
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 font-bold text-xs uppercase text-blue-900">
              ACTION BUTTONS
            </div>
            <div className="p-3 space-y-2.5">
              {/* SAVE (PDF) button */}
              <button
                type="button"
                onClick={handleSavePDF}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition active:scale-[0.99]"
              >
                <Save className="w-5 h-5" />
                <span className="text-sm">SAVE (PDF)</span>
              </button>

              {/* MONTHLY STATEMENT (PDF) */}
              <button
                type="button"
                onClick={handleMonthlyStatement}
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition active:scale-[0.99]"
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs">MONTHLY STATEMENT (PDF)</span>
              </button>

              {/* SEARCH */}
              <button
                type="button"
                onClick={handleSearch}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition active:scale-[0.99]"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs">SEARCH PURCHASE DB</span>
              </button>

              {/* CLEAR */}
              <button
                type="button"
                onClick={handleClear}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition active:scale-[0.99]"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs">CLEAR FORM</span>
              </button>

              {/* PRINT (Selected Cells) */}
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

          {/* Search by Description */}
          <div className="bg-white rounded-lg border border-gray-300 p-3 shadow-xs space-y-2">
            <h4 className="font-bold text-xs text-gray-800 uppercase">SEARCH BY DESCRIPTION</h4>
            <div className="flex space-x-1.5">
              <input
                type="text"
                placeholder="Enter description..."
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
              >
                SEARCH
              </button>
            </div>
          </div>

          {/* System Flow Box */}
          <div className="bg-white rounded-lg border border-gray-300 p-3 text-xs space-y-2">
            <h4 className="font-bold text-blue-900 border-b pb-1">SYSTEM FLOW</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 bg-pink-50 p-1.5 rounded">
                <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <div>
                  <div className="font-bold text-pink-900">Data Entry Form</div>
                  <div className="text-[10px] text-gray-600">Enter details and save</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 p-1.5 rounded">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <div>
                  <div className="font-bold text-blue-900">Validation &amp; Calculation</div>
                  <div className="text-[10px] text-gray-600">Check data &amp; update balance</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-emerald-50 p-1.5 rounded">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <div>
                  <div className="font-bold text-emerald-900">Purchase Database</div>
                  <div className="text-[10px] text-gray-600">Save data with unique ID</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Auxiliary Guides matching Image 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Sheet Structure */}
        <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-xs">
          <h4 className="font-bold text-blue-900 mb-2 border-b pb-1">SHEET STRUCTURE</h4>
          <ol className="space-y-1 text-gray-700">
            <li><strong>1. Dashboard</strong> &ndash; Overview &amp; navigation</li>
            <li><strong>2. Purchase Challan / Bill</strong> &ndash; Entry form (this sheet)</li>
            <li><strong>3. Purchase DB</strong> &ndash; Saved records</li>
            <li><strong>4. Search Results</strong> &ndash; Filtered data</li>
            <li><strong>5. Settings</strong> &ndash; Company details &amp; lists</li>
          </ol>
        </div>

        {/* Formula Example */}
        <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-xs">
          <h4 className="font-bold text-emerald-900 mb-2 border-b pb-1">FORMULA EXAMPLE</h4>
          <ul className="space-y-1 font-mono text-[11px] text-gray-700">
            <li>&bull; Total Amount = Quantity &times; Rate</li>
            <li>&bull; Previous Amount = Manual entry</li>
            <li>&bull; Paid Amount = Manual entry</li>
            <li>&bull; Balance = Previous Amount &ndash; Paid Amount</li>
          </ul>
        </div>

        {/* Key Functions */}
        <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-xs">
          <h4 className="font-bold text-yellow-900 mb-2 border-b pb-1">KEY FUNCTIONS (Google Apps Script)</h4>
          <ul className="space-y-1 text-gray-700">
            <li>&check; Auto increment invoice number</li>
            <li>&check; Save data to database sheet</li>
            <li>&check; Generate PDF (from selected cells)</li>
            <li>&check; Monthly statement (filter by month)</li>
            <li>&check; Sort records (newest first)</li>
          </ul>
        </div>

        {/* User Workflow */}
        <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-xs">
          <h4 className="font-bold text-purple-900 mb-2 border-b pb-1">USER WORKFLOW</h4>
          <ol className="space-y-1 text-gray-700">
            <li>1. Enter data in the form</li>
            <li>2. Click <strong>Save (PDF)</strong></li>
            <li>3. Form data will be saved to database</li>
            <li>4. Form will be cleared automatically</li>
            <li>5. Use Search / Monthly Statement / Print</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
