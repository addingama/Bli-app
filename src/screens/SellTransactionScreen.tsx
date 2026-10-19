/**
 * Sell Transaction Screen - BliApp
 * Form for recording sales transactions
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Text,
  Card,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TransaksiItemInput } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { spacing } from '../theme/theme';
import AddItemModal from '../components/AddItemModal';
import { createTransaksiJual } from '../database/queries/transaksi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SellTransactionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [pembeliName, setPembeliName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [items, setItems] = React.useState<TransaksiItemInput[]>([]);
  const [metodeBayar, setMetodeBayar] = React.useState<'cash' | 'transfer'>('cash');
  const [catatan, setCatatan] = React.useState('');
  const [showAddItem, setShowAddItem] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const totalNilai = items.reduce((sum, item) => sum + item.sub_total, 0);

  const handleAddItem = (item: TransaksiItemInput) => {
    setItems([...items, item]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Minimal tambahkan 1 barang');
      return;
    }

    try {
      setSaving(true);

      const result = await createTransaksiJual({
        jenis: 'jual',
        pembeli_nama: pembeliName || 'Pembeli',
        nomor_hp: phoneNumber || undefined,
        items,
        total_nilai: totalNilai,
        metode_bayar: metodeBayar,
        catatan: catatan || undefined,
      });

      console.log('[SellTransaction] Transaction saved:', result);

      // Navigate to success screen
      navigation.replace('TransactionSuccess', {
        transaksiId: result.transaksi_id,
        nomorTransaksi: result.nomor_transaksi,
        jenis: 'jual',
      });
    } catch (error) {
      console.error('[SellTransaction] Error saving:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Gagal menyimpan transaksi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Pembeli Info */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>🏢 INFORMASI PEMBELI</Title>
          
          <TextInput
            mode="outlined"
            label="Nama Pembeli"
            value={pembeliName}
            onChangeText={setPembeliName}
            style={styles.input}
            placeholder="Masukkan nama pembeli (opsional)"
          />
          
          <TextInput
            mode="outlined"
            label="No. HP"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="Masukkan nomor HP (opsional)"
          />
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>📦 BARANG DIJUAL</Title>
          
          {items.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  Belum ada barang ditambahkan
                </Text>
              </Card.Content>
            </Card>
          ) : (
            items.map((item, index) => (
              <Card key={index} style={styles.itemCard}>
                <Card.Content style={styles.itemCardContent}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>
                      {item.barang_nama}
                      {item.grade && ` ${item.grade}`}
                    </Text>
                    <Text style={styles.itemDetail}>
                      {item.quantity} {item.satuan} × {formatCurrency(item.harga_satuan)}
                    </Text>
                    <Text style={[styles.itemSubtotal, { color: theme.colors.secondary }]}>
                      = {formatCurrency(item.sub_total)}
                    </Text>
                  </View>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => handleRemoveItem(index)}
                  />
                </Card.Content>
              </Card>
            ))
          )}
          
          <Button
            mode="outlined"
            icon="plus"
            onPress={() => setShowAddItem(true)}
            style={styles.addButton}
            contentStyle={styles.addButtonContent}
          >
            TAMBAH BARANG
          </Button>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>💳 PEMBAYARAN</Title>
          
          <View style={styles.paymentMethodContainer}>
            <Button
              mode={metodeBayar === 'cash' ? 'contained' : 'outlined'}
              onPress={() => setMetodeBayar('cash')}
              style={styles.paymentButton}
            >
              Cash
            </Button>
            <Button
              mode={metodeBayar === 'transfer' ? 'contained' : 'outlined'}
              onPress={() => setMetodeBayar('transfer')}
              style={styles.paymentButton}
            >
              Transfer
            </Button>
          </View>
        </View>

        {/* Catatan */}
        <View style={styles.section}>
          <TextInput
            mode="outlined"
            label="Catatan (opsional)"
            value={catatan}
            onChangeText={setCatatan}
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Tambahkan catatan transaksi"
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.footerContent}>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
              TOTAL:
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(totalNilai)}
            </Text>
            <Text style={[styles.totalItems, { color: theme.colors.onSurfaceVariant }]}>
              {items.length} item
            </Text>
          </View>
          
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            buttonColor={theme.colors.secondary}
            disabled={items.length === 0 || saving}
            loading={saving}
          >
            {saving ? 'MENYIMPAN...' : 'SIMPAN TRANSAKSI JUAL'}
          </Button>
        </View>
      </View>

      {/* Add Item Modal */}
      <AddItemModal
        visible={showAddItem}
        onDismiss={() => setShowAddItem(false)}
        onAdd={handleAddItem}
        jenis="jual"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  emptyCard: {
    marginBottom: spacing.md,
    backgroundColor: '#F5F5F5',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  itemCard: {
    marginBottom: spacing.md,
    backgroundColor: '#F5F5F5',
  },
  itemCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  itemDetail: {
    fontSize: 14,
    color: '#757575',
    marginBottom: spacing.xs,
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    marginTop: spacing.sm,
  },
  addButtonContent: {
    height: 48,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paymentButton: {
    flex: 1,
  },
  bottomPadding: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
  },
  footerContent: {
    padding: spacing.md,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: spacing.sm,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '500',
    flex: 1,
  },
  totalItems: {
    fontSize: 14,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  saveButtonContent: {
    height: 48,
  },
});
