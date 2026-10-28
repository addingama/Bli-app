/**
 * Database Types for BliApp
 * TypeScript interfaces untuk semua tabel database
 */

// ==========================================
// MASTER DATA TYPES
// ==========================================

export interface Barang {
  id: number;
  nama: string;
  kategori?: string;
  satuan_default: string;
  grades?: string; // JSON array: ["A","B","C"]
  status: 'aktif' | 'nonaktif';
  harga_beli_terakhir: number;
  harga_jual_terakhir: number;
  stok_alert_minimum: number;
  katalog: 'beli' | 'jual';
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  nama: string;
  nomor_hp?: string;
  alamat?: string;
  jenis: 'langganan' | 'walk-in';
  total_transaksi: number;
  total_pembelian: number;
  created_at: string;
  updated_at: string;
}

export interface Pembeli {
  id: number;
  nama: string;
  nomor_hp?: string;
  alamat?: string;
  total_transaksi: number;
  total_penjualan: number;
  created_at: string;
  updated_at: string;
}

export interface KategoriPengeluaran {
  id: number;
  nama: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface Pengeluaran {
  id: number;
  tanggal: string;
  kategori_id: number | null;
  kategori_nama: string;
  nominal: number;
  metode_bayar: 'cash' | 'transfer';
  catatan?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// TRANSAKSI TYPES
// ==========================================

export interface Transaksi {
  id: number;
  nomor_transaksi: string; // TRX-BUY-YYYYMMDD-NNN or TRX-SELL-YYYYMMDD-NNN
  jenis: 'beli' | 'jual';
  tanggal: string;
  supplier_id?: number;
  supplier_nama?: string;
  pembeli_id?: number;
  pembeli_nama?: string;
  nomor_hp?: string;
  total_items: number;
  total_nilai: number;
  metode_bayar: 'cash' | 'transfer';
  status: 'lunas' | 'pending' | 'batal';
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface TransaksiItem {
  id: number;
  transaksi_id: number;
  barang_id?: number;
  barang_nama: string;
  barang_kategori?: string;
  grade?: string;
  quantity: number;
  satuan: string;
  harga_satuan: number;
  sub_total: number;
  catatan?: string;
  created_at: string;
}

// ==========================================
// STOK TYPES
// ==========================================

export interface Stok {
  id: number;
  barang_id: number;
  barang_nama: string;
  grade?: string;
  quantity: number;
  satuan: string;
  harga_beli_rata: number;
  total_nilai: number;
  updated_at: string;
}

export interface StokMutasi {
  id: number;
  barang_id: number;
  grade?: string;
  tanggal: string;
  jenis_mutasi: 'masuk' | 'keluar' | 'adjustment';
  transaksi_id?: number;
  nomor_transaksi?: string;
  quantity_masuk: number;
  quantity_keluar: number;
  saldo: number;
  satuan: string;
  harga_satuan: number;
  nilai_mutasi: number;
  keterangan?: string;
}

// ==========================================
// FOTO TYPES
// ==========================================

export interface TransaksiFoto {
  id: number;
  transaksi_id: number;
  file_path: string;
  catatan?: string;
  created_at: string;
}

// ==========================================
// VIEW TYPES
// ==========================================

export interface RingkasanStok {
  barang_id: number;
  barang_nama: string;
  kategori?: string;
  katalog?: 'beli' | 'jual';
  grade?: string;
  stok_quantity: number;
  satuan?: string;
  harga_beli_rata: number;
  total_nilai_stok: number;
  harga_jual_terakhir: number;
  status: string;
}

export interface LaporanHarian {
  tanggal: string;
  total_pembelian: number;
  total_penjualan: number;
  total_pengeluaran: number;
  keuntungan_kotor: number;
}

// ==========================================
// INPUT TYPES (untuk Form)
// ==========================================

export interface BarangInput {
  nama: string;
  kategori?: string;
  katalog: 'beli' | 'jual';
  satuan_default: string;
  grades?: string[];
  status?: 'aktif' | 'nonaktif';
  stok_alert_minimum?: number;
}

export interface SupplierInput {
  nama: string;
  nomor_hp?: string;
  alamat?: string;
  jenis?: 'langganan' | 'walk-in';
}

export interface PembeliInput {
  nama: string;
  nomor_hp?: string;
  alamat?: string;
}

export interface KategoriPengeluaranInput {
  nama: string;
  status?: 'aktif' | 'nonaktif';
}

export interface PengeluaranInput {
  tanggal: string;
  kategori_id: number;
  nominal: number;
  metode_bayar: 'cash' | 'transfer';
  catatan?: string;
}

export interface TransaksiItemInput {
  barang_id?: number;
  barang_nama: string;
  barang_kategori?: string;
  grade?: string;
  quantity: number;
  satuan: string;
  harga_satuan: number;
  sub_total: number;
  catatan?: string;
}

export interface TransaksiInput {
  jenis: 'beli' | 'jual';
  tanggal?: string;
  supplier_id?: number;
  supplier_nama?: string;
  pembeli_id?: number;
  pembeli_nama?: string;
  nomor_hp?: string;
  items: TransaksiItemInput[];
  total_nilai: number;
  metode_bayar: 'cash' | 'transfer';
  catatan?: string;
}

// ==========================================
// RESPONSE TYPES
// ==========================================

export interface TransaksiResponse {
  success: boolean;
  transaksi_id: number;
  nomor_transaksi: string;
  struk_wa?: string;
  error?: string;
}

// ==========================================
// QUERY RESULT TYPES
// ==========================================

export interface DashboardSummary {
  total_pembelian: number;
  total_penjualan: number;
  jumlah_transaksi_beli: number;
  jumlah_transaksi_jual: number;
  keuntungan_kotor: number;
  total_stok_items: number;
  total_nilai_stok: number;
}

export interface TransaksiWithItems extends Transaksi {
  items: TransaksiItem[];
}

export interface StokWithMutasi extends Stok {
  mutasi: StokMutasi[];
}
