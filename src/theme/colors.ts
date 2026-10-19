/**
 * Color System - BliApp Theme
 * Based on Material Design 3 principles
 */

export const colors = {
  // Primary Colors
  primary: '#4CAF50',        // Material Green - Transaksi Beli
  primaryLight: '#81C784',
  primaryDark: '#388E3C',
  primaryContainer: '#E8F5E9',

  // Secondary Colors
  secondary: '#2196F3',      // Material Blue - Transaksi Jual
  secondaryLight: '#64B5F6',
  secondaryDark: '#1976D2',
  secondaryContainer: '#E3F2FD',

  // Semantic Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Neutral Colors
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',  // Gray 100
  outline: '#E0E0E0',         // Gray 300
  outlineVariant: '#BDBDBD',  // Gray 400

  // Text Colors
  text: {
    primary: '#212121',       // Gray 900
    secondary: '#757575',     // Gray 600
    disabled: '#9E9E9E',      // Gray 500
    hint: '#BDBDBD',          // Gray 400
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.32)',
} as const;

export type Colors = typeof colors;
