import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeScreen } from '../screens/main/MeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { BasicProfileScreen } from '../screens/profile/BasicProfileScreen';
import { FullProfileScreen } from '../screens/profile/FullProfileScreen';
import { PhotosScreen } from '../screens/photos/PhotosScreen';
import { JoinWeddingScreen } from '../screens/weddings/JoinWeddingScreen';
import { MyWeddingsScreen } from '../screens/weddings/MyWeddingsScreen';
import { PoolSelectionScreen } from '../screens/discover/PoolSelectionScreen';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { CandidateProfileScreen } from '../screens/discover/CandidateProfileScreen';
import { ListsScreen } from '../screens/lists/ListsScreen';
import { MatchesScreen } from '../screens/matches/MatchesScreen';
import { MatchDetailsScreen } from '../screens/matches/MatchDetailsScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { ChatsScreen } from '../screens/chat/ChatsScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { AdminWeddingsScreen } from '../screens/admin/AdminWeddingsScreen';
import { AdminEventManagersScreen } from '../screens/admin/AdminEventManagersScreen';
import { CreateEventManagerScreen } from '../screens/admin/CreateEventManagerScreen';
import { EventManagerWeddingsScreen } from '../screens/eventManager/EventManagerWeddingsScreen';
import { CreateWeddingScreen } from '../screens/eventManager/CreateWeddingScreen';
import { EventManagerWeddingDetailsScreen } from '../screens/eventManager/EventManagerWeddingDetailsScreen';
import { CreateAdminWeddingScreen } from '../screens/admin/CreateAdminWeddingScreen';
import { AdminWeddingDetailsScreen } from '../screens/admin/AdminWeddingDetailsScreen';
import { DiscoverPool } from '../types/api';

export type MainStackParamList = {
  Me: undefined;
  Profile: undefined;
  BasicProfile: undefined;
  FullProfile: undefined;
  Photos: undefined;
  JoinWedding: undefined;
  MyWeddings: undefined;
  PoolSelection: undefined;
  Discover: { pool: DiscoverPool; weddingId?: number };
  CandidateProfile: { userId: number };
  Lists: undefined;
  Matches: undefined;
  MatchDetails: { matchId: number };
  Chat: { matchId: number };
  Chats: undefined;
  AdminUsers: undefined;
  AdminWeddings: undefined;
  AdminEventManagers: undefined;
  CreateEventManager: undefined;
  EventManagerWeddings: undefined;
  CreateWedding: undefined;
  EventManagerWeddingDetails: { weddingId: number };
  CreateAdminWedding: undefined;
  AdminWeddingDetails: { weddingId: number };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerTitle: 'שידוכים MVP' }}>
      <Stack.Screen name="Me" component={MeScreen} options={{ title: 'האזור שלי' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'הפרופיל שלי' }} />
      <Stack.Screen name="BasicProfile" component={BasicProfileScreen} options={{ title: 'פרופיל בסיסי' }} />
      <Stack.Screen name="FullProfile" component={FullProfileScreen} options={{ title: 'פרופיל מלא' }} />
      <Stack.Screen name="Photos" component={PhotosScreen} options={{ title: 'התמונות שלי' }} />
      <Stack.Screen name="JoinWedding" component={JoinWeddingScreen} options={{ title: 'הצטרפות לחתונה' }} />
      <Stack.Screen name="MyWeddings" component={MyWeddingsScreen} options={{ title: 'החתונות שלי' }} />
      <Stack.Screen name="PoolSelection" component={PoolSelectionScreen} options={{ title: 'בחירת מאגר' }} />
      <Stack.Screen name="Discover" component={DiscoverScreen} options={{ title: 'מועמדים' }} />
      <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} options={{ title: 'פרופיל מועמד' }} />
      <Stack.Screen name="Lists" component={ListsScreen} options={{ title: 'הרשימות שלי' }} />
      <Stack.Screen name="Matches" component={MatchesScreen} options={{ title: 'ההתאמות שלי' }} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} options={{ title: 'פרטי השידוך' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'צ׳אט' }} />
      <Stack.Screen name="Chats" component={ChatsScreen} options={{ title: 'צ׳אטים' }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'ניהול משתמשים' }} />
      <Stack.Screen name="AdminWeddings" component={AdminWeddingsScreen} options={{ title: 'ניהול חתונות' }} />
      <Stack.Screen name="AdminEventManagers" component={AdminEventManagersScreen} options={{ title: 'מנהלי אירועים' }} />
      <Stack.Screen name="CreateEventManager" component={CreateEventManagerScreen} options={{ title: 'מנהל אירוע חדש' }} />
      <Stack.Screen name="EventManagerWeddings" component={EventManagerWeddingsScreen} options={{ title: 'החתונות שלי' }} />
      <Stack.Screen name="CreateWedding" component={CreateWeddingScreen} options={{ title: 'יצירת חתונה' }} />
      <Stack.Screen name="EventManagerWeddingDetails" component={EventManagerWeddingDetailsScreen} options={{ title: 'פרטי החתונה' }} />
      <Stack.Screen name="CreateAdminWedding" component={CreateAdminWeddingScreen} options={{ title: 'יצירת חתונה (מנהל)' }} />
      <Stack.Screen name="AdminWeddingDetails" component={AdminWeddingDetailsScreen} options={{ title: 'פרטי החתונה (מנהל)' }} />
    </Stack.Navigator>
  );
};



