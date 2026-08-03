import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserMeStackParamList } from '../../types/navigation';
import { MeScreen } from '../../screens/main/MeScreen';
import { AppHeader } from '../../components/foundation/AppHeader';
import { IconButton } from '../../components/foundation/IconButton';

const Stack = createNativeStackNavigator<UserMeStackParamList>();

export const UserMeStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Me"
      screenOptions={({ navigation }) => ({
        header: ({ options, back }) => (
          <AppHeader
            title={options.title || 'אני'}
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
      <Stack.Screen name="Me" component={MeScreen} options={{ title: 'אני' }} />
    </Stack.Navigator>
  );
};
