import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getRootOutcome } from '../utils/rootDecision';
import { AuthStack } from './AuthStack';
import { UserShellStack } from './user/UserShellStack';
import { AdminStack } from './staff/AdminStack';
import { EventManagerStack } from './staff/EventManagerStack';
import { theme } from '../theme/theme';

export const RootNavigator: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const outcome = getRootOutcome(user, loading);

  useEffect(() => {
    // If an authenticated session has an unknown/corrupt role, purge the session safely
    if (!loading && user && outcome === 'logged_out') {
      console.warn('[RootNavigator] Purging invalid/unknown role session safely.');
      logout();
    }
  }, [loading, user, outcome, logout]);

  if (outcome === 'restoring') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (outcome === 'logged_out') {
    return <AuthStack />;
  }

  if (outcome === 'USER') {
    return <UserShellStack />;
  }

  if (outcome === 'ADMIN') {
    return <AdminStack />;
  }

  if (outcome === 'EVENT_MANAGER') {
    return <EventManagerStack />;
  }


  // Safety fallback for any unknown authenticated state (fails closed)
  console.warn('[RootNavigator] Unknown role outcome encountered:', outcome);
  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
