/**
 * BarangListScreen - BliApp
 * List of all barang with search and category filter
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
  Menu,
  Button,
  Chip,
  Text,
  useTheme,
  Divider,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Barang } from '../types';
import { spacing } from '../theme/theme';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency } from '../utils/formatCurrency';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BarangListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  // State
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [filteredList, setFilteredList] = useState<Barang[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    barang: Barang | null;
  }>({ visible: false, barang: null });

  // Load data on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const { getAllBarang, getAllKategori } = await import('../database/queries/barang');
      
      const [barang, kategoriList] = await Promise.all([
        getAllBarang(),
        getAllKategori(),
      ]);
      
      setBarangList(barang);
      setFilteredList(barang);
      setCategories(kategoriList);
    } catch (error) {
      console.error('[BarangList] Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data barang');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Search and filter logic (testable)
  useEffect(() => {
    filterData(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, barangList]);

  const filterData = (query: string, category: string | null) => {
    let filtered = [...barangList];
    
    // Apply category filter
    if (category) {
      filtered = filtered.filter(b => b.kategori === category);
    }
    
    // Apply search filter
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(b =>
        b.nama.toLowerCase().includes(lowerQuery) ||
        (b.kategori && b.kategori.toLowerCase().includes(lowerQuery))
      );
    }
    
    setFilteredList(filtered);
  };

  const handleAddBarang = () => {
    navigation.navigate('BarangForm', { mode: 'create' });
  };

  const handleEditBarang = (barang: Barang) => {
    navigation.navigate('BarangForm', { mode: 'edit', barangId: barang.id });
  };

  const handleDeleteBarang = (barang: Barang) => {
    setDeleteDialog({ visible: true, barang });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.barang) return;
    
    try {
      setDeleting(true);
      const { deleteBarang } = await import('../database/queries/barang');
      
      await deleteBarang(deleteDialog.barang.id);
      
      Alert.alert('Berhasil', 'Barang berhasil dihapus');
      setDeleteDialog({ visible: false, barang: null });
      await loadData();
    } catch (error) {
      console.error('[BarangList] Error deleting:', error);
      Alert.alert('Error', 'Gagal menghapus barang');
    } finally {
      setDeleting(false);
    }
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setMenuVisible(false);
  };

  const renderItem = ({ item }: { item: Barang }) => {
    const grades = item.grades ? JSON.parse(item.grades) : [];
    
    return (
      <List.Item
        title={item.nama}
        description={() => (
          <View>
            <Text variant="bodySmall" style={styles.itemDescription}>
              {item.kategori || 'Lainnya'} • {item.satuan_default}
            </Text>
            {grades.length > 0 && (
              <View style={styles.gradesContainer}>
                {grades.map((grade: string) => (
                  <Chip key={grade} compact style={styles.gradeChip}>
                    {grade}
                  </Chip>
                ))}
              </View>
            )}
            {item.harga_beli_terakhir > 0 && (
              <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                Beli: {formatCurrency(item.harga_beli_terakhir)}
              </Text>
            )}
            {item.harga_jual_terakhir > 0 && (
              <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                Jual: {formatCurrency(item.harga_jual_terakhir)}
              </Text>
            )}
          </View>
        )}
        left={props => <List.Icon {...props} icon="package-variant" />}
        right={props => (
          <View style={styles.itemActions}>
            <Button
              mode="text"
              compact
              onPress={() => handleEditBarang(item)}
              textColor={theme.colors.primary}
            >
              Edit
            </Button>
            <Button
              mode="text"
              compact
              onPress={() => handleDeleteBarang(item)}
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
        placeholder="Cari barang..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.filterRow}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="filter-variant"
              onPress={() => setMenuVisible(true)}
              style={styles.filterButton}
            >
              {selectedCategory || 'Semua Kategori'}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => handleCategorySelect(null)}
            title="Semua Kategori"
            leadingIcon={!selectedCategory ? 'check' : undefined}
          />
          <Divider />
          {categories.map(cat => (
            <Menu.Item
              key={cat}
              onPress={() => handleCategorySelect(cat)}
              title={cat}
              leadingIcon={selectedCategory === cat ? 'check' : undefined}
            />
          ))}
        </Menu>
        
        {selectedCategory && (
          <Chip
            icon="close"
            onPress={() => setSelectedCategory(null)}
            style={styles.activeFilterChip}
          >
            {selectedCategory}
          </Chip>
        )}
      </View>
    </View>
  );

  if (loading) {
    return <LoadingOverlay visible={loading} message="Memuat data barang..." />;
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
            icon="package-variant-closed"
            title="Belum Ada Barang"
            message={
              searchQuery || selectedCategory
                ? 'Tidak ada barang yang sesuai dengan pencarian'
                : 'Mulai tambahkan barang pertama Anda'
            }
            actionText={!searchQuery && !selectedCategory ? 'Tambah Barang' : undefined}
            onAction={!searchQuery && !selectedCategory ? handleAddBarang : undefined}
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
        onPress={handleAddBarang}
        label="Tambah Barang"
      />
      
      <ConfirmDialog
        visible={deleteDialog.visible}
        title="Hapus Barang"
        message={`Yakin ingin menghapus "${deleteDialog.barang?.nama}"? Barang akan dinonaktifkan dan tidak muncul di daftar.`}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ visible: false, barang: null })}
      />
      
      <LoadingOverlay visible={deleting} message="Menghapus barang..." />
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
    marginBottom: spacing.md,
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
  },
  activeFilterChip: {
    backgroundColor: '#E3F2FD',
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemDescription: {
    marginTop: spacing.xs,
  },
  gradesContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  gradeChip: {
    height: 28,
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
