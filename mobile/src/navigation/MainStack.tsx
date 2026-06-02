import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeScreen } from '../screens/main/MeScreen';

const Stack = createNativeStackNavigator();

export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerTitle: 'Shiduchim MVP' }}>
      <Stack.Screen name="Me" component={MeScreen} />
    </Stack.Navigator>
  );
};
