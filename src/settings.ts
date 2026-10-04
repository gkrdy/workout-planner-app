// Server URL and API key, kept in the iPhone keychain (never in the code).
import * as SecureStore from 'expo-secure-store';

export type Settings = { serverUrl: string; apiKey: string };

const URL_KEY = 'serverUrl';
const API_KEY = 'apiKey';

export const DEFAULT_SERVER_URL = 'https://workout-planner-dj04.onrender.com';

export async function loadSettings(): Promise<Settings | null> {
  const [serverUrl, apiKey] = await Promise.all([
    SecureStore.getItemAsync(URL_KEY),
    SecureStore.getItemAsync(API_KEY),
  ]);
  return serverUrl && apiKey ? { serverUrl, apiKey } : null;
}

export async function saveSettings(s: Settings): Promise<void> {
  await SecureStore.setItemAsync(URL_KEY, s.serverUrl.trim());
  await SecureStore.setItemAsync(API_KEY, s.apiKey.trim());
}
