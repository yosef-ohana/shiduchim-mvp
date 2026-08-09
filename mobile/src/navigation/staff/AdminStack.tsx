/**
 * AdminStack Component — Batch N3
 * Role-isolated navigation stack for canonical ADMIN role.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';
import { StaffHeader } from './StaffHeader';
import { StaffGuardedRoute } from './StaffGuardedRoute';
import { StaffNavigation } from './StaffNavigation';

// Target ADMIN Screens
import { AdminHomeScreen } from '../../screens/admin/AdminHomeScreen';
import { AdminOperationsScreen } from '../../screens/admin/AdminOperationsScreen';
import { AdminUsersScreen } from '../../screens/admin/AdminUsersScreen';
import { AdminWeddingsScreen } from '../../screens/admin/AdminWeddingsScreen';
import { AdminWeddingDetailsScreen } from '../../screens/admin/AdminWeddingDetailsScreen';
import { CreateAdminWeddingScreen } from '../../screens/admin/CreateAdminWeddingScreen';
import { AdminEventManagersScreen } from '../../screens/admin/AdminEventManagersScreen';
import { AdminEventManagerDetailsScreen } from '../../screens/admin/AdminEventManagerDetailsScreen';
import { CreateEventManagerScreen } from '../../screens/admin/CreateEventManagerScreen';
import { AdminReportsScreen } from '../../screens/admin/AdminReportsScreen';
import { AdminReportDetailsScreen } from '../../screens/admin/AdminReportDetailsScreen';
import { AdminProductFeedbackScreen } from '../../screens/admin/AdminProductFeedbackScreen';
import { AdminProductFeedbackDetailsScreen } from '../../screens/admin/AdminProductFeedbackDetailsScreen';

// Shared Staff Screens
import { WeddingParticipantsScreen } from '../../screens/weddings/WeddingParticipantsScreen';
import { StaffParticipantDetailsScreen } from '../../screens/weddings/StaffParticipantDetailsScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

// Guarded Shared Staff Route Components
const AdminWeddingParticipantsGuarded: React.FC = () => (
  <StaffGuardedRoute
    component={WeddingParticipantsScreen}
    expectedRole="ADMIN"
    routeName="WeddingParticipants"
  />
);

const AdminStaffParticipantDetailsGuarded: React.FC = () => (
  <StaffGuardedRoute
    component={StaffParticipantDetailsScreen}
    expectedRole="ADMIN"
    routeName="StaffParticipantDetails"
  />
);

export const AdminStack: React.FC = () => {
  return (
    <View style={styles.container}>
      <Stack.Navigator
        initialRouteName="AdminHome"
        screenOptions={({ navigation }) => ({
          header: ({ options, back }) => (
            <StaffHeader
              title={options.title || 'ניהול מערכת'}
              back={!!back}
              onBack={back ? () => navigation.goBack() : undefined}
            />
          ),
        })}
      >
        <Stack.Screen
          name="AdminHome"
          component={AdminHomeScreen}
          options={{ title: 'ניהול מערכת' }}
        />
        <Stack.Screen
          name="AdminUsers"
          component={AdminUsersScreen}
          options={{ title: 'ניהול משתמשים' }}
        />
        <Stack.Screen
          name="AdminWeddings"
          component={AdminWeddingsScreen}
          options={{ title: 'ניהול חתונות' }}
        />
        <Stack.Screen
          name="AdminWeddingDetails"
          component={AdminWeddingDetailsScreen}
          options={{ title: 'פרטי החתונה (מנהל)' }}
        />
        <Stack.Screen
          name="CreateAdminWedding"
          component={CreateAdminWeddingScreen}
          options={{ title: 'יצירת חתונה (מנהל)' }}
        />
        <Stack.Screen
          name="AdminOperations"
          component={AdminOperationsScreen}
          options={{ title: 'תפעול ומנהלי אירועים' }}
        />
        <Stack.Screen
          name="AdminEventManagers"
          component={AdminEventManagersScreen}
          options={{ title: 'מנהלי אירועים' }}
        />
        <Stack.Screen
          name="AdminEventManagerDetails"
          component={AdminEventManagerDetailsScreen}
          options={{ title: 'פרטי מנהל אירועים' }}
        />
        <Stack.Screen
          name="CreateEventManager"
          component={CreateEventManagerScreen}
          options={{ title: 'מנהל אירוע חדש' }}
        />
        <Stack.Screen
          name="AdminReports"
          component={AdminReportsScreen}
          options={{ title: 'ניהול דיווחים' }}
        />
        <Stack.Screen
          name="AdminReportDetails"
          component={AdminReportDetailsScreen}
          options={{ title: 'פרטי דיווח' }}
        />
        <Stack.Screen
          name="AdminProductFeedback"
          component={AdminProductFeedbackScreen}
          options={{ title: 'פניות מערכת' }}
        />
        <Stack.Screen
          name="AdminProductFeedbackDetails"
          component={AdminProductFeedbackDetailsScreen}
          options={{ title: 'פרטי פניה' }}
        />
        <Stack.Screen
          name="WeddingParticipants"
          component={AdminWeddingParticipantsGuarded}
          options={{ title: 'משתתפי החתונה' }}
        />
        <Stack.Screen
          name="StaffParticipantDetails"
          component={AdminStaffParticipantDetailsGuarded}
          options={{ title: 'פרטי משתתף' }}
        />
      </Stack.Navigator>
      <StaffNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
