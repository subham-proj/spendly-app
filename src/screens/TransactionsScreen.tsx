import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { useExpenseData } from '../hooks/useExpenseData';
import { getCategoryById, CATEGORIES } from '../lib/mockData';
import { usePreferences } from '../context/PreferencesContext';
import { formatShortDate } from '../lib/formatters';
import { Colors, spacing, radius, fontSize, fontWeight, shadow } from '../constants/theme';

const FILTERS = ['All', 'Expenses', 'Income', 'Recurring'];

export default function TransactionsScreen() {
  const { colors, formatAmount } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data } = useExpenseData();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let txs = data?.transactions ?? [];

    if (activeFilter === 'Expenses') txs = txs.filter((t) => t.type === 'expense');
    else if (activeFilter === 'Income') txs = txs.filter((t) => t.type === 'income');
    else if (activeFilter === 'Recurring') txs = txs.filter((t) => t.isRecurring);

    if (activeCategory) txs = txs.filter((t) => t.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      txs = txs.filter((t) => t.merchant.toLowerCase().includes(q));
    }

    return txs;
  }, [data, activeFilter, activeCategory, search]);

  const renderItem = ({ item }: { item: any }) => {
    const category = getCategoryById(item.category);
    const isIncome = item.type === 'income';
    return (
      <View style={[styles.txCard, shadow.sm]}>
        <View style={styles.txLeft}>
          <View style={[styles.txIconBg, { backgroundColor: (category?.color ?? '#9CA3AF') + '20' }]}>
            <Text style={styles.txIcon}>{category?.icon ?? '💳'}</Text>
          </View>
          <View>
            <Text style={styles.txMerchant}>{item.merchant}</Text>
            <Text style={styles.txCategory}>{category?.name ?? item.category}</Text>
            <Text style={styles.txDate}>{formatShortDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.txRight}>
          <Text style={[styles.txAmount, isIncome && styles.txIncome]}>
            {isIncome ? '+' : '-'}{formatAmount(item.amount)}
          </Text>
          {item.isRecurring && <Text style={styles.recurring}>Recurring</Text>}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Type filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === item.id && { backgroundColor: item.color + '25', borderColor: item.color },
            ]}
            onPress={() => setActiveCategory(activeCategory === item.id ? null : item.id)}
          >
            <Text>{item.icon}</Text>
            <Text style={[styles.categoryText, activeCategory === item.id && { color: item.color }]}>
              {item.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Count */}
      <Text style={styles.count}>{filtered.length} transactions</Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      ...shadow.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: spacing.sm + 2,
      fontSize: fontSize.md,
      color: colors.text,
    },

    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
    filterTextActive: { color: '#fff' },

    categoryList: { paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.sm },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },

    count: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },

    listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl, gap: spacing.sm },
    txCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    txLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    txIconBg: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    txIcon: { fontSize: 22 },
    txMerchant: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
    txCategory: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
    txDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
    txRight: { alignItems: 'flex-end' },
    txAmount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
    txIncome: { color: colors.income },
    recurring: { fontSize: fontSize.xs, color: colors.amber, fontWeight: fontWeight.medium, marginTop: 2 },

    empty: { alignItems: 'center', paddingTop: spacing.xxl },
    emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
    emptyText: { fontSize: fontSize.md, color: colors.textSecondary },
  });
}
