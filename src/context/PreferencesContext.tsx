import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, Colors } from '../constants/theme';

// ─── Currency definitions ────────────────────────────────────────────────────
export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee',      locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar',          locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro',               locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound',      locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',      locale: 'ar-AE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',  locale: 'en-SG' },
];

export type ThemeMode = 'system' | 'light' | 'dark';

// ─── Preferences shape ───────────────────────────────────────────────────────
interface Preferences {
  themeMode: ThemeMode;
  currency: CurrencyOption;
  notificationsEnabled: boolean;
}

export interface ServerPreferences {
  currency: string;
  notificationsEnabled: boolean;
  themeMode: string;
}

interface PreferencesContextType extends Preferences {
  colors: Colors;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setCurrency: (currency: CurrencyOption) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  formatAmount: (amount: number) => string;
  syncFromServer: (serverPrefs: ServerPreferences) => Promise<void>;
}

// ─── Storage keys ────────────────────────────────────────────────────────────
const KEYS = {
  themeMode: 'prefs_theme_mode',
  currency: 'prefs_currency_code',
  notifications: 'prefs_notifications',
};

const DEFAULT: Preferences = {
  themeMode: 'system',
  currency: CURRENCIES[0], // INR
  notificationsEnabled: true,
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT.themeMode);
  const [currency, setCurrencyState] = useState<CurrencyOption>(DEFAULT.currency);
  const [notificationsEnabled, setNotificationsState] = useState(DEFAULT.notificationsEnabled);
  const [loaded, setLoaded] = useState(false);

  // Load persisted preferences on mount
  useEffect(() => {
    (async () => {
      try {
        const [tm, cc, notif] = await Promise.all([
          AsyncStorage.getItem(KEYS.themeMode),
          AsyncStorage.getItem(KEYS.currency),
          AsyncStorage.getItem(KEYS.notifications),
        ]);
        if (tm) setThemeModeState(tm as ThemeMode);
        if (cc) {
          const found = CURRENCIES.find((c) => c.code === cc);
          if (found) setCurrencyState(found);
        }
        if (notif !== null) setNotificationsState(notif === 'true');
      } catch (_) {}
      setLoaded(true);
    })();
  }, []);

  // Resolve actual dark/light based on mode + system
  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemScheme === 'dark';
  }, [themeMode, systemScheme]);

  const colors = isDark ? darkColors : lightColors;

  // Currency formatter using selected currency
  const formatAmount = useMemo(() => {
    return (amount: number) =>
      new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
  }, [currency]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(KEYS.themeMode, mode);
  };

  const setCurrency = async (c: CurrencyOption) => {
    setCurrencyState(c);
    await AsyncStorage.setItem(KEYS.currency, c.code);
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    setNotificationsState(enabled);
    await AsyncStorage.setItem(KEYS.notifications, String(enabled));
  };

  // Called once after profile loads to sync server preferences (server wins)
  const syncFromServer = async (serverPrefs: ServerPreferences) => {
    const mode = serverPrefs.themeMode as ThemeMode;
    const found = CURRENCIES.find((c) => c.code === serverPrefs.currency);
    if (mode) {
      setThemeModeState(mode);
      AsyncStorage.setItem(KEYS.themeMode, mode);
    }
    if (found) {
      setCurrencyState(found);
      AsyncStorage.setItem(KEYS.currency, found.code);
    }
    setNotificationsState(serverPrefs.notificationsEnabled);
    AsyncStorage.setItem(KEYS.notifications, String(serverPrefs.notificationsEnabled));
  };

  // Don't render until prefs are loaded to avoid flash
  if (!loaded) return null;

  return (
    <PreferencesContext.Provider
      value={{
        themeMode,
        currency,
        notificationsEnabled,
        colors,
        isDark,
        setThemeMode,
        setCurrency,
        setNotificationsEnabled,
        formatAmount,
        syncFromServer,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
