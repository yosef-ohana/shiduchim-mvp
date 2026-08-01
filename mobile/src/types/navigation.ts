import { NavigatorScreenParams } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/MainStack';

export type RootOutcome = 'restoring' | 'logged_out' | 'USER' | 'ADMIN' | 'EVENT_MANAGER';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: { pendingWeddingCode?: string } | undefined;
  Register: { pendingWeddingCode?: string } | undefined;
  StaffLoginChoice: undefined;
  StaffLogin: { expectedRole?: 'ADMIN' | 'EVENT_MANAGER' } | undefined;
  WeddingCodeEntry: { accessCode?: string; pendingWeddingCode?: string } | undefined;
};

export type AdminStackParamList = {
  AdminHome: undefined;
  AdminUsers: { focusUserId?: number } | undefined;
  AdminWeddings: undefined;
  AdminWeddingDetails: { weddingId: number };
  CreateAdminWedding: undefined;
  AdminOperations: undefined;
  AdminEventManagers: undefined;
  AdminEventManagerDetails: { managerId: number };
  CreateEventManager: undefined;
  AdminReports: undefined;
  AdminReportDetails: { reportId: number };
  AdminProductFeedback: undefined;
  AdminProductFeedbackDetails: { feedbackId: number };
  WeddingParticipants: {
    weddingId: number;
    mode: 'ADMIN' | 'EVENT_MANAGER';
    weddingName?: string;
    weddingStatus?: string;
  };
  StaffParticipantDetails: {
    userId: number;
    mode: 'ADMIN' | 'EVENT_MANAGER';
    weddingId?: number;
    weddingName?: string;
    weddingStatus?: string;
    source?:
      | 'ADMIN_USERS'
      | 'PARTICIPANTS'
      | 'ADMIN_REPORTS'
      | 'ADMIN_PRODUCT_FEEDBACK';
  };
};

export type EventManagerStackParamList = {
  EventManagerWeddings: undefined;
  CreateWedding: undefined;
  EventManagerWeddingDetails: { weddingId: number };
  WeddingParticipants: {
    weddingId: number;
    mode: 'ADMIN' | 'EVENT_MANAGER';
    weddingName?: string;
    weddingStatus?: string;
  };
  StaffParticipantDetails: {
    userId: number;
    mode: 'ADMIN' | 'EVENT_MANAGER';
    weddingId?: number;
    weddingName?: string;
    weddingStatus?: string;
    source?:
      | 'ADMIN_USERS'
      | 'PARTICIPANTS'
      | 'ADMIN_REPORTS'
      | 'ADMIN_PRODUCT_FEEDBACK';
  };
};

export type UserDiscoverStackParamList = {
  PoolSelection: undefined;
  Discover: MainStackParamList['Discover'];
};

export type UserConnectionsStackParamList = {
  ConnectionsHub: undefined;
};

export type UserChatsStackParamList = {
  Chats: undefined;
};

export type UserWeddingsStackParamList = {
  MyWeddings: undefined;
};

export type UserMeStackParamList = {
  Me: undefined;
};

export type UserTabsParamList = {
  DiscoverRoot: NavigatorScreenParams<UserDiscoverStackParamList> | undefined;
  ConnectionsRoot: NavigatorScreenParams<UserConnectionsStackParamList> | undefined;
  ChatsRoot: NavigatorScreenParams<UserChatsStackParamList> | undefined;
  WeddingsRoot: NavigatorScreenParams<UserWeddingsStackParamList> | undefined;
  MeRoot: NavigatorScreenParams<UserMeStackParamList> | undefined;
};

export type UserShellStackParamList = {
  UserTabs: NavigatorScreenParams<UserTabsParamList> | undefined;
  CandidateProfile: MainStackParamList['CandidateProfile'];
  Notifications: undefined;
  ReportUser: MainStackParamList['ReportUser'];
  Lists: undefined;
  OpeningMessages: undefined;
  OpeningConversationDetails: MainStackParamList['OpeningConversationDetails'];
  Matches: undefined;
  MatchDetails: MainStackParamList['MatchDetails'];
  Chat: MainStackParamList['Chat'];
  JoinWedding: MainStackParamList['JoinWedding'];
  Profile: MainStackParamList['Profile'];
  BasicProfile: MainStackParamList['BasicProfile'];
  FullProfile: MainStackParamList['FullProfile'];
  Photos: MainStackParamList['Photos'];
  BlockedUsers: undefined;
  SendProductFeedback: undefined;
  MyProductFeedback: MainStackParamList['MyProductFeedback'];
};

export type { MainStackParamList };

