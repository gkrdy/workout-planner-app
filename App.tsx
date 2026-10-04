import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { Rajdhani_500Medium, Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import ArenaBackground from './src/components/ArenaBackground';
import SettingsScreen from './src/SettingsScreen';
import TodayScreen from './src/TodayScreen';
import { Settings, loadSettings } from './src/settings';

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
  });
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
  if (!loaded || !fontsLoaded) {
    screen = <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />;
  } else if (!settings || editing) {
    screen = (
      <SettingsScreen
        initial={settings}
        onSaved={(s) => (setSettings(s), setEditing(false))}
        onCancel={settings ? () => setEditing(false) : undefined}
      />
    );
  } else {
    screen = <TodayScreen settings={settings} onOpenSettings={() => setEditing(true)} />;
  }

  return (
    <SafeAreaProvider>
      <ArenaBackground>
        <SafeAreaView style={{ flex: 1 }}>{screen}</SafeAreaView>
      </ArenaBackground>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
