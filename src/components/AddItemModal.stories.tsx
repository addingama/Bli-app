import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';

import { AddItemModalView } from './AddItemModal';
import type { Barang } from '../types';

const cabai: Barang = {
  id: 1,
  nama: 'Cabai Merah',
  kategori: 'Sayuran',
  satuan_default: 'kg',
  grades: JSON.stringify(['A', 'B', 'C']),
  status: 'aktif',
  harga_beli_terakhir: 25000,
  harga_jual_terakhir: 32000,
  stok_alert_minimum: 5,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const beras: Barang = {
  id: 2,
  nama: 'Beras Medium',
  kategori: 'Sembako',
  satuan_default: 'kg',
  status: 'aktif',
  harga_beli_terakhir: 12000,
  harga_jual_terakhir: 14000,
  stok_alert_minimum: 20,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const meta = {
  title: 'Components/AddItemModal',
  component: AddItemModalView,
  args: {
    visible: true,
    jenis: 'beli',
    step: 'search',
    searchQuery: '',
    barangList: [cabai, beras],
    selectedBarang: null,
    grade: '',
    quantity: '',
    satuan: 'kg',
    hargaSatuan: '',
    stokInfo: null,
    onDismiss: fn(),
    onSearchQueryChange: fn(),
    onSelectBarang: fn(),
    onBackToSearch: fn(),
    onGradeChange: fn(),
    onQuantityChange: fn(),
    onSatuanChange: fn(),
    onHargaSatuanChange: fn(),
    onAdd: fn(),
  },
} satisfies Meta<typeof AddItemModalView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SearchResults: Story = {};

export const SearchEmpty: Story = {
  args: {
    searchQuery: 'mangga',
    barangList: [],
  },
};

export const NoItemsYet: Story = {
  args: {
    barangList: [],
  },
};

export const BuyForm: Story = {
  args: {
    step: 'form',
    selectedBarang: cabai,
    satuan: 'kg',
    quantity: '2',
    hargaSatuan: '25000',
    grade: 'A',
  },
};

export const SellStockAvailable: Story = {
  args: {
    jenis: 'jual',
    step: 'form',
    selectedBarang: cabai,
    satuan: 'kg',
    quantity: '2',
    hargaSatuan: '32000',
    stokInfo: { available: true, current: 10 },
  },
};

export const SellStockInsufficient: Story = {
  args: {
    jenis: 'jual',
    step: 'form',
    selectedBarang: cabai,
    satuan: 'kg',
    quantity: '12',
    hargaSatuan: '32000',
    stokInfo: { available: false, current: 4 },
  },
};
