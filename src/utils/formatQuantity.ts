/**
 * Quantity formatting for weights that are not whole numbers.
 * Display uses a comma decimal separator. Storage uses a number rounded to 3 decimals.
 */

const DECIMAL_PLACES = 3;
const SCALE = 10 ** DECIMAL_PLACES;

export function roundQuantity(value: number): number {
  if (!Number.isFinite(value)) return NaN;
  return Math.round(value * SCALE) / SCALE;
}

/**
 * Parse "1,5" or "1.5" into a number. Empty or invalid input returns NaN.
 */
export function parseQuantity(value: string): number {
  if (!value || typeof value !== 'string') return NaN;

  const normalized = value.trim().replace(',', '.').replace(/\.$/, '');
  if (!/^\d+(\.\d+)?$/.test(normalized) && !/^\.\d+$/.test(normalized)) return NaN;

  return roundQuantity(parseFloat(normalized));
}

/**
 * Format a quantity with a comma decimal separator and no trailing zeros.
 * @example formatQuantity(1.5) // "1,5"
 */
export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) return '0';

  const rounded = roundQuantity(value);
  const fixed = rounded.toFixed(DECIMAL_PLACES).replace(/\.?0+$/, '');
  return fixed.replace('.', ',');
}

/**
 * Keep digits and a single decimal separator while the user is typing.
 * The separator is shown as a comma.
 */
export function sanitizeQuantityInput(value: string): string {
  const cleaned = value.replace(/[^\d.,]/g, '');
  const separatorIndex = cleaned.search(/[.,]/);
  if (separatorIndex === -1) return cleaned;

  const intPart = cleaned.slice(0, separatorIndex);
  const fraction = cleaned.slice(separatorIndex + 1).replace(/[.,]/g, '').slice(0, DECIMAL_PLACES);
  return `${intPart},${fraction}`;
}

/**
 * Compare quantities after rounding so float noise does not reject a sale that fits.
 */
export function hasEnoughQuantity(available: number, requested: number): boolean {
  return roundQuantity(available) >= roundQuantity(requested);
}
