import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AllowedCandidateAction } from '../../types/api';
import { Button } from '../foundation/Button';
import { ResponsiveActionGroup } from '../foundation/ResponsiveActionGroup';
import { Card } from '../foundation/Card';
import { AppIcon } from '../foundation/AppIcon';
import { colors, spacing, radii } from '../../theme/tokens';
import { typography } from '../../theme/typography';

export interface CandidateProfileActionsProps {
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
  onMatchCancel?: () => void;
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

  const hasPrimaryDecisionRow = showLike || showDislike || showFreeze;
  const hasSecondaryActions =
    showRemoveAction ||
    showUnfreeze ||
    showOpeningCreate ||
    showOpeningOpen ||
    showChatOpen ||
    showMatchDetailsOpen;

  const hasAnyRelationshipAction = hasPrimaryDecisionRow || hasSecondaryActions;

  if (!hasAnyRelationshipAction) {
    return (
      <Card variant="surface" padding="md" style={styles.noActionCard}>
        <View style={styles.noActionHeader}>
          <AppIcon name="info" size={20} color={colors.textSecondary} />
          <Text style={[typography.heading, styles.noActionTitle]}>כרגע אין פעולות זמינות</Text>
        </View>
        <Text style={[typography.bodyMedium, styles.noActionText]}>
          לא ניתן לשלוח עניין, לפתוח הודעת פתיחה או לבצע פעולה נוספת מהפרופיל הזה כרגע.
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {hasPrimaryDecisionRow && (
        <ResponsiveActionGroup alignment="inline" style={styles.decisionRow}>
          {showLike && (
            <Button
              label="לייק"
              onPress={onLike}
              loading={loadingAction === 'LIKE'}
              disabled={isBtnDisabled('LIKE')}
              variant="primary"
              iconStart="heart"
              accessibilityLabel="סימון לייק למועמד"
              style={styles.flexBtn}
            />
          )}
          {showFreeze && (
            <Button
              label="שמור בצד"
              onPress={onFreeze}
              loading={loadingAction === 'FREEZE'}
              disabled={isBtnDisabled('FREEZE')}
              variant="secondary"
              iconStart="star"
              accessibilityLabel="שמירת המועמד בצד"
              style={styles.flexBtn}
            />
          )}
          {showDislike && (
            <Button
              label="לא מתאים"
              onPress={onDislike}
              loading={loadingAction === 'DISLIKE'}
              disabled={isBtnDisabled('DISLIKE')}
              variant="destructive"
              iconStart="x"
              accessibilityLabel="העברה לרשימת לא מתאים"
              style={styles.flexBtn}
            />
          )}
        </ResponsiveActionGroup>
      )}

      {showRemoveAction && (
        <Button
          label="ביטול פעולה אחרונה"
          onPress={onRemoveAction}
          loading={loadingAction === 'REMOVE_ACTION'}
          disabled={isBtnDisabled('REMOVE_ACTION')}
          variant="secondary"
          iconStart="log-out"
          fullWidth
          accessibilityLabel="ביטול פעולה אחרונה"
        />
      )}

      {showUnfreeze && (
        <Button
          label="ביטול שמירה בצד"
          onPress={onUnfreeze}
          loading={loadingAction === 'UNFREEZE'}
          disabled={isBtnDisabled('UNFREEZE')}
          variant="secondary"
          iconStart="star"
          fullWidth
          accessibilityLabel="ביטול שמירה בצד"
        />
      )}

      {showOpeningCreate && (
        <Button
          label="שלח/י הודעת פתיחה"
          onPress={onOpeningCreate}
          loading={loadingAction === 'OPENING_CREATE'}
          disabled={isBtnDisabled('OPENING_CREATE')}
          variant="secondary"
          iconStart="mail"
          fullWidth
          accessibilityLabel="שליחת הודעת פתיחה"
        />
      )}

      {showOpeningOpen && (
        <Button
          label="צפייה בהודעת פתיחה"
          onPress={onOpeningOpen}
          loading={loadingAction === 'OPENING_OPEN'}
          disabled={isBtnDisabled('OPENING_OPEN')}
          variant="primary"
          iconStart="mail"
          fullWidth
          accessibilityLabel="צפייה בהודעת פתיחה"
        />
      )}

      {showChatOpen && (
        <Button
          label="פתח צ׳אט"
          onPress={onChatOpen}
          loading={loadingAction === 'CHAT_OPEN'}
          disabled={isBtnDisabled('CHAT_OPEN')}
          variant="primary"
          iconStart="mail"
          fullWidth
          accessibilityLabel="פתיחת צ׳אט"
        />
      )}

      {showMatchDetailsOpen && (
        <Button
          label="פרטי השידוך"
          onPress={onMatchDetailsOpen}
          loading={loadingAction === 'MATCH_DETAILS_OPEN'}
          disabled={isBtnDisabled('MATCH_DETAILS_OPEN')}
          variant="secondary"
          iconStart="info"
          fullWidth
          accessibilityLabel="צפייה בפרטי השידוך"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },
  decisionRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  flexBtn: {
    flex: 1,
    minWidth: 100,
  },
  noActionCard: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    padding: spacing.lg,
  },
  noActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  noActionTitle: {
    color: colors.textSecondary,
  },
  noActionText: {
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
