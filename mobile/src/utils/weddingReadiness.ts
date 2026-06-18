import { MeResponse, WeddingStatus, ParticipantStatus } from '../types/api';

export type WeddingReadinessState =
  | 'NOT_LOGGED_IN'
  | 'STAFF_USER'
  | 'NOT_JOINED'
  | 'JOINED_MISSING_BASIC_PROFILE'
  | 'JOINED_MISSING_PRIMARY_PHOTO'
  | 'JOINED_MISSING_BOTH'
  | 'READY'
  | 'INACTIVE_WEDDING'
  | 'INACTIVE_PARTICIPANT'
  | 'BLOCKED_USER';

export type WeddingReadinessAction =
  | 'LOGIN'
  | 'JOIN'
  | 'EDIT_PROFILE'
  | 'UPLOAD_PHOTO'
  | 'NONE';

export interface WeddingReadinessResult {
  state: WeddingReadinessState;
  canJoin: boolean;
  canOpenDiscover: boolean;
  missingBasicProfile: boolean;
  missingPrimaryPhoto: boolean;
  isInactiveWedding: boolean;
  isBlocked: boolean;
  message: string;
  primaryAction: WeddingReadinessAction;
}

export interface WeddingReadinessInput {
  user?: MeResponse | {
    id: number;
    fullName: string;
    email: string;
    role: 'USER' | 'EVENT_MANAGER' | 'ADMIN';
    gender: 'MALE' | 'FEMALE' | null;
    profileStatus: string;
    adminBlocked: boolean;
    hasPrimaryPhoto: boolean;
    photoCount: number;
  } | null;
  weddingStatus?: WeddingStatus | null;
  participantStatus?: ParticipantStatus | null;
  isJoined?: boolean;
}

/**
 * Reusable utility that determines a user's readiness for a wedding pool,
 * providing structured flags, messages, and action guidance for the UI.
 */
export function getWeddingReadiness(input: WeddingReadinessInput): WeddingReadinessResult {
  const { user, weddingStatus, participantStatus, isJoined } = input;

  // 1. Check if user is logged in
  if (!user) {
    return {
      state: 'NOT_LOGGED_IN',
      canJoin: false,
      canOpenDiscover: false,
      missingBasicProfile: false,
      missingPrimaryPhoto: false,
      isInactiveWedding: weddingStatus === 'CLOSED' || weddingStatus === 'CANCELLED',
      isBlocked: false,
      message: 'יש להתחבר כדי להצטרף לחתונה.',
      primaryAction: 'LOGIN',
    };
  }

  // 2. Check if user is blocked
  if (user.adminBlocked) {
    return {
      state: 'BLOCKED_USER',
      canJoin: false,
      canOpenDiscover: false,
      missingBasicProfile: false,
      missingPrimaryPhoto: false,
      isInactiveWedding: weddingStatus === 'CLOSED' || weddingStatus === 'CANCELLED',
      isBlocked: true,
      message: 'המשתמש חסום. פנה להנהלת המערכת.',
      primaryAction: 'NONE',
    };
  }

  // 3. Check if user is staff (role mismatch)
  if (user.role === 'ADMIN' || user.role === 'EVENT_MANAGER') {
    return {
      state: 'STAFF_USER',
      canJoin: false,
      canOpenDiscover: false,
      missingBasicProfile: false,
      missingPrimaryPhoto: false,
      isInactiveWedding: weddingStatus === 'CLOSED' || weddingStatus === 'CANCELLED',
      isBlocked: false,
      message: 'מנהלים אינם יכולים להצטרף למאגר הזיווגים של החתונה.',
      primaryAction: 'NONE',
    };
  }

  // 4. Check if wedding is inactive (if wedding status is provided)
  const isInactiveWedding = weddingStatus === 'CLOSED' || weddingStatus === 'CANCELLED';
  if (isInactiveWedding) {
    return {
      state: 'INACTIVE_WEDDING',
      canJoin: false,
      canOpenDiscover: false,
      missingBasicProfile: false,
      missingPrimaryPhoto: false,
      isInactiveWedding: true,
      isBlocked: false,
      message: 'החתונה אינה פתוחה להצטרפות כרגע.',
      primaryAction: 'NONE',
    };
  }

  // 5. Determine if joined
  // User is joined if isJoined is explicitly true, or if participantStatus is 'ACTIVE'.
  // User is not joined if isJoined is explicitly false, or if participantStatus is missing/null/undefined.
  const resolvedJoined = isJoined ?? (participantStatus === 'ACTIVE' || participantStatus === 'REMOVED');

  // 6. Check if user is an inactive participant (removed)
  if (resolvedJoined && participantStatus === 'REMOVED') {
    return {
      state: 'INACTIVE_PARTICIPANT',
      canJoin: false,
      canOpenDiscover: false,
      missingBasicProfile: false,
      missingPrimaryPhoto: false,
      isInactiveWedding: false,
      isBlocked: false,
      message: 'אינך משתתף פעיל בחתונה זו.',
      primaryAction: 'NONE',
    };
  }

  // 7. Check if user has not joined yet
  if (!resolvedJoined || participantStatus === null || participantStatus === undefined) {
    return {
      state: 'NOT_JOINED',
      canJoin: true,
      canOpenDiscover: false,
      missingBasicProfile: false,
      missingPrimaryPhoto: false,
      isInactiveWedding: false,
      isBlocked: false,
      message: 'הנך מורשה להצטרף לחתונה זו.',
      primaryAction: 'JOIN',
    };
  }

  // User is joined and is active participant.
  // Evaluate profile completeness
  const missingBasicProfile =
    !user.profileStatus ||
    user.profileStatus === 'NONE' ||
    user.profileStatus === 'FULL_INCOMPLETE_BLOCKED';
  const missingPrimaryPhoto = !user.hasPrimaryPhoto;

  if (missingBasicProfile && missingPrimaryPhoto) {
    return {
      state: 'JOINED_MISSING_BOTH',
      canJoin: false,
      canOpenDiscover: false,
      missingBasicProfile: true,
      missingPrimaryPhoto: true,
      isInactiveWedding: false,
      isBlocked: false,
      message: 'הצטרפת לחתונה בהצלחה! כדי להופיע במאגר, עליך למלא פרופיל בסיסי ולהעלות תמונה ראשית.',
      primaryAction: 'EDIT_PROFILE',
    };
  }

  if (missingBasicProfile) {
    return {
      state: 'JOINED_MISSING_BASIC_PROFILE',
      canJoin: false,
      canOpenDiscover: false,
      missingBasicProfile: true,
      missingPrimaryPhoto: false,
      isInactiveWedding: false,
      isBlocked: false,
      message: 'הצטרפת לחתונה בהצלחה! כדי להופיע במאגר, עליך להשלים את הפרופיל הבסיסי.',
      primaryAction: 'EDIT_PROFILE',
    };
  }

  if (missingPrimaryPhoto) {
    return {
      state: 'JOINED_MISSING_PRIMARY_PHOTO',
      canJoin: false,
      canOpenDiscover: false,
      missingBasicProfile: false,
      missingPrimaryPhoto: true,
      isInactiveWedding: false,
      isBlocked: false,
      message: 'הצטרפת לחתונה בהצלחה! כדי להופיע במאגר, עליך להעלות תמונה ראשית.',
      primaryAction: 'UPLOAD_PHOTO',
    };
  }

  // Everything is ready!
  return {
    state: 'READY',
    canJoin: false,
    canOpenDiscover: true,
    missingBasicProfile: false,
    missingPrimaryPhoto: false,
    isInactiveWedding: false,
    isBlocked: false,
    message: 'הנך מוכן להופיע במאגר החתונה!',
    primaryAction: 'NONE',
  };
}
