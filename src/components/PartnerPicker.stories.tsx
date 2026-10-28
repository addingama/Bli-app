import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';

import PartnerPicker from './PartnerPicker';

const meta = {
  title: 'Components/PartnerPicker',
  component: PartnerPicker,
  args: {
    namaLabel: 'Nama Supplier',
    nama: '',
    nomorHp: '',
    linked: false,
    walkIn: false,
    results: [],
    onNamaChange: fn(),
    onNomorHpChange: fn(),
    onSelect: fn(),
    onSaveMaster: fn(),
    onWalkIn: fn(),
  },
} satisfies Meta<typeof PartnerPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Kosong: Story = {};

export const HasilCari: Story = {
  args: {
    nama: 'Budi',
    results: [
      { id: 1, nama: 'Budi Santoso', nomorHp: '081234567890' },
      { id: 2, nama: 'Budi Wijaya', nomorHp: '081298765432' },
    ],
  },
};

export const Terhubung: Story = {
  args: {
    nama: 'Budi Santoso',
    nomorHp: '081234567890',
    linked: true,
  },
};

export const TanpaMaster: Story = {
  args: {
    nama: 'Ibu Siti',
    nomorHp: '081200000000',
    walkIn: true,
  },
};
