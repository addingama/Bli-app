/**
 * Home Screen - BliApp
 * Dashboard with summary and quick actions
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  useTheme,
  List,
} from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import type { Pengeluaran, RootStackParamList, Transaksi } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { spacing } from '../theme/theme';
import { colors } from '../theme/colors';
import { boundsForPeriode } from '../database/queries/reports';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatMargin(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const text = rounded.toFixed(1).replace('.', ',');
  return `${rounded > 0 ? '+' : ''}${text}%`;
}

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [summary, setSummary] = useState({
    pembelian: 0,
    penjualan: 0,
    transaksi_beli: 0,
    transaksi_jual: 0,
    keuntungan: 0,
    total_stok: 0,
    nilai_stok: 0,
  });
  const [recent, setRecent] = useState<Transaksi[]>([]);
  const [expenses, setExpenses] = useState<Pengeluaran[]>([]);

  const loadData = useCallback(async () => {
    try {
      const { getTransaksiHariIni } = await import('../database/queries/transaksi');
      const { getPengeluaranBetween } = await import('../database/queries/pengeluaran');
      const bounds = boundsForPeriode('hari');
      const [data, todayExpenses] = await Promise.all([
        getTransaksiHariIni(),
        getPengeluaranBetween(bounds.start, bounds.end),
      ]);
      setSummary({
        pembelian: data.total_pembelian,
        penjualan: data.total_penjualan,
        transaksi_beli: data.jumlah_transaksi_beli,
        transaksi_jual: data.jumlah_transaksi_jual,
        keuntungan: data.keuntungan_kotor,
        total_stok: data.total_stok_items,
        nilai_stok: data.total_nilai_stok,
      });
      setRecent(data.transaksi);
      setExpenses(todayExpenses);
    } catch (error) {
      console.error('[HomeScreen] Error loading data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const marginPercent = summary.pembelian > 0
    ? (summary.keuntungan / summary.pembelian) * 100
    : null;

  return (
    <ScrollView style={styles.container}>
      {/* Dashboard Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>📊 RINGKASAN HARI INI</Title>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                💰 Pembelian
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {formatCurrency(summary.pembelian)}
              </Text>
              <Text style={[styles.summarySubtext, { color: theme.colors.onSurfaceVariant }]}>
                {summary.transaksi_beli} transaksi
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                💵 Penjualan
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.secondary }]}>
                {formatCurrency(summary.penjualan)}
              </Text>
              <Text style={[styles.summarySubtext, { color: theme.colors.onSurfaceVariant }]}>
                {summary.transaksi_jual} transaksi
              </Text>
            </View>
          </View>

          <View style={[styles.profitContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.profitLabel, { color: theme.colors.onSurfaceVariant }]}>
              📈 Keuntungan Kotor
            </Text>
            <Text style={[styles.profitValue, { color: theme.colors.primary }]}>
              {formatCurrency(summary.keuntungan)}
            </Text>
            {marginPercent !== null && (
              <Text style={[styles.profitPercent, { color: theme.colors.onSurfaceVariant }]}>
                {formatMargin(marginPercent)}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Stock Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>📦 STOK</Title>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Barang
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
                {summary.total_stok} jenis
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Nilai
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
                {formatCurrency(summary.nilai_stok)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Title style={styles.sectionTitle}>⚡ QUICK ACTIONS</Title>
        
        <Button
          mode="contained"
          icon="cart-outline"
          onPress={() => navigation.navigate('BuyTransaction')}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
          buttonColor={theme.colors.primary}
        >
          TRANSAKSI BELI
        </Button>
        
        <Button
          mode="contained"
          icon="cash-multiple"
          onPress={() => navigation.navigate('SellTransaction')}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
          buttonColor={theme.colors.secondary}
        >
          TRANSAKSI JUAL
        </Button>

        <Button
          mode="contained"
          icon="cash-minus"
          onPress={() => navigation.navigate('PengeluaranList')}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
          buttonColor={colors.warning}
        >
          PENGELUARAN
        </Button>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Title style={styles.sectionTitle}>📋 AKTIVITAS TERAKHIR</Title>
        
        {recent.length === 0 && expenses.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            Belum ada transaksi atau pengeluaran hari ini
          </Text>
        ) : (
          [...recent.map(item => ({
            key: `trx-${item.id}`,
            time: new Date(item.tanggal).getTime(),
            title: (item.jenis === 'beli' ? item.supplier_nama : item.pembeli_nama) || (item.jenis === 'beli' ? 'Pembelian' : 'Penjualan'),
            description: `${item.jenis === 'beli' ? 'Beli' : 'Jual'} • ${format(new Date(item.tanggal), 'HH:mm')} • ${item.total_items} item`,
            icon: item.jenis === 'beli' ? 'cart-arrow-down' : 'cart-arrow-up',
            color: item.jenis === 'beli' ? theme.colors.primary : theme.colors.secondary,
            amount: item.total_nilai,
            onPress: () => navigation.navigate('TransactionDetail', { transaksiId: item.id }),
          })), ...expenses.map(item => ({
            key: `out-${item.id}`,
            time: new Date(item.tanggal).getTime(),
            title: item.kategori_nama,
            description: `Pengeluaran • ${format(new Date(item.tanggal), 'HH:mm')} • ${item.metode_bayar === 'cash' ? 'Cash' : 'Transfer'}`,
            icon: 'cash-minus',
            color: colors.warning,
            amount: item.nominal,
            onPress: () => navigation.navigate('PengeluaranForm', { mode: 'edit', pengeluaranId: item.id }),
          }))].sort((a, b) => b.time - a.time).map(item => (
            <List.Item
              key={item.key}
              title={item.title}
              description={item.description}
              left={props => (
                <List.Icon {...props} icon={item.icon} color={item.color} />
              )}
              right={() => (
                <Text style={[styles.activityAmount, { color: item.color }]}>
                  {formatCurrency(item.amount)}
                </Text>
              )}
              onPress={item.onPress}
            />
          ))
        )}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  card: {
    margin: spacing.md,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  summarySubtext: {
    fontSize: 12,
  },
  profitContainer: {
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  profitLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  profitValue: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  profitPercent: {
    fontSize: 12,
  },
  actionsContainer: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  actionButtonContent: {
    height: 48,
  },
  activityContainer: {
    padding: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    padding: spacing.lg,
  },
  activityAmount: {
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
