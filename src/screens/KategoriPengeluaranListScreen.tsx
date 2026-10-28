/**
 * Daftar kategori pengeluaran operasional
 */

import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, FAB, List, Searchbar, useTheme } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { KategoriPengeluaran, RootStackParamList } from '../types';
import { spacing } from '../theme/theme';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';
import ConfirmDialog from '../components/ConfirmDialog';
import { KeyboardScreen } from '../components/KeyboardForm';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function KategoriPengeluaranListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<KategoriPengeluaran[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<KategoriPengeluaran | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { getAllKategoriPengeluaran } = await import('../database/queries/kategoriPengeluaran');
      setItems(await getAllKategoriPengeluaran());
    } catch (error) {
      console.error('[KategoriPengeluaranList] Error loading:', error);
      Alert.alert('Error', 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filtered = items.filter(item =>
    item.nama.toLowerCase().includes(query.trim().toLowerCase())
  );

  const confirmDelete = async () => {
    if (!target) return;
    try {
      setDeleting(true);
      const { deleteKategoriPengeluaran } = await import('../database/queries/kategoriPengeluaran');
      await deleteKategoriPengeluaran(target.id);
      setTarget(null);
      await loadData();
    } catch (error) {
      setTarget(null);
      Alert.alert('Tidak bisa dihapus', error instanceof Error ? error.message : 'Gagal menghapus kategori');
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
              placeholder="Cari kategori..."
              value={query}
              onChangeText={setQuery}
              style={styles.searchBar}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="tag-outline"
            title="Belum ada kategori"
            message="Tambahkan kategori seperti karung, tali, atau gaji."
            actionText="Tambah Kategori"
            onAction={() => navigation.navigate('KategoriPengeluaranForm', { mode: 'create' })}
          />
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.nama}
            description={item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
            left={props => <List.Icon {...props} icon="tag-outline" />}
            right={() => (
              <View style={styles.actions}>
                <Button
                  compact
                  onPress={() => navigation.navigate('KategoriPengeluaranForm', { mode: 'edit', kategoriId: item.id })}
                >
                  Edit
                </Button>
                <Button compact textColor={theme.colors.error} onPress={() => setTarget(item)}>
                  Hapus
                </Button>
              </View>
            )}
            style={styles.item}
          />
        )}
      />
      <FAB
        icon="plus"
        label="Tambah Kategori"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('KategoriPengeluaranForm', { mode: 'create' })}
      />
      <ConfirmDialog
        visible={target !== null}
        title="Hapus Kategori"
        message={`Yakin ingin menghapus "${target?.nama}"? Kategori yang sudah dipakai tidak bisa dihapus.`}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
      <LoadingOverlay visible={loading || deleting} message={deleting ? 'Menghapus kategori...' : 'Memuat kategori...'} />
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
