import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SheetTab,
  DropdownSettings,
  DailyExchangeRates,
  PurchaseRecord,
  PackingRecord,
  PaymentRecord,
  WatermarkSettings,
} from '../types';
import {
  INITIAL_DROPDOWNS,
  INITIAL_PURCHASES,
  INITIAL_PACKINGS,
  INITIAL_PAYMENTS,
} from '../data/initialData';
import { DEFAULT_WATERMARK_SETTINGS, validateWatermarkSettings } from '../utils/watermark';

export interface PreviewDocument {
  type: 'purchase' | 'packing' | 'payment' | 'monthly_statement' | 'daily_summary';
  title: string;
  data: any;
}

interface AppContextType {
  activeTab: SheetTab;
  setActiveTab: (tab: SheetTab) => void;
  dropdowns: DropdownSettings;
  addDropdownOption: (category: keyof DropdownSettings, value: string) => void;
  deleteDropdownOption: (category: keyof DropdownSettings, value: string) => void;
  updateRmbRate: (rate: number) => void;
  updateDailyRates: (rates: Partial<DailyExchangeRates>) => void;
  purchases: PurchaseRecord[];
  addPurchase: (record: PurchaseRecord) => void;
  deletePurchase: (id: string) => void;
  packings: PackingRecord[];
  addPacking: (record: PackingRecord) => void;
  deletePacking: (id: string) => void;
  payments: PaymentRecord[];
  addPayment: (record: PaymentRecord) => void;
  deletePayment: (id: string) => void;
  previewDoc: PreviewDocument | null;
  setPreviewDoc: (doc: PreviewDocument | null) => void;
  isBatchPrintOpen: boolean;
  setIsBatchPrintOpen: (open: boolean) => void;
  watermarkSettings: WatermarkSettings;
  updateWatermarkSettings: (settings: Partial<WatermarkSettings>) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  resetAllToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DROPDOWNS: 'zsb_dropdowns_v1',
  PURCHASES: 'zsb_purchases_v1',
  PACKINGS: 'zsb_packings_v1',
  PAYMENTS: 'zsb_payments_v1',
  WATERMARK: 'zsb_watermark_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<SheetTab>('dashboard');

  const [dropdowns, setDropdowns] = useState<DropdownSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DROPDOWNS);
      return saved ? JSON.parse(saved) : INITIAL_DROPDOWNS;
    } catch {
      return INITIAL_DROPDOWNS;
    }
  });

  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  });

  const [packings, setPackings] = useState<PackingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKINGS);
      return saved ? JSON.parse(saved) : INITIAL_PACKINGS;
    } catch {
      return INITIAL_PACKINGS;
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATERMARK);
      if (saved) {
        return validateWatermarkSettings(JSON.parse(saved));
      }
      return dropdowns.watermark || DEFAULT_WATERMARK_SETTINGS;
    } catch {
      return DEFAULT_WATERMARK_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATERMARK, JSON.stringify(watermarkSettings));
  }, [watermarkSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DROPDOWNS, JSON.stringify(dropdowns));
  }, [dropdowns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PACKINGS, JSON.stringify(packings));
  }, [packings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const addDropdownOption = (category: keyof DropdownSettings, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setDropdowns(prev => {
      const currentList = prev[category];
      if (Array.isArray(currentList)) {
        const stringList = currentList as string[];
        if (stringList.includes(trimmed)) return prev;
        return {
          ...prev,
          [category]: [...stringList, trimmed],
        };
      }
      return prev;
    });
    showToast(`Added "${trimmed}" to ${String(category)}`);
  };

  const deleteDropdownOption = (category: keyof DropdownSettings, value: string) => {
    setDropdowns(prev => {
      const currentList = prev[category];
      if (Array.isArray(currentList)) {
        const stringList = currentList as string[];
        return {
          ...prev,
          [category]: stringList.filter(item => item !== value),
        };
      }
      return prev;
    });
    showToast(`Removed "${value}" from ${String(category)}`);
  };

  const updateRmbRate = (rate: number) => {
    setDropdowns(prev => {
      const currentDaily = prev.dailyRates || {
        date: new Date().toISOString().split('T')[0],
        usdToRmb: 7.24,
        rmbToBdt: rate,
        usdToBdt: Math.round(7.24 * rate * 100) / 100,
      };
      return {
        ...prev,
        rmbExchangeRate: rate,
        dailyRates: {
          ...currentDaily,
          rmbToBdt: rate,
          usdToBdt: Math.round(currentDaily.usdToRmb * rate * 100) / 100,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
    showToast(`RMB Exchange rate updated to ${rate} TK`);
  };

  const updateDailyRates = (newRates: Partial<DailyExchangeRates>) => {
    setDropdowns(prev => {
      const existing = prev.dailyRates || {
        date: new Date().toISOString().split('T')[0],
        usdToRmb: 7.24,
        rmbToBdt: prev.rmbExchangeRate || 16.85,
        usdToBdt: 122.00,
      };

      const updatedDate = newRates.date || existing.date || new Date().toISOString().split('T')[0];
      const updatedUsdToRmb = Number(newRates.usdToRmb) > 0 ? Number(newRates.usdToRmb) : existing.usdToRmb;
      const updatedRmbToBdt = Number(newRates.rmbToBdt) > 0 ? Number(newRates.rmbToBdt) : existing.rmbToBdt;
      const updatedUsdToBdt =
        Number(newRates.usdToBdt) > 0
          ? Number(newRates.usdToBdt)
          : Math.round(updatedUsdToRmb * updatedRmbToBdt * 100) / 100;

      const updatedFull: DailyExchangeRates = {
        date: updatedDate,
        usdToRmb: updatedUsdToRmb,
        rmbToBdt: updatedRmbToBdt,
        usdToBdt: updatedUsdToBdt,
        notes: newRates.notes ?? existing.notes ?? 'Daily updated rate',
        lastUpdated: new Date().toISOString(),
      };

      // Add to or update rateHistory
      const existingHistory = prev.rateHistory || [];
      const historyFiltered = existingHistory.filter(h => h.date !== updatedDate);
      const newHistory = [updatedFull, ...historyFiltered].slice(0, 30);

      return {
        ...prev,
        rmbExchangeRate: updatedRmbToBdt,
        dailyRates: updatedFull,
        rateHistory: newHistory,
      };
    });
    showToast(`Daily Exchange rates updated for ${newRates.date || 'today'}`);
  };

  const addPurchase = (record: PurchaseRecord) => {
    setPurchases(prev => [record, ...prev]);
    showToast(`Saved Purchase invoice ${record.invoiceNumber}`);
  };

  const deletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
    showToast(`Purchase record deleted`);
  };

  const addPacking = (record: PackingRecord) => {
    setPackings(prev => [record, ...prev]);
    showToast(`Saved Packing list ${record.invoiceNumber}`);
  };

  const deletePacking = (id: string) => {
    setPackings(prev => prev.filter(p => p.id !== id));
    showToast(`Packing record deleted`);
  };

  const addPayment = (record: PaymentRecord) => {
    setPayments(prev => [record, ...prev]);
    showToast(`Saved Payment voucher ${record.invoiceNumber}`);
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    showToast(`Payment record deleted`);
  };

  const updateWatermarkSettings = (newSettings: Partial<WatermarkSettings>) => {
    setWatermarkSettings(prev => {
      const merged = validateWatermarkSettings({ ...prev, ...newSettings });
      setDropdowns(dPrev => ({ ...dPrev, watermark: merged }));
      return merged;
    });
    showToast('Updated PDF watermark branding configuration');
  };

  const resetAllToDefault = () => {
    setDropdowns(INITIAL_DROPDOWNS);
    setPurchases(INITIAL_PURCHASES);
    setPackings(INITIAL_PACKINGS);
    setPayments(INITIAL_PAYMENTS);
    setWatermarkSettings(DEFAULT_WATERMARK_SETTINGS);
    localStorage.clear();
    showToast(`Reset database and settings to default demo`);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        dropdowns,
        addDropdownOption,
        deleteDropdownOption,
        updateRmbRate,
        updateDailyRates,
        purchases,
        addPurchase,
        deletePurchase,
        packings,
        addPacking,
        deletePacking,
        payments,
        addPayment,
        deletePayment,
        previewDoc,
        setPreviewDoc,
        isBatchPrintOpen,
        setIsBatchPrintOpen,
        watermarkSettings,
        updateWatermarkSettings,
        toastMessage,
        showToast,
        resetAllToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
