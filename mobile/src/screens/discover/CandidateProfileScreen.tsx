import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { StateSurface } from '../../components/foundation/StateSurface';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { ResponsiveActionGroup } from '../../components/foundation/ResponsiveActionGroup';
import { BidiText } from '../../components/foundation/BidiText';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { PublicProfileResponse, AllowedCandidateAction, PoolType } from '../../types/api';
import { getImageUrl } from '../../utils/imageUrl';
import { getYesNoLabel, getEmptyLabel } from '../../utils/displayLabels';
import { blockUser } from '../../api/blocksApi';
import { getPublicProfile } from '../../api/profileApi';
import { likeUser, dislikeUser, freezeUser, unfreezeUser, removeAction } from '../../api/actionsApi';
import { sendOpeningMessage } from '../../api/openingMessagesApi';
import { CandidateProfileActions } from '../../components/profile/CandidateProfileActions';
import { OpeningMessageComposer } from '../../components/OpeningMessageComposer';

type ProfileErrorKind = 'denied' | 'not_found' | 'network' | 'generic';

interface ProfileErrorInfo {
  kind: ProfileErrorKind;
  title: string;
  message: string;
}

export const CandidateProfileScreen = ({ route, navigation }: any) => {
  const { userId, contextLabel, sourceType, sourceId, poolType, weddingId } = route.params || {};
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ProfileErrorInfo | null>(null);
  const [loadingAction, setLoadingAction] = useState<AllowedCandidateAction | null>(null);
  const [composerVisible, setComposerVisible] = useState(false);

  const profileRef = useRef<PublicProfileResponse | null>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const fetchProfile = useCallback(async () => {
    const hasLoadedProfile = profileRef.current && profileRef.current.userId === userId;
    if (!hasLoadedProfile) {
      setLoading(true);
    }
    setError(null);
    try {
      const sourceDescriptor = {
        sourceType,
        sourceId,
        poolType,
        weddingId,
      };
      const data = await getPublicProfile(userId, sourceDescriptor);
      if (isFocusedRef.current) {
        setProfile(data);
      }
    } catch (err: any) {
      if (isFocusedRef.current) {
        // Clear cached protected data on error / denial
        setProfile(null);
        const status = err.response?.status;
        if (status === 403) {
          setError({
            kind: 'denied',
            title: 'לא ניתן להציג את הפרופיל',
            message: 'המקור שממנו נפתחה הצפייה אינו מורשה עבורך כעת.',
          });
        } else if (status === 404) {
          setError({
            kind: 'not_found',
            title: 'פרופיל לא נמצא',
            message: 'הפרופיל המבוקש אינו קיים עוד.',
          });
        } else {
          setError({
            kind: 'network',
            title: 'שגיאת תקשורת',
            message: 'לא ניתן לטעון את הפרופיל כעת. אנא בדקו את החיבור ונסו שוב.',
          });
        }
      }
    } finally {
      if (isFocusedRef.current) {
        setLoading(false);
      }
    }
  }, [userId, sourceType, sourceId, poolType, weddingId]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      fetchProfile();
      return () => {
        isFocusedRef.current = false;
      };
    }, [fetchProfile])
  );

  const getEffectiveContextParams = (): { poolType: PoolType; weddingId?: number } | null => {
    const rel = profile?.relationship;
    if (!rel) return null;
    const ctx = rel.effectiveContext;
    if (!ctx || !ctx.validForActions || !ctx.poolType) {
      return null;
    }
    if (ctx.poolType === 'WEDDING' && (ctx.weddingId === null || ctx.weddingId === undefined)) {
      return null;
    }
    return {
      poolType: ctx.poolType,
      weddingId: ctx.weddingId ?? undefined,
    };
  };

  const handleMutationError = (err: any) => {
    const status = err.response?.status;
    let message = 'ביצוע הפעולה נכשל. אנא נסו שוב.';
    if (status === 403) {
      message = 'אין לך הרשאה לבצע פעולה זו, או שהפעולה כבר אינה מורשית.';
    } else if (status === 404) {
      message = 'המועמד או הפעולה אינם זמינים עוד.';
    } else if (status === 409) {
      message = 'מצב הקשר השתנה בשרת. הפרופיל יתרענן.';
    } else if (err.response?.data?.message) {
      message = err.response.data.message;
    } else if (err.message) {
      message = err.message;
    }

    Alert.alert('שגיאה', message, [
      { text: 'אישור', onPress: fetchProfile }
    ]);
  };

  const executeActionMutation = async (action: AllowedCandidateAction, apiFn: () => Promise<any>) => {
    setLoadingAction(action);
    try {
      const response = await apiFn();
      await fetchProfile();
      return response;
    } catch (err: any) {
      handleMutationError(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLike = () => {
    const params = getEffectiveContextParams();
    if (!params) {
      Alert.alert('שגיאה', 'שגיאת מערכת: נתוני ההקשר חסרים. הפרופיל יתרענן.', [
        { text: 'אישור', onPress: fetchProfile }
      ]);
      return;
    }
    Alert.alert(
      'סימון לייק',
      'אם גם הצד השני יסמן לייק, ייווצר שידוך ותוכלו להתכתב.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'לייק',
          onPress: async () => {
            const res = await executeActionMutation('LIKE', () => likeUser(userId, params));
            if (res && res.matchCreated === false) {
              Alert.alert(
                'הלייק נשלח',
                'כעת ממתינים ללייק מהצד השני כדי ליצור התאמה.'
              );
            }
          }
        },
      ]
    );
  };

  const handleDislike = () => {
    const params = getEffectiveContextParams();
    if (!params) {
      Alert.alert('שגיאה', 'שגיאת מערכת: נתוני ההקשר חסרים. הפרופיל יתרענן.', [
        { text: 'אישור', onPress: fetchProfile }
      ]);
      return;
    }
    Alert.alert(
      'לא מתאים',
      'משתמש זה יועבר לרשימת הלא מתאימים ולא יופיע שוב בפיד שלך.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'לא מתאים',
          style: 'destructive',
          onPress: () => executeActionMutation('DISLIKE', () => dislikeUser(userId, params))
        },
      ]
    );
  };

  const handleFreeze = () => {
    const params = getEffectiveContextParams();
    if (!params) {
      Alert.alert('שגיאה', 'שגיאת מערכת: נתוני ההקשר חסרים. הפרופיל יתרענן.', [
        { text: 'אישור', onPress: fetchProfile }
      ]);
      return;
    }
    Alert.alert(
      'שמור בצד',
      'משתמש זה יישמר בצד ולא יופיע בפיד שלך עד שתסיר אותו מרשימת השמורים בצד.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'שמור בצד',
          onPress: () => executeActionMutation('FREEZE', () => freezeUser(userId, params))
        },
      ]
    );
  };

  const handleUnfreeze = () => {
    const params = getEffectiveContextParams();
    if (!params) {
      Alert.alert('שגיאה', 'שגיאת מערכת: נתוני ההקשר חסרים. הפרופיל יתרענן.', [
        { text: 'אישור', onPress: fetchProfile }
      ]);
      return;
    }
    executeActionMutation('UNFREEZE', () => unfreezeUser(userId, params));
  };

  const handleRemoveAction = () => {
    const params = getEffectiveContextParams();
    if (!params) {
      Alert.alert('שגיאה', 'שגיאת מערכת: נתוני ההקשר חסרים. הפרופיל יתרענן.', [
        { text: 'אישור', onPress: fetchProfile }
      ]);
      return;
    }
    executeActionMutation('REMOVE_ACTION', () => removeAction(userId, params));
  };

  const handleSendOpening = async (content: string) => {
    const params = getEffectiveContextParams();
    if (!params) {
      Alert.alert('שגיאה', 'שגיאת מערכת: נתוני ההקשר חסרים. הפרופיל יתרענן.', [
        { text: 'אישור', onPress: fetchProfile }
      ]);
      return;
    }
    setLoadingAction('OPENING_CREATE');
    try {
      await sendOpeningMessage(userId, {
        content,
        poolType: params.poolType,
        weddingId: params.weddingId,
      });
      await fetchProfile();
      Alert.alert(
        'הודעת הפתיחה נשלחה',
        'כעת ממתינים לתגובה מהצד השני.'
      );
    } catch (err: any) {
      handleMutationError(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleOpeningOpen = () => {
    const convId = profile?.relationship?.opening?.conversationId;
    if (!convId) {
      Alert.alert('שגיאה', 'שגיאת מערכת: מזהה שיחה חסר. הפרופיל יתרענן.', [
        { text: 'אישור', onPress: fetchProfile }
      ]);
      return;
    }
    navigation.navigate('OpeningConversationDetails', {
      conversationId: convId,
      otherUserName: profile.fullName,
    });
  };

  const handleChatOpen = () => {
    const matchId = profile?.relationship?.match?.matchId;
    if (!matchId) {
      Alert.alert('שגיאה', 'שגיאת מערכת: מזהה התאמה חסר. הפרופיל יתרענן.', [
        { text: 'אישור', onPress: fetchProfile }
      ]);
      return;
    }
    navigation.navigate('Chat', { matchId });
  };

  const handleMatchDetailsOpen = () => {
    const matchId = profile?.relationship?.match?.matchId;
    if (!matchId) {
      Alert.alert('שגיאה', 'שגיאת מערכת: מזהה התאמה חסר. הפרופיל יתרענן.', [
        { text: 'אישור', onPress: fetchProfile }
      ]);
      return;
    }
    navigation.navigate('MatchDetails', { matchId });
  };

  const handleBlockUser = () => {
    Alert.alert(
      'חסום משתמש',
      'המשתמש לא יופיע לך, ואת/ה לא תופיע/י לו, כל עוד החסימה פעילה.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'חסום',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(userId);
              Alert.alert('חסימה בוצעה', 'המשתמש נחסם בהצלחה.', [
                { text: 'אישור', onPress: () => navigation.goBack() }
              ]);
            } catch (err: any) {
              Alert.alert('שגיאה', err.response?.data?.message || 'חסימת המשתמש נכשלה.');
            }
          }
        },
      ]
    );
  };

  const getRelationshipStatusText = (): string => {
    const rel = profile?.relationship;
    if (!rel) return '';

    if (rel.match && rel.match.status === 'ACTIVE') {
      return 'יש ביניכם התאמה פעילה';
    }

    if (rel.match && rel.match.status === 'BLOCKED') {
      return 'ההתאמה ביניכם בוטלה';
    }

    if (rel.opening) {
      if (rel.opening.direction === 'SENT') {
        return 'שלחת הודעת פתיחה';
      } else if (rel.opening.direction === 'RECEIVED') {
        return 'קיבלת הודעת פתיחה';
      }
    }

    if (rel.outgoingAction && rel.outgoingAction !== 'NONE') {
      if (rel.outgoingAction === 'LIKE') {
        return 'סימנת לייק';
      } else if (rel.outgoingAction === 'DISLIKE') {
        return 'העברת לרשימת לא מתאים';
      } else if (rel.outgoingAction === 'FREEZE') {
        return 'הקפאת את המועמד';
      }
    }

    if (rel.incomingLike) {
      return 'המועמד סימן לך לייק';
    }

    return 'עדיין לא בוצעה פעולה';
  };

  // State Surface: Loading
  if (loading && !profile) {
    return (
      <ScreenContainer>
        <StateSurface kind="loading" title="טוען פרטי פרופיל..." />
      </ScreenContainer>
    );
  }

  // State Surface: Denied (S6-A04-F02)
  if (error?.kind === 'denied') {
    return (
      <ScreenContainer>
        <StateSurface
          kind="denied"
          title={error.title}
          message={error.message}
          primaryAction={{
            label: 'חזור',
            onPress: () => navigation.goBack(),
            icon: 'arrow-left',
          }}
          live
        />
      </ScreenContainer>
    );
  }

  // State Surface: Not Found / Error
  if (error || !profile) {
    const isNotFound = error?.kind === 'not_found';
    return (
      <ScreenContainer>
        <StateSurface
          kind={isNotFound ? 'empty' : 'error'}
          title={error?.title || 'שגיאת טעינה'}
          message={error?.message || 'לא ניתן היה לטעון את הפרופיל המבוקש.'}
          primaryAction={
            isNotFound
              ? { label: 'חזור', onPress: () => navigation.goBack(), icon: 'arrow-left' }
              : { label: 'נסה שוב', onPress: fetchProfile, icon: 'check' }
          }
          secondaryAction={
            isNotFound
              ? undefined
              : { label: 'חזור', onPress: () => navigation.goBack(), icon: 'arrow-left' }
          }
          live
        />
      </ScreenContainer>
    );
  }

  const primaryPhoto = getImageUrl(profile.primaryPhotoUrl);
  const allowedActions = profile.relationship?.allowedActions || [];
  const isMutualMatch = profile.relationship?.match?.status === 'ACTIVE';
  const matchId = profile.relationship?.match?.matchId;

  const renderFieldRow = (label: string, value: any, isLongText = false) => {
    const displayValue = getEmptyLabel(value);

    if (isLongText) {
      return (
        <View style={styles.longTextContainer} key={label}>
          <Text style={[typography.bodyMediumBold, styles.fieldLabel]}>{label}</Text>
          <BidiText value={displayValue} style={[typography.bodyMedium, styles.longTextValue]} />
        </View>
      );
    }

    return (
      <View style={styles.fieldRow} key={label}>
        <Text style={[typography.bodyMediumBold, styles.fieldLabel]}>{label}:</Text>
        <BidiText value={displayValue} style={[typography.bodyMedium, styles.fieldValue]} />
      </View>
    );
  };

  return (
    <ScreenContainer scroll>
      {/* Source / Context Banner (Header) */}
      <Card variant="surface" padding="sm" style={styles.sourceBanner}>
        <View style={styles.sourceBannerContent}>
          <AppIcon name="search" size={16} color={colors.accent} />
          <BidiText value={contextLabel || 'מקור: גילוי גלובלי'} style={[typography.captionBold, styles.sourceText]} />
        </View>
      </Card>

      {/* Candidate Media Region (4:5 Aspect Ratio) */}
      <View style={styles.mediaContainer}>
        {primaryPhoto ? (
          <Image
            source={{ uri: primaryPhoto }}
            style={styles.mediaImage}
            resizeMode="cover"
            accessibilityLabel={`תמונת ${profile.fullName}`}
          />
        ) : (
          <View
            style={styles.mediaPlaceholder}
            accessible
            accessibilityLabel="תמונת מועמד חסרה"
          >
            <AppIcon name="user" size={48} color={colors.textTertiary} />
            <Text style={[typography.bodyMediumBold, styles.mediaPlaceholderText]}>
              אין תמונה זמינה
            </Text>
          </View>
        )}
      </View>

      {/* Candidate Identity */}
      <View style={styles.identityContainer}>
        <Text
          style={[typography.titleLarge, styles.candidateName]}
          accessibilityRole="header"
        >
          {profile.fullName}
        </Text>
        <BidiText
          value={`${profile.age} שנים • ${profile.heightCm} ס״מ • ${profile.areaOfResidence}`}
          style={[typography.bodyMediumMedium, styles.candidateSubtitle]}
        />

        {/* Quick Attribute Chips */}
        <View style={styles.attributeChipsRow}>
          {profile.occupation ? (
            <View style={styles.attributeChip}>
              <Text style={[typography.captionBold, styles.attributeChipText]}>
                {profile.occupation}
              </Text>
            </View>
          ) : null}
          {profile.education ? (
            <View style={styles.attributeChip}>
              <Text style={[typography.captionBold, styles.attributeChipText]}>
                {profile.education}
              </Text>
            </View>
          ) : null}
          {profile.religiousLevel ? (
            <View style={styles.attributeChip}>
              <Text style={[typography.captionBold, styles.attributeChipText]}>
                {profile.religiousLevel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Mutual Match Result Banner (S6-A04-F03) OR Standard Actions */}
      {isMutualMatch ? (
        <Card variant="selectable" selected padding="lg" style={styles.matchResultCard}>
          <View style={styles.matchHeaderRow} accessibilityLiveRegion="assertive">
            <AppIcon name="heart" size={24} color={colors.accent} />
            <Text style={[typography.titleMedium, styles.matchTitle]}>נוצרה התאמה!</Text>
          </View>
          <BidiText
            value={`אתה ו${profile.fullName} התאמתם זה לזו. אפשר לעבור לפרטי ההתאמה או להמשיך לצ׳אט.`}
            style={[typography.bodyMedium, styles.matchSubtitle]}
          />
          <View style={styles.matchStatusBadge}>
            <AppIcon name="check" size={16} color={colors.statusSuccess} />
            <Text style={[typography.captionBold, styles.matchStatusText]}>
              סטטוס קשר: התאמה נוצרה
            </Text>
          </View>

          {/* Mutual Match Destinations (Server-Driven) */}
          <ResponsiveActionGroup alignment="stacked" style={styles.matchActionsGroup}>
            {allowedActions.includes('CHAT_OPEN') && matchId ? (
              <Button
                label="מעבר לצ׳אט"
                onPress={handleChatOpen}
                variant="primary"
                iconStart="mail"
                fullWidth
                accessibilityLabel="מעבר לצ׳אט"
              />
            ) : null}

            {allowedActions.includes('MATCH_DETAILS_OPEN') && matchId ? (
              <Button
                label="למסך ההתאמות"
                onPress={handleMatchDetailsOpen}
                variant="secondary"
                iconStart="info"
                fullWidth
                accessibilityLabel="מעבר לפרטי השידוך"
              />
            ) : null}
          </ResponsiveActionGroup>
        </Card>
      ) : (
        <>
          {/* Relationship Status Badge */}
          {profile.relationship && (
            <View style={styles.statusBadgeCard}>
              <BidiText
                value={`סטטוס קשר: ${getRelationshipStatusText()}`}
                style={[typography.captionBold, styles.statusBadgeText]}
              />
            </View>
          )}

          {/* Server-Driven Action Region (S6-A04-F01) */}
          {profile.relationship && (
            <View style={styles.actionsSection}>
              <CandidateProfileActions
                allowedActions={allowedActions}
                loadingAction={loadingAction}
                disabled={loading}
                onLike={handleLike}
                onDislike={handleDislike}
                onFreeze={handleFreeze}
                onRemoveAction={handleRemoveAction}
                onUnfreeze={handleUnfreeze}
                onOpeningCreate={() => setComposerVisible(true)}
                onOpeningOpen={handleOpeningOpen}
                onChatOpen={handleChatOpen}
                onMatchDetailsOpen={handleMatchDetailsOpen}
              />
            </View>
          )}
        </>
      )}

      {/* Profile Information Sections (S6-A04-F04 — Long Profile Compact) */}
      <View style={styles.sectionsContainer}>
        {/* Section 1: Personal Details */}
        <Card variant="surface" padding="md" style={styles.sectionCard}>
          <Text style={[typography.titleSmall, styles.sectionTitle]}>פרטים אישיים</Text>
          <View style={styles.cardContent}>
            {renderFieldRow('גיל', profile.age)}
            {renderFieldRow('עיר / אזור מגורים', profile.areaOfResidence)}
            {renderFieldRow('גובה', `${profile.heightCm} ס״מ`)}
            {renderFieldRow('כיסוי ראש', profile.headCovering)}
            {renderFieldRow('רישיון נהיגה', getYesNoLabel(profile.hasDrivingLicense))}
          </View>
        </Card>

        {/* Section 2: Education & Career */}
        <Card variant="surface" padding="md" style={styles.sectionCard}>
          <Text style={[typography.titleSmall, styles.sectionTitle]}>השכלה וקריירה</Text>
          <View style={styles.cardContent}>
            {renderFieldRow('השכלה', profile.education)}
            {renderFieldRow('עיסוק', profile.occupation)}
            {renderFieldRow('רמה דתית', profile.religiousLevel)}
          </View>
        </Card>

        {/* Section 3: About Me */}
        <Card variant="surface" padding="md" style={styles.sectionCard}>
          <Text style={[typography.titleSmall, styles.sectionTitle]}>עליי</Text>
          <View style={styles.cardContent}>
            {renderFieldRow('תיאור עצמי', profile.selfDescription, true)}
            {renderFieldRow('תחביבים ותחומי עניין', profile.hobbies, true)}
          </View>
        </Card>

        {/* Section 4: Looking For */}
        <Card variant="surface" padding="md" style={styles.sectionCard}>
          <Text style={[typography.titleSmall, styles.sectionTitle]}>מה אני מחפש/ת</Text>
          <View style={styles.cardContent}>
            {renderFieldRow('תיאור חיפוש', profile.lookingFor, true)}
          </View>
        </Card>

        {/* Section 5: Family Background */}
        {profile.familyDescription ? (
          <Card variant="surface" padding="md" style={styles.sectionCard}>
            <Text style={[typography.titleSmall, styles.sectionTitle]}>רקע משפחתי</Text>
            <View style={styles.cardContent}>
              {renderFieldRow('רקע משפחתי', profile.familyDescription, true)}
            </View>
          </Card>
        ) : null}
      </View>

      {/* Visually Separated Safety Region */}
      {(allowedActions.includes('REPORT') || allowedActions.includes('BLOCK')) && (
        <Card variant="surface" padding="lg" style={styles.safetyCard}>
          <View style={styles.safetyHeaderRow}>
            <AppIcon name="shield" size={20} color={colors.textSecondary} />
            <Text style={[typography.heading, styles.safetyTitle]}>בטיחות ופרטיות</Text>
          </View>
          <Text style={[typography.caption, styles.safetySubtext]}>נשמר בדיסקרטיות</Text>

          <ResponsiveActionGroup alignment="inline" style={styles.safetyActionsGroup}>
            {allowedActions.includes('REPORT') && (
              <Button
                label="דיווח על משתמש"
                onPress={() => navigation.navigate('ReportUser', { userId })}
                variant="secondary"
                iconStart="alert-circle"
                accessibilityLabel="דיווח על משתמש"
                style={styles.safetyBtn}
              />
            )}
            {allowedActions.includes('BLOCK') && (
              <Button
                label="חסום משתמש"
                onPress={handleBlockUser}
                variant="destructive"
                iconStart="x"
                accessibilityLabel="חסום משתמש"
                style={styles.safetyBtn}
              />
            )}
          </ResponsiveActionGroup>
        </Card>
      )}

      <OpeningMessageComposer
        visible={composerVisible}
        onClose={() => setComposerVisible(false)}
        onSend={handleSendOpening}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  sourceBanner: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentBorder,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  sourceBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sourceText: {
    color: colors.accent,
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceSubtle,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  mediaPlaceholderText: {
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  identityContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  candidateName: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  candidateSubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  attributeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  attributeChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  attributeChipText: {
    color: colors.textSecondary,
  },
  statusBadgeCard: {
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statusBadgeText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: spacing.lg,
  },
  matchResultCard: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentBorder,
    marginBottom: spacing.lg,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  matchTitle: {
    color: colors.accent,
  },
  matchSubtitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  matchStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.statusSuccessBg,
    borderColor: colors.statusSuccessBorder,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  matchStatusText: {
    color: colors.statusSuccess,
  },
  matchActionsGroup: {
    marginTop: spacing.sm,
  },
  sectionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cardContent: {
    gap: spacing.xs,
  },
  fieldRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  fieldLabel: {
    color: colors.textSecondary,
    textAlign: 'right',
  },
  fieldValue: {
    color: colors.textPrimary,
    textAlign: 'left',
    flex: 1,
    marginRight: spacing.md,
  },
  longTextContainer: {
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  longTextValue: {
    color: colors.textPrimary,
    marginTop: spacing.xs,
    lineHeight: 22,
    textAlign: 'right',
  },
  safetyCard: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSubtle,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  safetyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  safetyTitle: {
    color: colors.textPrimary,
  },
  safetySubtext: {
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  safetyActionsGroup: {
    gap: spacing.md,
  },
  safetyBtn: {
    flex: 1,
  },
});
