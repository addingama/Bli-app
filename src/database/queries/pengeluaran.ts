/**
 * Pengeluaran operasional
 */

import { openDatabase } from '../init';
import type { Pengeluaran, PengeluaranInput } from '../types';

async function kategoriNama(kategoriId: number): Promise<string> {
  const db = await openDatabase();
  const kategori = await db.getFirstAsync<{ nama: string }>(
    'SELECT nama FROM kategori_pengeluaran WHERE id = ?',
    [kategoriId]
  );
  if (!kategori) {
    throw new Error('Kategori tidak ditemukan');
  }
  return kategori.nama;
}

export async function getAllPengeluaran(): Promise<Pengeluaran[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<Pengeluaran>(
    'SELECT * FROM pengeluaran ORDER BY tanggal DESC, id DESC'
  );
  return rows || [];
}

export async function getPengeluaranById(id: number): Promise<Pengeluaran | null> {
  const db = await openDatabase();
  const row = await db.getFirstAsync<Pengeluaran>(
    'SELECT * FROM pengeluaran WHERE id = ?',
    [id]
  );
  return row || null;
}

export async function getPengeluaranBetween(start: string, end: string): Promise<Pengeluaran[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<Pengeluaran>(
    `SELECT * FROM pengeluaran
     WHERE tanggal >= ? AND tanggal < ?
     ORDER BY tanggal DESC, id DESC`,
    [start, end]
  );
  return rows || [];
}

export async function createPengeluaran(data: PengeluaranInput): Promise<number> {
  if (!(data.nominal > 0)) {
    throw new Error('Nominal harus lebih dari 0');
  }
  const nama = await kategoriNama(data.kategori_id);
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO pengeluaran (tanggal, kategori_id, kategori_nama, nominal, metode_bayar, catatan)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.tanggal,
      data.kategori_id,
      nama,
      data.nominal,
      data.metode_bayar,
      data.catatan?.trim() || null,
    ]
  );
  return result.lastInsertRowId;
}

export async function updatePengeluaran(id: number, data: PengeluaranInput): Promise<void> {
  if (!(data.nominal > 0)) {
    throw new Error('Nominal harus lebih dari 0');
  }
  const nama = await kategoriNama(data.kategori_id);
  const db = await openDatabase();
  await db.runAsync(
    `UPDATE pengeluaran
     SET tanggal = ?, kategori_id = ?, kategori_nama = ?, nominal = ?,
         metode_bayar = ?, catatan = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      data.tanggal,
      data.kategori_id,
      nama,
      data.nominal,
      data.metode_bayar,
      data.catatan?.trim() || null,
      id,
    ]
  );
}

export async function deletePengeluaran(id: number): Promise<void> {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM pengeluaran WHERE id = ?', [id]);
}
