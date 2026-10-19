/**
 * Home Screen - BliApp
 * Dashboard with summary and quick actions
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
  Button,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { spacing } from '../theme/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Placeholder data
  const summary = {
    pembelian: 450000,
    penjualan: 720000,
    transaksi_beli: 12,
    transaksi_jual: 8,
    keuntungan: 270000,
    total_stok: 18,
    nilai_stok: 2800000,
  };

  return (
    <ScrollView style={styles.container}>
      {/* Dashboard Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>📊 RINGKASAN HARI INI</Title>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                💰 Pembelian
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {formatCurrency(summary.pembelian)}
              </Text>
              <Text style={[styles.summarySubtext, { color: theme.colors.onSurfaceVariant }]}>
                {summary.transaksi_beli} transaksi
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                💵 Penjualan
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.secondary }]}>
                {formatCurrency(summary.penjualan)}
              </Text>
              <Text style={[styles.summarySubtext, { color: theme.colors.onSurfaceVariant }]}>
                {summary.transaksi_jual} transaksi
              </Text>
            </View>
          </View>

          <View style={[styles.profitContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.profitLabel, { color: theme.colors.onSurfaceVariant }]}>
              📈 Keuntungan Kotor
            </Text>
            <Text style={[styles.profitValue, { color: theme.colors.primary }]}>
              {formatCurrency(summary.keuntungan)}
            </Text>
            <Text style={[styles.profitPercent, { color: theme.colors.onSurfaceVariant }]}>
              +37.5%
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Stock Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>📦 STOK</Title>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Barang
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
                {summary.total_stok} jenis
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Nilai
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
                {formatCurrency(summary.nilai_stok)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Title style={styles.sectionTitle}>⚡ QUICK ACTIONS</Title>
        
        <Button
          mode="contained"
          icon="cart-outline"
          onPress={() => navigation.navigate('BuyTransaction')}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
          buttonColor={theme.colors.primary}
        >
          TRANSAKSI BELI
        </Button>
        
        <Button
          mode="contained"
          icon="cash-multiple"
          onPress={() => navigation.navigate('SellTransaction')}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
          buttonColor={theme.colors.secondary}
        >
          TRANSAKSI JUAL
        </Button>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Title style={styles.sectionTitle}>📋 AKTIVITAS TERAKHIR</Title>
        
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          Belum ada transaksi hari ini
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
  card: {
    margin: spacing.md,
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
    marginBottom: spacing.md,
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
    marginBottom: spacing.xs,
  },
  summarySubtext: {
    fontSize: 12,
  },
  profitContainer: {
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  profitLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  profitValue: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  profitPercent: {
    fontSize: 12,
  },
  actionsContainer: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  actionButtonContent: {
    height: 48,
  },
  activityContainer: {
    padding: spacing.md,
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
