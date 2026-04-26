import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

const JWT_KEY = 'spendly_jwt';

// DEV: ngrok tunnel — update this URL when ngrok restarts
// PROD: replace with your deployed backend URL
const API_BASE = 'https://ebaf-49-205-200-47.ngrok-free.app';

interface AuthUser {
  email: string;
  _id: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved token on app start
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(JWT_KEY);
        if (saved) {
          setToken(saved);
        }
      } catch (e) {
        console.warn('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Listen for deep link: spendly://auth/callback?token=JWT
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleDeepLink = async (event: { url: string }) => {
    const url = event.url;
    if (!url.includes('auth/callback')) return;

    const { queryParams } = Linking.parse(url);

    // Handle error from backend
    if (queryParams?.error) {
      console.error('OAuth error from backend:', queryParams.error);
      return;
    }

    const jwt = queryParams?.token as string | undefined;
    if (!jwt) return;

    try {
      await SecureStore.setItemAsync(JWT_KEY, jwt);
      setToken(jwt);
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Ask backend for the Google auth URL (uses mobileOAuth2Client)
      const res = await fetch(`${API_BASE}/api/users/auth/mobile-url`);
      const { authUrl } = await res.json();

      // openAuthSessionAsync intercepts the deep link redirect itself and
      // returns the URL — Linking.addEventListener does NOT fire for this.
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'spendly://auth/callback',
      );

      if (result.type === 'success' && result.url) {
        await handleDeepLink({ url: result.url });
      }
    } catch (e) {
      console.error('Sign in error', e);
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(JWT_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
