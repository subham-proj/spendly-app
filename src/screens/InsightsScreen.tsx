import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSummary } from "../hooks/useSummary";
import {
  useCategoryExpenses,
  CategoryExpense,
} from "../hooks/useCategoryExpenses";
import { useDailyExpenses, DailyExpense } from "../hooks/useDailyExpenses";
import { useInsights, AiInsight } from "../hooks/useInsights";
import { getCategoryById } from "../lib/categories";
import { usePreferences } from "../context/PreferencesContext";
import { formatShortDate, formatPercentage } from "../lib/formatters";
import {
  Colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  shadow,
} from "../constants/theme";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayStr = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});

const PERIOD_OPTIONS: { label: string; value: "month" | "all" }[] = [
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({
  colors,
  height = 56,
  borderRadius: br = radius.md,
}: {
  colors: Colors;
  height?: number;
  borderRadius?: number;
}) {
  return (
    <View
      style={{ height, borderRadius: br, backgroundColor: colors.border }}
    />
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  valueColor,
  styles,
}: {
  label: string;
  value: string;
  valueColor: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={[styles.summaryCard, shadow.sm]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────
function InsightCard({
  insight,
  styles,
}: {
  insight: AiInsight;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View
      style={[
        styles.insightCard,
        { borderLeftColor: insight.accent },
        shadow.sm,
      ]}
    >
      <Text style={styles.insightEmoji}>{insight.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.insightTitle}>{insight.title}</Text>
        <Text style={styles.insightDesc}>{insight.description}</Text>
      </View>
    </View>
  );
}

// ─── Spending Chart ───────────────────────────────────────────────────────────
function SpendingChart({
  data,
  colors,
  formatAmount,
}: {
  data: DailyExpense[];
  colors: Colors;
  formatAmount: (n: number) => string;
}) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.amount), 1);
  const chartHeight = 80;
  const peak = data.reduce((p, c) => (c.amount > p.amount ? c : p), data[0]);

  // Show date labels for every 7th bar (first, ~7, ~14, ~21, last)
  const labelIndices = new Set([0, 6, 13, 20, data.length - 1]);

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          height: chartHeight,
          gap: 2,
        }}
      >
        {data.map((day, i) => {
          const barH =
            day.amount > 0 ? Math.max((day.amount / max) * chartHeight, 4) : 2;
          const isToday = day.date === todayStr;
          return (
            <View
              key={day.date}
              style={{
                flex: 1,
                height: barH,
                borderRadius: 2,
                backgroundColor: isToday
                  ? colors.primary
                  : colors.primary + "50",
              }}
            />
          );
        })}
      </View>

      {/* X-axis date labels */}
      <View style={{ flexDirection: "row", marginTop: spacing.xs }}>
        {data.map((day, i) => (
          <View key={day.date} style={{ flex: 1, alignItems: "center" }}>
            {labelIndices.has(i) && (
              <Text style={{ fontSize: 9, color: colors.textMuted }}>
                {formatShortDate(day.date).replace(/\s/, "\n")}
              </Text>
            )}
          </View>
        ))}
      </View>

      {peak.amount > 0 && (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fontSize.xs,
            marginTop: spacing.xs,
          }}
        >
          Peak: {formatAmount(peak.amount)} on {formatShortDate(peak.date)}
        </Text>
      )}
    </View>
  );
}

// ─── Category Bar ─────────────────────────────────────────────────────────────
function CategoryBar({
  item,
  maxAmount,
  styles,
  colors,
  formatAmount,
}: {
  item: CategoryExpense;
  maxAmount: number;
  styles: ReturnType<typeof makeStyles>;
  colors: Colors;
  formatAmount: (n: number) => string;
}) {
  const cat = getCategoryById(item.category);
  const pct = maxAmount > 0 ? item.amount / maxAmount : 0;
  const barColor = cat?.color ?? colors.primary;

  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryLeft}>
          <Text style={styles.categoryIcon}>{cat?.icon ?? "💳"}</Text>
          <Text style={styles.categoryName}>{cat?.name ?? item.category}</Text>
        </View>
        <View style={styles.categoryRight}>
          <Text style={styles.categoryAmount}>{formatAmount(item.amount)}</Text>
          <Text style={styles.categoryPct}>{item.percentage.toFixed(1)}%</Text>
        </View>
      </View>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(pct * 100, 100)}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Insights Screen ──────────────────────────────────────────────────────────
export default function InsightsScreen() {
  const { colors, formatAmount } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [period, setPeriod] = useState<"month" | "all">("month");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useSummary(period);
  const {
    data: catData,
    isLoading: catLoading,
    refetch: refetchCat,
  } = useCategoryExpenses(period);
  const {
    data: daily,
    isLoading: dailyLoading,
    refetch: refetchDaily,
  } = useDailyExpenses();
  const {
    data: aiData,
    isLoading: insightsLoading,
    refetch: refetchInsights,
  } = useInsights(period);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchSummary(),
      refetchCat(),
      refetchDaily(),
      refetchInsights(),
    ]);
    setRefreshing(false);
  }, [refetchSummary, refetchCat, refetchDaily, refetchInsights]);

  const categories = catData?.categories ?? [];
  const maxCatAmount = categories.length > 0 ? categories[0].amount : 1;
  const dailyData = daily?.data ?? [];
  const insights = aiData?.insights ?? [];

  const savingsColor =
    (summary?.totalSavings ?? 0) >= 0 ? colors.income : colors.red;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
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
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Insights</Text>
          <View style={styles.periodRow}>
            {PERIOD_OPTIONS.map((opt) => {
              const active = period === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.periodChip, active && styles.periodChipActive]}
                  onPress={() => setPeriod(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.periodChipText,
                      active && styles.periodChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Summary Row ─────────────────────────────────────────────────── */}
        {summaryLoading ? (
          <View style={styles.summaryRow}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                colors={colors}
                height={72}
                borderRadius={radius.lg}
              />
            ))}
          </View>
        ) : (
          <View style={styles.summaryRow}>
            <SummaryCard
              label="Spent"
              value={formatAmount(summary?.totalExpense ?? 0)}
              valueColor={colors.red}
              styles={styles}
            />
            <SummaryCard
              label="Income"
              value={formatAmount(summary?.totalIncome ?? 0)}
              valueColor={colors.income}
              styles={styles}
            />
            <SummaryCard
              label="Saved"
              value={formatAmount(summary?.totalSavings ?? 0)}
              valueColor={savingsColor}
              styles={styles}
            />
          </View>
        )}

        {/* ── Spending Trend ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spending Trend</Text>
          <Text style={styles.sectionSub}>Last 30 days</Text>
        </View>
        <View style={[styles.card, shadow.sm]}>
          {dailyLoading ? (
            <Skeleton colors={colors} height={80} borderRadius={radius.sm} />
          ) : (
            <SpendingChart
              data={dailyData}
              colors={colors}
              formatAmount={formatAmount}
            />
          )}
        </View>

        {/* ── AI Insights ─────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Insights ✨</Text>
        </View>
        {insightsLoading ? (
          <View style={{ gap: spacing.sm }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} colors={colors} height={68} />
            ))}
          </View>
        ) : insights.length === 0 ? (
          <View style={[styles.card, shadow.sm]}>
            <Text style={styles.emptyText}>
              No insights yet. Add more transactions to get AI-powered analysis.
            </Text>
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} styles={styles} />
            ))}
          </View>
        )}

        {/* ── Category Breakdown ──────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>By Category</Text>
          {catData && (
            <Text style={styles.sectionSub}>
              {formatAmount(catData.total)} total
            </Text>
          )}
        </View>
        <View style={[styles.card, shadow.sm]}>
          {catLoading ? (
            <View style={{ gap: spacing.md }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} colors={colors} height={48} />
              ))}
            </View>
          ) : categories.length === 0 ? (
            <Text style={styles.emptyText}>
              No expense data for this period.
            </Text>
          ) : (
            <View style={{ gap: spacing.md }}>
              {categories.map((cat) => (
                <CategoryBar
                  key={cat.category}
                  item={cat}
                  maxAmount={maxCatAmount}
                  styles={styles}
                  colors={colors}
                  formatAmount={formatAmount}
                />
              ))}
            </View>
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
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xxl,
      gap: spacing.md,
    },

    // Header
    header: { gap: spacing.sm },
    screenTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.text,
    },
    periodRow: { flexDirection: "row", gap: spacing.xs },
    periodChip: {
      paddingHorizontal: spacing.sm + 4,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    periodChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodChipText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.textSecondary,
    },
    periodChipTextActive: {
      color: "#fff",
      fontWeight: fontWeight.semibold,
    },

    // Summary
    summaryRow: { flexDirection: "row", gap: spacing.sm },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: "center",
      gap: spacing.xs,
    },
    summaryLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: fontWeight.medium,
    },
    summaryValue: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },

    // Section headers
    sectionHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.text,
    },
    sectionSub: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },

    // Card
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
    },

    // Insight cards
    insightCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      borderLeftWidth: 4,
    },
    insightEmoji: { fontSize: 22, marginTop: 1 },
    insightTitle: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.text,
    },
    insightDesc: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 3,
      lineHeight: 16,
    },

    // Category bars
    categoryRow: { gap: spacing.xs },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    categoryLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    categoryIcon: { fontSize: 18 },
    categoryName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.text,
    },
    categoryRight: { alignItems: "flex-end" },
    categoryAmount: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: colors.text,
    },
    categoryPct: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
    barBg: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: radius.full,
      overflow: "hidden",
    },
    barFill: { height: "100%", borderRadius: radius.full },

    // Empty
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: "center",
      paddingVertical: spacing.sm,
    },
  });
}
