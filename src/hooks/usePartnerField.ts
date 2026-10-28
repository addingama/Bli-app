/**
 * Partner field for buy and sell forms.
 * Search master records, link an id, or keep a name-only walk-in.
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { DEBOUNCE } from '../constants';
import { createPembeli, searchPembeli } from '../database/queries/pembeli';
import { createSupplier, searchSupplier } from '../database/queries/supplier';

export type PartnerKind = 'supplier' | 'pembeli';

export interface PartnerResult {
  id: number;
  nama: string;
  nomorHp?: string;
}

export interface ResolvedPartner {
  id?: number;
  nama: string;
  nomorHp?: string;
}

function fallbackName(kind: PartnerKind): string {
  return kind === 'supplier' ? 'Walk-in' : 'Pembeli';
}

function askUnlinked(nama: string, kind: PartnerKind): Promise<'master' | 'walk-in' | 'cancel'> {
  const role = kind === 'supplier' ? 'supplier' : 'pembeli';
  return new Promise(resolve => {
    Alert.alert(
      'Nama belum dipilih dari master',
      `"${nama}" belum terhubung. Simpan sebagai ${role} baru, atau catat tanpa master?`,
      [
        { text: 'Batal', style: 'cancel', onPress: () => resolve('cancel') },
        { text: 'Tanpa master', onPress: () => resolve('walk-in') },
        { text: 'Simpan master', onPress: () => resolve('master') },
      ]
    );
  });
}

export function usePartnerField(kind: PartnerKind) {
  const [nama, setNama] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [partnerId, setPartnerId] = useState<number | undefined>();
  const [walkIn, setWalkIn] = useState(false);
  const [results, setResults] = useState<PartnerResult[]>([]);

  useEffect(() => {
    if (partnerId || walkIn) {
      setResults([]);
      return;
    }

    const keyword = nama.trim();
    if (!keyword) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const rows = kind === 'supplier'
          ? await searchSupplier(keyword)
          : await searchPembeli(keyword);
        if (cancelled) return;
        setResults(rows.slice(0, 8).map(row => ({
          id: row.id,
          nama: row.nama,
          nomorHp: row.nomor_hp,
        })));
      } catch (error) {
        console.error('[PartnerField] Error searching:', error);
      }
    }, DEBOUNCE.SEARCH);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [kind, nama, partnerId, walkIn]);

  const onNamaChange = useCallback((value: string) => {
    setNama(value);
    setPartnerId(undefined);
    setWalkIn(false);
  }, []);

  const onNomorHpChange = useCallback((value: string) => {
    setNomorHp(value);
  }, []);

  const selectPartner = useCallback((partner: PartnerResult) => {
    setPartnerId(partner.id);
    setNama(partner.nama);
    setNomorHp(partner.nomorHp ?? '');
    setWalkIn(false);
    setResults([]);
  }, []);

  const markWalkIn = useCallback(() => {
    setPartnerId(undefined);
    setWalkIn(true);
    setResults([]);
  }, []);

  const saveAsMaster = useCallback(async (): Promise<number | null> => {
    const trimmed = nama.trim();
    if (!trimmed) return null;
    try {
      const id = kind === 'supplier'
        ? await createSupplier({
          nama: trimmed,
          nomor_hp: nomorHp.trim() || undefined,
          jenis: 'langganan',
        })
        : await createPembeli({
          nama: trimmed,
          nomor_hp: nomorHp.trim() || undefined,
        });
      const numericId = Number(id);
      setPartnerId(numericId);
      setWalkIn(false);
      setResults([]);
      return numericId;
    } catch (error) {
      Alert.alert('Gagal', error instanceof Error ? error.message : 'Gagal menyimpan master');
      return null;
    }
  }, [kind, nama, nomorHp]);

  const resolveForTransaction = useCallback(async (): Promise<ResolvedPartner | null> => {
    const trimmed = nama.trim();
    const phone = nomorHp.trim() || undefined;
    if (!trimmed) {
      return { nama: fallbackName(kind) };
    }
    if (partnerId) {
      return { id: partnerId, nama: trimmed, nomorHp: phone };
    }
    if (walkIn) {
      return { nama: trimmed, nomorHp: phone };
    }

    const choice = await askUnlinked(trimmed, kind);
    if (choice === 'cancel') return null;
    if (choice === 'walk-in') {
      setWalkIn(true);
      return { nama: trimmed, nomorHp: phone };
    }

    const id = await saveAsMaster();
    if (id == null) return null;
    return { id, nama: trimmed, nomorHp: phone };
  }, [kind, nama, nomorHp, partnerId, saveAsMaster, walkIn]);

  return {
    nama,
    nomorHp,
    partnerId,
    walkIn,
    results,
    onNamaChange,
    onNomorHpChange,
    selectPartner,
    markWalkIn,
    saveAsMaster,
    resolveForTransaction,
  };
}
