/**
 * PembeliListScreen - BliApp
 * List of all pembeli with search
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
import type { RootStackParamList, Pembeli } from '../types';
import { spacing } from '../theme/theme';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency } from '../utils/formatCurrency';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PembeliListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  // State
  const [pembeliList, setPembeliList] = useState<Pembeli[]>([]);
  const [filteredList, setFilteredList] = useState<Pembeli[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    pembeli: Pembeli | null;
  }>({ visible: false, pembeli: null });

  // Load data on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const { getAllPembeli } = await import('../database/queries/pembeli');
      
      const pembeli = await getAllPembeli();
      setPembeliList(pembeli);
      setFilteredList(pembeli);
    } catch (error) {
      console.error('[PembeliList] Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data pembeli');
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
  }, [searchQuery, pembeliList]);

  const filterData = (query: string) => {
    if (!query.trim()) {
      setFilteredList(pembeliList);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = pembeliList.filter(p =>
      p.nama.toLowerCase().includes(lowerQuery) ||
      (p.nomor_hp && p.nomor_hp.includes(query)) ||
      (p.alamat && p.alamat.toLowerCase().includes(lowerQuery))
    );
    
    setFilteredList(filtered);
  };

  const handleAddPembeli = () => {
    navigation.navigate('PembeliForm', { mode: 'create' });
  };

  const handleEditPembeli = (pembeli: Pembeli) => {
    navigation.navigate('PembeliForm', { mode: 'edit', pembeliId: pembeli.id });
  };

  const handleDeletePembeli = (pembeli: Pembeli) => {
    setDeleteDialog({ visible: true, pembeli });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.pembeli) return;
    
    try {
      setDeleting(true);
      const { deletePembeli } = await import('../database/queries/pembeli');
      
      await deletePembeli(deleteDialog.pembeli.id);
      
      Alert.alert('Berhasil', 'Pembeli berhasil dihapus');
      setDeleteDialog({ visible: false, pembeli: null });
      await loadData();
    } catch (error: any) {
      console.error('[PembeliList] Error deleting:', error);
      
      // Check if error is due to existing transactions
      if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
        Alert.alert(
          'Tidak Dapat Menghapus',
          'Pembeli ini sudah memiliki transaksi dan tidak dapat dihapus.'
        );
      } else {
        Alert.alert('Error', 'Gagal menghapus pembeli');
      }
    } finally {
      setDeleting(false);
      setDeleteDialog({ visible: false, pembeli: null });
    }
  };

  const renderItem = ({ item }: { item: Pembeli }) => {
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
              <Chip compact icon="cart" style={styles.statChip}>
                {item.total_transaksi || 0} transaksi
              </Chip>
            </View>
            {(item.total_penjualan || 0) > 0 && (
              <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginTop: spacing.xs }}>
                Total Penjualan: {formatCurrency(item.total_penjualan || 0)}
              </Text>
            )}
          </View>
        )}
        left={props => <List.Icon {...props} icon="domain" />}
        right={props => (
          <View style={styles.itemActions}>
            <Button
              mode="text"
              compact
              onPress={() => handleEditPembeli(item)}
              textColor={theme.colors.primary}
            >
              Edit
            </Button>
            <Button
              mode="text"
              compact
              onPress={() => handleDeletePembeli(item)}
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
        placeholder="Cari pembeli (nama, HP, alamat)..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
    </View>
  );

  if (loading) {
    return <LoadingOverlay visible={loading} message="Memuat data pembeli..." />;
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
            icon="domain"
            title="Belum Ada Pembeli"
            message={
              searchQuery
                ? 'Tidak ada pembeli yang sesuai dengan pencarian'
                : 'Mulai tambahkan pembeli pertama Anda'
            }
            actionText={!searchQuery ? 'Tambah Pembeli' : undefined}
            onAction={!searchQuery ? handleAddPembeli : undefined}
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
        onPress={handleAddPembeli}
        label="Tambah Pembeli"
      />
      
      <ConfirmDialog
        visible={deleteDialog.visible}
        title="Hapus Pembeli"
        message={`Yakin ingin menghapus "${deleteDialog.pembeli?.nama}"? Pembeli yang sudah memiliki transaksi tidak dapat dihapus.`}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ visible: false, pembeli: null })}
      />
      
      <LoadingOverlay visible={deleting} message="Menghapus pembeli..." />
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
    height: 28,
    backgroundColor: '#FCE4EC',
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
