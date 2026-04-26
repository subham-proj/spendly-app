import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { DollarSign, TrendingUp, Wallet, Percent, TrendingDown } from 'lucide-react-native';
import { useExpenseData } from '../hooks/useExpenseData';
import { useMetrics } from '../hooks/useMetrics';
import { formatCurrency, formatPercentage, formatShortDate } from '../lib/formatters';
import { getCategoryById } from '../lib/mockData';
import { colors, spacing, radius, fontSize, fontWeight, shadow } from '../constants/theme';

// ─── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
}: {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
}) {
  const isPositive = trend === 'up';
  const isNeutral = trend === 'neutral';
  const trendColor = isPositive ? colors.primary : isNeutral ? colors.textSecondary : colors.red;
  const bgColor = isPositive ? colors.primaryLight : isNeutral ? colors.border : colors.redLight;
  const iconColor = isPositive ? colors.primary : isNeutral ? colors.textSecondary : colors.red;

  return (
    <View style={[styles.metricCard, shadow.sm]}>
      <View style={styles.metricTop}>
        <View style={[styles.metricIconBg, { backgroundColor: bgColor }]}>
          <Icon size={20} color={iconColor} />
        </View>
        {!isNeutral && (
          <View style={styles.metricTrend}>
            <Text style={[styles.metricChange, { color: trendColor }]}>{change}%</Text>
            {isPositive ? (
              <TrendingUp size={14} color={trendColor} />
            ) : (
              <TrendingDown size={14} color={trendColor} />
            )}
          </View>
        )}
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {label.includes('Rate') ? formatPercentage(value) : formatCurrency(value)}
      </Text>
    </View>
  );
}

// ─── Transaction Item ────────────────────────────────────────────────────────
function TransactionItem({ transaction }: { transaction: any }) {
  const category = getCategoryById(transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <View style={styles.txItem}>
      <View style={styles.txLeft}>
        <Text style={styles.txIcon}>{category?.icon ?? '💳'}</Text>
        <View>
          <Text style={styles.txMerchant}>{transaction.merchant}</Text>
          <Text style={styles.txDate}>{formatShortDate(transaction.date)}</Text>
        </View>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, isIncome && styles.txIncome]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        {transaction.isRecurring && <Text style={styles.txRecurring}>Recurring</Text>}
      </View>
    </View>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ height = 60, style }: { height?: number; style?: object }) {
  return <View style={[styles.skeleton, { height }, style]} />;
}

// ─── Dashboard Screen ────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { data, isLoading } = useExpenseData();
  const metrics = useMetrics(data?.transactions);

  const [showAll, setShowAll] = React.useState(false);
  const transactions = data?.transactions ?? [];
  const displayed = showAll ? transactions.slice(0, 20) : transactions.slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.subtitle}>Here's your spending overview</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>S</Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <Text style={styles.sectionTitle}>This Month</Text>
        {isLoading ? (
          <View style={styles.metricsGrid}>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={100} />)}
          </View>
        ) : (
          <View style={styles.metricsGrid}>
            <MetricCard label="Total Expenses" value={metrics.totalExpenses.value} change={metrics.totalExpenses.change} trend={metrics.totalExpenses.trend} icon={DollarSign} />
            <MetricCard label="Total Income" value={metrics.totalIncome.value} change={metrics.totalIncome.change} trend={metrics.totalIncome.trend} icon={TrendingUp} />
            <MetricCard label="Net Savings" value={metrics.netSavings.value} change={metrics.netSavings.change} trend={metrics.netSavings.trend} icon={Wallet} />
            <MetricCard label="Savings Rate" value={metrics.savingsRate.value} change={metrics.savingsRate.change} trend={metrics.savingsRate.trend} icon={Percent} />
          </View>
        )}

        {/* Recent Transactions */}
        <View style={[styles.card, shadow.sm]}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          {isLoading ? (
            <View style={{ gap: spacing.sm }}>
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={52} />)}
            </View>
          ) : (
            <>
              {displayed.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
              {transactions.length > 10 && (
                <TouchableOpacity
                  style={styles.showMoreBtn}
                  onPress={() => setShowAll((v) => !v)}
                >
                  <Text style={styles.showMoreText}>
                    {showAll
                      ? 'Show Less'
                      : `Show All Transactions (${transactions.length} total)`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: -spacing.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricIconBg: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTrend: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  metricChange: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  metricLabel: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  metricValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },

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
  txIcon: { fontSize: 24 },
  txMerchant: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
  txDate: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  txIncome: { color: colors.income },
  txRecurring: { fontSize: fontSize.xs, color: colors.amber, fontWeight: fontWeight.medium, marginTop: 2 },

  showMoreBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  showMoreText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },

  skeleton: {
    backgroundColor: '#E5E7EB',
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
});
