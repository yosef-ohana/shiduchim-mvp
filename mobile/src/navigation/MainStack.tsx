import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeScreen } from '../screens/main/MeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { BasicProfileScreen } from '../screens/profile/BasicProfileScreen';
import { FullProfileScreen } from '../screens/profile/FullProfileScreen';
import { PhotosScreen } from '../screens/photos/PhotosScreen';
import { JoinWeddingScreen } from '../screens/weddings/JoinWeddingScreen';
import { PoolSelectionScreen } from '../screens/discover/PoolSelectionScreen';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { CandidateProfileScreen } from '../screens/discover/CandidateProfileScreen';
import { ListsScreen } from '../screens/lists/ListsScreen';
import { MatchesScreen } from '../screens/matches/MatchesScreen';
import { MatchDetailsScreen } from '../screens/matches/MatchDetailsScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { DiscoverPool } from '../types/api';

export type MainStackParamList = {
  Me: undefined;
  Profile: undefined;
  BasicProfile: undefined;
  FullProfile: undefined;
  Photos: undefined;
  JoinWedding: undefined;
  PoolSelection: undefined;
  Discover: { pool: DiscoverPool; weddingId?: number };
  CandidateProfile: { userId: number };
  Lists: undefined;
  Matches: undefined;
  MatchDetails: { matchId: number };
  Chat: { matchId: number };
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
      <Stack.Screen name="PoolSelection" component={PoolSelectionScreen} options={{ title: 'Select Pool' }} />
      <Stack.Screen name="Discover" component={DiscoverScreen} options={{ title: 'Candidates' }} />
      <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} options={{ title: 'Candidate Profile' }} />
      <Stack.Screen name="Lists" component={ListsScreen} options={{ title: 'My Lists' }} />
      <Stack.Screen name="Matches" component={MatchesScreen} options={{ title: 'My Matches' }} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} options={{ title: 'Match Details' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
    </Stack.Navigator>
  );
};



