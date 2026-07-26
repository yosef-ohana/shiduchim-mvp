import { MeResponse } from '../types/api';
import { RootOutcome } from '../types/navigation';

export const getRootOutcome = (user: MeResponse | null, loading: boolean): RootOutcome => {
  if (loading) {
    return 'restoring';
  }

  if (!user) {
    return 'logged_out';
  }

  switch (user.role) {
    case 'USER':
      return 'USER';
    case 'ADMIN':
      return 'ADMIN';
    case 'EVENT_MANAGER':
      return 'EVENT_MANAGER';
    default:
      // Unknown or corrupt role - fall back safely to logged_out
      return 'logged_out';
  }
};
