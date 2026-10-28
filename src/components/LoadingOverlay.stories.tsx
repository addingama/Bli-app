import type { Meta, StoryObj } from '@storybook/react-native';

import LoadingOverlay from './LoadingOverlay';

const meta = {
  title: 'Components/LoadingOverlay',
  component: LoadingOverlay,
  args: {
    visible: true,
  },
} satisfies Meta<typeof LoadingOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultMessage: Story = {};

export const CustomMessage: Story = {
  args: {
    message: 'Menyimpan transaksi...',
  },
};

export const Hidden: Story = {
  args: {
    visible: false,
  },
};
