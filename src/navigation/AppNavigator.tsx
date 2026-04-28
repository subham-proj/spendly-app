import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  LayoutDashboard,
  List,
  TrendingUp,
  Settings,
  ChevronLeft,
} from "lucide-react-native";

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";
import { useProfile } from "../hooks/useProfile";
import { usePushNotifications } from "../hooks/usePushNotifications";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import InsightsScreen from "../screens/InsightsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ManageTransactionsScreen from "../screens/ManageTransactionsScreen";
import { fontSize, fontWeight } from "../constants/theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator<{
  SettingsHome: undefined;
  ManageTransactions: undefined;
}>();

function SettingsNavigator() {
  const { colors } = usePreferences();
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: fontWeight.semibold,
          fontSize: fontSize.md,
        },
      }}
    >
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="ManageTransactions"
        component={ManageTransactionsScreen}
        options={({ navigation }) => ({
          title: "Manage Transactions",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center" }}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
    </SettingsStack.Navigator>
  );
}

function MainTabs() {
  const { colors } = usePreferences();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Invisible component — runs side effects after login: syncs server prefs + registers push token
function PreferencesSync({ token }: { token: string }) {
  const { syncFromServer } = usePreferences();
  const { data: profile } = useProfile();
  usePushNotifications(token);

  useEffect(() => {
    if (profile?.preferences) {
      syncFromServer(profile.preferences);
    }
  }, [profile?.preferences?.currency, profile?.preferences?.notificationsEnabled, profile?.preferences?.themeMode]);

  return null;
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();
  const { colors, isDark } = usePreferences();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? "light" : "dark"} />
      {token ? (
        <>
          <MainTabs />
          <PreferencesSync token={token} />
        </>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
