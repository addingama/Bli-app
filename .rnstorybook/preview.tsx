import { View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Preview } from '@storybook/react-native';

import { theme } from '../src/theme/theme';

const preview: Preview = {
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <View style={styles.story}>
            <Story />
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
  },
};

const styles = StyleSheet.create({
  story: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default preview;
