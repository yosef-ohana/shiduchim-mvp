import { LinkingOptions } from '@react-navigation/native';
import { MeResponse } from '../types/api';

export const getLinkingConfig = (user: MeResponse | null): LinkingOptions<ReactNavigation.RootParamList> => {
  const isUserRole = user?.role === 'USER';

  return {
    prefixes: ['shiduchim://'],
    config: {
      screens: user
        ? (isUserRole
            ? {
                UserTabs: {
                  screens: {
                    WeddingsRoot: {
                      screens: {
                        JoinWedding: 'join-wedding/:accessCode',
                      },
                    },
                  },
                },
              }
            : {})
        : { WeddingCodeEntry: 'join-wedding/:accessCode' },
    },
  };
};
