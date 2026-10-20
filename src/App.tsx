/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ExcelHeader } from './components/ExcelHeader';
import { SheetTabBar } from './components/SheetTabBar';
import { DashboardSheet } from './components/sheets/DashboardSheet';
import { PurchaseFormSheet } from './components/sheets/PurchaseFormSheet';
import { PackingFormSheet } from './components/sheets/PackingFormSheet';
import { PaymentFormSheet } from './components/sheets/PaymentFormSheet';
import { ProfitLossSheet } from './components/sheets/ProfitLossSheet';
import { DatabaseViewerSheet } from './components/sheets/DatabaseViewerSheet';
import { SettingsSheet } from './components/sheets/SettingsSheet';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { BatchPrintModal } from './components/BatchPrintModal';
import { CheckCircle2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    toastMessage,
    isBatchPrintOpen,
    setIsBatchPrintOpen,
  } = useApp();

  const getSheetTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'ZSB AQUATICS | BUSINESS CONTROL CENTER';
      case 'purchase_form':
        return 'ZSB AQUATICS | Purchase Challan / Bill – Data Entry Form';
      case 'packing_form':
        return 'ZSB AQUATICS | Packing List – Data Entry Form';
      case 'payment_form':
        return 'ZSB AQUATICS | Supplier & Exporter Payment – System Design';
      case 'pnl_summary':
        return 'ZSB AQUATICS | Profit & Loss & Daily Summary Report';
      case 'purchase_db':
        return 'ZSB AQUATICS | Purchase Database (PURCHASE DB)';
      case 'packing_db':
        return 'ZSB AQUATICS | Packing List Database (PACKING DB)';
      case 'payment_db':
        return 'ZSB AQUATICS | Payment Database (PAYMENT DB)';
      case 'settings':
        return 'ZSB AQUATICS | System Settings & Dropdown Configuration';
      default:
        return 'ZSB AQUATICS | BUSINESS CONTROL CENTER';
    }
  };

  const getSheetSubtitle = () => {
    switch (activeTab) {
      case 'purchase_form':
        return 'DAILY PURCHASE INVOICE & CHALLAN GENERATOR • PDF FORMAT';
      case 'packing_form':
        return 'EXPORT SHIPMENT SPECIFICATION • FLIGHT & WEIGHT CALCULATION';
      case 'payment_form':
        return 'SUPPLIER & EXPORTER LEDGER • RETURN RMB ON EXPORT GOODS';
      case 'pnl_summary':
        return 'COST VS REVENUE ANALYSIS • DAILY EXPORT SUMMARY';
      default:
        return 'PURCHASE • SUPPLIER PAYMENTS • PACKING & SHIPMENT RECORDS';
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans text-gray-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* Excel Top Header & Ribbon */}
      <ExcelHeader sheetTitle={getSheetTitle()} sheetSubtitle={getSheetSubtitle()} />

      {/* Main Sheet Workspace */}
      <main className="flex-1 overflow-y-auto pb-4">
        {activeTab === 'dashboard' && <DashboardSheet />}
        {activeTab === 'purchase_form' && <PurchaseFormSheet />}
        {activeTab === 'packing_form' && <PackingFormSheet />}
        {activeTab === 'payment_form' && <PaymentFormSheet />}
        {activeTab === 'pnl_summary' && <ProfitLossSheet />}
        {activeTab === 'purchase_db' && <DatabaseViewerSheet type="purchase_db" />}
        {activeTab === 'packing_db' && <DatabaseViewerSheet type="packing_db" />}
        {activeTab === 'payment_db' && <DatabaseViewerSheet type="payment_db" />}
        {activeTab === 'settings' && <SettingsSheet />}
      </main>

      {/* Excel Bottom Workbook Tab Bar */}
      <SheetTabBar />

      {/* High Fidelity PDF & Print Document Modal */}
      <DocumentPreviewModal />

      {/* Batch Print End-of-Month Modal */}
      <BatchPrintModal
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
      />

      {/* Toast notification popup */}
      {toastMessage && (
        <div className="fixed bottom-14 right-4 z-50 bg-[#12284c] text-white px-4 py-2.5 rounded-lg shadow-xl border border-blue-400 flex items-center space-x-2 animate-in slide-in-from-bottom-3 duration-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
