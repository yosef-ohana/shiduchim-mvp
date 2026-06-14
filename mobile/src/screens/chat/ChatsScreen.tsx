import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getConversations } from '../../api/chatsApi';
import { ConversationResponse } from '../../types/api';
import { getImageUrl } from '../../utils/imageUrl';
import { getPoolTypeLabel } from '../../utils/displayLabels';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

const formatLastMessageTime = (isoString?: string | null) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

export const ChatsScreen = ({ navigation }: any) => {
  const [chats, setChats] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchingRef = useRef(false);
  const isFirstLoad = useRef(true);

  const fetchChats = async (showLoadingIndicator = true) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (showLoadingIndicator) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getConversations();
      setChats(data);
    } catch (err: any) {
      // Only set error during full loading or manual refresh, not silent polling
      if (showLoadingIndicator || refreshing) {
        setError(
          getFriendlyErrorMessage(err, 'טעינת השיחות נכשלה. אנא נסה שוב.')
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchingRef.current = false;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChats(isFirstLoad.current);
      isFirstLoad.current = false;

      const intervalId = setInterval(() => {
        fetchChats(false);
      }, 15000); // 15 seconds light refresh

      return () => {
        clearInterval(intervalId);
      };
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChats(false);
  };

  const renderItem = ({ item }: { item: ConversationResponse }) => {
    const avatarUrl = getImageUrl(item.otherUserPrimaryPhotoUrl);
    const contextText = getPoolTypeLabel(item.poolType);
    const messageTime = formatLastMessageTime(item.lastMessageAt);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>אין תמונה</Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <View style={styles.nameTimeRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.otherUserFullName}
              </Text>
              {!!messageTime && (
                <Text style={styles.timeText}>{messageTime}</Text>
              )}
            </View>

            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessagePreview || 'עדיין אין הודעות'}
            </Text>

            <View style={styles.badgeContainer}>
              <Text style={styles.contextLabel}>{contextText}</Text>
              {item.unreadCount !== undefined && item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <AppButton
            title="💬 פתיחת צ׳אט"
            onPress={() => navigation.navigate('Chat', { matchId: item.matchId })}
            style={styles.chatButton}
          />
          <AppButton
            title="👤 צפייה בפרופיל"
            onPress={() => navigation.navigate('MatchDetails', { matchId: item.matchId })}
            style={styles.profileButton}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>טוען שיחות...</Text>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <AppButton title="נסה שוב" onPress={() => fetchChats()} style={styles.retryButton} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>שיחות</Text>
        <TouchableOpacity onPress={() => fetchChats()} style={styles.refreshIconContainer}>
          <Text style={styles.refreshIconText}>🔄 רענון</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.matchId.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>עדיין אין שיחות</Text>
            <Text style={styles.emptySubtitle}>
              אין לך שיחות פעילות. כנס לגילוי, סמן לייק לפרופילים אחרים, ותוכל להתכתב ברגע שתיווצר התאמה!
            </Text>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  loadingText: {
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    lineHeight: 22,
  },
  retryButton: {
    width: '60%',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.s,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  refreshIconContainer: {
    padding: 6,
    borderRadius: theme.borderRadius.s,
    backgroundColor: theme.colors.border,
  },
  refreshIconText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  listContainer: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.border,
  },
  placeholderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    marginRight: theme.spacing.m,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
  nameTimeRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'left',
  },
  lastMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  badgeContainer: {
    flexDirection: 'row-reverse',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  unreadBadge: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.s,
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: theme.spacing.m,
    gap: theme.spacing.m,
  },
  chatButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.s,
  },
  profileButton: {
    flex: 1,
    backgroundColor: '#4A4A4A',
    paddingVertical: theme.spacing.s,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
