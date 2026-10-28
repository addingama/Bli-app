/**
 * Add Item Modal - BliApp
 * Modal for adding items to transactions
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Modal,
  Portal,
  TextInput,
  Button,
  Text,
  List,
  Divider,
  IconButton,
  useTheme,
  Searchbar,
} from 'react-native-paper';
import { formatCurrency, parseCurrency, formatCurrencyInput } from '../utils/formatCurrency';
import { spacing } from '../theme/theme';
import type { TransaksiItemInput, Barang } from '../types';

interface AddItemModalProps {
  visible: boolean;
  onDismiss: () => void;
  onAdd: (item: TransaksiItemInput) => void;
  jenis: 'beli' | 'jual';
}

export interface AddItemModalViewProps {
  visible: boolean;
  jenis: 'beli' | 'jual';
  step: 'search' | 'form';
  searchQuery: string;
  barangList: Barang[];
  selectedBarang: Barang | null;
  grade: string;
  quantity: string;
  satuan: string;
  hargaSatuan: string;
  stokInfo: { available: boolean; current: number } | null;
  onDismiss: () => void;
  onSearchQueryChange: (query: string) => void;
  onSelectBarang: (barang: Barang) => void;
  onBackToSearch: () => void;
  onGradeChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onSatuanChange: (value: string) => void;
  onHargaSatuanChange: (value: string) => void;
  onAdd: () => void;
}

export function AddItemModalView({
  visible,
  jenis,
  step,
  searchQuery,
  barangList,
  selectedBarang,
  grade,
  quantity,
  satuan,
  hargaSatuan,
  stokInfo,
  onDismiss,
  onSearchQueryChange,
  onSelectBarang,
  onBackToSearch,
  onGradeChange,
  onQuantityChange,
  onSatuanChange,
  onHargaSatuanChange,
  onAdd,
}: AddItemModalViewProps) {
  const theme = useTheme();

  const subTotal = React.useMemo(() => {
    const qty = parseFloat(quantity);
    const harga = parseCurrency(hargaSatuan);
    if (isNaN(qty) || isNaN(harga)) return 0;
    return qty * harga;
  }, [quantity, hargaSatuan]);

  const availableGrades = selectedBarang?.grades ? JSON.parse(selectedBarang.grades) : [];
  const addDisabled =
    !quantity ||
    !hargaSatuan ||
    (jenis === 'jual' && stokInfo !== null && !stokInfo.available);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>TAMBAH BARANG</Text>
          <IconButton icon="close" size={24} onPress={onDismiss} />
        </View>

        <Divider />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'search' ? (
            <>
              <Searchbar
                placeholder="Cari barang..."
                onChangeText={onSearchQueryChange}
                value={searchQuery}
                style={styles.searchBar}
              />

              <List.Section>
                {barangList.map((barang) => (
                  <List.Item
                    key={barang.id}
                    title={barang.nama}
                    description={`${barang.kategori || 'Lainnya'} • ${barang.satuan_default}`}
                    left={props => <List.Icon {...props} icon="package-variant" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => onSelectBarang(barang)}
                  />
                ))}

                {barangList.length === 0 && (
                  <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                    {searchQuery ? 'Tidak ada barang ditemukan' : 'Belum ada data barang'}
                  </Text>
                )}
              </List.Section>
            </>
          ) : (
            <>
              <Button
                mode="text"
                icon="arrow-left"
                onPress={onBackToSearch}
                style={styles.backButton}
              >
                Ganti Barang
              </Button>

              <View style={styles.selectedBarang}>
                <Text style={styles.selectedBarangName}>{selectedBarang?.nama}</Text>
                <Text style={[styles.selectedBarangCategory, { color: theme.colors.onSurfaceVariant }]}>
                  {selectedBarang?.kategori || 'Lainnya'}
                </Text>
              </View>

              {availableGrades.length > 0 && (
                <TextInput
                  mode="outlined"
                  label="Grade / Kualitas (opsional)"
                  value={grade}
                  onChangeText={onGradeChange}
                  style={styles.input}
                  placeholder="Contoh: A, B, C"
                />
              )}

              <View style={styles.row}>
                <TextInput
                  mode="outlined"
                  label="Quantity *"
                  value={quantity}
                  onChangeText={onQuantityChange}
                  style={[styles.input, styles.flex1]}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
                <TextInput
                  mode="outlined"
                  label="Satuan"
                  value={satuan}
                  onChangeText={onSatuanChange}
                  style={[styles.input, styles.satuanInput]}
                  placeholder="kg"
                />
              </View>

              {jenis === 'jual' && stokInfo && selectedBarang && (
                <View style={[
                  styles.stockInfo,
                  { backgroundColor: stokInfo.available ? theme.colors.primaryContainer : '#FFEBEE' }
                ]}>
                  <Text style={[
                    styles.stockInfoText,
                    { color: stokInfo.available ? theme.colors.primary : theme.colors.error }
                  ]}>
                    {stokInfo.available ? '✓' : '⚠️'} Stok: {stokInfo.current} {satuan}
                    {!stokInfo.available && ' (Tidak cukup!)'}
                  </Text>
                </View>
              )}

              <TextInput
                mode="outlined"
                label={`Harga per ${satuan} *`}
                value={hargaSatuan}
                onChangeText={(text) => onHargaSatuanChange(formatCurrencyInput(text))}
                style={styles.input}
                keyboardType="number-pad"
                left={<TextInput.Affix text="Rp" />}
                placeholder="0"
              />

              <Divider style={styles.divider} />

              <View style={styles.totalContainer}>
                <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
                  SUB-TOTAL
                </Text>
                <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                  {formatCurrency(subTotal)}
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        {step === 'form' && (
          <>
            <Divider />
            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={onAdd}
                style={styles.addButton}
                contentStyle={styles.addButtonContent}
                disabled={addDisabled}
              >
                TAMBAH ITEM
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );
}

export default function AddItemModal({ visible, onDismiss, onAdd, jenis }: AddItemModalProps) {
  const [step, setStep] = React.useState<'search' | 'form'>('search');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [barangList, setBarangList] = React.useState<Barang[]>([]);
  const [selectedBarang, setSelectedBarang] = React.useState<Barang | null>(null);

  const [grade, setGrade] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [satuan, setSatuan] = React.useState('kg');
  const [hargaSatuan, setHargaSatuan] = React.useState('');
  const [stokInfo, setStokInfo] = React.useState<{ available: boolean; current: number } | null>(null);

  React.useEffect(() => {
    if (visible) {
      loadBarang();
      setStep('search');
      setSearchQuery('');
      setSelectedBarang(null);
      setGrade('');
      setQuantity('');
      setSatuan('kg');
      setHargaSatuan('');
      setStokInfo(null);
    }
  }, [visible]);

  React.useEffect(() => {
    if (searchQuery.length > 0) {
      searchBarang(searchQuery);
    } else {
      loadBarang();
    }
  }, [searchQuery]);

  React.useEffect(() => {
    if (jenis === 'jual' && selectedBarang) {
      checkStock();
    }
  }, [selectedBarang, grade, quantity]);

  const loadBarang = async () => {
    try {
      const { getAllBarang } = await import('../database/queries/barang');
      const data = await getAllBarang();
      setBarangList(data);
    } catch (error) {
      console.error('[AddItemModal] Error loading barang:', error);
    }
  };

  const searchBarang = async (keyword: string) => {
    try {
      const { searchBarang: search } = await import('../database/queries/barang');
      const data = await search(keyword);
      setBarangList(data);
    } catch (error) {
      console.error('[AddItemModal] Error searching barang:', error);
    }
  };

  const checkStock = async () => {
    if (!selectedBarang || !quantity) return;

    try {
      const { checkStokAvailable } = await import('../database/queries/stok');
      const qty = parseFloat(quantity);
      if (isNaN(qty)) return;

      const result = await checkStokAvailable(
        selectedBarang.id,
        grade || null,
        qty
      );
      setStokInfo({ available: result.available, current: result.current_stock });
    } catch (error) {
      console.error('[AddItemModal] Error checking stock:', error);
    }
  };

  const handleSelectBarang = (barang: Barang) => {
    setSelectedBarang(barang);
    setSatuan(barang.satuan_default);

    if (jenis === 'beli' && barang.harga_beli_terakhir > 0) {
      setHargaSatuan(barang.harga_beli_terakhir.toString());
    } else if (jenis === 'jual' && barang.harga_jual_terakhir > 0) {
      setHargaSatuan(barang.harga_jual_terakhir.toString());
    }

    setStep('form');
  };

  const handleAdd = () => {
    if (!selectedBarang) return;

    const qty = parseFloat(quantity);
    const harga = parseCurrency(hargaSatuan);

    if (isNaN(qty) || qty <= 0) {
      alert('Quantity harus lebih dari 0');
      return;
    }

    if (isNaN(harga) || harga < 0) {
      alert('Harga tidak valid');
      return;
    }

    if (jenis === 'jual' && stokInfo && !stokInfo.available) {
      alert(`Stok tidak mencukupi! Tersedia: ${stokInfo.current} ${satuan}`);
      return;
    }

    const item: TransaksiItemInput = {
      barang_id: selectedBarang.id,
      barang_nama: selectedBarang.nama,
      barang_kategori: selectedBarang.kategori,
      grade: grade || undefined,
      quantity: qty,
      satuan,
      harga_satuan: harga,
      sub_total: qty * harga,
    };

    onAdd(item);
    onDismiss();
  };

  return (
    <AddItemModalView
      visible={visible}
      jenis={jenis}
      step={step}
      searchQuery={searchQuery}
      barangList={barangList}
      selectedBarang={selectedBarang}
      grade={grade}
      quantity={quantity}
      satuan={satuan}
      hargaSatuan={hargaSatuan}
      stokInfo={stokInfo}
      onDismiss={onDismiss}
      onSearchQueryChange={setSearchQuery}
      onSelectBarang={handleSelectBarang}
      onBackToSearch={() => setStep('search')}
      onGradeChange={setGrade}
      onQuantityChange={setQuantity}
      onSatuanChange={setSatuan}
      onHargaSatuanChange={setHargaSatuan}
      onAdd={handleAdd}
    />
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingRight: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
  },
  scroll: {
    flexGrow: 0,
  },
  content: {
    padding: spacing.md,
  },
  searchBar: {
    marginBottom: spacing.md,
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  emptyText: {
    textAlign: 'center',
    padding: spacing.lg,
    fontSize: 14,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  selectedBarang: {
    marginBottom: spacing.md,
  },
  selectedBarangName: {
    fontSize: 18,
    fontWeight: '500',
  },
  selectedBarangCategory: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  satuanInput: {
    width: 100,
  },
  stockInfo: {
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  stockInfoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    marginVertical: spacing.md,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '500',
  },
  actions: {
    padding: spacing.md,
  },
  addButton: {
    marginBottom: spacing.sm,
  },
  addButtonContent: {
    height: 48,
  },
});
