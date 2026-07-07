import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme/theme';
import { notificationsApi } from '../../api/notificationsApi';
import { getPublicProfile } from '../../api/profileApi';
import { getOpeningConversationDetails } from '../../api/openingMessagesApi';
import { getMatchDetails } from '../../api/matchesApi';
import { NotificationResponse } from '../../types/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainStack';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Notifications'>;

const getStatusLabel = (status: string | null) => {
  if (!status) return 'עודכן';
  switch (status.toUpperCase()) {
    case 'NEW':
      return 'חדש';
    case 'IN_PROGRESS':
      return 'בטיפול';
    case 'RESOLVED':
      return 'טופל';
    default:
      return status;
  }
};

const getNotificationVisuals = (notification: NotificationResponse) => {
  switch (notification.type) {
    case 'LIKE_RECEIVED':
      return {
        title: 'לייק חדש',
        explanation: 'מישהו/י הביע/ה בך עניין! לחץ/י למעבר לפרופיל',
      };
    case 'OPENING_RECEIVED':
      return {
        title: 'הודעת פתיחה חדשה',
        explanation: 'נשלחה אליך הודעת פתיחה לצורך היכרות. לחץ/י לצפייה.',
      };
    case 'MATCH_CREATED':
      return {
        title: 'התאמה חדשה!',
        explanation: 'יש לכם התאמה! לחץ/י למעבר לצ׳אט',
      };
    case 'PRODUCT_FEEDBACK_STATUS_CHANGED': {
      const statusLabel = getStatusLabel(notification.statusValue);
      return {
        title: 'עדכון סטטוס פנייה',
        explanation: `הסטטוס של פניית המערכת שלך עודכן ל: ${statusLabel}`,
      };
    }
    case 'USER_REPORT_STATUS_CHANGED': {
      const statusLabel = getStatusLabel(notification.statusValue);
      return {
        title: 'עדכון סטטוס דיווח',
        explanation: `הסטטוס של הדיווח שלך עודכן ל: ${statusLabel}`,
      };
    }
    default:
      return {
        title: 'עדכון חדש',
        explanation: 'קיבלת עדכון חדש במערכת.',
      };
  }
};

export const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const isFetchingRef = useRef(false);
  const sessionRef = useRef(0);

  const loadPage = async (pageToLoad: number, isRefresh = false) => {
    if (isFetchingRef.current) return;
    if (!isRefresh && refreshing) return;

    isFetchingRef.current = true;

    if (isRefresh) {
      setRefreshing(true);
      sessionRef.current += 1;
    } else if (pageToLoad === 0) {
      setLoading(true);
      sessionRef.current += 1;
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const currentSession = sessionRef.current;

    try {
      const data = await notificationsApi.getNotifications(pageToLoad, 30);

      if (currentSession !== sessionRef.current) {
        return;
      }

      setNotifications(prev => {
        if (isRefresh || pageToLoad === 0) {
          return data.items;
        } else {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = data.items.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        }
      });
      setPage(data.page);
      setHasNext(data.hasNext);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('אירעה שגיאה בטעינת העדכונים');
    } finally {
      if (currentSession === sessionRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
      isFetchingRef.current = false;
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPage(0, false);
    }, [])
  );

  const handleRefresh = () => {
    loadPage(0, true);
  };

  const performNavigation = async (notification: NotificationResponse) => {
    const { type, actorUserId, referenceId } = notification;

    if (type === 'LIKE_RECEIVED') {
      if (!actorUserId) {
        Alert.alert('שגיאה', 'פרופיל המשתמש אינו זמין.');
        return;
      }
      try {
        await getPublicProfile(actorUserId);
        navigation.navigate('CandidateProfile', {
          userId: actorUserId,
          sourceType: 'NOTIFICATION',
          sourceId: notification.id,
        });
      } catch (err) {
        Alert.alert('שגיאה', 'פרופיל המשתמש אינו נגיש או שנחסם.');
      }
    } else if (type === 'OPENING_RECEIVED') {
      try {
        await getOpeningConversationDetails(referenceId);
        navigation.navigate('OpeningConversationDetails', { conversationId: referenceId });
      } catch (err) {
        Alert.alert('שגיאה', 'שיחת הפתיחה אינה זמינה יותר.');
      }
    } else if (type === 'MATCH_CREATED') {
      try {
        await getMatchDetails(referenceId);
        navigation.navigate('Chat', { matchId: referenceId });
      } catch (err) {
        Alert.alert('שגיאה', 'ההתאמה או הצ׳אט אינם זמינים יותר.');
      }
    } else if (type === 'PRODUCT_FEEDBACK_STATUS_CHANGED') {
      navigation.navigate('MyProductFeedback', { focusKind: 'ProductFeedback', focusId: referenceId });
    } else if (type === 'USER_REPORT_STATUS_CHANGED') {
      navigation.navigate('MyProductFeedback', { focusKind: 'UserReport', focusId: referenceId });
    } else {
      Alert.alert('שגיאה', 'סוג התראה לא מוכר.');
    }
  };

  const handleNotificationPress = async (notification: NotificationResponse) => {
    if (actionInProgress) return;
    setActionInProgress(true);

    try {
      let updatedNotification = notification;

      if (!notification.readAt) {
        try {
          updatedNotification = await notificationsApi.markNotificationRead(notification.id);
          setNotifications(prev => prev.map(item => item.id === notification.id ? updatedNotification : item));
        } catch (err) {
          Alert.alert('שגיאה', 'לא ניתן לסמן את ההתראה כנקראת');
          setActionInProgress(false);
          return;
        }
      }

      await performNavigation(updatedNotification);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleProfilePress = async (notification: NotificationResponse) => {
    if (actionInProgress) return;
    setActionInProgress(true);

    try {
      let updatedNotification = notification;

      if (!notification.readAt) {
        try {
          updatedNotification = await notificationsApi.markNotificationRead(notification.id);
          setNotifications(prev => prev.map(item => item.id === notification.id ? updatedNotification : item));
        } catch (err) {
          Alert.alert('שגיאה', 'לא ניתן לסמן את ההתראה כנקראת');
          setActionInProgress(false);
          return;
        }
      }

      if (!updatedNotification.actorUserId) {
        Alert.alert('שגיאה', 'פרופיל המשתמש אינו זמין.');
        return;
      }

      try {
        await getPublicProfile(updatedNotification.actorUserId);
        navigation.navigate('CandidateProfile', {
          userId: updatedNotification.actorUserId,
          sourceType: 'NOTIFICATION',
          sourceId: updatedNotification.id,
        });
      } catch (err) {
        Alert.alert('שגיאה', 'פרופיל המשתמש אינו נגיש או שנחסם.');
      }
    } finally {
      setActionInProgress(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (actionInProgress) return;
    setActionInProgress(true);

    try {
      await notificationsApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(item => ({
        ...item,
        readAt: item.readAt || new Date().toISOString()
      })));
    } catch (err) {
      Alert.alert('שגיאה', 'לא ניתן לסמן את כל ההתראות כנקראות');
    } finally {
      setActionInProgress(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('he-IL');
    } catch {
      return dateStr;
    }
  };

  const renderItem = ({ item }: { item: NotificationResponse }) => {
    const visuals = getNotificationVisuals(item);
    const showProfileButton =
      (item.type === 'OPENING_RECEIVED' || item.type === 'MATCH_CREATED') &&
      item.actorUserId !== null;

    return (
      <View style={[styles.cardContainer, !item.readAt ? styles.cardUnread : styles.cardRead]}>
        <TouchableOpacity
          style={styles.cardMainArea}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              {!item.readAt && <View style={styles.unreadDot} />}
              <Text style={styles.title}>{visuals.title}</Text>
            </View>
            <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.explanation}>{visuals.explanation}</Text>
        </TouchableOpacity>

        {showProfileButton && (
          <View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => handleProfilePress(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.profileButtonText}>צפייה בפרופיל</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <ActivityIndicator size="small" color={theme.colors.primary} style={styles.footerLoader} />
      );
    }
    if (hasNext) {
      return (
        <TouchableOpacity style={styles.loadMoreButton} onPress={() => loadPage(page + 1)} disabled={actionInProgress}>
          <Text style={styles.loadMoreText}>טען עוד</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>עדכונים אחרונים</Text>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} disabled={actionInProgress}>
              <Text style={[styles.markAllText, actionInProgress && styles.disabledText]}>סמן הכול כנקרא</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : notifications.length === 0 ? (
          <Text style={styles.emptyText}>אין עדכונים חדשים</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
            }
            ListFooterComponent={renderFooter}
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
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  markAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
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
  cardContainer: {
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  cardUnread: {
    backgroundColor: '#FFFBF2',
    borderColor: theme.colors.primary,
  },
  cardRead: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  cardMainArea: {
    padding: theme.spacing.m,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 6,
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
  explanation: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  profileButton: {
    paddingVertical: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  footerLoader: {
    marginVertical: theme.spacing.m,
  },
  loadMoreButton: {
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.s,
  },
  loadMoreText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
