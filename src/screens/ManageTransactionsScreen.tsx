import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Pencil, Trash2, CreditCard } from 'lucide-react-native';
import { useTransactions, ApiTransaction } from '../hooks/useTransactions';
import { useDeleteTransaction } from '../hooks/useDeleteTransaction';
import { getCategoryById } from '../lib/categories';
import { usePreferences } from '../context/PreferencesContext';
import { formatShortDate } from '../lib/formatters';
import EditTransactionModal from '../components/EditTransactionModal';
import { Colors, spacing, radius, fontSize, fontWeight, shadow } from '../constants/theme';

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow({ colors }: { colors: Colors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4 }}>
      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.border }} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ height: 12, width: '50%', borderRadius: radius.sm, backgroundColor: colors.border }} />
        <View style={{ height: 10, width: '35%', borderRadius: radius.sm, backgroundColor: colors.border }} />
      </View>
      <View style={{ gap: 6, alignItems: 'flex-end' }}>
        <View style={{ height: 12, width: 56, borderRadius: radius.sm, backgroundColor: colors.border }} />
      </View>
    </View>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TransactionRow({
  item,
  colors,
  styles,
  formatAmount,
  onEdit,
  onDelete,
}: {
  item: ApiTransaction;
  colors: Colors;
  styles: ReturnType<typeof makeStyles>;
  formatAmount: (n: number) => string;
  onEdit: (item: ApiTransaction) => void;
  onDelete: (item: ApiTransaction) => void;
}) {
  const cat = getCategoryById(item.category);
  const isCredit = item.transactionType === 'credit';
  const iconColor = cat?.color ?? '#9CA3AF';
  const TxIcon = cat?.icon ?? CreditCard;

  return (
    <View style={[styles.row, shadow.sm]}>
      <View style={[styles.iconBg, { backgroundColor: iconColor + '22' }]}>
        <TxIcon size={18} color={iconColor} />
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.merchant} numberOfLines={1}>
          {item.shortName || item.merchant || cat?.name || 'Transaction'}
        </Text>
        <Text style={styles.meta}>
          {cat?.name ?? item.category ?? 'Other'} · {formatShortDate(item.emailDate)}
        </Text>
      </View>

      <Text style={[styles.amount, isCredit && { color: colors.income }]}>
        {isCredit ? '+' : '-'}{formatAmount(item.amount)}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(item)}
          hitSlop={6}
          activeOpacity={0.7}
        >
          <Pencil size={15} color={colors.blue} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onDelete(item)}
          hitSlop={6}
          activeOpacity={0.7}
        >
          <Trash2 size={15} color={colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
const FIXED_FILTERS = {
  type: '' as const,
  category: '',
  sort: '-emailDate' as const,
  search: '',
};

export default function ManageTransactionsScreen() {
  const { colors, formatAmount } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [selectedTx, setSelectedTx] = useState<ApiTransaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTransactions(FIXED_FILTERS);

  const { mutate: deleteMutate } = useDeleteTransaction();

  const transactions = useMemo(
    () => data?.pages.flatMap((p) => p.transactions) ?? [],
    [data],
  );

  const handleEdit = useCallback((item: ApiTransaction) => {
    setSelectedTx(item);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback(
    (item: ApiTransaction) => {
      Alert.alert(
        'Delete Transaction',
        `Are you sure you want to delete this transaction? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteMutate(item._id, {
                onError: (err: any) => {
                  Alert.alert('Error', err?.message ?? 'Could not delete transaction.');
                },
              });
            },
          },
        ],
      );
    },
    [deleteMutate],
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedTx(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ApiTransaction }) => (
      <TransactionRow
        item={item}
        colors={colors}
        styles={styles}
        formatAmount={formatAmount}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [colors, styles, formatAmount, handleEdit, handleDelete],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isFetchingNextPage, colors.primary, styles]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} colors={colors} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.errorText}>Failed to load transactions</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {transactions.length > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {data?.pages[0]?.totalCount ?? 0} transactions
          </Text>
        </View>
      )}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={
          transactions.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Transactions will appear here once your Gmail is synced
            </Text>
          </View>
        }
      />

      <EditTransactionModal
        visible={modalVisible}
        transaction={selectedTx}
        onClose={handleCloseModal}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      padding: spacing.md,
      gap: spacing.sm,
      paddingBottom: spacing.xxl,
    },
    emptyContainer: {
      flex: 1,
    },

    // Transaction row
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    iconBg: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rowBody: {
      flex: 1,
      gap: 3,
    },
    merchant: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.text,
    },
    meta: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    amount: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: colors.text,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    actionBtn: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },

    // Count badge
    countBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    countText: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
    },

    // Footer loader
    loadingFooter: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },

    // Error state
    centeredState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.background,
    },
    errorText: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
    },
    retryBtn: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.xl,
    },
    retryText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: '#fff',
    },

    // Empty state
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
    },
    emptyTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
