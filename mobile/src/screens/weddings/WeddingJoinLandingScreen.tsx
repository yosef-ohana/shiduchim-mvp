import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, BackHandler } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { BidiText } from '../../components/foundation/BidiText';
import { AppIcon } from '../../components/foundation/AppIcon';
import { tokens } from '../../theme/tokens';
import { validateCode, joinWedding, getMyWeddings } from '../../api/weddingsApi';
import { ValidateWeddingCodeResponse, UserWeddingResponse, WeddingStatus } from '../../types/api';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { formatDisplayDate } from '../../utils/displayLabels';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getWeddingReadiness } from '../../utils/weddingReadiness';
import { getImageUrl } from '../../utils/imageUrl';

export const WeddingJoinLandingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, refreshMe } = useAuth();

  const initialCode = route.params?.accessCode || route.params?.pendingWeddingCode || '';
  const initialSnapshot = route.params?.weddingSnapshot as UserWeddingResponse | undefined;

  const [accessCode, setAccessCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationDetails, setValidationDetails] = useState<ValidateWeddingCodeResponse | null>(null);
  const [myWedding, setMyWedding] = useState<UserWeddingResponse | null>(initialSnapshot || null);
  const [partialJoinState, setPartialJoinState] = useState<{ pendingCode: string; errorDetails: string } | null>(null);

  const clearProtectedWeddingState = useCallback(() => {
    setValidationDetails(null);
    setMyWedding(null);
    setPartialJoinState(null);
  }, []);

  const effectiveWeddingId = myWedding?.weddingId ?? validationDetails?.weddingId ?? route.params?.weddingId ?? null;
  const effectiveWeddingName = myWedding?.weddingName ?? validationDetails?.weddingName ?? null;
  const effectiveCity = myWedding?.city ?? validationDetails?.city ?? null;
  const effectiveWeddingDate = myWedding?.weddingDate ?? validationDetails?.weddingDate ?? null;
  const effectiveStatus: WeddingStatus | null = myWedding?.weddingStatus ?? validationDetails?.status ?? null;
  const effectiveImageUri = myWedding?.backgroundImageUrl ?? validationDetails?.backgroundImageUrl ?? null;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const refreshData = async () => {
        if (!user || user.role === 'ADMIN' || user.role === 'EVENT_MANAGER') return;
        try {
          await refreshMe();
          if (effectiveWeddingId) {
            const all = await getMyWeddings();
            const match = all.find(w => w.weddingId === effectiveWeddingId);
            if (isActive) setMyWedding(match || null);
          }
        } catch (e: any) {
          const status = e?.response?.status;
          if (status === 401 || status === 403) {
            if (isActive) {
              clearProtectedWeddingState();
              setErrorMsg(status === 401 ? 'נדרשת התחברות למערכת.' : 'אין הרשאה לצפות בפרטי חתונה זו.');
            }
          }
        }
      };
      refreshData();
      return () => { isActive = false; };
    }, [user?.id, effectiveWeddingId, refreshMe, clearProtectedWeddingState])
  );

  useEffect(() => {
    if (initialCode && !initialSnapshot) {
      handleValidate(initialCode);
    }
  }, [initialCode]);

  const handleValidate = async (codeToValidate: string) => {
    setErrorMsg('');
    clearProtectedWeddingState();

    const cleanCode = codeToValidate.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('אנא הזן קוד חתונה');
      return;
    }

    setIsLoading(true);
    try {
      const response = await validateCode({ accessCode: cleanCode });
      if (response.valid && response.joinAllowed) {
        setValidationDetails(response);
        if (user && user.role === 'USER') {
          try {
            const all = await getMyWeddings();
            const match = all.find(w => w.weddingId === response.weddingId);
            setMyWedding(match || null);
          } catch (e: any) {
            const status = e?.response?.status;
            if (status === 401 || status === 403) {
              clearProtectedWeddingState();
              setErrorMsg(status === 401 ? 'נדרשת התחברות למערכת.' : 'אין הרשאה לצפות בפרטי חתונה זו.');
            }
          }
        }
      } else {
        if (response.status === 'CLOSED' || response.status === 'CANCELLED' || response.status === 'DELETED') {
          if (response.status === 'DELETED') {
            // Protected data clearing for DELETED
            clearProtectedWeddingState();
            setAccessCode('');
          } else {
            setValidationDetails(response);
          }
        } else {
          setErrorMsg(response.message || 'קוד חתונה לא תקין. אנא ודא שהקוד נכון ונסה שוב.');
        }
      }
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        clearProtectedWeddingState();
        setErrorMsg(status === 401 ? 'נדרשת התחברות למערכת.' : 'אין הרשאה לבדוק קוד חתונה זה.');
      } else if (status === 404) {
        setErrorMsg('קוד חתונה לא תקין. אנא ודא שהקוד נכון ונסה שוב.');
      } else {
        setErrorMsg(getFriendlyErrorMessage(e, 'לא ניתן לבדוק את קוד החתונה כרגע.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    const codeToJoin = accessCode.trim().toUpperCase();
    if (!codeToJoin) return;

    setJoinLoading(true);
    setErrorMsg('');
    try {
      await joinWedding({ accessCode: codeToJoin });
      if (user && user.role === 'USER') {
        try {
          const all = await getMyWeddings();
          const targetId = effectiveWeddingId;
          const match = all.find(w => w.weddingId === targetId);
          if (match) {
            setMyWedding(match);
          }
        } catch (e: any) {
          const status = e?.response?.status;
          if (status === 401 || status === 403) {
            clearProtectedWeddingState();
            if (status === 401) {
              navigation.navigate('Login', { pendingWeddingCode: codeToJoin });
            } else {
              setErrorMsg('אין הרשאה לצפות בפרטי חתונה זו.');
            }
            return;
          }
        }
      }
      setPartialJoinState(null);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        clearProtectedWeddingState();
        navigation.navigate('Login', { pendingWeddingCode: codeToJoin });
        return;
      }

      if (status === 403) {
        clearProtectedWeddingState();
        setErrorMsg('אין הרשאה להצטרף לחתונה זו.');
        return;
      }

      if (status === 409 && user && user.role === 'USER') {
        try {
          const all = await getMyWeddings();
          const targetId = effectiveWeddingId;
          const match = all.find(w => w.weddingId === targetId);
          if (match) {
            setMyWedding(match);
            setPartialJoinState(null);
            return;
          }
        } catch (e: any) {
          const innerStatus = e?.response?.status;
          if (innerStatus === 401 || innerStatus === 403) {
            clearProtectedWeddingState();
            if (innerStatus === 401) {
              navigation.navigate('Login', { pendingWeddingCode: codeToJoin });
            } else {
              setErrorMsg('אין הרשאה להצטרף לחתונה זו.');
            }
            return;
          }
        }
      }

      const friendlyError = getFriendlyErrorMessage(err, 'לא ניתן להצטרף לחתונה כרגע.');
      setPartialJoinState({
        pendingCode: codeToJoin,
        errorDetails: friendlyError,
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleGoBack = useCallback(() => {
    if (user?.role === 'USER') {
      navigation.navigate('UserTabs', {
        screen: 'WeddingsRoot',
        params: { screen: 'MyWeddings' },
      });
    } else if (user?.role === 'ADMIN') {
      navigation.navigate('AdminHome');
    } else if (user?.role === 'EVENT_MANAGER') {
      navigation.navigate('EventManagerWeddings');
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Welcome');
    }
  }, [user?.role, navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleGoBack]);

  const handleContinueToSystem = () => {
    if (user?.role === 'USER') {
      navigation.navigate('UserTabs', {
        screen: 'WeddingsRoot',
        params: { screen: 'MyWeddings' },
      });
    } else {
      handleGoBack();
    }
  };

  const handleEditCode = () => {
    setPartialJoinState(null);
    setValidationDetails(null);
    setMyWedding(null);
  };

  const handleLogin = () => {
    navigation.navigate('Login', { pendingWeddingCode: accessCode });
  };

  const handleRegister = () => {
    navigation.navigate('Register', { pendingWeddingCode: accessCode });
  };

  const readiness = getWeddingReadiness({
    user,
    weddingStatus: effectiveStatus,
    participantStatus: myWedding?.participantStatus,
    isJoined: !!myWedding,
  });

  const renderReadinessGuidance = () => {
    if (!user || user.role === 'ADMIN' || user.role === 'EVENT_MANAGER') return null;

    if (readiness.state === 'READY') {
      return (
        <View style={styles.noticeCardSuccess}>
          <AppIcon name="check" size={24} color={tokens.colors.statusSuccess} style={styles.cardIcon} />
          <Text style={styles.noticeTextSuccess}>{readiness.message}</Text>
        </View>
      );
    }

    if (
      readiness.state === 'JOINED_MISSING_BASIC_PROFILE' ||
      readiness.state === 'JOINED_MISSING_PRIMARY_PHOTO' ||
      readiness.state === 'JOINED_MISSING_BOTH'
    ) {
      const originalSource = route.params?.originalSource || (route.params?.source !== 'returnFlow' ? route.params?.source : undefined);
      const currentAccessCode = accessCode || initialCode || route.params?.accessCode || undefined;

      return (
        <View style={styles.noticeCardWarning}>
          <AppIcon name="alert-circle" size={24} color={tokens.colors.statusWarning} style={styles.cardIcon} />
          <Text style={styles.noticeTextWarning}>{readiness.message}</Text>
          {readiness.primaryAction === 'EDIT_PROFILE' && (
            <AppButton
              title="השלם פרופיל בסיסי"
              onPress={() => navigation.navigate('BasicProfile', {
                returnToWedding: true,
                returnWeddingId: effectiveWeddingId || undefined,
                returnWeddingSnapshot: myWedding || undefined,
                accessCode: currentAccessCode,
                originalSource: originalSource,
                source: 'weddingHub',
                continueToFullAfterBasic: true,
                continueToPhotosAfterFull: readiness.state === 'JOINED_MISSING_BOTH',
              })}
              style={styles.actionButton}
            />
          )}
          {readiness.primaryAction === 'UPLOAD_PHOTO' && (
            <AppButton
              title="העלה תמונה ראשית"
              onPress={() => navigation.navigate('Photos', {
                returnToWedding: true,
                returnWeddingId: effectiveWeddingId || undefined,
                returnWeddingSnapshot: myWedding || undefined,
                accessCode: currentAccessCode,
                originalSource: originalSource,
                source: 'weddingHub',
              })}
              style={styles.actionButton}
            />
          )}
        </View>
      );
    }

    return null;
  };

  // Frame S6-A07-F03 — DELETED Tombstone
  if (effectiveStatus === 'DELETED') {
    return (
      <Screen style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.railContainer}>
            <View style={styles.tombstoneCard}>
              <AppIcon name="alert-circle" size={40} color={tokens.colors.statusError} style={styles.cardIconCenter} />
              <Text style={styles.tombstoneTitle}>חתונה זו נמחקה</Text>
              <Text style={styles.tombstoneSubtitle}>
                החתונה שהזנת אינה קיימת במערכת ואין לזהות זו כל מידע פעיל.
              </Text>
              <AppButton
                title="חזרה"
                onPress={handleGoBack}
                style={styles.actionButton}
              />
            </View>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  // Frame S6-A07-F02 — CLOSED Read-only
  if (effectiveStatus === 'CLOSED') {
    return (
      <Screen style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.railContainer}>
            <Text style={styles.title}>חתונה סגורה</Text>

            <View style={styles.card}>
              {effectiveImageUri ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: getImageUrl(effectiveImageUri) }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                  />
                </View>
              ) : null}
              <Text style={styles.weddingName}>{effectiveWeddingName}</Text>
              {effectiveWeddingDate ? (
                <Text style={styles.weddingDetail}>תאריך: {formatDisplayDate(effectiveWeddingDate)}</Text>
              ) : null}
              {effectiveCity ? (
                <Text style={styles.weddingDetail}>עיר: {effectiveCity}</Text>
              ) : null}
              <Text style={styles.weddingDetail}>סטטוס: נסגרה</Text>
            </View>

            <View style={styles.noticeCardInfo}>
              <AppIcon name="info" size={24} color={tokens.colors.statusInfo} style={styles.cardIcon} />
              <Text style={styles.noticeTextInfo}>
                חתונה זו נסגרה. מידע זה מוצג לצפייה בלבד ולא ניתן להצטרף אליה או לצפות במאגר החתונה.
              </Text>
            </View>

            <AppButton
              title="חזרה"
              onPress={handleGoBack}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  // Frame S6-A07-F02 variant — CANCELLED Read-only
  if (effectiveStatus === 'CANCELLED') {
    return (
      <Screen style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.railContainer}>
            <Text style={styles.title}>חתונה שבוטלה</Text>

            <View style={styles.card}>
              {effectiveImageUri ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: getImageUrl(effectiveImageUri) }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                  />
                </View>
              ) : null}
              <Text style={styles.weddingName}>{effectiveWeddingName}</Text>
              {effectiveWeddingDate ? (
                <Text style={styles.weddingDetail}>תאריך: {formatDisplayDate(effectiveWeddingDate)}</Text>
              ) : null}
              {effectiveCity ? (
                <Text style={styles.weddingDetail}>עיר: {effectiveCity}</Text>
              ) : null}
              <Text style={styles.weddingDetail}>סטטוס: בוטלה</Text>
            </View>

            <View style={styles.noticeCardWarning}>
              <AppIcon name="alert-circle" size={24} color={tokens.colors.statusWarning} style={styles.cardIcon} />
              <Text style={styles.noticeTextWarning}>
                חתונה זו בוטלה ולא ניתן להצטרף אליה.
              </Text>
            </View>

            <AppButton
              title="חזרה"
              onPress={handleGoBack}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  // Frame S6-A07-F04 — Partial Join Compact
  if (partialJoinState) {
    return (
      <Screen style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.railContainer}>
            <Text style={styles.title}>שגיאה בהצטרפות לחתונה</Text>

            <View style={styles.noticeCardError}>
              <AppIcon name="alert-circle" size={24} color={tokens.colors.statusError} style={styles.cardIcon} />
              <Text style={styles.noticeTextError}>{partialJoinState.errorDetails}</Text>
            </View>

            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>קוד חתונה שנשמר:</Text>
              <BidiText value={partialJoinState.pendingCode} kind="code" style={styles.codeText} />
            </View>

            <View style={styles.actionStack}>
              <AppButton
                title="ניסיון הצטרפות נוסף"
                onPress={handleJoin}
                loading={joinLoading}
                style={styles.actionButton}
              />
              <AppButton
                title="עריכת קוד חתונה"
                onPress={handleEditCode}
                variant="secondary"
                style={styles.actionButton}
              />
              {user?.role === 'USER' ? (
                <AppButton
                  title="המשך למערכת ללא הצטרפות"
                  onPress={handleContinueToSystem}
                  variant="secondary"
                  style={styles.actionButton}
                />
              ) : null}
            </View>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  const hasWeddingData = Boolean(effectiveWeddingId || validationDetails?.valid);

  // Main ACTIVE / Unvalidated Surface (S6-A07-F01)
  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!hasWeddingData ? (
          <View style={styles.railContainer}>
            <Text style={styles.title}>הזן קוד חתונה</Text>
            <Text style={styles.subtitle}>
              הזן את קוד החתונה שקיבלת ממנהל האירוע כדי לצפות בפרטי החתונה ולהצטרף.
            </Text>

            {errorMsg ? (
              <View style={styles.noticeCardError}>
                <Text style={styles.noticeTextError}>{errorMsg}</Text>
              </View>
            ) : null}

            <AppInput
              label="קוד חתונה"
              placeholder="לדוגמה: ABC123"
              value={accessCode}
              onChangeText={setAccessCode}
              autoCapitalize="characters"
            />

            <AppButton
              title="בדיקת קוד חתונה"
              onPress={() => handleValidate(accessCode)}
              loading={isLoading}
              style={styles.actionButton}
            />
          </View>
        ) : (
          <View style={styles.railContainer}>
            <Text style={styles.title}>פרטי החתונה</Text>

            <View style={styles.card}>
              {effectiveImageUri ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: getImageUrl(effectiveImageUri) }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                  />
                </View>
              ) : null}
              <Text style={styles.weddingName}>{effectiveWeddingName}</Text>
              {effectiveWeddingDate ? (
                <Text style={styles.weddingDetail}>תאריך: {formatDisplayDate(effectiveWeddingDate)}</Text>
              ) : null}
              {effectiveCity ? (
                <Text style={styles.weddingDetail}>עיר: {effectiveCity}</Text>
              ) : null}
              <Text style={styles.weddingDetail}>סטטוס: פעילה</Text>
            </View>

            {errorMsg ? (
              <View style={styles.noticeCardError}>
                <Text style={styles.noticeTextError}>{errorMsg}</Text>
              </View>
            ) : null}

            {!user ? (
              <View style={styles.actionStack}>
                <Text style={styles.subtitle}>כדי להצטרף לחתונה זו, יש להתחבר או ליצור חשבון.</Text>
                <AppButton
                  title="התחברות"
                  onPress={handleLogin}
                  style={styles.actionButton}
                />
                <AppButton
                  title="יצירת חשבון"
                  onPress={handleRegister}
                  variant="secondary"
                  style={styles.actionButton}
                />
              </View>
            ) : user.role === 'ADMIN' || user.role === 'EVENT_MANAGER' ? (
              <View style={styles.noticeCardInfo}>
                <Text style={styles.noticeTextInfo}>
                  מנהלים וצוות המערכת אינם יכולים להצטרף למאגר הזיווגים של החתונה כמשתתף.
                </Text>
              </View>
            ) : readiness.state === 'BLOCKED_USER' ? (
              <View style={styles.noticeCardError}>
                <Text style={styles.noticeTextError}>המשתמש חסום. פנה להנהלת המערכת.</Text>
              </View>
            ) : readiness.state === 'INACTIVE_PARTICIPANT' ? (
              <View style={styles.noticeCardWarning}>
                <Text style={styles.noticeTextWarning}>אינך משתתף פעיל בחתונה זו.</Text>
              </View>
            ) : readiness.state === 'NOT_JOINED' ? (
              <View style={styles.actionStack}>
                <AppButton
                  title="הצטרפות לחתונה"
                  onPress={handleJoin}
                  loading={joinLoading}
                  style={styles.actionButton}
                />
              </View>
            ) : (
              <View style={styles.actionStack}>
                {renderReadinessGuidance()}
                {readiness.canOpenDiscover && myWedding?.isWeddingPoolEligible === true && (
                  <AppButton
                    title="גלה התאמות בחתונה"
                    onPress={() => navigation.navigate('Discover', { pool: 'WEDDING', weddingId: myWedding.weddingId })}
                    style={styles.actionButton}
                  />
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: tokens.spacing.lg,
    justifyContent: 'center',
  },
  railContainer: {
    width: '100%',
    maxWidth: tokens.sizing.maxContentRailWidth,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: tokens.colors.textPrimary,
    marginBottom: tokens.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: tokens.spacing.xl,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: tokens.radii.md,
    overflow: 'hidden',
    marginBottom: tokens.spacing.md,
    backgroundColor: tokens.colors.surfaceSubtle,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  weddingName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: tokens.colors.textPrimary,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  weddingDetail: {
    fontSize: 16,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  actionStack: {
    marginTop: tokens.spacing.md,
    width: '100%',
  },
  actionButton: {
    marginBottom: tokens.spacing.md,
    minHeight: tokens.sizing.minTouchTarget,
  },
  codeBox: {
    backgroundColor: tokens.colors.surfaceSubtle,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: tokens.spacing.lg,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.xs,
  },
  codeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: tokens.colors.textPrimary,
    letterSpacing: 2,
  },
  tombstoneCard: {
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing.xxl,
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    borderColor: tokens.colors.statusErrorBorder,
    alignItems: 'center',
  },
  tombstoneTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: tokens.colors.statusError,
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  tombstoneSubtitle: {
    fontSize: 15,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    lineHeight: 22,
  },
  cardIcon: {
    marginRight: tokens.spacing.sm,
  },
  cardIconCenter: {
    marginBottom: tokens.spacing.sm,
  },
  noticeCardError: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: tokens.colors.statusErrorBg,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.statusErrorBorder,
    marginBottom: tokens.spacing.lg,
  },
  noticeTextError: {
    flex: 1,
    color: tokens.colors.statusError,
    fontSize: 15,
    textAlign: 'right',
  },
  noticeCardWarning: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: tokens.colors.statusWarningBg,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.statusWarningBorder,
    marginBottom: tokens.spacing.lg,
    flexWrap: 'wrap',
  },
  noticeTextWarning: {
    flex: 1,
    color: tokens.colors.statusWarning,
    fontSize: 15,
    textAlign: 'right',
    marginBottom: tokens.spacing.xs,
  },
  noticeCardSuccess: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: tokens.colors.statusSuccessBg,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.statusSuccessBorder,
    marginBottom: tokens.spacing.lg,
  },
  noticeTextSuccess: {
    flex: 1,
    color: tokens.colors.statusSuccess,
    fontSize: 15,
    textAlign: 'right',
  },
  noticeCardInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: tokens.colors.statusInfoBg,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.statusInfoBorder,
    marginBottom: tokens.spacing.lg,
  },
  noticeTextInfo: {
    flex: 1,
    color: tokens.colors.statusInfo,
    fontSize: 15,
    textAlign: 'right',
  },
});
