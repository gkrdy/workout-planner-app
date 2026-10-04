import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { Animated, Easing, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthError, Exercise, Workout, fetchDay } from './api';
import ProgressRing from './components/ProgressRing';
import { fromIso, today } from './dates';
import { loadDone, saveDone } from './progress';
import { Settings } from './settings';
import { colors, fonts, gradients } from './theme';

type Props = { settings: Settings; onOpenSettings: () => void };
type Status = 'loading' | 'ready' | 'error';

function battleCry(progress: number) {
  if (progress >= 1) return 'MISSION COMPLETE. BEAST MODE UNLOCKED.';
  if (progress >= 0.5) return 'POWER RISING. DON’T STOP NOW.';
  if (progress > 0) return 'FIRST BLOOD. KEEP THE MOMENTUM.';
  return 'TODAY’S BATTLE AWAITS. LET’S GO.';
}

export default function TodayScreen({ settings, onOpenSettings }: Props) {
  const date = today();
  const [status, setStatus] = useState<Status>('loading');
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState<{ message: string; auth: boolean } | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchToday = useCallback(
    () =>
      Promise.all([fetchDay(settings.serverUrl, settings.apiKey, date), loadDone(date)]).catch((e) =>
        e instanceof Error ? e : new Error(String(e)),
      ),
    [settings, date],
  );

  const apply = useCallback((result: Awaited<ReturnType<typeof fetchToday>>) => {
    if (result instanceof Error) {
      setError({ message: result.message, auth: result instanceof AuthError });
      setStatus('error');
    } else {
      const [w, d] = result;
      setWorkout(w);
      setDone(d.filter((i) => w && i < w.exercises.length));
      setError(null);
      setStatus('ready');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchToday().then((r) => !cancelled && apply(r));
    return () => {
      cancelled = true;
    };
  }, [fetchToday, apply]);

  async function refresh() {
    setRefreshing(true);
    apply(await fetchToday());
    setRefreshing(false);
  }

  function toggle(i: number) {
    if (!workout) return;
    const next = done.includes(i) ? done.filter((x) => x !== i) : [...done, i];
    setDone(next);
    saveDone(date, next);
    if (next.length === workout.exercises.length && !done.includes(i)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  const exercises = workout?.exercises ?? [];
  const progress = exercises.length ? done.length / exercises.length : 0;
  const longDate = fromIso(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.orange} />}
    >
      <FadeIn delay={0}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.date}>{longDate.toUpperCase()}</Text>
            <Text style={styles.title}>WORKOUT FOR TODAY</Text>
            <View style={styles.titleSlash} />
          </View>
          <Pressable onPress={onOpenSettings} hitSlop={10} style={styles.iconButton} accessibilityLabel="Settings">
            <Ionicons name="settings-sharp" size={18} color={colors.text} />
          </Pressable>
        </View>
      </FadeIn>

      {status === 'loading' ? (
        <LoadingCard />
      ) : status === 'error' && error ? (
        <ErrorCard
          message={error.message}
          actionLabel={error.auth ? 'OPEN SETTINGS' : 'TRY AGAIN'}
          onAction={error.auth ? onOpenSettings : refresh}
        />
      ) : exercises.length === 0 ? (
        <RestDayCard />
      ) : (
        <>
          <FadeIn delay={80}>
            <HeroCard workout={workout!} progress={progress} doneCount={done.length} />
          </FadeIn>
          <Text style={[styles.cry, progress >= 1 && { color: colors.gold }]}>{battleCry(progress)}</Text>
          {exercises.map((e, i) => (
            <FadeIn key={`${e.name}-${i}`} delay={160 + i * 70}>
              <ExerciseCard index={i} exercise={e} done={done.includes(i)} onPress={() => toggle(i)} />
            </FadeIn>
          ))}
          <Text style={styles.hint}>Tap an exercise to clear it · pull down to refresh</Text>
        </>
      )}
    </ScrollView>
  );
}

function HeroCard({ workout, progress, doneCount }: { workout: Workout; progress: number; doneCount: number }) {
  const totalSets = workout.exercises.reduce((n, e) => n + e.sets, 0);
  const minutes = Math.max(10, Math.round(totalSets * 2.5 + 5)); // ~2.5 min per set incl. rest, plus warm-up
  return (
    <View style={styles.heroWrap}>
      <LinearGradient colors={['#1b2238', '#0e1322']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        {/* angled energy slashes across the corner */}
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.slash} />
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.slashThin} />

        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.heroBadge}>
              <Ionicons name="flash" size={12} color={colors.bgTop} />
              <Text style={styles.heroBadgeText}>TODAY’S MISSION</Text>
            </View>
            <Text style={styles.heroDay}>{workout.day.toUpperCase()}</Text>
            <Text style={styles.heroSub}>
              {doneCount} / {workout.exercises.length} exercises cleared
            </Text>
          </View>
          <ProgressRing progress={progress} size={100} stroke={10} />
        </View>

        <View style={styles.stats}>
          <Stat icon="barbell" value={String(workout.exercises.length)} label="EXERCISES" />
          <View style={styles.statDivider} />
          <Stat icon="layers" value={String(totalSets)} label="TOTAL SETS" />
          <View style={styles.statDivider} />
          <Stat icon="timer" value={`~${minutes}`} label="MINUTES" />
        </View>
      </LinearGradient>
    </View>
  );
}

function Stat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={colors.orange} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ExerciseCard({ index, exercise, done, onPress }: { index: number; exercise: Exercise; done: boolean; onPress: () => void }) {
  const scale = useState(() => new Animated.Value(1))[0];
  const pop = () =>
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
    ]).start();

  return (
    <Pressable
      onPress={() => (pop(), onPress())}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`${exercise.name}, ${exercise.sets} sets of ${exercise.reps}`}
    >
      <Animated.View style={[styles.card, done && styles.cardDone, { transform: [{ scale }] }]}>
        <LinearGradient colors={done ? gradients.done : gradients.badge} style={styles.accentBar} />
        <LinearGradient colors={done ? gradients.done : gradients.badge} style={styles.indexBadge}>
          <Text style={styles.indexText}>{String(index + 1).padStart(2, '0')}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={[styles.exName, done && styles.exNameDone]} numberOfLines={2}>
            {exercise.name.toUpperCase()}
          </Text>
          <View style={styles.chips}>
            <Chip icon="repeat" text={`${exercise.sets} ${exercise.sets === 1 ? 'SET' : 'SETS'}`} />
            <Chip
              icon="flame"
              text={(/^\d+(-\d+)?$/.test(exercise.reps) ? `${exercise.reps} reps` : exercise.reps).toUpperCase()}
            />
          </View>
        </View>
        <View style={[styles.check, done && styles.checkDone]}>
          {done ? <Ionicons name="checkmark-sharp" size={18} color={colors.bgTop} style={styles.checkIcon} /> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function Chip({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={11} color={colors.textSoft} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

function RestDayCard() {
  return (
    <FadeIn delay={80}>
      <View style={[styles.glassCard, styles.centerCard]}>
        <Ionicons name="bed" size={44} color={colors.orange} />
        <Text style={styles.cardTitle}>REST DAY</Text>
        <Text style={styles.cardBody}>
          No mission today. Recover, refuel, and power up for the next fight. Ask Claude to plan a workout, then pull down
          to refresh.
        </Text>
      </View>
    </FadeIn>
  );
}

function LoadingCard() {
  const pulse = useState(() => new Animated.Value(0.4))[0];
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);
  return (
    <Animated.View style={[styles.glassCard, styles.centerCard, { opacity: pulse }]}>
      <Ionicons name="flash" size={44} color={colors.orange} />
      <Text style={styles.cardTitle}>CHARGING UP…</Text>
      <Text style={styles.cardBody}>Up to a minute if the server was asleep.</Text>
    </Animated.View>
  );
}

function ErrorCard({ message, actionLabel, onAction }: { message: string; actionLabel: string; onAction: () => void }) {
  return (
    <View style={[styles.glassCard, styles.centerCard]}>
      <Ionicons name="warning" size={44} color={colors.danger} />
      <Text style={styles.cardTitle}>CONNECTION LOST</Text>
      <Text style={styles.cardBody}>{message}</Text>
      <Pressable onPress={onAction}>
        <LinearGradient colors={gradients.badge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionButton}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function FadeIn({ delay, children }: { delay: number; children: React.ReactNode }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  const translateX = v.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }); // slide in like a dash
  return <Animated.View style={{ opacity: v, transform: [{ translateX }] }}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingBottom: 40, flexGrow: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 18 },
  date: { color: colors.orange, fontFamily: fonts.bold, fontSize: 13, letterSpacing: 2 },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 44, lineHeight: 46, letterSpacing: 1, marginTop: 2 },
  titleSlash: { width: 64, height: 4, backgroundColor: colors.blaze, transform: [{ skewX: '-30deg' }], marginTop: 2 },
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

  heroWrap: {
    borderRadius: 20,
    shadowColor: colors.blaze,
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
  },
  hero: { borderRadius: 20, padding: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,122,26,0.45)' },
  slash: { position: 'absolute', top: -60, right: 36, width: 22, height: 150, transform: [{ rotate: '24deg' }], opacity: 0.18 },
  slashThin: { position: 'absolute', top: -60, right: 12, width: 7, height: 150, transform: [{ rotate: '24deg' }], opacity: 0.25 },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    transform: [{ skewX: '-12deg' }],
  },
  heroBadgeText: { color: colors.bgTop, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5 },
  heroDay: { color: colors.text, fontFamily: fonts.display, fontSize: 52, lineHeight: 54, marginTop: 10, letterSpacing: 1 },
  heroSub: { color: colors.textSoft, fontFamily: fonts.semibold, fontSize: 15 },
  stats: {
    flexDirection: 'row',
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { color: colors.text, fontFamily: fonts.display, fontSize: 28, lineHeight: 30 },
  statLabel: { color: colors.textFaint, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },

  cry: { color: colors.textSoft, fontFamily: fonts.display, fontSize: 20, letterSpacing: 1.5, textAlign: 'center', marginVertical: 18 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 18,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(18,24,40,0.85)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  cardDone: { backgroundColor: 'rgba(56,225,255,0.08)', borderColor: 'rgba(56,225,255,0.4)' },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  indexBadge: { width: 46, height: 40, alignItems: 'center', justifyContent: 'center', transform: [{ skewX: '-12deg' }], borderRadius: 4 },
  indexText: { color: '#fff', fontFamily: fonts.display, fontSize: 24, lineHeight: 26, transform: [{ skewX: '12deg' }] },
  exName: { color: colors.text, fontFamily: fonts.display, fontSize: 24, lineHeight: 26, letterSpacing: 0.8 },
  exNameDone: { color: colors.textFaint, textDecorationLine: 'line-through' },
  chips: { flexDirection: 'row', gap: 6, marginTop: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.glassStrong,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipText: { color: colors.textSoft, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  checkDone: { backgroundColor: colors.electric, borderColor: colors.electric },
  checkIcon: { transform: [{ rotate: '-45deg' }] },

  hint: { color: colors.textFaint, fontFamily: fonts.semibold, fontSize: 13, textAlign: 'center', marginTop: 8 },

  glassCard: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(18,24,40,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,122,26,0.35)',
  },
  centerCard: { alignItems: 'center', gap: 10, marginTop: 24 },
  cardTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 32, letterSpacing: 1 },
  cardBody: { color: colors.textSoft, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  actionButton: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, transform: [{ skewX: '-12deg' }] },
  actionText: { color: '#fff', fontFamily: fonts.display, fontSize: 20, letterSpacing: 1.2 },
});
