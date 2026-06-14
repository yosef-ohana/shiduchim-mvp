import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/public/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { StaffLoginChoiceScreen } from '../screens/auth/StaffLoginChoiceScreen';
import { StaffLoginScreen } from '../screens/auth/StaffLoginScreen';
import { WeddingCodeEntryScreen } from '../screens/weddings/WeddingCodeEntryScreen';
import { theme } from '../theme/theme';

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'התחברות' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'הרשמה' }} />
      <Stack.Screen name="StaffLoginChoice" component={StaffLoginChoiceScreen} options={{ title: 'פורטל צוות' }} />
      <Stack.Screen name="StaffLogin" component={StaffLoginScreen} options={{ title: 'התחברות צוות' }} />
      <Stack.Screen name="WeddingCodeEntry" component={WeddingCodeEntryScreen} options={{ title: 'קוד חתונה' }} />
    </Stack.Navigator>
  );
};
