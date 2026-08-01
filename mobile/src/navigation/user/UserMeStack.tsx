import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserMeStackParamList } from '../../types/navigation';
import { MeScreen } from '../../screens/main/MeScreen';

const Stack = createNativeStackNavigator<UserMeStackParamList>();

export const UserMeStack: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Me">
      <Stack.Screen name="Me" component={MeScreen} options={{ title: 'האזור האישי' }} />
    </Stack.Navigator>
  );
};
