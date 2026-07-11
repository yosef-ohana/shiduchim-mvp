import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { PublicProfileResponse, AllowedCandidateAction, PoolType } from '../../types/api';
import { getImageUrl } from '../../utils/imageUrl';
import { getYesNoLabel, getEmptyLabel } from '../../utils/displayLabels';
import { blockUser } from '../../api/blocksApi';
import { getPublicProfile } from '../../api/profileApi';
import { likeUser, dislikeUser, freezeUser, unfreezeUser, removeAction } from '../../api/actionsApi';
import { cancelMatch } from '../../api/matchesApi';
import { sendOpeningMessage } from '../../api/openingMessagesApi';
import { CandidateProfileActions } from '../../components/profile/CandidateProfileActions';
import { OpeningMessageComposer } from '../../components/OpeningMessageComposer';

export const CandidateProfileScreen = ({ route, navigation }: any) => {
  const { userId, contextLabel, sourceType, sourceId, poolType, weddingId } = route.params || {};
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        if (err.response?.status === 403) {
          setError('אין לך הרשאה לצפות בפרופיל זה.');
        } else if (err.response?.status === 404) {
          setError('הפרופיל המבוקש אינו קיים עוד.');
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              'טעינת פרופיל המועמד נכשלה. אנא נסו שוב.'
          );
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

  const handleMatchCancel = () => {
    const matchId = profile?.relationship?.match?.matchId;
    if (!matchId) {
      Alert.alert('שגיאה', 'שגיאת מערכת: מזהה התאמה חסר. הפרופיל יתרענן.', [
        { text: 'אישור', onPress: fetchProfile }
      ]);
      return;
    }

    Alert.alert(
      'ביטול התאמה',
      'התאמה זו והגישה לצ׳אט יבוטלו. ההודעות הקיימות יישמרו. להמשיך?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'כן, ביטול התאמה',
          style: 'destructive',
          onPress: async () => {
            setLoadingAction('MATCH_CANCEL');
            try {
              await cancelMatch(matchId);
              Alert.alert(
                'ההתאמה בוטלה',
                'ההתאמה בוטלה בהצלחה.',
                [
                  {
                    text: 'אישור',
                    onPress: () => {
                      navigation.navigate('Matches');
                    }
                  }
                ]
              );
            } catch (err: any) {
              handleMutationError(err);
            } finally {
              setLoadingAction(null);
            }
          }
        }
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

  if (loading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.stateText}>טוען פרטי פרופיל...</Text>
      </Screen>
    );
  }

  if (error || !profile) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'לא ניתן היה לטעון את הפרופיל'}</Text>
        <AppButton title="נסה שוב" onPress={fetchProfile} style={styles.retryButton} />
        <AppButton
          title="חזור"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={[styles.retryButton, { marginTop: theme.spacing.s }]}
        />
      </Screen>
    );
  }

  const renderRow = (label: string, value: any, isLongText = false) => {
    const displayValue = getEmptyLabel(value);

    if (isLongText) {
      return (
        <View style={styles.longTextContainer} key={label}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.longTextValue}>{displayValue}</Text>
        </View>
      );
    }

    return (
      <View style={styles.row} key={label}>
        <Text style={styles.rowLabel}>{label}:</Text>
        <Text style={styles.rowValue}>{displayValue}</Text>
      </View>
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {contextLabel ? (
          <View style={styles.contextBanner}>
            <Text style={styles.contextBannerText}>{contextLabel}</Text>
          </View>
        ) : null}

        {/* Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {getImageUrl(profile.primaryPhotoUrl) ? (
              <Image source={{ uri: getImageUrl(profile.primaryPhotoUrl) }} style={styles.mainImage} />
            ) : (
              <View style={[styles.mainImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>אין תמונה</Text>
              </View>
            )}
            {getImageUrl(profile.additionalPhotoUrl) ? (
              <Image source={{ uri: getImageUrl(profile.additionalPhotoUrl) }} style={styles.sideImage} />
            ) : null}
          </View>
        </View>

        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.subtitle}>
            {profile.age} שנים • {profile.heightCm} ס״מ
          </Text>
        </View>

        {/* Relationship Status Section */}
        {profile.relationship && (
          <View style={styles.statusSection}>
            <Text style={styles.statusText}>{getRelationshipStatusText()}</Text>
          </View>
        )}

        {/* Dynamic Actions Section */}
        {profile.relationship && (
          <View style={styles.actionsSection}>
            <CandidateProfileActions
              allowedActions={profile.relationship.allowedActions}
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
              onMatchCancel={handleMatchCancel}
            />
          </View>
        )}

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטי פרופיל</Text>
          <View style={styles.card}>
            {renderRow('אזור מגורים', profile.areaOfResidence)}
            {renderRow('רמה דתית', profile.religiousLevel)}
            {renderRow('כיסוי ראש', profile.headCovering)}
            {renderRow('רישיון נהיגה', getYesNoLabel(profile.hasDrivingLicense))}
          </View>
        </View>

        {/* Education & Occupation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>השכלה וקריירה</Text>
          <View style={styles.card}>
            {renderRow('השכלה', profile.education)}
            {renderRow('עיסוק', profile.occupation)}
          </View>
        </View>

        {/* Written Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>עליי</Text>
          <View style={styles.card}>
            {renderRow('תיאור עצמי', profile.selfDescription, true)}
            {renderRow('תחביבים ותחומי עניין', profile.hobbies, true)}
            {renderRow('רקע משפחתי', profile.familyDescription, true)}
            {renderRow('מה אני מחפש/ת', profile.lookingFor, true)}
          </View>
        </View>

        {((profile.relationship?.allowedActions.includes('BLOCK')) ||
          (profile.relationship?.allowedActions.includes('REPORT'))) && (
          <View style={styles.section}>
            {profile.relationship?.allowedActions.includes('REPORT') && (
              <AppButton
                title="דווח על משתמש"
                onPress={() => navigation.navigate('ReportUser', { userId })}
                style={styles.reportButton}
              />
            )}
            {profile.relationship?.allowedActions.includes('BLOCK') && (
              <AppButton
                title="חסום משתמש"
                onPress={handleBlockUser}
                style={styles.blockButton}
              />
            )}
          </View>
        )}

        <View style={styles.spacing} />
      </ScrollView>

      <OpeningMessageComposer
        visible={composerVisible}
        onClose={() => setComposerVisible(false)}
        onSend={handleSendOpening}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  stateText: {
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  retryButton: {
    width: '60%',
  },
  photoSection: {
    marginBottom: theme.spacing.m,
  },
  photoContainer: {
    flexDirection: 'row',
    height: 280,
    gap: theme.spacing.s,
  },
  mainImage: {
    flex: 1,
    height: '100%',
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.border,
  },
  sideImage: {
    width: 120,
    height: '100%',
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.border,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAEAEA',
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    paddingRight: theme.spacing.s,
    textAlign: 'right',
  },
  card: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  rowValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'left',
    flex: 1,
    marginRight: theme.spacing.m,
  },
  longTextContainer: {
    paddingVertical: theme.spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  longTextValue: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: theme.spacing.s,
    lineHeight: 20,
    textAlign: 'right',
  },
  spacing: {
    height: theme.spacing.xl,
  },
  reportButton: {
    marginTop: theme.spacing.m,
    borderColor: theme.colors.error,
  },
  blockButton: {
    marginTop: theme.spacing.s,
    backgroundColor: '#8B0000',
  },
  statusSection: {
    backgroundColor: '#F5F5F5',
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.m,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: theme.spacing.l,
  },
  contextBanner: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextBannerText: {
    color: '#B58900',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
