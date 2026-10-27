/**
 * History Screen - BliApp
 * Display transaction history with filters
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
  SegmentedButtons,
  Title,
  Text,
  useTheme,
  List,
  Chip,
  Badge,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import type { Transaksi, JenisTransaksi } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { spacing } from '../theme/theme';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';

export default function HistoryScreen() {
  const theme = useTheme();
  
  // State
  const [transactionList, setTransactionList] = useState<Transaksi[]>([]);
  const [filteredList, setFilteredList] = useState<Transaksi[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'semua' | 'beli' | 'jual'>('semua');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const { getTransaksiList } = await import('../database/queries/transaksi');
      
      // Load recent 100 transactions
      const transactions = await getTransaksiList({
        limit: 100,
        offset: 0,
      });
      
      setTransactionList(transactions);
      setFilteredList(transactions);
    } catch (error) {
      console.error('[HistoryScreen] Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter logic (testable)
  useEffect(() => {
    filterData(searchQuery, filter);
  }, [searchQuery, filter, transactionList]);

  const filterData = (query: string, jenis: 'semua' | 'beli' | 'jual') => {
    let filtered = [...transactionList];
    
    // Apply jenis filter
    if (jenis !== 'semua') {
      filtered = filtered.filter(t => t.jenis === jenis);
    }
    
    // Apply search filter
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(t =>
        t.nomor_transaksi.toLowerCase().includes(lowerQuery) ||
        (t.supplier_nama && t.supplier_nama.toLowerCase().includes(lowerQuery)) ||
        (t.pembeli_nama && t.pembeli_nama.toLowerCase().includes(lowerQuery))
      );
    }
    
    setFilteredList(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Baru saja';
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} jam lalu`;
    } else {
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleDateString('id-ID', options);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lunas':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'batal':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'lunas':
        return 'Lunas';
      case 'pending':
        return 'Pending';
      case 'batal':
        return 'Batal';
      default:
        return status;
    }
  };

  const renderItem = ({ item }: { item: Transaksi }) => {
    const isBuy = item.jenis === 'beli';
    const counterpartyName = isBuy ? item.supplier_nama : item.pembeli_nama;
    
    return (
      <List.Item
        title={() => (
          <View style={styles.itemTitleRow}>
            <Text variant="bodyMedium" style={styles.itemNumber}>
              {item.nomor_transaksi}
            </Text>
            <Chip
              compact
              style={[
                styles.statusChip,
                { backgroundColor: `${getStatusColor(item.status)}20` }
              ]}
              textStyle={{ color: getStatusColor(item.status) }}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>
        )}
        description={() => (
          <View>
            {counterpartyName && (
              <Text variant="bodySmall" style={styles.itemDescription}>
                {isBuy ? '👤' : '🏢'} {counterpartyName}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.itemDescription}>
              🕒 {formatDate(item.tanggal)}
            </Text>
            <Text
              variant="titleMedium"
              style={[
                styles.amountText,
                { color: isBuy ? theme.colors.error : theme.colors.secondary }
              ]}
            >
              {formatCurrency(item.total_nilai)}
            </Text>
            {item.metode_bayar && (
              <Chip
                compact
                icon={item.metode_bayar === 'cash' ? 'cash' : 'bank-transfer'}
                style={styles.paymentChip}
              >
                {item.metode_bayar === 'cash' ? 'Tunai' : 'Transfer'}
              </Chip>
            )}
          </View>
        )}
        left={props => (
          <View style={styles.iconContainer}>
            <List.Icon
              {...props}
              icon={isBuy ? 'cart-arrow-down' : 'cart-arrow-up'}
              color={isBuy ? theme.colors.error : theme.colors.secondary}
            />
            <Badge
              size={18}
              style={[
                styles.badge,
                {
                  backgroundColor: isBuy
                    ? theme.colors.errorContainer
                    : theme.colors.secondaryContainer
                }
              ]}
            >
              {item.total_items}
            </Badge>
          </View>
        )}
        style={styles.listItem}
        onPress={() => {
          // TODO: Navigate to transaction detail
          Alert.alert(
            'Detail Transaksi',
            `Nomor: ${item.nomor_transaksi}\nTotal: ${formatCurrency(item.total_nilai)}`
          );
        }}
      />
    );
  };

  const ListHeader = () => (
    <View>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Cari nomor transaksi, nama..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter as (value: string) => void}
          buttons={[
            {
              value: 'semua',
              label: 'Semua',
              icon: 'format-list-bulleted',
            },
            {
              value: 'beli',
              label: 'Beli',
              icon: 'cart-arrow-down',
            },
            {
              value: 'jual',
              label: 'Jual',
              icon: 'cart-arrow-up',
            },
          ]}
        />
      </View>

      <Title style={styles.sectionTitle}>
        📋 RIWAYAT TRANSAKSI
        {filteredList.length > 0 && (
          <Text style={styles.countText}> ({filteredList.length})</Text>
        )}
      </Title>
    </View>
  );

  if (loading) {
    return <LoadingOverlay visible={loading} message="Memuat riwayat transaksi..." />;
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
            icon="history"
            title="Belum Ada Transaksi"
            message={
              searchQuery || filter !== 'semua'
                ? 'Tidak ada transaksi yang sesuai dengan pencarian'
                : 'Riwayat transaksi akan muncul di sini'
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
  searchContainer: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  countText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '400',
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: spacing.md,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemNumber: {
    fontWeight: '600',
    flex: 1,
  },
  statusChip: {
    height: 24,
  },
  itemDescription: {
    marginTop: spacing.xs,
    color: '#757575',
  },
  amountText: {
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  paymentChip: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    height: 24,
    backgroundColor: '#F5F5F5',
  },
  emptyList: {
    flex: 1,
  },
});
