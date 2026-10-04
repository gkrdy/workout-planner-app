import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthError, Week, Workout, fetchWeek } from './api';
import { addDays, shortDate, today } from './dates';
import { Settings } from './settings';
import { Theme, useTheme } from './theme';

type Props = { settings: Settings; onOpenSettings: () => void };

export default function WeekScreen({ settings, onOpenSettings }: Props) {
  const t = useTheme();
  const [anchor, setAnchor] = useState(today()); // any day in the week being shown
  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ message: string; auth: boolean } | null>(null);

  const apply = useCallback((result: Week | unknown) => {
    if (result instanceof Error) {
      setError({ message: result.message, auth: result instanceof AuthError });
    } else {
      setWeek(result as Week);
      setError(null);
    }
  }, []);

  const fetchCurrent = useCallback(
    () => fetchWeek(settings.serverUrl, settings.apiKey, anchor).catch((e) => (e instanceof Error ? e : new Error(String(e)))),
    [settings, anchor],
  );

  useEffect(() => {
    let cancelled = false; // ignore a slow answer for a week we've already left
    fetchCurrent().then((result) => {
      if (cancelled) return;
      apply(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchCurrent, apply]);

  function goTo(newAnchor: string) {
    setLoading(true);
    setAnchor(newAnchor);
  }

  async function refresh() {
    setRefreshing(true);
    apply(await fetchCurrent());
    setRefreshing(false);
  }

  const title = week ? `${shortDate(week.start)} – ${shortDate(week.end)}` : 'This week';
  const isThisWeek = week ? week.start <= today() && today() <= week.end : true;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        <Pressable onPress={onOpenSettings} hitSlop={12}>
          <Text style={{ color: t.accent, fontSize: 16 }}>Settings</Text>
        </Pressable>
      </View>

      <View style={styles.nav}>
        <NavButton label="‹ Prev" onPress={() => goTo(addDays(anchor, -7))} t={t} />
        {!isThisWeek ? <NavButton label="This week" onPress={() => goTo(today())} t={t} /> : <View />}
        <NavButton label="Next ›" onPress={() => goTo(addDays(anchor, 7))} t={t} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={[styles.note, { color: t.muted }]}>Loading… (up to a minute if the server was asleep)</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={[styles.note, { color: t.danger }]}>{error.message}</Text>
            <NavButton label={error.auth ? 'Open settings' : 'Try again'} onPress={error.auth ? onOpenSettings : refresh} t={t} />
          </View>
        ) : week && week.workouts.length === 0 ? (
          <Text style={[styles.note, { color: t.muted }]}>
            No workouts planned this week. Ask Claude to plan one, then pull down to refresh.
          </Text>
        ) : (
          week?.workouts.map((w) => <WorkoutCard key={w.date} workout={w} t={t} />)
        )}
      </ScrollView>
    </View>
  );
}

function WorkoutCard({ workout, t }: { workout: Workout; t: Theme }) {
  const isToday = workout.date === today();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: isToday ? t.todayBorder : t.border, borderWidth: isToday ? 2 : 1 },
      ]}
    >
      <Text style={[styles.day, { color: t.text }]}>
        {workout.day} <Text style={{ color: t.muted, fontWeight: '400' }}>{shortDate(workout.date)}</Text>
        {isToday ? <Text style={{ color: t.accent, fontWeight: '600' }}>  · Today</Text> : null}
      </Text>
      {workout.exercises.length === 0 ? (
        <Text style={{ color: t.muted }}>Rest day</Text>
      ) : (
        workout.exercises.map((e, i) => (
          <View key={i} style={styles.row}>
            <Text style={[styles.exercise, { color: t.text }]}>{e.name}</Text>
            <Text style={{ color: t.muted, fontSize: 15 }}>
              {e.sets} × {e.reps}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

function NavButton({ label, onPress, t }: { label: string; onPress: () => void; t: Theme }) {
  return (
    <Pressable onPress={onPress} style={[styles.navButton, { borderColor: t.border, backgroundColor: t.card }]}>
      <Text style={{ color: t.accent, fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 26, fontWeight: '700' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  navButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  list: { paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 },
  center: { alignItems: 'center', gap: 12, paddingTop: 40 },
  note: { fontSize: 15, textAlign: 'center', paddingTop: 24, lineHeight: 21 },
  card: { borderRadius: 12, padding: 14, marginBottom: 12 },
  day: { fontSize: 17, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  exercise: { fontSize: 15, flexShrink: 1, paddingRight: 12 },
});
