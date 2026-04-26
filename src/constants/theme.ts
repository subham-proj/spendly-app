export const colors = {
  primary: '#10B981',       // emerald-500
  primaryLight: '#D1FAE5',  // emerald-100
  primaryDark: '#059669',   // emerald-600

  background: '#F9FAFB',    // gray-50
  surface: '#FFFFFF',
  border: '#F3F4F6',        // gray-100

  text: '#111827',          // gray-900
  textSecondary: '#6B7280', // gray-500
  textMuted: '#9CA3AF',     // gray-400

  income: '#10B981',        // emerald
  expense: '#111827',       // gray-900
  recurring: '#F59E0B',     // amber-500

  red: '#EF4444',
  redLight: '#FEE2E2',

  amber: '#F59E0B',
  amberLight: '#FEF3C7',

  blue: '#3B82F6',
  blueLight: '#DBEAFE',

  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
};

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
