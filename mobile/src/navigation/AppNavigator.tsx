import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { RootNavigator } from './RootNavigator';
import { getLinkingConfig } from './linking';

export const AppNavigator = () => {
  const { user } = useAuth();
  const linking = React.useMemo(() => getLinkingConfig(user), [user]);

  return (
    <NavigationContainer linking={linking}>
      <RootNavigator />
    </NavigationContainer>
  );
};
