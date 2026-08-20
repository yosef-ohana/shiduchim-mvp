import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AllowedCandidateAction } from '../../types/api';
import { Button } from '../foundation/Button';
import { ResponsiveActionGroup } from '../foundation/ResponsiveActionGroup';
import { Card } from '../foundation/Card';
import { AppIcon } from '../foundation/AppIcon';
import { spacing, radii, visual, gold, text } from '../../theme/tokens';
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

  const hasPrimaryDecisionRow = showLike || showFreeze || showUnfreeze || showRemoveAction;
  const hasSecondaryActions =
    showDislike ||
    showOpeningCreate ||
    showOpeningOpen ||
    showChatOpen ||
    showMatchDetailsOpen;

  const hasAnyRelationshipAction = hasPrimaryDecisionRow || hasSecondaryActions;

  if (!hasAnyRelationshipAction) {
    return (
      <Card
        appearance="dark"
        borderAppearance="restrainedGold"
        padding="md"
        style={styles.noActionCard}
      >
        <View style={styles.noActionHeader}>
          <AppIcon name="info" size={20} color={gold.border.strong} />
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
      {/* Option B Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerDividerLine} />
        <Text style={[typography.captionBold, styles.sectionHeaderText]}>
          פעולות מותרות כרגע
        </Text>
        <View style={styles.headerDividerLine} />
      </View>

      {/* Prominent Primary Gold Action: Opening Message Create */}
      {showOpeningCreate && (
        <Button
          label="שלח/י הודעת פתיחה"
          onPress={onOpeningCreate}
          loading={loadingAction === 'OPENING_CREATE'}
          disabled={isBtnDisabled('OPENING_CREATE')}
          variant="primary"
          visualAppearance="gold"
          iconStart="mail"
          fullWidth
          accessibilityLabel="שליחת הודעת פתיחה"
          style={styles.primaryGoldBtn}
        />
      )}

      {/* Prominent Primary Gold Action: Opening Message Open */}
      {showOpeningOpen && (
        <Button
          label="צפייה בהודעת פתיחה"
          onPress={onOpeningOpen}
          loading={loadingAction === 'OPENING_OPEN'}
          disabled={isBtnDisabled('OPENING_OPEN')}
          variant="primary"
          visualAppearance="gold"
          iconStart="mail"
          fullWidth
          accessibilityLabel="צפייה בהודעת פתיחה"
          style={styles.primaryGoldBtn}
        />
      )}

      {/* Decision Row: Like, Freeze, Unfreeze, Remove Action */}
      {hasPrimaryDecisionRow && (
        <ResponsiveActionGroup alignment="inline" style={styles.decisionRow}>
          {showLike && (
            showOpeningCreate ? (
              <Button
                label="סימון עניין"
                onPress={onLike}
                loading={loadingAction === 'LIKE'}
                disabled={isBtnDisabled('LIKE')}
                variant="secondary"
                iconStart="heart"
                accessibilityLabel="סימון לייק למועמד"
                style={styles.darkGoldBtn}
                labelStyle={styles.darkGoldBtnText}
              />
            ) : (
              <Button
                label="לייק"
                onPress={onLike}
                loading={loadingAction === 'LIKE'}
                disabled={isBtnDisabled('LIKE')}
                variant="primary"
                visualAppearance="gold"
                iconStart="heart"
                accessibilityLabel="סימון לייק למועמד"
                style={styles.flexBtn}
              />
            )
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
              style={styles.darkGoldBtn}
              labelStyle={styles.darkGoldBtnText}
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
              accessibilityLabel="ביטול שמירה בצד"
              style={styles.darkGoldBtn}
              labelStyle={styles.darkGoldBtnText}
            />
          )}

          {showRemoveAction && (
            <Button
              label="ביטול פעולה אחרונה"
              onPress={onRemoveAction}
              loading={loadingAction === 'REMOVE_ACTION'}
              disabled={isBtnDisabled('REMOVE_ACTION')}
              variant="secondary"
              iconStart="log-out"
              accessibilityLabel="ביטול פעולה אחרונה"
              style={styles.darkGoldBtn}
              labelStyle={styles.darkGoldBtnText}
            />
          )}
        </ResponsiveActionGroup>
      )}

      {/* Match Actions */}
      {showChatOpen && (
        <Button
          label="פתח צ׳אט"
          onPress={onChatOpen}
          loading={loadingAction === 'CHAT_OPEN'}
          disabled={isBtnDisabled('CHAT_OPEN')}
          variant="primary"
          visualAppearance="gold"
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
          style={styles.darkGoldBtn}
          labelStyle={styles.darkGoldBtnText}
        />
      )}

      {/* Visually Separated Destructive Action: Dislike */}
      {showDislike && (
        <Button
          label="לא מתאים"
          onPress={onDislike}
          loading={loadingAction === 'DISLIKE'}
          disabled={isBtnDisabled('DISLIKE')}
          variant="destructive"
          iconStart="x"
          fullWidth
          accessibilityLabel="העברה לרשימת לא מתאים"
          style={styles.dislikeBtn}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  headerDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: gold.border.restrained,
    opacity: 0.5,
  },
  sectionHeaderText: {
    color: gold.border.strong,
    textAlign: 'center',
  },
  primaryGoldBtn: {
    width: '100%',
  },
  decisionRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  flexBtn: {
    flex: 1,
    minWidth: 120,
  },
  darkGoldBtn: {
    flex: 1,
    minWidth: 120,
    backgroundColor: visual.surface.darkRaised,
    borderWidth: 1,
    borderColor: gold.border.restrained,
  },
  darkGoldBtnText: {
    color: gold.border.strong,
  },
  dislikeBtn: {
    width: '100%',
    marginTop: spacing.xs,
  },
  noActionCard: {
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
    color: text.onDark.primary,
  },
  noActionText: {
    color: text.onDark.secondary,
    textAlign: 'center',
  },
});
