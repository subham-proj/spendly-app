import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiFetch } from '../lib/api';

// Show alerts and play sound when a push arrives while the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications(token: string | null) {
  useEffect(() => {
    if (!token) return;
    registerAndSendToken(token);
  }, [token]);
}

async function registerAndSendToken(authToken: string) {
  // Push tokens only work on physical devices
  if (!Device.isDevice) {
    console.log('[Push] Skipping push registration — not a physical device');
    return;
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission denied — push notifications disabled');
    return;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    if (!projectId) {
      console.warn('[Push] No projectId in app.json extra.eas — skipping push token registration');
      return;
    }

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[Push] Expo push token:', expoPushToken);

    // Send token to the backend so the server can send notifications to this device
    await apiFetch('/api/users/preferences', authToken, {
      method: 'PATCH',
      body: JSON.stringify({ expoPushToken }),
    });
    console.log('[Push] Push token registered with server');
  } catch (err) {
    console.warn('[Push] Failed to register push token:', (err as Error).message);
  }
}
