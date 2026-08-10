import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { StateSurface } from '../../components/foundation/StateSurface';
import { AppIcon } from '../../components/foundation/AppIcon';
import { IconButton } from '../../components/foundation/IconButton';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { getChatMessages, sendChatMessage, markMessagesAsRead } from '../../api/chatApi';
import { getMatchDetails } from '../../api/matchesApi';
import { ChatMessageResponse, MatchDetailsResponse } from '../../types/api';
import { ChatMessageBubble } from '../../components/ChatMessageBubble';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getImageUrl } from '../../utils/imageUrl';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UserShellStackParamList } from '../../types/navigation';
import { getPoolTypeLabel } from '../../utils/displayLabels';

type Props = NativeStackScreenProps<UserShellStackParamList, 'Chat'>;

export const ChatScreen = ({ route, navigation }: Props) => {
  const { matchId, returnIntent } = route.params || {};

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (returnIntent?.kind === 'MATCH_DETAILS') {
      navigation.navigate('MatchDetails', { matchId: returnIntent.matchId });
    } else if (returnIntent?.kind === 'OPENING_DETAILS') {
      navigation.navigate('OpeningConversationDetails', { conversationId: returnIntent.conversationId });
    } else if (returnIntent?.kind === 'OPENING_MESSAGES') {
      navigation.navigate('OpeningMessages');
    } else {
      navigation.navigate('UserTabs', { screen: 'ChatsRoot' });
    }
  };

  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDenied, setIsDenied] = useState(false);
  const [isChatAccessUnavailable, setIsChatAccessUnavailable] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [matchDetails, setMatchDetails] = useState<MatchDetailsResponse | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const fetchingRef = useRef(false);
  const isFirstLoad = useRef(true);
  const hasHandledTerminalExitRef = useRef(false);

  const handleMarkAsRead = async () => {
    if (!matchId) return;
    try {
      await markMessagesAsRead(matchId);
    } catch (err) {
      console.warn('Failed to mark messages as read:', err);
    }
  };

  const fetchMessages = async (showLoadingIndicator = true) => {
    if (!matchId || fetchingRef.current) return;
    fetchingRef.current = true;

    if (showLoadingIndicator) {
      setLoading(true);
    }

    try {
      const [detailsData, messagesData] = await Promise.all([
        getMatchDetails(matchId),
        getChatMessages(matchId),
      ]);

      setMatchDetails(detailsData);
      if (detailsData && detailsData.status === 'ACTIVE') {
        setIsChatAccessUnavailable(false);
        hasHandledTerminalExitRef.current = false;
      } else if (detailsData && detailsData.status !== 'ACTIVE') {
        setIsChatAccessUnavailable(true);
        if (!hasHandledTerminalExitRef.current) {
          hasHandledTerminalExitRef.current = true;
          Alert.alert(
            'השידוך אינו פעיל',
            'השידוך בוטל ולא ניתן להמשיך בשיחה.',
            [
              {
                text: 'אישור',
                onPress: handleBack,
              },
            ]
          );
        }
      }

      const sorted = [...messagesData.messages].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
      setMessages(sorted);
      setError(null);
      setIsDenied(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      await handleMarkAsRead();
    } catch (err: unknown) {
      let statusCode: number | undefined;
      if (axios.isAxiosError(err)) {
        statusCode = err.response?.status;
      }

      if (statusCode === 404 || statusCode === 403 || statusCode === 401) {
        // Authoritative server rejection: Chat context is unavailable (no status fabrication)
        setIsChatAccessUnavailable(true);
        if (!hasHandledTerminalExitRef.current) {
          hasHandledTerminalExitRef.current = true;
          Alert.alert(
            'השידוך אינו פעיל',
            'השידוך בוטל ולא ניתן להמשיך בשיחה.',
            [
              {
                text: 'אישור',
                onPress: handleBack,
              },
            ]
          );
        }
      } else {
        const friendlyMsg = getFriendlyErrorMessage(err, 'טעינת הודעות הצ׳אט נכשלה.');
        if (showLoadingIndicator || messages.length === 0) {
          setError(friendlyMsg);
        } else {
          setError(friendlyMsg);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    isFirstLoad.current = true;
  }, [matchId]);

  useFocusEffect(
    useCallback(() => {
      fetchMessages(isFirstLoad.current);
      isFirstLoad.current = false;

      const intervalId = setInterval(() => {
        fetchMessages(false);
      }, 10000);

      return () => {
        clearInterval(intervalId);
      };
    }, [matchId])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages(false);
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending || !matchDetails || matchDetails.status !== 'ACTIVE' || isChatAccessUnavailable) return;

    setSending(true);
    setError(null);
    try {
      const newMsg = await sendChatMessage(matchId, trimmed);
      setInputText('');
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);

      fetchMessages(false);
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err, 'שליחת ההודעה נכשלה.'));
    } finally {
      setSending(false);
    }
  };

  // 1. HTTP 403 / Access Denial State
  if (isDenied) {
    return (
      <ScreenContainer testID="chat-screen-denied">
        <StateSurface
          kind="denied"
          title="אין הרשאה לגישה"
          message="אין לך הרשאה לצפות בצ׳אט זה."
          primaryAction={{
            label: 'חזרה',
            onPress: handleBack,
          }}
        />
      </ScreenContainer>
    );
  }

  // 2. Initial Loading State
  if (loading && !matchDetails && messages.length === 0) {
    return (
      <ScreenContainer testID="chat-screen-loading">
        <StateSurface
          kind="loading"
          title="פותח צ׳אט..."
          message="טוען נתוני שיחה והודעות"
        />
      </ScreenContainer>
    );
  }

  // 3. Initial Load Error (No data loaded)
  if (error && !matchDetails && messages.length === 0) {
    return (
      <ScreenContainer testID="chat-screen-error">
        <StateSurface
          kind="error"
          title="שגיאה בטעינת הצ׳אט"
          message={error}
          primaryAction={{
            label: 'נסה שוב',
            onPress: () => fetchMessages(true),
          }}
        />
      </ScreenContainer>
    );
  }

  const isMatchActive = matchDetails?.status === 'ACTIVE' && !isChatAccessUnavailable;
  const isMatchBlocked = matchDetails?.status === 'BLOCKED';
  const isUnknownStatus = matchDetails !== null && !isMatchActive && !isMatchBlocked;

  const otherUser = matchDetails?.otherUserProfile;
  const avatarUrl = otherUser ? getImageUrl(otherUser.primaryPhotoUrl) : null;

  return (
    <ScreenContainer keyboardAware containerStyle={styles.screenContainer}>
      {/* Contextual Conversation Header */}
      <View style={styles.header}>
        <View style={styles.headerRightGroup}>
          <IconButton
            icon="arrow-left"
            onPress={handleBack}
            accessibilityLabel="חזרה"
            variant="header"
            testID="chat-back-button"
          />
          {otherUser ? (
            <TouchableOpacity
              onPress={() => {
                if (otherUser.userId && matchDetails) {
                  navigation.navigate('CandidateProfile', {
                    userId: otherUser.userId,
                    sourceType: 'MATCH',
                    sourceId: matchDetails.matchId,
                    poolType: matchDetails.poolType,
                    weddingId: matchDetails.weddingId ?? undefined,
                    returnIntent: {
                      kind: 'ACTIVE_CHAT',
                      role: 'USER',
                      sourceRoute: 'Chat',
                      matchId: matchDetails.matchId,
                    },
                  });
                }
              }}
              style={styles.headerProfileContainer}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`פרופיל של ${otherUser.fullName}`}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
              ) : (
                <View style={styles.headerPlaceholderAvatar}>
                  <Text style={styles.headerPlaceholderText}>
                    {otherUser.fullName ? otherUser.fullName[0] : 'פ'}
                  </Text>
                </View>
              )}
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerName} numberOfLines={1}>
                  {otherUser.fullName}
                </Text>
                {matchDetails && (
                  <Text style={styles.headerStatusText} numberOfLines={1}>
                    {getPoolTypeLabel(matchDetails.poolType)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerProfileContainer}>
              <Text style={styles.headerName}>צ׳אט</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => fetchMessages(false)}
          style={styles.refreshButton}
          accessibilityRole="button"
          accessibilityLabel="רענון צ׳אט"
        >
          <AppIcon name="info" size={sizing.iconSm} color={colors.textPrimary} />
          <Text style={styles.refreshButtonText}>רענון</Text>
        </TouchableOpacity>
      </View>

      {/* Partial error / refresh failure message banner */}
      {error && (matchDetails || messages.length > 0) && (
        <View style={styles.errorContainer} accessibilityLiveRegion="polite">
          <AppIcon name="alert-circle" size={sizing.iconSm} color={colors.statusError} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Unsupported status warning banner */}
      {isUnknownStatus && (
        <View style={styles.warningContainer} accessibilityLiveRegion="polite">
          <AppIcon name="info" size={sizing.iconSm} color={colors.statusWarning} />
          <Text style={styles.warningText}>
            סטטוס השידוך אינו מוכר. לא ניתן לשלוח הודעות כעת.
          </Text>
        </View>
      )}

      {/* Message history list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ChatMessageBubble message={item} />}
        contentContainerStyle={styles.messageList}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>עדיין אין הודעות</Text>
            <Text style={styles.emptySubtitle}>שלח/י הודעה כדי להתחיל בשיחה!</Text>
          </View>
        }
      />

      {/* Composer or Terminal surface */}
      {isMatchActive ? (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <AppInput
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                if (error) setError(null);
              }}
              placeholder="כתוב/כתבי הודעה..."
              style={styles.input}
              multiline
              maxLength={1000}
              disabled={sending}
              accessibilityLabel="תוכן ההודעה"
            />
          </View>
          <AppButton
            title="שליחה"
            onPress={handleSend}
            loading={sending}
            disabled={!inputText.trim() || sending}
            style={styles.sendButton}
            accessibilityLabel="שליחת הודעה"
          />
        </View>
      ) : isMatchBlocked ? (
        <View style={styles.terminalContainer} accessibilityLiveRegion="polite">
          <AppIcon name="lock" size={sizing.iconSm} color={colors.textSecondary} />
          <Text style={styles.terminalText}>השידוך אינו פעיל. לא ניתן לשלוח הודעות.</Text>
        </View>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    paddingHorizontal: 0,
  },
  header: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: sizing.headerHeight,
  },
  headerRightGroup: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  headerProfileContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    minHeight: sizing.minTouchTarget,
    marginRight: spacing.xs,
    flex: 1,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
  },
  headerPlaceholderAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPlaceholderText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  headerTextContainer: {
    marginRight: spacing.xs,
    justifyContent: 'center',
    flex: 1,
  },
  headerName: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  headerStatusText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  refreshButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSubtle,
    minHeight: sizing.minTouchTarget,
    gap: spacing.xxs,
  },
  refreshButtonText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  errorContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.statusErrorBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.statusErrorBorder,
    gap: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.statusError,
    flex: 1,
    textAlign: 'right',
  },
  warningContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.statusWarningBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.statusWarningBorder,
    gap: spacing.xs,
  },
  warningText: {
    ...typography.caption,
    color: colors.statusWarning,
    flex: 1,
    textAlign: 'right',
  },
  messageList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    ...typography.titleMedium,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    maxHeight: 100,
    minHeight: sizing.inputHeight,
  },
  sendButton: {
    marginRight: spacing.sm,
    height: sizing.inputHeight,
    minWidth: 80,
    justifyContent: 'center',
  },
  terminalContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    gap: spacing.xs,
  },
  terminalText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
