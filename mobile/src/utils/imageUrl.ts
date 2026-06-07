import { API_BASE_URL } from '../config/apiConfig';

/**
 * Resolves a potentially relative image URL from the backend into a full absolute URL.
 * 
 * - Returns undefined for null, undefined, or empty string.
 * - Returns the original URL if it already starts with http:// or https://.
 * - Converts relative paths (like /uploads/...) into an absolute URL using the API_BASE_URL.
 * - Avoids duplicating /api and preserves correct slash handling.
 */
export const getImageUrl = (url?: string | null): string | undefined => {
  if (!url || url.trim() === '') {
    return undefined;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const apiBase = API_BASE_URL.trim();
  const apiSuffixRegex = /\/api\/?$/;
  const baseUrlWithoutApi = apiBase.replace(apiSuffixRegex, '');

  const cleanBase = baseUrlWithoutApi.endsWith('/') 
    ? baseUrlWithoutApi.slice(0, -1) 
    : baseUrlWithoutApi;

  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  return `${cleanBase}${cleanPath}`;
};
