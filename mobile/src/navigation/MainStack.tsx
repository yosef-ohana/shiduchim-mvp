import type { DiscoverPool, UserWeddingResponse, CandidateProfileSourceType, PoolType } from '../types/api';

export type MainStackParamList = {
  Me: undefined;
  Profile: {
    focusSection?: 'profile' | 'photos' | 'full';
    intent?:
      | 'onboarding_basic'
      | 'onboarding_full'
      | 'complete_full'
      | 'repair_full'
      | 'view';
  } | undefined;
  BasicProfile: {
    returnToWedding?: boolean;
    returnWeddingId?: number;
    returnWeddingSnapshot?: UserWeddingResponse;
    source?: 'weddingHub' | 'returnFlow';
    continueToFullAfterBasic?: boolean;
    returnToProfile?: boolean;
  } | undefined;
  FullProfile: {
    continueToPhotosAfterFull?: boolean;
  } | undefined;
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
  CandidateProfile: {
    userId: number;
    sourceContext?: 'OPENING_LIST' | 'OPENING_DETAILS';
    contextLabel?: string;
    sourceType?: CandidateProfileSourceType;
    sourceId?: number;
    poolType?: PoolType;
    weddingId?: number;
  };
  Lists: undefined;
  Matches: undefined;
  MatchDetails: { matchId: number };
  Chat: { matchId: number };
  Chats: undefined;
  AdminUsers: { focusUserId?: number } | undefined;
  AdminWeddings: undefined;
  AdminEventManagers: undefined;
  AdminEventManagerDetails: { managerId: number };
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
  StaffParticipantDetails: {
    userId: number;
    mode: 'ADMIN' | 'EVENT_MANAGER';
    weddingId?: number;
    weddingName?: string;
    weddingStatus?: string;
    source?: 'ADMIN_USERS' | 'PARTICIPANTS' | 'ADMIN_REPORTS' | 'ADMIN_PRODUCT_FEEDBACK';
  };
  ReportUser: { userId: number };
  AdminReports: undefined;
  AdminReportDetails: { reportId: number };
  BlockedUsers: undefined;
  OpeningMessages: undefined;
  OpeningConversationDetails: {
    conversationId: number;
    otherUserName?: string;
  };
  SendProductFeedback: undefined;
  MyProductFeedback: { focusKind?: 'ProductFeedback' | 'UserReport'; focusId?: number } | undefined;
  AdminProductFeedback: undefined;
  AdminProductFeedbackDetails: { feedbackId: number };
  Notifications: undefined;
};
