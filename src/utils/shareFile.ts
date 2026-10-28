/**
 * Write a cache file and hand it to the system share sheet.
 */

import { EncodingType, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function writeCacheFile(
  name: string,
  content: string | Uint8Array,
  encoding?: EncodingType
): Promise<File> {
  const file = new File(Paths.cache, name);
  if (file.exists) {
    file.delete();
  }
  file.create();
  if (typeof content === 'string') {
    await file.write(content, encoding ? { encoding } : undefined);
  } else {
    await file.write(content);
  }
  return file;
}

export async function shareLocalFile(
  uri: string,
  options: { mimeType: string; dialogTitle: string; UTI: string }
): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Berbagi file tidak tersedia di perangkat ini.');
  }
  await Sharing.shareAsync(uri, options);
}
