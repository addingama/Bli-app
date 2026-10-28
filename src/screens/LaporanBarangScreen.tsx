/**
 * Laporan per Barang - BliApp
 * Buy, sell, and current stock for each item in a period
 */

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { spacing } from '../theme/theme';
import { formatCurrency } from '../utils/formatCurrency';
import { formatQuantity } from '../utils/formatQuantity';
import LoadingOverlay from '../components/LoadingOverlay';
import EmptyState from '../components/EmptyState';
import PeriodeNavigator from '../components/PeriodeNavigator';
import {
  boundsForPeriode,
  canShiftPeriodeForward,
  getLaporanSemuaBarang,
  shiftPeriode,
  type LaporanBarangBaris,
  type PeriodeLaporan,
} from '../database/queries/reports';

export default function LaporanBarangScreen() {
  const theme = useTheme();
  const [periode, setPeriode] = useState<PeriodeLaporan>('bulan');
  const [anchor, setAnchor] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [rows, setRows] = useState<LaporanBarangBaris[]>([]);

  const loadData = useCallback(async (nextPeriode: PeriodeLaporan, nextAnchor: Date) => {
    try {
      setLoading(true);
      const bounds = boundsForPeriode(nextPeriode, nextAnchor);
      const data = await getLaporanSemuaBarang(bounds.start, bounds.end);
      setLabel(bounds.label);
      setRows(data);
    } catch (error) {
      console.error('[LaporanBarang] Error loading report:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData(periode, anchor);
    }, [loadData, periode, anchor])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <PeriodeNavigator
          periode={periode}
          label={label}
          canGoForward={canShiftPeriodeForward(periode, anchor)}
          onPeriodeChange={setPeriode}
          onPrevious={() => setAnchor(current => shiftPeriode(periode, current, -1))}
          onNext={() => setAnchor(current => shiftPeriode(periode, current, 1))}
        />

        {rows.length === 0 ? (
          <EmptyState
            icon="chart-bar"
            title="Belum ada barang"
            message="Barang aktif akan muncul di laporan ini."
          />
        ) : (
          rows.map(row => (
            <Card key={row.barang_id} style={styles.card}>
              <Card.Content>
                <Text style={styles.name}>{row.barang_nama}</Text>
                <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
                  {row.katalog === 'beli' ? 'Pembelian' : 'Penjualan'} • {row.satuan}
                </Text>
                <Text style={styles.line}>
                  Beli {formatQuantity(row.qty_beli)} {row.satuan} • {formatCurrency(row.nilai_beli)}
                </Text>
                <Text style={styles.line}>
                  Jual {formatQuantity(row.qty_jual)} {row.satuan} • {formatCurrency(row.nilai_jual)}
                </Text>
                <Text style={[styles.stock, { color: theme.colors.primary }]}>
                  Stok saat ini {formatQuantity(row.stok)} {row.satuan} • {formatCurrency(row.nilai_stok)}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
      <LoadingOverlay visible={loading} message="Memuat laporan barang..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  meta: {
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  line: {
    fontSize: 14,
    color: '#424242',
    marginBottom: spacing.xs,
  },
  stock: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
});
