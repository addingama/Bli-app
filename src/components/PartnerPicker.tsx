/**
 * PartnerPicker - BliApp
 * Name search that links a supplier or buyer, or keeps a walk-in name
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, List, Text, TextInput, useTheme } from 'react-native-paper';
import type { PartnerResult } from '../hooks/usePartnerField';
import { spacing } from '../theme/theme';

interface PartnerPickerProps {
  namaLabel: string;
  nama: string;
  nomorHp: string;
  linked: boolean;
  walkIn: boolean;
  results: PartnerResult[];
  onNamaChange: (value: string) => void;
  onNomorHpChange: (value: string) => void;
  onSelect: (partner: PartnerResult) => void;
  onSaveMaster: () => void;
  onWalkIn: () => void;
}

export default function PartnerPicker({
  namaLabel,
  nama,
  nomorHp,
  linked,
  walkIn,
  results,
  onNamaChange,
  onNomorHpChange,
  onSelect,
  onSaveMaster,
  onWalkIn,
}: PartnerPickerProps) {
  const theme = useTheme();
  const showActions = nama.trim().length > 0 && !linked && !walkIn;

  return (
    <View>
      <TextInput
        mode="outlined"
        label={namaLabel}
        value={nama}
        onChangeText={onNamaChange}
        style={styles.input}
        placeholder="Ketik nama untuk mencari"
      />

      {linked ? (
        <Text style={[styles.hint, { color: theme.colors.primary }]}>
          Terhubung ke master. Nama di transaksi ini tersimpan seperti yang tertulis sekarang.
        </Text>
      ) : null}

      {walkIn ? (
        <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          Dicatat tanpa master.
        </Text>
      ) : null}

      {results.length > 0 ? (
        <View style={[styles.results, { borderColor: theme.colors.outline }]}>
          {results.map(partner => (
            <List.Item
              key={partner.id}
              title={partner.nama}
              description={partner.nomorHp || 'Tanpa nomor HP'}
              left={props => <List.Icon {...props} icon="account" />}
              onPress={() => onSelect(partner)}
            />
          ))}
        </View>
      ) : null}

      {showActions ? (
        <View style={styles.actions}>
          <Button mode="outlined" onPress={onSaveMaster} style={styles.action}>
            Simpan sebagai master
          </Button>
          <Button mode="text" onPress={onWalkIn}>
            Catat tanpa master
          </Button>
        </View>
      ) : null}

      <TextInput
        mode="outlined"
        label="No. HP"
        value={nomorHp}
        onChangeText={onNomorHpChange}
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="Nomor HP (opsional)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  results: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  actions: {
    marginBottom: spacing.sm,
  },
  action: {
    marginBottom: spacing.xs,
  },
});
