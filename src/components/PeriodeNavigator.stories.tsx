import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';

import PeriodeNavigator from './PeriodeNavigator';

const meta = {
  title: 'Components/PeriodeNavigator',
  component: PeriodeNavigator,
  args: {
    periode: 'bulan',
    label: '1 Nov – 30 Nov 2026',
    canGoForward: false,
    onPeriodeChange: fn(),
    onPrevious: fn(),
    onNext: fn(),
  },
} satisfies Meta<typeof PeriodeNavigator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BulanBerjalan: Story = {};

export const BulanLalu: Story = {
  args: {
    label: '1 Okt – 31 Okt 2026',
    canGoForward: true,
  },
};

export const SatuHari: Story = {
  args: {
    periode: 'hari',
    label: '1 Nov 2026',
    canGoForward: false,
  },
};
