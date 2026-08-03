import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserDiscoverStackParamList } from '../../types/navigation';
import { PoolSelectionScreen } from '../../screens/discover/PoolSelectionScreen';
import { DiscoverScreen } from '../../screens/discover/DiscoverScreen';
import { AppHeader } from '../../components/foundation/AppHeader';
import { IconButton } from '../../components/foundation/IconButton';

const Stack = createNativeStackNavigator<UserDiscoverStackParamList>();

export const UserDiscoverStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PoolSelection"
      screenOptions={({ navigation }) => ({
        header: ({ options }) => (
          <AppHeader
            title={options.title || 'גילוי מועמדים'}
            back={false}
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
      <Stack.Screen name="PoolSelection" component={PoolSelectionScreen} options={{ title: 'בחירת מאגר' }} />
      <Stack.Screen name="Discover" component={DiscoverScreen} options={{ title: 'גילוי מועמדים' }} />
    </Stack.Navigator>
  );
};
