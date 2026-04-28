import React, { useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react-native';
import { usePreferences } from '../context/PreferencesContext';
import { useUpdateTransaction } from '../hooks/useUpdateTransaction';
import { TRANSACTION_CATEGORIES } from '../lib/categories';
import { Colors, spacing, radius, fontSize, fontWeight } from '../constants/theme';
import type { ApiTransaction } from '../hooks/useTransactions';

// ─── Schema ───────────────────────────────────────────────────────────────────
const CATEGORY_IDS = TRANSACTION_CATEGORIES.map((c) => c.id) as [string, ...string[]];

const editSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive'),
  merchant: z.string().trim().min(1, 'Merchant name is required'),
  shortName: z.string().trim(),
  category: z.enum(CATEGORY_IDS as [string, ...string[]], 'Select a category'),
  transactionType: z.enum(['debit', 'credit'] as const),
});

type EditFormData = z.infer<typeof editSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────
interface EditTransactionModalProps {
  visible: boolean;
  transaction: ApiTransaction | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EditTransactionModal({
  visible,
  transaction,
  onClose,
  onSuccess,
}: EditTransactionModalProps) {
  const { colors } = usePreferences();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { mutate, isPending } = useUpdateTransaction();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      amount: transaction?.amount ?? 0,
      merchant: transaction?.merchant ?? '',
      shortName: transaction?.shortName ?? '',
      category: transaction?.category ?? 'other',
      transactionType: transaction?.transactionType ?? 'debit',
    },
  });

  // Re-populate form whenever a different transaction is selected
  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount ?? 0,
        merchant: transaction.merchant ?? '',
        shortName: transaction.shortName ?? '',
        category: transaction.category ?? 'other',
        transactionType: transaction.transactionType ?? 'debit',
      });
    }
  }, [transaction?._id]);

  const onSubmit = (data: EditFormData) => {
    if (!transaction) return;
    mutate(
      { id: transaction._id, data },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.message ?? 'Could not update transaction. Please try again.');
        },
      },
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Dimmed overlay — tap to dismiss */}
        <Pressable style={styles.overlay} onPress={onClose} />

        {/* Bottom sheet */}
        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Transaction</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Amount ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Amount</Text>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <TextInput
                    style={[styles.input, errors.amount && styles.inputError]}
                    keyboardType="decimal-pad"
                    value={field.value ? String(field.value) : ''}
                    onChangeText={(v) => field.onChange(parseFloat(v) || 0)}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
              {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
            </View>

            {/* ── Merchant ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Merchant</Text>
              <Controller
                control={control}
                name="merchant"
                render={({ field }) => (
                  <TextInput
                    style={[styles.input, errors.merchant && styles.inputError]}
                    value={field.value}
                    onChangeText={field.onChange}
                    autoCapitalize="words"
                    placeholder="Merchant name"
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
              {errors.merchant && <Text style={styles.errorText}>{errors.merchant.message}</Text>}
            </View>

            {/* ── Short Name ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Short Name <Text style={styles.optionalLabel}>(optional)</Text></Text>
              <Controller
                control={control}
                name="shortName"
                render={({ field }) => (
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.onChange}
                    autoCapitalize="words"
                    placeholder="e.g. Swiggy, Ola"
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
            </View>

            {/* ── Transaction Type ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Type</Text>
              <Controller
                control={control}
                name="transactionType"
                render={({ field }) => (
                  <View style={styles.segmentedRow}>
                    {(['debit', 'credit'] as const).map((type) => {
                      const active = field.value === type;
                      const activeColor = type === 'debit' ? colors.red : colors.income;
                      const activeBg = type === 'debit' ? colors.redLight : colors.primaryLight;
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.segmentBtn,
                            active && { backgroundColor: activeBg, borderColor: activeColor },
                          ]}
                          onPress={() => field.onChange(type)}
                          activeOpacity={0.75}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              active && { color: activeColor, fontWeight: fontWeight.semibold },
                            ]}
                          >
                            {type === 'debit' ? 'Expense' : 'Income'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {/* ── Category ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Category</Text>
              {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <View style={styles.categoryGrid}>
                    {TRANSACTION_CATEGORIES.map((cat) => {
                      const active = field.value === cat.id;
                      const Icon = cat.icon;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryChip,
                            active && {
                              backgroundColor: cat.color + '25',
                              borderColor: cat.color,
                            },
                          ]}
                          onPress={() => field.onChange(cat.id)}
                          activeOpacity={0.75}
                        >
                          <Icon size={14} color={active ? cat.color : colors.textMuted} />
                          <Text
                            style={[
                              styles.categoryChipText,
                              active && { color: cat.color, fontWeight: fontWeight.semibold },
                            ]}
                            numberOfLines={1}
                          >
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {/* ── Save button ── */}
            <TouchableOpacity
              style={[styles.saveBtn, isPending && styles.saveBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
              activeOpacity={0.8}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function makeStyles(colors: Colors) {
  return StyleSheet.create({
    keyboardView: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      maxHeight: '90%',
      paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: radius.full,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.text,
    },
    closeBtn: {
      padding: spacing.xs,
    },
    scrollContent: {
      padding: spacing.md,
      gap: spacing.md,
    },
    fieldGroup: {
      gap: spacing.xs,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.textSecondary,
    },
    optionalLabel: {
      fontWeight: fontWeight.regular,
      color: colors.textMuted,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      fontSize: fontSize.md,
      color: colors.text,
    },
    inputError: {
      borderColor: colors.red,
    },
    errorText: {
      fontSize: fontSize.xs,
      color: colors.red,
    },

    // Segmented type buttons
    segmentedRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: spacing.sm + 2,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    segmentText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.textSecondary,
    },

    // Category grid
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    categoryChip: {
      width: '31%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    categoryChipText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      flexShrink: 1,
    },

    // Save button
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.xl,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    saveBtnDisabled: {
      opacity: 0.6,
    },
    saveBtnText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: '#fff',
    },
  });
}
