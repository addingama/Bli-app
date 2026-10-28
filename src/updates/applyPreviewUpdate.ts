/**
 * Preview builds auto-apply EAS Update so testers do not need to force-close twice.
 * Production keeps the default download-on-launch, apply-on-next-cold-start behavior.
 */

import { AppState, type AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';

let inFlight: Promise<boolean> | null = null;

export async function applyPreviewUpdateIfAvailable(): Promise<boolean> {
  if (__DEV__ || !Updates.isEnabled || Updates.channel !== 'preview') {
    return false;
  }
  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    try {
      const check = await Updates.checkForUpdateAsync();
      if (!check.isAvailable) {
        return false;
      }
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
      return true;
    } catch (error) {
      console.warn('[Updates] Preview auto-apply failed:', error);
      return false;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Recheck when returning to the foreground while a preview build is open. */
export function startPreviewUpdateListener(): () => void {
  if (__DEV__ || !Updates.isEnabled || Updates.channel !== 'preview') {
    return () => undefined;
  }

  const onChange = (next: AppStateStatus) => {
    if (next === 'active') {
      void applyPreviewUpdateIfAvailable();
    }
  };

  const subscription = AppState.addEventListener('change', onChange);
  return () => subscription.remove();
}
