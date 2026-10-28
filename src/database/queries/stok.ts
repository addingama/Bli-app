/**
 * Stok Queries - BliApp
 * Stock management and queries
 */

import { openDatabase } from '../init';
import type { Stok, StokMutasi, RingkasanStok } from '../types';
import { hasEnoughQuantity, roundQuantity } from '../../utils/formatQuantity';

/**
 * Get all stock
 */
export async function getAllStok(): Promise<RingkasanStok[]> {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync<RingkasanStok>(
      'SELECT * FROM v_ringkasan_stok ORDER BY barang_nama ASC'
    );
    return result || [];
  } catch (error) {
    console.error('[Stok] Error getting all stock:', error);
    throw error;
  }
}

/**
 * Get stock by barang ID and optional grade
 */
export async function getStokByBarang(
  barangId: number,
  grade?: string
): Promise<Stok | null> {
  try {
    const db = await openDatabase();
    
    let query = 'SELECT * FROM stok WHERE barang_id = ?';
    const params: any[] = [barangId];
    
    if (grade) {
      query += ' AND grade = ?';
      params.push(grade);
    } else {
      query += ' AND grade IS NULL';
    }
    
    const result = await db.getFirstAsync<Stok>(query, params);
    return result || null;
  } catch (error) {
    console.error('[Stok] Error getting stock by barang:', error);
    throw error;
  }
}

/**
 * Get stock mutations (history) for a barang
 */
export async function getStokMutasi(
  barangId: number,
  dateRange?: { from: string; to: string }
): Promise<StokMutasi[]> {
  try {
    const db = await openDatabase();
    
    let query = 'SELECT * FROM stok_mutasi WHERE barang_id = ?';
    const params: any[] = [barangId];
    
    if (dateRange) {
      query += ' AND DATE(tanggal) >= DATE(?) AND DATE(tanggal) <= DATE(?)';
      params.push(dateRange.from, dateRange.to);
    }
    
    query += ' ORDER BY tanggal DESC, id DESC';
    
    const result = await db.getAllAsync<StokMutasi>(query, params);
    return result || [];
  } catch (error) {
    console.error('[Stok] Error getting stock mutations:', error);
    throw error;
  }
}

/**
 * Check if stock is available for a transaction
 */
export async function checkStokAvailable(
  barangId: number,
  grade: string | null,
  quantity: number
): Promise<{ available: boolean; current_stock: number }> {
  try {
    const db = await openDatabase();
    
    let query = 'SELECT quantity FROM stok WHERE barang_id = ?';
    const params: any[] = [barangId];
    
    if (grade) {
      query += ' AND grade = ?';
      params.push(grade);
    } else {
      query += ' AND grade IS NULL';
    }
    
    const result = await db.getFirstAsync<{ quantity: number }>(query, params);
    const currentStock = result?.quantity || 0;
    
    return {
      available: hasEnoughQuantity(currentStock, quantity),
      current_stock: currentStock,
    };
  } catch (error) {
    console.error('[Stok] Error checking stock availability:', error);
    throw error;
  }
}

/**
 * Get total stock value
 */
export async function getTotalNilaiStok(): Promise<number> {
  try {
    const db = await openDatabase();
    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT SUM(total_nilai) as total FROM stok WHERE quantity > 0'
    );
    return result?.total || 0;
  } catch (error) {
    console.error('[Stok] Error getting total stock value:', error);
    throw error;
  }
}

/**
 * Get low stock items
 */
export async function getLowStock(threshold?: number): Promise<RingkasanStok[]> {
  try {
    const db = await openDatabase();
    
    // If threshold not provided, use each item's alert minimum
    let query = `
      SELECT s.*, b.stok_alert_minimum
      FROM stok s
      JOIN barang b ON s.barang_id = b.id
      WHERE s.quantity > 0
    `;
    
    if (threshold !== undefined) {
      query += ' AND s.quantity <= ?';
      const result = await db.getAllAsync<RingkasanStok>(
        query + ' ORDER BY s.quantity ASC',
        [threshold]
      );
      return result || [];
    } else {
      query += ' AND s.quantity <= b.stok_alert_minimum AND b.stok_alert_minimum > 0';
      const result = await db.getAllAsync<RingkasanStok>(
        query + ' ORDER BY s.quantity ASC'
      );
      return result || [];
    }
  } catch (error) {
    console.error('[Stok] Error getting low stock:', error);
    throw error;
  }
}

/**
 * Get stock summary by category
 */
export async function getStokByKategori(): Promise<Array<{
  kategori: string;
  total_items: number;
  total_quantity: number;
  total_nilai: number;
}>> {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync<{
      kategori: string;
      total_items: number;
      total_quantity: number;
      total_nilai: number;
    }>(
      `SELECT 
        COALESCE(b.kategori, 'Lainnya') as kategori,
        COUNT(DISTINCT s.barang_id) as total_items,
        SUM(s.quantity) as total_quantity,
        SUM(s.total_nilai) as total_nilai
       FROM stok s
       JOIN barang b ON s.barang_id = b.id
       WHERE s.quantity > 0
       GROUP BY b.kategori
       ORDER BY total_nilai DESC`
    );
    return result || [];
  } catch (error) {
    console.error('[Stok] Error getting stock by category:', error);
    throw error;
  }
}

/**
 * Search stock
 */
export async function searchStok(keyword: string): Promise<RingkasanStok[]> {
  try {
    const db = await openDatabase();
    const searchTerm = `%${keyword}%`;
    const result = await db.getAllAsync<RingkasanStok>(
      `SELECT * FROM v_ringkasan_stok
       WHERE barang_nama LIKE ? OR kategori LIKE ?
       ORDER BY barang_nama ASC`,
      [searchTerm, searchTerm]
    );
    return result || [];
  } catch (error) {
    console.error('[Stok] Error searching stock:', error);
    throw error;
  }
}

/**
 * Set an absolute stock balance for a sellable item and record an adjustment.
 */
export async function adjustStok(input: {
  barangId: number;
  barangNama: string;
  grade?: string | null;
  satuan: string;
  quantity: number;
}): Promise<void> {
  const db = await openDatabase();
  const grade = input.grade ?? null;
  const newQuantity = roundQuantity(input.quantity);

  if (!Number.isFinite(newQuantity) || newQuantity < 0) {
    throw new Error('Quantity tidak valid');
  }

  try {
    await db.execAsync('BEGIN TRANSACTION');

    const existing = await db.getFirstAsync<{
      id: number;
      quantity: number;
      harga_beli_rata: number;
    }>(
      'SELECT id, quantity, harga_beli_rata FROM stok WHERE barang_id = ? AND (grade = ? OR (grade IS NULL AND ? IS NULL))',
      [input.barangId, grade, grade]
    );

    const oldQuantity = existing?.quantity ?? 0;
    const hargaRata = existing?.harga_beli_rata ?? 0;

    if (existing) {
      await db.runAsync(
        `UPDATE stok SET
          quantity = ?,
          total_nilai = ?,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newQuantity, newQuantity * hargaRata, existing.id]
      );
    } else {
      await db.runAsync(
        `INSERT INTO stok (barang_id, barang_nama, grade, quantity, satuan, harga_beli_rata, total_nilai)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [input.barangId, input.barangNama, grade, newQuantity, input.satuan, 0, 0]
      );
    }

    const delta = roundQuantity(newQuantity - oldQuantity);
    await db.runAsync(
      `INSERT INTO stok_mutasi (
        barang_id, grade, tanggal, jenis_mutasi,
        quantity_masuk, quantity_keluar, saldo, satuan, harga_satuan, nilai_mutasi, keterangan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.barangId,
        grade,
        new Date().toISOString(),
        'adjustment',
        delta > 0 ? delta : 0,
        delta < 0 ? Math.abs(delta) : 0,
        newQuantity,
        input.satuan,
        hargaRata,
        Math.abs(delta) * hargaRata,
        'Penyesuaian manual',
      ]
    );

    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    console.error('[Stok] Error adjusting stock:', error);
    throw error;
  }
}

/**
 * Get stock movement summary (for a period)
 */
export async function getStokMovementSummary(dateRange?: { from: string; to: string }): Promise<{
  total_masuk: number;
  total_keluar: number;
  total_transaksi_masuk: number;
  total_transaksi_keluar: number;
}> {
  try {
    const db = await openDatabase();
    
    let query = `
      SELECT 
        SUM(CASE WHEN jenis_mutasi = 'masuk' THEN nilai_mutasi ELSE 0 END) as total_masuk,
        SUM(CASE WHEN jenis_mutasi = 'keluar' THEN nilai_mutasi ELSE 0 END) as total_keluar,
        SUM(CASE WHEN jenis_mutasi = 'masuk' THEN 1 ELSE 0 END) as total_transaksi_masuk,
        SUM(CASE WHEN jenis_mutasi = 'keluar' THEN 1 ELSE 0 END) as total_transaksi_keluar
      FROM stok_mutasi
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (dateRange) {
      query += ' AND DATE(tanggal) >= DATE(?) AND DATE(tanggal) <= DATE(?)';
      params.push(dateRange.from, dateRange.to);
    }
    
    const result = await db.getFirstAsync<{
      total_masuk: number;
      total_keluar: number;
      total_transaksi_masuk: number;
      total_transaksi_keluar: number;
    }>(query, params);
    
    return result || {
      total_masuk: 0,
      total_keluar: 0,
      total_transaksi_masuk: 0,
      total_transaksi_keluar: 0,
    };
  } catch (error) {
    console.error('[Stok] Error getting stock movement summary:', error);
    throw error;
  }
}
