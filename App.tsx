import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { PreferencesProvider } from './src/context/PreferencesContext';
import AppNavigator from './src/navigation/AppNavigator';
import { queryClient } from './src/lib/queryClient';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </PreferencesProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
