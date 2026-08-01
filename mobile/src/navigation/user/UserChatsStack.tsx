import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserChatsStackParamList } from '../../types/navigation';
import { ChatsScreen } from '../../screens/chat/ChatsScreen';

const Stack = createNativeStackNavigator<UserChatsStackParamList>();

export const UserChatsStack: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Chats">
      <Stack.Screen name="Chats" component={ChatsScreen} options={{ title: 'שיחות' }} />
    </Stack.Navigator>
  );
};
