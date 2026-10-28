/**
 * PembeliFormScreen - BliApp
 * Create and edit pembeli form
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
  useTheme,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, PembeliInput } from '../types';
import { spacing } from '../theme/theme';
import LoadingOverlay from '../components/LoadingOverlay';
import ConfirmDialog from '../components/ConfirmDialog';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'PembeliForm'>;

interface FormData {
  nama: string;
  nomor_hp: string;
  alamat: string;
}

interface FormErrors {
  nama?: string;
}

export default function PembeliFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  const { mode, pembeliId } = route.params;
  const isEditMode = mode === 'edit';
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    nomor_hp: '',
    alamat: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [discardDialog, setDiscardDialog] = useState(false);

  // Load existing pembeli data if edit mode
  useEffect(() => {
    if (isEditMode && pembeliId) {
      loadPembeli();
    }
  }, [isEditMode, pembeliId]);

  const loadPembeli = async () => {
    try {
      setLoading(true);
      const { getPembeliById } = await import('../database/queries/pembeli');
      const pembeli = await getPembeliById(pembeliId!);
      
      if (!pembeli) {
        Alert.alert('Error', 'Pembeli tidak ditemukan');
        navigation.goBack();
        return;
      }
      
      setFormData({
        nama: pembeli.nama,
        nomor_hp: pembeli.nomor_hp || '',
        alamat: pembeli.alamat || '',
      });
    } catch (error) {
      console.error('[PembeliForm] Error loading pembeli:', error);
      Alert.alert('Error', 'Gagal memuat data pembeli');
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

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format: 0812-3456-7890 or 08123456789
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    updateField('nomor_hp', formatted);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama pembeli harus diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Mohon lengkapi semua field yang wajib diisi');
      return;
    }
    
    try {
      setSaving(true);
      const { createPembeli, updatePembeli } = await import('../database/queries/pembeli');
      
      const pembeliData: PembeliInput = {
        nama: formData.nama.trim(),
        nomor_hp: formData.nomor_hp.trim() || undefined,
        alamat: formData.alamat.trim() || undefined,
      };
      
      if (isEditMode && pembeliId) {
        await updatePembeli(pembeliId, pembeliData);
        Alert.alert('Berhasil', 'Pembeli berhasil diupdate');
      } else {
        await createPembeli(pembeliData);
        Alert.alert('Berhasil', 'Pembeli berhasil ditambahkan');
      }
      
      setHasChanges(false);
      navigation.goBack();
    } catch (error) {
      console.error('[PembeliForm] Error saving:', error);
      Alert.alert('Error', 'Gagal menyimpan pembeli');
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
          {/* Nama Pembeli */}
          <TextInput
            mode="outlined"
            label="Nama Pembeli / Perusahaan *"
            value={formData.nama}
            onChangeText={value => updateField('nama', value)}
            error={!!errors.nama}
            style={styles.input}
            placeholder="Contoh: PT Daur Ulang Indonesia"
          />
          {errors.nama && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.nama}
            </Text>
          )}

          {/* Nomor HP */}
          <TextInput
            mode="outlined"
            label="Nomor HP / Telepon"
            value={formData.nomor_hp}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            style={styles.input}
            placeholder="0812-3456-7890"
            maxLength={14}
            left={<TextInput.Icon icon="phone" />}
          />

          {/* Alamat */}
          <TextInput
            mode="outlined"
            label="Alamat"
            value={formData.alamat}
            onChangeText={value => updateField('alamat', value)}
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="Alamat lengkap pembeli"
          />
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
  errorText: {
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
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
