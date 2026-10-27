/**
 * SupplierListScreen - BliApp
 * List of all suppliers with search
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Searchbar,
  FAB,
  List,
  Text,
  useTheme,
  Chip,
  Button,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Supplier } from '../types';
import { spacing } from '../theme/theme';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency } from '../utils/formatCurrency';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SupplierListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  // State
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [filteredList, setFilteredList] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    supplier: Supplier | null;
  }>({ visible: false, supplier: null });

  // Load data on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const { getAllSupplier } = await import('../database/queries/supplier');
      
      const suppliers = await getAllSupplier();
      setSupplierList(suppliers);
      setFilteredList(suppliers);
    } catch (error) {
      console.error('[SupplierList] Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data supplier');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Search logic (testable)
  useEffect(() => {
    filterData(searchQuery);
  }, [searchQuery, supplierList]);

  const filterData = (query: string) => {
    if (!query.trim()) {
      setFilteredList(supplierList);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = supplierList.filter(s =>
      s.nama.toLowerCase().includes(lowerQuery) ||
      (s.nomor_hp && s.nomor_hp.includes(query)) ||
      (s.alamat && s.alamat.toLowerCase().includes(lowerQuery))
    );
    
    setFilteredList(filtered);
  };

  const handleAddSupplier = () => {
    navigation.navigate('SupplierForm', { mode: 'create' });
  };

  const handleEditSupplier = (supplier: Supplier) => {
    navigation.navigate('SupplierForm', { mode: 'edit', supplierId: supplier.id });
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setDeleteDialog({ visible: true, supplier });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.supplier) return;
    
    try {
      setDeleting(true);
      const { deleteSupplier } = await import('../database/queries/supplier');
      
      await deleteSupplier(deleteDialog.supplier.id);
      
      Alert.alert('Berhasil', 'Supplier berhasil dihapus');
      setDeleteDialog({ visible: false, supplier: null });
      await loadData();
    } catch (error: any) {
      console.error('[SupplierList] Error deleting:', error);
      
      // Check if error is due to existing transactions
      if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
        Alert.alert(
          'Tidak Dapat Menghapus',
          'Supplier ini sudah memiliki transaksi dan tidak dapat dihapus. Anda dapat menonaktifkan supplier ini.'
        );
      } else {
        Alert.alert('Error', 'Gagal menghapus supplier');
      }
    } finally {
      setDeleting(false);
      setDeleteDialog({ visible: false, supplier: null });
    }
  };

  const renderItem = ({ item }: { item: Supplier }) => {
    return (
      <List.Item
        title={item.nama}
        description={() => (
          <View>
            {item.nomor_hp && (
              <Text variant="bodySmall" style={styles.itemDescription}>
                📱 {item.nomor_hp}
              </Text>
            )}
            {item.alamat && (
              <Text variant="bodySmall" style={styles.itemDescription} numberOfLines={1}>
                📍 {item.alamat}
              </Text>
            )}
            <View style={styles.statsRow}>
              <Chip compact icon="package-variant" style={styles.statChip}>
                {item.total_transaksi || 0} transaksi
              </Chip>
              {item.jenis && (
                <Chip
                  compact
                  style={[
                    styles.jenisChip,
                    item.jenis === 'langganan'
                      ? { backgroundColor: '#E8F5E9' }
                      : { backgroundColor: '#FFF3E0' }
                  ]}
                >
                  {item.jenis === 'langganan' ? '⭐ Langganan' : '🚶 Walk-in'}
                </Chip>
              )}
            </View>
            {(item.total_pembelian || 0) > 0 && (
              <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: spacing.xs }}>
                Total Pembelian: {formatCurrency(item.total_pembelian || 0)}
              </Text>
            )}
          </View>
        )}
        left={props => <List.Icon {...props} icon="account-circle" />}
        right={props => (
          <View style={styles.itemActions}>
            <Button
              mode="text"
              compact
              onPress={() => handleEditSupplier(item)}
              textColor={theme.colors.primary}
            >
              Edit
            </Button>
            <Button
              mode="text"
              compact
              onPress={() => handleDeleteSupplier(item)}
              textColor={theme.colors.error}
            >
              Hapus
            </Button>
          </View>
        )}
        style={styles.listItem}
      />
    );
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <Searchbar
        placeholder="Cari supplier (nama, HP, alamat)..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
    </View>
  );

  if (loading) {
    return <LoadingOverlay visible={loading} message="Memuat data supplier..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredList}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            icon="account-group"
            title="Belum Ada Supplier"
            message={
              searchQuery
                ? 'Tidak ada supplier yang sesuai dengan pencarian'
                : 'Mulai tambahkan supplier pertama Anda'
            }
            actionText={!searchQuery ? 'Tambah Supplier' : undefined}
            onAction={!searchQuery ? handleAddSupplier : undefined}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={filteredList.length === 0 ? styles.emptyList : undefined}
      />
      
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddSupplier}
        label="Tambah Supplier"
      />
      
      <ConfirmDialog
        visible={deleteDialog.visible}
        title="Hapus Supplier"
        message={`Yakin ingin menghapus "${deleteDialog.supplier?.nama}"? Supplier yang sudah memiliki transaksi tidak dapat dihapus.`}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ visible: false, supplier: null })}
      />
      
      <LoadingOverlay visible={deleting} message="Menghapus supplier..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemDescription: {
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statChip: {
    height: 32,
    paddingVertical: 4,
    backgroundColor: '#E3F2FD',
  },
  jenisChip: {
    height: 32,
    paddingVertical: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
