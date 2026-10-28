/**
 * Backup & Export - BliApp
 * Share an Excel workbook, save a database backup, or restore one.
 */

import React, { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Portal, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import * as DocumentPicker from 'expo-document-picker';
import {
  BackupFileError,
  createBackupFile,
  getLastBackupAt,
  markBackupSaved,
  readPickedDatabase,
  restoreDatabase,
} from '../database/backup';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingOverlay from '../components/LoadingOverlay';
import { spacing } from '../theme/theme';
import { createExcelFile } from '../utils/excelExport';
import { shareLocalFile } from '../utils/shareFile';

export default function BackupExportScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Memproses...');
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<Uint8Array | null>(null);

  const loadLastBackup = useCallback(async () => {
    const value = await getLastBackupAt();
    setLastBackup(value);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLastBackup().catch(error => {
        console.error('[BackupExport] Error reading last backup:', error);
      });
    }, [loadLastBackup])
  );

  const run = useCallback(async (label: string, task: () => Promise<void>) => {
    let failure: string | null = null;
    try {
      setMessage(label);
      setLoading(true);
      await task();
    } catch (error) {
      failure = error instanceof BackupFileError || error instanceof Error
        ? error.message
        : 'Terjadi kesalahan.';
    } finally {
      setLoading(false);
    }
    if (failure) {
      setTimeout(() => Alert.alert('Gagal', failure), 400);
      return false;
    }
    return true;
  }, []);

  const exportExcel = () => {
    run('Menyiapkan Excel...', async () => {
      const uri = await createExcelFile();
      await shareLocalFile(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        UTI: 'org.openxmlformats.spreadsheetml.sheet',
        dialogTitle: 'Export ke Excel',
      });
    });
  };

  const backupDatabase = () => {
    run('Menyiapkan backup...', async () => {
      const uri = await createBackupFile();
      await shareLocalFile(uri, {
        mimeType: 'application/octet-stream',
        UTI: 'public.database',
        dialogTitle: 'Simpan backup database',
      });
      await markBackupSaved();
      await loadLastBackup();
    });
  };

  const restoreFromFile = () => {
    run('Membaca file backup...', async () => {
      const picked = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: Platform.OS === 'ios' ? 'public.item' : '*/*',
      });
      if (picked.canceled || !picked.assets[0]) {
        return;
      }
      const bytes = await readPickedDatabase(picked.assets[0].uri);
      setPendingRestore(bytes);
    });
  };

  const confirmRestore = () => {
    const bytes = pendingRestore;
    setPendingRestore(null);
    if (!bytes) return;
    run('Memulihkan database...', async () => {
      await restoreDatabase(bytes);
    }).then(ok => {
      if (!ok) return;
      setTimeout(() => {
        Alert.alert(
          'Restore selesai',
          'Data sudah diganti. Buka kembali Beranda atau menu lain untuk melihat data terbaru.'
        );
      }, 400);
    });
  };

  const lastBackupLabel = lastBackup
    ? format(parseISO(lastBackup), 'd MMM yyyy HH:mm', { locale: id })
    : 'Belum pernah';

  return (
    <Portal.Host>
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Export ke Excel</Text>
            <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
              Satu file berisi barang, supplier, pembeli, transaksi, item, stok, dan mutasi stok. Simpan ke Files, Drive, atau WhatsApp.
            </Text>
            <Button mode="contained" icon="file-excel" onPress={exportExcel} disabled={loading}>
              Bagikan Excel
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Backup Database</Text>
            <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
              Salinan lengkap database (.db). Simpan file ini sebelum mengganti ponsel.
            </Text>
            <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
              Backup terakhir: {lastBackupLabel}
            </Text>
            <Button mode="contained" icon="database" onPress={backupDatabase} disabled={loading}>
              Simpan backup
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Restore Database</Text>
            <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
              Pilih file backup .db. Data di aplikasi ini akan diganti dan tidak bisa dikembalikan dari layar ini.
            </Text>
            <Button
              mode="contained"
              icon="database-import"
              buttonColor={theme.colors.error}
              onPress={restoreFromFile}
              disabled={loading}
            >
              Pilih file backup
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
      <LoadingOverlay visible={loading} message={message} />
      <ConfirmDialog
        visible={pendingRestore !== null}
        title="Ganti data aplikasi?"
        message="Restore mengganti transaksi, stok, dan master data yang ada dengan isi file backup."
        confirmText="Restore"
        cancelText="Batal"
        onConfirm={confirmRestore}
        onCancel={() => setPendingRestore(null)}
      />
    </View>
    </Portal.Host>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  meta: {
    fontSize: 13,
    marginBottom: spacing.md,
  },
});
