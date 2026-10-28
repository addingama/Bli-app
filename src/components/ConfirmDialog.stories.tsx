import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';

import ConfirmDialog from './ConfirmDialog';

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    visible: true,
    title: 'Hapus barang?',
    message: 'Barang yang dihapus tidak bisa dikembalikan.',
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Destructive: Story = {};

export const CustomLabels: Story = {
  args: {
    title: 'Simpan perubahan?',
    message: 'Perubahan pada supplier belum disimpan.',
    confirmText: 'Simpan',
    cancelText: 'Buang',
  },
};

export const CustomConfirmColor: Story = {
  args: {
    title: 'Selesaikan transaksi?',
    message: 'Transaksi jual akan dicatat dan stok berkurang.',
    confirmText: 'Selesaikan',
    confirmColor: '#4CAF50',
  },
};
