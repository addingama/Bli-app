/**
 * Database Initialization & Setup
 * Handles SQLite database creation and schema setup
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_SCHEMA, RINGKASAN_STOK_VIEW_SQL } from './schema';

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
    
    await migrateDatabase(db);

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
  // Use the imported DATABASE_SCHEMA constant
  return DATABASE_SCHEMA;
}

/**
 * Add columns and replace views that CREATE IF NOT EXISTS will not update.
 */
async function migrateDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(barang)');
  const hasKatalog = columns.some(column => column.name === 'katalog');

  if (!hasKatalog) {
    await db.execAsync(
      `ALTER TABLE barang ADD COLUMN katalog TEXT NOT NULL DEFAULT 'jual'`
    );
  }

  await db.execAsync('DROP VIEW IF EXISTS v_ringkasan_stok');
  await db.execAsync(RINGKASAN_STOK_VIEW_SQL);
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
        INSERT INTO barang (nama, kategori, satuan_default, grades, status, katalog) VALUES
        ('Plastik Campur', 'Plastik', 'kg', NULL, 'aktif', 'beli'),
        ('Kardus Campur', 'Kertas', 'kg', NULL, 'aktif', 'beli'),
        ('Plastik PET', 'Plastik', 'kg', '["A","B","C"]', 'aktif', 'jual'),
        ('Kardus Bersih', 'Kertas', 'kg', '["A","B"]', 'aktif', 'jual'),
        ('Botol Kaca', 'Kaca', 'kg', NULL, 'aktif', 'jual'),
        ('Besi Tua', 'Logam', 'kg', NULL, 'aktif', 'jual')
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
