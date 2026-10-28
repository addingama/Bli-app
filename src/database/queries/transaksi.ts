/**
 * Transaksi Queries - BliApp
 * Transaction operations with stock management
 */

import { openDatabase } from '../init';
import { generateTransactionNumber } from '../../utils/generateTransactionNumber';
import { updateSupplierStats } from './supplier';
import { updatePembeliStats } from './pembeli';
import { updateHargaReferensi } from './barang';
import { formatQuantity, hasEnoughQuantity, roundQuantity } from '../../utils/formatQuantity';
import type {
  Transaksi,
  TransaksiInput,
  TransaksiWithItems,
  TransaksiItem,
  TransaksiResponse,
  DashboardSummary,
} from '../types';

/**
 * Create buy transaction. Purchases are financial records and do not change local stock.
 * USES DATABASE TRANSACTION
 */
export async function createTransaksiBeli(data: TransaksiInput): Promise<TransaksiResponse> {
  const db = await openDatabase();
  
  try {
    console.log('[Transaksi] Starting buy transaction...');
    
    // Begin database transaction
    await db.execAsync('BEGIN TRANSACTION');
    
    // 1. Generate transaction number
    const nomorTransaksi = await generateTransactionNumber('beli', new Date(data.tanggal || Date.now()));
    console.log('[Transaksi] Generated number:', nomorTransaksi);
    
    // 2. Insert transaction header
    const headerResult = await db.runAsync(
      `INSERT INTO transaksi (
        nomor_transaksi, jenis, tanggal, supplier_id, supplier_nama, nomor_hp,
        total_items, total_nilai, metode_bayar, status, catatan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nomorTransaksi,
        'beli',
        data.tanggal || new Date().toISOString(),
        data.supplier_id || null,
        data.supplier_nama || null,
        data.nomor_hp || null,
        data.items.length,
        data.total_nilai,
        data.metode_bayar,
        'lunas',
        data.catatan || null,
      ]
    );
    
    const transaksiId = headerResult.lastInsertRowId;
    console.log('[Transaksi] Header inserted, ID:', transaksiId);
    
    // 3. Insert items. Stock is adjusted manually for sellable goods, not from purchases.
    for (const item of data.items) {
      await db.runAsync(
        `INSERT INTO transaksi_item (
          transaksi_id, barang_id, barang_nama, barang_kategori, grade,
          quantity, satuan, harga_satuan, sub_total, catatan
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transaksiId,
          item.barang_id || null,
          item.barang_nama,
          item.barang_kategori || null,
          item.grade || null,
          item.quantity,
          item.satuan,
          item.harga_satuan,
          item.sub_total,
          item.catatan || null,
        ]
      );
      
      if (item.barang_id) {
        await updateHargaReferensi(item.barang_id, item.harga_satuan, undefined);
      }
    }
    
    // 4. Update supplier stats if applicable
    if (data.supplier_id) {
      await updateSupplierStats(data.supplier_id, 1, data.total_nilai);
    }
    
    // Commit transaction
    await db.execAsync('COMMIT');
    console.log('[Transaksi] Buy transaction completed successfully');
    
    return {
      success: true,
      transaksi_id: transaksiId,
      nomor_transaksi: nomorTransaksi,
    };
    
  } catch (error) {
    // Rollback on error
    await db.execAsync('ROLLBACK');
    console.error('[Transaksi] Error creating buy transaction:', error);
    throw error;
  }
}

/**
 * Create sell transaction with stock validation and reduction
 * USES DATABASE TRANSACTION
 */
export async function createTransaksiJual(data: TransaksiInput): Promise<TransaksiResponse> {
  const db = await openDatabase();
  
  try {
    console.log('[Transaksi] Starting sell transaction...');
    
    // Begin database transaction
    await db.execAsync('BEGIN TRANSACTION');
    
    // 1. Validate stock for all items
    for (const item of data.items) {
      if (!item.barang_id) continue;
      
      const stokCheck = await db.getFirstAsync<{ quantity: number }>(
        'SELECT quantity FROM stok WHERE barang_id = ? AND (grade = ? OR (grade IS NULL AND ? IS NULL))',
        [item.barang_id, item.grade ?? null, item.grade ?? null]
      );
      
      const available = stokCheck?.quantity || 0;
      if (!hasEnoughQuantity(available, item.quantity)) {
        throw new Error(
          `Stok ${item.barang_nama} tidak mencukupi. Tersedia: ${formatQuantity(available)} ${item.satuan}`
        );
      }
    }
    
    // 2. Generate transaction number
    const nomorTransaksi = await generateTransactionNumber('jual', new Date(data.tanggal || Date.now()));
    console.log('[Transaksi] Generated number:', nomorTransaksi);
    
    // 3. Insert transaction header
    const headerResult = await db.runAsync(
      `INSERT INTO transaksi (
        nomor_transaksi, jenis, tanggal, pembeli_id, pembeli_nama, nomor_hp,
        total_items, total_nilai, metode_bayar, status, catatan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nomorTransaksi,
        'jual',
        data.tanggal || new Date().toISOString(),
        data.pembeli_id || null,
        data.pembeli_nama || null,
        data.nomor_hp || null,
        data.items.length,
        data.total_nilai,
        data.metode_bayar,
        'lunas',
        data.catatan || null,
      ]
    );
    
    const transaksiId = headerResult.lastInsertRowId;
    console.log('[Transaksi] Header inserted, ID:', transaksiId);
    
    // 4. Insert items and reduce stock
    for (const item of data.items) {
      // 4a. Insert item
      await db.runAsync(
        `INSERT INTO transaksi_item (
          transaksi_id, barang_id, barang_nama, barang_kategori, grade,
          quantity, satuan, harga_satuan, sub_total, catatan
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transaksiId,
          item.barang_id || null,
          item.barang_nama,
          item.barang_kategori || null,
          item.grade || null,
          item.quantity,
          item.satuan,
          item.harga_satuan,
          item.sub_total,
          item.catatan || null,
        ]
      );
      
      // 4b. Reduce stock
      await updateStokKeluar(
        db,
        item.barang_id!,
        item.grade ?? null,
        item.quantity
      );
      
      // 4c. Insert stock mutation
      const currentSaldo = await getCurrentStokSaldo(db, item.barang_id!, item.grade ?? null);
      await db.runAsync(
        `INSERT INTO stok_mutasi (
          barang_id, grade, tanggal, jenis_mutasi, transaksi_id, nomor_transaksi,
          quantity_masuk, quantity_keluar, saldo, satuan, harga_satuan, nilai_mutasi, keterangan
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.barang_id ?? null,
          item.grade ?? null,
          data.tanggal || new Date().toISOString(),
          'keluar',
          transaksiId,
          nomorTransaksi,
          0,
          item.quantity,
          currentSaldo,
          item.satuan,
          item.harga_satuan,
          item.sub_total,
          `Penjualan ke ${data.pembeli_nama || 'Pembeli'}`,
        ]
      );
      
      // 4d. Update harga referensi barang
      if (item.barang_id) {
        await updateHargaReferensi(item.barang_id, undefined, item.harga_satuan);
      }
    }
    
    // 5. Update pembeli stats if applicable
    if (data.pembeli_id) {
      await updatePembeliStats(data.pembeli_id, 1, data.total_nilai);
    }
    
    // Commit transaction
    await db.execAsync('COMMIT');
    console.log('[Transaksi] Sell transaction completed successfully');
    
    return {
      success: true,
      transaksi_id: transaksiId,
      nomor_transaksi: nomorTransaksi,
    };
    
  } catch (error) {
    // Rollback on error
    await db.execAsync('ROLLBACK');
    console.error('[Transaksi] Error creating sell transaction:', error);
    throw error;
  }
}

/**
 * Helper: Update stock when items go out
 */
async function updateStokKeluar(
  db: any,
  barangId: number,
  grade: string | null,
  quantityKeluar: number
): Promise<void> {
  const existing = await db.getFirstAsync(
    'SELECT id, quantity, harga_beli_rata FROM stok WHERE barang_id = ? AND (grade = ? OR (grade IS NULL AND ? IS NULL))',
    [barangId, grade, grade]
  ) as { id: number; quantity: number; harga_beli_rata: number } | null;
  
  if (!existing || !hasEnoughQuantity(existing.quantity, quantityKeluar)) {
    throw new Error('Insufficient stock');
  }
  
  const newQuantity = roundQuantity(existing.quantity - quantityKeluar);
  
  await db.runAsync(
    `UPDATE stok SET 
      quantity = ?,
      total_nilai = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [newQuantity, newQuantity * existing.harga_beli_rata, existing.id]
  );
}

/**
 * Helper: Get current stock balance
 */
async function getCurrentStokSaldo(
  db: any,
  barangId: number,
  grade: string | null
): Promise<number> {
  const result = await db.getFirstAsync(
    'SELECT quantity FROM stok WHERE barang_id = ? AND (grade = ? OR (grade IS NULL AND ? IS NULL))',
    [barangId, grade, grade]
  ) as { quantity: number } | null;
  return result?.quantity || 0;
}

/**
 * Get transaction by ID with items
 */
export async function getTransaksiById(id: number): Promise<TransaksiWithItems | null> {
  try {
    const db = await openDatabase();
    
    // Get header
    const header = await db.getFirstAsync(
      'SELECT * FROM transaksi WHERE id = ?',
      [id]
    ) as Transaksi | null;
    
    if (!header) return null;
    
    // Get items
    const items = await db.getAllAsync(
      'SELECT * FROM transaksi_item WHERE transaksi_id = ? ORDER BY id ASC',
      [id]
    ) as TransaksiItem[] | null;
    
    return {
      ...header,
      items: items || [],
    };
  } catch (error) {
    console.error('[Transaksi] Error getting transaction by ID:', error);
    throw error;
  }
}

/**
 * Get transaction list with filters
 */
export async function getTransaksiList(filters?: {
  jenis?: 'beli' | 'jual';
  status?: string;
  tanggal_dari?: string;
  tanggal_sampai?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Transaksi[]> {
  try {
    const db = await openDatabase();
    
    let query = 'SELECT * FROM transaksi WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.jenis) {
      query += ' AND jenis = ?';
      params.push(filters.jenis);
    }
    
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters?.tanggal_dari) {
      query += ' AND DATE(tanggal) >= DATE(?)';
      params.push(filters.tanggal_dari);
    }
    
    if (filters?.tanggal_sampai) {
      query += ' AND DATE(tanggal) <= DATE(?)';
      params.push(filters.tanggal_sampai);
    }
    
    if (filters?.search) {
      query += ' AND (nomor_transaksi LIKE ? OR supplier_nama LIKE ? OR pembeli_nama LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY tanggal DESC, id DESC';
    
    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      
      if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }
    
    const result = await db.getAllAsync(query, params) as Transaksi[] | null;
    return result || [];
  } catch (error) {
    console.error('[Transaksi] Error getting transaction list:', error);
    throw error;
  }
}

function localDayRange(now = new Date()): { start: string; end: string } {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Get today's transaction summary in the device's local calendar day.
 */
export async function getTransaksiHariIni(): Promise<DashboardSummary & { transaksi: Transaksi[] }> {
  try {
    const db = await openDatabase();
    const { start, end } = localDayRange();
    
    const result = await db.getFirstAsync<{
      total_pembelian: number;
      total_penjualan: number;
      jumlah_transaksi_beli: number;
      jumlah_transaksi_jual: number;
    }>(
      `SELECT 
        SUM(CASE WHEN jenis = 'beli' THEN total_nilai ELSE 0 END) as total_pembelian,
        SUM(CASE WHEN jenis = 'jual' THEN total_nilai ELSE 0 END) as total_penjualan,
        SUM(CASE WHEN jenis = 'beli' THEN 1 ELSE 0 END) as jumlah_transaksi_beli,
        SUM(CASE WHEN jenis = 'jual' THEN 1 ELSE 0 END) as jumlah_transaksi_jual
       FROM transaksi
       WHERE tanggal >= ? AND tanggal < ? AND status = 'lunas'`,
      [start, end]
    );

    const transaksi = await db.getAllAsync<Transaksi>(
      `SELECT * FROM transaksi
       WHERE tanggal >= ? AND tanggal < ? AND status = 'lunas'
       ORDER BY tanggal DESC, id DESC`,
      [start, end]
    );
    
    const stokSummary = await db.getFirstAsync<{
      total_stok_items: number;
      total_nilai_stok: number;
    }>(
      `SELECT
        COUNT(*) as total_stok_items,
        COALESCE(SUM(total_nilai_stok), 0) as total_nilai_stok
       FROM v_ringkasan_stok`
    );
    
    return {
      total_pembelian: result?.total_pembelian || 0,
      total_penjualan: result?.total_penjualan || 0,
      jumlah_transaksi_beli: result?.jumlah_transaksi_beli || 0,
      jumlah_transaksi_jual: result?.jumlah_transaksi_jual || 0,
      keuntungan_kotor: (result?.total_penjualan || 0) - (result?.total_pembelian || 0),
      total_stok_items: stokSummary?.total_stok_items || 0,
      total_nilai_stok: stokSummary?.total_nilai_stok || 0,
      transaksi: transaksi || [],
    };
  } catch (error) {
    console.error('[Transaksi] Error getting today summary:', error);
    throw error;
  }
}

/**
 * Get recent transactions (for dashboard)
 */
export async function getRecentTransaksi(limit: number = 5): Promise<Transaksi[]> {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync<Transaksi>(
      'SELECT * FROM transaksi ORDER BY tanggal DESC, id DESC LIMIT ?',
      [limit]
    );
    return result || [];
  } catch (error) {
    console.error('[Transaksi] Error getting recent transactions:', error);
    throw error;
  }
}
