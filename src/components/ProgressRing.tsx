// Circular progress ring that animates to the new value.
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { colors, fonts } from '../theme';

type Props = { progress: number; size?: number; stroke?: number };

export default function ProgressRing({ progress, size = 92, stroke = 9 }: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const anim = useState(() => new Animated.Value(progress))[0];
  const [shown, setShown] = useState(progress);

  useEffect(() => {
    const id = anim.addListener(({ value }) => setShown(value));
    Animated.timing(anim, {
      toValue: progress,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // drives an SVG prop, not a transform
    }).start();
    return () => anim.removeListener(id);
  }, [anim, progress]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.gold} />
            <Stop offset="1" stopColor={colors.blaze} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(0,0,0,0.25)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ring)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - shown)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.percent}>{Math.round(shown * 100)}%</Text>
        <Text style={styles.label}>POWER</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  percent: { color: colors.text, fontFamily: fonts.display, fontSize: 30, lineHeight: 32 },
  label: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5 },
});
