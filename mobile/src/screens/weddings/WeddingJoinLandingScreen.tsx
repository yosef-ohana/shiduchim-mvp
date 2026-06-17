import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { validateCode, joinWedding } from '../../api/weddingsApi';
import { ValidateWeddingCodeResponse } from '../../types/api';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { formatDisplayDate, getWeddingStatusLabel } from '../../utils/displayLabels';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';

export const WeddingJoinLandingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const initialCode = route.params?.accessCode || '';
  const [accessCode, setAccessCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [weddingDetails, setWeddingDetails] = useState<ValidateWeddingCodeResponse | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    if (initialCode) {
      handleValidate(initialCode);
    }
  }, [initialCode]);

  const handleValidate = async (codeToValidate: string) => {
    setErrorMsg('');
    setWeddingDetails(null);
    setJoinSuccess(false);

    if (!codeToValidate) {
      setErrorMsg('אנא הזן קוד חתונה');
      return;
    }

    setIsLoading(true);
    try {
      const response = await validateCode({ accessCode: codeToValidate });
      if (response.valid && response.joinAllowed) {
        setWeddingDetails(response);
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
      setJoinSuccess(true);
    } catch (err: any) {
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

  const renderReadinessGuidance = () => {
    if (!user) return null;
    const missingBasic = user.profileStatus === 'NONE';
    const missingPhoto = !user.hasPrimaryPhoto;

    if (!missingBasic && !missingPhoto) {
      return (
        <View style={styles.readinessContainer}>
          <Text style={styles.successMessage}>מעולה! הפרופיל והתמונה שלך מעודכנים. את/ה מוכן/ה למאגר החתונה.</Text>
        </View>
      );
    }

    let message = 'כדי להופיע במאגר החתונה חסרים הפרטים הבאים:';
    if (missingBasic && missingPhoto) {
      message = 'כדי להופיע במאגר החתונה עליך למלא פרופיל בסיסי ולהעלות תמונה ראשית.';
    } else if (missingBasic) {
      message = 'כדי להופיע במאגר החתונה עליך למלא פרופיל בסיסי.';
    } else if (missingPhoto) {
      message = 'כדי להופיע במאגר החתונה עליך להעלות תמונה ראשית.';
    }

    return (
      <View style={styles.readinessContainerWarning}>
        <Text style={styles.warningMessage}>{message}</Text>
      </View>
    );
  };

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!weddingDetails || (!weddingDetails.valid && !weddingDetails.weddingId) ? (
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
              <Text style={styles.weddingDetail}>סטטוס: {getWeddingStatusLabel(weddingDetails.status)}</Text>
            </View>

            {errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : joinSuccess ? (
              <View style={styles.actionContainer}>
                <Text style={styles.successTitle}>הצטרפת בהצלחה!</Text>
                {renderReadinessGuidance()}
                <AppButton
                  title="החתונות שלי"
                  onPress={() => navigation.navigate('MyWeddings')}
                  style={styles.actionButton}
                />
              </View>
            ) : !user ? (
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
            ) : (
              <View style={styles.actionContainer}>
                <AppButton
                  title="הצטרפות לחתונה"
                  onPress={handleJoin}
                  loading={joinLoading}
                  style={styles.actionButton}
                />
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
  warningMessage: { color: '#F57C00', fontSize: 16, textAlign: 'center' },
  readinessContainer: { padding: theme.spacing.m, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.s, marginBottom: theme.spacing.l, borderWidth: 1, borderColor: theme.colors.primary },
  readinessContainerWarning: { padding: theme.spacing.m, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.s, marginBottom: theme.spacing.l, borderWidth: 1, borderColor: '#F57C00' },
});
