import { buildWeddingJoinLink } from './weddingJoinLink';
import { formatDisplayDate } from './displayLabels';

interface WeddingInvitationData {
  name: string;
  city?: string;
  weddingDate?: string;
  accessCode: string;
}

/**
 * Generates Hebrew invitation text for a wedding, including the deep link,
 * access code, details, and participant guidance.
 */
export function generateWeddingInvitationText(wedding: WeddingInvitationData): string {
  if (!wedding) {
    return '';
  }

  const deepLink = buildWeddingJoinLink(wedding.accessCode);
  const formattedDate = wedding.weddingDate ? formatDisplayDate(wedding.weddingDate) : '';

  let text = `שלום, הוזמנת להצטרף לחתונה במערכת Shiduchim.\n\n`;
  text += `שם החתונה: ${wedding.name}\n`;

  if (wedding.city && wedding.city.trim() && wedding.city !== 'לא צוין') {
    text += `עיר: ${wedding.city.trim()}\n`;
  }

  if (formattedDate && formattedDate !== 'לא צוין') {
    text += `תאריך: ${formattedDate}\n`;
  }

  if (wedding.accessCode) {
    text += `קוד גישה: ${wedding.accessCode}\n`;
  }

  if (deepLink) {
    text += `קישור להצטרפות: ${deepLink}\n`;
  }

  text += `\nהנחיות להמשך:\n`;
  text += `לאחר ההצטרפות לחתונה, על מנת שתוכל/י להופיע במאגר החתונה ולראות הצעות לשידוכים, עליך למלא פרופיל בסיסי ולהעלות תמונה ראשית באפליקציה.`;

  return text;
}
