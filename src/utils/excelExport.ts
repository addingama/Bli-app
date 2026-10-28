/**
 * Build a workbook of the current BliApp data and write it to the cache.
 */

import { format } from 'date-fns';
import { EncodingType } from 'expo-file-system';
import * as XLSX from 'xlsx';
import { openDatabase } from '../database/init';
import { writeCacheFile } from './shareFile';

type Cell = string | number;
type Row = Record<string, Cell>;

function text(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function num(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatLocal(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'yyyy-MM-dd HH:mm');
}

function katalogLabel(value: unknown): string {
  if (value === 'beli') return 'Pembelian';
  if (value === 'jual') return 'Penjualan';
  return text(value);
}

async function query(sql: string): Promise<Record<string, unknown>[]> {
  const db = await openDatabase();
  try {
    const rows = await db.getAllAsync<Record<string, unknown>>(sql);
    return rows ?? [];
  } finally {
    await db.closeAsync();
  }
}

function addSheet(workbook: XLSX.WorkBook, name: string, rows: Row[], headers: string[]): void {
  const sheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  XLSX.utils.book_append_sheet(workbook, sheet, name);
}

export async function createExcelFile(): Promise<string> {
  const [barang, supplier, pembeli, transaksi, items, stok, mutasi] = await Promise.all([
    query(
      `SELECT nama, kategori, katalog, satuan_default, status,
              harga_beli_terakhir, harga_jual_terakhir, stok_alert_minimum
       FROM barang ORDER BY nama ASC`
    ),
    query(
      `SELECT nama, nomor_hp, alamat, jenis, total_transaksi, total_pembelian
       FROM supplier ORDER BY nama ASC`
    ),
    query(
      `SELECT nama, nomor_hp, alamat, total_transaksi, total_penjualan
       FROM pembeli ORDER BY nama ASC`
    ),
    query(
      `SELECT nomor_transaksi, jenis, tanggal, supplier_nama, pembeli_nama, nomor_hp,
              total_items, total_nilai, metode_bayar, status, catatan
       FROM transaksi ORDER BY tanggal DESC`
    ),
    query(
      `SELECT t.nomor_transaksi, t.jenis, t.tanggal, ti.barang_nama, ti.barang_kategori,
              ti.grade, ti.quantity, ti.satuan, ti.harga_satuan, ti.sub_total, ti.catatan
       FROM transaksi_item ti
       JOIN transaksi t ON t.id = ti.transaksi_id
       ORDER BY t.tanggal DESC, ti.id ASC`
    ),
    query(
      `SELECT barang_nama, grade, quantity, satuan, harga_beli_rata, total_nilai
       FROM stok ORDER BY barang_nama ASC`
    ),
    query(
      `SELECT m.tanggal, b.nama AS barang, m.grade, m.jenis_mutasi, m.nomor_transaksi,
              m.quantity_masuk, m.quantity_keluar, m.saldo, m.satuan,
              m.harga_satuan, m.nilai_mutasi, m.keterangan
       FROM stok_mutasi m
       LEFT JOIN barang b ON b.id = m.barang_id
       ORDER BY m.tanggal DESC`
    ),
  ]);

  const workbook = XLSX.utils.book_new();

  addSheet(
    workbook,
    'Barang',
    barang.map(row => ({
      Nama: text(row.nama),
      Kategori: text(row.kategori),
      Katalog: katalogLabel(row.katalog),
      Satuan: text(row.satuan_default),
      Status: text(row.status),
      'Harga beli terakhir': num(row.harga_beli_terakhir),
      'Harga jual terakhir': num(row.harga_jual_terakhir),
      'Stok minimum': num(row.stok_alert_minimum),
    })),
    ['Nama', 'Kategori', 'Katalog', 'Satuan', 'Status', 'Harga beli terakhir', 'Harga jual terakhir', 'Stok minimum']
  );

  addSheet(
    workbook,
    'Supplier',
    supplier.map(row => ({
      Nama: text(row.nama),
      'Nomor HP': text(row.nomor_hp),
      Alamat: text(row.alamat),
      Jenis: text(row.jenis),
      'Total transaksi': num(row.total_transaksi),
      'Total pembelian': num(row.total_pembelian),
    })),
    ['Nama', 'Nomor HP', 'Alamat', 'Jenis', 'Total transaksi', 'Total pembelian']
  );

  addSheet(
    workbook,
    'Pembeli',
    pembeli.map(row => ({
      Nama: text(row.nama),
      'Nomor HP': text(row.nomor_hp),
      Alamat: text(row.alamat),
      'Total transaksi': num(row.total_transaksi),
      'Total penjualan': num(row.total_penjualan),
    })),
    ['Nama', 'Nomor HP', 'Alamat', 'Total transaksi', 'Total penjualan']
  );

  addSheet(
    workbook,
    'Transaksi',
    transaksi.map(row => ({
      Nomor: text(row.nomor_transaksi),
      Jenis: katalogLabel(row.jenis),
      Tanggal: formatLocal(row.tanggal),
      Supplier: text(row.supplier_nama),
      Pembeli: text(row.pembeli_nama),
      'Nomor HP': text(row.nomor_hp),
      'Jumlah item': num(row.total_items),
      Total: num(row.total_nilai),
      'Metode bayar': text(row.metode_bayar),
      Status: text(row.status),
      Catatan: text(row.catatan),
    })),
    ['Nomor', 'Jenis', 'Tanggal', 'Supplier', 'Pembeli', 'Nomor HP', 'Jumlah item', 'Total', 'Metode bayar', 'Status', 'Catatan']
  );

  addSheet(
    workbook,
    'Item Transaksi',
    items.map(row => ({
      Nomor: text(row.nomor_transaksi),
      Jenis: katalogLabel(row.jenis),
      Tanggal: formatLocal(row.tanggal),
      Barang: text(row.barang_nama),
      Kategori: text(row.barang_kategori),
      Grade: text(row.grade),
      Quantity: num(row.quantity),
      Satuan: text(row.satuan),
      Harga: num(row.harga_satuan),
      Subtotal: num(row.sub_total),
      Catatan: text(row.catatan),
    })),
    ['Nomor', 'Jenis', 'Tanggal', 'Barang', 'Kategori', 'Grade', 'Quantity', 'Satuan', 'Harga', 'Subtotal', 'Catatan']
  );

  addSheet(
    workbook,
    'Stok',
    stok.map(row => ({
      Barang: text(row.barang_nama),
      Grade: text(row.grade),
      Quantity: num(row.quantity),
      Satuan: text(row.satuan),
      'Harga rata': num(row.harga_beli_rata),
      'Total nilai': num(row.total_nilai),
    })),
    ['Barang', 'Grade', 'Quantity', 'Satuan', 'Harga rata', 'Total nilai']
  );

  addSheet(
    workbook,
    'Mutasi Stok',
    mutasi.map(row => ({
      Tanggal: formatLocal(row.tanggal),
      Barang: text(row.barang),
      Grade: text(row.grade),
      Jenis: text(row.jenis_mutasi),
      'Nomor transaksi': text(row.nomor_transaksi),
      Masuk: num(row.quantity_masuk),
      Keluar: num(row.quantity_keluar),
      Saldo: num(row.saldo),
      Satuan: text(row.satuan),
      Harga: num(row.harga_satuan),
      Nilai: num(row.nilai_mutasi),
      Keterangan: text(row.keterangan),
    })),
    ['Tanggal', 'Barang', 'Grade', 'Jenis', 'Nomor transaksi', 'Masuk', 'Keluar', 'Saldo', 'Satuan', 'Harga', 'Nilai', 'Keterangan']
  );

  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' }) as string;
  const file = await writeCacheFile(
    `bliapp-export-${format(new Date(), 'yyyyMMdd-HHmm')}.xlsx`,
    base64,
    EncodingType.Base64
  );
  return file.uri;
}
