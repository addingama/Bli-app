/**
 * Database Schema for BliApp
 * Version: 1.0.0
 * Description: Database schema untuk aplikasi pengepul BliApp
 */

export const DATABASE_SCHEMA = `
-- BliApp Database Schema
-- Version: 1.0.0
-- Description: Database schema untuk aplikasi pengepul BliApp

-- ==========================================
-- MASTER DATA
-- ==========================================

-- Master Barang dengan stok tracking
CREATE TABLE IF NOT EXISTS barang (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  kategori TEXT,
  satuan_default TEXT NOT NULL DEFAULT 'kg',
  grades TEXT,
  status TEXT DEFAULT 'aktif',
  harga_beli_terakhir REAL DEFAULT 0,
  harga_jual_terakhir REAL DEFAULT 0,
  stok_alert_minimum REAL DEFAULT 0,
  katalog TEXT NOT NULL DEFAULT 'jual',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Master Supplier/Perorangan
CREATE TABLE IF NOT EXISTS supplier (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  nomor_hp TEXT,
  alamat TEXT,
  jenis TEXT DEFAULT 'walk-in',
  total_transaksi INTEGER DEFAULT 0,
  total_pembelian REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Master kategori pengeluaran operasional
CREATE TABLE IF NOT EXISTS kategori_pengeluaran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL COLLATE NOCASE UNIQUE,
  status TEXT NOT NULL DEFAULT 'aktif',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Master Pembeli/Pabrik
CREATE TABLE IF NOT EXISTS pembeli (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  nomor_hp TEXT,
  alamat TEXT,
  total_transaksi INTEGER DEFAULT 0,
  total_penjualan REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TRANSAKSI
-- ==========================================

-- Header Transaksi (Beli & Jual)
CREATE TABLE IF NOT EXISTS transaksi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_transaksi TEXT UNIQUE NOT NULL,
  jenis TEXT NOT NULL,
  tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  supplier_id INTEGER,
  supplier_nama TEXT,
  pembeli_id INTEGER,
  pembeli_nama TEXT,
  nomor_hp TEXT,
  total_items INTEGER DEFAULT 0,
  total_nilai REAL NOT NULL,
  metode_bayar TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'lunas',
  catatan TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES supplier(id),
  FOREIGN KEY (pembeli_id) REFERENCES pembeli(id)
);

-- Detail Item Transaksi
CREATE TABLE IF NOT EXISTS transaksi_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaksi_id INTEGER NOT NULL,
  barang_id INTEGER,
  barang_nama TEXT NOT NULL,
  barang_kategori TEXT,
  grade TEXT,
  quantity REAL NOT NULL,
  satuan TEXT NOT NULL,
  harga_satuan REAL NOT NULL,
  sub_total REAL NOT NULL,
  catatan TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE,
  FOREIGN KEY (barang_id) REFERENCES barang(id)
);

-- Pengeluaran operasional (tidak mengubah stok)
CREATE TABLE IF NOT EXISTS pengeluaran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kategori_id INTEGER,
  kategori_nama TEXT NOT NULL,
  nominal REAL NOT NULL,
  metode_bayar TEXT NOT NULL DEFAULT 'cash',
  catatan TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategori_pengeluaran(id)
);

-- ==========================================
-- STOK
-- ==========================================

-- Stok Real-time per Barang
CREATE TABLE IF NOT EXISTS stok (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barang_id INTEGER NOT NULL,
  barang_nama TEXT NOT NULL,
  grade TEXT,
  quantity REAL NOT NULL DEFAULT 0,
  satuan TEXT NOT NULL,
  harga_beli_rata REAL DEFAULT 0,
  total_nilai REAL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE,
  UNIQUE(barang_id, grade)
);

-- ==========================================
-- MUTASI STOK (Audit Trail)
-- ==========================================

-- History pergerakan stok (untuk kartu stok)
CREATE TABLE IF NOT EXISTS stok_mutasi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barang_id INTEGER NOT NULL,
  grade TEXT,
  tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  jenis_mutasi TEXT NOT NULL,
  transaksi_id INTEGER,
  nomor_transaksi TEXT,
  quantity_masuk REAL DEFAULT 0,
  quantity_keluar REAL DEFAULT 0,
  saldo REAL NOT NULL,
  satuan TEXT NOT NULL,
  harga_satuan REAL DEFAULT 0,
  nilai_mutasi REAL DEFAULT 0,
  keterangan TEXT,
  FOREIGN KEY (barang_id) REFERENCES barang(id),
  FOREIGN KEY (transaksi_id) REFERENCES transaksi(id)
);

-- ==========================================
-- OPTIONAL: FOTO
-- ==========================================

CREATE TABLE IF NOT EXISTS transaksi_foto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaksi_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  catatan TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE
);

-- ==========================================
-- INDEXES untuk Performance
-- ==========================================

-- Transaksi indexes
CREATE INDEX IF NOT EXISTS idx_transaksi_jenis ON transaksi(jenis);
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi(tanggal);
CREATE INDEX IF NOT EXISTS idx_transaksi_status ON transaksi(status);
CREATE INDEX IF NOT EXISTS idx_transaksi_supplier ON transaksi(supplier_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_pembeli ON transaksi(pembeli_id);

-- Transaksi item indexes
CREATE INDEX IF NOT EXISTS idx_transaksi_item_transaksi ON transaksi_item(transaksi_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_item_barang ON transaksi_item(barang_id);

-- Stok indexes
CREATE INDEX IF NOT EXISTS idx_stok_barang ON stok(barang_id);

-- Pengeluaran indexes
CREATE INDEX IF NOT EXISTS idx_pengeluaran_tanggal ON pengeluaran(tanggal);
CREATE INDEX IF NOT EXISTS idx_pengeluaran_kategori ON pengeluaran(kategori_id);

-- Mutasi stok indexes
CREATE INDEX IF NOT EXISTS idx_mutasi_barang ON stok_mutasi(barang_id);
CREATE INDEX IF NOT EXISTS idx_mutasi_tanggal ON stok_mutasi(tanggal);
CREATE INDEX IF NOT EXISTS idx_mutasi_transaksi ON stok_mutasi(transaksi_id);

-- ==========================================
-- VIEWS untuk Reporting
-- ==========================================

-- View: Ringkasan Stok (katalog penjualan saja, termasuk saldo 0)
CREATE VIEW IF NOT EXISTS v_ringkasan_stok AS
SELECT 
  b.id as barang_id,
  b.nama as barang_nama,
  b.kategori,
  b.katalog,
  s.grade,
  COALESCE(s.quantity, 0) as stok_quantity,
  COALESCE(s.satuan, b.satuan_default) as satuan,
  COALESCE(s.harga_beli_rata, 0) as harga_beli_rata,
  COALESCE(s.total_nilai, 0) as total_nilai_stok,
  b.harga_jual_terakhir,
  b.status
FROM barang b
LEFT JOIN stok s ON b.id = s.barang_id
WHERE b.status = 'aktif' AND b.katalog = 'jual';

-- View: Laporan Keuangan Harian
CREATE VIEW IF NOT EXISTS v_laporan_harian AS
SELECT
  hari as tanggal,
  SUM(total_pembelian) as total_pembelian,
  SUM(total_penjualan) as total_penjualan,
  SUM(total_pengeluaran) as total_pengeluaran,
  SUM(total_penjualan) - SUM(total_pembelian) as keuntungan_kotor
FROM (
  SELECT
    DATE(tanggal) as hari,
    CASE WHEN jenis = 'beli' THEN total_nilai ELSE 0 END as total_pembelian,
    CASE WHEN jenis = 'jual' THEN total_nilai ELSE 0 END as total_penjualan,
    0 as total_pengeluaran
  FROM transaksi
  WHERE status = 'lunas'
  UNION ALL
  SELECT
    DATE(tanggal) as hari,
    0 as total_pembelian,
    0 as total_penjualan,
    nominal as total_pengeluaran
  FROM pengeluaran
) AS harian
GROUP BY hari;
`;

/** Replaced on every launch so expense days appear in the daily report. */
export const LAPORAN_HARIAN_VIEW_SQL = `
CREATE VIEW v_laporan_harian AS
SELECT
  hari as tanggal,
  SUM(total_pembelian) as total_pembelian,
  SUM(total_penjualan) as total_penjualan,
  SUM(total_pengeluaran) as total_pengeluaran,
  SUM(total_penjualan) - SUM(total_pembelian) as keuntungan_kotor
FROM (
  SELECT
    DATE(tanggal) as hari,
    CASE WHEN jenis = 'beli' THEN total_nilai ELSE 0 END as total_pembelian,
    CASE WHEN jenis = 'jual' THEN total_nilai ELSE 0 END as total_penjualan,
    0 as total_pengeluaran
  FROM transaksi
  WHERE status = 'lunas'
  UNION ALL
  SELECT
    DATE(tanggal) as hari,
    0 as total_pembelian,
    0 as total_penjualan,
    nominal as total_pengeluaran
  FROM pengeluaran
) AS harian
GROUP BY hari
`;

/** Replaced on every launch so existing installs pick up katalog filtering. */
export const RINGKASAN_STOK_VIEW_SQL = `
CREATE VIEW v_ringkasan_stok AS
SELECT 
  b.id as barang_id,
  b.nama as barang_nama,
  b.kategori,
  b.katalog,
  s.grade,
  COALESCE(s.quantity, 0) as stok_quantity,
  COALESCE(s.satuan, b.satuan_default) as satuan,
  COALESCE(s.harga_beli_rata, 0) as harga_beli_rata,
  COALESCE(s.total_nilai, 0) as total_nilai_stok,
  b.harga_jual_terakhir,
  b.status
FROM barang b
LEFT JOIN stok s ON b.id = s.barang_id
WHERE b.status = 'aktif' AND b.katalog = 'jual'
`;
