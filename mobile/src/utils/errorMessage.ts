/**
 * Checks if the error is a network or communication issue.
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') return true;
  if (error.request && !error.response) return true;
  const msg = String(error.message || '').toLowerCase();
  return msg.includes('network') || msg.includes('timeout') || msg.includes('connect');
};

/**
 * Checks if a string contains any of the provided keywords (case-insensitive).
 */
export const containsAny = (text: string, keywords: string[]): boolean => {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

/**
 * Checks if the message is a technical system error that shouldn't be shown to the user.
 */
export const isTechnicalMessage = (message: string): boolean => {
  if (!message || typeof message !== 'string') return true;
  const lower = message.toLowerCase();
  
  return (
    lower.includes('axioserror') ||
    lower.includes('network error') ||
    lower.includes('request failed') ||
    lower.includes('status code') ||
    lower.includes('stacktrace') ||
    lower.includes('at ') ||
    lower.includes('{') ||
    lower.includes('}') ||
    lower === 'undefined' ||
    lower === 'null' ||
    lower.trim() === ''
  );
};

/**
 * Safely converts any error object into a friendly Hebrew display string.
 * It preserves the original error shape and maps common errors to clear user messages.
 */
export const getFriendlyErrorMessage = (error: unknown, fallback?: string): string => {
  const defaultFallback = fallback || 'אירעה שגיאה. נסה שוב.';

  if (!error) {
    return defaultFallback;
  }

  // 1. Network / No Response Errors
  if (isNetworkError(error)) {
    return 'שגיאת תקשורת. בדוק את החיבור לאינטרנט ונסה שוב.';
  }

  const err = error as any;
  const status = err.response?.status;
  const backendMessage = err.response?.data?.message || err.message || '';

  // 2. Map based on backend/internal message content
  if (backendMessage && typeof backendMessage === 'string') {
    // Blocked Account
    if (containsAny(backendMessage, ['blocked', 'deactivated', 'adminblocked', 'account is blocked', 'user is blocked'])) {
      return 'המשתמש חסום. פנה להנהלת המערכת.';
    }

    // Role / Staff Portal mismatch
    if (containsAny(backendMessage, [
      'role mismatch',
      'not allowed to access staff portal',
      'regular users cannot use staff login',
      'role permissions'
    ])) {
      return 'החשבון הזה אינו מורשה להיכנס לפורטל הניהול.';
    }

    // Access denied / forbidden
    if (containsAny(backendMessage, [
      'forbidden',
      'access denied'
    ])) {
      return 'אין לך הרשאה לבצע פעולה זו.';
    }

    // Wrong credentials
    if (containsAny(backendMessage, [
      'wrong credentials',
      'invalid credentials',
      'incorrect credentials',
      'bad credentials',
      'incorrect password',
      'wrong password',
      'unauthorized'
    ])) {
      return 'שם משתמש או סיסמה שגויים.';
    }

    // User not found by email
    if (containsAny(backendMessage, [
      'user not found',
      'user not found with email',
      'not found with email',
      'no user found'
    ])) {
      return 'לא נמצא משתמש עם האימייל הזה.';
    }

    // Target user must be a regular USER
    if (containsAny(backendMessage, [
      'target user must be of role user',
      'must be of role user',
      'user must be of role user',
      'only regular users'
    ])) {
      return 'ניתן להוסיף לחתונה רק משתמש רגיל.';
    }

    // Already active participant (Admin / Event Manager flow)
    if (containsAny(backendMessage, [
      'already a participant',
      'already an active participant',
      'participant already exists'
    ])) {
      return 'המשתמש כבר משתתף בחתונה זו.';
    }

    // Already joined wedding (User flow)
    if (containsAny(backendMessage, [
      'already joined',
      'already joined this wedding',
      'already registered'
    ])) {
      return 'כבר הצטרפת לחתונה זו.';
    }

    // Closed or cancelled wedding
    if (containsAny(backendMessage, [
      'wedding is closed',
      'wedding is cancelled',
      'closed or cancelled',
      'closed',
      'cancelled',
      'canceled',
      'inactive wedding'
    ])) {
      return 'החתונה אינה פתוחה להצטרפות כרגע.';
    }

    // Invalid wedding code
    if (containsAny(backendMessage, [
      'wedding not found',
      'wedding code not found',
      'invalid wedding code',
      'invalid code',
      'code not found',
      'access code not found'
    ])) {
      return 'קוד החתונה שהזנת אינו תקין. אנא בדוק שנית ונסה שוב.';
    }

    // Duplicate wedding access code
    if (containsAny(backendMessage, [
      'access code already exists',
      'accesscode already exists',
      'wedding code already exists',
      'code already exists',
      'duplicate access code',
      'access code must be unique'
    ])) {
      return 'קוד החתונה כבר קיים. בחר קוד אחר.';
    }

    // Duplicate invitation
    if (containsAny(backendMessage, [
      'invite already exists',
      'invitation already exists',
      'pending invitation already exists',
      'already invited'
    ])) {
      return 'כבר קיימת הזמנה לאימייל הזה.';
    }

    // Invite restoration / status conflicts
    if (containsAny(backendMessage, [
      'cannot restore',
      'cannot be restored'
    ])) {
      return 'לא ניתן לשחזר את ההזמנה במצב הנוכחי.';
    }
    if (containsAny(backendMessage, [
      'already accepted',
      'already been accepted'
    ])) {
      return 'ההזמנה כבר התקבלה.';
    }
    if (containsAny(backendMessage, [
      'already pending'
    ])) {
      return 'ההזמנה כבר ממתינה.';
    }
    if (containsAny(backendMessage, [
      'invite is not cancelled',
      'is not cancelled'
    ])) {
      return 'רק הזמנות מבוטלות ניתן לשחזר.';
    }

    // Duplicate email / account already exists
    if (containsAny(backendMessage, [
      'email already exists',
      'user already exists',
      'account already exists'
    ])) {
      return 'קיים כבר חשבון עם האימייל הזה.';
    }
  }

  // 3. Map based on HTTP Status Code
  if (status) {
    if (status === 401) {
      return 'יש להתחבר מחדש כדי להמשיך.';
    }
    if (status === 403) {
      return 'אין לך הרשאה לבצע פעולה זו.';
    }
    if (status === 404) {
      return 'הנתונים לא נמצאו.';
    }
    if (status === 409) {
      return 'הפעולה לא זמינה כי הנתון כבר קיים או נמצא במצב אחר.';
    }
    if (status >= 500) {
      return 'שגיאת שרת. נסה שוב מאוחר יותר.';
    }
  }

  // 4. Return clean, non-technical backend messages directly if they exist
  if (backendMessage && typeof backendMessage === 'string' && !isTechnicalMessage(backendMessage)) {
    return backendMessage;
  }

  return defaultFallback;
};
