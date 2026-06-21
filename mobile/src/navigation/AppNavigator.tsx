import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { theme } from '../theme/theme';

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  const linking = React.useMemo(() => ({
    prefixes: ['shiduchim://'],
    config: {
      screens: user
        ? { JoinWedding: 'join-wedding/:accessCode' }
        : { WeddingCodeEntry: 'join-wedding/:accessCode' },
    },
  }), [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
