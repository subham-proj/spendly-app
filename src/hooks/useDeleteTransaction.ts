import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../constants/api';
import { QUERY_KEYS } from '../constants/queryKeys';

export function useDeleteTransaction() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ message: string }>(
        API_ROUTES.TRANSACTION(id),
        token!,
        { method: 'DELETE' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactionsBase() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recentTransactionsBase() });
    },
  });
}
