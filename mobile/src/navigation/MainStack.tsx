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
    <Stack.Navigator screenOptions={{ headerTitle: 'Shiduchim MVP' }}>
      <Stack.Screen name="Me" component={MeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="BasicProfile" component={BasicProfileScreen} options={{ title: 'Basic Profile' }} />
      <Stack.Screen name="FullProfile" component={FullProfileScreen} options={{ title: 'Full Profile' }} />
      <Stack.Screen name="Photos" component={PhotosScreen} options={{ title: 'My Photos' }} />
      <Stack.Screen name="JoinWedding" component={JoinWeddingScreen} options={{ title: 'Join Wedding' }} />
      <Stack.Screen name="MyWeddings" component={MyWeddingsScreen} options={{ title: 'My Weddings' }} />
      <Stack.Screen name="PoolSelection" component={PoolSelectionScreen} options={{ title: 'Select Pool' }} />
      <Stack.Screen name="Discover" component={DiscoverScreen} options={{ title: 'Candidates' }} />
      <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} options={{ title: 'Candidate Profile' }} />
      <Stack.Screen name="Lists" component={ListsScreen} options={{ title: 'My Lists' }} />
      <Stack.Screen name="Matches" component={MatchesScreen} options={{ title: 'My Matches' }} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} options={{ title: 'Match Details' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="Chats" component={ChatsScreen} options={{ title: 'Chats' }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Manage Users' }} />
      <Stack.Screen name="AdminWeddings" component={AdminWeddingsScreen} options={{ title: 'Manage Weddings' }} />
      <Stack.Screen name="AdminEventManagers" component={AdminEventManagersScreen} options={{ title: 'Event Managers' }} />
      <Stack.Screen name="CreateEventManager" component={CreateEventManagerScreen} options={{ title: 'New Event Manager' }} />
      <Stack.Screen name="EventManagerWeddings" component={EventManagerWeddingsScreen} options={{ title: 'My Weddings' }} />
      <Stack.Screen name="CreateWedding" component={CreateWeddingScreen} options={{ title: 'Create Wedding' }} />
      <Stack.Screen name="EventManagerWeddingDetails" component={EventManagerWeddingDetailsScreen} options={{ title: 'Wedding Details' }} />
      <Stack.Screen name="CreateAdminWedding" component={CreateAdminWeddingScreen} options={{ title: 'Create Admin Wedding' }} />
      <Stack.Screen name="AdminWeddingDetails" component={AdminWeddingDetailsScreen} options={{ title: 'Admin Wedding Details' }} />
    </Stack.Navigator>
  );
};



