/**
 * Menu Screen - BliApp
 * Settings and master data management
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  List,
  Title,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { spacing } from '../theme/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MenuScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView style={styles.container}>
      {/* Reports Section */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>📊 LAPORAN</Title>
        <List.Item
          title="Laporan Keuangan"
          left={(props) => <List.Icon {...props} icon="cash-multiple" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('LaporanKeuangan')}
        />
        <List.Item
          title="Laporan Stok"
          left={(props) => <List.Icon {...props} icon="package-variant" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('LaporanStok')}
        />
        <List.Item
          title="Laporan per Barang"
          left={(props) => <List.Icon {...props} icon="chart-bar" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('LaporanBarang')}
        />
      </View>

      {/* Master Data Section */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>🗄️ MASTER DATA</Title>
        <List.Item
          title="Kelola Barang"
          description="Tambah, edit, dan kelola data barang"
          left={(props) => <List.Icon {...props} icon="package-variant" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('BarangList')}
        />
        <List.Item
          title="Kelola Supplier"
          description="Kelola data supplier dan pemasok"
          left={(props) => <List.Icon {...props} icon="account-group" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('SupplierList')}
        />
        <List.Item
          title="Kelola Pembeli"
          description="Kelola data pembeli dan pelanggan"
          left={(props) => <List.Icon {...props} icon="domain" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('PembeliList')}
        />
      </View>

      {/* Backup & Export Section */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>💾 BACKUP & EXPORT</Title>
        <List.Item
          title="Export ke Excel"
          description="Bagikan data transaksi, stok, dan master"
          left={(props) => <List.Icon {...props} icon="file-excel" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('BackupExport')}
        />
        <List.Item
          title="Backup Database"
          description="Simpan salinan lengkap database"
          left={(props) => <List.Icon {...props} icon="database" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('BackupExport')}
        />
        <List.Item
          title="Restore Database"
          description="Kembalikan data dari file backup"
          left={(props) => <List.Icon {...props} icon="database-import" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('BackupExport')}
        />
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>⚙️ PENGATURAN</Title>
        <List.Item
          title="Tentang Aplikasi"
          left={(props) => <List.Icon {...props} icon="information" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
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
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
