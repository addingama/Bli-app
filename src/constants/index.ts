/**
 * Application Constants - BliApp
 * Centralized constants for configuration and data
 */

// ==========================================
// APP INFO
// ==========================================

export const APP_NAME = 'BliApp';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Aplikasi Pengepul - Manajemen Transaksi & Stok';

// ==========================================
// DATABASE
// ==========================================

export const DATABASE_NAME = 'bliapp.db';
export const DATABASE_VERSION = 1;

// ==========================================
// TRANSACTION
// ==========================================

export const TRANSACTION_PREFIX = {
  BUY: 'TRX-BUY',
  SELL: 'TRX-SELL',
} as const;

export const TRANSACTION_STATUS = {
  LUNAS: 'lunas',
  PENDING: 'pending',
  BATAL: 'batal',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  TRANSFER: 'transfer',
} as const;

// ==========================================
// STOCK
// ==========================================

export const STOCK_MUTATION_TYPES = {
  MASUK: 'masuk',
  KELUAR: 'keluar',
  ADJUSTMENT: 'adjustment',
} as const;

export const DEFAULT_SATUAN = [
  'kg',
  'unit',
  'ikat',
  'karung',
  'ton',
  'gram',
] as const;

export const DEFAULT_GRADES = [
  'A',
  'B',
  'C',
] as const;

// ==========================================
// CATEGORIES
// ==========================================

export const BARANG_CATEGORIES = [
  'Plastik',
  'Kertas',
  'Logam',
  'Kaca',
  'Elektronik',
  'Lainnya',
] as const;

export const SUPPLIER_TYPES = {
  LANGGANAN: 'langganan',
  WALK_IN: 'walk-in',
} as const;

// ==========================================
// VALIDATION
// ==========================================

export const VALIDATION = {
  MAX_TRANSACTION_VALUE: 100000000, // Rp 100 juta
  MIN_QUANTITY: 0.01,
  MAX_QUANTITY: 999999,
  MIN_PRICE: 0,
  MAX_PRICE: 10000000, // Rp 10 juta per satuan
  MAX_ITEMS_PER_TRANSACTION: 50,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
} as const;

// ==========================================
// PAGINATION
// ==========================================

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ==========================================
// DATE FORMATS
// ==========================================

export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy, HH:mm',
  TRANSACTION_NUMBER: 'yyyyMMdd',
  SQL: 'yyyy-MM-dd HH:mm:ss',
  SQL_DATE_ONLY: 'yyyy-MM-dd',
} as const;

// ==========================================
// CURRENCY
// ==========================================

export const CURRENCY = {
  CODE: 'IDR',
  SYMBOL: 'Rp',
  LOCALE: 'id-ID',
  DECIMAL_SEPARATOR: ',',
  THOUSAND_SEPARATOR: '.',
} as const;

// ==========================================
// FILTER PRESETS
// ==========================================

export const FILTER_PRESETS = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  CUSTOM: 'custom',
} as const;

// ==========================================
// STORAGE KEYS
// ==========================================

export const STORAGE_KEYS = {
  USER_PREFERENCES: '@bliapp:user_preferences',
  LAST_BACKUP: '@bliapp:last_backup',
  ONBOARDING_COMPLETED: '@bliapp:onboarding_completed',
} as const;

// ==========================================
// ICONS (Material Community Icons)
// ==========================================

export const ICONS = {
  HOME: 'home-outline',
  HOME_ACTIVE: 'home',
  STOCK: 'package-variant-closed',
  STOCK_ACTIVE: 'package-variant',
  HISTORY: 'history',
  HISTORY_ACTIVE: 'history',
  MENU: 'menu',
  MENU_ACTIVE: 'menu',
  BUY: 'cart-outline',
  SELL: 'cash-multiple',
  ADD: 'plus',
  EDIT: 'pencil',
  DELETE: 'delete',
  SEARCH: 'magnify',
  FILTER: 'filter-variant',
  EXPORT: 'file-excel',
  SHARE: 'share-variant',
  WHATSAPP: 'whatsapp',
  CALENDAR: 'calendar',
  PHONE: 'phone',
  LOCATION: 'map-marker',
  CHEVRON_RIGHT: 'chevron-right',
  CHEVRON_DOWN: 'chevron-down',
  CLOSE: 'close',
  CHECK: 'check',
  ALERT: 'alert-circle',
  INFO: 'information',
} as const;

// ==========================================
// BOTTOM NAV HEIGHT
// ==========================================

export const LAYOUT = {
  BOTTOM_NAV_HEIGHT: 64,
  HEADER_HEIGHT: 56,
  STICKY_FOOTER_HEIGHT: 104,
  MIN_TOUCH_TARGET: 48,
} as const;

// ==========================================
// DEBOUNCE TIMES (ms)
// ==========================================

export const DEBOUNCE = {
  SEARCH: 500,
  AUTO_SAVE: 1000,
} as const;

// ==========================================
// ANIMATION DURATIONS (ms)
// ==========================================

export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// ==========================================
// ERROR MESSAGES
// ==========================================

export const ERROR_MESSAGES = {
  NETWORK: 'Tidak dapat terhubung ke server',
  DATABASE: 'Terjadi kesalahan pada database',
  VALIDATION: 'Data tidak valid',
  INSUFFICIENT_STOCK: 'Stok tidak mencukupi',
  DUPLICATE_TRANSACTION: 'Nomor transaksi sudah ada',
  UNKNOWN: 'Terjadi kesalahan yang tidak diketahui',
} as const;

// ==========================================
// SUCCESS MESSAGES
// ==========================================

export const SUCCESS_MESSAGES = {
  TRANSACTION_SAVED: 'Transaksi berhasil disimpan',
  BARANG_SAVED: 'Barang berhasil disimpan',
  SUPPLIER_SAVED: 'Supplier berhasil disimpan',
  PEMBELI_SAVED: 'Pembeli berhasil disimpan',
  EXPORT_SUCCESS: 'Export berhasil',
  BACKUP_SUCCESS: 'Backup berhasil',
} as const;
