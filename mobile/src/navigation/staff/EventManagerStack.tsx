/**
 * EventManagerStack Component — Batch N3
 * Role-isolated navigation stack for canonical EVENT_MANAGER role.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventManagerStackParamList } from '../../types/navigation';
import { StaffHeader } from './StaffHeader';
import { StaffGuardedRoute } from './StaffGuardedRoute';

// Target EVENT_MANAGER Screens
import { EventManagerWeddingsScreen } from '../../screens/eventManager/EventManagerWeddingsScreen';
import { CreateWeddingScreen } from '../../screens/eventManager/CreateWeddingScreen';
import { EventManagerWeddingDetailsScreen } from '../../screens/eventManager/EventManagerWeddingDetailsScreen';

// Shared Staff Screens
import { WeddingParticipantsScreen } from '../../screens/weddings/WeddingParticipantsScreen';
import { StaffParticipantDetailsScreen } from '../../screens/weddings/StaffParticipantDetailsScreen';

const Stack = createNativeStackNavigator<EventManagerStackParamList>();

// Guarded Shared Staff Route Components
const EMWeddingParticipantsGuarded: React.FC = () => (
  <StaffGuardedRoute
    component={WeddingParticipantsScreen}
    expectedRole="EVENT_MANAGER"
    routeName="WeddingParticipants"
  />
);

const EMStaffParticipantDetailsGuarded: React.FC = () => (
  <StaffGuardedRoute
    component={StaffParticipantDetailsScreen}
    expectedRole="EVENT_MANAGER"
    routeName="StaffParticipantDetails"
  />
);

export const EventManagerStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="EventManagerWeddings"
      screenOptions={({ navigation }) => ({
        header: ({ options, back }) => (
          <StaffHeader
            title={options.title || 'החתונות שלי'}
            back={!!back}
            onBack={back ? () => navigation.goBack() : undefined}
          />
        ),
      })}
    >
      <Stack.Screen
        name="EventManagerWeddings"
        component={EventManagerWeddingsScreen}
        options={{ title: 'החתונות שלי' }}
      />
      <Stack.Screen
        name="CreateWedding"
        component={CreateWeddingScreen}
        options={{ title: 'יצירת חתונה' }}
      />
      <Stack.Screen
        name="EventManagerWeddingDetails"
        component={EventManagerWeddingDetailsScreen}
        options={{ title: 'פרטי החתונה' }}
      />
      <Stack.Screen
        name="WeddingParticipants"
        component={EMWeddingParticipantsGuarded}
        options={{ title: 'משתתפי החתונה' }}
      />
      <Stack.Screen
        name="StaffParticipantDetails"
        component={EMStaffParticipantDetailsGuarded}
        options={{ title: 'פרטי משתתף' }}
      />
    </Stack.Navigator>
  );
};
