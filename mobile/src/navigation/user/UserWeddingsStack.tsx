import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserWeddingsStackParamList } from '../../types/navigation';
import { MyWeddingsScreen } from '../../screens/weddings/MyWeddingsScreen';
import { AppHeader } from '../../components/foundation/AppHeader';
import { IconButton } from '../../components/foundation/IconButton';

const Stack = createNativeStackNavigator<UserWeddingsStackParamList>();

export const UserWeddingsStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MyWeddings"
      screenOptions={({ navigation }) => ({
        header: ({ options, back }) => (
          <AppHeader
            title={options.title || 'החתונות שלי'}
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
      <Stack.Screen name="MyWeddings" component={MyWeddingsScreen} options={{ title: 'החתונות שלי' }} />
    </Stack.Navigator>
  );
};
