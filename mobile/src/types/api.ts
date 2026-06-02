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

