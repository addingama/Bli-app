/**
 * TypeScript Type Definitions - BliApp
 * Common types used across the application
 */

// Re-export database types
export * from '../database/types';

// ==========================================
// NAVIGATION TYPES
// ==========================================

export type RootStackParamList = {
  Main: undefined;
  BuyTransaction: undefined;
  SellTransaction: undefined;
  TransactionSuccess: {
    transaksiId: number;
    nomorTransaksi: string;
    jenis: 'beli' | 'jual';
  };
  TransactionDetail: {
    transaksiId: number;
  };
  LaporanKeuangan: undefined;
  LaporanStok: undefined;
  LaporanBarang: undefined;
  BackupExport: undefined;
  TentangAplikasi: undefined;
  StockDetail: {
    barangId: number;
  };
  AddItem: {
    jenis: 'beli' | 'jual';
    onItemAdded: (item: TransaksiItemInput) => void;
  };
  // Master Data Barang
  BarangList: undefined;
  BarangForm: {
    mode: 'create' | 'edit';
    barangId?: number;
  };
  // Master Data Supplier
  SupplierList: undefined;
  SupplierForm: {
    mode: 'create' | 'edit';
    supplierId?: number;
  };
  // Master Data Pembeli
  PembeliList: undefined;
  PembeliForm: {
    mode: 'create' | 'edit';
    pembeliId?: number;
  };
  // Legacy (keep for backwards compatibility)
  MasterBarang: undefined;
  FormBarang: {
    barangId?: number;
  };
  MasterSupplier: undefined;
  FormSupplier: {
    supplierId?: number;
  };
  MasterPembeli: undefined;
  FormPembeli: {
    pembeliId?: number;
  };
};

export type BottomTabParamList = {
  Home: undefined;
  Stock: undefined;
  History: undefined;
  Menu: undefined;
};

// ==========================================
// COMPONENT PROPS TYPES
// ==========================================

export interface TransactionCardProps {
  transaksi: Transaksi;
  onPress: () => void;
}

export interface StockCardProps {
  stok: RingkasanStok;
  onPress: () => void;
}

export interface ItemCardProps {
  item: TransaksiItemInput;
  onEdit?: () => void;
  onRemove?: () => void;
  editable?: boolean;
}

export interface SummaryCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: string;
  color?: string;
}

// ==========================================
// FORM STATE TYPES
// ==========================================

export interface BuyTransactionFormState {
  supplier_id?: number;
  supplier_nama?: string;
  nomor_hp?: string;
  items: TransaksiItemInput[];
  metode_bayar: 'cash' | 'transfer';
  catatan?: string;
}

export interface SellTransactionFormState {
  pembeli_id?: number;
  pembeli_nama?: string;
  nomor_hp?: string;
  items: TransaksiItemInput[];
  metode_bayar: 'cash' | 'transfer';
  catatan?: string;
}

export interface AddItemFormState {
  barang_id?: number;
  barang_nama: string;
  barang_kategori?: string;
  grade?: string;
  quantity: string;
  satuan: string;
  harga_satuan: string;
  catatan?: string;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type JenisTransaksi = 'beli' | 'jual';
export type StatusTransaksi = 'lunas' | 'pending' | 'batal';
export type MetodeBayar = 'cash' | 'transfer';
export type StatusBarang = 'aktif' | 'nonaktif';
export type JenisSupplier = 'langganan' | 'walk-in';

// ==========================================
// FILTER TYPES
// ==========================================

export interface TransactionFilter {
  jenis?: JenisTransaksi[];
  status?: StatusTransaksi[];
  metode_bayar?: MetodeBayar[];
  tanggal_dari?: string;
  tanggal_sampai?: string;
  search?: string;
}

export interface StockFilter {
  kategori?: string[];
  status?: StatusBarang[];
  low_stock?: boolean;
  search?: string;
}

// ==========================================
// API/QUERY TYPES
// ==========================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==========================================
// EXPORT TYPES
// ==========================================

export interface ExcelExportOptions {
  filename: string;
  includeHeaders: boolean;
  dateFormat?: string;
}

// ==========================================
// WHATSAPP TYPES
// ==========================================

export interface WhatsAppMessage {
  recipient?: string;
  message: string;
}

// Import from database types
import type {
  Transaksi,
  TransaksiItemInput,
  RingkasanStok,
} from '../database/types';
