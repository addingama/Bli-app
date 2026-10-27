/**
 * Database Initialization & Setup
 * Handles SQLite database creation and schema setup
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_SCHEMA } from './schema';

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
  // Use the imported DATABASE_SCHEMA constant
  return DATABASE_SCHEMA;
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
