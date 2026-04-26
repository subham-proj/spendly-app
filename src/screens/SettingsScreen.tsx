import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Linking,
} from 'react-native';
import {
  Mail,
  RefreshCw,
  IndianRupee,
  Bell,
  Info,
  Star,
  Share2,
  LogOut,
  ChevronRight,
  Wifi,
  WifiOff,
} from 'lucide-react-native';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { colors, spacing, radius, fontSize, fontWeight, shadow } from '../constants/theme';

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

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionCard, shadow.sm]}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <View style={[styles.profileCard, shadow.sm]}>
      <View style={[styles.avatarSkeleton]} />
      <View style={styles.profileInfo}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '50%', marginTop: 6 }]} />
        <View style={[styles.skeletonLine, { width: '35%', marginTop: 6 }]} />
      </View>
    </View>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();

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
    // Replace with actual App Store / Play Store URL before publishing
    const url = 'https://apps.apple.com';
    const supported = await Linking.canOpenURL(url);
    if (supported) Linking.openURL(url);
  };

  const memberSince = profile?.memberSince
    ? format(new Date(profile.memberSince), 'MMM yyyy')
    : null;

  const lastSynced = profile?.lastSynced
    ? formatDistanceToNow(new Date(profile.lastSynced), { addSuffix: true })
    : null;

  const avatarLetter = profile?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Profile Card */}
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <View style={[styles.profileCard, shadow.sm]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileEmail} numberOfLines={1}>{profile?.email ?? '—'}</Text>
              {memberSince && (
                <Text style={styles.profileMeta}>Member since {memberSince}</Text>
              )}
              <View style={styles.gmailBadge}>
                {profile?.gmailConnected ? (
                  <>
                    <Wifi size={12} color={colors.primary} />
                    <Text style={[styles.badgeText, { color: colors.primary }]}>Gmail connected</Text>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} color={colors.amber} />
                    <Text style={[styles.badgeText, { color: colors.amber }]}>Gmail not connected</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Account */}
        <Section title="Account">
          <SettingRow
            icon={Mail}
            iconColor={colors.primary}
            label="Connected Gmail"
            sublabel={profile?.email ?? 'Loading...'}
          />
          <Divider />
          <SettingRow
            icon={RefreshCw}
            iconColor={colors.blue}
            label="Gmail Sync"
            sublabel={lastSynced ? `Last synced ${lastSynced}` : 'Loading...'}
          />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <SettingRow
            icon={IndianRupee}
            iconColor={colors.purple}
            label="Currency"
            sublabel="INR — Indian Rupee"
            hideChevron
          />
          <Divider />
          <SettingRow
            icon={Bell}
            iconColor={colors.amber}
            label="Notifications"
            sublabel="Budget alerts & weekly summaries"
          />
        </Section>

        {/* About */}
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

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <LogOut size={18} color={colors.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Made with ♥ · Spendly v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  profileInfo: { flex: 1, gap: 3 },
  profileEmail: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  profileMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  gmailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  // Skeleton
  avatarSkeleton: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: '#E5E7EB',
  },
  skeletonLine: {
    height: 12,
    width: '75%',
    backgroundColor: '#E5E7EB',
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

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEE2E2',
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
