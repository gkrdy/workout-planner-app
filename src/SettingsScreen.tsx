import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DEFAULT_SERVER_URL, Settings, saveSettings } from './settings';
import { useTheme } from './theme';

type Props = {
  initial: Settings | null;
  onSaved: (s: Settings) => void;
  onCancel?: () => void; // hidden on first launch, when there's nothing to go back to
};

export default function SettingsScreen({ initial, onSaved, onCancel }: Props) {
  const t = useTheme();
  const [serverUrl, setServerUrl] = useState(initial?.serverUrl ?? DEFAULT_SERVER_URL);
  const [apiKey, setApiKey] = useState(initial?.apiKey ?? '');
  const [error, setError] = useState('');

  async function save() {
    if (!/^https?:\/\/\S+$/.test(serverUrl.trim())) return setError('Enter a URL starting with https://');
    if (!apiKey.trim()) return setError('Enter your API key');
    const s = { serverUrl: serverUrl.trim(), apiKey: apiKey.trim() };
    await saveSettings(s);
    onSaved(s);
  }

  const input = [styles.input, { color: t.text, backgroundColor: t.card, borderColor: t.border }];

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: t.text }]}>Settings</Text>

      <Text style={[styles.label, { color: t.muted }]}>Server URL</Text>
      <TextInput
        style={input}
        value={serverUrl}
        onChangeText={(v) => (setServerUrl(v), setError(''))}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        keyboardType="url"
        placeholder={DEFAULT_SERVER_URL}
        placeholderTextColor={t.muted}
      />

      <Text style={[styles.label, { color: t.muted }]}>API key (from Render → Environment)</Text>
      <TextInput
        style={input}
        value={apiKey}
        onChangeText={(v) => (setApiKey(v), setError(''))}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        autoComplete="off"
        textContentType="none" // not a password: stops iOS offering to save it
        placeholder="Paste your API key"
        placeholderTextColor={t.muted}
      />

      {error ? <Text style={[styles.error, { color: t.danger }]}>{error}</Text> : null}

      <Pressable style={[styles.button, { backgroundColor: t.accent }]} onPress={save}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
      {onCancel ? (
        <Pressable style={styles.cancel} onPress={onCancel}>
          <Text style={{ color: t.accent, fontSize: 16 }}>Cancel</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  error: { marginTop: 10, fontSize: 14 },
  button: { marginTop: 20, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel: { marginTop: 12, alignItems: 'center', paddingVertical: 8 },
});
