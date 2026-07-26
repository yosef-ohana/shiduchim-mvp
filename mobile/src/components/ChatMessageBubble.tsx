import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessageResponse } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radii } from '../theme/tokens';
import { typography } from '../theme/typography';

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
    maxWidth: '75%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radii.xs,
  },
  otherBubble: {
    backgroundColor: colors.surfaceSubtle,
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
});
