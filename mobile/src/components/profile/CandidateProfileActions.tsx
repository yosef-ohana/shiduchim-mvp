import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppButton } from '../AppButton';
import { AllowedCandidateAction } from '../../types/api';
import { theme } from '../../theme/theme';

interface CandidateProfileActionsProps {
  allowedActions: AllowedCandidateAction[];
  loadingAction: AllowedCandidateAction | null;
  disabled: boolean;
  onLike: () => void;
  onDislike: () => void;
  onFreeze: () => void;
  onRemoveAction: () => void;
  onUnfreeze: () => void;
  onOpeningCreate: () => void;
  onOpeningOpen: () => void;
  onChatOpen: () => void;
  onMatchDetailsOpen: () => void;
}

export const CandidateProfileActions: React.FC<CandidateProfileActionsProps> = ({
  allowedActions,
  loadingAction,
  disabled,
  onLike,
  onDislike,
  onFreeze,
  onRemoveAction,
  onUnfreeze,
  onOpeningCreate,
  onOpeningOpen,
  onChatOpen,
  onMatchDetailsOpen,
}) => {
  const isAnyLoading = loadingAction !== null;
  const isBtnDisabled = (action: AllowedCandidateAction) => disabled || isAnyLoading;

  const showLike = allowedActions.includes('LIKE');
  const showDislike = allowedActions.includes('DISLIKE');
  const showFreeze = allowedActions.includes('FREEZE');
  const showRemoveAction = allowedActions.includes('REMOVE_ACTION');
  const showUnfreeze = allowedActions.includes('UNFREEZE');
  const showOpeningCreate = allowedActions.includes('OPENING_CREATE');
  const showOpeningOpen = allowedActions.includes('OPENING_OPEN');
  const showChatOpen = allowedActions.includes('CHAT_OPEN');
  const showMatchDetailsOpen = allowedActions.includes('MATCH_DETAILS_OPEN');

  const hasRowActions = showLike || showDislike || showFreeze;

  return (
    <View style={styles.container}>
      {hasRowActions && (
        <View style={styles.row}>
          {showDislike && (
            <AppButton
              title="לא מתאים"
              onPress={onDislike}
              loading={loadingAction === 'DISLIKE'}
              disabled={isBtnDisabled('DISLIKE')}
              style={[styles.button, styles.dislikeButton]}
            />
          )}
          {showFreeze && (
            <AppButton
              title="שמור בצד"
              onPress={onFreeze}
              loading={loadingAction === 'FREEZE'}
              disabled={isBtnDisabled('FREEZE')}
              style={[styles.button, styles.freezeButton]}
            />
          )}
          {showLike && (
            <AppButton
              title="לייק"
              onPress={onLike}
              loading={loadingAction === 'LIKE'}
              disabled={isBtnDisabled('LIKE')}
              style={[styles.button, styles.likeButton]}
            />
          )}
        </View>
      )}

      {showRemoveAction && (
        <AppButton
          title="ביטול פעולה אחרונה"
          onPress={onRemoveAction}
          loading={loadingAction === 'REMOVE_ACTION'}
          disabled={isBtnDisabled('REMOVE_ACTION')}
          style={styles.fullWidthButton}
          variant="secondary"
        />
      )}

      {showUnfreeze && (
        <AppButton
          title="ביטול שמירה בצד"
          onPress={onUnfreeze}
          loading={loadingAction === 'UNFREEZE'}
          disabled={isBtnDisabled('UNFREEZE')}
          style={styles.fullWidthButton}
          variant="secondary"
        />
      )}

      {showOpeningCreate && (
        <AppButton
          title="שליחת הודעת פתיחה"
          onPress={onOpeningCreate}
          loading={loadingAction === 'OPENING_CREATE'}
          disabled={isBtnDisabled('OPENING_CREATE')}
          style={styles.fullWidthButton}
          variant="secondary"
        />
      )}

      {showOpeningOpen && (
        <AppButton
          title="צפייה בהודעת פתיחה"
          onPress={onOpeningOpen}
          loading={loadingAction === 'OPENING_OPEN'}
          disabled={isBtnDisabled('OPENING_OPEN')}
          style={styles.fullWidthButton}
          variant="primary"
        />
      )}

      {showChatOpen && (
        <AppButton
          title="פתח צ׳אט"
          onPress={onChatOpen}
          loading={loadingAction === 'CHAT_OPEN'}
          disabled={isBtnDisabled('CHAT_OPEN')}
          style={styles.fullWidthButton}
          variant="primary"
        />
      )}

      {showMatchDetailsOpen && (
        <AppButton
          title="פרטי השידוך"
          onPress={onMatchDetailsOpen}
          loading={loadingAction === 'MATCH_DETAILS_OPEN'}
          disabled={isBtnDisabled('MATCH_DETAILS_OPEN')}
          style={styles.fullWidthButton}
          variant="secondary"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: theme.spacing.s,
    marginTop: theme.spacing.m,
  },
  row: {
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
  fullWidthButton: {
    width: '100%',
  },
});
