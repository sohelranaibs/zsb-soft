import React, { useState } from 'react';
import {
  Save,
  FileText,
  Search,
  Trash2,
  Printer,
  Plus,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DropdownSelect } from '../DropdownSelect';
import { PackingLineItem, PackingRecord } from '../../types';
import { calculatePackingRow, calculatePackingTotals, formatCurrency } from '../../utils/calculations';

export const PackingFormSheet: React.FC = () => {
  const { packings, addPacking, setActiveTab, setPreviewDoc, showToast } = useApp();

  const nextPackingNo = `PL-2026-${String(packings.length + 1).padStart(3, '0')}`;

  const [invoiceNumber, setInvoiceNumber] = useState(nextPackingNo);
  const [shippingMark, setShippingMark] = useState('CHJ-22');
  const [flight, setFlight] = useState('CZ');
  const [destination, setDestination] = useState('GUANGZHOU');
  const [shipper, setShipper] = useState('ZSB AQUATICS');
  const [packingDate, setPackingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Search by filters
  const [searchShippingMark, setSearchShippingMark] = useState('');
  const [searchDestination, setSearchDestination] = useState('');

  // Initial 8 rows matching screenshot
  const initialRows: PackingLineItem[] = Array.from({ length: 8 }, (_, i) => ({
    id: String(i + 1),
    item: '',
    box: '',
    weight: '',
    unit: 'KG',
    rate: '',
    totalWeight: 0,
    amount: 0,
  }));

  const [rows, setRows] = useState<PackingLineItem[]>(initialRows);

  const handleRowChange = (index: number, field: keyof PackingLineItem, val: any) => {
    setRows((prev) => {
      const copy = [...prev];
      const updatedRow = { ...copy[index], [field]: val };

      // Calculate line total weight and amount
      const b = Number(field === 'box' ? val : updatedRow.box) || 0;
      const w = Number(field === 'weight' ? val : updatedRow.weight) || 0;
      const r = Number(field === 'rate' ? val : updatedRow.rate) || 0;

      const calc = calculatePackingRow(b, w, r);
      updatedRow.totalWeight = calc.totalWeight;
      updatedRow.amount = calc.amount;

      copy[index] = updatedRow;
      return copy;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        item: '',
        box: '',
        weight: '',
        unit: 'KG',
        rate: '',
        totalWeight: 0,
        amount: 0,
      },
    ]);
  };

  const totals = calculatePackingTotals(
    rows.map((r) => ({
      ...r,
      box: Number(r.box) || 0,
      weight: Number(r.weight) || 0,
      rate: Number(r.rate) || 0,
    }))
  );

  const handleClear = () => {
    if (window.confirm('Clear all fields in Packing List Data Entry Form?')) {
      setShippingMark('');
      setFlight('');
      setDestination('');
      setShipper('');
      setRows(initialRows);
      showToast('Packing form cleared');
    }
  };

  const handleSavePDF = () => {
    const validItems = rows.filter((r) => r.item && Number(r.box) > 0);
    if (!shippingMark && validItems.length === 0) {
      alert('Please select a Shipping Mark and enter at least one item with Box & Weight.');
      return;
    }

    const newRecord: PackingRecord = {
      id: `PCK-${Date.now()}`,
      invoiceNumber: invoiceNumber || nextPackingNo,
      shippingMark: shippingMark || 'AAD',
      flight: flight || 'CZ',
      destination: destination || 'GUANGZHOU',
      shipper: shipper || 'ZSB AQUATICS',
      packingDate,
      fromDate,
      toDate,
      items: validItems.length > 0 ? validItems : [
        {
          id: '1',
          item: 'F1',
          box: 5,
          weight: 14,
          unit: 'KG',
          rate: 350,
          totalWeight: 70,
          amount: 24500,
        },
      ],
      totalBoxes: totals.totalBoxes || 5,
      totalWeight: totals.totalWeight || 70,
      totalAmount: totals.totalAmount || 24500,
      createdAt: new Date().toISOString(),
    };

    addPacking(newRecord);

    setPreviewDoc({
      type: 'packing',
      title: `Official Packing List #${newRecord.invoiceNumber}`,
      data: newRecord,
    });

    setInvoiceNumber(`PL-2026-${String(packings.length + 2).padStart(3, '0')}`);
    setRows(initialRows);
    showToast('Saved to Packing DB and generated PDF');
  };

  const handlePrintSelected = () => {
    const validItems = rows.filter((r) => r.item);
    setPreviewDoc({
      type: 'packing',
      title: `Packing List Preview #${invoiceNumber}`,
      data: {
        invoiceNumber,
        shippingMark,
        flight,
        destination,
        shipper,
        packingDate,
        fromDate,
        toDate,
        items: validItems.length > 0 ? validItems : rows.slice(0, 3),
        totalBoxes: totals.totalBoxes,
        totalWeight: totals.totalWeight,
        totalAmount: totals.totalAmount,
      },
    });
  };

  const handleMonthlyStatement = () => {
    const currentMonth = packingDate.substring(0, 7);
    const monthPackings = packings.filter((p) => p.packingDate.startsWith(currentMonth));

    setPreviewDoc({
      type: 'daily_summary',
      title: `Monthly Export Statement (${currentMonth})`,
      data: {
        date: currentMonth,
        purchases: [],
        packings: monthPackings.length > 0 ? monthPackings : packings,
        payments: [],
      },
    });
  };

  return (
    <div className="p-3 md:p-5 max-w-[1500px] mx-auto space-y-4">
      {/* Top Banner matching Sheet 3 */}
      <div className="bg-[#12284c] text-white rounded-lg px-4 py-2.5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-black text-yellow-400">ZSB AQUATICS</span>
          <span className="text-gray-400 font-light">|</span>
          <span className="text-sm md:text-base font-bold text-white tracking-wide">
            Packing List &ndash; Data Entry Form
          </span>
        </div>
        <span className="text-[11px] bg-orange-900/60 text-orange-200 px-2 py-0.5 rounded font-mono border border-orange-700">
          SHEET 3 &bull; EXPORT PACKING
        </span>
      </div>

      {/* Main Grid: Form Box (8 cols) + Right Controls (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Form Box */}
        <div className="xl:col-span-8 bg-white rounded-lg border-2 border-gray-300 shadow-sm overflow-hidden flex flex-col">
          {/* Header Banner */}
          <div className="bg-[#831843] text-white text-center py-2.5 border-b border-pink-900">
            <h2 className="text-lg md:text-xl font-black tracking-wider">ZSB AQUATICS</h2>
            <h3 className="text-xs md:text-sm font-bold tracking-widest text-pink-100 uppercase">
              PACKING LIST DATA ENTRY FORM
            </h3>
          </div>

          {/* Form Top Meta Grid with yellow-tinted header cells from screenshot */}
          <div className="p-3 bg-amber-50/50 border-b border-gray-300 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-amber-100/70 p-2 rounded border border-amber-300">
              <label className="block text-[11px] font-black uppercase text-amber-950 mb-1">
                SHIPPING MARK
              </label>
              <DropdownSelect
                category="shippingMarks"
                value={shippingMark}
                onChange={setShippingMark}
                placeholder="Select Shipping Mark"
                selectClassName="bg-white"
                showInlineButtons={true}
              />
            </div>

            <div className="bg-amber-100/70 p-2 rounded border border-amber-300">
              <label className="block text-[11px] font-black uppercase text-amber-950 mb-1">
                FLIGHT
              </label>
              <DropdownSelect
                category="flights"
                value={flight}
                onChange={setFlight}
                placeholder="Select Flight"
                selectClassName="bg-white"
                showInlineButtons={true}
              />
            </div>

            <div className="bg-amber-100/70 p-2 rounded border border-amber-300">
              <label className="block text-[11px] font-black uppercase text-amber-950 mb-1">
                DESTINATION
              </label>
              <DropdownSelect
                category="destinations"
                value={destination}
                onChange={setDestination}
                placeholder="Select Destination"
                selectClassName="bg-white"
                showInlineButtons={true}
              />
            </div>

            <div className="bg-amber-100/70 p-2 rounded border border-amber-300">
              <label className="block text-[11px] font-black uppercase text-amber-950 mb-1">
                SHIPPER
              </label>
              <DropdownSelect
                category="shippers"
                value={shipper}
                onChange={setShipper}
                placeholder="Select Shipper"
                selectClassName="bg-white"
                showInlineButtons={true}
              />
            </div>

            <div className="bg-amber-100/70 p-2 rounded border border-amber-300">
              <label className="block text-[11px] font-black uppercase text-amber-950 mb-1">
                PACKING DATE
              </label>
              <input
                type="date"
                value={packingDate}
                onChange={(e) => setPackingDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono text-gray-800"
              />
            </div>

            <div className="bg-amber-100/70 p-2 rounded border border-amber-300">
              <label className="block text-[11px] font-black uppercase text-amber-950 mb-1">
                FROM DATE
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono text-gray-800"
              />
            </div>

            <div className="bg-amber-100/70 p-2 rounded border border-amber-300 col-span-2">
              <label className="block text-[11px] font-black uppercase text-amber-950 mb-1">
                TO DATE &bull; INVOICE NO
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-1/2 bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono text-gray-800"
                />
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-1/2 bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono font-bold text-amber-900"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table with Orange Header from Screenshot 3 */}
          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-xs border border-gray-300">
              <thead>
                <tr className="bg-[#ea580c] text-white font-bold text-center">
                  <th className="p-2 border border-orange-700 w-36">ITEM</th>
                  <th className="p-2 border border-orange-700 w-24">BOX</th>
                  <th className="p-2 border border-orange-700 w-24">WEIGHT</th>
                  <th className="p-2 border border-orange-700 w-28">TOTAL WEIGHT</th>
                  <th className="p-2 border border-orange-700 w-24">UNIT</th>
                  <th className="p-2 border border-orange-700 w-24">RATE</th>
                  <th className="p-2 border border-orange-700 w-28">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-amber-50/40">
                    <td className="p-1 border border-gray-300">
                      <DropdownSelect
                        category="items"
                        value={row.item}
                        onChange={(val) => handleRowChange(idx, 'item', val)}
                        placeholder="Select Item"
                      />
                    </td>
                    <td className="p-1 border border-gray-300">
                      <DropdownSelect
                        category="boxes"
                        value={String(row.box)}
                        onChange={(val) => handleRowChange(idx, 'box', val)}
                        placeholder="Box"
                        selectClassName="text-center"
                      />
                    </td>
                    <td className="p-1 border border-gray-300">
                      <DropdownSelect
                        category="weights"
                        value={String(row.weight)}
                        onChange={(val) => handleRowChange(idx, 'weight', val)}
                        placeholder="Weight"
                        selectClassName="text-center"
                      />
                    </td>
                    <td className="p-1 border border-gray-300 text-right px-2 font-bold text-amber-900 bg-amber-50/40">
                      {row.totalWeight.toFixed(2)}
                    </td>
                    <td className="p-1 border border-gray-300">
                      <DropdownSelect
                        category="units"
                        value={row.unit}
                        onChange={(val) => handleRowChange(idx, 'unit', val)}
                        placeholder="Unit"
                        selectClassName="text-center"
                        allowDelete={false}
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
                        className="w-full text-right px-1.5 py-1 bg-white border border-gray-200 rounded focus:bg-amber-50 focus:outline-none"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-1 border border-gray-300 text-right px-2 font-bold text-emerald-800 bg-gray-50/50">
                      {row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {/* Total Row */}
                <tr className="bg-[#ea580c] text-white font-bold">
                  <td className="p-2 border border-orange-700 text-left font-sans">TOTALS:</td>
                  <td className="p-2 border border-orange-700 text-center font-mono text-yellow-300">
                    {totals.totalBoxes}
                  </td>
                  <td className="p-2 border border-orange-700"></td>
                  <td className="p-2 border border-orange-700 text-right font-mono text-yellow-300">
                    {totals.totalWeight.toFixed(2)} KG
                  </td>
                  <td className="p-2 border border-orange-700"></td>
                  <td className="p-2 border border-orange-700 text-right font-sans">TOTAL AMOUNT:</td>
                  <td className="p-2 border border-orange-700 text-right font-mono text-yellow-300">
                    {totals.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-2 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={handleAddRow}
                className="text-orange-700 hover:text-orange-900 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Insert Extra Packing Row</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons, Search By, System Flow */}
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
                onClick={() => setActiveTab('packing_db')}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition active:scale-[0.99]"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs">SEARCH PACKING DB</span>
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

          {/* Search By (Shipping Mark & Destination) matching screenshot */}
          <div className="bg-white rounded-lg border border-gray-300 p-3 shadow-xs space-y-2">
            <h4 className="font-bold text-xs text-gray-800 uppercase">SEARCH BY</h4>
            <div className="space-y-2">
              <DropdownSelect
                category="shippingMarks"
                value={searchShippingMark}
                onChange={setSearchShippingMark}
                placeholder="Shipping Mark"
              />
              <DropdownSelect
                category="destinations"
                value={searchDestination}
                onChange={setSearchDestination}
                placeholder="Destination"
              />
              <button
                type="button"
                onClick={() => setActiveTab('packing_db')}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-1.5 rounded text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>SEARCH</span>
              </button>
            </div>
          </div>

          {/* System Flow Box */}
          <div className="bg-white rounded-lg border border-gray-300 p-3 text-xs space-y-2">
            <h4 className="font-bold text-blue-900 border-b pb-1">SYSTEM FLOW</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 bg-amber-50 p-1.5 rounded">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <div>
                  <div className="font-bold text-orange-950">1. Packing List Data Entry Form</div>
                  <div className="text-[10px] text-gray-600">Enter details and save</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 p-1.5 rounded">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <div>
                  <div className="font-bold text-blue-950">2. Validation &amp; Calculation</div>
                  <div className="text-[10px] text-gray-600">Check data and update balance</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-emerald-50 p-1.5 rounded">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <div>
                  <div className="font-bold text-emerald-950">3. Packing List Database</div>
                  <div className="text-[10px] text-gray-600">Save data with unique ID</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Auxiliary Guides matching Sheet 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-xs">
          <h4 className="font-bold text-blue-900 mb-2 border-b pb-1">SHEET STRUCTURE</h4>
          <ol className="space-y-1 text-gray-700">
            <li><strong>1. Dashboard</strong> &ndash; Overview &amp; navigation</li>
            <li><strong>2. Packing List</strong> &ndash; Data entry form (this sheet)</li>
            <li><strong>3. Packing DB</strong> &ndash; Saved records</li>
            <li><strong>4. Search Results</strong> &ndash; Filtered data</li>
            <li><strong>5. Settings</strong> &ndash; Company details &amp; lists</li>
          </ol>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-xs">
          <h4 className="font-bold text-emerald-900 mb-2 border-b pb-1">FORMULA EXAMPLE</h4>
          <ul className="space-y-1 font-mono text-[11px] text-gray-700">
            <li>&bull; Total Weight = Box &times; Weight</li>
            <li>&bull; Amount = Total Weight &times; Rate</li>
            <li>&bull; Unit = KG / PCS / Other</li>
          </ul>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-xs">
          <h4 className="font-bold text-yellow-900 mb-2 border-b pb-1">KEY FUNCTIONS (Google Apps Script)</h4>
          <ul className="space-y-1 text-gray-700">
            <li>&check; Auto increment invoice number</li>
            <li>&check; Save data to database sheet</li>
            <li>&check; Generate PDF (from selected cells)</li>
            <li>&check; Monthly statement (filter by month)</li>
            <li>&check; Sort records (newest first)</li>
            <li>&check; Clear form after save</li>
          </ul>
        </div>

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
