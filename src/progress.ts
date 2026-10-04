// Remembers which exercises were ticked off, per day, on this phone.
import * as SecureStore from 'expo-secure-store';

const keyFor = (date: string) => `done-${date}`;

export async function loadDone(date: string): Promise<number[]> {
  try {
    const raw = await SecureStore.getItemAsync(keyFor(date));
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export async function saveDone(date: string, done: number[]): Promise<void> {
  await SecureStore.setItemAsync(keyFor(date), JSON.stringify(done));
}
