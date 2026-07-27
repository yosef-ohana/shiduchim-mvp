import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Heebo_400Regular,
  Heebo_500Medium,
  Heebo_600SemiBold,
  Heebo_700Bold,
} from '@expo-google-fonts/heebo';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/tokens';
import { FoundationProbe } from './src/components/foundation/FoundationProbe';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
  });

  // App-ready loading gate: prevent blank infinite loop or protected route flash
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <StatusBar style="auto" />
      </View>
    );
  }

  // Controlled recoverable fallback if font loading encounters an unexpected error
  if (fontError) {
    console.warn('[App] Heebo font failed to load; proceeding with system fallback font.', fontError);
  }

  const showFoundationProbe =
    __DEV__ && process.env.EXPO_PUBLIC_SHOW_PROBE === 'true';

  if (showFoundationProbe) {
    return (
      <SafeAreaProvider>
        <FoundationProbe />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
