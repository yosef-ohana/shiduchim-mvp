import { WeddingStatus, ParticipantStatus, WeddingInviteStatus, PoolType } from '../types/api';

/**
 * Maps WeddingStatus to Hebrew display string.
 */
export const getWeddingStatusLabel = (status?: WeddingStatus | string | null): string => {
  if (!status) return 'לא צוין';
  switch (status) {
    case 'ACTIVE':
      return 'פעיל';
    case 'CLOSED':
      return 'סגור';
    case 'CANCELLED':
      return 'מבוטל';
    case 'DELETED':
      return 'נמחקה';
    default:
      return status;
  }
};

/**
 * Maps ParticipantStatus to Hebrew display string.
 */
export const getParticipantStatusLabel = (status?: ParticipantStatus | string | null): string => {
  if (!status) return 'לא צוין';
  switch (status) {
    case 'ACTIVE':
      return 'פעיל';
    case 'REMOVED':
      return 'הוסר';
    default:
      return status;
  }
};

/**
 * Maps WeddingInviteStatus to Hebrew display string.
 */
export const getInviteStatusLabel = (status?: WeddingInviteStatus | string | null): string => {
  if (!status) return 'לא צוין';
  switch (status) {
    case 'PENDING':
      return 'ממתינה';
    case 'ACCEPTED':
      return 'התקבלה';
    case 'CANCELLED':
      return 'מבוטל';
    default:
      return status;
  }
};

/**
 * Maps User Roles to Hebrew display string.
 * Supports legacy/display 'MANAGER_EVENT' mapping to 'מנהל אירוע'.
 */
export const getUserRoleLabel = (role?: 'USER' | 'EVENT_MANAGER' | 'ADMIN' | string | null): string => {
  if (!role) return 'לא צוין';
  switch (role) {
    case 'ADMIN':
      return 'מנהל מערכת';
    case 'EVENT_MANAGER':
    case 'MANAGER_EVENT': // legacy/display support
      return 'מנהל אירוע';
    case 'USER':
      return 'משתמש רגיל';
    default:
      return role;
  }
};

/**
 * Maps Gender to Hebrew display string.
 */
export const getGenderLabel = (gender?: 'MALE' | 'FEMALE' | string | null): string => {
  if (!gender) return 'לא צוין';
  switch (gender) {
    case 'MALE':
      return 'זכר';
    case 'FEMALE':
      return 'נקבה';
    default:
      return gender;
  }
};

/**
 * Maps PoolType to Hebrew display string.
 */
export const getPoolTypeLabel = (pool?: PoolType | string | null): string => {
  if (!pool) return 'לא צוין';
  switch (pool) {
    case 'GLOBAL':
      return 'מאגר כללי';
    case 'WEDDING':
      return 'מאגר חתונה';
    default:
      return pool;
  }
};

/**
 * Maps Yes/No boolean or string value to Hebrew.
 */
export const getYesNoLabel = (value?: boolean | string | null): string => {
  if (value === undefined || value === null) return 'לא צוין';
  if (typeof value === 'boolean') {
    return value ? 'כן' : 'לא';
  }
  const str = String(value).toLowerCase().trim();
  if (str === 'yes' || str === 'true') return 'כן';
  if (str === 'no' || str === 'false') return 'לא';
  return 'לא צוין';
};

/**
 * Maps empty/unspecified values to Hebrew placeholder.
 */
export const getEmptyLabel = (value?: string | null): string => {
  if (!value || value.trim() === '' || value.toLowerCase() === 'not specified') {
    return 'לא צוין';
  }
  return value;
};

/**
 * Formats a Date string into DD/MM/YYYY format.
 */
export const formatDisplayDate = (dateString?: string | null): string => {
  if (!dateString) return 'לא צוין';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};
