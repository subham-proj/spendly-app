import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Linking,
  Switch,
} from 'react-native';
import {
  DollarSign,
  Bell,
  Info,
  Star,
  Share2,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Smartphone,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react-native';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import {
  usePreferences,
  CURRENCIES,
  ThemeMode,
  CurrencyOption,
} from '../context/PreferencesContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../constants/api';
import { Colors, spacing, radius, fontSize, fontWeight, shadow } from '../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RowProps {
  icon: any;
  iconColor?: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  hideChevron?: boolean;
  rightContent?: React.ReactNode;
}

// ─── Setting Row ─────────────────────────────────────────────────────────────
function SettingRow({ icon: Icon, iconColor, label, sublabel, onPress, hideChevron, rightContent }: RowProps) {
  const { colors } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const ic = iconColor ?? colors.textSecondary;
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.65 : 1}
      disabled={!onPress}
    >
      <View style={[styles.rowIconBg, { backgroundColor: ic + '18' }]}>
        <Icon size={17} color={ic} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sublabel ? <Text style={styles.rowSublabel} numberOfLines={1}>{sublabel}</Text> : null}
      </View>
      {rightContent ?? (
        !hideChevron && onPress ? <ChevronRight size={16} color={colors.textMuted} /> : null
      )}
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionCard, shadow.sm]}>{children}</View>
    </View>
  );
}

function Divider() {
  const { colors } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return <View style={styles.divider} />;
}

// ─── Theme Segmented Control ──────────────────────────────────────────────────
function ThemeControl({ onThemeChange }: { onThemeChange: (mode: ThemeMode) => void }) {
  const { colors, themeMode, setThemeMode } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const options: { mode: ThemeMode; icon: any; label: string }[] = [
    { mode: 'light',  icon: Sun,        label: 'Light' },
    { mode: 'system', icon: Smartphone, label: 'Auto'  },
    { mode: 'dark',   icon: Moon,       label: 'Dark'  },
  ];

  return (
    <View style={styles.themeControl}>
      {options.map(({ mode, icon: Icon, label }) => {
        const active = themeMode === mode;
        return (
          <TouchableOpacity
            key={mode}
            style={[styles.themeOption, active && styles.themeOptionActive]}
            onPress={() => {
              setThemeMode(mode);
              onThemeChange(mode);
            }}
            activeOpacity={0.75}
          >
            <Icon size={14} color={active ? colors.primary : colors.textMuted} />
            <Text style={[styles.themeOptionText, active && styles.themeOptionTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Profile Card Skeleton ────────────────────────────────────────────────────
function ProfileSkeleton() {
  const { colors } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.profileCard, shadow.sm]}>
      <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]} />
      <View style={styles.profileTextBlock}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '55%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '75%', marginTop: 6 }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '35%', marginTop: 6 }]} />
      </View>
    </View>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { token, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const {
    colors,
    currency,
    setCurrency,
    notificationsEnabled,
    setNotificationsEnabled,
  } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Sync a preference change to the backend (fire-and-forget)
  const patchPreferences = (patch: Record<string, unknown>) => {
    if (!token) return;
    apiFetch(API_ROUTES.PREFERENCES, token, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }).catch(() => {});
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Track your expenses automatically with Spendly — powered by Gmail. Download now!',
        title: 'Spendly — Smart Expense Tracker',
      });
    } catch (_) {}
  };

  const handleRate = async () => {
    const url = 'https://apps.apple.com';
    const supported = await Linking.canOpenURL(url);
    if (supported) Linking.openURL(url);
  };

  const handlePickCurrency = () => {
    Alert.alert(
      'Select Currency',
      'Choose the currency to display amounts in',
      [
        ...CURRENCIES.map((c: CurrencyOption) => ({
          text: `${c.symbol}  ${c.name}${currency.code === c.code ? '  ✓' : ''}`,
          onPress: () => {
            setCurrency(c);
            patchPreferences({ currency: c.code });
          },
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    patchPreferences({ notificationsEnabled: enabled });
  };

  const handleThemeChange = (mode: ThemeMode) => {
    patchPreferences({ themeMode: mode });
  };

  const memberSince = profile?.memberSince
    ? format(new Date(profile.memberSince), 'MMM yyyy')
    : null;

  const lastSynced = profile?.lastSynced
    ? formatDistanceToNow(new Date(profile.lastSynced), { addSuffix: true })
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.screenTitle}>Settings</Text>

        {/* ─── Profile Card ─────────────────────────────────────────────── */}
        {isLoading ? <ProfileSkeleton /> : (
          <View style={[styles.profileCard, shadow.sm]}>
            {/* Avatar — Google photo or letter fallback */}
            {profile?.picture ? (
              <Image
                source={{ uri: profile.picture }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarLetter}>
                  {profile?.name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
            )}

            <View style={styles.profileTextBlock}>
              {profile?.name && (
                <Text style={styles.profileName} numberOfLines={1}>{profile.name}</Text>
              )}
              <Text style={styles.profileEmail} numberOfLines={1}>{profile?.email ?? '—'}</Text>
              {memberSince && (
                <Text style={styles.profileMeta}>Member since {memberSince}</Text>
              )}
            </View>
          </View>
        )}

        {/* ─── Account ──────────────────────────────────────────────────── */}
        <Section title="Account">
          <SettingRow
            icon={UserIcon}
            iconColor={colors.primary}
            label={profile?.name ?? profile?.email ?? 'Your Account'}
            sublabel={profile?.name ? profile.email : undefined}
            hideChevron
          />
          <Divider />
          <SettingRow
            icon={RefreshCw}
            iconColor={colors.blue}
            label="Last Gmail Sync"
            sublabel={lastSynced ? `Synced ${lastSynced}` : 'Loading...'}
            hideChevron
          />
        </Section>

        {/* ─── Appearance ───────────────────────────────────────────────── */}
        <Section title="Appearance">
          <SettingRow
            icon={Sun}
            iconColor={colors.purple}
            label="Theme"
            sublabel="Choose your preferred appearance"
            hideChevron
            rightContent={null}
          />
          <View style={styles.themeRow}>
            <ThemeControl onThemeChange={handleThemeChange} />
          </View>
        </Section>

        {/* ─── Preferences ──────────────────────────────────────────────── */}
        <Section title="Preferences">
          <SettingRow
            icon={DollarSign}
            iconColor={colors.purple}
            label="Currency"
            sublabel={`${currency.code} — ${currency.name}`}
            onPress={handlePickCurrency}
          />
          <Divider />
          <SettingRow
            icon={Bell}
            iconColor={colors.amber}
            label="Notifications"
            sublabel={notificationsEnabled ? 'Budget alerts & new transactions' : 'Notifications off'}
            hideChevron
            rightContent={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
              />
            }
          />
        </Section>

        {/* ─── About ────────────────────────────────────────────────────── */}
        <Section title="About">
          <SettingRow
            icon={Info}
            iconColor={colors.textSecondary}
            label="App Version"
            sublabel="1.0.0"
            hideChevron
          />
          <Divider />
          <SettingRow
            icon={Star}
            iconColor="#F59E0B"
            label="Rate Spendly"
            sublabel="Enjoying the app? Leave a review"
            onPress={handleRate}
          />
          <Divider />
          <SettingRow
            icon={Share2}
            iconColor={colors.blue}
            label="Share App"
            sublabel="Invite friends to Spendly"
            onPress={handleShare}
          />
        </Section>

        {/* ─── Sign Out ─────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <LogOut size={18} color={colors.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Made with ♥ · Spendly v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },

    screenTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },

    // Profile card
    profileCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: radius.full,
    },
    avatarFallback: {
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarLetter: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.primary,
    },
    avatarPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: radius.full,
    },
    profileTextBlock: { flex: 1, gap: 2 },
    profileName: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.text,
    },
    profileEmail: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    profileMeta: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: 2,
    },
    skeletonLine: {
      height: 12,
      borderRadius: radius.sm,
    },

    // Section
    section: { gap: spacing.xs },
    sectionTitle: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: spacing.xs,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      overflow: 'hidden',
    },

    // Row
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 3,
      gap: spacing.md,
    },
    rowIconBg: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rowContent: { flex: 1 },
    rowLabel: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      color: colors.text,
    },
    rowSublabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: spacing.md + 34 + spacing.md,
    },

    // Theme control
    themeRow: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm + 3,
    },
    themeControl: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: radius.md,
      padding: 3,
      gap: 2,
    },
    themeOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.sm,
    },
    themeOptionActive: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    themeOptionText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      color: colors.textMuted,
    },
    themeOptionTextActive: {
      color: colors.primary,
      fontWeight: fontWeight.semibold,
    },

    // Sign out
    signOutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.redLight,
      borderRadius: radius.xl,
      paddingVertical: spacing.md,
      marginTop: spacing.xs,
    },
    signOutText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.red,
    },

    footer: {
      textAlign: 'center',
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
  });
}
