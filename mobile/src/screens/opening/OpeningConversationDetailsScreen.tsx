import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getOpeningConversationDetails, replyToOpeningMessage } from '../../api/openingMessagesApi';
import { OpeningConversationDetailsResponse, OpeningMessageResponse } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const OpeningConversationDetailsScreen = ({ route, navigation }: any) => {
  const { conversationId } = route.params || {};
  const { user } = useAuth();
  const [details, setDetails] = useState<OpeningConversationDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOpeningConversationDetails(conversationId);
      setDetails(data);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'טעינת ההודעות נכשלה. אנא נסו שוב.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [conversationId]);

  const sendReply = async (confirmCreateMatch = false) => {
    if (!replyContent.trim()) return;

    setSending(true);
    try {
      const response = await replyToOpeningMessage(conversationId, {
        content: replyContent.trim(),
        confirmCreateMatch,
      });

      if (response.matchCreated && response.matchId) {
        Alert.alert(
          'נוצרה התאמה!',
          'נוצרה התאמה! אפשר להמשיך לצ׳אט.',
          [
            { 
              text: 'אישור', 
              onPress: () => {
                navigation.replace('MatchDetails', { matchId: response.matchId });
              } 
            }
          ]
        );
      } else {
        setReplyContent('');
        await fetchDetails();
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || '';
      // If backend says confirmation is needed via validation error or boolean
      if (serverMessage.includes('requiresMatchConfirmation') || err.response?.data?.requiresMatchConfirmation) {
        Alert.alert(
          'יצירת התאמה',
          'התגובה הבאה תיצור התאמה ותפתח צ׳אט רגיל. להמשיך?',
          [
            { text: 'ביטול', style: 'cancel' },
            { text: 'המשך', onPress: () => sendReply(true) }
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
        'התגובה הבאה תיצור התאמה ותפתח צ׳אט רגיל. להמשיך?',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'המשך', onPress: () => sendReply(true) }
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

  if (loading && !details) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.stateText}>טוען הודעות...</Text>
      </Screen>
    );
  }

  if (error && !details) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <AppButton title="נסה שוב" onPress={fetchDetails} style={styles.retryButton} />
      </Screen>
    );
  }

  const isOpener = user?.id === details?.openerUserId;
  const isMatchCreated = details?.status === 'CONVERTED';

  return (
    <Screen>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={details?.messages || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {!isOpener && !isMatchCreated && details?.status === 'OPEN' && (
          <View style={styles.inputContainer}>
            <AppInput
              value={replyContent}
              onChangeText={setReplyContent}
              placeholder="כתוב/י תגובה..."
              style={styles.input}
              multiline
              maxLength={1000}
            />
            <AppButton
              title="שליחה"
              onPress={handleSendPress}
              disabled={!replyContent.trim() || sending}
              loading={sending}
              style={styles.sendButton}
            />
          </View>
        )}
        
        {isOpener && details?.status === 'OPEN' && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              ההודעה נשלחה בהצלחה. יש להמתין לתשובה מהצד השני.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  stateText: {
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  retryButton: {
    width: '60%',
  },
  listContainer: {
    padding: theme.spacing.m,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  bubbleContainer: {
    marginVertical: 4,
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
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
  },
  myBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.s,
  },
  otherBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: theme.borderRadius.s,
  },
  content: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'right',
  },
  myText: {
    color: theme.colors.surface,
  },
  otherText: {
    color: theme.colors.text,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTime: {
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    padding: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginBottom: 0,
    marginLeft: theme.spacing.s,
    minHeight: 40,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: theme.spacing.m,
    height: 44,
  },
  infoBanner: {
    padding: theme.spacing.m,
    backgroundColor: '#FAF7F0',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
