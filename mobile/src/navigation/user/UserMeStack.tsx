import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserMeStackParamList } from '../../types/navigation';
import { MeScreen } from '../../screens/main/MeScreen';
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { BasicProfileScreen } from '../../screens/profile/BasicProfileScreen';
import { FullProfileScreen } from '../../screens/profile/FullProfileScreen';
import { PhotosScreen } from '../../screens/photos/PhotosScreen';
import { BlockedUsersScreen } from '../../screens/blocks/BlockedUsersScreen';
import { SendProductFeedbackScreen } from '../../screens/feedback/SendProductFeedbackScreen';
import { MyProductFeedbackScreen } from '../../screens/feedback/MyProductFeedbackScreen';

const Stack = createNativeStackNavigator<UserMeStackParamList>();

export const UserMeStack: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Me">
      <Stack.Screen name="Me" component={MeScreen} options={{ title: 'האזור האישי' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'פרופיל אישי' }} />
      <Stack.Screen name="BasicProfile" component={BasicProfileScreen} options={{ title: 'פרטים בסיסיים' }} />
      <Stack.Screen name="FullProfile" component={FullProfileScreen} options={{ title: 'פרופיל מלא' }} />
      <Stack.Screen name="Photos" component={PhotosScreen} options={{ title: 'ניהול תמונות' }} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} options={{ title: 'משתמשים חסומים' }} />
      <Stack.Screen name="SendProductFeedback" component={SendProductFeedbackScreen} options={{ title: 'משוב על המערכת' }} />
      <Stack.Screen name="MyProductFeedback" component={MyProductFeedbackScreen} options={{ title: 'המשובים שלי' }} />
    </Stack.Navigator>
  );
};
