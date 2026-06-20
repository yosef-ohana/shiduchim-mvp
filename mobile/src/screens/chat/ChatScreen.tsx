import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { theme } from '../../theme/theme';
import { getChatMessages, sendChatMessage, markMessagesAsRead } from '../../api/chatApi';
import { ChatMessageResponse } from '../../types/api';
import { ChatMessageBubble } from '../../components/ChatMessageBubble';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const ChatScreen = ({ route, navigation }: any) => {
  const { matchId } = route.params || {};
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const fetchingRef = useRef(false);
  const isFirstLoad = useRef(true);

  const handleMarkAsRead = async () => {
    try {
      await markMessagesAsRead(matchId);
    } catch (err) {
      console.warn('Failed to mark messages as read:', err);
    }
  };

  const fetchMessages = async (showLoadingIndicator = true) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (showLoadingIndicator) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await getChatMessages(matchId);
      const sorted = [...response.messages].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
      setMessages(sorted);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      await handleMarkAsRead();
    } catch (err: any) {
      if (showLoadingIndicator || refreshing) {
        setError(
          getFriendlyErrorMessage(err, 'טעינת הודעות הצ׳אט נכשלה.')
        );
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
    if (!trimmed) return;

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
    } catch (err: any) {
      setError(
        getFriendlyErrorMessage(err, 'שליחת ההודעה נכשלה.')
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.stateText}>פותח צ׳אט...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => fetchMessages()} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>🔄 רענון צ׳אט</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <AppInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="כתוב/כתבי הודעה..."
              style={styles.input}
              multiline
              maxLength={1000}
            />
          </View>
          <AppButton
            title="שליחה"
            onPress={handleSend}
            loading={sending}
            disabled={!inputText.trim()}
            style={styles.sendButton}
          />
        </View>
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
  header: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'flex-start',
  },
  refreshButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.s,
    backgroundColor: theme.colors.border,
  },
  refreshButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDD2',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  messageList: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    padding: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  inputWrapper: {
    flex: 1,
    marginBottom: -theme.spacing.m,
  },
  input: {
    maxHeight: 100,
    minHeight: 45,
    paddingVertical: 10,
    backgroundColor: '#F7F7F7',
  },
  sendButton: {
    marginRight: theme.spacing.s,
    height: 45,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.m,
    marginBottom: 4,
  },
});
