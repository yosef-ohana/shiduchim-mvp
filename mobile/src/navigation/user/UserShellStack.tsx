import React, { useEffect } from 'react';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { UserShellStackParamList } from '../../types/navigation';
import { UserTabs } from './UserTabs';
import { CandidateProfileScreen } from '../../screens/discover/CandidateProfileScreen';
import { NotificationsScreen } from '../../screens/notifications/NotificationsScreen';
import { ReportUserScreen } from '../../screens/reports/ReportUserScreen';
import { ListsScreen } from '../../screens/lists/ListsScreen';
import { OpeningMessagesScreen } from '../../screens/opening/OpeningMessagesScreen';
import { OpeningConversationDetailsScreen } from '../../screens/opening/OpeningConversationDetailsScreen';
import { MatchesScreen } from '../../screens/matches/MatchesScreen';
import { MatchDetailsScreen } from '../../screens/matches/MatchDetailsScreen';
import { ChatScreen } from '../../screens/chat/ChatScreen';
import { JoinWeddingScreen } from '../../screens/weddings/JoinWeddingScreen';
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { BasicProfileScreen } from '../../screens/profile/BasicProfileScreen';
import { FullProfileScreen } from '../../screens/profile/FullProfileScreen';
import { PhotosScreen } from '../../screens/photos/PhotosScreen';
import { BlockedUsersScreen } from '../../screens/blocks/BlockedUsersScreen';
import { SendProductFeedbackScreen } from '../../screens/feedback/SendProductFeedbackScreen';
import { MyProductFeedbackScreen } from '../../screens/feedback/MyProductFeedbackScreen';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/foundation/AppHeader';
import { IconButton } from '../../components/foundation/IconButton';

const Stack = createNativeStackNavigator<UserShellStackParamList>();

export const UserShellStack: React.FC = () => {
  const { user, justRegistered, consumeJustRegistered, claimPendingWeddingCode } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<UserShellStackParamList>>();

  useEffect(() => {
    if (justRegistered && user?.role === 'USER') {
      consumeJustRegistered();
      // Post-registration Profile intent for newly registered USER
      navigation.navigate('Profile');
    }
  }, [justRegistered, user, consumeJustRegistered, navigation]);

  useEffect(() => {
    if (user?.role === 'USER') {
      const pendingCode = claimPendingWeddingCode();
      if (pendingCode) {
        // Authenticated USER wedding deep-link / accessCode intent
        navigation.navigate('JoinWedding', { accessCode: pendingCode });
      }
    }
  }, [user, claimPendingWeddingCode, navigation]);

  return (
    <Stack.Navigator
      initialRouteName="UserTabs"
      screenOptions={({ navigation, route }) => ({
        header: ({ options, back }) => (
          <AppHeader
            title={options.title || 'שידוכים MVP'}
            back={!!back}
            onBack={back ? () => navigation.goBack() : undefined}
          />
        ),
      })}
    >
      <Stack.Screen
        name="UserTabs"
        component={UserTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CandidateProfile"
        component={CandidateProfileScreen}
        options={{ title: 'פרופיל מועמד' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'התראות' }}
      />
      <Stack.Screen
        name="ReportUser"
        component={ReportUserScreen}
        options={{ title: 'דיווח על משתמש' }}
      />
      <Stack.Screen
        name="Lists"
        component={ListsScreen}
        options={{ title: 'הרשימות שלי' }}
      />
      <Stack.Screen
        name="OpeningMessages"
        component={OpeningMessagesScreen}
        options={{ title: 'פניות ושיחות' }}
      />
      <Stack.Screen
        name="OpeningConversationDetails"
        component={OpeningConversationDetailsScreen}
        options={{ title: 'שיחה' }}
      />
      <Stack.Screen
        name="Matches"
        component={MatchesScreen}
        options={{ title: 'ההצעות שלי' }}
      />
      <Stack.Screen
        name="MatchDetails"
        component={MatchDetailsScreen}
        options={{ title: 'פרטי הצעה' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'צ׳אט' }}
      />
      <Stack.Screen
        name="JoinWedding"
        component={JoinWeddingScreen}
        options={{ title: 'הצטרפות לחתונה' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'פרופיל אישי' }}
      />
      <Stack.Screen
        name="BasicProfile"
        component={BasicProfileScreen}
        options={{ title: 'פרטים בסיסיים' }}
      />
      <Stack.Screen
        name="FullProfile"
        component={FullProfileScreen}
        options={{ title: 'פרופיל מלא' }}
      />
      <Stack.Screen
        name="Photos"
        component={PhotosScreen}
        options={{ title: 'ניהול תמונות' }}
      />
      <Stack.Screen
        name="BlockedUsers"
        component={BlockedUsersScreen}
        options={{ title: 'משתמשים חסומים' }}
      />
      <Stack.Screen
        name="SendProductFeedback"
        component={SendProductFeedbackScreen}
        options={{ title: 'משוב על המערכת' }}
      />
      <Stack.Screen
        name="MyProductFeedback"
        component={MyProductFeedbackScreen}
        options={{ title: 'המשובים שלי' }}
      />
    </Stack.Navigator>
  );
};
