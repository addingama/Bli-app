/**
 * Buy Transaction Screen - BliApp
 * Form for recording purchase transactions
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Text,
  Card,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { spacing } from '../theme/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BuyTransactionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [supplierName, setSupplierName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  const [metodeBayar, setMetodeBayar] = React.useState<'cash' | 'transfer'>('cash');

  const totalNilai = items.reduce((sum, item) => sum + (item.sub_total || 0), 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Supplier Info */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>📍 INFORMASI SUPPLIER</Title>
          
          <TextInput
            mode="outlined"
            label="Nama Supplier"
            value={supplierName}
            onChangeText={setSupplierName}
            style={styles.input}
            placeholder="Masukkan nama supplier (opsional)"
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
          <Title style={styles.sectionTitle}>📦 BARANG</Title>
          
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
                <Card.Content>
                  <Text style={styles.itemName}>{item.nama}</Text>
                  <Text style={styles.itemDetail}>
                    {item.quantity} {item.satuan} × {formatCurrency(item.harga_satuan)}
                  </Text>
                  <Text style={[styles.itemSubtotal, { color: theme.colors.primary }]}>
                    = {formatCurrency(item.sub_total)}
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}
          
          <Button
            mode="outlined"
            icon="plus"
            onPress={() => {}}
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
            onPress={() => {}}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            buttonColor={theme.colors.primary}
            disabled={items.length === 0}
          >
            SIMPAN TRANSAKSI BELI
          </Button>
        </View>
      </View>
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
    height: 120, // Height of sticky footer + padding
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
