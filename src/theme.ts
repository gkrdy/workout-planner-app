import { useColorScheme } from 'react-native';

const light = {
  bg: '#f6f6f4',
  card: '#ffffff',
  text: '#1d1d1b',
  muted: '#6b6b68',
  border: '#e4e4e0',
  accent: '#2f6fde',
  todayBorder: '#2f6fde',
  danger: '#c0392b',
};

const dark: typeof light = {
  bg: '#121212',
  card: '#1e1e1e',
  text: '#eeeeee',
  muted: '#a0a0a0',
  border: '#2c2c2c',
  accent: '#6ea0ff',
  todayBorder: '#6ea0ff',
  danger: '#ff7b6b',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
