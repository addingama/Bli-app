/**
 * Form pengeluaran operasional
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { Button, Menu, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { KategoriPengeluaran, RootStackParamList } from '../types';
import { spacing } from '../theme/theme';
import { formatCurrencyInput, parseCurrency } from '../utils/formatCurrency';
import KeyboardForm from '../components/KeyboardForm';
import LoadingOverlay from '../components/LoadingOverlay';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'PengeluaranForm'>;

function atNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

export default function PengeluaranFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const isEdit = route.params.mode === 'edit';
  const pengeluaranId = route.params.pengeluaranId;

  const [categories, setCategories] = useState<KategoriPengeluaran[]>([]);
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tanggal, setTanggal] = useState(() => atNoon(new Date()));
  const [showDate, setShowDate] = useState(false);
  const [nominal, setNominal] = useState('');
  const [metodeBayar, setMetodeBayar] = useState<'cash' | 'transfer'>('cash');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { getKategoriPengeluaranUntukForm } = await import('../database/queries/kategoriPengeluaran');
        let selectedId: number | undefined;
        if (isEdit && pengeluaranId != null) {
          const { getPengeluaranById } = await import('../database/queries/pengeluaran');
          const current = await getPengeluaranById(pengeluaranId);
          if (!cancelled && current) {
            selectedId = current.kategori_id ?? undefined;
            setKategoriId(current.kategori_id);
            setTanggal(new Date(current.tanggal));
            setNominal(formatCurrencyInput(String(Math.round(current.nominal))));
            setMetodeBayar(current.metode_bayar);
            setCatatan(current.catatan || '');
          }
        }
        const list = await getKategoriPengeluaranUntukForm(selectedId);
        if (!cancelled) setCategories(list);
      } catch (loadError) {
        console.error('[PengeluaranForm] Error loading:', loadError);
        Alert.alert('Error', 'Gagal memuat pengeluaran');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, pengeluaranId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const { getKategoriPengeluaranUntukForm } = await import('../database/queries/kategoriPengeluaran');
        const list = await getKategoriPengeluaranUntukForm(kategoriId ?? undefined);
        if (!cancelled) setCategories(list);
      })();
      return () => {
        cancelled = true;
      };
    }, [kategoriId])
  );

  const selected = categories.find(item => item.id === kategoriId);

  const handleSave = async () => {
    if (kategoriId == null) {
      setError('Pilih kategori');
      return;
    }
    const amount = parseCurrency(nominal);
    if (!(amount > 0)) {
      setError('Nominal harus lebih dari 0');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const { createPengeluaran, updatePengeluaran } = await import('../database/queries/pengeluaran');
      const payload = {
        tanggal: atNoon(tanggal).toISOString(),
        kategori_id: kategoriId,
        nominal: amount,
        metode_bayar: metodeBayar,
        catatan,
      };
      if (isEdit && pengeluaranId != null) {
        await updatePengeluaran(pengeluaranId, payload);
      } else {
        await createPengeluaran(payload);
      }
      navigation.goBack();
    } catch (saveError) {
      Alert.alert('Gagal menyimpan', saveError instanceof Error ? saveError.message : 'Gagal menyimpan pengeluaran');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingOverlay visible message="Memuat pengeluaran..." />;
  }

  return (
    <KeyboardForm
      style={styles.container}
      footer={
        <View style={[styles.actions, { backgroundColor: theme.colors.surface }]}>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.action} disabled={saving}>
            Batal
          </Button>
          <Button mode="contained" onPress={handleSave} style={styles.action} loading={saving} disabled={saving}>
            Simpan
          </Button>
        </View>
      }
    >
      <View style={styles.form}>
        <Text style={styles.label}>Tanggal</Text>
        <Button mode="outlined" icon="calendar" onPress={() => setShowDate(true)}>
          {format(tanggal, 'd MMMM yyyy', { locale: id })}
        </Button>
        {showDate && (
          <DateTimePicker
            value={tanggal}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_event, selectedDate) => {
              if (Platform.OS !== 'ios') setShowDate(false);
              if (selectedDate) setTanggal(selectedDate);
            }}
          />
        )}
        {Platform.OS === 'ios' && showDate && (
          <Button onPress={() => setShowDate(false)}>Selesai</Button>
        )}

        <Text style={styles.label}>Kategori *</Text>
        {categories.length === 0 ? (
          <Button
            mode="outlined"
            icon="tag-plus"
            onPress={() => navigation.navigate('KategoriPengeluaranForm', { mode: 'create' })}
          >
            Tambah kategori dulu
          </Button>
        ) : (
          <Menu
            visible={menuOpen}
            onDismiss={() => setMenuOpen(false)}
            anchor={
              <Button mode="outlined" icon="tag-outline" onPress={() => setMenuOpen(true)}>
                {selected?.nama || 'Pilih kategori'}
              </Button>
            }
          >
            {categories.map(item => (
              <Menu.Item
                key={item.id}
                title={item.status === 'aktif' ? item.nama : `${item.nama} (nonaktif)`}
                onPress={() => {
                  setKategoriId(item.id);
                  setMenuOpen(false);
                  setError('');
                }}
              />
            ))}
          </Menu>
        )}

        <TextInput
          mode="outlined"
          label="Nominal *"
          value={nominal}
          onChangeText={value => {
            setNominal(formatCurrencyInput(value));
            setError('');
          }}
          keyboardType="number-pad"
          left={<TextInput.Affix text="Rp" />}
          error={!!error}
        />
        {error ? <Text style={{ color: theme.colors.error }}>{error}</Text> : null}

        <Text style={styles.label}>Cara bayar</Text>
        <SegmentedButtons
          value={metodeBayar}
          onValueChange={value => setMetodeBayar(value as 'cash' | 'transfer')}
          buttons={[
            { value: 'cash', label: 'Cash' },
            { value: 'transfer', label: 'Transfer' },
          ]}
        />

        <TextInput
          mode="outlined"
          label="Catatan"
          value={catatan}
          onChangeText={setCatatan}
          multiline
          numberOfLines={3}
          placeholder="Contoh: 10 karung untuk sortir"
        />
      </View>
    </KeyboardForm>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  form: {
    padding: spacing.md,
    gap: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  action: {
    flex: 1,
  },
});
