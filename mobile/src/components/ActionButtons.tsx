import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { AppButton } from './AppButton';
import { theme } from '../theme/theme';
import { PoolType } from '../types/api';
import { likeUser, dislikeUser, freezeUser } from '../api/actionsApi';
import { getFriendlyErrorMessage } from '../utils/errorMessage';

interface ActionButtonsProps {
  targetUserId: number;
  poolType: PoolType;
  weddingId?: number;
  onActionCompleted: (matchCreated: boolean, matchId?: number) => void;
  onOpeningMessagePress?: () => void;
  hasOpenOpeningConversation?: boolean;
  openingConversationDirection?: 'SENT' | 'RECEIVED';
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  targetUserId,
  poolType,
  weddingId,
  onActionCompleted,
  onOpeningMessagePress,
  hasOpenOpeningConversation,
  openingConversationDirection,
}) => {
  const [loadingAction, setLoadingAction] = useState<'LIKE' | 'DISLIKE' | 'FREEZE' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: 'LIKE' | 'DISLIKE' | 'FREEZE') => {
    const execute = async () => {
      setLoadingAction(action);
      setError(null);

      try {
        const params = { poolType, weddingId };
        let response;

        if (action === 'LIKE') {
          response = await likeUser(targetUserId, params);
          if (response.matchCreated === false) {
            Alert.alert(
              'הלייק נשלח',
              'כעת ממתינים ללייק מהצד השני כדי ליצור התאמה.'
            );
          }
        } else if (action === 'DISLIKE') {
          response = await dislikeUser(targetUserId, params);
        } else {
          response = await freezeUser(targetUserId, params);
        }

        onActionCompleted(response.matchCreated, response.matchId || undefined);
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err, 'ביצוע הפעולה נכשל. נסה שוב.'));
      } finally {
        setLoadingAction(null);
      }
    };

    if (action === 'LIKE') {
      Alert.alert(
        'סימון לייק',
        'אם גם הצד השני יסמן לייק, ייווצר שידוך ותוכלו להתכתב.',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'לייק', onPress: execute },
        ]
      );
    } else if (action === 'DISLIKE') {
      Alert.alert(
        'לא מתאים',
        'משתמש זה יועבר לרשימת הלא מתאימים ולא יופיע שוב בפיד שלך.',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'לא מתאים', style: 'destructive', onPress: execute },
        ]
      );
    } else if (action === 'FREEZE') {
      Alert.alert(
        'שמור בצד',
        'משתמש זה יישמר בצד ולא יופיע בפיד שלך עד שתסיר אותו מרשימת השמורים בצד.',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'שמור בצד', onPress: execute },
        ]
      );
    }
  };

  const isAnyLoading = loadingAction !== null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <AppButton
          title="לא מתאים"
          onPress={() => handleAction('DISLIKE')}
          loading={loadingAction === 'DISLIKE'}
          disabled={isAnyLoading}
          style={[styles.button, styles.dislikeButton]}
        />
        <AppButton
          title="שמור בצד"
          onPress={() => handleAction('FREEZE')}
          loading={loadingAction === 'FREEZE'}
          disabled={isAnyLoading}
          style={[styles.button, styles.freezeButton]}
        />
        <AppButton
          title="לייק"
          onPress={() => handleAction('LIKE')}
          loading={loadingAction === 'LIKE'}
          disabled={isAnyLoading}
          style={[styles.button, styles.likeButton]}
        />
      </View>
      {onOpeningMessagePress && !hasOpenOpeningConversation && (
        <AppButton
          title="שלח/י הודעת פתיחה"
          onPress={onOpeningMessagePress}
          disabled={isAnyLoading}
          style={styles.openingMessageButton}
          variant="secondary"
        />
      )}
      {hasOpenOpeningConversation && (
        <AppButton
          title={openingConversationDirection === 'RECEIVED' ? "התקבלה הודעת פתיחה" : "הודעת פתיחה נשלחה"}
          onPress={() => {}}
          disabled={true}
          style={styles.openingMessageButton}
          variant="secondary"
        />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: theme.spacing.m,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    gap: theme.spacing.s,
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.s + 2,
    paddingHorizontal: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
  },
  likeButton: {
    backgroundColor: theme.colors.primary,
  },
  dislikeButton: {
    backgroundColor: theme.colors.error,
  },
  freezeButton: {
    backgroundColor: '#757575',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 13,
    marginTop: theme.spacing.s,
    textAlign: 'center',
    fontWeight: '500',
  },
  openingMessageButton: {
    marginTop: theme.spacing.m,
  },

});
