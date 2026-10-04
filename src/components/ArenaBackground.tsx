// Full-screen "battle arena" backdrop: dark gradient, a hot energy glow at the
// bottom, diagonal speed lines streaking past, and embers rising like an aura.
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors, gradients } from '../theme';

const EMBERS = 22;
const SPEED_LINES = 9;

// Deterministic "random" so the scene doesn't reshuffle on every render.
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

function Ember({ index, width, height }: { index: number; width: number; height: number }) {
  const rise = useState(() => new Animated.Value(0))[0];
  const startX = seeded(index, 1) * width;
  const size = 2 + seeded(index, 2) * 4;
  const duration = 5000 + seeded(index, 3) * 7000;
  const delay = seeded(index, 4) * 6000;
  const drift = (seeded(index, 5) - 0.5) * 60;
  const color = seeded(index, 6) > 0.7 ? colors.gold : colors.orange;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(rise, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [rise, delay, duration]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [height + 10, height * 0.25] });
  const translateX = rise.interpolate({ inputRange: [0, 1], outputRange: [0, drift] });
  const opacity = rise.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 0.8, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: startX,
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: color,
        shadowColor: color,
        shadowOpacity: 1,
        shadowRadius: 6,
        opacity,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
}

function SpeedLine({ index, width, height }: { index: number; width: number; height: number }) {
  const streak = useState(() => new Animated.Value(0))[0];
  const top = seeded(index, 7) * height;
  const length = 80 + seeded(index, 8) * 160;
  const duration = 1400 + seeded(index, 9) * 1600;
  const pause = 1500 + seeded(index, 10) * 5000;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(pause),
        Animated.timing(streak, { toValue: 1, duration, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(streak, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [streak, pause, duration]);

  const translateX = streak.interpolate({ inputRange: [0, 1], outputRange: [width + length, -length * 2] });
  const opacity = streak.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.35, 0.35, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left: 0,
        width: length,
        height: 1.5,
        backgroundColor: '#fff',
        opacity,
        transform: [{ translateX }, { rotate: '-12deg' }],
      }}
    />
  );
}

export default function ArenaBackground({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const embers = useMemo(() => Array.from({ length: EMBERS }, (_, i) => i), []);
  const lines = useMemo(() => Array.from({ length: SPEED_LINES }, (_, i) => i), []);

  return (
    <View style={styles.fill}>
      <LinearGradient colors={gradients.bg} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      {/* energy glow rising from the bottom of the screen */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,90,31,0)', 'rgba(255,90,31,0.22)', 'rgba(255,138,0,0.38)']}
        locations={[0, 0.6, 1]}
        style={[styles.glow, { height: height * 0.45 }]}
      />
      {lines.map((i) => (
        <SpeedLine key={`l${i}`} index={i} width={width} height={height} />
      ))}
      {children}
      {embers.map((i) => (
        <Ember key={`e${i}`} index={i} width={width} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bgTop },
  glow: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
