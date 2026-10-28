/**
 * Laporan Keuangan - BliApp
 * Purchase, sale, and gross difference for a local period
 */

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, Title, useTheme, List } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { spacing } from '../theme/theme';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatCurrency';
import LoadingOverlay from '../components/LoadingOverlay';
import EmptyState from '../components/EmptyState';
import PeriodeNavigator from '../components/PeriodeNavigator';
import {
  boundsForPeriode,
  canShiftPeriodeForward,
  getLaporanKeuangan,
  shiftPeriode,
  type LaporanKeuanganHarian,
  type PeriodeLaporan,
} from '../database/queries/reports';

export default function LaporanKeuanganScreen() {
  const theme = useTheme();
  const [periode, setPeriode] = useState<PeriodeLaporan>('hari');
  const [anchor, setAnchor] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [summary, setSummary] = useState({
    pembelian: 0,
    penjualan: 0,
    pengeluaran: 0,
    keuntungan: 0,
    sisa: 0,
    transaksiBeli: 0,
    transaksiJual: 0,
    jumlahPengeluaran: 0,
  });
  const [perHari, setPerHari] = useState<LaporanKeuanganHarian[]>([]);

  const loadData = useCallback(async (nextPeriode: PeriodeLaporan, nextAnchor: Date) => {
    try {
      setLoading(true);
      const bounds = boundsForPeriode(nextPeriode, nextAnchor);
      const data = await getLaporanKeuangan(bounds.start, bounds.end);
      setLabel(bounds.label);
      setSummary({
        pembelian: data.total_pembelian,
        penjualan: data.total_penjualan,
        pengeluaran: data.total_pengeluaran,
        keuntungan: data.keuntungan_kotor,
        sisa: data.sisa,
        transaksiBeli: data.jumlah_transaksi_beli,
        transaksiJual: data.jumlah_transaksi_jual,
        jumlahPengeluaran: data.jumlah_pengeluaran,
      });
      setPerHari(data.per_hari);
    } catch (error) {
      console.error('[LaporanKeuangan] Error loading report:', error);
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

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Ringkasan</Title>
            <SummaryLine label="Pembelian" value={formatCurrency(summary.pembelian)} detail={`${summary.transaksiBeli} transaksi`} color={theme.colors.primary} />
            <SummaryLine label="Penjualan" value={formatCurrency(summary.penjualan)} detail={`${summary.transaksiJual} transaksi`} color={theme.colors.secondary} />
            <SummaryLine label="Selisih" value={formatCurrency(summary.keuntungan)} detail="Penjualan dikurangi pembelian" color={theme.colors.onSurface} />
            <SummaryLine label="Pengeluaran" value={formatCurrency(summary.pengeluaran)} detail={`${summary.jumlahPengeluaran} catatan`} color={colors.warning} />
            <SummaryLine label="Sisa" value={formatCurrency(summary.sisa)} detail="Selisih dikurangi pengeluaran" color={theme.colors.onSurface} />
          </Card.Content>
        </Card>

        <Title style={styles.sectionTitle}>Per hari</Title>
        {perHari.length === 0 ? (
          <EmptyState
            icon="cash-multiple"
            title="Belum ada catatan"
            message="Tidak ada pembelian, penjualan, atau pengeluaran pada periode ini."
          />
        ) : (
          perHari.map(day => (
            <List.Item
              key={day.tanggal}
              title={format(parseISO(day.tanggal), 'd MMM yyyy', { locale: id })}
              description={`Beli ${formatCurrency(day.total_pembelian)} • Jual ${formatCurrency(day.total_penjualan)} • Keluar ${formatCurrency(day.total_pengeluaran)}`}
              right={() => (
                <Text style={styles.dayTotal}>{formatCurrency(day.sisa)}</Text>
              )}
              style={styles.listItem}
            />
          ))
        )}
      </ScrollView>
      <LoadingOverlay visible={loading} message="Memuat laporan keuangan..." />
    </View>
  );
}

function SummaryLine({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <View style={styles.summaryLine}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryDetail}>{detail}</Text>
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
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  summaryLine: {
    marginBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '500',
  },
  summaryDetail: {
    fontSize: 12,
    color: '#757575',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayTotal: {
    alignSelf: 'center',
    fontWeight: '500',
  },
});
