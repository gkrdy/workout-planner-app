// Action-anime "battle arena" palette: dark night sky, blazing orange energy, gold highlights.

export const colors = {
  bgTop: '#05070d',
  bgMid: '#0d1424',
  bgLow: '#1c1020',
  ember: '#ff7a1a',

  text: '#ffffff',
  textSoft: 'rgba(255,255,255,0.72)',
  textFaint: 'rgba(255,255,255,0.45)',

  glass: 'rgba(255,255,255,0.05)',
  glassStrong: 'rgba(255,255,255,0.10)',
  glassBorder: 'rgba(255,255,255,0.12)',

  blaze: '#ff5a1f',
  orange: '#ff8a00',
  gold: '#ffc83d',
  electric: '#38e1ff',
  danger: '#ff4d5e',
};

export const gradients = {
  bg: [colors.bgTop, colors.bgMid, colors.bgLow] as const,
  hero: ['#ff3d1f', '#ff7a00', '#ffb800'] as const,
  heroDark: ['rgba(10,12,22,0.0)', 'rgba(10,12,22,0.55)'] as const,
  badge: [colors.blaze, colors.orange] as const,
  done: [colors.electric, '#5b8cff'] as const,
};

export const fonts = {
  display: 'BebasNeue_400Regular', // tall, bold headline face
  regular: 'Rajdhani_500Medium',
  semibold: 'Rajdhani_600SemiBold',
  bold: 'Rajdhani_700Bold',
};
