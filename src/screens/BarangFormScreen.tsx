/**
 * BarangFormScreen - BliApp
 * Create and edit barang form
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  IconButton,
  Text,
  Switch,
  Chip,
  useTheme,
  SegmentedButtons,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, BarangInput } from '../types';
import { spacing } from '../theme/theme';
import LoadingOverlay from '../components/LoadingOverlay';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatQuantity, parseQuantity, sanitizeQuantityInput } from '../utils/formatQuantity';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'BarangForm'>;

interface FormData {
  nama: string;
  kategori: string;
  katalog: 'beli' | 'jual';
  satuan_default: string;
  grades: string[];
  status: 'aktif' | 'nonaktif';
  stok_alert_minimum: string;
}

interface FormErrors {
  nama?: string;
  satuan_default?: string;
}

const SATUAN_OPTIONS = ['kg', 'pcs', 'ton', 'liter', 'box', 'roll'];
const GRADE_PRESETS = ['A', 'B', 'C', 'D'];

export default function BarangFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  const { mode, barangId } = route.params;
  const isEditMode = mode === 'edit';
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    kategori: '',
    katalog: 'jual',
    satuan_default: 'kg',
    grades: [],
    status: 'aktif',
    stok_alert_minimum: '0',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [discardDialog, setDiscardDialog] = useState(false);
  const [gradeInput, setGradeInput] = useState('');

  // Load existing barang data if edit mode
  useEffect(() => {
    if (isEditMode && barangId) {
      loadBarang();
    }
  }, [isEditMode, barangId]);

  const loadBarang = async () => {
    try {
      setLoading(true);
      const { getBarangById } = await import('../database/queries/barang');
      const barang = await getBarangById(barangId!);
      
      if (!barang) {
        Alert.alert('Error', 'Barang tidak ditemukan');
        navigation.goBack();
        return;
      }
      
      setFormData({
        nama: barang.nama,
        kategori: barang.kategori || '',
        katalog: barang.katalog === 'beli' ? 'beli' : 'jual',
        satuan_default: barang.satuan_default,
        grades: barang.grades ? JSON.parse(barang.grades) : [],
        status: barang.status as 'aktif' | 'nonaktif',
        stok_alert_minimum: formatQuantity(barang.stok_alert_minimum),
      });
    } catch (error) {
      console.error('[BarangForm] Error loading barang:', error);
      Alert.alert('Error', 'Gagal memuat data barang');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama barang harus diisi';
    }
    
    if (!formData.satuan_default) {
      newErrors.satuan_default = 'Satuan default harus dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGrade = () => {
    const grade = gradeInput.trim().toUpperCase();
    if (!grade) return;
    
    if (formData.grades.includes(grade)) {
      Alert.alert('Info', 'Grade sudah ada dalam daftar');
      return;
    }
    
    updateField('grades', [...formData.grades, grade]);
    setGradeInput('');
  };

  const handleRemoveGrade = (grade: string) => {
    updateField('grades', formData.grades.filter(g => g !== grade));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Mohon lengkapi semua field yang wajib diisi');
      return;
    }
    
    try {
      setSaving(true);
      const { createBarang, updateBarang } = await import('../database/queries/barang');
      
      const alertMinimum = parseQuantity(formData.stok_alert_minimum);
      const barangData: BarangInput = {
        nama: formData.nama.trim(),
        kategori: formData.kategori.trim() || undefined,
        katalog: formData.katalog,
        satuan_default: formData.satuan_default,
        grades: formData.grades.length > 0 ? formData.grades : undefined,
        status: formData.status,
        stok_alert_minimum:
          formData.katalog === 'jual' && Number.isFinite(alertMinimum) ? alertMinimum : 0,
      };
      
      if (isEditMode && barangId) {
        await updateBarang(barangId, barangData);
        Alert.alert('Berhasil', 'Barang berhasil diupdate');
      } else {
        await createBarang(barangData);
        Alert.alert('Berhasil', 'Barang berhasil ditambahkan');
      }
      
      setHasChanges(false);
      navigation.goBack();
    } catch (error) {
      console.error('[BarangForm] Error saving:', error);
      Alert.alert('Error', 'Gagal menyimpan barang');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      setDiscardDialog(true);
    } else {
      navigation.goBack();
    }
  };

  const confirmDiscard = () => {
    setDiscardDialog(false);
    navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton
          icon="arrow-left"
          iconColor="#FFFFFF"
          size={24}
          onPress={handleBack}
          accessibilityLabel="Kembali"
        />
      ),
    });
  }, [hasChanges]);

  if (loading) {
    return <LoadingOverlay visible={loading} message="Memuat data..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Nama Barang */}
          <TextInput
            mode="outlined"
            label="Nama Barang *"
            value={formData.nama}
            onChangeText={value => updateField('nama', value)}
            error={!!errors.nama}
            style={styles.input}
            placeholder="Contoh: Plastik PET"
          />
          {errors.nama && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.nama}
            </Text>
          )}

          <Text style={styles.label}>Katalog *</Text>
          <SegmentedButtons
            value={formData.katalog}
            onValueChange={value => updateField('katalog', value as 'beli' | 'jual')}
            buttons={[
              { value: 'beli', label: 'Pembelian' },
              { value: 'jual', label: 'Penjualan' },
            ]}
            style={styles.katalogButtons}
          />

          {/* Kategori */}
          <TextInput
            mode="outlined"
            label="Kategori"
            value={formData.kategori}
            onChangeText={value => updateField('kategori', value)}
            style={styles.input}
            placeholder="Contoh: Plastik, Kertas, Logam"
          />

          {/* Satuan Default */}
          <Text style={styles.label}>Satuan Default *</Text>
          <View style={styles.satuanButtons}>
            {SATUAN_OPTIONS.map(satuan => (
              <Chip
                key={satuan}
                selected={formData.satuan_default === satuan}
                onPress={() => updateField('satuan_default', satuan)}
                style={styles.chip}
                mode={formData.satuan_default === satuan ? 'flat' : 'outlined'}
              >
                {satuan}
              </Chip>
            ))}
          </View>

          {/* Grades */}
          <Text style={styles.label}>Grade / Kualitas</Text>
          <View style={styles.gradesSection}>
            <View style={styles.gradeInputRow}>
              <TextInput
                mode="outlined"
                value={gradeInput}
                onChangeText={setGradeInput}
                placeholder="Contoh: A, B, Premium"
                style={styles.gradeInput}
                onSubmitEditing={handleAddGrade}
              />
              <Button
                mode="contained"
                onPress={handleAddGrade}
                disabled={!gradeInput.trim()}
                style={styles.addGradeButton}
              >
                Tambah
              </Button>
            </View>
            
            <View style={styles.gradePresets}>
              {GRADE_PRESETS.map(grade => (
                <Chip
                  key={grade}
                  onPress={() => {
                    if (!formData.grades.includes(grade)) {
                      updateField('grades', [...formData.grades, grade]);
                    }
                  }}
                  style={styles.chip}
                  mode="outlined"
                  disabled={formData.grades.includes(grade)}
                >
                  {grade}
                </Chip>
              ))}
            </View>
            
            {formData.grades.length > 0 && (
              <View style={styles.selectedGrades}>
                {formData.grades.map(grade => (
                  <Chip
                    key={grade}
                    onClose={() => handleRemoveGrade(grade)}
                    style={styles.selectedGradeChip}
                  >
                    {grade}
                  </Chip>
                ))}
              </View>
            )}
          </View>

          {formData.katalog === 'jual' && (
            <TextInput
              mode="outlined"
              label="Stok Alert Minimum"
              value={formData.stok_alert_minimum}
              onChangeText={value => updateField('stok_alert_minimum', sanitizeQuantityInput(value))}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholder="0"
              right={<TextInput.Affix text={formData.satuan_default} />}
            />
          )}

          {/* Status */}
          <View style={styles.statusRow}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.switchRow}>
              <Text>{formData.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</Text>
              <Switch
                value={formData.status === 'aktif'}
                onValueChange={value => updateField('status', value ? 'aktif' : 'nonaktif')}
              />
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actions, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="outlined"
          onPress={handleBack}
          style={styles.actionButton}
          disabled={saving}
        >
          Batal
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.actionButton}
          loading={saving}
          disabled={saving}
        >
          {isEditMode ? 'Update' : 'Simpan'}
        </Button>
      </View>

      <ConfirmDialog
        visible={discardDialog}
        title="Buang Perubahan?"
        message="Perubahan yang belum disimpan akan hilang. Yakin ingin keluar?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        onConfirm={confirmDiscard}
        onCancel={() => setDiscardDialog(false)}
      />

      <LoadingOverlay visible={saving} message="Menyimpan..." />
    </KeyboardAvoidingView>
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
  form: {
    padding: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
    color: '#616161',
  },
  katalogButtons: {
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  satuanButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    marginRight: 0,
  },
  gradesSection: {
    marginBottom: spacing.md,
  },
  gradeInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gradeInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  addGradeButton: {
    justifyContent: 'center',
  },
  gradePresets: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedGrades: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedGradeChip: {
    backgroundColor: '#E3F2FD',
  },
  statusRow: {
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  bottomPadding: {
    height: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
  },
});
