import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Search, X, CreditCard } from 'lucide-react-native';
import { useTransactions, SortOption, ApiTransaction } from '../hooks/useTransactions';
import { TRANSACTION_CATEGORIES, getCategoryById } from '../lib/categories';
import { usePreferences } from '../context/PreferencesContext';
import { formatShortDate } from '../lib/formatters';
import { Colors, spacing, radius, fontSize, fontWeight, shadow } from '../constants/theme';

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_FILTERS = [
  { label: 'All',      value: '' as const },
  { label: 'Expenses', value: 'debit' as const },
  { label: 'Income',   value: 'credit' as const },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest',  value: '-emailDate' },
  { label: 'Oldest',  value: 'emailDate'  },
  { label: 'Highest', value: '-amount'    },
  { label: 'Lowest',  value: 'amount'     },
];

// ─── Transaction Card ─────────────────────────────────────────────────────────
function TransactionCard({
  item,
  colors,
  styles,
  formatAmount,
}: {
  item: ApiTransaction;
  colors: Colors;
  styles: ReturnType<typeof makeStyles>;
  formatAmount: (n: number) => string;
}) {
  const cat = getCategoryById(item.category);
  const isCredit = item.transactionType === 'credit';
  const iconColor = cat?.color ?? '#9CA3AF';
  const iconBg = iconColor + '22';
  const TxIcon = cat?.icon ?? CreditCard;

  return (
    <View style={[styles.txCard, shadow.sm]}>
      <View style={[styles.txIconBg, { backgroundColor: iconBg }]}>
        <TxIcon size={18} color={iconColor} />
      </View>
      <View style={styles.txBody}>
        <Text style={styles.txMerchant} numberOfLines={1}>
          {item.merchant ?? cat?.name ?? 'Transaction'}
        </Text>
        <Text style={styles.txMeta}>
          {item.merchant
            ? `${cat?.name ?? item.category ?? 'Other'} · ${formatShortDate(item.emailDate)}`
            : formatShortDate(item.emailDate)}
        </Text>
      </View>
      <Text style={[styles.txAmount, isCredit && { color: colors.income }]}>
        {isCredit ? '+' : '-'}{formatAmount(item.amount)}
      </Text>
    </View>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonCard({ colors }: { colors: Colors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md }}>
      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.border }} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ height: 12, width: '55%', borderRadius: radius.sm, backgroundColor: colors.border }} />
        <View style={{ height: 10, width: '35%', borderRadius: radius.sm, backgroundColor: colors.border }} />
      </View>
      <View style={{ height: 12, width: 60, borderRadius: radius.sm, backgroundColor: colors.border }} />
    </View>
  );
}

// ─── Transactions Screen ──────────────────────────────────────────────────────
export default function TransactionsScreen() {
  const { colors, formatAmount } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [searchInput,     setSearchInput]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeType,      setActiveType]      = useState<'' | 'debit' | 'credit'>('');
  const [activeCategory,  setActiveCategory]  = useState('');
  const [activeSort,      setActiveSort]      = useState<SortOption>('-emailDate');
  const [refreshing,      setRefreshing]      = useState(false);

  // Debounce search — 400 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Data ──────────────────────────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isError,
  } = useTransactions({
    type:     activeType,
    category: activeCategory,
    sort:     activeSort,
    search:   debouncedSearch,
  });

  const transactions = useMemo(
    () => data?.pages.flatMap((p) => p.transactions) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const clearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
  };

  // ── Render helpers ────────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: ApiTransaction }) => (
      <TransactionCard item={item} colors={colors} styles={styles} formatAmount={formatAmount} />
    ),
    [colors, styles, formatAmount],
  );

  const keyExtractor = useCallback((item: ApiTransaction) => item._id, []);

  const ListFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerSpinner}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} colors={colors} />
          ))}
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Could not load transactions</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No transactions found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your filters or search</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header row: title + sort chips ─────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Transactions</Text>
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => {
            const active = activeSort === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.sortChip, active && styles.sortChipActive]}
                onPress={() => setActiveSort(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <View style={styles.searchBar}>
        <Search size={15} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by merchant…"
          placeholderTextColor={colors.textMuted}
          value={searchInput}
          onChangeText={setSearchInput}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={14} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Type filter chips ───────────────────────────────────────────────── */}
      <View style={styles.typeRow}>
        {TYPE_FILTERS.map((f) => {
          const active = activeType === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.typeChip, active && styles.typeChipActive]}
              onPress={() => setActiveType(f.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Category chips (horizontal scroll) ─────────────────────────────── */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TRANSACTION_CATEGORIES}
        keyExtractor={(c) => c.id}
        style={styles.categoryListWrapper}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const active = activeCategory === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                active && { backgroundColor: item.color + '25', borderColor: item.color },
              ]}
              onPress={() => setActiveCategory(active ? '' : item.id)}
              activeOpacity={0.7}
            >
              <item.icon size={14} color={active ? item.color : colors.textMuted} />
              <Text style={[styles.categoryText, active && { color: item.color }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Count badge ─────────────────────────────────────────────────────── */}
      {!isLoading && (
        <Text style={styles.countBadge}>
          {totalCount.toLocaleString()} transaction{totalCount !== 1 ? 's' : ''}
        </Text>
      )}

      {/* ── Main list ───────────────────────────────────────────────────────── */}
      <FlatList
        data={transactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          transactions.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    screenTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.text,
    },
    sortRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    sortChip: {
      paddingHorizontal: spacing.sm + 4,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sortChipText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.textSecondary,
    },
    sortChipTextActive: {
      color: '#fff',
      fontWeight: fontWeight.semibold,
    },

    // Search bar
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      ...shadow.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: spacing.md,
      fontSize: fontSize.sm,
      color: colors.text,
    },

    // Type chips
    typeRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    typeChip: {
      paddingHorizontal: spacing.md + 2,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    typeChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    typeChipText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontWeight: fontWeight.medium,
    },
    typeChipTextActive: { color: '#fff' },

    // Category chips
    categoryListWrapper: {
      flexGrow: 0,
      marginBottom: spacing.sm,
    },
    categoryList: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      gap: spacing.sm,
      alignItems: 'center',
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      height: 34,
      paddingHorizontal: spacing.sm + 4,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontWeight: fontWeight.medium,
      lineHeight: 18,
    },

    // Count badge
    countBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      fontWeight: fontWeight.medium,
    },

    // List
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xxl,
      gap: spacing.sm,
    },
    listContentEmpty: {
      flexGrow: 1,
    },

    // Transaction card
    txCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    txIconBg: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    txBody: { flex: 1, gap: 3 },
    txMerchant: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.text,
    },
    txMeta: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    txAmount: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: colors.text,
      flexShrink: 0,
    },

    // Footer spinner
    footerSpinner: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },

    // Empty / error
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: spacing.xxl * 2,
      gap: spacing.sm,
    },
    emptyIcon:     { fontSize: 40 },
    emptyTitle:    { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
    emptySubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
    retryBtn: {
      marginTop: spacing.sm,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
    },
    retryText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  });
}
