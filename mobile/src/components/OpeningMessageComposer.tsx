import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { AppInput } from './AppInput';
import { AppButton } from './AppButton';
import { theme } from '../theme/theme';

interface OpeningMessageComposerProps {
  visible: boolean;
  onClose: () => void;
  onSend: (content: string) => Promise<void>;
  title?: string;
  subtitle?: string;
}

export const OpeningMessageComposer: React.FC<OpeningMessageComposerProps> = ({
  visible,
  onClose,
  onSend,
  title = 'שליחת הודעת פתיחה',
  subtitle = 'כתוב/י הודעה קצרה ומכבדת',
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!content.trim()) {
      setError('יש להזין תוכן להודעה');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError(null);

    try {
      await onSend(content.trim());
      setContent('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'שליחת ההודעה נכשלה. אנא נסו שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setError(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
            >
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                  {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>

                <AppInput
                  value={content}
                  onChangeText={(text) => {
                    setContent(text);
                    setError(null);
                  }}
                  placeholder="הודעה..."
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                  style={styles.input}
                  error={error || undefined}
                />
                
                <Text style={styles.charCount}>{content.length}/1000</Text>

                <View style={styles.actions}>
                  <AppButton 
                    title="ביטול" 
                    onPress={handleClose} 
                    style={[styles.button, styles.cancelButton]} 
                    variant="secondary"
                    disabled={loading}
                  />
                  <AppButton 
                    title="שליחה" 
                    onPress={handleSend} 
                    style={[styles.button, styles.sendButton]} 
                    loading={loading}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
  },
  content: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.l,
    borderTopRightRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.l,
  },
  header: {
    marginBottom: theme.spacing.m,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  input: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'left',
    marginTop: 4,
    marginBottom: theme.spacing.m,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.m,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
  },
});
