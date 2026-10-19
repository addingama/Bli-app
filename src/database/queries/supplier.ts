/**
 * Supplier Queries - BliApp
 * CRUD operations for suppliers
 */

import { openDatabase } from '../init';
import type { Supplier, SupplierInput } from '../types';

/**
 * Get all suppliers
 */
export async function getAllSupplier(): Promise<Supplier[]> {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync<Supplier>(
      'SELECT * FROM supplier ORDER BY nama ASC'
    );
    return result || [];
  } catch (error) {
    console.error('[Supplier] Error getting all suppliers:', error);
    throw error;
  }
}

/**
 * Get supplier by ID
 */
export async function getSupplierById(id: number): Promise<Supplier | null> {
  try {
    const db = await openDatabase();
    const result = await db.getFirstAsync<Supplier>(
      'SELECT * FROM supplier WHERE id = ?',
      [id]
    );
    return result || null;
  } catch (error) {
    console.error('[Supplier] Error getting supplier by ID:', error);
    throw error;
  }
}

/**
 * Search supplier by keyword (name or phone)
 */
export async function searchSupplier(keyword: string): Promise<Supplier[]> {
  try {
    const db = await openDatabase();
    const searchTerm = `%${keyword}%`;
    const result = await db.getAllAsync<Supplier>(
      `SELECT * FROM supplier 
       WHERE nama LIKE ? OR nomor_hp LIKE ?
       ORDER BY nama ASC`,
      [searchTerm, searchTerm]
    );
    return result || [];
  } catch (error) {
    console.error('[Supplier] Error searching supplier:', error);
    throw error;
  }
}

/**
 * Create new supplier
 */
export async function createSupplier(data: SupplierInput): Promise<number> {
  try {
    const db = await openDatabase();
    
    const result = await db.runAsync(
      `INSERT INTO supplier (nama, nomor_hp, alamat, jenis)
       VALUES (?, ?, ?, ?)`,
      [
        data.nama,
        data.nomor_hp || null,
        data.alamat || null,
        data.jenis || 'walk-in',
      ]
    );
    
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[Supplier] Error creating supplier:', error);
    throw error;
  }
}

/**
 * Update supplier
 */
export async function updateSupplier(id: number, data: Partial<SupplierInput>): Promise<void> {
  try {
    const db = await openDatabase();
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.nama !== undefined) {
      updates.push('nama = ?');
      values.push(data.nama);
    }
    if (data.nomor_hp !== undefined) {
      updates.push('nomor_hp = ?');
      values.push(data.nomor_hp);
    }
    if (data.alamat !== undefined) {
      updates.push('alamat = ?');
      values.push(data.alamat);
    }
    if (data.jenis !== undefined) {
      updates.push('jenis = ?');
      values.push(data.jenis);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await db.runAsync(
      `UPDATE supplier SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  } catch (error) {
    console.error('[Supplier] Error updating supplier:', error);
    throw error;
  }
}

/**
 * Delete supplier (only if no transactions)
 */
export async function deleteSupplier(id: number): Promise<void> {
  try {
    const db = await openDatabase();
    
    // Check if supplier has transactions
    const check = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM transaksi WHERE supplier_id = ?',
      [id]
    );
    
    if (check && check.count > 0) {
      throw new Error('Tidak dapat menghapus supplier yang sudah memiliki transaksi');
    }
    
    await db.runAsync('DELETE FROM supplier WHERE id = ?', [id]);
  } catch (error) {
    console.error('[Supplier] Error deleting supplier:', error);
    throw error;
  }
}

/**
 * Get supplier statistics
 */
export async function getSupplierStats(id: number): Promise<{
  total_transaksi: number;
  total_pembelian: number;
  transaksi_terakhir?: string;
}> {
  try {
    const db = await openDatabase();
    
    const result = await db.getFirstAsync<{
      total_transaksi: number;
      total_pembelian: number;
      transaksi_terakhir?: string;
    }>(
      `SELECT 
        total_transaksi,
        total_pembelian,
        (SELECT MAX(tanggal) FROM transaksi WHERE supplier_id = ? AND jenis = 'beli') as transaksi_terakhir
       FROM supplier WHERE id = ?`,
      [id, id]
    );
    
    return result || { total_transaksi: 0, total_pembelian: 0 };
  } catch (error) {
    console.error('[Supplier] Error getting supplier stats:', error);
    throw error;
  }
}

/**
 * Update supplier stats (called after transaction)
 */
export async function updateSupplierStats(
  supplierId: number,
  incrementTransaksi: number = 1,
  incrementPembelian: number = 0
): Promise<void> {
  try {
    const db = await openDatabase();
    
    await db.runAsync(
      `UPDATE supplier 
       SET total_transaksi = total_transaksi + ?,
           total_pembelian = total_pembelian + ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [incrementTransaksi, incrementPembelian, supplierId]
    );
  } catch (error) {
    console.error('[Supplier] Error updating supplier stats:', error);
    throw error;
  }
}
