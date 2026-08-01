import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserWeddingsStackParamList } from '../../types/navigation';
import { MyWeddingsScreen } from '../../screens/weddings/MyWeddingsScreen';

const Stack = createNativeStackNavigator<UserWeddingsStackParamList>();

export const UserWeddingsStack: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="MyWeddings">
      <Stack.Screen name="MyWeddings" component={MyWeddingsScreen} options={{ title: 'החתונות שלי' }} />
    </Stack.Navigator>
  );
};
