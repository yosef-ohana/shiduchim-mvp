import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeScreen } from '../screens/main/MeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { BasicProfileScreen } from '../screens/profile/BasicProfileScreen';
import { FullProfileScreen } from '../screens/profile/FullProfileScreen';

const Stack = createNativeStackNavigator();

export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerTitle: 'Shiduchim MVP' }}>
      <Stack.Screen name="Me" component={MeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="BasicProfile" component={BasicProfileScreen} options={{ title: 'Basic Profile' }} />
      <Stack.Screen name="FullProfile" component={FullProfileScreen} options={{ title: 'Full Profile' }} />
    </Stack.Navigator>
  );
};

