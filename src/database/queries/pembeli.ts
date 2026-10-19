/**
 * Pembeli Queries - BliApp
 * CRUD operations for pembeli/buyers
 */

import { openDatabase } from '../init';
import type { Pembeli, PembeliInput } from '../types';

/**
 * Get all pembeli
 */
export async function getAllPembeli(): Promise<Pembeli[]> {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync<Pembeli>(
      'SELECT * FROM pembeli ORDER BY nama ASC'
    );
    return result || [];
  } catch (error) {
    console.error('[Pembeli] Error getting all pembeli:', error);
    throw error;
  }
}

/**
 * Get pembeli by ID
 */
export async function getPembeliById(id: number): Promise<Pembeli | null> {
  try {
    const db = await openDatabase();
    const result = await db.getFirstAsync<Pembeli>(
      'SELECT * FROM pembeli WHERE id = ?',
      [id]
    );
    return result || null;
  } catch (error) {
    console.error('[Pembeli] Error getting pembeli by ID:', error);
    throw error;
  }
}

/**
 * Search pembeli by keyword (name or phone)
 */
export async function searchPembeli(keyword: string): Promise<Pembeli[]> {
  try {
    const db = await openDatabase();
    const searchTerm = `%${keyword}%`;
    const result = await db.getAllAsync<Pembeli>(
      `SELECT * FROM pembeli 
       WHERE nama LIKE ? OR nomor_hp LIKE ?
       ORDER BY nama ASC`,
      [searchTerm, searchTerm]
    );
    return result || [];
  } catch (error) {
    console.error('[Pembeli] Error searching pembeli:', error);
    throw error;
  }
}

/**
 * Create new pembeli
 */
export async function createPembeli(data: PembeliInput): Promise<number> {
  try {
    const db = await openDatabase();
    
    const result = await db.runAsync(
      `INSERT INTO pembeli (nama, nomor_hp, alamat)
       VALUES (?, ?, ?)`,
      [
        data.nama,
        data.nomor_hp || null,
        data.alamat || null,
      ]
    );
    
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[Pembeli] Error creating pembeli:', error);
    throw error;
  }
}

/**
 * Update pembeli
 */
export async function updatePembeli(id: number, data: Partial<PembeliInput>): Promise<void> {
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
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await db.runAsync(
      `UPDATE pembeli SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  } catch (error) {
    console.error('[Pembeli] Error updating pembeli:', error);
    throw error;
  }
}

/**
 * Delete pembeli (only if no transactions)
 */
export async function deletePembeli(id: number): Promise<void> {
  try {
    const db = await openDatabase();
    
    // Check if pembeli has transactions
    const check = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM transaksi WHERE pembeli_id = ?',
      [id]
    );
    
    if (check && check.count > 0) {
      throw new Error('Tidak dapat menghapus pembeli yang sudah memiliki transaksi');
    }
    
    await db.runAsync('DELETE FROM pembeli WHERE id = ?', [id]);
  } catch (error) {
    console.error('[Pembeli] Error deleting pembeli:', error);
    throw error;
  }
}

/**
 * Get pembeli statistics
 */
export async function getPembeliStats(id: number): Promise<{
  total_transaksi: number;
  total_penjualan: number;
  transaksi_terakhir?: string;
}> {
  try {
    const db = await openDatabase();
    
    const result = await db.getFirstAsync<{
      total_transaksi: number;
      total_penjualan: number;
      transaksi_terakhir?: string;
    }>(
      `SELECT 
        total_transaksi,
        total_penjualan,
        (SELECT MAX(tanggal) FROM transaksi WHERE pembeli_id = ? AND jenis = 'jual') as transaksi_terakhir
       FROM pembeli WHERE id = ?`,
      [id, id]
    );
    
    return result || { total_transaksi: 0, total_penjualan: 0 };
  } catch (error) {
    console.error('[Pembeli] Error getting pembeli stats:', error);
    throw error;
  }
}

/**
 * Update pembeli stats (called after transaction)
 */
export async function updatePembeliStats(
  pembeliId: number,
  incrementTransaksi: number = 1,
  incrementPenjualan: number = 0
): Promise<void> {
  try {
    const db = await openDatabase();
    
    await db.runAsync(
      `UPDATE pembeli 
       SET total_transaksi = total_transaksi + ?,
           total_penjualan = total_penjualan + ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [incrementTransaksi, incrementPenjualan, pembeliId]
    );
  } catch (error) {
    console.error('[Pembeli] Error updating pembeli stats:', error);
    throw error;
  }
}
