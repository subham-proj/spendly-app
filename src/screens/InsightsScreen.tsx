import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useExpenseData } from '../hooks/useExpenseData';
import { useMetrics } from '../hooks/useMetrics';
import { CATEGORIES, calculateCategoryTotal } from '../lib/mockData';
import { usePreferences } from '../context/PreferencesContext';
import { formatPercentage } from '../lib/formatters';
import { Colors, spacing, radius, fontSize, fontWeight, shadow } from '../constants/theme';

function CategoryBar({ category, total, max }: { category: any; total: number; max: number }) {
  const { colors, formatAmount } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const pct = max > 0 ? total / max : 0;
  const overBudget = total > category.budget;

  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryLeft}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>
        <View style={styles.categoryRight}>
          <Text style={[styles.categoryAmount, overBudget && { color: colors.red }]}>
            {formatAmount(total)}
          </Text>
          <Text style={styles.categoryBudget}>of {formatAmount(category.budget)}</Text>
        </View>
      </View>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(pct * 100, 100)}%`,
              backgroundColor: overBudget ? colors.red : category.color,
            },
          ]}
        />
      </View>
      {overBudget && (
        <Text style={styles.overBudget}>
          Over budget by {formatAmount(total - category.budget)}
        </Text>
      )}
    </View>
  );
}

function InsightCard({ emoji, title, description, accent }: {
  emoji: string;
  title: string;
  description: string;
  accent: string;
}) {
  const { colors } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.insightCard, { borderLeftColor: accent }, shadow.sm]}>
      <Text style={styles.insightEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightDesc}>{description}</Text>
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const { colors, formatAmount } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data, isLoading } = useExpenseData();
  const metrics = useMetrics(data?.transactions);
  const transactions = data?.transactions ?? [];

  const categoryTotals = CATEGORIES.map((cat) => ({
    ...cat,
    total: calculateCategoryTotal(transactions, cat.id),
  })).sort((a, b) => b.total - a.total);

  const maxTotal = Math.max(...categoryTotals.map((c) => c.total), 1);
  const topCategory = categoryTotals[0];
  const overBudgetCount = categoryTotals.filter((c) => c.total > c.budget).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, shadow.sm]}>
            <Text style={styles.summaryLabel}>Savings Rate</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {formatPercentage(metrics.savingsRate.value)}
            </Text>
          </View>
          <View style={[styles.summaryCard, shadow.sm]}>
            <Text style={styles.summaryLabel}>Net Savings</Text>
            <Text style={[styles.summaryValue, { color: metrics.netSavings.value >= 0 ? colors.primary : colors.red }]}>
              {formatAmount(metrics.netSavings.value)}
            </Text>
          </View>
        </View>

        {/* AI Insights */}
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightsList}>
          {topCategory && topCategory.total > 0 && (
            <InsightCard
              emoji="🏆"
              title={`Top Spend: ${topCategory.name}`}
              description={`You've spent ${formatAmount(topCategory.total)} this month on ${topCategory.name}.`}
              accent={topCategory.color}
            />
          )}
          {overBudgetCount > 0 && (
            <InsightCard
              emoji="⚠️"
              title={`${overBudgetCount} categor${overBudgetCount > 1 ? 'ies' : 'y'} over budget`}
              description="Review your spending in categories marked in red below."
              accent={colors.red}
            />
          )}
          {metrics.savingsRate.value > 20 && (
            <InsightCard
              emoji="🎉"
              title="Great savings rate!"
              description={`You're saving ${formatPercentage(metrics.savingsRate.value)} of your income. Keep it up!`}
              accent={colors.primary}
            />
          )}
          {metrics.savingsRate.value <= 0 && (
            <InsightCard
              emoji="💡"
              title="Spending exceeds income"
              description="Your expenses this month are higher than your recorded income."
              accent={colors.amber}
            />
          )}
        </View>

        {/* Category Breakdown */}
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <View style={[styles.card, shadow.sm]}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={[styles.skeleton, { backgroundColor: colors.border }]} />
              ))
            : categoryTotals.map((cat) => (
                <CategoryBar key={cat.id} category={cat} total={cat.total} max={maxTotal} />
              ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },

    summaryRow: { flexDirection: 'row', gap: spacing.sm },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.xs,
    },
    summaryLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
    summaryValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },

    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.text,
      marginTop: spacing.xs,
    },

    insightsList: { gap: spacing.sm },
    insightCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      borderLeftWidth: 4,
    },
    insightEmoji: { fontSize: 22, marginTop: 1 },
    insightTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
    insightDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
    },

    categoryRow: { gap: spacing.xs },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    categoryIcon: { fontSize: 18 },
    categoryName: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
    categoryRight: { alignItems: 'flex-end' },
    categoryAmount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
    categoryBudget: { fontSize: fontSize.xs, color: colors.textMuted },
    barBg: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    barFill: { height: '100%', borderRadius: radius.full },
    overBudget: { fontSize: fontSize.xs, color: colors.red, fontWeight: fontWeight.medium },

    skeleton: { height: 48, borderRadius: radius.md },
  });
}
