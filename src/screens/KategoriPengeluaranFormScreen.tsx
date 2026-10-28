/**
 * Form kategori pengeluaran
 */

import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { spacing } from '../theme/theme';
import KeyboardForm from '../components/KeyboardForm';
import LoadingOverlay from '../components/LoadingOverlay';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'KategoriPengeluaranForm'>;

export default function KategoriPengeluaranFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const isEdit = route.params.mode === 'edit';
  const kategoriId = route.params.kategoriId;

  const [nama, setNama] = useState('');
  const [aktif, setAktif] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || kategoriId == null) return;
    let cancelled = false;
    (async () => {
      try {
        const { getKategoriPengeluaranById } = await import('../database/queries/kategoriPengeluaran');
        const kategori = await getKategoriPengeluaranById(kategoriId);
        if (!cancelled && kategori) {
          setNama(kategori.nama);
          setAktif(kategori.status === 'aktif');
        }
      } catch (loadError) {
        console.error('[KategoriPengeluaranForm] Error loading:', loadError);
        Alert.alert('Error', 'Gagal memuat kategori');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, kategoriId]);

  const handleSave = async () => {
    const trimmed = nama.trim();
    if (!trimmed) {
      setError('Nama kategori wajib diisi');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const { createKategoriPengeluaran, updateKategoriPengeluaran } = await import(
        '../database/queries/kategoriPengeluaran'
      );
      const payload = { nama: trimmed, status: aktif ? 'aktif' as const : 'nonaktif' as const };
      if (isEdit && kategoriId != null) {
        await updateKategoriPengeluaran(kategoriId, payload);
      } else {
        await createKategoriPengeluaran(payload);
      }
      navigation.goBack();
    } catch (saveError) {
      Alert.alert('Gagal menyimpan', saveError instanceof Error ? saveError.message : 'Gagal menyimpan kategori');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingOverlay visible message="Memuat kategori..." />;
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
        <TextInput
          mode="outlined"
          label="Nama kategori *"
          value={nama}
          onChangeText={value => {
            setNama(value);
            setError('');
          }}
          error={!!error}
          placeholder="Contoh: Karung"
        />
        {error ? <Text style={{ color: theme.colors.error }}>{error}</Text> : null}
        <View style={styles.switchRow}>
          <Text>Aktif</Text>
          <Switch value={aktif} onValueChange={setAktif} />
        </View>
        <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          Kategori nonaktif tidak muncul saat mencatat pengeluaran baru.
        </Text>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    fontSize: 13,
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
