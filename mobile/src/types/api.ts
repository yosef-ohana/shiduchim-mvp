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
