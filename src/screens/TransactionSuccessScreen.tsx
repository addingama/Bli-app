/**
 * Transaction Success Screen - BliApp
 * Shows success message after transaction and allows WhatsApp sharing
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Button,
  Text,
  Card,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { RootStackParamList } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { shareViaWhatsApp } from '../utils/whatsappShare';
import { spacing } from '../theme/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'TransactionSuccess'>;

export default function TransactionSuccessScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  const { transaksiId, nomorTransaksi, jenis } = route.params;
  
  const [transaksi, setTransaksi] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [sharing, setSharing] = React.useState(false);

  React.useEffect(() => {
    loadTransaksi();
  }, []);

  const loadTransaksi = async () => {
    try {
      setLoading(true);
      const { getTransaksiById } = await import('../database/queries/transaksi');
      const data = await getTransaksiById(transaksiId);
      setTransaksi(data);
    } catch (error) {
      console.error('[TransactionSuccess] Error loading transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!transaksi) return;
    
    try {
      setSharing(true);
      await shareViaWhatsApp(transaksi, transaksi.items);
    } catch (error) {
      console.error('[TransactionSuccess] Error sharing:', error);
      alert('Gagal membuka WhatsApp');
    } finally {
      setSharing(false);
    }
  };

  const handleBackHome = () => {
    navigation.navigate('Main');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Memuat data transaksi...</Text>
      </View>
    );
  }

  if (!transaksi) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaksi tidak ditemukan</Text>
        <Button mode="contained" onPress={handleBackHome}>
          Kembali ke Beranda
        </Button>
      </View>
    );
  }

  const isBeli = jenis === 'beli';
  const tanggal = format(new Date(transaksi.tanggal), 'dd MMMM yyyy, HH:mm', { locale: id });
  const partnerName = isBeli ? transaksi.supplier_nama : transaksi.pembeli_nama;

  return (
    <ScrollView style={styles.container}>
      {/* Success Icon */}
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons
          name="check-circle"
          size={80}
          color={theme.colors.primary}
        />
      </View>

      {/* Success Message */}
      <Text style={styles.successTitle}>TRANSAKSI BERHASIL!</Text>

      {/* Transaction Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
              No. Transaksi
            </Text>
            <Text style={styles.infoValue}>{nomorTransaksi}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
              Tanggal
            </Text>
            <Text style={styles.infoValue}>{tanggal}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
              {isBeli ? 'Supplier' : 'Pembeli'}
            </Text>
            <Text style={styles.infoValue}>{partnerName || '-'}</Text>
          </View>

          {transaksi.nomor_hp && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                No. HP
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.secondary }]}>
                {transaksi.nomor_hp}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
              Total {isBeli ? 'Bayar' : 'Terima'}
            </Text>
            <Text style={[styles.totalValue, { color: isBeli ? theme.colors.primary : theme.colors.secondary }]}>
              {formatCurrency(transaksi.total_nilai)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
              Metode
            </Text>
            <Text style={styles.infoValue}>
              {transaksi.metode_bayar === 'cash' ? 'Cash' : 'Transfer'} • {transaksi.total_items} item
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="whatsapp"
          onPress={handleShare}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
          buttonColor={theme.colors.primary}
          loading={sharing}
          disabled={sharing}
        >
          SHARE VIA WHATSAPP
        </Button>

        <Button
          mode="outlined"
          icon="file-document-outline"
          onPress={() => {}}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
        >
          LIHAT DETAIL TRANSAKSI
        </Button>

        <Button
          mode="text"
          icon="home"
          onPress={handleBackHome}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
        >
          KEMBALI KE BERANDA
        </Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    color: '#212121',
    marginBottom: spacing.xl,
  },
  card: {
    margin: spacing.md,
    borderRadius: 12,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#212121',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: spacing.md,
  },
  actions: {
    padding: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  actionButtonContent: {
    height: 48,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
