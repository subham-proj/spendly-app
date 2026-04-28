import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../constants/api';
import { QUERY_KEYS } from '../constants/queryKeys';

export interface UpdateTransactionPayload {
  amount?: number;
  merchant?: string;
  shortName?: string;
  category?: string;
  transactionType?: 'debit' | 'credit';
}

export function useUpdateTransaction() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionPayload }) =>
      apiFetch<{ transaction: unknown }>(
        API_ROUTES.TRANSACTION(id),
        token!,
        { method: 'PATCH', body: JSON.stringify(data) },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactionsBase() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recentTransactionsBase() });
    },
  });
}
