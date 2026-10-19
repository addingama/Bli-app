/**
 * Database Initialization & Setup
 * Handles SQLite database creation and schema setup
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'bliapp.db';

/**
 * Open or create database
 */
export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return db;
}

/**
 * Initialize database with schema
 */
export async function initDatabase(): Promise<void> {
  try {
    console.log('[DB] Initializing database...');
    const db = await openDatabase();
    
    // Read schema SQL file
    const schemaSQL = await readSchemaFile();
    
    // Execute schema (split by semicolon and execute each statement)
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      try {
        await db.execAsync(statement);
      } catch (error) {
        console.error('[DB] Error executing statement:', statement.substring(0, 100));
        console.error(error);
        // Continue with other statements even if one fails
      }
    }
    
    console.log('[DB] Database initialized successfully');
    
    // Seed initial data if database is empty
    await seedInitialData(db);
    
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Read schema file
 */
async function readSchemaFile(): Promise<string> {
  // In development, read from source
  // In production, this would be bundled with the app
  const schemaPath = require('./schema.sql');
  
  // For now, return the inline schema
  return getInlineSchema();
}

/**
 * Inline schema (fallback if file reading fails)
 */
function getInlineSchema(): string {
  return `
    -- Master Barang
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Master Supplier
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

    -- Master Pembeli
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

    -- Transaksi
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

    -- Transaksi Item
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

    -- Stok
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

    -- Stok Mutasi
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

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_transaksi_jenis ON transaksi(jenis);
    CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi(tanggal);
    CREATE INDEX IF NOT EXISTS idx_transaksi_status ON transaksi(status);
    CREATE INDEX IF NOT EXISTS idx_transaksi_item_transaksi ON transaksi_item(transaksi_id);
    CREATE INDEX IF NOT EXISTS idx_stok_barang ON stok(barang_id);
  `;
}

/**
 * Seed initial data for development/testing
 */
async function seedInitialData(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    // Check if barang table has data
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM barang');
    
    if (result && result.count === 0) {
      console.log('[DB] Seeding initial data...');
      
      // Insert sample barang
      await db.runAsync(`
        INSERT INTO barang (nama, kategori, satuan_default, grades, status) VALUES
        ('Plastik PET', 'Plastik', 'kg', '["A","B","C"]', 'aktif'),
        ('Kardus Bekas', 'Kertas', 'kg', '["A","B"]', 'aktif'),
        ('Botol Kaca', 'Kaca', 'kg', NULL, 'aktif'),
        ('Kertas HVS', 'Kertas', 'kg', '["A","B"]', 'aktif'),
        ('Besi Tua', 'Logam', 'kg', NULL, 'aktif')
      `);
      
      // Insert sample supplier
      await db.runAsync(`
        INSERT INTO supplier (nama, nomor_hp, jenis) VALUES
        ('Budi Santoso', '081234567890', 'langganan'),
        ('Ibu Siti', '081234567891', 'langganan')
      `);
      
      // Insert sample pembeli
      await db.runAsync(`
        INSERT INTO pembeli (nama, nomor_hp) VALUES
        ('PT Daur Ulang Sejahtera', '081234567892'),
        ('CV Maju Jaya', '081234567893')
      `);
      
      console.log('[DB] Initial data seeded successfully');
    }
  } catch (error) {
    console.error('[DB] Error seeding data:', error);
    // Non-critical, don't throw
  }
}

/**
 * Drop all tables (for development/testing)
 */
export async function dropDatabase(): Promise<void> {
  try {
    const db = await openDatabase();
    
    await db.execAsync(`
      DROP TABLE IF EXISTS transaksi_foto;
      DROP TABLE IF EXISTS stok_mutasi;
      DROP TABLE IF EXISTS stok;
      DROP TABLE IF EXISTS transaksi_item;
      DROP TABLE IF EXISTS transaksi;
      DROP TABLE IF EXISTS pembeli;
      DROP TABLE IF EXISTS supplier;
      DROP TABLE IF EXISTS barang;
      DROP VIEW IF EXISTS v_ringkasan_stok;
      DROP VIEW IF EXISTS v_laporan_harian;
    `);
    
    console.log('[DB] Database dropped successfully');
  } catch (error) {
    console.error('[DB] Error dropping database:', error);
    throw error;
  }
}

/**
 * Reset database (drop and recreate)
 */
export async function resetDatabase(): Promise<void> {
  await dropDatabase();
  await initDatabase();
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const db = await openDatabase();
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"');
    return result !== null && result.count > 0;
  } catch (error) {
    console.error('[DB] Health check failed:', error);
    return false;
  }
}
