/**
 * Stock Screen - BliApp
 * Display stock list with search and filters
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
  Card,
  Title,
  Text,
  Searchbar,
  useTheme,
  List,
  Chip,
  Menu,
  Button,
  Divider,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import type { RingkasanStok } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { spacing } from '../theme/theme';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';

export default function StockScreen() {
  const theme = useTheme();
  
  // State
  const [stockList, setStockList] = useState<RingkasanStok[]>([]);
  const [filteredList, setFilteredList] = useState<RingkasanStok[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Summary stats
  const [summary, setSummary] = useState({
    totalBarang: 0,
    totalNilai: 0,
  });

  // Load data on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const { getAllStok } = await import('../database/queries/stok');
      const { getAllKategori } = await import('../database/queries/barang');
      
      const [stock, kategoriList] = await Promise.all([
        getAllStok(),
        getAllKategori(),
      ]);
      
      setStockList(stock);
      setFilteredList(stock);
      setCategories(kategoriList);
      
      // Calculate summary
      const totalNilai = stock.reduce((sum, item) => sum + item.total_nilai_stok, 0);
      setSummary({
        totalBarang: stock.length,
        totalNilai,
      });
    } catch (error) {
      console.error('[StockScreen] Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data stok');
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
  }, [searchQuery, selectedCategory, stockList]);

  const filterData = (query: string, category: string | null) => {
    let filtered = [...stockList];
    
    // Apply category filter
    if (category) {
      filtered = filtered.filter(s => s.kategori === category);
    }
    
    // Apply search filter
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(s =>
        s.barang_nama.toLowerCase().includes(lowerQuery) ||
        (s.grade && s.grade.toLowerCase().includes(lowerQuery)) ||
        (s.kategori && s.kategori.toLowerCase().includes(lowerQuery))
      );
    }
    
    setFilteredList(filtered);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setMenuVisible(false);
  };

  const renderItem = ({ item }: { item: RingkasanStok }) => {
    // For low stock, we need to get stok_alert_minimum from barang table
    // For now, we'll just use a default threshold
    const isLowStock = item.stok_quantity <= 10;
    
    return (
      <List.Item
        title={() => (
          <View>
            <Text variant="titleMedium" style={styles.itemTitle}>
              {item.barang_nama}
              {item.grade && (
                <Text style={styles.gradeText}> ({item.grade})</Text>
              )}
            </Text>
          </View>
        )}
        description={() => (
          <View>
            {item.kategori && (
              <Text variant="bodySmall" style={styles.itemDescription}>
                📦 {item.kategori}
              </Text>
            )}
            <View style={styles.statsRow}>
              <Text variant="bodyMedium" style={[
                styles.quantityText,
                isLowStock && { color: theme.colors.error }
              ]}>
                {item.stok_quantity} {item.satuan}
              </Text>
              {isLowStock && (
                <Chip
                  compact
                  icon="alert"
                  style={styles.lowStockChip}
                  textStyle={{ color: theme.colors.error }}
                >
                  Stok Rendah
                </Chip>
              )}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: spacing.xs }}>
              Nilai: {formatCurrency(item.total_nilai_stok)}
            </Text>
          </View>
        )}
        left={props => (
          <List.Icon
            {...props}
            icon="package-variant"
            color={isLowStock ? theme.colors.error : theme.colors.primary}
          />
        )}
        style={styles.listItem}
      />
    );
  };

  const ListHeader = () => (
    <View>
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>💰 RINGKASAN STOK</Title>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Barang
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
                {summary.totalBarang} jenis
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Nilai
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
                {formatCurrency(summary.totalNilai)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Cari barang, grade, kategori..."
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

      <Title style={styles.sectionTitle}>📦 DAFTAR BARANG</Title>
    </View>
  );

  if (loading) {
    return <LoadingOverlay visible={loading} message="Memuat data stok..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredList}
        renderItem={renderItem}
        keyExtractor={item => `${item.barang_id}-${item.grade || 'default'}`}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            icon="package-variant-closed"
            title="Belum Ada Stok"
            message={
              searchQuery || selectedCategory
                ? 'Tidak ada barang yang sesuai dengan pencarian'
                : 'Stok akan muncul setelah ada transaksi pembelian'
            }
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={filteredList.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  summaryCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
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
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
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
    height: 32,
    paddingVertical: 4,
    backgroundColor: '#E3F2FD',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemTitle: {
    fontWeight: '500',
  },
  gradeText: {
    color: '#757575',
    fontWeight: '400',
  },
  itemDescription: {
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  quantityText: {
    fontWeight: '600',
  },
  lowStockChip: {
    height: 32,
    paddingVertical: 4,
    backgroundColor: '#FFEBEE',
  },
  emptyList: {
    flex: 1,
  },
});
