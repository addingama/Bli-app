import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';

import EmptyState from './EmptyState';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    title: 'Belum ada data',
    onAction: fn(),
  },
  argTypes: {
    icon: { control: 'text' },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {};

export const WithMessage: Story = {
  args: {
    icon: 'package-variant',
    title: 'Stok kosong',
    message: 'Belum ada barang yang tercatat. Tambah barang untuk mulai mencatat stok.',
  },
};

export const WithAction: Story = {
  args: {
    icon: 'plus-circle-outline',
    title: 'Belum ada supplier',
    message: 'Tambah supplier pertama agar transaksi beli bisa dicatat.',
    actionText: 'Tambah Supplier',
  },
};
