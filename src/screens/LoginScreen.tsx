import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { Colors, spacing, radius, fontSize, fontWeight } from '../constants/theme';

export default function LoginScreen() {
  const { signInWithGoogle, isLoading } = useAuth();
  const { colors } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [signing, setSigning] = React.useState(false);

  const handleSignIn = async () => {
    setSigning(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigning(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo / Brand */}
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💸</Text>
          </View>
          <Text style={styles.appName}>Spendly</Text>
          <Text style={styles.tagline}>Smart expense tracking powered by your Gmail</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: '📧', text: 'Auto-detect expenses from Gmail' },
            { icon: '📊', text: 'Visual spending insights' },
            { icon: '💰', text: 'Track income & savings' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Sign in button */}
        <TouchableOpacity
          style={[styles.button, signing && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={signing}
          activeOpacity={0.85}
        >
          {signing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.buttonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you allow Spendly to read your Gmail to detect expenses automatically.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      justifyContent: 'center',
      gap: spacing.xl,
    },
    brand: { alignItems: 'center', gap: spacing.sm },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: radius.xl,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    logoEmoji: { fontSize: 40 },
    appName: {
      fontSize: 36,
      fontWeight: fontWeight.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    features: {
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    featureIcon: { fontSize: 22 },
    featureText: { fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium },
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    buttonDisabled: { opacity: 0.7 },
    googleIcon: { color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.bold },
    buttonText: { color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
    disclaimer: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 16,
    },
  });
}
