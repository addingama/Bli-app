/**
 * WhatsApp Share Utility - BliApp
 * Generate and share transaction receipts via WhatsApp
 */

import { Share } from 'react-native';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatCurrency } from './formatCurrency';
import { formatQuantity } from './formatQuantity';
import type { Transaksi, TransaksiItem } from '../database/types';
import { DATE_FORMATS } from '../constants';

/**
 * Generate WhatsApp receipt message for transaction
 * @param transaksi - Transaction data
 * @param items - Transaction items
 * @returns Formatted receipt message
 */
export function generateWhatsAppReceipt(
  transaksi: Transaksi,
  items: TransaksiItem[]
): string {
  const isBeli = transaksi.jenis === 'beli';
  
  // Header
  const icon = isBeli ? '📦' : '📤';
  const title = isBeli ? 'STRUK PEMBELIAN' : 'STRUK PENJUALAN';
  
  // Format tanggal
  const tanggal = format(new Date(transaksi.tanggal), 'dd MMM yyyy HH:mm', { locale: id });
  
  // Partner info
  const partnerLabel = isBeli ? 'Supplier' : 'Pembeli';
  const partnerName = isBeli ? transaksi.supplier_nama : transaksi.pembeli_nama;
  const partnerHP = transaksi.nomor_hp;
  
  // Build message
  let message = `${icon} *${title}*\n`;
  message += `No: ${transaksi.nomor_transaksi}\n`;
  message += `Tanggal: ${tanggal}\n\n`;
  
  message += `${partnerLabel}: ${partnerName || '-'}\n`;
  if (partnerHP) {
    message += `HP: ${partnerHP}\n`;
  }
  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*BARANG:*\n`;
  
  // Items
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.barang_nama}`;
    if (item.grade) {
      message += ` ${item.grade}`;
    }
    message += `\n`;
    message += `   ${formatQuantity(item.quantity)} ${item.satuan} × ${formatCurrency(item.harga_satuan)} = ${formatCurrency(item.sub_total)}\n`;
    if (index < items.length - 1) {
      message += `\n`;
    }
  });
  
  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*TOTAL ${isBeli ? 'BAYAR' : 'TERIMA'}: ${formatCurrency(transaksi.total_nilai)}*\n`;
  message += `Metode: ${transaksi.metode_bayar === 'cash' ? 'Cash' : 'Transfer'}\n`;
  
  if (transaksi.catatan) {
    message += `\nCatatan: ${transaksi.catatan}\n`;
  }
  
  message += `\nTerima kasih! 🙏`;
  
  return message;
}

/**
 * Share receipt via WhatsApp
 * @param transaksi - Transaction data
 * @param items - Transaction items
 * @param phoneNumber - Optional phone number to send to directly
 */
export async function shareViaWhatsApp(
  transaksi: Transaksi,
  items: TransaksiItem[],
  phoneNumber?: string
): Promise<void> {
  try {
    const message = generateWhatsAppReceipt(transaksi, items);
    
    if (phoneNumber) {
      // Open WhatsApp with specific number
      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      const whatsappURL = `whatsapp://send?phone=${cleanedNumber}&text=${encodeURIComponent(message)}`;
      
      // Use Linking to open WhatsApp
      const { Linking } = await import('react-native');
      const canOpen = await Linking.canOpenURL(whatsappURL);
      
      if (canOpen) {
        await Linking.openURL(whatsappURL);
      } else {
        throw new Error('WhatsApp tidak terinstall');
      }
    } else {
      // Use Share API (lets user choose how to share)
      await Share.share({
        message,
      });
    }
  } catch (error) {
    console.error('[WhatsApp] Error sharing:', error);
    throw error;
  }
}

/**
 * Copy receipt to clipboard
 * @param transaksi - Transaction data
 * @param items - Transaction items
 */
export async function copyReceiptToClipboard(
  transaksi: Transaksi,
  items: TransaksiItem[]
): Promise<void> {
  try {
    const message = generateWhatsAppReceipt(transaksi, items);
    const Clipboard = (await import('@react-native-clipboard/clipboard')).default;
    Clipboard.setString(message);
  } catch (error) {
    console.error('[Clipboard] Error copying:', error);
    throw error;
  }
}

/**
 * Generate simple SMS receipt (shorter format)
 * @param transaksi - Transaction data
 * @returns SMS message
 */
export function generateSMSReceipt(transaksi: Transaksi): string {
  const isBeli = transaksi.jenis === 'beli';
  const title = isBeli ? 'BELI' : 'JUAL';
  const tanggal = format(new Date(transaksi.tanggal), 'dd/MM/yyyy HH:mm');
  
  let message = `[${title}] ${transaksi.nomor_transaksi}\n`;
  message += `${tanggal}\n`;
  message += `Total: ${formatCurrency(transaksi.total_nilai)}\n`;
  message += `${transaksi.metode_bayar === 'cash' ? 'Cash' : 'Transfer'}`;
  
  return message;
}
