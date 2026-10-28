/**
 * Reports Queries - BliApp
 * Reporting and analytics queries
 */

import { addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import { id } from 'date-fns/locale';
import { openDatabase } from '../init';
import type { LaporanHarian } from '../types';

export type PeriodeLaporan = 'hari' | 'minggu' | 'bulan';

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Inclusive local dates, stored as ISO timestamps used by transaksi.tanggal. */
export function boundsForPeriode(periode: PeriodeLaporan, now = new Date()): {
  start: string;
  end: string;
  label: string;
} {
  const from = periode === 'minggu'
    ? startOfWeek(now, { weekStartsOn: 1 })
    : periode === 'bulan'
      ? startOfMonth(now)
      : now;
  const to = periode === 'minggu'
    ? endOfWeek(now, { weekStartsOn: 1 })
    : periode === 'bulan'
      ? endOfMonth(now)
      : now;
  const start = startOfLocalDay(from);
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1);
  const sameDay = start.toDateString() === startOfLocalDay(to).toDateString();
  const label = sameDay
    ? format(start, 'd MMM yyyy', { locale: id })
    : `${format(start, 'd MMM', { locale: id })} – ${format(to, 'd MMM yyyy', { locale: id })}`;

  return { start: start.toISOString(), end: end.toISOString(), label };
}

/** Move the anchor by one day, week, or month. */
export function shiftPeriode(periode: PeriodeLaporan, anchor: Date, direction: -1 | 1): Date {
  if (periode === 'minggu') return addWeeks(anchor, direction);
  if (periode === 'bulan') return addMonths(anchor, direction);
  return addDays(anchor, direction);
}

/** The next period is allowed only when it has already started. */
export function canShiftPeriodeForward(periode: PeriodeLaporan, anchor: Date, now = new Date()): boolean {
  const shifted = shiftPeriode(periode, anchor, 1);
  const start = new Date(boundsForPeriode(periode, shifted).start);
  return start.getTime() <= startOfLocalDay(now).getTime();
}

export interface LaporanKeuanganHarian {
  tanggal: string;
  total_pembelian: number;
  total_penjualan: number;
  keuntungan_kotor: number;
}

export async function getLaporanKeuangan(start: string, end: string): Promise<{
  total_pembelian: number;
  total_penjualan: number;
  keuntungan_kotor: number;
  jumlah_transaksi_beli: number;
  jumlah_transaksi_jual: number;
  per_hari: LaporanKeuanganHarian[];
}> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<{
    tanggal: string;
    jenis: 'beli' | 'jual';
    total_nilai: number;
  }>(
    `SELECT tanggal, jenis, total_nilai
     FROM transaksi
     WHERE status = 'lunas' AND tanggal >= ? AND tanggal < ?
     ORDER BY tanggal DESC`,
    [start, end]
  );

  const byDay = new Map<string, LaporanKeuanganHarian>();
  let totalPembelian = 0;
  let totalPenjualan = 0;
  let jumlahBeli = 0;
  let jumlahJual = 0;

  for (const row of rows || []) {
    const day = format(new Date(row.tanggal), 'yyyy-MM-dd');
    const current = byDay.get(day) || {
      tanggal: day,
      total_pembelian: 0,
      total_penjualan: 0,
      keuntungan_kotor: 0,
    };
    if (row.jenis === 'beli') {
      current.total_pembelian += row.total_nilai;
      totalPembelian += row.total_nilai;
      jumlahBeli += 1;
    } else {
      current.total_penjualan += row.total_nilai;
      totalPenjualan += row.total_nilai;
      jumlahJual += 1;
    }
    current.keuntungan_kotor = current.total_penjualan - current.total_pembelian;
    byDay.set(day, current);
  }

  return {
    total_pembelian: totalPembelian,
    total_penjualan: totalPenjualan,
    keuntungan_kotor: totalPenjualan - totalPembelian,
    jumlah_transaksi_beli: jumlahBeli,
    jumlah_transaksi_jual: jumlahJual,
    per_hari: Array.from(byDay.values()),
  };
}

export interface LaporanBarangBaris {
  barang_id: number;
  barang_nama: string;
  katalog: 'beli' | 'jual';
  satuan: string;
  qty_beli: number;
  nilai_beli: number;
  qty_jual: number;
  nilai_jual: number;
  stok: number;
  nilai_stok: number;
}

export async function getLaporanSemuaBarang(start: string, end: string): Promise<LaporanBarangBaris[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<LaporanBarangBaris>(
    `SELECT
      b.id as barang_id,
      b.nama as barang_nama,
      b.katalog as katalog,
      b.satuan_default as satuan,
      COALESCE(SUM(CASE WHEN t.jenis = 'beli' THEN ti.quantity ELSE 0 END), 0) as qty_beli,
      COALESCE(SUM(CASE WHEN t.jenis = 'beli' THEN ti.sub_total ELSE 0 END), 0) as nilai_beli,
      COALESCE(SUM(CASE WHEN t.jenis = 'jual' THEN ti.quantity ELSE 0 END), 0) as qty_jual,
      COALESCE(SUM(CASE WHEN t.jenis = 'jual' THEN ti.sub_total ELSE 0 END), 0) as nilai_jual,
      COALESCE((SELECT SUM(quantity) FROM stok WHERE barang_id = b.id), 0) as stok,
      COALESCE((SELECT SUM(total_nilai) FROM stok WHERE barang_id = b.id), 0) as nilai_stok
     FROM barang b
     LEFT JOIN transaksi_item ti ON ti.barang_id = b.id
     LEFT JOIN transaksi t ON t.id = ti.transaksi_id
       AND t.status = 'lunas'
       AND t.tanggal >= ?
       AND t.tanggal < ?
     WHERE b.status = 'aktif'
     GROUP BY b.id
     ORDER BY b.nama ASC`,
    [start, end]
  );
  return rows || [];
}

/**
 * Get daily report for a specific date
 */
export async function getLaporanHarian(date: string): Promise<LaporanHarian> {
  try {
    const db = await openDatabase();
    const result = await db.getFirstAsync<LaporanHarian>(
      'SELECT * FROM v_laporan_harian WHERE tanggal = DATE(?)',
      [date]
    );
    
    return result || {
      tanggal: date,
      total_pembelian: 0,
      total_penjualan: 0,
      keuntungan_kotor: 0,
    };
  } catch (error) {
    console.error('[Reports] Error getting daily report:', error);
    throw error;
  }
}

/**
 * Get report for a period
 */
export async function getLaporanPeriode(
  startDate: string,
  endDate: string
): Promise<{
  total_pembelian: number;
  total_penjualan: number;
  keuntungan_kotor: number;
  margin_persen: number;
  jumlah_transaksi_beli: number;
  jumlah_transaksi_jual: number;
  rata_rata_transaksi_beli: number;
  rata_rata_transaksi_jual: number;
  per_hari: LaporanHarian[];
}> {
  try {
    const db = await openDatabase();
    
    // Summary
    const summary = await db.getFirstAsync<{
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
       WHERE DATE(tanggal) >= DATE(?) AND DATE(tanggal) <= DATE(?)
       AND status = 'lunas'`,
      [startDate, endDate]
    );
    
    // Daily breakdown
    const perHari = await db.getAllAsync<LaporanHarian>(
      `SELECT * FROM v_laporan_harian
       WHERE tanggal >= DATE(?) AND tanggal <= DATE(?)
       ORDER BY tanggal DESC`,
      [startDate, endDate]
    );
    
    const totalPembelian = summary?.total_pembelian || 0;
    const totalPenjualan = summary?.total_penjualan || 0;
    const keuntunganKotor = totalPenjualan - totalPembelian;
    const marginPersen = totalPembelian > 0 ? (keuntunganKotor / totalPembelian) * 100 : 0;
    
    return {
      total_pembelian: totalPembelian,
      total_penjualan: totalPenjualan,
      keuntungan_kotor: keuntunganKotor,
      margin_persen: marginPersen,
      jumlah_transaksi_beli: summary?.jumlah_transaksi_beli || 0,
      jumlah_transaksi_jual: summary?.jumlah_transaksi_jual || 0,
      rata_rata_transaksi_beli: summary?.jumlah_transaksi_beli ? totalPembelian / summary.jumlah_transaksi_beli : 0,
      rata_rata_transaksi_jual: summary?.jumlah_transaksi_jual ? totalPenjualan / summary.jumlah_transaksi_jual : 0,
      per_hari: perHari || [],
    };
  } catch (error) {
    console.error('[Reports] Error getting period report:', error);
    throw error;
  }
}

/**
 * Get report per barang for a period
 */
export async function getLaporanPerBarang(
  barangId: number,
  period?: { from: string; to: string }
): Promise<{
  barang_id: number;
  barang_nama: string;
  total_pembelian_qty: number;
  total_pembelian_nilai: number;
  total_penjualan_qty: number;
  total_penjualan_nilai: number;
  keuntungan_kotor: number;
  margin_persen: number;
  stok_saat_ini: number;
}> {
  try {
    const db = await openDatabase();
    
    let query = `
      SELECT 
        ti.barang_id,
        ti.barang_nama,
        SUM(CASE WHEN t.jenis = 'beli' THEN ti.quantity ELSE 0 END) as total_pembelian_qty,
        SUM(CASE WHEN t.jenis = 'beli' THEN ti.sub_total ELSE 0 END) as total_pembelian_nilai,
        SUM(CASE WHEN t.jenis = 'jual' THEN ti.quantity ELSE 0 END) as total_penjualan_qty,
        SUM(CASE WHEN t.jenis = 'jual' THEN ti.sub_total ELSE 0 END) as total_penjualan_nilai
      FROM transaksi_item ti
      JOIN transaksi t ON ti.transaksi_id = t.id
      WHERE ti.barang_id = ? AND t.status = 'lunas'
    `;
    const params: any[] = [barangId];
    
    if (period) {
      query += ' AND DATE(t.tanggal) >= DATE(?) AND DATE(t.tanggal) <= DATE(?)';
      params.push(period.from, period.to);
    }
    
    const result = await db.getFirstAsync<{
      barang_id: number;
      barang_nama: string;
      total_pembelian_qty: number;
      total_pembelian_nilai: number;
      total_penjualan_qty: number;
      total_penjualan_nilai: number;
    }>(query, params);
    
    // Get current stock
    const stok = await db.getFirstAsync<{ quantity: number }>(
      'SELECT SUM(quantity) as quantity FROM stok WHERE barang_id = ?',
      [barangId]
    );
    
    const pembelianNilai = result?.total_pembelian_nilai || 0;
    const penjualanNilai = result?.total_penjualan_nilai || 0;
    const keuntungan = penjualanNilai - pembelianNilai;
    const margin = pembelianNilai > 0 ? (keuntungan / pembelianNilai) * 100 : 0;
    
    return {
      barang_id: result?.barang_id || barangId,
      barang_nama: result?.barang_nama || '',
      total_pembelian_qty: result?.total_pembelian_qty || 0,
      total_pembelian_nilai: pembelianNilai,
      total_penjualan_qty: result?.total_penjualan_qty || 0,
      total_penjualan_nilai: penjualanNilai,
      keuntungan_kotor: keuntungan,
      margin_persen: margin,
      stok_saat_ini: stok?.quantity || 0,
    };
  } catch (error) {
    console.error('[Reports] Error getting per-barang report:', error);
    throw error;
  }
}

/**
 * Get report per supplier for a period
 */
export async function getLaporanPerSupplier(
  supplierId: number,
  period?: { from: string; to: string }
): Promise<{
  supplier_id: number;
  supplier_nama: string;
  total_transaksi: number;
  total_pembelian: number;
  rata_rata_transaksi: number;
  transaksi_terakhir?: string;
  top_barang: Array<{ barang_nama: string; total_qty: number; total_nilai: number }>;
}> {
  try {
    const db = await openDatabase();
    
    let query = `
      SELECT 
        t.supplier_id,
        t.supplier_nama,
        COUNT(*) as total_transaksi,
        SUM(t.total_nilai) as total_pembelian,
        MAX(t.tanggal) as transaksi_terakhir
      FROM transaksi t
      WHERE t.supplier_id = ? AND t.jenis = 'beli' AND t.status = 'lunas'
    `;
    const params: any[] = [supplierId];
    
    if (period) {
      query += ' AND DATE(t.tanggal) >= DATE(?) AND DATE(t.tanggal) <= DATE(?)';
      params.push(period.from, period.to);
    }
    
    const result = await db.getFirstAsync<{
      supplier_id: number;
      supplier_nama: string;
      total_transaksi: number;
      total_pembelian: number;
      transaksi_terakhir?: string;
    }>(query, params);
    
    // Get top items from this supplier
    let topBarangQuery = `
      SELECT 
        ti.barang_nama,
        SUM(ti.quantity) as total_qty,
        SUM(ti.sub_total) as total_nilai
      FROM transaksi_item ti
      JOIN transaksi t ON ti.transaksi_id = t.id
      WHERE t.supplier_id = ? AND t.jenis = 'beli' AND t.status = 'lunas'
    `;
    const topBarangParams: any[] = [supplierId];
    
    if (period) {
      topBarangQuery += ' AND DATE(t.tanggal) >= DATE(?) AND DATE(t.tanggal) <= DATE(?)';
      topBarangParams.push(period.from, period.to);
    }
    
    topBarangQuery += ' GROUP BY ti.barang_nama ORDER BY total_nilai DESC LIMIT 5';
    
    const topBarang = await db.getAllAsync<{
      barang_nama: string;
      total_qty: number;
      total_nilai: number;
    }>(topBarangQuery, topBarangParams);
    
    const totalPembelian = result?.total_pembelian || 0;
    const totalTransaksi = result?.total_transaksi || 0;
    
    return {
      supplier_id: result?.supplier_id || supplierId,
      supplier_nama: result?.supplier_nama || '',
      total_transaksi: totalTransaksi,
      total_pembelian: totalPembelian,
      rata_rata_transaksi: totalTransaksi > 0 ? totalPembelian / totalTransaksi : 0,
      transaksi_terakhir: result?.transaksi_terakhir,
      top_barang: topBarang || [],
    };
  } catch (error) {
    console.error('[Reports] Error getting per-supplier report:', error);
    throw error;
  }
}

/**
 * Get report per pembeli for a period
 */
export async function getLaporanPerPembeli(
  pembeliId: number,
  period?: { from: string; to: string }
): Promise<{
  pembeli_id: number;
  pembeli_nama: string;
  total_transaksi: number;
  total_penjualan: number;
  rata_rata_transaksi: number;
  transaksi_terakhir?: string;
  top_barang: Array<{ barang_nama: string; total_qty: number; total_nilai: number }>;
}> {
  try {
    const db = await openDatabase();
    
    let query = `
      SELECT 
        t.pembeli_id,
        t.pembeli_nama,
        COUNT(*) as total_transaksi,
        SUM(t.total_nilai) as total_penjualan,
        MAX(t.tanggal) as transaksi_terakhir
      FROM transaksi t
      WHERE t.pembeli_id = ? AND t.jenis = 'jual' AND t.status = 'lunas'
    `;
    const params: any[] = [pembeliId];
    
    if (period) {
      query += ' AND DATE(t.tanggal) >= DATE(?) AND DATE(t.tanggal) <= DATE(?)';
      params.push(period.from, period.to);
    }
    
    const result = await db.getFirstAsync<{
      pembeli_id: number;
      pembeli_nama: string;
      total_transaksi: number;
      total_penjualan: number;
      transaksi_terakhir?: string;
    }>(query, params);
    
    // Get top items sold to this pembeli
    let topBarangQuery = `
      SELECT 
        ti.barang_nama,
        SUM(ti.quantity) as total_qty,
        SUM(ti.sub_total) as total_nilai
      FROM transaksi_item ti
      JOIN transaksi t ON ti.transaksi_id = t.id
      WHERE t.pembeli_id = ? AND t.jenis = 'jual' AND t.status = 'lunas'
    `;
    const topBarangParams: any[] = [pembeliId];
    
    if (period) {
      topBarangQuery += ' AND DATE(t.tanggal) >= DATE(?) AND DATE(t.tanggal) <= DATE(?)';
      topBarangParams.push(period.from, period.to);
    }
    
    topBarangQuery += ' GROUP BY ti.barang_nama ORDER BY total_nilai DESC LIMIT 5';
    
    const topBarang = await db.getAllAsync<{
      barang_nama: string;
      total_qty: number;
      total_nilai: number;
    }>(topBarangQuery, topBarangParams);
    
    const totalPenjualan = result?.total_penjualan || 0;
    const totalTransaksi = result?.total_transaksi || 0;
    
    return {
      pembeli_id: result?.pembeli_id || pembeliId,
      pembeli_nama: result?.pembeli_nama || '',
      total_transaksi: totalTransaksi,
      total_penjualan: totalPenjualan,
      rata_rata_transaksi: totalTransaksi > 0 ? totalPenjualan / totalTransaksi : 0,
      transaksi_terakhir: result?.transaksi_terakhir,
      top_barang: topBarang || [],
    };
  } catch (error) {
    console.error('[Reports] Error getting per-pembeli report:', error);
    throw error;
  }
}
