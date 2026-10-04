import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DEFAULT_SERVER_URL, Settings, saveSettings } from './settings';
import { colors, fonts, gradients } from './theme';

type Props = {
  initial: Settings | null;
  onSaved: (s: Settings) => void;
  onCancel?: () => void; // hidden on first launch, when there's nothing to go back to
};

export default function SettingsScreen({ initial, onSaved, onCancel }: Props) {
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

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        {onCancel ? (
          <Pressable onPress={onCancel} hitSlop={10} style={styles.iconButton} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
        ) : null}
        <View>
          <Text style={styles.kicker}>{onCancel ? 'CONFIGURE' : 'FIRST TIME SETUP'}</Text>
          <Text style={styles.title}>{onCancel ? 'SETTINGS' : 'WELCOME, FIGHTER'}</Text>
        </View>
      </View>
      {!onCancel ? (
        <Text style={styles.intro}>Connect to your workout server to load today’s mission.</Text>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={(v) => (setServerUrl(v), setError(''))}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          keyboardType="url"
          placeholder={DEFAULT_SERVER_URL}
          placeholderTextColor={colors.textFaint}
          keyboardAppearance="dark"
        />

        <Text style={styles.label}>API key (from Render → Environment)</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={(v) => (setApiKey(v), setError(''))}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          autoComplete="off"
          textContentType="none" // not a password: stops iOS offering to save it
          placeholder="Paste your API key"
          placeholderTextColor={colors.textFaint}
          keyboardAppearance="dark"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={save} style={{ marginTop: 22 }}>
          <LinearGradient colors={gradients.badge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
            <Text style={styles.buttonText}>SAVE</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  kicker: { color: colors.orange, fontFamily: fonts.bold, fontSize: 13, letterSpacing: 2 },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 44, lineHeight: 46, letterSpacing: 1 },
  intro: { color: colors.textSoft, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, marginBottom: 8 },
  card: {
    marginTop: 12,
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(18,24,40,0.85)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  label: { color: colors.textSoft, fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.5, marginTop: 14, marginBottom: 8 },
  input: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: { color: colors.danger, fontFamily: fonts.bold, fontSize: 14, marginTop: 12 },
  button: { paddingVertical: 12, alignItems: 'center', transform: [{ skewX: '-12deg' }] },
  buttonText: { color: '#fff', fontFamily: fonts.display, fontSize: 24, letterSpacing: 1.5 },
});
