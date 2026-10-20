export type SheetTab =
  | 'dashboard'
  | 'purchase_form'
  | 'packing_form'
  | 'payment_form'
  | 'pnl_summary'
  | 'purchase_db'
  | 'packing_db'
  | 'payment_db'
  | 'settings';

export type CurrencyCode = 'BDT' | 'USD' | 'RMB';

export interface DailyExchangeRates {
  date: string; // YYYY-MM-DD
  usdToRmb: number; // e.g. 7.24 (1 USD = 7.24 RMB)
  rmbToBdt: number; // e.g. 16.85 (1 RMB = 16.85 TK)
  usdToBdt: number; // e.g. 122.00 (1 USD = 122.00 TK)
  lastUpdated?: string;
  notes?: string;
}

export type WatermarkPosition =
  | 'center'
  | 'top-center'
  | 'bottom-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface WatermarkSettings {
  text: string;
  enabled: boolean;
  position: WatermarkPosition;
  opacity: number;
  rotationAngle: number;
  fontSize: number;
  color: string;
}

export interface DropdownSettings {
  purchaseDescriptions: string[];
  shippingMarks: string[];
  flights: string[];
  destinations: string[];
  shippers: string[];
  items: string[];
  boxes: string[];
  weights: string[];
  units: string[];
  suppliersAndExporters: string[];
  rmbExchangeRate: number; // base backward-compat (e.g. 1 RMB = 16.85 TK)
  dailyRates?: DailyExchangeRates;
  rateHistory?: DailyExchangeRates[];
  watermark?: WatermarkSettings;
}

export interface PurchaseLineItem {
  id: string;
  item: string;
  quantity: number | '';
  rate: number | '';
  previousAmount?: number | '';
  paidAmount?: number | '';
}

export interface PurchaseRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  description: string;
  contactNumber: string;
  items: PurchaseLineItem[];
  totalQty: number;
  totalAmount: number;
  previousAmount: number;
  paidAmount: number;
  balance: number;
  createdAt: string;
  remarks?: string;
}

export interface PackingLineItem {
  id: string;
  item: string;
  box: number | '';
  weight: number | '';
  unit: string;
  rate: number | '';
  totalWeight: number;
  amount: number;
}

export interface PackingRecord {
  id: string;
  invoiceNumber: string;
  shippingMark: string;
  flight: string;
  destination: string;
  shipper: string;
  packingDate: string;
  fromDate: string;
  toDate: string;
  items: PackingLineItem[];
  totalBoxes: number;
  totalWeight: number;
  totalAmount: number;
  createdAt: string;
  remarks?: string;
}

export interface PaymentLineItem {
  id: string;
  description: string;
  debitAmount: number | '';
  creditAmount: number | '';
  balance: number;
  currency?: CurrencyCode;
  originalAmount?: number | '';
}

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  partyType: 'Supplier' | 'Exporter' | 'Return RMB';
  description: string; // party name
  contactNumber: string;
  currency?: CurrencyCode;
  conversionDetails?: {
    originalCurrency: CurrencyCode;
    originalAmount: number;
    usdToRmbRate?: number;
    rmbToBdtRate?: number;
    usdToBdtRate?: number;
    convertedBdt: number;
    convertedRmb?: number;
  };
  items: PaymentLineItem[];
  totalAmount: number;
  previousAmount: number;
  paidAmount: number;
  balance: number;
  returnRmb?: {
    rmbAmount: number;
    exchangeRate: number; // RMB to BDT
    bdtAmount: number;
    linkedExportDocument?: string;
    usdAmount?: number;
    usdToRmbRate?: number;
  };
  createdAt: string;
  remarks?: string;
}

export interface SearchFilter {
  query: string;
  type: 'all' | 'purchase' | 'packing' | 'payment';
  dateFrom?: string;
  dateTo?: string;
  shippingMark?: string;
  destination?: string;
  supplier?: string;
}
