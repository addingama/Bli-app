/**
 * PeriodeNavigator - BliApp
 * Day, week, or month selector that can step backward and forward
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import type { PeriodeLaporan } from '../database/queries/reports';
import { spacing } from '../theme/theme';

interface PeriodeNavigatorProps {
  periode: PeriodeLaporan;
  label: string;
  canGoForward: boolean;
  onPeriodeChange: (periode: PeriodeLaporan) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function PeriodeNavigator({
  periode,
  label,
  canGoForward,
  onPeriodeChange,
  onPrevious,
  onNext,
}: PeriodeNavigatorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={periode}
        onValueChange={value => onPeriodeChange(value as PeriodeLaporan)}
        buttons={[
          { value: 'hari', label: 'Hari' },
          { value: 'minggu', label: 'Minggu' },
          { value: 'bulan', label: 'Bulan' },
        ]}
      />
      <View style={styles.stepper}>
        <IconButton
          icon="chevron-left"
          accessibilityLabel="Periode sebelumnya"
          onPress={onPrevious}
        />
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
        <IconButton
          icon="chevron-right"
          accessibilityLabel="Periode berikutnya"
          disabled={!canGoForward}
          onPress={onNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
});
