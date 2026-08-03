import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserConnectionsStackParamList } from '../../types/navigation';
import { ConnectionsHubScreen } from '../../screens/connections/ConnectionsHubScreen';
import { AppHeader } from '../../components/foundation/AppHeader';
import { IconButton } from '../../components/foundation/IconButton';

const Stack = createNativeStackNavigator<UserConnectionsStackParamList>();

/**
 * ConnectionsRoot Stack Navigator — Batch R3-N1A
 * Initial route: ConnectionsHub (Three-domain Hub).
 * Deep routes are owned by UserShellStack.
 */
export const UserConnectionsStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ConnectionsHub"
      screenOptions={({ navigation }) => ({
        header: ({ options, back }) => (
          <AppHeader
            title={options.title || 'קשרים'}
            back={!!back}
            onBack={back ? () => navigation.goBack() : undefined}
            trailingActions={
              <IconButton
                icon="notifications"
                onPress={() => ((navigation as any).getParent()?.getParent() || (navigation as any).getParent())?.navigate('Notifications')}
                accessibilityLabel="התראות"
                variant="header"
                testID="header-notifications-button"
              />
            }
          />
        ),
      })}
    >
      <Stack.Screen name="ConnectionsHub" component={ConnectionsHubScreen} options={{ title: 'קשרים' }} />
    </Stack.Navigator>
  );
};
