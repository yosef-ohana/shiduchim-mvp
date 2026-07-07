export type ProfileStatus = 'NONE' | 'BASIC' | 'FULL' | 'FULL_INCOMPLETE_BLOCKED';

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  fullName: string;
  role: 'USER' | 'EVENT_MANAGER' | 'ADMIN';
  profileStatus: ProfileStatus;
  adminBlocked: boolean;
  accessToken: string;
}

export interface MeResponse {
  id: number;
  fullName: string;
  email: string;
  role: 'USER' | 'EVENT_MANAGER' | 'ADMIN';
  gender: 'MALE' | 'FEMALE' | null;
  profileStatus: ProfileStatus;
  adminBlocked: boolean;
  hasPrimaryPhoto: boolean;
  photoCount: number;
}

export interface ProfileMeResponse {
  id: number;
  fullName: string;
  email: string;
  role: 'USER' | 'EVENT_MANAGER' | 'ADMIN';
  gender: 'MALE' | 'FEMALE' | null;
  profileStatus: ProfileStatus;
  adminBlocked: boolean;
  hasPrimaryPhoto: boolean;
  photoCount: number;
  age: number | null;
  heightCm: number | null;
  areaOfResidence: string | null;
  religiousLevel: string | null;
  phone: string | null;
  education: string | null;
  occupation: string | null;
  selfDescription: string | null;
  hobbies: string | null;
  lookingFor: string | null;
  familyDescription: string | null;
  headCovering: string | null;
  hasDrivingLicense: boolean | null;
}

export interface BasicProfileRequest {
  fullName: string;
  age: number;
  heightCm: number;
  areaOfResidence: string;
  religiousLevel: string;
  phone: string;
}

export interface BasicProfileResponse {
  profileStatus: ProfileStatus;
  missingFields: string[];
  hasPrimaryPhoto: boolean;
}

export interface FullProfileRequest {
  education: string;
  occupation: string;
  selfDescription: string;
  hobbies: string;
  lookingFor: string;
  familyDescription?: string | null;
  headCovering?: string | null;
  hasDrivingLicense?: boolean | null;
}

export interface FullProfileResponse {
  profileStatus: ProfileStatus;
  globalPoolEnabled: boolean;
  missingFields: string[];
}

export type ProfileUpdateTarget = 'BASIC' | 'FULL';

export interface UnifiedProfileUpdateRequest {
  targetLevel: ProfileUpdateTarget;
  fullName: string;
  age: number;
  heightCm: number;
  areaOfResidence: string;
  religiousLevel: string;
  phone: string;
  education?: string | null;
  occupation?: string | null;
  selfDescription?: string | null;
  hobbies?: string | null;
  lookingFor?: string | null;
  familyDescription?: string | null;
  headCovering?: string | null;
  hasDrivingLicense?: boolean | null;
}

export type ParticipantStatus = 'ACTIVE' | 'REMOVED';

export interface PhotoResponse {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface PhotoUploadResponse {
  photoId: number;
  imageUrl: string;
  isPrimary: boolean;
  orderIndex: number;
  photoCount: number;
  hasPrimaryPhoto: boolean;
}

export interface JoinWeddingRequest {
  accessCode: string;
}

export interface JoinWeddingResponse {
  weddingId: number;
  weddingName: string;
  participantStatus: ParticipantStatus;
  joinedAt: string;
}

export interface UserWeddingResponse {
  weddingId: number;
  weddingName: string;
  city: string | null;
  weddingDate: string | null;
  weddingStatus: WeddingStatus;
  participantStatus: ParticipantStatus;
  joinedAt: string;
  isWeddingPoolEligible: boolean;
  weddingPoolEligible?: boolean;
  backgroundImageUrl?: string | null;
}

export type DiscoverPool = 'WEDDING' | 'GLOBAL';

export interface PublicUserCardResponse {
  userId: number;
  primaryPhotoUrl?: string;
  fullName: string;
  age: number;
  heightCm: number;
  areaOfResidence: string;
  religiousLevel: string;
  education: string;
  occupation?: string;
  lookingForShort?: string;
  poolType?: string;
  weddingId?: number;
  hasOpenOpeningConversation?: boolean;
  openingConversationId?: number;
  openingConversationDirection?: 'SENT' | 'RECEIVED';
  openingConversationStatus?: string;
}

export interface DiscoverResponse {
  items: PublicUserCardResponse[];
}

export interface PublicProfileResponse {
  userId: number;
  primaryPhotoUrl: string;
  additionalPhotoUrl: string | null;
  fullName: string;
  age: number;
  heightCm: number;
  areaOfResidence: string;
  religiousLevel: string;
  education: string;
  occupation: string;
  selfDescription: string;
  hobbies: string;
  familyDescription: string | null;
  lookingFor: string;
  headCovering: string | null;
  hasDrivingLicense: boolean | null;
  relationship?: CandidateRelationship | null;
}

export type ActionType = 'LIKE' | 'DISLIKE' | 'FREEZE';
export type PoolType = 'WEDDING' | 'GLOBAL';

export interface ActionResponse {
  targetUserId: number;
  actionType: ActionType;
  poolType: PoolType;
  weddingId?: number | null;
  matchCreated: boolean;
  matchBlocked: boolean;
  matchId?: number | null;
}

export interface UnfreezeResponse {
  targetUserId: number;
  removed: boolean;
  canAppearInDiscoverAgain: boolean;
}

export interface ActionListItemResponse {
  userId: number;
  primaryPhotoUrl?: string;
  fullName: string;
  age: number;
  heightCm: number;
  areaOfResidence: string;
  religiousLevel: string;
  education: string;
  lookingForShort?: string;
  actionType: ActionType;
  poolType: PoolType;
  weddingId?: number;
  actionUpdatedAt: string;
  hasOpenOpeningConversation?: boolean;
  openingConversationId?: number;
  openingConversationDirection?: 'SENT' | 'RECEIVED' | string;
  openingConversationStatus?: string;
}

export interface LikedMeItemResponse {
  userId: number;
  primaryPhotoUrl?: string;
  fullName: string;
  age: number;
  heightCm: number;
  areaOfResidence: string;
  religiousLevel: string;
  education: string;
  lookingForShort?: string;
  poolType: PoolType;
  weddingId?: number;
  likedAt: string;
  hasOpenOpeningConversation?: boolean;
  openingConversationId?: number;
  openingConversationDirection?: 'SENT' | 'RECEIVED' | string;
  openingConversationStatus?: string;
}

export type MatchStatus = 'ACTIVE' | 'BLOCKED';

export interface MatchUserProfile {
  userId: number;
  primaryPhotoUrl: string | null;
  fullName: string;
  age: number;
  heightCm: number;
  areaOfResidence: string;
  religiousLevel: string;
  education: string;
  occupation: string;
  selfDescription: string;
  hobbies: string;
  familyDescription: string | null;
  lookingFor: string;
  headCovering: string | null;
  hasDrivingLicense: boolean | null;
}

export interface MatchResponse {
  matchId: number;
  otherUserId: number;
  otherUserFullName: string;
  otherUserPrimaryPhotoUrl: string | null;
  poolType: PoolType;
  weddingId: number | null;
  status: MatchStatus;
  createdAt: string;
}

export type MatchListItemResponse = MatchResponse;

export interface ConversationResponse {
  matchId: number;
  otherUserId: number;
  otherUserFullName: string;
  otherUserPrimaryPhotoUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  poolType: PoolType;
  weddingId: number | null;
  matchStatus: MatchStatus;
  unreadCount?: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface MatchDetailsResponse {
  matchId: number;
  otherUserProfile: MatchUserProfile;
  poolType: PoolType;
  weddingId: number | null;
  status: MatchStatus;
  createdAt: string;
}

export interface ChatMessageResponse {
  id: number;
  matchId: number;
  senderId: number;
  content: string;
  sentAt: string;
}

export interface ChatMessagesResponse {
  matchId: number;
  messages: ChatMessageResponse[];
}

export interface ChatMessageRequest {
  content: string;
}

export interface AdminUserResponse {
  id: number;
  fullName: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | null;
  role: 'USER' | 'EVENT_MANAGER' | 'ADMIN';
  profileStatus: ProfileStatus;
  adminBlocked: boolean;
  eventManagerActive?: boolean | null;
  createdAt: string;
}

export interface ManagedWeddingSummaryResponse {
  id: number;
  name: string;
  city: string;
  weddingDate: string;
  status: WeddingStatus;
  accessCode: string;
  participantsCount: number;
  matchesCount: number;
}

export interface AdminEventManagerDetailsResponse {
  id: number;
  fullName: string;
  email: string;
  role: 'USER' | 'EVENT_MANAGER' | 'ADMIN';
  createdAt: string;
  adminBlocked: boolean;
  eventManagerActive: boolean | null;
  weddings: ManagedWeddingSummaryResponse[];
}

export interface ReassignManagedWeddingsRequest {
  weddingIds: number[];
}

export type WeddingStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED' | 'DELETED';

export interface AdminWeddingResponse {
  id: number;
  name: string;
  city: string;
  weddingDate: string;
  status: WeddingStatus;
  accessCode: string;
  ownerUserId: number;
  ownerName?: string;
  ownerEmail?: string;
  participantsCount: number;
  matchesCount: number;
  backgroundImageUrl?: string | null;
}

export interface AdminCreateWeddingRequest {
  name: string;
  city: string;
  weddingDate: string;
  accessCode?: string;
  ownerUserId?: number;
}

export interface AssignManagerRequest {
  managerId: number;
}

export interface CreateEventManagerRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface WeddingCreateRequest {
  name: string;
  city: string;
  weddingDate: string; // YYYY-MM-DD
  accessCode?: string;
}

export interface WeddingResponse {
  id: number;
  name: string;
  city: string;
  weddingDate: string;
  status: WeddingStatus;
  accessCode: string;
  ownerUserId: number;
  participantsCount: number;
  matchesCount: number;
  backgroundImageUrl?: string | null;
}

export interface AddParticipantRequest {
  email: string;
}

export interface ParticipantResponse {
  userId: number;
  fullName: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | null;
  profileStatus: ProfileStatus;
  hasPrimaryPhoto: boolean;
  participantStatus: ParticipantStatus;
  joinedAt: string;
  removedAt: string | null;
}

export interface StaffLoginRequest {
  email: string;
  password: string;
  expectedRole: 'ADMIN' | 'EVENT_MANAGER';
}

export interface ValidateWeddingCodeRequest {
  accessCode: string;
}

export interface ValidateWeddingCodeResponse {
  valid: boolean;
  weddingId: number | null;
  weddingName: string | null;
  city: string | null;
  weddingDate: string | null;
  status: WeddingStatus | null;
  joinAllowed: boolean;
  message: string;
  backgroundImageUrl?: string | null;
}

export type WeddingInviteStatus = 'PENDING' | 'ACCEPTED' | 'CANCELLED';

export interface CreateWeddingInviteRequest {
  fullName: string;
  email: string;
}

export interface WeddingInviteResponse {
  id: number;
  weddingId: number;
  fullName: string;
  email: string;
  status: WeddingInviteStatus;
  createdAt: string;
  acceptedAt: string | null;
}

export interface AdminDashboardResponse {
  usersCount: number;
  eventManagersCount: number;
  weddingsCount: number;
  activeWeddingsCount: number;
}

export type ReportStatus = 'NEW' | 'RESOLVED';
export type ReportReasonType = 'PROFILE' | 'BEHAVIOR' | 'OTHER';

export interface CreateUserReportRequest {
  reasonType: ReportReasonType;
  text?: string;
}

export interface UserReportSummaryResponse {
  id: number;
  reporterUserId: number;
  reportedUserId: number;
  status: ReportStatus;
  reasonType: ReportReasonType;
  hasText: boolean;
  createdAt: string;
  reporterName?: string;
  reporterEmail?: string;
  reportedUserName?: string;
  reportedUserEmail?: string;
}

export interface UserReportDetailsResponse {
  id: number;
  reporterUserId: number;
  reportedUserId: number;
  status: ReportStatus;
  reasonType: ReportReasonType;
  text: string | null;
  createdAt: string;
  resolvedAt: string | null;
  reporterName?: string;
  reporterEmail?: string;
  reportedUserName?: string;
  reportedUserEmail?: string;
}

export interface MyUserReportResponse {
  id: number;
  reportedUserId: number;
  reportedUserName?: string | null;
  reasonType: ReportReasonType;
  text?: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt?: string | null;
  resolvedAt: string | null;
}


export interface BlockedUserResponse {
  id: number;
  blockedUserId: number;
  fullName: string;
  primaryPhotoUrl?: string | null;
  createdAt: string;
}

export type OpeningConversationStatus = 'OPEN' | 'MATCH_CREATED' | 'EXPIRED' | 'REJECTED';

export interface OpeningMessageResponse {
  id: number;
  senderUserId: number;
  content: string;
  createdAt: string;
}

export interface OpeningConversationSummaryResponse {
  conversationId: number;
  otherUserId: number;
  otherUserName: string;
  poolType: PoolType;
  weddingId: number | null;
  status: OpeningConversationStatus;
  lastMessagePreview: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface OpeningConversationDetailsResponse {
  conversationId: number;
  openerUserId: number;
  recipientUserId: number;
  otherUserId: number;
  poolType: PoolType;
  weddingId: number | null;
  status: OpeningConversationStatus;
  messages: OpeningMessageResponse[];
  matchCreated: boolean;
  matchId?: number;
  requiresMatchConfirmation: boolean;
}

export interface SendOpeningMessageRequest {
  content: string;
  poolType: PoolType;
  weddingId?: number;
}

export interface ReplyOpeningMessageRequest {
  content: string;
  confirmCreateMatch?: boolean;
}

export interface OpeningReplyResponse {
  matchCreated: boolean;
  matchId?: number;
  requiresMatchConfirmation: boolean;
  message: string;
}

export interface StaffParticipantWeddingResponse {
  weddingId: number;
  weddingName: string;
  weddingStatus: WeddingStatus;
  participantStatus: ParticipantStatus;
  joinedAt: string;
  removedAt: string | null;
  canRemove: boolean;
  canRestore: boolean;
}

export interface StaffParticipantDetailsResponse {
  userId: number;
  fullName: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | null;
  role?: 'USER' | 'EVENT_MANAGER' | 'ADMIN';
  profileStatus: ProfileStatus;
  adminBlocked: boolean;
  hasPrimaryPhoto?: boolean;
  photos: PhotoResponse[];

  // basic profile fields (flat)
  age: number | null;
  heightCm: number | null;
  areaOfResidence: string | null;
  religiousLevel: string | null;

  // full profile fields (flat)
  phone: string | null;
  education: string | null;
  occupation: string | null;
  selfDescription: string | null;
  hobbies: string | null;
  lookingFor: string | null;
  familyDescription: string | null;
  headCovering: string | null;
  hasDrivingLicense: boolean | null;

  manageableWeddings: StaffParticipantWeddingResponse[];
  canAdminBlock?: boolean;
  canAdminUnblock?: boolean;
}

export type NotificationType =
  | 'LIKE_RECEIVED'
  | 'MATCH_CREATED'
  | 'OPENING_RECEIVED'
  | 'PRODUCT_FEEDBACK_STATUS_CHANGED'
  | 'USER_REPORT_STATUS_CHANGED';

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  actorUserId: number | null;
  referenceId: number;
  statusValue: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPageResponse {
  items: NotificationResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}

export type AllowedCandidateAction =
  | 'LIKE'
  | 'DISLIKE'
  | 'FREEZE'
  | 'REMOVE_ACTION'
  | 'UNFREEZE'
  | 'OPENING_CREATE'
  | 'OPENING_OPEN'
  | 'CHAT_OPEN'
  | 'MATCH_DETAILS_OPEN'
  | 'BLOCK'
  | 'REPORT';

export type CandidateProfileSourceType =
  | 'DISCOVER'
  | 'ACTION_LIST'
  | 'NOTIFICATION'
  | 'OPENING'
  | 'MATCH';

export type CandidateOutgoingAction = 'NONE' | 'LIKE' | 'DISLIKE' | 'FREEZE';

export type CandidateOpeningDirection = 'SENT' | 'RECEIVED';

export interface CandidateOpeningSummary {
  conversationId: number;
  direction: CandidateOpeningDirection;
  status: string;
}

export interface CandidateMatchSummary {
  matchId: number;
  status: string;
}

export interface CandidateEffectiveContext {
  poolType: PoolType | null;
  weddingId: number | null;
  validForActions: boolean;
  sourceType: CandidateProfileSourceType | null;
}

export interface CandidateRelationship {
  outgoingAction: CandidateOutgoingAction;
  incomingLike: boolean;
  opening: CandidateOpeningSummary | null;
  match: CandidateMatchSummary | null;
  effectiveContext: CandidateEffectiveContext | null;
  allowedActions: AllowedCandidateAction[];
}
