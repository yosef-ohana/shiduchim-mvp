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
import { AdminReportsScreen } from '../screens/admin/AdminReportsScreen';
import { AdminReportDetailsScreen } from '../screens/admin/AdminReportDetailsScreen';
import { ReportUserScreen } from '../screens/reports/ReportUserScreen';
import { BlockedUsersScreen } from '../screens/blocks/BlockedUsersScreen';
import { OpeningMessagesScreen } from '../screens/opening/OpeningMessagesScreen';
import { OpeningConversationDetailsScreen } from '../screens/opening/OpeningConversationDetailsScreen';
import { SendProductFeedbackScreen } from '../screens/feedback/SendProductFeedbackScreen';
import { AdminProductFeedbackScreen } from '../screens/admin/AdminProductFeedbackScreen';
import { AdminProductFeedbackDetailsScreen } from '../screens/admin/AdminProductFeedbackDetailsScreen';
import { WeddingParticipantsScreen } from '../screens/weddings/WeddingParticipantsScreen';
import { DiscoverPool, UserWeddingResponse } from '../types/api';

export type MainStackParamList = {
  Me: undefined;
  Profile: undefined;
  BasicProfile: {
    returnToWedding?: boolean;
    returnWeddingId?: number;
    returnWeddingSnapshot?: UserWeddingResponse;
    source?: 'weddingHub' | 'returnFlow';
  } | undefined;
  FullProfile: undefined;
  Photos: {
    returnToWedding?: boolean;
    returnWeddingId?: number;
    returnWeddingSnapshot?: UserWeddingResponse;
    source?: 'weddingHub' | 'returnFlow';
  } | undefined;
  JoinWedding: {
    accessCode?: string;
    weddingId?: number;
    weddingSnapshot?: UserWeddingResponse;
    source?: 'code' | 'deepLink' | 'myWeddings' | 'returnFlow';
  } | undefined;
  MyWeddings: undefined;
  PoolSelection: undefined;
  Discover: { pool: DiscoverPool; weddingId?: number };
  CandidateProfile: { userId: number };
  Lists: undefined;
  Matches: undefined;
  MatchDetails: { matchId: number };
  Chat: { matchId: number };
  Chats: undefined;
  AdminUsers: { focusUserId?: number } | undefined;
  AdminWeddings: undefined;
  AdminEventManagers: undefined;
  CreateEventManager: undefined;
  EventManagerWeddings: undefined;
  CreateWedding: undefined;
  EventManagerWeddingDetails: { weddingId: number };
  CreateAdminWedding: undefined;
  AdminWeddingDetails: { weddingId: number };
  WeddingParticipants: {
    weddingId: number;
    mode: 'ADMIN' | 'EVENT_MANAGER';
    weddingName?: string;
    weddingStatus?: string;
  };
  ReportUser: { userId: number };
  AdminReports: undefined;
  AdminReportDetails: { reportId: number };
  BlockedUsers: undefined;
  OpeningMessages: undefined;
  OpeningConversationDetails: { conversationId: number };
  SendProductFeedback: undefined;
  AdminProductFeedback: undefined;
  AdminProductFeedbackDetails: { feedbackId: number };
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
      <Stack.Screen name="WeddingParticipants" component={WeddingParticipantsScreen} options={{ title: 'משתתפי החתונה' }} />
      <Stack.Screen name="ReportUser" component={ReportUserScreen} options={{ title: 'דיווח על משתמש' }} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: 'ניהול דיווחים' }} />
      <Stack.Screen name="AdminReportDetails" component={AdminReportDetailsScreen} options={{ title: 'פרטי דיווח' }} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} options={{ title: 'משתמשים חסומים' }} />
      <Stack.Screen name="OpeningMessages" component={OpeningMessagesScreen} options={{ title: 'הודעות פתיחה' }} />
      <Stack.Screen name="OpeningConversationDetails" component={OpeningConversationDetailsScreen} options={{ title: 'שיחה' }} />
      <Stack.Screen name="SendProductFeedback" component={SendProductFeedbackScreen} options={{ title: 'שליחת משוב' }} />
      <Stack.Screen name="AdminProductFeedback" component={AdminProductFeedbackScreen} options={{ title: 'פניות מערכת' }} />
      <Stack.Screen name="AdminProductFeedbackDetails" component={AdminProductFeedbackDetailsScreen} options={{ title: 'פרטי פניה' }} />
    </Stack.Navigator>
  );
};



