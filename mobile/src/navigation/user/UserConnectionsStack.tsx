import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserConnectionsStackParamList } from '../../types/navigation';
import { ConnectionsHubScreen } from '../../screens/connections/ConnectionsHubScreen';
import { ListsScreen } from '../../screens/lists/ListsScreen';
import { OpeningMessagesScreen } from '../../screens/opening/OpeningMessagesScreen';
import { OpeningConversationDetailsScreen } from '../../screens/opening/OpeningConversationDetailsScreen';
import { MatchesScreen } from '../../screens/matches/MatchesScreen';
import { MatchDetailsScreen } from '../../screens/matches/MatchDetailsScreen';

const Stack = createNativeStackNavigator<UserConnectionsStackParamList>();

/**
 * ConnectionsRoot Stack Navigator — Batch A2 REL-02 Real ConnectionsHub Target
 * Initial route: ConnectionsHub (Three-domain Hub).
 * Child routes Lists, OpeningMessages, Matches remain resolvable compatibility routes.
 */
export const UserConnectionsStack: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="ConnectionsHub">
      <Stack.Screen name="ConnectionsHub" component={ConnectionsHubScreen} options={{ title: 'קשרים' }} />
      <Stack.Screen name="Lists" component={ListsScreen} options={{ title: 'הרשימות שלי' }} />
      <Stack.Screen name="OpeningMessages" component={OpeningMessagesScreen} options={{ title: 'פניות ושיחות' }} />
      <Stack.Screen name="OpeningConversationDetails" component={OpeningConversationDetailsScreen} options={{ title: 'שיחה' }} />
      <Stack.Screen name="Matches" component={MatchesScreen} options={{ title: 'ההצעות שלי' }} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} options={{ title: 'פרטי הצעה' }} />
    </Stack.Navigator>
  );
};
