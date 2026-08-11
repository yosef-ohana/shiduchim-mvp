import { NavigatorScreenParams } from '@react-navigation/native';
import type { DiscoverPool, UserWeddingResponse, CandidateProfileSourceType, PoolType } from './api';

export type RootOutcome = 'restoring' | 'logged_out' | 'USER' | 'ADMIN' | 'EVENT_MANAGER';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: { pendingWeddingCode?: string } | undefined;
  Register: { pendingWeddingCode?: string } | undefined;
  StaffLoginChoice: undefined;
  StaffLogin: { expectedRole?: 'ADMIN' | 'EVENT_MANAGER' } | undefined;
  WeddingCodeEntry: { accessCode?: string; pendingWeddingCode?: string } | undefined;
};

export type AdminEventManagerReturnContext =
  | {
      role: 'ADMIN';
      domain: 'USERS';
      sourceRoute: 'AdminUsers';
      returnRoute: 'AdminUsers';
    }
  | {
      role: 'ADMIN';
      domain: 'WEDDINGS';
      sourceRoute: 'AdminWeddings';
      returnRoute: 'AdminWeddings';
    }
  | {
      role: 'ADMIN';
      domain: 'WEDDINGS';
      sourceRoute: 'AdminWeddingDetails';
      returnRoute: 'AdminWeddingDetails';
      weddingId: number;
    }
  | {
      role: 'ADMIN';
      domain: 'WEDDINGS';
      sourceRoute: 'CreateAdminWedding';
      returnRoute: 'CreateAdminWedding';
    }
  | {
      role: 'ADMIN';
      domain: 'OPERATIONS';
      sourceRoute: 'AdminEventManagers';
      returnRoute: 'AdminEventManagers';
    };

export type AdminWeddingDetailsReturnContext =
  | {
      role: 'ADMIN';
      domain: 'USERS' | 'WEDDINGS' | 'OPERATIONS';
      sourceRoute: 'AdminEventManagerDetails';
      returnRoute: 'AdminEventManagerDetails';
      managerId: number;
      weddingId?: number;
    };

export type AdminReportDetailsReturnContext =
  | {
      role: 'ADMIN';
      domain: 'OPERATIONS';
      sourceRoute: 'AdminReports';
      returnRoute: 'AdminReports';
      reportId?: number;
    };

export type AdminProductFeedbackDetailsReturnContext =
  | {
      role: 'ADMIN';
      domain: 'OPERATIONS';
      sourceRoute: 'AdminProductFeedback';
      returnRoute: 'AdminProductFeedback';
      feedbackId?: number;
    };

export type StaffParticipantDetailsReturnContext =
  | {
      role: 'ADMIN';
      domain: 'OPERATIONS';
      sourceRoute: 'AdminReportDetails';
      returnRoute: 'AdminReportDetails';
      reportId: number;
      userId?: number;
    }
  | {
      role: 'ADMIN';
      domain: 'OPERATIONS';
      sourceRoute: 'AdminProductFeedbackDetails';
      returnRoute: 'AdminProductFeedbackDetails';
      feedbackId: number;
      userId?: number;
    }
  | {
      role: 'ADMIN';
      domain: 'OPERATIONS';
      sourceRoute: 'AdminProductFeedback';
      returnRoute: 'AdminProductFeedback';
      feedbackId?: number;
      userId?: number;
    };

export type EventManagerWeddingDetailsReturnContext =
  | {
      role: 'EVENT_MANAGER';
      sourceRoute: 'EventManagerWeddings';
      returnRoute: 'EventManagerWeddings';
      weddingId: number;
    }
  | {
      role: 'EVENT_MANAGER';
      sourceRoute: 'EventManagerWeddingDetails';
      returnRoute: 'EventManagerWeddingDetails';
      weddingId: number;
    };

export type AdminStackParamList = {
  AdminHome: undefined;
  AdminUsers: { focusUserId?: number } | undefined;
  AdminWeddings: undefined;
  AdminWeddingDetails: {
    weddingId: number;
    returnContext?: AdminWeddingDetailsReturnContext;
  };
  CreateAdminWedding: undefined;
  AdminOperations: undefined;
  AdminEventManagers: undefined;
  AdminEventManagerDetails: {
    managerId: number;
    returnContext?: AdminEventManagerReturnContext;
  };
  CreateEventManager: undefined;
  AdminReports: undefined;
  AdminReportDetails: {
    reportId: number;
    returnContext?: AdminReportDetailsReturnContext;
  };
  AdminProductFeedback: undefined;
  AdminProductFeedbackDetails: {
    feedbackId: number;
    returnContext?: AdminProductFeedbackDetailsReturnContext;
  };
  WeddingParticipants: {
    weddingId: number;
    mode: 'ADMIN' | 'EVENT_MANAGER';
    weddingName?: string;
    weddingStatus?: string;
    returnContext?: EventManagerWeddingDetailsReturnContext;
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
    returnContext?: StaffParticipantDetailsReturnContext;
  };
};

export type EventManagerStackParamList = {
  EventManagerWeddings: undefined;
  CreateWedding: undefined;
  EventManagerWeddingDetails: {
    weddingId: number;
    returnContext?: EventManagerWeddingDetailsReturnContext;
  };
  WeddingParticipants: {
    weddingId: number;
    mode: 'ADMIN' | 'EVENT_MANAGER';
    weddingName?: string;
    weddingStatus?: string;
    returnContext?: EventManagerWeddingDetailsReturnContext;
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
    returnContext?: StaffParticipantDetailsReturnContext;
  };
};

export type UserDiscoverStackParamList = {
  PoolSelection: undefined;
  Discover: { pool: DiscoverPool; weddingId?: number };
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

export type CandidateProfileReturnIntent =
  | {
      kind: 'DISCOVER_GLOBAL';
      role: 'USER';
      sourceRoute: 'Discover';
      poolType: 'GLOBAL';
    }
  | {
      kind: 'DISCOVER_WEDDING';
      role: 'USER';
      sourceRoute: 'Discover';
      poolType: 'WEDDING';
      weddingId: number;
    }
  | {
      kind: 'NOTIFICATIONS';
      role: 'USER';
      sourceRoute: 'Notifications';
      notificationId: number;
    }
  | {
      kind: 'INTEREST_LIST';
      role: 'USER';
      sourceRoute: 'Lists';
    }
  | {
      kind: 'OPENING_LIST';
      role: 'USER';
      sourceRoute: 'OpeningMessages';
    }
  | {
      kind: 'OPENING_DETAILS';
      role: 'USER';
      sourceRoute: 'OpeningConversationDetails';
      conversationId: number;
    }
  | {
      kind: 'MATCHES_LIST';
      role: 'USER';
      sourceRoute: 'Matches';
    }
  | {
      kind: 'MATCH_DETAILS';
      role: 'USER';
      sourceRoute: 'MatchDetails';
      matchId: number;
    }
  | {
      kind: 'CHATS_LIST';
      role: 'USER';
      sourceRoute: 'Chats';
    }
  | {
      kind: 'ACTIVE_CHAT';
      role: 'USER';
      sourceRoute: 'Chat';
      matchId: number;
    };

export type MatchDetailsReturnIntent =
  | { kind: 'OPENING_CONVERSATION_DETAILS'; conversationId: number }
  | { kind: 'OPENING_MESSAGES' }
  | { kind: 'MATCHES' };

export type ChatReturnIntent =
  | { kind: 'CHATS' }
  | { kind: 'MATCH_DETAILS'; matchId: number }
  | { kind: 'INTEREST_LIST' }
  | { kind: 'OPENING_DETAILS'; conversationId: number }
  | { kind: 'OPENING_MESSAGES' };

export type ReportUserReturnIntent = {
  kind: 'CANDIDATE_PROFILE';
  role: 'USER';
  sourceRoute: 'CandidateProfile';
  candidateUserId: number;
  parentReturnIntent?: CandidateProfileReturnIntent;
};

export type WeddingRepairReturnIntent = {
  returnToWedding?: boolean;
  returnWeddingId?: number;
  returnWeddingSnapshot?: UserWeddingResponse;
  accessCode?: string;
  originalSource?: 'code' | 'deepLink' | 'myWeddings' | 'returnFlow';
  source?: 'weddingHub' | 'returnFlow';
};

export type UserShellStackParamList = {
  UserTabs: NavigatorScreenParams<UserTabsParamList> | undefined;
  CandidateProfile: {
    userId: number;
    sourceContext?: 'OPENING_LIST' | 'OPENING_DETAILS';
    contextLabel?: string;
    sourceType?: CandidateProfileSourceType;
    sourceId?: number;
    poolType?: PoolType;
    weddingId?: number;
    returnIntent?: CandidateProfileReturnIntent;
  };
  Notifications: undefined;
  ReportUser: {
    userId: number;
    returnIntent?: ReportUserReturnIntent;
  };
  Lists: undefined;
  OpeningMessages: undefined;
  OpeningConversationDetails: {
    conversationId: number;
    otherUserName?: string;
  };
  Matches: undefined;
  MatchDetails: {
    matchId: number;
    sourceIntent?: 'OPENING_TO_MATCH';
    returnIntent?: MatchDetailsReturnIntent;
  };
  Chat: {
    matchId: number;
    returnIntent?: ChatReturnIntent;
  };
  JoinWedding:
    | {
        accessCode?: string;
        weddingId?: number;
        weddingSnapshot?: UserWeddingResponse;
        source?: 'code' | 'deepLink' | 'myWeddings' | 'returnFlow';
        originalSource?: 'code' | 'deepLink' | 'myWeddings' | 'returnFlow';
      }
    | undefined;
  Profile:
    | {
        focusSection?: 'profile' | 'photos' | 'full';
        intent?:
          | 'onboarding_basic'
          | 'onboarding_full'
          | 'complete_full'
          | 'repair_full'
          | 'view';
      }
    | undefined;
  BasicProfile:
    | (WeddingRepairReturnIntent & {
        continueToFullAfterBasic?: boolean;
        continueToPhotosAfterFull?: boolean;
        returnToProfile?: boolean;
      })
    | undefined;
  FullProfile:
    | (WeddingRepairReturnIntent & {
        continueToPhotosAfterFull?: boolean;
      })
    | undefined;
  Photos:
    | WeddingRepairReturnIntent
    | undefined;
  BlockedUsers: undefined;
  SendProductFeedback: undefined;
  MyProductFeedback:
    | { focusKind?: 'ProductFeedback' | 'UserReport'; focusId?: number }
    | undefined;
};
