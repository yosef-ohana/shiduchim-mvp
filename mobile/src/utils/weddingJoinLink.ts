export const buildWeddingJoinLink = (accessCode: string): string => {
  if (!accessCode) {
    return '';
  }
  return `shiduchim://join-wedding/${encodeURIComponent(accessCode.trim())}`;
};
