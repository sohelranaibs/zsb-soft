import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Database, Settings, BarChart2, Table } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SheetTab } from '../types';

export const SheetTabBar: React.FC = () => {
  const { activeTab, setActiveTab, purchases, packings, payments } = useApp();

  const tabs: { id: SheetTab; label: string; sheetNumber?: string; count?: number; color: string }[] = [
    { id: 'dashboard', label: 'Sheet 1: Dashboard', color: 'border-b-blue-600 text-blue-900 bg-white' },
    { id: 'purchase_form', label: 'Sheet 2: Purchase Form', color: 'border-b-pink-600 text-pink-900 bg-white' },
    { id: 'packing_form', label: 'Sheet 3: Packing List', color: 'border-b-amber-600 text-amber-900 bg-white' },
    { id: 'payment_form', label: 'Sheet 4: Payments', color: 'border-b-purple-600 text-purple-900 bg-white' },
    { id: 'pnl_summary', label: 'Sheet 5: P&L & Summary', color: 'border-b-emerald-600 text-emerald-900 bg-white' },
    { id: 'purchase_db', label: 'Purchase DB', count: purchases.length, color: 'border-b-blue-500 text-blue-900 bg-blue-50/50' },
    { id: 'packing_db', label: 'Packing DB', count: packings.length, color: 'border-b-teal-500 text-teal-900 bg-teal-50/50' },
    { id: 'payment_db', label: 'Payment DB', count: payments.length, color: 'border-b-purple-500 text-purple-900 bg-purple-50/50' },
    { id: 'settings', label: 'Settings & Lists', color: 'border-b-slate-600 text-slate-800 bg-gray-50' },
  ];

  const handleNextTab = () => {
    const idx = tabs.findIndex(t => t.id === activeTab);
    const nextIdx = (idx + 1) % tabs.length;
    setActiveTab(tabs[nextIdx].id);
  };

  const handlePrevTab = () => {
    const idx = tabs.findIndex(t => t.id === activeTab);
    const prevIdx = (idx - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[prevIdx].id);
  };

  return (
    <footer className="bg-[#e2e8f0] border-t border-gray-300 py-1 px-2 select-none shrink-0 z-30 sticky bottom-0 shadow-lg">
      <div className="flex items-center justify-between text-xs overflow-x-auto gap-2">
        {/* Navigation arrow buttons */}
        <div className="flex items-center space-x-1 shrink-0 bg-gray-200 p-0.5 rounded border border-gray-300">
          <button
            onClick={handlePrevTab}
            title="Previous Sheet"
            className="p-1 hover:bg-gray-300 rounded text-gray-700 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextTab}
            title="Next Sheet"
            className="p-1 hover:bg-gray-300 rounded text-gray-700 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            title="Add or configure custom sheet"
            className="p-1 hover:bg-gray-300 rounded text-gray-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Workbook Sheets Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto flex-1 scrollbar-none py-0.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t font-semibold text-xs transition-all shrink-0 cursor-pointer border-t-2 ${
                  isActive
                    ? 'bg-white text-gray-900 border-t-blue-600 shadow-sm border-x border-gray-300'
                    : 'bg-gray-200 hover:bg-gray-100 text-gray-600 border-t-transparent border-x border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Excel status bar right indicators */}
        <div className="hidden lg:flex items-center space-x-3 text-[11px] text-gray-500 font-mono shrink-0 pl-2 border-l border-gray-300">
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> READY
          </span>
          <span>CALC: AUTO</span>
        </div>
      </div>
    </footer>
  );
};
