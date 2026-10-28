/**
 * Transaction Detail Screen - BliApp
 * Shows one saved transaction and its line items
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, Card, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { RootStackParamList, TransaksiWithItems } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { formatQuantity } from '../utils/formatQuantity';
import { spacing } from '../theme/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'TransactionDetail'>;

export default function TransactionDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { transaksiId } = route.params;

  const [transaksi, setTransaksi] = useState<TransaksiWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaksi();
  }, [transaksiId]);

  const loadTransaksi = async () => {
    try {
      setLoading(true);
      const { getTransaksiById } = await import('../database/queries/transaksi');
      const data = await getTransaksiById(transaksiId);
      setTransaksi(data);
    } catch (error) {
      console.error('[TransactionDetail] Error loading transaction:', error);
      setTransaksi(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Memuat detail transaksi...</Text>
      </View>
    );
  }

  if (!transaksi) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Transaksi tidak ditemukan</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Kembali
        </Button>
      </View>
    );
  }

  const isBeli = transaksi.jenis === 'beli';
  const tanggal = format(new Date(transaksi.tanggal), 'dd MMMM yyyy, HH:mm', { locale: id });
  const partnerName = isBeli ? transaksi.supplier_nama : transaksi.pembeli_nama;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.jenis, { color: isBeli ? theme.colors.primary : theme.colors.secondary }]}>
            {isBeli ? 'Pembelian' : 'Penjualan'}
          </Text>
          <Text style={styles.nomor}>{transaksi.nomor_transaksi}</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Tanggal</Text>
            <Text style={styles.infoValue}>{tanggal}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
              {isBeli ? 'Supplier' : 'Pembeli'}
            </Text>
            <Text style={styles.infoValue}>{partnerName || '-'}</Text>
          </View>
          {transaksi.nomor_hp ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>No. HP</Text>
              <Text style={styles.infoValue}>{transaksi.nomor_hp}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Metode</Text>
            <Text style={styles.infoValue}>
              {transaksi.metode_bayar === 'cash' ? 'Cash' : 'Transfer'}
            </Text>
          </View>
          {transaksi.catatan ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Catatan</Text>
              <Text style={styles.infoValue}>{transaksi.catatan}</Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>Barang</Text>
      {transaksi.items.map((item) => (
        <Card key={item.id} style={styles.itemCard}>
          <Card.Content>
            <Text style={styles.itemName}>
              {item.barang_nama}
              {item.grade ? ` (${item.grade})` : ''}
            </Text>
            {item.barang_kategori ? (
              <Text style={[styles.itemMeta, { color: theme.colors.onSurfaceVariant }]}>
                {item.barang_kategori}
              </Text>
            ) : null}
            <Text style={styles.itemMeta}>
              {formatQuantity(item.quantity)} {item.satuan} × {formatCurrency(item.harga_satuan)}
            </Text>
            <Text style={[styles.itemTotal, { color: theme.colors.primary }]}>
              {formatCurrency(item.sub_total)}
            </Text>
          </Card.Content>
        </Card>
      ))}

      <Divider style={styles.divider} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total {isBeli ? 'bayar' : 'terima'}</Text>
        <Text style={[styles.totalValue, { color: isBeli ? theme.colors.primary : theme.colors.secondary }]}>
          {formatCurrency(transaksi.total_nilai)}
        </Text>
      </View>
    </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#757575',
  },
  errorText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  jenis: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  nomor: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: spacing.md,
    color: '#212121',
  },
  infoRow: {
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#212121',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.sm,
    color: '#212121',
  },
  itemCard: {
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  itemMeta: {
    fontSize: 14,
    marginTop: spacing.xs,
    color: '#616161',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  totalRow: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '500',
  },
});
