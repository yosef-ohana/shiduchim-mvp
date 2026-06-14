import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessageResponse } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

interface ChatMessageBubbleProps {
  message: ChatMessageResponse;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const { user } = useAuth();
  const isMe = user?.id === message.senderId;

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.container, isMe ? styles.myContainer : styles.otherContainer]}>
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <Text style={[styles.content, isMe ? styles.myText : styles.otherText]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isMe ? styles.myTime : styles.otherTime]}>
          {formatTime(message.sentAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    maxWidth: '75%',
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
  },
  myBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.s,
  },
  otherBubble: {
    backgroundColor: theme.colors.border,
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
});
