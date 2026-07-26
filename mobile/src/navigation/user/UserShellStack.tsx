import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { UserShellStackParamList } from '../../types/navigation';
import { UserTabs } from './UserTabs';
import { CandidateProfileScreen } from '../../screens/discover/CandidateProfileScreen';
import { NotificationsScreen } from '../../screens/notifications/NotificationsScreen';
import { ReportUserScreen } from '../../screens/reports/ReportUserScreen';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/foundation/AppHeader';
import { IconButton } from '../../components/foundation/IconButton';

const Stack = createNativeStackNavigator<UserShellStackParamList>();

export const UserShellStack: React.FC = () => {
  const { user, justRegistered, consumeJustRegistered, claimPendingWeddingCode } = useAuth();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (justRegistered && user?.role === 'USER') {
      consumeJustRegistered();
      // Post-registration Profile intent for newly registered USER
      navigation.navigate('MeRoot', { screen: 'Profile' });
    }
  }, [justRegistered, user, consumeJustRegistered, navigation]);

  useEffect(() => {
    if (user?.role === 'USER') {
      const pendingCode = claimPendingWeddingCode();
      if (pendingCode) {
        // Authenticated USER wedding deep-link / accessCode intent
        navigation.navigate('WeddingsRoot', {
          screen: 'JoinWedding',
          params: { accessCode: pendingCode },
        });
      }
    }
  }, [user, claimPendingWeddingCode, navigation]);

  return (
    <Stack.Navigator
      initialRouteName="UserTabs"
      screenOptions={({ navigation, route }) => ({
        header: ({ options, back }) => (
          <AppHeader
            title={options.title || 'שידוכים MVP'}
            back={!!back}
            onBack={back ? () => navigation.goBack() : undefined}
            trailingActions={
              route.name === 'UserTabs' ? (
                <IconButton
                  icon="notifications"
                  onPress={() => navigation.navigate('Notifications')}
                  accessibilityLabel="התראות"
                  variant="header"
                  testID="header-notifications-button"
                />
              ) : undefined
            }
          />
        ),
      })}
    >
      <Stack.Screen
        name="UserTabs"
        component={UserTabs}
        options={{ title: 'שידוכים MVP' }}
      />
      <Stack.Screen
        name="CandidateProfile"
        component={CandidateProfileScreen}
        options={{ title: 'פרופיל מועמד' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'התראות' }}
      />
      <Stack.Screen
        name="ReportUser"
        component={ReportUserScreen}
        options={{ title: 'דיווח על משתמש' }}
      />
    </Stack.Navigator>
  );
};
