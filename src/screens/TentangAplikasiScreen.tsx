/**
 * Tentang Aplikasi - BliApp
 * App identity, version, and where data lives
 */

import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { colors, spacing } from '../theme/theme';

const FEATURES = [
  'Transaksi pembelian dan penjualan',
  'Stok barang beserta nilai stok',
  'Laporan keuangan, stok, dan per barang',
  'Backup database dan export Excel',
];

export default function TentangAplikasiScreen() {
  const theme = useTheme();
  const config = Constants.expoConfig;
  const version = config?.version ?? '1.0.0';
  const appId = Platform.OS === 'ios'
    ? config?.ios?.bundleIdentifier
    : config?.android?.package;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="package-variant"
          size={72}
          color={theme.colors.primary}
        />
        <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.onSurface }]}>
          {config?.name ?? 'BliApp'}
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Versi {version}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            BliApp mencatat pembelian, penjualan, stok, dan laporan usaha. Datanya tersimpan di perangkat ini, bukan di server.
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.warningCard]}>
        <Card.Content style={styles.warningContent}>
          <MaterialCommunityIcons name="alert" size={22} color={colors.warning} />
          <Text variant="bodyMedium" style={[styles.warningText, { color: theme.colors.onSurface }]}>
            Jika aplikasi dihapus, transaksi, stok, dan data master ikut hilang dan tidak bisa dikembalikan. Buat backup sebelum menghapus aplikasi.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <InfoRow label="Versi" value={version} />
          {appId ? <InfoRow label="ID aplikasi" value={appId} /> : null}
          <InfoRow
            label="Penyimpanan"
            value="Di perangkat ini"
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Yang tersedia" titleVariant="titleMedium" />
        <Card.Content>
          {FEATURES.map(feature => (
            <View key={feature} style={styles.featureRow}>
              <MaterialCommunityIcons
                name="check"
                size={18}
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurface }]}>
                {feature}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.infoRow}>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  name: {
    marginTop: spacing.md,
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  warningCard: {
    backgroundColor: '#FFF8E1',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  infoRow: {
    paddingVertical: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
});
