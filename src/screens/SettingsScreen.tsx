import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LogOut, Mail, Shield, Bell, ChevronRight, Info } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, fontSize, fontWeight, shadow } from '../constants/theme';

function SettingRow({
  icon: Icon,
  label,
  sublabel,
  onPress,
  destructive,
  iconColor,
}: {
  icon: any;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  destructive?: boolean;
  iconColor?: string;
}) {
  const ic = iconColor ?? (destructive ? colors.red : colors.textSecondary);
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.rowIcon, { backgroundColor: ic + '18' }]}>
        <Icon size={18} color={ic} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, destructive && { color: colors.red }]}>{label}</Text>
        {sublabel && <Text style={styles.rowSublabel}>{sublabel}</Text>}
      </View>
      <ChevronRight size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <View style={[styles.profileCard, shadow.sm]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() ?? 'S'}
            </Text>
          </View>
          <View>
            <Text style={styles.profileEmail}>{user?.email ?? 'user@gmail.com'}</Text>
            <View style={styles.connectedBadge}>
              <View style={styles.dot} />
              <Text style={styles.connectedText}>Gmail connected</Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={[styles.section, shadow.sm]}>
          <SettingRow
            icon={Mail}
            label="Connected Gmail"
            sublabel={user?.email ?? 'Not connected'}
            iconColor={colors.primary}
          />
          <View style={styles.divider} />
          <SettingRow icon={Bell} label="Notifications" sublabel="Budget alerts & summaries" />
          <View style={styles.divider} />
          <SettingRow icon={Shield} label="Privacy & Security" sublabel="Data usage & permissions" />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={[styles.section, shadow.sm]}>
          <SettingRow icon={Info} label="App Version" sublabel="1.0.0" />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <LogOut size={18} color={colors.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  profileEmail: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  connectedBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  connectedText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.medium },

  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  rowSublabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 36 + spacing.md },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.redLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  signOutText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.red },
});
