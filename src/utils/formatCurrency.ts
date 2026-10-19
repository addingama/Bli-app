/**
 * Currency Formatting Utilities - BliApp
 * Format currency in Indonesian Rupiah (IDR)
 */

import { CURRENCY } from '../constants';

/**
 * Format number to Indonesian Rupiah currency
 * @param amount - Number to format
 * @param includeSymbol - Whether to include "Rp" symbol
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(50000) // "Rp 50.000"
 * formatCurrency(1500000) // "Rp 1.500.000"
 * formatCurrency(50000, false) // "50.000"
 */
export function formatCurrency(amount: number, includeSymbol: boolean = true): string {
  // Handle null/undefined
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? `${CURRENCY.SYMBOL} 0` : '0';
  }

  // Format with thousand separator
  const formatted = Math.abs(amount)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, CURRENCY.THOUSAND_SEPARATOR);

  // Add negative sign if needed
  const sign = amount < 0 ? '-' : '';

  // Return with or without symbol
  return includeSymbol
    ? `${sign}${CURRENCY.SYMBOL} ${formatted}`
    : `${sign}${formatted}`;
}

/**
 * Parse formatted currency string to number
 * @param value - Formatted currency string
 * @returns Parsed number
 * 
 * @example
 * parseCurrency("Rp 50.000") // 50000
 * parseCurrency("1.500.000") // 1500000
 */
export function parseCurrency(value: string): number {
  if (!value || typeof value !== 'string') {
    return 0;
  }

  // Remove all non-numeric characters except decimal separator
  const cleaned = value
    .replace(/[^\d,]/g, '')
    .replace(CURRENCY.THOUSAND_SEPARATOR, '');

  // Parse to number
  const parsed = parseFloat(cleaned) || 0;

  return parsed;
}

/**
 * Format currency for input field (auto-format as user types)
 * @param value - Input value
 * @returns Formatted string for input
 * 
 * @example
 * formatCurrencyInput("50000") // "50.000"
 * formatCurrencyInput("1500000") // "1.500.000"
 */
export function formatCurrencyInput(value: string): string {
  // Remove all non-numeric characters
  const numericValue = value.replace(/[^\d]/g, '');

  // Parse to number and format
  const number = parseInt(numericValue, 10);

  if (isNaN(number) || number === 0) {
    return '';
  }

  return formatCurrency(number, false);
}

/**
 * Validate currency amount
 * @param amount - Amount to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validation result
 */
export function validateCurrency(
  amount: number,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): { valid: boolean; error?: string } {
  if (isNaN(amount)) {
    return { valid: false, error: 'Jumlah tidak valid' };
  }

  if (amount < min) {
    return { valid: false, error: `Jumlah minimal ${formatCurrency(min)}` };
  }

  if (amount > max) {
    return { valid: false, error: `Jumlah maksimal ${formatCurrency(max)}` };
  }

  return { valid: true };
}

/**
 * Format compact currency (for large numbers)
 * @param amount - Number to format
 * @returns Compact formatted string
 * 
 * @example
 * formatCurrencyCompact(1500000) // "Rp 1,5 jt"
 * formatCurrencyCompact(50000000) // "Rp 50 jt"
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000000) {
    // Billions (Miliar)
    return `${CURRENCY.SYMBOL} ${(amount / 1000000000).toFixed(1)} M`;
  } else if (amount >= 1000000) {
    // Millions (Juta)
    return `${CURRENCY.SYMBOL} ${(amount / 1000000).toFixed(1)} jt`;
  } else if (amount >= 1000) {
    // Thousands (Ribu)
    return `${CURRENCY.SYMBOL} ${(amount / 1000).toFixed(0)} rb`;
  }

  return formatCurrency(amount);
}
