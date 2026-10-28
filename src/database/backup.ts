/**
 * Backup and restore the local SQLite database.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { File } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { STORAGE_KEYS } from '../constants';
import { writeCacheFile } from '../utils/shareFile';
import { initDatabase, openDatabase } from './init';

const REQUIRED_TABLES = [
  'barang',
  'supplier',
  'pembeli',
  'transaksi',
  'transaksi_item',
  'stok',
] as const;

export class BackupFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupFileError';
  }
}

function assertSqliteHeader(bytes: Uint8Array): void {
  if (bytes.byteLength < 100) {
    throw new BackupFileError('File ini terlalu kecil untuk database BliApp.');
  }
  const header = String.fromCharCode(...bytes.subarray(0, 15));
  if (header !== 'SQLite format 3') {
    throw new BackupFileError('Pilih file backup database BliApp (.db).');
  }
}

async function assertBliAppDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  const placeholders = REQUIRED_TABLES.map(() => '?').join(', ');
  const rows = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (${placeholders})`,
    [...REQUIRED_TABLES]
  );
  if ((rows?.length ?? 0) < REQUIRED_TABLES.length) {
    throw new BackupFileError('File ini bukan backup database BliApp.');
  }
}

export async function readPickedDatabase(uri: string): Promise<Uint8Array> {
  const bytes = await new File(uri).bytes();
  assertSqliteHeader(bytes);

  let probe: SQLite.SQLiteDatabase | null = null;
  try {
    probe = await SQLite.deserializeDatabaseAsync(bytes);
    await assertBliAppDatabase(probe);
  } catch (error) {
    if (error instanceof BackupFileError) {
      throw error;
    }
    throw new BackupFileError('File backup tidak bisa dibaca.');
  } finally {
    await probe?.closeAsync();
  }

  return bytes;
}

/** Consistent snapshot of the open database, written to the cache as a .db file. */
export async function createBackupFile(): Promise<string> {
  const db = await openDatabase();
  try {
    await db.execAsync('PRAGMA wal_checkpoint(FULL)');
    const bytes = await db.serializeAsync();
    const name = `bliapp-backup-${format(new Date(), 'yyyyMMdd-HHmm')}.db`;
    const file = await writeCacheFile(name, bytes);
    return file.uri;
  } finally {
    await db.closeAsync();
  }
}

/** Replace the app database with a previously validated backup. */
export async function restoreDatabase(bytes: Uint8Array): Promise<void> {
  assertSqliteHeader(bytes);
  const source = await SQLite.deserializeDatabaseAsync(bytes);
  try {
    await assertBliAppDatabase(source);
    const dest = await openDatabase();
    try {
      await SQLite.backupDatabaseAsync({
        sourceDatabase: source,
        destDatabase: dest,
      });
    } finally {
      await dest.closeAsync();
    }
  } finally {
    await source.closeAsync();
  }

  await initDatabase();
}

export async function markBackupSaved(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
}

export async function getLastBackupAt(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
}
