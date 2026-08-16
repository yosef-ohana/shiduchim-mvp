import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, BackHandler, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { BidiText } from '../../components/foundation/BidiText';
import { AppIcon } from '../../components/foundation/AppIcon';
import { tokens, colors, spacing, radii, sizing, visual, text, gold, status, field, shadow } from '../../theme/tokens';
import { validateCode, joinWedding, getMyWeddings } from '../../api/weddingsApi';
import { ValidateWeddingCodeResponse, UserWeddingResponse, WeddingStatus } from '../../types/api';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { formatDisplayDate } from '../../utils/displayLabels';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getWeddingReadiness } from '../../utils/weddingReadiness';
import { getImageUrl } from '../../utils/imageUrl';

// Decorative Visual Flourish Components for S6-A01-F03
const KnotOrnament = ({ size = 20, color = gold.border.strong }: { size?: number; color?: string }) => (
  <Svg width={size * 1.6} height={size} viewBox="0 0 32 20" fill="none">
    <Path
      d="M16 10C13 6 8 4 5 7C2 10 2 15 6 17C10 19 14 15 16 10ZM16 10C19 6 24 4 27 7C30 10 30 15 26 17C22 19 18 15 16 10Z"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="16" cy="10" r="1.5" fill={color} />
  </Svg>
);

const TitleFlourishLeft = () => (
  <Svg width={60} height={36} viewBox="0 0 60 36" fill="none">
    <Path
      d="M58 18C44 18 36 28 24 28C14 28 8 20 14 12C18 6 26 8 24 14C22 20 12 22 4 16C1 13.5 2 7 8 4"
      stroke={gold.border.strong}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.85"
    />
    <Circle cx="8" cy="4" r="1.5" fill={gold.border.strong} />
    <Circle cx="38" cy="10" r="1" fill={gold.border.strong} opacity="0.6" />
    <Circle cx="50" cy="8" r="1.2" fill={gold.border.strong} opacity="0.7" />
  </Svg>
);

const TitleFlourishRight = () => (
  <Svg width={60} height={36} viewBox="0 0 60 36" fill="none">
    <Path
      d="M2 18C16 18 24 28 36 28C46 28 52 20 46 12C42 6 34 8 36 14C38 20 48 22 56 16C59 13.5 58 7 52 4"
      stroke={gold.border.strong}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.85"
    />
    <Circle cx="52" cy="4" r="1.5" fill={gold.border.strong} />
    <Circle cx="22" cy="10" r="1" fill={gold.border.strong} opacity="0.6" />
    <Circle cx="10" cy="8" r="1.2" fill={gold.border.strong} opacity="0.7" />
  </Svg>
);

const MedallionSuccess = () => (
  <Svg width={68} height={68} viewBox="0 0 68 68" fill="none">
    <Circle cx="34" cy="34" r="30" stroke={gold.border.strong} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6" />
    <Path
      d="M34 2C31 6 37 6 34 2ZM34 66C31 62 37 62 34 66ZM2 34C6 31 6 37 2 34ZM66 34C62 31 62 37 66 34Z"
      stroke={gold.border.strong}
      strokeWidth="1"
    />
    <Path
      d="M12 12C15 17 19 15 16 11C13 7 8 9 12 12ZM56 12C53 17 49 15 52 11C55 7 60 9 56 12ZM12 56C15 51 19 53 16 57C13 61 8 59 12 56ZM56 56C53 51 49 53 52 57C55 61 60 59 56 56Z"
      stroke={gold.border.strong}
      strokeWidth="0.8"
      fill="none"
    />
    <Circle cx="34" cy="34" r="21" stroke={status.success.onIvory} strokeWidth="2.5" fill={colors.statusSuccessBg} />
    <Path
      d="M26 34.5L31.5 40L42 28.5"
      stroke={status.success.onIvory}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MedallionFailure = () => (
  <Svg width={68} height={68} viewBox="0 0 68 68" fill="none">
    <Circle cx="34" cy="34" r="30" stroke={gold.border.strong} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6" />
    <Path
      d="M34 2C31 6 37 6 34 2ZM34 66C31 62 37 62 34 66ZM2 34C6 31 6 37 2 34ZM66 34C62 31 62 37 66 34Z"
      stroke={gold.border.strong}
      strokeWidth="1"
    />
    <Path
      d="M12 12C15 17 19 15 16 11C13 7 8 9 12 12ZM56 12C53 17 49 15 52 11C55 7 60 9 56 12ZM12 56C15 51 19 53 16 57C13 61 8 59 12 56ZM56 56C53 51 49 53 52 57C55 61 60 59 56 56Z"
      stroke={gold.border.strong}
      strokeWidth="0.8"
      fill="none"
    />
    <Circle cx="34" cy="34" r="21" stroke={colors.statusError} strokeWidth="2.5" fill={colors.statusErrorBg} />
    <Path
      d="M27 27L41 41M41 27L27 41"
      stroke={colors.statusError}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const KnotDivider = () => (
  <View style={styles.knotDividerRow}>
    <View style={styles.dividerLine} />
    <KnotOrnament size={14} color={gold.border.strong} />
    <View style={styles.dividerLine} />
  </View>
);

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

  // Frame S6-A01-F03 — Auth Success + Wedding Join Failure (Owner Screen 10)
  if (partialJoinState) {
    const weddingDisplayName = effectiveWeddingName
      ? `משפחות ${effectiveWeddingName}`
      : (myWedding?.weddingName || 'משפחות אבוחצירא-בן-דוד');

    return (
      <View style={styles.partialDarkCanvas}>
        <ScrollView contentContainerStyle={styles.partialScrollContent}>
          {/* Top Header */}
          <View style={styles.partialHeaderRow}>
            <View style={styles.partialHeaderPlaceholder} />
            <View style={styles.partialHeaderCenter}>
              <Text style={styles.partialHeaderTitle}>שידוכים</Text>
              <View style={styles.headerKnotWrapper}>
                <KnotOrnament size={12} color={gold.border.strong} />
              </View>
            </View>
            <View style={styles.partialHeaderAction}>
              <AppIcon name="bell" size={24} color={gold.border.strong} />
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.partialTitleSection}>
            <View style={styles.partialTitleRow}>
              <TitleFlourishLeft />
              <Text style={styles.partialPageTitleText} accessibilityRole="header">
                עדכון מצב
              </Text>
              <TitleFlourishRight />
            </View>
            <View style={styles.partialTitleKnotRow}>
              <KnotOrnament size={14} color={gold.border.strong} />
            </View>
          </View>

          {/* Card 1: Auth Success Card */}
          <View style={styles.partialSuccessCard}>
            <View style={styles.cardContentRow}>
              <View style={styles.cardTextCol}>
                <Text style={styles.cardSuccessTitle}>התחברת בהצלחה</Text>
                <Text style={styles.cardSuccessSubtext}>כניסתך למערכת בוצעה בהצלחה.</Text>
                <Text style={styles.cardSuccessSubtext}>אתה מחובר למערכת.</Text>
              </View>
              <View style={styles.cardMedallionCol}>
                <MedallionSuccess />
              </View>
            </View>
          </View>

          {/* Card 2: Wedding Join Failure Card */}
          <View style={styles.partialFailureCard}>
            {/* Incomplete Badge */}
            <View style={styles.incompleteBadge}>
              <AppIcon name="alert-circle" size={14} color={colors.statusError} />
              <Text style={styles.incompleteBadgeText}>לא הושלם</Text>
            </View>

            <View style={styles.cardContentRow}>
              <View style={styles.cardTextCol}>
                <Text style={styles.cardFailureTitle}>
                  {`ההצטרפות לחתונת\n${weddingDisplayName}\nלא הושלמה`}
                </Text>
                <Text style={styles.cardFailureSubtext}>
                  אירעה תקלה בעת ניסיון ההצטרפות.{'\n'}הקוד שנמסר נשמר וניתן לנסות שוב.
                </Text>
              </View>
              <View style={styles.cardMedallionCol}>
                <MedallionFailure />
              </View>
            </View>

            {/* Divider with Knot */}
            <KnotDivider />

            {/* Retained Code Box */}
            <View style={styles.retainedCodeBlock}>
              <View style={styles.retainedCodeLabelRow}>
                <AppIcon name="shield" size={16} color={colors.accent} />
                <Text style={styles.retainedCodeLabelText}>קוד החתונה נשמר</Text>
              </View>

              <View style={styles.retainedCodeBox}>
                <AppIcon name="star" size={18} color={colors.accent} />
                <BidiText value={partialJoinState.pendingCode} kind="code" style={styles.retainedCodeValue} />
              </View>

              <Text style={styles.retainedCodeHelpText}>
                ניתן להשתמש בקוד זה לניסיון הצטרפות חוזר{'\n'}או להעבירו אליך אחר.
              </Text>
            </View>
          </View>

          {/* Action Stack */}
          <View style={styles.partialActionStack}>
            <TouchableOpacity
              onPress={handleJoin}
              disabled={joinLoading}
              style={[styles.partialGoldButton, joinLoading && styles.btnDisabled]}
              accessibilityRole="button"
              accessibilityLabel="ניסיון נוסף"
            >
              <AppIcon name="chevron-left" size={20} color={text.onGold} mirrorRTL style={styles.btnIconLeading} />
              {joinLoading ? (
                <ActivityIndicator size="small" color={text.onGold} />
              ) : (
                <Text style={styles.partialGoldButtonText}>ניסיון נוסף</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEditCode}
              style={styles.partialDarkOutlineButton}
              accessibilityRole="button"
              accessibilityLabel="עריכת הקוד"
            >
              <AppIcon name="edit" size={20} color={gold.border.strong} style={styles.btnIconTrailing} />
              <Text style={styles.partialDarkOutlineButtonText}>עריכת הקוד</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleContinueToSystem}
              style={styles.partialDarkOutlineButton}
              accessibilityRole="button"
              accessibilityLabel="המשך לחתונות"
            >
              <AppIcon name="calendar" size={20} color={gold.border.strong} style={styles.btnIconTrailing} />
              <Text style={styles.partialDarkOutlineButtonText}>המשך לחתונות</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
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

  // S6-A01-F03 Auth Success + Wedding Join Failure Styles
  partialDarkCanvas: {
    flex: 1,
    backgroundColor: visual.canvas.dark,
  },
  partialScrollContent: {
    flexGrow: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.lg,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    gap: tokens.spacing.md,
  },
  partialHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    marginTop: tokens.spacing.sm,
  },
  partialHeaderPlaceholder: {
    width: 32,
  },
  partialHeaderCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  partialHeaderTitle: {
    color: gold.border.strong,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerKnotWrapper: {
    alignItems: 'center',
    marginTop: 2,
  },
  partialHeaderAction: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  partialTitleSection: {
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.xs,
  },
  partialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  partialPageTitleText: {
    color: text.onDark.primary,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: tokens.spacing.xs,
  },
  partialTitleKnotRow: {
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
  },

  // Card 1: Success Card
  partialSuccessCard: {
    backgroundColor: visual.surface.ivoryHighlight,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: tokens.radii.xl,
    padding: tokens.spacing.lg,
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextCol: {
    flex: 1,
    paddingEnd: tokens.spacing.md,
  },
  cardMedallionCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSuccessTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: text.onIvory.primary,
    marginBottom: tokens.spacing.xs,
    textAlign: 'right',
  },
  cardSuccessSubtext: {
    fontSize: 14,
    color: text.onIvory.secondary,
    lineHeight: 20,
    textAlign: 'right',
  },

  // Card 2: Failure Card
  partialFailureCard: {
    backgroundColor: visual.surface.ivoryHighlight,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: tokens.radii.xl,
    padding: tokens.spacing.lg,
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  incompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.statusErrorBg,
    borderColor: colors.statusError,
    borderWidth: 1,
    borderRadius: tokens.radii.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs,
    gap: tokens.spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: tokens.spacing.md,
  },
  incompleteBadgeText: {
    color: colors.statusError,
    fontSize: 12,
    fontWeight: '700',
  },
  cardFailureTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: text.onIvory.primary,
    lineHeight: 26,
    marginBottom: tokens.spacing.xs,
    textAlign: 'right',
  },
  cardFailureSubtext: {
    fontSize: 13,
    color: text.onIvory.secondary,
    lineHeight: 18,
    textAlign: 'right',
  },

  knotDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    marginVertical: tokens.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: gold.border.strong,
    opacity: 0.35,
  },

  retainedCodeBlock: {
    alignItems: 'center',
  },
  retainedCodeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.xs,
  },
  retainedCodeLabelText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  retainedCodeBox: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderStyle: 'dashed',
    borderRadius: tokens.radii.md,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.md,
    width: '100%',
    marginVertical: tokens.spacing.xs,
  },
  retainedCodeValue: {
    color: text.onIvory.primary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  retainedCodeHelpText: {
    fontSize: 12,
    color: text.onIvory.secondary,
    textAlign: 'center',
    marginTop: tokens.spacing.xs,
    lineHeight: 17,
  },

  // Action Buttons Stack
  partialActionStack: {
    width: '100%',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.xl,
  },
  partialGoldButton: {
    minHeight: 52,
    backgroundColor: gold.action.default,
    borderColor: gold.action.pressed,
    borderWidth: 1,
    borderRadius: tokens.radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  partialGoldButtonText: {
    color: text.onGold,
    fontSize: 17,
    fontWeight: '700',
  },
  btnIconLeading: {
    marginEnd: tokens.spacing.sm,
  },
  btnIconTrailing: {
    marginStart: tokens.spacing.sm,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  partialDarkOutlineButton: {
    minHeight: 52,
    backgroundColor: visual.surface.darkRaised,
    borderColor: colors.primaryMuted,
    borderWidth: 1.5,
    borderRadius: tokens.radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
  partialDarkOutlineButtonText: {
    color: gold.border.strong,
    fontSize: 16,
    fontWeight: '600',
  },
});
