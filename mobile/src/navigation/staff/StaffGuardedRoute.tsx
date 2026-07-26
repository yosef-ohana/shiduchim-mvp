/**
 * StaffGuardedRoute Component — Batch N3
 * Centralized navigation guard wrapper for shared staff routes (WeddingParticipants & StaffParticipantDetails).
 * Validates role, mode, and source before mounting protected screen components.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';

export interface StaffGuardedRouteProps {
  component: React.ComponentType<any>;
  expectedRole: 'ADMIN' | 'EVENT_MANAGER';
  routeName: 'WeddingParticipants' | 'StaffParticipantDetails';
}

const ADMIN_ONLY_SOURCES = new Set([
  'ADMIN_USERS',
  'ADMIN_REPORTS',
  'ADMIN_PRODUCT_FEEDBACK',
]);

export const StaffGuardedRoute: React.FC<StaffGuardedRouteProps> = ({
  component: Component,
  expectedRole,
  routeName,
}) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const currentRole = user?.role;
  const params = route.params || {};
  const mode = params.mode;
  const source = params.source;

  let isValid = true;

  // 1. Session Role vs Expected Shell Role Check
  if (currentRole !== expectedRole) {
    isValid = false;
  }

  // 2. Route Mode Check
  if (mode !== expectedRole) {
    isValid = false;
  }

  // 3. Route Source Check for StaffParticipantDetails
  if (routeName === 'StaffParticipantDetails') {
    if (expectedRole === 'EVENT_MANAGER' && source && ADMIN_ONLY_SOURCES.has(source)) {
      isValid = false;
    }
  }

  if (!isValid) {
    return (
      <Screen>
        <View style={styles.deniedContainer} testID="staff-access-denied-screen">
          <Text style={styles.deniedTitle}>אין הרשאת גישה</Text>
          <Text style={styles.deniedMessage}>
            אין הרשאה לצפות בתוכן זה בקשר שגוי.
          </Text>
          <AppButton
            title="חזרה"
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}
            style={styles.backButton}
            testID="staff-access-denied-back-button"
          />
        </View>
      </Screen>
    );
  }

  // Render target protected component only when strictly valid
  return <Component />;
};

const styles = StyleSheet.create({
  deniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.error || '#D32F2F',
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  deniedMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  backButton: {
    minWidth: 160,
  },
});
