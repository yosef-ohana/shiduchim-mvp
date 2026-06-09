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
  createdAt: string;
}

export type WeddingStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED';

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
  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED' | null;
  joinAllowed: boolean;
  message: string;
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

