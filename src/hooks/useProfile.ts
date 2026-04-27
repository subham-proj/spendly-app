import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

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
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        return await apiFetch<ProfileData>('/api/users/me', token!);
      } catch (err: any) {
        if (err.status === 401) signOut();
        throw err;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
  });
}
