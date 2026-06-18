import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { validateCode, joinWedding, getMyWeddings } from '../../api/weddingsApi';
import { ValidateWeddingCodeResponse, UserWeddingResponse } from '../../types/api';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { formatDisplayDate, getWeddingStatusLabel } from '../../utils/displayLabels';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getWeddingReadiness } from '../../utils/weddingReadiness';

export const WeddingJoinLandingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, refreshMe } = useAuth();

  const initialCode = route.params?.accessCode || '';
  const initialSnapshot = route.params?.weddingSnapshot as UserWeddingResponse | undefined;

  const [accessCode, setAccessCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [weddingDetails, setWeddingDetails] = useState<any>(initialSnapshot || null);
  const [myWedding, setMyWedding] = useState<UserWeddingResponse | null>(initialSnapshot || null);
  const [joinLoading, setJoinLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const refreshData = async () => {
        if (!user || user.role === 'ADMIN' || user.role === 'EVENT_MANAGER') return;
        try {
          await refreshMe();
          if (weddingDetails?.weddingId) {
            const all = await getMyWeddings();
            const match = all.find(w => w.weddingId === weddingDetails.weddingId);
            if (isActive) setMyWedding(match || null);
          }
        } catch (e) {
          console.log('Failed to refresh data', e);
        }
      };
      refreshData();
      return () => { isActive = false; };
    }, [user?.id, weddingDetails?.weddingId])
  );

  useEffect(() => {
    if (initialCode && !initialSnapshot) {
      handleValidate(initialCode);
    }
  }, [initialCode]);

  const handleValidate = async (codeToValidate: string) => {
    setErrorMsg('');
    setWeddingDetails(null);
    setMyWedding(null);

    if (!codeToValidate) {
      setErrorMsg('אנא הזן קוד חתונה');
      return;
    }

    setIsLoading(true);
    try {
      const response = await validateCode({ accessCode: codeToValidate });
      if (response.valid && response.joinAllowed) {
        setWeddingDetails(response);
        if (user && user.role === 'USER') {
          const all = await getMyWeddings();
          const match = all.find(w => w.weddingId === response.weddingId);
          setMyWedding(match || null);
        }
      } else {
        if (response.status === 'CLOSED' || response.status === 'CANCELLED') {
          setWeddingDetails(response);
          const statusLabel = response.status === 'CLOSED' ? 'נסגרה' : 'בוטלה';
          setErrorMsg(`חתונה זו ${statusLabel} ולא ניתן להצטרף אליה.`);
        } else {
          setErrorMsg(response.message || 'קוד חתונה לא תקין. אנא ודא שהקוד נכון ונסה שוב.');
        }
      }
    } catch (e: any) {
      setErrorMsg(getFriendlyErrorMessage(e, 'לא ניתן לבדוק את קוד החתונה כרגע.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!weddingDetails || !accessCode) return;

    setJoinLoading(true);
    setErrorMsg('');
    try {
      await joinWedding({ accessCode });
      if (user && user.role === 'USER') {
        const all = await getMyWeddings();
        const match = all.find(w => w.weddingId === weddingDetails.weddingId);
        setMyWedding(match || null);
      }
    } catch (err: any) {
      // Backend may return error if already joined, attempt to fetch again
      if (user && user.role === 'USER') {
        const all = await getMyWeddings();
        const match = all.find(w => w.weddingId === weddingDetails.weddingId);
        if (match) {
          setMyWedding(match);
          return;
        }
      }
      setErrorMsg(getFriendlyErrorMessage(err, 'לא ניתן להצטרף לחתונה כרגע.'));
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login', { pendingWeddingCode: accessCode });
  };

  const handleRegister = () => {
    navigation.navigate('Register', { pendingWeddingCode: accessCode });
  };

  const readiness = getWeddingReadiness({
    user,
    weddingStatus: weddingDetails?.status || weddingDetails?.weddingStatus,
    participantStatus: myWedding?.participantStatus,
    isJoined: !!myWedding
  });

  const renderReadinessGuidance = () => {
    if (!user || user.role === 'ADMIN' || user.role === 'EVENT_MANAGER') return null;

    if (readiness.state === 'READY') {
      return (
        <View style={styles.readinessContainer}>
          <Text style={styles.successMessage}>{readiness.message}</Text>
        </View>
      );
    }

    if (
      readiness.state === 'JOINED_MISSING_BASIC_PROFILE' ||
      readiness.state === 'JOINED_MISSING_PRIMARY_PHOTO' ||
      readiness.state === 'JOINED_MISSING_BOTH'
    ) {
      return (
        <View style={styles.readinessContainerWarning}>
          <Text style={styles.warningMessage}>{readiness.message}</Text>
          {readiness.primaryAction === 'EDIT_PROFILE' && (
            <AppButton
              title="השלם פרופיל בסיסי"
              onPress={() => navigation.navigate('BasicProfile', {
                returnToWedding: true,
                returnWeddingId: weddingDetails?.weddingId,
                returnWeddingSnapshot: myWedding || undefined,
                source: 'weddingHub'
              })}
              style={styles.actionButton}
            />
          )}
          {readiness.primaryAction === 'UPLOAD_PHOTO' && (
            <AppButton
              title="העלה תמונה ראשית"
              onPress={() => navigation.navigate('Photos', {
                returnToWedding: true,
                returnWeddingId: weddingDetails?.weddingId,
                returnWeddingSnapshot: myWedding || undefined,
                source: 'weddingHub'
              })}
              style={styles.actionButton}
            />
          )}
        </View>
      );
    }

    return null;
  };

  const hasWeddingData = weddingDetails && (weddingDetails.valid || weddingDetails.weddingId);

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!hasWeddingData ? (
          <View style={styles.content}>
            <Text style={styles.title}>הזן קוד חתונה</Text>
            <Text style={styles.subtitle}>הזן את קוד החתונה שקיבלת ממנהל האירוע כדי לצפות בפרטי החתונה ולהצטרף.</Text>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <AppInput
              label="קוד חתונה"
              placeholder="לדוגמה: ABC123"
              value={accessCode}
              onChangeText={setAccessCode}
              autoCapitalize="characters"
            />

            <AppButton
              title="המשך"
              onPress={() => handleValidate(accessCode)}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.title}>החתונה נמצאה!</Text>

            <View style={styles.card}>
              <Text style={styles.weddingName}>{weddingDetails.weddingName}</Text>
              <Text style={styles.weddingDetail}>תאריך: {formatDisplayDate(weddingDetails.weddingDate)}</Text>
              <Text style={styles.weddingDetail}>עיר: {weddingDetails.city}</Text>
              <Text style={styles.weddingDetail}>סטטוס: {getWeddingStatusLabel(weddingDetails.status || weddingDetails.weddingStatus)}</Text>
            </View>

            {errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}

            {!user ? (
              <View style={styles.actionContainer}>
                <Text style={styles.subtitle}>כדי להצטרף לחתונה הזו, יש להתחבר או ליצור חשבון.</Text>
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
              <View style={styles.actionContainer}>
                <Text style={styles.errorText}>הצטרפות כמשתתף זמינה למשתמשים רגילים בלבד.</Text>
              </View>
            ) : readiness.state === 'BLOCKED_USER' || readiness.state === 'INACTIVE_WEDDING' || readiness.state === 'INACTIVE_PARTICIPANT' ? (
              <View style={styles.actionContainer}>
                <Text style={styles.errorText}>{readiness.message}</Text>
              </View>
            ) : readiness.state === 'NOT_JOINED' ? (
              <View style={styles.actionContainer}>
                <AppButton
                  title="הצטרפות לחתונה"
                  onPress={handleJoin}
                  loading={joinLoading}
                  style={styles.actionButton}
                />
              </View>
            ) : (
              <View style={styles.actionContainer}>
                {renderReadinessGuidance()}
                {readiness.canOpenDiscover && (
                  <AppButton
                    title="גלה התאמות בחתונה"
                    onPress={() => navigation.navigate('Discover', { pool: 'WEDDING', weddingId: weddingDetails.weddingId })}
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, padding: theme.spacing.xl, justifyContent: 'center' },
  content: { width: '100%' },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.m, textAlign: 'center' },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, textAlign: 'center' },
  button: { marginTop: theme.spacing.l },
  errorText: { color: theme.colors.error, marginBottom: theme.spacing.m, textAlign: 'center', fontWeight: '500' },
  card: { backgroundColor: theme.colors.surface, padding: theme.spacing.l, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.xl, alignItems: 'center' },
  weddingName: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.s, textAlign: 'center' },
  weddingDetail: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: theme.spacing.s / 2 },
  actionContainer: { marginTop: theme.spacing.m },
  actionButton: { marginBottom: theme.spacing.m },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.m, textAlign: 'center' },
  successMessage: { color: theme.colors.primary, fontSize: 16, textAlign: 'center' },
  warningMessage: { color: '#F57C00', fontSize: 16, textAlign: 'center', marginBottom: theme.spacing.m },
  readinessContainer: { padding: theme.spacing.m, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.s, marginBottom: theme.spacing.l, borderWidth: 1, borderColor: theme.colors.primary },
  readinessContainerWarning: { padding: theme.spacing.m, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.s, marginBottom: theme.spacing.l, borderWidth: 1, borderColor: '#F57C00' },
});
