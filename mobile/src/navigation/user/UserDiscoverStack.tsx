import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserDiscoverStackParamList } from '../../types/navigation';
import { PoolSelectionScreen } from '../../screens/discover/PoolSelectionScreen';
import { DiscoverScreen } from '../../screens/discover/DiscoverScreen';

const Stack = createNativeStackNavigator<UserDiscoverStackParamList>();

export const UserDiscoverStack: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="PoolSelection">
      <Stack.Screen name="PoolSelection" component={PoolSelectionScreen} options={{ title: 'בחירת מאגר' }} />
      <Stack.Screen name="Discover" component={DiscoverScreen} options={{ title: 'עיון בכרטיסים' }} />
    </Stack.Navigator>
  );
};
