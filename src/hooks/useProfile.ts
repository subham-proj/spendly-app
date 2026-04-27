import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../constants/api';
import { QUERY_KEYS, CACHE } from '../constants/queryKeys';

export interface ProfileData {
  email: string;
  name: string | null;
  picture: string | null;
  memberSince: string;
  gmailConnected: boolean;
  lastSynced: string;
  preferences: {
    currency: string;
    notificationsEnabled: boolean;
    themeMode: string;
  };
}

export function useProfile() {
  const { token, signOut } = useAuth();

  return useQuery<ProfileData>({
    queryKey: QUERY_KEYS.profile(),
    queryFn: async () => {
      try {
        return await apiFetch<ProfileData>(API_ROUTES.ME, token!);
      } catch (err: any) {
        if (err.status === 401) signOut();
        throw err;
      }
    },
    enabled: !!token,
    staleTime: CACHE.STALE_LONG,
    gcTime:    CACHE.GC_LONG,
  });
}
