/**
 * Home Screen - BliApp
 * Dashboard with summary and quick actions
 */

import React from 'react';
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
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { spacing } from '../theme/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [summary, setSummary] = React.useState({
    pembelian: 0,
    penjualan: 0,
    transaksi_beli: 0,
    transaksi_jual: 0,
    keuntungan: 0,
    total_stok: 0,
    nilai_stok: 0,
  });
  const [loading, setLoading] = React.useState(true);

  // Load data on mount and when screen is focused
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { getTransaksiHariIni } = await import('../database/queries/transaksi');
      const data = await getTransaksiHariIni();
      setSummary({
        pembelian: data.total_pembelian,
        penjualan: data.total_penjualan,
        transaksi_beli: data.jumlah_transaksi_beli,
        transaksi_jual: data.jumlah_transaksi_jual,
        keuntungan: data.keuntungan_kotor,
        total_stok: data.total_stok_items,
        nilai_stok: data.total_nilai_stok,
      });
    } catch (error) {
      console.error('[HomeScreen] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={[styles.profitPercent, { color: theme.colors.onSurfaceVariant }]}>
              +37.5%
            </Text>
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
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Title style={styles.sectionTitle}>📋 AKTIVITAS TERAKHIR</Title>
        
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          Belum ada transaksi hari ini
        </Text>
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
  bottomPadding: {
    height: spacing.xl,
  },
});
