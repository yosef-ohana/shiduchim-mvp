import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { AppButton } from './AppButton';
import { theme } from '../theme/theme';
import { PoolType } from '../types/api';
import { likeUser, dislikeUser, freezeUser } from '../api/actionsApi';

interface ActionButtonsProps {
  targetUserId: number;
  poolType: PoolType;
  weddingId?: number;
  onActionCompleted: (matchCreated: boolean) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  targetUserId,
  poolType,
  weddingId,
  onActionCompleted,
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
        } else if (action === 'DISLIKE') {
          response = await dislikeUser(targetUserId, params);
        } else {
          response = await freezeUser(targetUserId, params);
        }

        onActionCompleted(response.matchCreated);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            `Failed to perform action. Please try again.`
        );
      } finally {
        setLoadingAction(null);
      }
    };

    if (action === 'LIKE') {
      Alert.alert(
        'Like Candidate',
        'If the other side also likes you, a Match will be created and you will be able to chat.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Like', onPress: execute },
        ]
      );
    } else if (action === 'DISLIKE') {
      Alert.alert(
        'Dislike Candidate',
        'This user will move to Dislikes and will not be shown again in your feed.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Dislike', style: 'destructive', onPress: execute },
        ]
      );
    } else if (action === 'FREEZE') {
      Alert.alert(
        'Freeze Candidate',
        'This user will be saved aside and will not appear in your feed until you remove them from Freeze.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Freeze', onPress: execute },
        ]
      );
    }
  };

  const isAnyLoading = loadingAction !== null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <AppButton
          title="Dislike"
          onPress={() => handleAction('DISLIKE')}
          loading={loadingAction === 'DISLIKE'}
          disabled={isAnyLoading}
          style={[styles.button, styles.dislikeButton]}
        />
        <AppButton
          title="Freeze"
          onPress={() => handleAction('FREEZE')}
          loading={loadingAction === 'FREEZE'}
          disabled={isAnyLoading}
          style={[styles.button, styles.freezeButton]}
        />
        <AppButton
          title="Like"
          onPress={() => handleAction('LIKE')}
          loading={loadingAction === 'LIKE'}
          disabled={isAnyLoading}
          style={[styles.button, styles.likeButton]}
        />
      </View>
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
});
