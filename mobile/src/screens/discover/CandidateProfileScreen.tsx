import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { StateSurface } from '../../components/foundation/StateSurface';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { ResponsiveActionGroup } from '../../components/foundation/ResponsiveActionGroup';
import { BidiText } from '../../components/foundation/BidiText';
import { colors, spacing, radii, sizing, visual, gold, text, status } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { PublicProfileResponse, AllowedCandidateAction, PoolType } from '../../types/api';
import { getImageUrl } from '../../utils/imageUrl';
import { getYesNoLabel, getEmptyLabel } from '../../utils/displayLabels';
import { blockUser } from '../../api/blocksApi';
import { getPublicProfile, ProfileSourceDescriptor } from '../../api/profileApi';
import { CandidateProfileReturnIntent, UserShellStackParamList } from '../../types/navigation';
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

type CandidateProfileRouteProp = RouteProp<UserShellStackParamList, 'CandidateProfile'>;

export const CandidateProfileScreen = ({ navigation }: any) => {
  const route = useRoute<CandidateProfileRouteProp>();
  const { userId, contextLabel, sourceType, sourceId, poolType, weddingId, returnIntent } = route.params || {};
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

  const handleReturn = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    if (returnIntent) {
      if (returnIntent.kind === 'DISCOVER_GLOBAL') {
        navigation.navigate('UserTabs', {
          screen: 'DiscoverRoot',
          params: {
            screen: 'Discover',
            params: { pool: 'GLOBAL' },
          },
        });
      } else if (returnIntent.kind === 'DISCOVER_WEDDING') {
        navigation.navigate('UserTabs', {
          screen: 'DiscoverRoot',
          params: {
            screen: 'Discover',
            params: { pool: 'WEDDING', weddingId: returnIntent.weddingId },
          },
        });
      } else if (returnIntent.kind === 'NOTIFICATIONS') {
        navigation.navigate('Notifications');
      } else {
        navigation.navigate('UserTabs', { screen: 'DiscoverRoot' });
      }
    } else {
      navigation.navigate('UserTabs', { screen: 'DiscoverRoot' });
    }
  }, [navigation, returnIntent]);

  const handleReportUser = () => {
    navigation.navigate('ReportUser', {
      userId,
      returnIntent: {
        kind: 'CANDIDATE_PROFILE',
        role: 'USER',
        sourceRoute: 'CandidateProfile',
        candidateUserId: userId,
        parentReturnIntent: returnIntent,
      },
    });
  };

  const fetchProfile = useCallback(async () => {
    const hasLoadedProfile = profileRef.current && profileRef.current.userId === userId;
    if (!hasLoadedProfile) {
      setLoading(true);
    }
    setError(null);
    try {
      const sourceDescriptor: ProfileSourceDescriptor = {
        sourceType,
        sourceId: sourceType === 'NOTIFICATION' ? sourceId : undefined,
        poolType: sourceType === 'DISCOVER' ? poolType : undefined,
        weddingId: sourceType === 'DISCOVER' && poolType === 'WEDDING' ? weddingId : undefined,
      };
      const data = await getPublicProfile(userId, sourceDescriptor);
      if (isFocusedRef.current) {
        setProfile(data);
      }
    } catch (err: any) {
      if (isFocusedRef.current) {
        // Clear cached protected data on error / denial (R-07 / S6-A04-F02 security requirement)
        setProfile(null);
        const statusHttp = err.response?.status;
        if (statusHttp === 403) {
          setError({
            kind: 'denied',
            title: 'לא ניתן להציג את הפרופיל',
            message: 'המקור שממנו נפתחה הצפייה אינו מורשה עבורך כעת.',
          });
        } else if (statusHttp === 404) {
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
    const statusHttp = err.response?.status;
    let message = 'ביצוע הפעולה נכשל. אנא נסו שוב.';
    if (statusHttp === 403) {
      message = 'אין לך הרשאה לבצע פעולה זו, או שהפעולה כבר אינה מורשית.';
    } else if (statusHttp === 404) {
      message = 'המועמד או הפעולה אינם זמינים עוד.';
    } else if (statusHttp === 409) {
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
                { text: 'אישור', onPress: handleReturn }
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

    return 'טרם נוצר קשר';
  };

  // State Surface: Loading
  if (loading && !profile) {
    return (
      <ScreenContainer appearance="darkCanvas">
        <StateSurface kind="loading" title="טוען פרטי פרופיל..." />
      </ScreenContainer>
    );
  }

  // State Surface: Denied / Stale Capability (Owner Screen 15 — R-07 / S6-A04-F02)
  if (error?.kind === 'denied') {
    return (
      <ScreenContainer appearance="darkCanvas" scroll>
        {/* Source Context Banner */}
        <View style={styles.sourceBannerTop}>
          <AppIcon name="search" size={14} color={gold.border.strong} />
          <Text style={[typography.captionBold, styles.sourceText]}>
            {contextLabel || 'מקור: גילוי גלובלי'}
          </Text>
        </View>

        {/* Lock / Denied Card (Owner Screen 15) */}
        <Card
          appearance="dark"
          borderAppearance="strongGold"
          padding="lg"
          style={styles.deniedCard}
        >
          <View style={styles.deniedIconCircle}>
            <AppIcon name="lock" size={32} color={gold.border.strong} />
          </View>
          <Text style={[typography.titleMedium, styles.deniedTitle]}>
            פעולה אינה זמינה כעת
          </Text>
          <Text style={[typography.bodyMedium, styles.deniedMessage]}>
            {error.message || 'אינך יכול/ה לבצע פעולות במועמד/ת זו. ייתכן שאינו עומד בהגדרות הפרטיות, בהעדפות או בשבועות המקבילים שלך כרגע.'}
          </Text>
          <Text style={[typography.caption, styles.deniedSubtext]}>
            לא ניתן לשלוח עניין, להציג התאמות או לפתוח שיחה.
          </Text>
        </Card>

        {/* Return to Source Card (Owner Screen 15) */}
        <Card
          appearance="ivory"
          padding="lg"
          style={styles.returnCard}
        >
          <View style={styles.returnHeaderRow}>
            <View style={styles.returnIconBadge}>
              <AppIcon name="refresh" size={18} color={text.onIvory.primary} />
            </View>
            <View style={styles.returnHeaderTextContainer}>
              <Text style={[typography.titleSmall, styles.returnTitle]}>חזרה למקור</Text>
              <Text style={[typography.caption, styles.returnSubtext]}>
                חזור/י למסך שממנו הגעת לפרופיל זה. לא תאבד/י את מקומך.
              </Text>
            </View>
          </View>

          <Button
            label="חזרה למסך הקודם"
            onPress={handleReturn}
            variant="primary"
            visualAppearance="gold"
            iconStart="arrow-right"
            fullWidth
            accessibilityLabel="חזרה למסך הקודם"
            style={styles.returnButton}
          />
        </Card>
      </ScreenContainer>
    );
  }

  // State Surface: Not Found / Generic Error
  if (error || !profile) {
    const isNotFound = error?.kind === 'not_found';
    return (
      <ScreenContainer appearance="darkCanvas">
        <StateSurface
          kind={isNotFound ? 'empty' : 'error'}
          title={error?.title || 'שגיאת טעינה'}
          message={error?.message || 'לא ניתן היה לטעון את הפרופיל המבוקש.'}
          primaryAction={
            isNotFound
              ? { label: 'חזור', onPress: handleReturn, icon: 'arrow-left' }
              : { label: 'נסה שוב', onPress: fetchProfile, icon: 'check' }
          }
          secondaryAction={
            isNotFound
              ? undefined
              : { label: 'חזור', onPress: handleReturn, icon: 'arrow-left' }
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

  return (
    <ScreenContainer appearance="darkCanvas" scroll>
      {/* Option B In-screen Source / Context Indication (Owner Screen 2 / 16) */}
      <View style={styles.sourceBannerTop}>
        <AppIcon name="search" size={14} color={gold.border.strong} />
        <Text style={[typography.captionBold, styles.sourceText]}>
          {contextLabel || 'מקור: גילוי גלובלי'}
        </Text>
      </View>

      {/* Candidate Hero / Photo Region (Owner Screen 2 / 16 / 22) */}
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
            <AppIcon name="user" size={56} color={gold.border.restrained} />
            <Text style={[typography.bodyMediumBold, styles.mediaPlaceholderText]}>
              אין תמונה זמינה
            </Text>
          </View>
        )}
      </View>

      {/* Candidate Identity (Owner Screen 2) */}
      <View style={styles.identityContainer}>
        <Text
          style={[typography.titleLarge, styles.candidateName]}
          accessibilityRole="header"
        >
          {profile.fullName}
        </Text>
        <BidiText
          value={`${profile.age} • ${profile.areaOfResidence}`}
          style={[typography.bodyMediumMedium, styles.candidateSubtitle]}
        />

        {/* Quick Attribute Badges Row */}
        <View style={styles.attributeChipsRow}>
          {profile.occupation ? (
            <View style={styles.attributeChip}>
              <AppIcon name="user" size={13} color={gold.border.strong} />
              <Text style={[typography.captionBold, styles.attributeChipText]}>
                {profile.occupation}
              </Text>
            </View>
          ) : null}
          {profile.education ? (
            <View style={styles.attributeChip}>
              <AppIcon name="star" size={13} color={gold.border.strong} />
              <Text style={[typography.captionBold, styles.attributeChipText]}>
                {profile.education}
              </Text>
            </View>
          ) : null}
          {profile.religiousLevel ? (
            <View style={styles.attributeChip}>
              <AppIcon name="heart" size={13} color={gold.border.strong} />
              <Text style={[typography.captionBold, styles.attributeChipText]}>
                {profile.religiousLevel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Mutual Match Banner (Owner Screen 16 — R-08 / S6-A04-F03) OR Relationship Status Surface (Owner Screen 2) */}
      {isMutualMatch ? (
        <Card
          appearance="dark"
          borderAppearance="strongGold"
          padding="lg"
          style={styles.matchCard}
        >
          <View style={styles.matchGlowContainer} accessibilityLiveRegion="assertive">
            <View style={styles.matchIconCircle}>
              <AppIcon name="heart" size={28} color="#89C283" />
            </View>
            <Text style={[typography.titleLarge, styles.matchTitle]}>יש התאמה!</Text>
            <BidiText
              value={`גם ${profile.fullName} הביע/ה בך עניין. נוצר ביניכם Match!\nאפשר להתחיל שיחה ולבנות קשר משמעותי.`}
              style={[typography.bodyMedium, styles.matchSubtitle]}
            />
          </View>

          {/* Mutual Match Destinations (Server-Driven) */}
          <ResponsiveActionGroup alignment="stacked" style={styles.matchActionsGroup}>
            {allowedActions.includes('CHAT_OPEN') && matchId ? (
              <Button
                label="עבור לצ׳אט"
                onPress={handleChatOpen}
                variant="primary"
                visualAppearance="gold"
                iconStart="mail"
                fullWidth
                accessibilityLabel="מעבר לצ׳אט"
              />
            ) : null}

            {allowedActions.includes('MATCH_DETAILS_OPEN') && matchId ? (
              <Button
                label="ראה את ההתאמות שלי"
                onPress={handleMatchDetailsOpen}
                variant="secondary"
                iconStart="user"
                fullWidth
                accessibilityLabel="צפייה בפרטי השידוך"
                style={styles.matchSecondaryBtn}
                labelStyle={styles.matchSecondaryBtnText}
              />
            ) : null}
          </ResponsiveActionGroup>
        </Card>
      ) : (
        <>
          {/* Relationship Status Surface (Owner Screen 2) */}
          {profile.relationship && (
            <Card appearance="ivory" padding="md" style={styles.statusCard}>
              <View style={styles.statusRow}>
                <View style={styles.statusTextCol}>
                  <Text style={[typography.bodyMediumBold, styles.statusCardTitle]}>
                    {contextLabel || 'הוצג לך בגילוי הגלובלי'}
                  </Text>
                </View>
                <AppIcon name="search" size={20} color={text.onIvory.primary} />
              </View>

              <View style={styles.statusDivider} />

              <View style={styles.statusRow}>
                <View style={styles.statusTextCol}>
                  <Text style={[typography.bodyMediumBold, styles.statusCardTitle]}>
                    {`סטטוס קשר: ${getRelationshipStatusText()}`}
                  </Text>
                  {allowedActions.includes('OPENING_CREATE') && (
                    <Text style={[typography.captionBold, styles.statusSubtextSuccess]}>
                      זמינה להודעת פתיחה
                    </Text>
                  )}
                </View>
                <AppIcon name="mail" size={20} color={text.onIvory.primary} />
              </View>
            </Card>
          )}
        </>
      )}

      {/* Profile Information Sections (Owner Screen 2 / 22 — Approved Ivory Cards) */}
      <View style={styles.sectionsContainer}>
        {/* Section 1: About Me */}
        {(profile.selfDescription || profile.hobbies) ? (
          <Card appearance="ivory" padding="md" style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[typography.titleSmall, styles.sectionTitle]}>עליי</Text>
              <View style={styles.sectionIconBadge}>
                <AppIcon name="user" size={16} color={colors.textInverse} />
              </View>
            </View>
            <View style={styles.sectionCardContent}>
              {profile.selfDescription ? (
                <View style={styles.longTextContainer}>
                  <BidiText value={profile.selfDescription} style={[typography.bodyMedium, styles.longTextValue]} />
                </View>
              ) : null}
              {profile.hobbies ? (
                <View style={styles.longTextContainer}>
                  <Text style={[typography.captionBold, styles.fieldSubLabel]}>תחביבים ותחומי עניין</Text>
                  <BidiText value={profile.hobbies} style={[typography.bodyMedium, styles.longTextValue]} />
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        {/* Section 2: Personal Details & Career Grid (Owner Screen 2 / 22) */}
        <Card appearance="ivory" padding="md" style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[typography.titleSmall, styles.sectionTitle]}>פרטים</Text>
            <View style={styles.sectionIconBadge}>
              <AppIcon name="info" size={16} color={colors.textInverse} />
            </View>
          </View>
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={[typography.caption, styles.gridCellLabel]}>עיר</Text>
                <BidiText value={getEmptyLabel(profile.areaOfResidence)} style={[typography.bodyMediumBold, styles.gridCellValue]} />
              </View>
              <View style={styles.gridCell}>
                <Text style={[typography.caption, styles.gridCellLabel]}>גיל</Text>
                <BidiText value={getEmptyLabel(profile.age)} style={[typography.bodyMediumBold, styles.gridCellValue]} />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={[typography.caption, styles.gridCellLabel]}>עיסוק</Text>
                <BidiText value={getEmptyLabel(profile.occupation)} style={[typography.bodyMediumBold, styles.gridCellValue]} />
              </View>
              <View style={styles.gridCell}>
                <Text style={[typography.caption, styles.gridCellLabel]}>גובה</Text>
                <BidiText value={`${profile.heightCm} ס״מ`} style={[typography.bodyMediumBold, styles.gridCellValue]} />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={[typography.caption, styles.gridCellLabel]}>השכלה</Text>
                <BidiText value={getEmptyLabel(profile.education)} style={[typography.bodyMediumBold, styles.gridCellValue]} />
              </View>
              <View style={styles.gridCell}>
                <Text style={[typography.caption, styles.gridCellLabel]}>כיסוי ראש</Text>
                <BidiText value={getEmptyLabel(profile.headCovering)} style={[typography.bodyMediumBold, styles.gridCellValue]} />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={[typography.caption, styles.gridCellLabel]}>רמת דת</Text>
                <BidiText value={getEmptyLabel(profile.religiousLevel)} style={[typography.bodyMediumBold, styles.gridCellValue]} />
              </View>
              <View style={styles.gridCell}>
                <Text style={[typography.caption, styles.gridCellLabel]}>רישיון נהיגה</Text>
                <BidiText value={getYesNoLabel(profile.hasDrivingLicense)} style={[typography.bodyMediumBold, styles.gridCellValue]} />
              </View>
            </View>
          </View>
        </Card>

        {/* Section 3: Looking For */}
        {profile.lookingFor ? (
          <Card appearance="ivory" padding="md" style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[typography.titleSmall, styles.sectionTitle]}>מה אני מחפש/ת</Text>
              <View style={styles.sectionIconBadge}>
                <AppIcon name="heart" size={16} color={colors.textInverse} />
              </View>
            </View>
            <View style={styles.sectionCardContent}>
              <BidiText value={profile.lookingFor} style={[typography.bodyMedium, styles.longTextValue]} />
            </View>
          </Card>
        ) : null}

        {/* Section 4: Family Background */}
        {profile.familyDescription ? (
          <Card appearance="ivory" padding="md" style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[typography.titleSmall, styles.sectionTitle]}>רקע משפחתי</Text>
              <View style={styles.sectionIconBadge}>
                <AppIcon name="home" size={16} color={colors.textInverse} />
              </View>
            </View>
            <View style={styles.sectionCardContent}>
              <BidiText value={profile.familyDescription} style={[typography.bodyMedium, styles.longTextValue]} />
            </View>
          </Card>
        ) : null}
      </View>

      {/* Server-Driven Action Region (Owner Screen 2 — S6-A04-F01) */}
      {!isMutualMatch && profile.relationship && (
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

      {/* Visually Separated Safety Region (Owner Screen 2 / 22) */}
      {(allowedActions.includes('REPORT') || allowedActions.includes('BLOCK')) && (
        <Card
          appearance="dark"
          borderAppearance="restrainedGold"
          padding="md"
          style={styles.safetyCard}
        >
          <View style={styles.safetyHeaderRow}>
            <AppIcon name="shield" size={18} color={gold.border.strong} />
            <Text style={[typography.heading, styles.safetyTitle]}>בטיחות ופרטיות</Text>
          </View>
          <Text style={[typography.caption, styles.safetySubtext]}>נשמר בדיסקרטיות</Text>

          <ResponsiveActionGroup alignment="inline" style={styles.safetyActionsGroup}>
            {allowedActions.includes('REPORT') && (
              <Button
                label="דיווח"
                onPress={handleReportUser}
                variant="secondary"
                iconStart="alert-circle"
                accessibilityLabel="דיווח על משתמש"
                style={styles.safetyBtn}
                labelStyle={styles.safetyBtnText}
              />
            )}
            {allowedActions.includes('BLOCK') && (
              <Button
                label="חסימה"
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
  sourceBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  sourceText: {
    color: gold.border.strong,
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: visual.surface.darkRaised,
    borderWidth: 1.5,
    borderColor: gold.border.strong,
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
    backgroundColor: visual.surface.darkRaised,
  },
  mediaPlaceholderText: {
    color: text.onDark.secondary,
    marginTop: spacing.md,
  },
  identityContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  candidateName: {
    color: gold.border.strong,
    fontSize: 26,
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  candidateSubtitle: {
    color: text.onDark.secondary,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: visual.surface.darkRaised,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#3D3A36',
  },
  attributeChipText: {
    color: text.onDark.secondary,
  },
  statusCard: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  statusTextCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusCardTitle: {
    color: text.onIvory.primary,
    textAlign: 'right',
  },
  statusSubtextSuccess: {
    color: status.success.onIvory,
    marginTop: spacing.xxs,
    textAlign: 'right',
  },
  statusDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2D5C8',
    marginVertical: spacing.xs,
  },
  matchCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  matchGlowContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  matchIconCircle: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: 'rgba(137, 194, 131, 0.15)',
    borderWidth: 1,
    borderColor: '#89C283',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  matchTitle: {
    color: '#89C283',
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontSize: 22,
  },
  matchSubtitle: {
    color: text.onDark.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  matchActionsGroup: {
    width: '100%',
    gap: spacing.sm,
  },
  matchSecondaryBtn: {
    backgroundColor: visual.surface.darkRaised,
    borderWidth: 1,
    borderColor: gold.border.restrained,
  },
  matchSecondaryBtnText: {
    color: gold.border.strong,
  },
  sectionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionCard: {
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: text.onIvory.primary,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: '#1C1917',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCardContent: {
    gap: spacing.xs,
  },
  gridContainer: {
    gap: spacing.xs,
  },
  gridRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2D5C8',
    gap: spacing.md,
  },
  gridCell: {
    flex: 1,
    alignItems: 'flex-end',
  },
  gridCellLabel: {
    color: text.onIvory.secondary,
    textAlign: 'right',
    marginBottom: 2,
  },
  gridCellValue: {
    color: text.onIvory.primary,
    textAlign: 'right',
  },
  longTextContainer: {
    paddingVertical: spacing.xxs,
  },
  fieldSubLabel: {
    color: text.onIvory.secondary,
    textAlign: 'right',
    marginBottom: spacing.xxs,
  },
  longTextValue: {
    color: text.onIvory.primary,
    lineHeight: 22,
    textAlign: 'right',
  },
  actionsSection: {
    marginBottom: spacing.lg,
  },
  safetyCard: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  safetyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  safetyTitle: {
    color: text.onDark.primary,
  },
  safetySubtext: {
    color: text.onDark.muted,
    marginBottom: spacing.md,
  },
  safetyActionsGroup: {
    gap: spacing.md,
  },
  safetyBtn: {
    flex: 1,
    minWidth: 100,
  },
  safetyBtnText: {
    color: text.onDark.primary,
  },
  deniedCard: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  deniedIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: visual.surface.darkRaised,
    borderWidth: 1.5,
    borderColor: gold.border.strong,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deniedTitle: {
    color: gold.border.strong,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontSize: 20,
  },
  deniedMessage: {
    color: text.onDark.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  deniedSubtext: {
    color: text.onDark.muted,
    textAlign: 'center',
  },
  returnCard: {
    marginVertical: spacing.md,
  },
  returnHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  returnIconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: '#E7D8CB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnHeaderTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  returnTitle: {
    color: text.onIvory.primary,
    textAlign: 'right',
  },
  returnSubtext: {
    color: text.onIvory.secondary,
    textAlign: 'right',
    marginTop: 2,
  },
  returnButton: {
    marginTop: spacing.xs,
  },
});
