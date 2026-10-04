import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import SettingsScreen from './src/SettingsScreen';
import WeekScreen from './src/WeekScreen';
import { Settings, loadSettings } from './src/settings';
import { useTheme } from './src/theme';

export default function App() {
  const t = useTheme();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  let screen;
  if (!loaded) {
    screen = <ActivityIndicator style={{ marginTop: 40 }} />;
  } else if (!settings || editing) {
    screen = (
      <SettingsScreen
        initial={settings}
        onSaved={(s) => (setSettings(s), setEditing(false))}
        onCancel={settings ? () => setEditing(false) : undefined}
      />
    );
  } else {
    screen = <WeekScreen settings={settings} onOpenSettings={() => setEditing(true)} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
        {screen}
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
