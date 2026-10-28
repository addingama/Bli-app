/**
 * Kategori pengeluaran operasional
 */

import { openDatabase } from '../init';
import type { KategoriPengeluaran, KategoriPengeluaranInput } from '../types';

export async function getAllKategoriPengeluaran(): Promise<KategoriPengeluaran[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<KategoriPengeluaran>(
    'SELECT * FROM kategori_pengeluaran ORDER BY nama ASC'
  );
  return rows || [];
}

export async function getKategoriPengeluaranUntukForm(
  selectedId?: number
): Promise<KategoriPengeluaran[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<KategoriPengeluaran>(
    `SELECT * FROM kategori_pengeluaran
     WHERE status = 'aktif' OR id = ?
     ORDER BY nama ASC`,
    [selectedId ?? -1]
  );
  return rows || [];
}

export async function getKategoriPengeluaranById(id: number): Promise<KategoriPengeluaran | null> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<KategoriPengeluaran>(
    'SELECT * FROM kategori_pengeluaran WHERE id = ?',
    [id]
  );
  return row || null;
}

export async function createKategoriPengeluaran(data: KategoriPengeluaranInput): Promise<number> {
  const nama = data.nama.trim();
  if (!nama) {
    throw new Error('Nama kategori wajib diisi');
  }

  const db = await openDatabase();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM kategori_pengeluaran WHERE nama = ? COLLATE NOCASE',
    [nama]
  );
  if (existing) {
    throw new Error('Kategori dengan nama itu sudah ada');
  }

  const result = await db.runAsync(
    `INSERT INTO kategori_pengeluaran (nama, status) VALUES (?, ?)`,
    [nama, data.status || 'aktif']
  );
  return result.lastInsertRowId;
}

export async function updateKategoriPengeluaran(
  id: number,
  data: KategoriPengeluaranInput
): Promise<void> {
  const nama = data.nama.trim();
  if (!nama) {
    throw new Error('Nama kategori wajib diisi');
  }

  const db = await openDatabase();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM kategori_pengeluaran WHERE nama = ? COLLATE NOCASE AND id != ?',
    [nama, id]
  );
  if (existing) {
    throw new Error('Kategori dengan nama itu sudah ada');
  }

  await db.execAsync('BEGIN');
  try {
    await db.runAsync(
      `UPDATE kategori_pengeluaran
       SET nama = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nama, data.status || 'aktif', id]
    );
    await db.runAsync(
      `UPDATE pengeluaran
       SET kategori_nama = ?, updated_at = CURRENT_TIMESTAMP
       WHERE kategori_id = ?`,
      [nama, id]
    );
    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

export async function deleteKategoriPengeluaran(id: number): Promise<void> {
  const db = await openDatabase();
  const used = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM pengeluaran WHERE kategori_id = ?',
    [id]
  );
  if (used && used.count > 0) {
    throw new Error('Kategori yang sudah dipakai tidak dapat dihapus. Nonaktifkan saja.');
  }
  await db.runAsync('DELETE FROM kategori_pengeluaran WHERE id = ?', [id]);
}
