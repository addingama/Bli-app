/**
 * Theme Configuration - BliApp
 * React Native Paper theme setup with Material Design 3
 */

import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { colors } from './colors';

export const theme: MD3Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryContainer,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryContainer,
    tertiary: colors.info,
    error: colors.error,
    errorContainer: '#FFEBEE',
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    surfaceDisabled: 'rgba(0, 0, 0, 0.12)',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: colors.primaryDark,
    onSecondary: '#FFFFFF',
    onSecondaryContainer: colors.secondaryDark,
    onTertiary: '#FFFFFF',
    onBackground: colors.text.primary,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    onSurfaceDisabled: colors.text.disabled,
    onError: '#FFFFFF',
    onErrorContainer: '#B71C1C',
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
    inverseSurface: '#212121',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: colors.primaryLight,
    shadow: '#000000',
    scrim: colors.scrim,
    backdrop: colors.overlay,
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
  roundness: 8,
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Elevation (shadow)
export const elevation = {
  0: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1,
    elevation: 1,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.5,
    elevation: 2,
  },
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2.5,
    elevation: 3,
  },
  4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
    elevation: 4,
  },
  5: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.26,
    shadowRadius: 6,
    elevation: 5,
  },
  8: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Elevation = typeof elevation;

// Export all
export { colors } from './colors';
export { typography } from './typography';
