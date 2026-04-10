import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
}

export const DEFAULT_LIGHT_COLORS: ThemeColors = {
  primary: '#0058be',
  secondary: '#8127cf',
  tertiary: '#a12e70',
};

export const DEFAULT_DARK_COLORS: ThemeColors = {
  primary: '#5a9ff5',
  secondary: '#b07aef',
  tertiary: '#d47aab',
};

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
}

const STORAGE_KEY = 'neuralpeace_theme';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadTheme(): ThemeConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        mode: parsed.mode ?? 'light',
        colors: parsed.colors ?? DEFAULT_LIGHT_COLORS,
      };
    }
  } catch {
    // ignore
  }
  return { mode: 'light', colors: DEFAULT_LIGHT_COLORS };
}

function saveTheme(config: ThemeConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function applyThemeColors(colors: ThemeColors, isDark: boolean) {
  const root = document.documentElement;

  // Primary colors
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-container', isDark ? lightenColor(colors.primary, 20) : darkenColor(colors.primary, 10));
  root.style.setProperty('--color-on-primary', isDark ? '#0a1628' : '#ffffff');

  // Secondary colors
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-container', isDark ? lightenColor(colors.secondary, 20) : darkenColor(colors.secondary, 10));
  root.style.setProperty('--color-on-secondary', isDark ? '#1a0a2e' : '#ffffff');

  // Tertiary colors
  root.style.setProperty('--color-tertiary', colors.tertiary);
  root.style.setProperty('--color-tertiary-container', isDark ? lightenColor(colors.tertiary, 20) : darkenColor(colors.tertiary, 10));
  root.style.setProperty('--color-on-tertiary', isDark ? '#2e0a1e' : '#ffffff');

  // Surface colors
  if (isDark) {
    root.style.setProperty('--color-surface', '#121316');
    root.style.setProperty('--color-surface-container', '#1a1c1f');
    root.style.setProperty('--color-surface-container-low', '#16181b');
    root.style.setProperty('--color-surface-container-high', '#1e2023');
    root.style.setProperty('--color-surface-container-highest', '#242629');
    root.style.setProperty('--color-surface-container-lowest', '#1e1f22');
    root.style.setProperty('--color-on-surface', '#e3e2e6');
    root.style.setProperty('--color-on-surface-variant', '#a8b1c0');
    root.style.setProperty('--color-outline', '#727a87');
    root.style.setProperty('--color-outline-variant', '#3a3f47');
  } else {
    root.style.setProperty('--color-surface', '#f7f9fb');
    root.style.setProperty('--color-surface-container', '#eceef0');
    root.style.setProperty('--color-surface-container-low', '#f2f4f6');
    root.style.setProperty('--color-surface-container-high', '#e6e8ea');
    root.style.setProperty('--color-surface-container-highest', '#e0e3e5');
    root.style.setProperty('--color-surface-container-lowest', '#ffffff');
    root.style.setProperty('--color-on-surface', '#191c1e');
    root.style.setProperty('--color-on-surface-variant', '#424754');
    root.style.setProperty('--color-outline', '#727785');
    root.style.setProperty('--color-outline-variant', '#c2c6d6');
  }
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0x0000ff) + Math.round(255 * percent / 100));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * percent / 100));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * percent / 100));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setMode: (mode: ThemeMode) => void;
  setColors: (colors: ThemeColors) => void;
  resetColors: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig>(loadTheme);

  const isDark = theme.mode === 'dark' || (theme.mode === 'system' && getSystemTheme() === 'dark');

  // Apply theme on change
  useEffect(() => {
    const colors = isDark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS;
    const mergedColors = { ...colors, ...theme.colors };
    applyThemeColors(mergedColors, isDark);
    saveTheme({ ...theme, colors: mergedColors });
  }, [theme, isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme.mode === 'system') {
        setTheme((prev) => ({ ...prev })); // trigger re-apply
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme.mode]);

  const setMode = useCallback((mode: ThemeMode) => {
    setTheme((prev) => {
      const newTheme = { ...prev, mode };
      saveTheme(newTheme);
      return newTheme;
    });
  }, []);

  const setColors = useCallback((colors: ThemeColors) => {
    setTheme((prev) => {
      const newTheme = { ...prev, colors };
      saveTheme(newTheme);
      return newTheme;
    });
  }, []);

  const resetColors = useCallback(() => {
    setTheme((prev) => {
      const defaults = prev.mode === 'dark' || (prev.mode === 'system' && getSystemTheme() === 'dark')
        ? DEFAULT_DARK_COLORS
        : DEFAULT_LIGHT_COLORS;
      const newTheme = { ...prev, colors: defaults };
      saveTheme(newTheme);
      return newTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setMode, setColors, resetColors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
