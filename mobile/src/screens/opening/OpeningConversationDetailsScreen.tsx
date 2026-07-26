import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { StateSurface } from '../../components/foundation/StateSurface';
import { AppIcon } from '../../components/foundation/AppIcon';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { getOpeningConversationDetails, replyToOpeningMessage } from '../../api/openingMessagesApi';
import { getPublicProfile } from '../../api/profileApi';
import { OpeningConversationDetailsResponse, OpeningMessageResponse, PublicProfileResponse } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getImageUrl } from '../../utils/imageUrl';

export const OpeningConversationDetailsScreen = ({ route, navigation }: any) => {
  const { conversationId, otherUserName } = route.params || {};
  const { user } = useAuth();
  const [details, setDetails] = useState<OpeningConversationDetailsResponse | null>(null);
  const [otherProfile, setOtherProfile] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDenied, setIsDenied] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchDetails = async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getOpeningConversationDetails(conversationId);
      setDetails(data);
      setIsDenied(false);

      if (data && data.otherUserId) {
        try {
          const profileData = await getPublicProfile(data.otherUserId);
          setOtherProfile(profileData);
        } catch (profileErr) {
          // Gracefully swallow public profile error to keep screen functional
        }
      }
    } catch (err: any) {
      const statusCode = err?.response?.status;
      if (statusCode === 403 || statusCode === 401) {
        // Clear protected conversation and profile data before rendering denial StateSurface
        setDetails(null);
        setOtherProfile(null);
        setIsDenied(true);
      } else {
        setError(getFriendlyErrorMessage(err, 'טעינת ההודעות נכשלה. אנא נסו שוב.'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [conversationId]);

  const sendReply = async (confirmCreateMatch = false) => {
    const trimmed = replyContent.trim();
    if (!trimmed || sending || !details) return;

    setSending(true);
    try {
      const response = await replyToOpeningMessage(conversationId, {
        content: trimmed,
        confirmCreateMatch,
      });

      if (response.matchCreated && response.matchId) {
        Alert.alert(
          'נוצרה התאמה!',
          'נוצרה התאמה. כעת אפשר להמשיך בצ׳אט.',
          [
            {
              text: 'אישור',
              onPress: () => {
                navigation.replace('MatchDetails', { matchId: response.matchId });
              },
            },
          ]
        );
      } else {
        setReplyContent('');
        await fetchDetails();
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || '';
      if (serverMessage.includes('requiresMatchConfirmation') || err.response?.data?.requiresMatchConfirmation) {
        Alert.alert(
          'יצירת התאמה',
          'שליחת הודעה נוספת תיחשב להסכמה להמשך ההיכרות, תיצור התאמה ותפתח אפשרות לצ׳אט. להמשיך?',
          [
            { text: 'ביטול', style: 'cancel' },
            { text: 'המשך', onPress: () => sendReply(true) },
          ]
        );
      } else {
        Alert.alert('שגיאה', getFriendlyErrorMessage(err, 'שליחת התגובה נכשלה. אנא נסו שוב.'));
      }
    } finally {
      setSending(false);
    }
  };

  const handleSendPress = () => {
    if (details?.requiresMatchConfirmation) {
      Alert.alert(
        'יצירת התאמה',
        'שליחת הודעה נוספת תיחשב להסכמה להמשך ההיכרות, תיצור התאמה ותפתח אפשרות לצ׳אט. להמשיך?',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'המשך', onPress: () => sendReply(true) },
        ]
      );
    } else {
      sendReply(false);
    }
  };

  const renderMessage = ({ item }: { item: OpeningMessageResponse }) => {
    const isMe = item.senderUserId === user?.id;
    const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.bubbleContainer, isMe ? styles.myContainer : styles.otherContainer]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.content, isMe ? styles.myText : styles.otherText]}>
            {item.content}
          </Text>
          <Text style={[styles.time, isMe ? styles.myTime : styles.otherTime]}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  // 1. HTTP 403 / Access Denial State
  if (isDenied) {
    return (
      <ScreenContainer testID="opening-details-denied">
        <StateSurface
          kind="denied"
          title="אין הרשאה לגישה"
          message="אין לך הרשאה לצפות בהודעת פתיחה זו."
          primaryAction={{
            label: 'חזרה',
            onPress: () => navigation.goBack(),
          }}
        />
      </ScreenContainer>
    );
  }

  // 2. Initial Loading State
  if (loading && !details) {
    return (
      <ScreenContainer testID="opening-details-loading">
        <StateSurface
          kind="loading"
          title="טוען הודעות..."
          message="טוען את שיחת הפתיחה"
        />
      </ScreenContainer>
    );
  }

  // 3. Initial Load Error State
  if (error && !details) {
    return (
      <ScreenContainer testID="opening-details-error">
        <StateSurface
          kind="error"
          title="שגיאה בטעינת הודעות"
          message={error}
          primaryAction={{
            label: 'נסה שוב',
            onPress: fetchDetails,
          }}
        />
      </ScreenContainer>
    );
  }

  const isOpener = user?.id === details?.openerUserId;
  const isRecipient = user?.id === details?.recipientUserId;
  const isMatchCreated = details?.status === 'MATCH_CREATED' || details?.matchCreated === true;
  const isTerminal = details?.status === 'EXPIRED' || details?.status === 'REJECTED';
  const isOpen = details?.status === 'OPEN' && !isMatchCreated;
  const hasRecipientReplied = details ? details.messages.some((m) => m.senderUserId === details.recipientUserId) : false;

  const otherUserDisplayName = otherProfile?.fullName || otherUserName || 'פרופיל המשתמש';
  const avatarUrl = getImageUrl(otherProfile?.primaryPhotoUrl);

  return (
    <ScreenContainer keyboardAware containerStyle={styles.screenContainer}>
      {/* Header identity bar */}
      {details && (
        <TouchableOpacity
          style={styles.userHeader}
          onPress={() => {
            if (details.otherUserId) {
              navigation.navigate('CandidateProfile', {
                userId: details.otherUserId,
                sourceType: 'OPENING',
                sourceId: details.conversationId,
                poolType: details.poolType,
                weddingId: details.weddingId ?? undefined,
                sourceContext: 'OPENING_DETAILS',
                contextLabel: 'הגעת מפרטי הודעת פתיחה',
              });
            }
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`פרופיל של ${otherUserDisplayName}`}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarPlaceholderText}>
                {otherUserDisplayName[0]}
              </Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerNameText} numberOfLines={1}>
              {otherUserDisplayName}
            </Text>
            <Text style={styles.headerSubtitleText}>לחץ/י לצפייה בפרופיל</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Message history */}
      <FlatList
        ref={flatListRef}
        data={details?.messages || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Opener informational banner */}
      {isOpener && isOpen && (
        <View style={styles.infoBanner} accessibilityLiveRegion="polite">
          <AppIcon name="info" size={sizing.iconSm} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {hasRecipientReplied
              ? 'התקבלה תגובה. אם הצד השני יבחר להמשיך בהודעה נוספת, תיווצר התאמה.'
              : 'הודעת הפתיחה נשלחה. כעת ממתינים לתגובה מהצד השני.'}
          </Text>
        </View>
      )}

      {/* Recipient info banner & composer */}
      {isRecipient && isOpen && (
        <>
          <View style={styles.infoBanner} accessibilityLiveRegion="polite">
            <AppIcon name="info" size={sizing.iconSm} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {hasRecipientReplied || details?.requiresMatchConfirmation
                ? 'התגובה נשלחה. הודעה נוספת תיחשב להסכמה להמשך ההיכרות ותיצור התאמה.'
                : `נשלחה אליך הודעת פתיחה מ־${otherUserDisplayName} לצורך היכרות. אפשר להשיב פעם אחת ללא יצירת התאמה.`}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <AppInput
              value={replyContent}
              onChangeText={setReplyContent}
              placeholder="כתוב/י תגובה..."
              style={styles.input}
              multiline
              maxLength={1000}
              disabled={sending}
              accessibilityLabel="תוכן התגובה"
            />
            <AppButton
              title={details?.requiresMatchConfirmation ? 'שליחה ויצירת התאמה' : 'שליחת תגובה'}
              onPress={handleSendPress}
              disabled={!replyContent.trim() || sending}
              loading={sending}
              style={styles.sendButton}
              accessibilityLabel="שליחת תגובה"
            />
          </View>
        </>
      )}

      {/* Matched banner */}
      {isMatchCreated && (
        <View style={styles.matchedBanner} accessibilityLiveRegion="polite">
          <AppIcon name="check" size={sizing.iconSm} color={colors.statusSuccess} />
          <Text style={styles.matchedText}>
            נוצרה התאמה. כעת אפשר להמשיך בצ׳אט.
          </Text>
          {details?.matchId ? (
            <AppButton
              title="מעבר לצ׳אט"
              onPress={() => navigation.navigate('Chat', { matchId: details.matchId })}
              style={styles.chatButton}
              accessibilityLabel="מעבר לצ׳אט"
            />
          ) : null}
        </View>
      )}

      {/* Terminal EXPIRED / REJECTED banner */}
      {isTerminal && !isMatchCreated && (
        <View style={styles.terminalBanner} accessibilityLiveRegion="polite">
          <AppIcon name="lock" size={sizing.iconSm} color={colors.textSecondary} />
          <Text style={styles.terminalText}>שיחת הפתיחה אינה פעילה.</Text>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    paddingHorizontal: 0,
  },
  userHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    minHeight: sizing.headerHeight,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
  },
  headerAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarPlaceholderText: {
    color: colors.textInverse,
    ...typography.titleMedium,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: spacing.md,
    alignItems: 'flex-end',
  },
  headerNameText: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  headerSubtitleText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  bubbleContainer: {
    marginVertical: spacing.xs,
    flexDirection: 'row',
    width: '100%',
  },
  myContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radii.xs,
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderBottomLeftRadius: radii.xs,
  },
  content: {
    ...typography.bodyMedium,
    lineHeight: 22,
    textAlign: 'right',
  },
  myText: {
    color: colors.textInverse,
  },
  otherText: {
    color: colors.textPrimary,
  },
  time: {
    ...typography.caption,
    fontSize: 10,
    marginTop: spacing.xxs,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: colors.textInverse,
    opacity: 0.85,
  },
  otherTime: {
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    marginBottom: 0,
    marginLeft: spacing.sm,
    minHeight: sizing.inputHeight,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: spacing.md,
    height: sizing.inputHeight,
  },
  infoBanner: {
    flexDirection: 'row-reverse',
    padding: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    flex: 1,
  },
  matchedBanner: {
    padding: spacing.lg,
    backgroundColor: colors.statusSuccessBg,
    borderTopWidth: 1,
    borderTopColor: colors.statusSuccessBorder,
    alignItems: 'center',
    gap: spacing.sm,
  },
  matchedText: {
    ...typography.titleSmall,
    color: colors.statusSuccess,
    textAlign: 'center',
  },
  chatButton: {
    width: '100%',
    marginTop: spacing.xs,
  },
  terminalBanner: {
    flexDirection: 'row-reverse',
    padding: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  terminalText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
