/**
 * History Screen - BliApp
 * Display transaction history
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Searchbar,
  SegmentedButtons,
  Title,
  Text,
  useTheme,
} from 'react-native-paper';
import { spacing } from '../theme/theme';

export default function HistoryScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filter, setFilter] = React.useState('semua');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Cari transaksi..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'semua', label: 'Semua' },
            { value: 'beli', label: 'Beli' },
            { value: 'jual', label: 'Jual' },
          ]}
        />
      </View>

      <View style={styles.listContainer}>
        <Title style={styles.sectionTitle}>📋 RIWAYAT TRANSAKSI</Title>
        
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          Belum ada transaksi
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
  listContainer: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.md,
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
