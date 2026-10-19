/**
 * Barang Queries - BliApp
 * CRUD operations for barang/items
 */

import { openDatabase } from '../init';
import type { Barang, BarangInput } from '../types';

/**
 * Get all active barang
 */
export async function getAllBarang(): Promise<Barang[]> {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync<Barang>(
      'SELECT * FROM barang WHERE status = ? ORDER BY nama ASC',
      ['aktif']
    );
    return result || [];
  } catch (error) {
    console.error('[Barang] Error getting all barang:', error);
    throw error;
  }
}

/**
 * Get barang by ID
 */
export async function getBarangById(id: number): Promise<Barang | null> {
  try {
    const db = await openDatabase();
    const result = await db.getFirstAsync<Barang>(
      'SELECT * FROM barang WHERE id = ?',
      [id]
    );
    return result || null;
  } catch (error) {
    console.error('[Barang] Error getting barang by ID:', error);
    throw error;
  }
}

/**
 * Search barang by keyword (name or kategori)
 */
export async function searchBarang(keyword: string): Promise<Barang[]> {
  try {
    const db = await openDatabase();
    const searchTerm = `%${keyword}%`;
    const result = await db.getAllAsync<Barang>(
      `SELECT * FROM barang 
       WHERE status = 'aktif' 
       AND (nama LIKE ? OR kategori LIKE ?)
       ORDER BY nama ASC`,
      [searchTerm, searchTerm]
    );
    return result || [];
  } catch (error) {
    console.error('[Barang] Error searching barang:', error);
    throw error;
  }
}

/**
 * Create new barang
 */
export async function createBarang(data: BarangInput): Promise<number> {
  try {
    const db = await openDatabase();
    
    // Convert grades array to JSON string
    const gradesJson = data.grades ? JSON.stringify(data.grades) : null;
    
    const result = await db.runAsync(
      `INSERT INTO barang (nama, kategori, satuan_default, grades, status, stok_alert_minimum)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.nama,
        data.kategori || null,
        data.satuan_default,
        gradesJson,
        data.status || 'aktif',
        data.stok_alert_minimum || 0,
      ]
    );
    
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[Barang] Error creating barang:', error);
    throw error;
  }
}

/**
 * Update barang
 */
export async function updateBarang(id: number, data: Partial<BarangInput>): Promise<void> {
  try {
    const db = await openDatabase();
    
    const gradesJson = data.grades ? JSON.stringify(data.grades) : undefined;
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.nama !== undefined) {
      updates.push('nama = ?');
      values.push(data.nama);
    }
    if (data.kategori !== undefined) {
      updates.push('kategori = ?');
      values.push(data.kategori);
    }
    if (data.satuan_default !== undefined) {
      updates.push('satuan_default = ?');
      values.push(data.satuan_default);
    }
    if (gradesJson !== undefined) {
      updates.push('grades = ?');
      values.push(gradesJson);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.stok_alert_minimum !== undefined) {
      updates.push('stok_alert_minimum = ?');
      values.push(data.stok_alert_minimum);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await db.runAsync(
      `UPDATE barang SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  } catch (error) {
    console.error('[Barang] Error updating barang:', error);
    throw error;
  }
}

/**
 * Delete barang (soft delete - set status to nonaktif)
 */
export async function deleteBarang(id: number): Promise<void> {
  try {
    const db = await openDatabase();
    await db.runAsync(
      'UPDATE barang SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['nonaktif', id]
    );
  } catch (error) {
    console.error('[Barang] Error deleting barang:', error);
    throw error;
  }
}

/**
 * Get barang by kategori
 */
export async function getBarangByKategori(kategori: string): Promise<Barang[]> {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync<Barang>(
      'SELECT * FROM barang WHERE kategori = ? AND status = ? ORDER BY nama ASC',
      [kategori, 'aktif']
    );
    return result || [];
  } catch (error) {
    console.error('[Barang] Error getting barang by kategori:', error);
    throw error;
  }
}

/**
 * Update harga referensi terakhir (called after transaction)
 */
export async function updateHargaReferensi(
  barangId: number,
  hargaBeli?: number,
  hargaJual?: number
): Promise<void> {
  try {
    const db = await openDatabase();
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (hargaBeli !== undefined) {
      updates.push('harga_beli_terakhir = ?');
      values.push(hargaBeli);
    }
    if (hargaJual !== undefined) {
      updates.push('harga_jual_terakhir = ?');
      values.push(hargaJual);
    }
    
    if (updates.length === 0) return;
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(barangId);
    
    await db.runAsync(
      `UPDATE barang SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  } catch (error) {
    console.error('[Barang] Error updating harga referensi:', error);
    throw error;
  }
}

/**
 * Get all categories (distinct)
 */
export async function getAllKategori(): Promise<string[]> {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync<{ kategori: string }>(
      'SELECT DISTINCT kategori FROM barang WHERE kategori IS NOT NULL AND status = ? ORDER BY kategori ASC',
      ['aktif']
    );
    return result?.map(r => r.kategori) || [];
  } catch (error) {
    console.error('[Barang] Error getting all kategori:', error);
    throw error;
  }
}
