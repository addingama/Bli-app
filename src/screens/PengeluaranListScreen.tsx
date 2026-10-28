/**
 * Daftar pengeluaran operasional
 */

import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, FAB, List, Searchbar, Text, useTheme } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Pengeluaran, RootStackParamList } from '../types';
import { spacing } from '../theme/theme';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatCurrency';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';
import ConfirmDialog from '../components/ConfirmDialog';
import { KeyboardScreen } from '../components/KeyboardForm';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PengeluaranListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<Pengeluaran[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<Pengeluaran | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { getAllPengeluaran } = await import('../database/queries/pengeluaran');
      setItems(await getAllPengeluaran());
    } catch (error) {
      console.error('[PengeluaranList] Error loading:', error);
      Alert.alert('Error', 'Gagal memuat pengeluaran');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const needle = query.trim().toLowerCase();
  const filtered = items.filter(item =>
    item.kategori_nama.toLowerCase().includes(needle) ||
    (item.catatan || '').toLowerCase().includes(needle)
  );

  const confirmDelete = async () => {
    if (!target) return;
    try {
      setDeleting(true);
      const { deletePengeluaran } = await import('../database/queries/pengeluaran');
      await deletePengeluaran(target.id);
      setTarget(null);
      await loadData();
    } catch (error) {
      setTarget(null);
      Alert.alert('Error', error instanceof Error ? error.message : 'Gagal menghapus pengeluaran');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <KeyboardScreen style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Searchbar
              placeholder="Cari kategori atau catatan..."
              value={query}
              onChangeText={setQuery}
              style={styles.searchBar}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="cash-minus"
            title="Belum ada pengeluaran"
            message="Catat biaya karung, tali, gaji, dan biaya operasional lain."
            actionText="Tambah Pengeluaran"
            onAction={() => navigation.navigate('PengeluaranForm', { mode: 'create' })}
          />
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.kategori_nama}
            description={`${format(new Date(item.tanggal), 'd MMM yyyy', { locale: id })} • ${item.metode_bayar === 'cash' ? 'Cash' : 'Transfer'}${item.catatan ? ` • ${item.catatan}` : ''}`}
            left={props => <List.Icon {...props} icon="cash-minus" color={colors.warning} />}
            right={() => (
              <View style={styles.right}>
                <Text style={[styles.amount, { color: colors.warning }]}>{formatCurrency(item.nominal)}</Text>
                <View style={styles.actions}>
                  <Button
                    compact
                    onPress={() => navigation.navigate('PengeluaranForm', { mode: 'edit', pengeluaranId: item.id })}
                  >
                    Edit
                  </Button>
                  <Button compact textColor={theme.colors.error} onPress={() => setTarget(item)}>
                    Hapus
                  </Button>
                </View>
              </View>
            )}
            onPress={() => navigation.navigate('PengeluaranForm', { mode: 'edit', pengeluaranId: item.id })}
            style={styles.item}
          />
        )}
      />
      <FAB
        icon="plus"
        label="Tambah"
        style={[styles.fab, { backgroundColor: colors.warning }]}
        color="#FFFFFF"
        onPress={() => navigation.navigate('PengeluaranForm', { mode: 'create' })}
      />
      <ConfirmDialog
        visible={target !== null}
        title="Hapus Pengeluaran"
        message={`Yakin ingin menghapus pengeluaran ${target?.kategori_nama} sebesar ${formatCurrency(target?.nominal || 0)}?`}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
      <LoadingOverlay visible={loading || deleting} message={deleting ? 'Menghapus pengeluaran...' : 'Memuat pengeluaran...'} />
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: spacing.md,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
