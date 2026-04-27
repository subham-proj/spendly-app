import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { DollarSign, TrendingUp, Wallet, Percent, AlertCircle, CreditCard } from 'lucide-react-native';
import { useSummary } from '../hooks/useSummary';
import { useRecentTransactions, RecentTransaction } from '../hooks/useRecentTransactions';
import { useProfile } from '../hooks/useProfile';
import { usePreferences } from '../context/PreferencesContext';
import { formatPercentage, formatShortDate } from '../lib/formatters';
import { getCategoryById } from '../lib/categories';
import { Colors, spacing, radius, fontSize, fontWeight, shadow } from '../constants/theme';

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  trend = 'neutral',
  icon: Icon,
}: {
  label: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
}) {
  const { colors, formatAmount } = usePreferences();
  const isPositive = trend === 'up';
  const isNeutral = trend === 'neutral';
  const bgColor = isPositive ? colors.primaryLight : isNeutral ? colors.border : colors.redLight;
  const iconColor = isPositive ? colors.primary : isNeutral ? colors.textSecondary : colors.red;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.metricCard, shadow.sm]}>
      <View style={styles.metricTop}>
        <View style={[styles.metricIconBg, { backgroundColor: bgColor }]}>
          <Icon size={20} color={iconColor} />
        </View>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {label.includes('Rate') ? formatPercentage(value) : formatAmount(value)}
      </Text>
    </View>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ height = 60, style }: { height?: number; style?: object }) {
  const { colors } = usePreferences();
  return (
    <View
      style={[
        { flex: 1, minWidth: '47%', borderRadius: radius.lg, height },
        { backgroundColor: colors.border },
        style,
      ]}
    />
  );
}

// ─── Transaction Item ────────────────────────────────────────────────────────
function TransactionItem({ transaction }: { transaction: RecentTransaction }) {
  const { colors, formatAmount } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isIncome = transaction.transactionType === 'credit';
  const cat = getCategoryById(transaction.category);
  const TxIcon = cat?.icon ?? CreditCard;
  const iconColor = cat?.color ?? colors.textSecondary;
  const iconBg = iconColor + '22';

  return (
    <View style={styles.txItem}>
      <View style={styles.txLeft}>
        <View style={[styles.txIconBg, { backgroundColor: iconBg }]}>
          <TxIcon size={18} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.txMerchant} numberOfLines={1}>
            {transaction.shortName ?? transaction.merchant ?? transaction.subject ?? 'Transaction'}
          </Text>
          <Text style={styles.txDate}>{formatShortDate(transaction.emailDate)}</Text>
        </View>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, isIncome && styles.txIncome]}>
          {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
        </Text>
        {transaction.category && (
          <Text style={styles.txCategory}>
            {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Error Card ──────────────────────────────────────────────────────────────
function ErrorCard({ onRetry }: { onRetry: () => void }) {
  const { colors } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.errorCard, shadow.sm]}>
      <AlertCircle size={20} color={colors.red} />
      <Text style={styles.errorText}>Could not load data</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Dashboard Screen ────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const { colors, formatAmount } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: summary, isLoading, isError, refetch: refetchSummary } = useSummary('month');
  const { data: recentTxs, isLoading: txLoading, refetch: refetchTxs } = useRecentTransactions(10);
  const { data: profile } = useProfile();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchTxs()]);
    setRefreshing(false);
  };

  const savingsRate =
    summary && summary.totalIncome > 0
      ? Math.round((summary.totalSavings / summary.totalIncome) * 100)
      : 0;

  const transactions = recentTxs ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.subtitle}>Here's your spending overview</Text>
          </View>
          {profile?.picture ? (
            <Image source={{ uri: profile.picture }} style={styles.avatarCircle} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {profile?.name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? 'S'}
              </Text>
            </View>
          )}
        </View>

        {/* Error State */}
        {isError && <ErrorCard onRetry={refetchSummary} />}

        {/* Metrics Grid */}
        <Text style={styles.sectionTitle}>This Month</Text>
        {isLoading ? (
          <View style={styles.metricsGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={100} />
            ))}
          </View>
        ) : !isError && summary ? (
          <View style={styles.metricsGrid}>
            <MetricCard label="Total Expenses" value={summary.totalExpense} trend="down" icon={DollarSign} />
            <MetricCard label="Total Income" value={summary.totalIncome} trend="up" icon={TrendingUp} />
            <MetricCard
              label="Net Savings"
              value={summary.totalSavings}
              trend={summary.totalSavings >= 0 ? 'up' : 'down'}
              icon={Wallet}
            />
            <MetricCard
              label="Savings Rate"
              value={savingsRate}
              trend={savingsRate > 0 ? 'up' : savingsRate < 0 ? 'down' : 'neutral'}
              icon={Percent}
            />
          </View>
        ) : null}

        {/* Top Spend Category Badge */}
        {summary?.maxSpentCategory && (
          <View style={[styles.topSpendBadge, shadow.sm]}>
            <Text style={styles.topSpendLabel}>Top spend this month</Text>
            <View style={styles.topSpendRight}>
              <Text style={styles.topSpendCategory}>
                {summary.maxSpentCategory.category.charAt(0).toUpperCase() +
                  summary.maxSpentCategory.category.slice(1)}
              </Text>
              <Text style={styles.topSpendAmount}>
                {formatAmount(summary.maxSpentCategory.amount)}
              </Text>
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={[styles.card, shadow.sm]}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          {txLoading ? (
            <View style={{ gap: spacing.sm }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={52} style={{ minWidth: undefined }} />
              ))}
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyTx}>
              <Text style={styles.emptyTxIcon}>📭</Text>
              <Text style={styles.emptyTxText}>No transactions yet</Text>
              <Text style={styles.emptyTxSub}>
                Transactions from your Gmail will appear here
              </Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <TransactionItem key={tx._id} transaction={tx} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    greeting: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
    subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },

    errorCard: {
      backgroundColor: colors.redLight,
      borderRadius: radius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    errorText: { flex: 1, fontSize: fontSize.sm, color: colors.red, fontWeight: fontWeight.medium },
    retryBtn: {
      backgroundColor: colors.red,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
    },
    retryText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.text,
      marginBottom: -spacing.xs,
    },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    metricCard: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.xs,
    },
    metricTop: { marginBottom: spacing.xs },
    metricIconBg: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    metricLabel: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
    metricValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },

    topSpendBadge: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    topSpendLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
    topSpendRight: { alignItems: 'flex-end' },
    topSpendCategory: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
    topSpendAmount: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.semibold },

    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    cardTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.text,
      marginBottom: spacing.md,
    },

    txItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm + 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    txLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    txIconBg: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    txMerchant: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
    txDate: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
    txRight: { alignItems: 'flex-end' },
    txAmount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
    txIncome: { color: colors.income },
    txCategory: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

    emptyTx: { alignItems: 'center', paddingVertical: spacing.xl },
    emptyTxIcon: { fontSize: 36, marginBottom: spacing.sm },
    emptyTxText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
    emptyTxSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  });
}
