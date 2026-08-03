import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserChatsStackParamList } from '../../types/navigation';
import { ChatsScreen } from '../../screens/chat/ChatsScreen';
import { AppHeader } from '../../components/foundation/AppHeader';
import { IconButton } from '../../components/foundation/IconButton';

const Stack = createNativeStackNavigator<UserChatsStackParamList>();

export const UserChatsStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Chats"
      screenOptions={({ navigation }) => ({
        header: ({ options, back }) => (
          <AppHeader
            title={options.title || 'שיחות'}
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
      <Stack.Screen name="Chats" component={ChatsScreen} options={{ title: 'שיחות' }} />
    </Stack.Navigator>
  );
};
