/**
 * Transaction Number Generator - BliApp
 * Generate unique transaction numbers
 */

import { format } from 'date-fns';
import { TRANSACTION_PREFIX, DATE_FORMATS } from '../constants';
import { openDatabase } from '../database/init';

/**
 * Generate transaction number
 * Format: TRX-BUY-YYYYMMDD-NNN or TRX-SELL-YYYYMMDD-NNN
 * 
 * @param jenis - Transaction type ('beli' or 'jual')
 * @param tanggal - Transaction date (defaults to today)
 * @returns Generated transaction number
 * 
 * @example
 * await generateTransactionNumber('beli') // "TRX-BUY-20261019-001"
 * await generateTransactionNumber('jual') // "TRX-SELL-20261019-001"
 */
export async function generateTransactionNumber(
  jenis: 'beli' | 'jual',
  tanggal: Date = new Date()
): Promise<string> {
  try {
    // Get prefix based on transaction type
    const prefix = jenis === 'beli' ? TRANSACTION_PREFIX.BUY : TRANSACTION_PREFIX.SELL;
    
    // Format date as YYYYMMDD
    const dateStr = format(tanggal, DATE_FORMATS.TRANSACTION_NUMBER);
    
    // Get next sequence number for this date and type
    const sequence = await getNextSequenceNumber(jenis, dateStr);
    
    // Pad sequence with zeros (3 digits)
    const sequenceStr = sequence.toString().padStart(3, '0');
    
    // Construct transaction number
    const transactionNumber = `${prefix}-${dateStr}-${sequenceStr}`;
    
    return transactionNumber;
  } catch (error) {
    console.error('[TRX] Error generating transaction number:', error);
    // Fallback: use timestamp
    const timestamp = Date.now().toString().slice(-6);
    const prefix = jenis === 'beli' ? TRANSACTION_PREFIX.BUY : TRANSACTION_PREFIX.SELL;
    return `${prefix}-${format(tanggal, DATE_FORMATS.TRANSACTION_NUMBER)}-${timestamp}`;
  }
}

/**
 * Get next sequence number for transaction
 * @param jenis - Transaction type
 * @param dateStr - Date string (YYYYMMDD)
 * @returns Next sequence number
 */
async function getNextSequenceNumber(jenis: 'beli' | 'jual', dateStr: string): Promise<number> {
  try {
    const db = await openDatabase();
    
    // Get prefix pattern
    const prefix = jenis === 'beli' ? TRANSACTION_PREFIX.BUY : TRANSACTION_PREFIX.SELL;
    const pattern = `${prefix}-${dateStr}-%`;
    
    // Query for max sequence number today
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM transaksi 
       WHERE nomor_transaksi LIKE ? AND jenis = ?`,
      [pattern, jenis]
    );
    
    // Next sequence is count + 1
    const nextSequence = (result?.count || 0) + 1;
    
    return nextSequence;
  } catch (error) {
    console.error('[TRX] Error getting sequence number:', error);
    // Fallback: return 1
    return 1;
  }
}

/**
 * Parse transaction number to extract components
 * @param nomorTransaksi - Transaction number
 * @returns Parsed components
 * 
 * @example
 * parseTransactionNumber("TRX-BUY-20261019-001")
 * // { jenis: 'beli', tanggal: '20261019', sequence: 1 }
 */
export function parseTransactionNumber(nomorTransaksi: string): {
  jenis: 'beli' | 'jual' | null;
  tanggal: string | null;
  sequence: number | null;
} {
  try {
    // Split by dash
    const parts = nomorTransaksi.split('-');
    
    if (parts.length !== 4) {
      return { jenis: null, tanggal: null, sequence: null };
    }
    
    const [prefix, jenisStr, tanggal, sequenceStr] = parts;
    
    // Determine jenis from prefix
    let jenis: 'beli' | 'jual' | null = null;
    if (jenisStr === 'BUY') {
      jenis = 'beli';
    } else if (jenisStr === 'SELL') {
      jenis = 'jual';
    }
    
    // Parse sequence
    const sequence = parseInt(sequenceStr, 10);
    
    return {
      jenis,
      tanggal,
      sequence: isNaN(sequence) ? null : sequence,
    };
  } catch (error) {
    console.error('[TRX] Error parsing transaction number:', error);
    return { jenis: null, tanggal: null, sequence: null };
  }
}

/**
 * Validate transaction number format
 * @param nomorTransaksi - Transaction number to validate
 * @returns Validation result
 */
export function validateTransactionNumber(nomorTransaksi: string): boolean {
  // Pattern: TRX-(BUY|SELL)-YYYYMMDD-NNN
  const pattern = /^TRX-(BUY|SELL)-\d{8}-\d{3}$/;
  return pattern.test(nomorTransaksi);
}
