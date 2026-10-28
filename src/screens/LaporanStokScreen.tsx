/**
 * Laporan Stok - BliApp
 * Current sellable stock, matching the stock tab
 */

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, List, Text, Title, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import type { RingkasanStok } from '../types';
import { spacing } from '../theme/theme';
import { formatCurrency } from '../utils/formatCurrency';
import { formatQuantity } from '../utils/formatQuantity';
import LoadingOverlay from '../components/LoadingOverlay';
import EmptyState from '../components/EmptyState';

interface KategoriStok {
  kategori: string;
  jumlah: number;
  nilai: number;
}

export default function LaporanStokScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RingkasanStok[]>([]);
  const [kategori, setKategori] = useState<KategoriStok[]>([]);
  const [totalNilai, setTotalNilai] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { getAllStok } = await import('../database/queries/stok');
      const stock = await getAllStok();
      const groups = new Map<string, KategoriStok>();
      let nilai = 0;

      for (const item of stock) {
        const name = item.kategori || 'Lainnya';
        const current = groups.get(name) || { kategori: name, jumlah: 0, nilai: 0 };
        current.jumlah += 1;
        current.nilai += item.total_nilai_stok || 0;
        groups.set(name, current);
        nilai += item.total_nilai_stok || 0;
      }

      setItems(stock);
      setKategori(Array.from(groups.values()).sort((a, b) => b.nilai - a.nilai));
      setTotalNilai(nilai);
    } catch (error) {
      console.error('[LaporanStok] Error loading report:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.summaryLabel}>Total barang penjualan</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              {items.length} jenis
            </Text>
            <Text style={styles.summaryLabel}>Total nilai</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              {formatCurrency(totalNilai)}
            </Text>
          </Card.Content>
        </Card>

        <Title style={styles.sectionTitle}>Per kategori</Title>
        {kategori.map(group => (
          <List.Item
            key={group.kategori}
            title={group.kategori}
            description={`${group.jumlah} jenis`}
            right={() => <Text style={styles.amount}>{formatCurrency(group.nilai)}</Text>}
            style={styles.listItem}
          />
        ))}

        <Title style={styles.sectionTitle}>Rincian barang</Title>
        {items.length === 0 ? (
          <EmptyState
            icon="package-variant-closed"
            title="Belum ada barang penjualan"
            message="Tambahkan barang katalog penjualan, lalu isi stok dan harganya."
          />
        ) : (
          items.map(item => (
            <List.Item
              key={`${item.barang_id}-${item.grade || 'default'}`}
              title={item.grade ? `${item.barang_nama} (${item.grade})` : item.barang_nama}
              description={`${formatQuantity(item.stok_quantity)} ${item.satuan || ''} • ${formatCurrency(item.harga_beli_rata)}/${item.satuan || 'satuan'}`}
              right={() => <Text style={styles.amount}>{formatCurrency(item.total_nilai_stok)}</Text>}
              style={styles.listItem}
            />
          ))
        )}
      </ScrollView>
      <LoadingOverlay visible={loading} message="Memuat laporan stok..." />
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
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  amount: {
    alignSelf: 'center',
    fontWeight: '500',
  },
});
