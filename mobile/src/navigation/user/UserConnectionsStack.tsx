import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserConnectionsStackParamList } from '../../types/navigation';
import { ConnectionsHubScreen } from '../../screens/connections/ConnectionsHubScreen';

const Stack = createNativeStackNavigator<UserConnectionsStackParamList>();

/**
 * ConnectionsRoot Stack Navigator — Batch R3-N1A
 * Initial route: ConnectionsHub (Three-domain Hub).
 * Deep routes are owned by UserShellStack.
 */
export const UserConnectionsStack: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="ConnectionsHub">
      <Stack.Screen name="ConnectionsHub" component={ConnectionsHubScreen} options={{ title: 'קשרים' }} />
    </Stack.Navigator>
  );
};
