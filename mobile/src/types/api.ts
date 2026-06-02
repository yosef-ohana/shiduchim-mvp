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
  profileStatus: 'NONE' | 'BASIC' | 'FULL' | 'FULL_INCOMPLETE_BLOCKED';
  adminBlocked: boolean;
  accessToken: string;
}

export interface MeResponse {
  id: number;
  fullName: string;
  email: string;
  role: 'USER' | 'EVENT_MANAGER' | 'ADMIN';
  gender: 'MALE' | 'FEMALE' | null;
  profileStatus: 'NONE' | 'BASIC' | 'FULL' | 'FULL_INCOMPLETE_BLOCKED';
  adminBlocked: boolean;
  hasPrimaryPhoto: boolean;
  photoCount: number;
}
