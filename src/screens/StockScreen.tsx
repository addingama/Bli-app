/**
 * Stock Screen - BliApp
 * Display stock list and summary
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import { formatCurrency } from '../utils/formatCurrency';
import { spacing } from '../theme/theme';

export default function StockScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <ScrollView style={styles.container}>
      <Searchbar
        placeholder="Cari barang..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>💰 RINGKASAN STOK</Title>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Barang
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
                18 jenis
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Nilai
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
                {formatCurrency(2800000)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.listContainer}>
        <Title style={styles.sectionTitle}>📦 DAFTAR BARANG</Title>
        
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          Belum ada data stok
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
  searchBar: {
    margin: spacing.md,
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  summaryCard: {
    marginHorizontal: spacing.md,
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
