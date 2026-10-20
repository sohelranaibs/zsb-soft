import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';
import { WatermarkOverlay } from './WatermarkOverlay';

export const DocumentPreviewModal: React.FC = () => {
  const { previewDoc, setPreviewDoc } = useApp();

  if (!previewDoc) return null;

  const { type, title, data } = previewDoc;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (type === 'purchase') {
      csvContent += `INVOICE NUMBER,${data.invoiceNumber}\nDATE,${data.date}\nDESCRIPTION,${data.description}\nCONTACT,${data.contactNumber}\n\n`;
      csvContent += `ITEM,QUANTITY,RATE,TOTAL AMOUNT\n`;
      data.items.forEach((it: any) => {
        csvContent += `"${it.item}",${it.quantity},${it.rate},${(Number(it.quantity) || 0) * (Number(it.rate) || 0)}\n`;
      });
      csvContent += `\nTOTAL QTY,${data.totalQty}\nTOTAL AMOUNT,${data.totalAmount}\nPAID AMOUNT,${data.paidAmount}\nBALANCE,${data.balance}\n`;
    } else if (type === 'packing') {
      csvContent += `PACKING LIST NO,${data.invoiceNumber}\nSHIPPING MARK,${data.shippingMark}\nFLIGHT,${data.flight}\nDESTINATION,${data.destination}\nSHIPPER,${data.shipper}\nPACKING DATE,${data.packingDate}\n\n`;
      csvContent += `ITEM,BOX,WEIGHT,TOTAL WEIGHT,UNIT,RATE,AMOUNT\n`;
      data.items.forEach((it: any) => {
        csvContent += `"${it.item}",${it.box},${it.weight},${it.totalWeight},"${it.unit}",${it.rate},${it.amount}\n`;
      });
      csvContent += `\nTOTAL BOXES,${data.totalBoxes}\nTOTAL WEIGHT,${data.totalWeight}\nTOTAL AMOUNT,${data.totalAmount}\n`;
    } else if (type === 'payment') {
      csvContent += `VOUCHER NO,${data.invoiceNumber}\nDATE,${data.date}\nPARTY,${data.description}\nTYPE,${data.partyType}\n\n`;
      csvContent += `DESCRIPTION,DEBIT AMOUNT,CREDIT AMOUNT\n`;
      data.items.forEach((it: any) => {
        csvContent += `"${it.description}",${it.debitAmount},${it.creditAmount}\n`;
      });
      csvContent += `\nTOTAL AMOUNT,${data.totalAmount}\nPAID AMOUNT,${data.paidAmount}\nBALANCE,${data.balance}\n`;
    } else {
      csvContent += `REPORT,${title}\nGENERATED,${new Date().toLocaleString()}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_${data.invoiceNumber || 'report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#12284c] text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">{title}</h3>
              <p className="text-[11px] text-blue-200">
                Official Excel Macro Export &bull; PDF &bull; Print Preview
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1 shadow-sm cursor-pointer transition"
              title="Print to physical printer or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1 shadow-sm cursor-pointer transition"
              title="Export as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setPreviewDoc(null)}
              className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-white print:p-0 print:m-0 relative" id="printable-document">
          {/* Dynamic ZSB AQUATICS Watermark */}
          <WatermarkOverlay />

          {/* Company Banner */}
          <div className="border-b-2 border-[#12284c] pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-[#12284c] tracking-tight">
                ZSB AQUATICS
              </h1>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Exporters of Quality Aquatic &amp; Fishery Products
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Dhaka &bull; Khulna &bull; Chittagong &bull; Bangladesh
              </p>
              <p className="text-xs text-gray-500">
                Air Cargo Cargo Hub: HSIA, Dhaka (Flights: CZ, BG, MU, YG, JD)
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-blue-50 border border-blue-200 px-3 py-1.5 rounded text-right mb-2">
                <span className="block text-[10px] uppercase font-bold text-blue-800">
                  Document Reference
                </span>
                <span className="text-sm font-mono font-bold text-gray-900">
                  {data.invoiceNumber || 'DOC-SUMMARY'}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                <strong>Date:</strong> {data.date || data.packingDate || new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>

          {/* Type specific layouts */}
          {type === 'purchase' && (
            <div>
              <div className="bg-pink-50 border border-pink-200 rounded p-3 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Description / Lot:</span>
                  <span className="font-bold text-gray-800">{data.description}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Contact Number:</span>
                  <span className="font-bold text-gray-800">{data.contactNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Quantity:</span>
                  <span className="font-bold text-gray-800">{data.totalQty} Units</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Invoice Total:</span>
                  <span className="font-bold text-pink-700">{formatCurrency(data.totalAmount)}</span>
                </div>
              </div>

              <table className="w-full text-xs border border-gray-300 mb-6">
                <thead>
                  <tr className="bg-[#831843] text-white">
                    <th className="border border-gray-300 p-2 text-left">SL</th>
                    <th className="border border-gray-300 p-2 text-left">ITEM / GRADE</th>
                    <th className="border border-gray-300 p-2 text-right">QUANTITY</th>
                    <th className="border border-gray-300 p-2 text-right">RATE (TK)</th>
                    <th className="border border-gray-300 p-2 text-right">TOTAL AMOUNT (TK)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.map((item: any, idx: number) => {
                    const rowTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 p-2 text-center text-gray-500">{idx + 1}</td>
                        <td className="border border-gray-300 p-2 font-medium">{item.item}</td>
                        <td className="border border-gray-300 p-2 text-right font-mono">{item.quantity}</td>
                        <td className="border border-gray-300 p-2 text-right font-mono">{Number(item.rate || 0).toFixed(2)}</td>
                        <td className="border border-gray-300 p-2 text-right font-mono font-semibold">
                          {rowTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={2} className="border border-gray-300 p-2 text-right">TOTALS:</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">{data.totalQty}</td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2 text-right font-mono text-pink-800">
                      {formatCurrency(data.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="bg-gray-50 border border-gray-300 rounded p-3 ml-auto w-72 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600">Previous Balance:</span>
                  <span className="font-mono">{formatCurrency(data.previousAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Amount:</span>
                  <span className="font-mono text-emerald-600">{formatCurrency(data.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-1 font-bold">
                  <span>Net Balance Due:</span>
                  <span className="font-mono text-pink-700">{formatCurrency(data.balance || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {type === 'packing' && (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Shipping Mark:</span>
                  <span className="font-bold text-amber-900">{data.shippingMark}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Flight:</span>
                  <span className="font-bold text-gray-800">{data.flight}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Destination:</span>
                  <span className="font-bold text-gray-800">{data.destination}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Shipper:</span>
                  <span className="font-bold text-gray-800">{data.shipper}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Packing Date:</span>
                  <span className="font-bold text-gray-800">{data.packingDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Date Range:</span>
                  <span className="font-bold text-gray-800">{data.fromDate} to {data.toDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Weight:</span>
                  <span className="font-bold text-amber-700">{data.totalWeight} KG</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Export Value:</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(data.totalAmount)}</span>
                </div>
              </div>

              <table className="w-full text-xs border border-gray-300 mb-6">
                <thead>
                  <tr className="bg-[#ea580c] text-white">
                    <th className="border border-gray-300 p-2 text-left">SL</th>
                    <th className="border border-gray-300 p-2 text-left">ITEM / GRADE</th>
                    <th className="border border-gray-300 p-2 text-right">BOXES</th>
                    <th className="border border-gray-300 p-2 text-right">WEIGHT/BOX</th>
                    <th className="border border-gray-300 p-2 text-right">TOTAL WEIGHT</th>
                    <th className="border border-gray-300 p-2 text-center">UNIT</th>
                    <th className="border border-gray-300 p-2 text-right">RATE</th>
                    <th className="border border-gray-300 p-2 text-right">AMOUNT (TK)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.map((item: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-2 text-center text-gray-500">{idx + 1}</td>
                      <td className="border border-gray-300 p-2 font-medium">{item.item}</td>
                      <td className="border border-gray-300 p-2 text-right font-mono">{item.box}</td>
                      <td className="border border-gray-300 p-2 text-right font-mono">{item.weight}</td>
                      <td className="border border-gray-300 p-2 text-right font-mono font-bold text-amber-800">
                        {item.totalWeight}
                      </td>
                      <td className="border border-gray-300 p-2 text-center text-gray-600">{item.unit || 'KG'}</td>
                      <td className="border border-gray-300 p-2 text-right font-mono">{Number(item.rate || 0).toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right font-mono font-semibold">
                        {Number(item.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={2} className="border border-gray-300 p-2 text-right">TOTALS:</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">{data.totalBoxes}</td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2 text-right font-mono text-amber-800">
                      {data.totalWeight} KG
                    </td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2 text-right font-mono text-emerald-800">
                      {formatCurrency(data.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {type === 'payment' && (
            <div>
              <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Party / Description:</span>
                  <span className="font-bold text-purple-900">{data.description}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Payment Category:</span>
                  <span className="font-bold text-gray-800">{data.partyType}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Contact:</span>
                  <span className="font-bold text-gray-800">{data.contactNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Voucher:</span>
                  <span className="font-bold text-purple-700">{formatCurrency(data.totalAmount)}</span>
                </div>
              </div>

              {data.returnRmb && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-xs">
                  <h4 className="font-bold text-blue-900 mb-1">Return RMB Information:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>RMB Amount: <strong className="font-mono">¥ {data.returnRmb.rmbAmount}</strong></div>
                    <div>Exchange Rate: <strong className="font-mono">1 RMB = {data.returnRmb.exchangeRate} TK</strong></div>
                    <div>BDT Equivalent: <strong className="font-mono text-emerald-700">{formatCurrency(data.returnRmb.bdtAmount)}</strong></div>
                  </div>
                </div>
              )}

              <table className="w-full text-xs border border-gray-300 mb-6">
                <thead>
                  <tr className="bg-[#6b21a8] text-white">
                    <th className="border border-gray-300 p-2 text-left">SL</th>
                    <th className="border border-gray-300 p-2 text-left">PARTICULARS / DESCRIPTION</th>
                    <th className="border border-gray-300 p-2 text-right">DEBIT (TK)</th>
                    <th className="border border-gray-300 p-2 text-right">CREDIT (TK)</th>
                    <th className="border border-gray-300 p-2 text-right">BALANCE (TK)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.map((item: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-2 text-center text-gray-500">{idx + 1}</td>
                      <td className="border border-gray-300 p-2 font-medium">{item.description}</td>
                      <td className="border border-gray-300 p-2 text-right font-mono text-blue-700">
                        {Number(item.debitAmount || 0).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2 text-right font-mono text-emerald-700">
                        {Number(item.creditAmount || 0).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2 text-right font-mono font-semibold">
                        {Number(item.balance || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-gray-50 border border-gray-300 rounded p-3 ml-auto w-72 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600">Previous Ledger Amount:</span>
                  <span className="font-mono">{formatCurrency(data.previousAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Amount:</span>
                  <span className="font-mono text-emerald-600">{formatCurrency(data.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-1 font-bold">
                  <span>Balance Due:</span>
                  <span className="font-mono text-purple-800">{formatCurrency(data.balance || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {type === 'daily_summary' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs flex justify-between">
                <div><strong>Summary Date:</strong> {data.date}</div>
                <div><strong>Generated At:</strong> {new Date().toLocaleTimeString()}</div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-gray-700 mb-1">Purchases for Date ({data.purchases.length})</h4>
                <table className="w-full text-xs border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1.5 text-left">Invoice</th>
                      <th className="border p-1.5 text-left">Description</th>
                      <th className="border p-1.5 text-right">Quantity</th>
                      <th className="border p-1.5 text-right">Total (TK)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.purchases.map((p: any) => (
                      <tr key={p.id}>
                        <td className="border p-1.5 font-mono">{p.invoiceNumber}</td>
                        <td className="border p-1.5">{p.description}</td>
                        <td className="border p-1.5 text-right font-mono">{p.totalQty}</td>
                        <td className="border p-1.5 text-right font-mono">{formatCurrency(p.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-bold text-xs text-gray-700 mb-1">Packing / Exports for Date ({data.packings.length})</h4>
                <table className="w-full text-xs border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1.5 text-left">Packing List #</th>
                      <th className="border p-1.5 text-left">Shipping Mark</th>
                      <th className="border p-1.5 text-left">Flight</th>
                      <th className="border p-1.5 text-right">Total Weight (KG)</th>
                      <th className="border p-1.5 text-right">Amount (TK)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.packings.map((p: any) => (
                      <tr key={p.id}>
                        <td className="border p-1.5 font-mono">{p.invoiceNumber}</td>
                        <td className="border p-1.5 font-semibold text-amber-700">{p.shippingMark}</td>
                        <td className="border p-1.5">{p.flight} &bull; {p.destination}</td>
                        <td className="border p-1.5 text-right font-mono font-bold">{p.totalWeight} KG</td>
                        <td className="border p-1.5 text-right font-mono">{formatCurrency(p.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Signatures Footer */}
          <div className="mt-12 pt-8 border-t border-gray-300 grid grid-cols-3 gap-8 text-center text-xs text-gray-500">
            <div>
              <div className="border-b border-gray-400 pb-1 mb-1 mx-4"></div>
              <span>Prepared By</span>
            </div>
            <div>
              <div className="border-b border-gray-400 pb-1 mb-1 mx-4"></div>
              <span>Checked &amp; Verified</span>
            </div>
            <div>
              <div className="border-b border-gray-400 pb-1 mb-1 mx-4"></div>
              <span>Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
