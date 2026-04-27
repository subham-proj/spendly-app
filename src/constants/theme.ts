export const lightColors = {
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  primaryDark: '#059669',

  background: '#F9FAFB',
  surface: '#FFFFFF',
  border: '#F3F4F6',

  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  income: '#10B981',
  expense: '#111827',
  recurring: '#F59E0B',

  red: '#EF4444',
  redLight: '#FEE2E2',

  amber: '#F59E0B',
  amberLight: '#FEF3C7',

  blue: '#3B82F6',
  blueLight: '#DBEAFE',

  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
};

export const darkColors = {
  primary: '#10B981',
  primaryLight: '#064E3B',
  primaryDark: '#059669',

  background: '#0F172A',
  surface: '#1E293B',
  border: '#334155',

  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  income: '#10B981',
  expense: '#F1F5F9',
  recurring: '#F59E0B',

  red: '#F87171',
  redLight: '#450A0A',

  amber: '#FBBF24',
  amberLight: '#451A03',

  blue: '#60A5FA',
  blueLight: '#1E3A5F',

  purple: '#A78BFA',
  purpleLight: '#2E1065',
};

// Keep backward-compatible `colors` export pointing to light — screens use PreferencesContext at runtime
export const colors = lightColors;
export type Colors = typeof lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};
