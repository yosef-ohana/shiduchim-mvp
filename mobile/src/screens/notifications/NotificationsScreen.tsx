import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme/theme';
import { getLikedMe } from '../../api/listsApi';
import { getMatches } from '../../api/matchesApi';
import { getInboxOpeningMessages } from '../../api/openingMessagesApi';
import { productFeedbackApi } from '../../api/productFeedbackApi';
import { reportsApi } from '../../api/reportsApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainStack';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Notifications'>;

type NotificationKind = 'LIKE' | 'MATCH' | 'OPENING' | 'FEEDBACK' | 'REPORT';

interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  subtitle: string;
  date: Date;
  onPress: () => void;
}

export const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [likes, matches, openings, feedbacks, reports] = await Promise.all([
        getLikedMe().catch(() => []),
        getMatches().catch(() => []),
        getInboxOpeningMessages().catch(() => []),
        productFeedbackApi.getMyFeedback().catch(() => []),
        reportsApi.getMyReports().catch(() => []),
      ]);

      const normalized: NotificationItem[] = [];

      likes.slice(0, 10).forEach(like => {
        normalized.push({
          id: `like-${like.userId}`,
          kind: 'LIKE',
          title: 'לייק חדש',
          subtitle: `${like.fullName} עשה/תה לך לייק`,
          date: new Date(like.likedAt),
          onPress: () => navigation.navigate('CandidateProfile', { userId: like.userId, contextLabel: 'התראות' })
        });
      });

      matches.slice(0, 10).forEach(match => {
        normalized.push({
          id: `match-${match.matchId}`,
          kind: 'MATCH',
          title: 'התאמה חדשה',
          subtitle: `יש לך התאמה עם ${match.otherUserFullName}`,
          date: new Date(match.createdAt),
          onPress: () => navigation.navigate('MatchDetails', { matchId: match.matchId })
        });
      });

      openings.slice(0, 10).forEach(opening => {
        normalized.push({
          id: `opening-${opening.conversationId}`,
          kind: 'OPENING',
          title: 'הודעת פתיחה',
          subtitle: `הודעה מ-${opening.otherUserName}`,
          date: new Date(opening.lastMessageAt || opening.createdAt),
          onPress: () => navigation.navigate('OpeningConversationDetails', { conversationId: opening.conversationId, otherUserName: opening.otherUserName })
        });
      });

      feedbacks.slice(0, 10).forEach(fb => {
        normalized.push({
          id: `feedback-${fb.id}`,
          kind: 'FEEDBACK',
          title: 'עדכון סטטוס פניה',
          subtitle: `פניה בנושא ${fb.type === 'BUG' ? 'באג' : fb.type === 'IMPROVEMENT' ? 'שיפור' : 'אחר'}`,
          date: new Date(fb.updatedAt || fb.resolvedAt || fb.createdAt),
          onPress: () => navigation.navigate('MyProductFeedback')
        });
      });

      reports.slice(0, 10).forEach(rep => {
        normalized.push({
          id: `report-${rep.id}`,
          kind: 'REPORT',
          title: 'עדכון סטטוס דיווח',
          subtitle: `דיווח על משתמש ${rep.reportedUserName || 'אנונימי'}`,
          date: new Date(rep.updatedAt || rep.resolvedAt || rep.createdAt),
          onPress: () => navigation.navigate('MyProductFeedback')
        });
      });

      normalized.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setItems(normalized.slice(0, 30));
    } catch (err) {
      setError('אירעה שגיאה בטעינת העדכונים');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity style={styles.card} onPress={item.onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date.toLocaleDateString('he-IL')} {item.date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>עדכונים אחרונים</Text>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>אין עדכונים חדשים</Text>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.m,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'right',
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'right',
  },
});
