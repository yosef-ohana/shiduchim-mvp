import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { getMyProfile, updateBasicProfile } from '../../api/profileApi';
import { theme } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

const getProfileStatusLabel = (status: string) => {
  switch (status) {
    case 'NONE': return 'לא הוגדר';
    case 'BASIC': return 'פרופיל בסיסי';
    case 'FULL': return 'פרופיל מלא';
    case 'FULL_INCOMPLETE_BLOCKED': return 'פרופיל מלא חסר (חסום)';
    default: return status;
  }
};

const translateFieldName = (field: string) => {
  switch (field) {
    case 'education': return 'השכלה';
    case 'occupation': return 'עיסוק';
    case 'selfDescription': return 'עליי / תיאור עצמי';
    case 'hobbies': return 'תחביבים';
    case 'lookingFor': return 'מה אני מחפש/ת';
    case 'primaryPhoto': return 'תמונה ראשית';
    default: return field;
  }
};

export const BasicProfileScreen = ({ navigation, route }: any) => {
  const { refreshMe } = useAuth();
  const returnToWedding = route.params?.returnToWedding;
  const returnWeddingId = route.params?.returnWeddingId;
  const returnWeddingSnapshot = route.params?.returnWeddingSnapshot;
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [areaOfResidence, setAreaOfResidence] = useState('');
  const [religiousLevel, setReligiousLevel] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    profileStatus: string;
    missingFields: string[];
    hasPrimaryPhoto: boolean;
  } | null>(null);

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await getMyProfile();
      setFullName(data.fullName || '');
      setAge(data.age ? String(data.age) : '');
      setHeightCm(data.heightCm ? String(data.heightCm) : '');
      setAreaOfResidence(data.areaOfResidence || '');
      setReligiousLevel(data.religiousLevel || '');
      setPhone(data.phone || '');
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err, 'טעינת נתוני הפרופיל נכשלה.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessInfo(null);

    // Local validation
    if (!fullName.trim() || !age.trim() || !heightCm.trim() || !areaOfResidence.trim() || !religiousLevel.trim() || !phone.trim()) {
      setErrorMsg('כל השדות הם שדות חובה');
      return;
    }

    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseInt(heightCm, 10);

    if (isNaN(parsedAge) || parsedAge <= 0) {
      setErrorMsg('אנא הזן מספר חיובי תקין עבור גיל');
      return;
    }

    if (isNaN(parsedHeight) || parsedHeight <= 0) {
      setErrorMsg('אנא הזן מספר חיובי תקין עבור גובה');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateBasicProfile({
        fullName: fullName.trim(),
        age: parsedAge,
        heightCm: parsedHeight,
        areaOfResidence: areaOfResidence.trim(),
        religiousLevel: religiousLevel.trim(),
        phone: phone.trim(),
      });
      await refreshMe();
      setSuccessInfo(response);
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err, 'שמירת הפרופיל הבסיסי נכשלה.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>טוען נתונים...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>פרופיל בסיסי</Text>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {successInfo ? (
          <View style={styles.successCard}>
            <Text style={styles.successText}>הפרופיל הבסיסי נשמר בהצלחה!</Text>
            <Text style={styles.successDetails}>
              סטטוס פרופיל: <Text style={styles.boldText}>{getProfileStatusLabel(successInfo.profileStatus)}</Text>
            </Text>
            {successInfo.missingFields && successInfo.missingFields.length > 0 ? (
              <View style={styles.missingContainer}>
                <Text style={styles.successDetails}>שדות חסרים לקבלת סטטוס פרופיל מלא:</Text>
                {successInfo.missingFields.map((field) => (
                  <Text key={field} style={styles.missingFieldItem}>
                    • {translateFieldName(field)}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.successDetails}>אין שדות חסרים לקבלת סטטוס פרופיל מלא!</Text>
            )}
            {returnToWedding && returnWeddingId ? (
              <AppButton
                title="חזרה לפרטי החתונה"
                onPress={() => navigation.navigate('JoinWedding', {
                  weddingId: returnWeddingId,
                  weddingSnapshot: returnWeddingSnapshot,
                  source: 'returnFlow'
                })}
                style={styles.successButton}
              />
            ) : null}
            <AppButton
              title="מעבר לפרופיל שלי"
              onPress={() => navigation.navigate('Profile')}
              style={styles.successButton}
            />
            <AppButton
              title="חזרה לדף הבית"
              onPress={() => navigation.navigate('Me')}
              style={[styles.successButton, styles.successButtonSecondary]}
            />
          </View>
        ) : (
          <View style={styles.formCard}>
            <AppInput
              label="שם מלא"
              placeholder="לדוגמה: ישראל ישראלי"
              value={fullName}
              onChangeText={setFullName}
            />

            <AppInput
              label="גיל"
              placeholder="לדוגמה: 25"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />

            <AppInput
              label="גובה (ס״מ)"
              placeholder="לדוגמה: 175"
              keyboardType="number-pad"
              value={heightCm}
              onChangeText={setHeightCm}
            />

            <AppInput
              label="אזור מגורים"
              placeholder="לדוגמה: ירושלים"
              value={areaOfResidence}
              onChangeText={setAreaOfResidence}
            />

            <AppInput
              label="רמה דתית"
              placeholder="לדוגמה: דתי לאומי"
              value={religiousLevel}
              onChangeText={setReligiousLevel}
            />

            <AppInput
              label="מספר טלפון"
              placeholder="לדוגמה: 0501234567"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <AppButton
              title="שמירת פרופיל בסיסי"
              onPress={handleSave}
              loading={isSubmitting}
              style={styles.saveButton}
            />
          </View>
        )}
      </ScrollView>
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
  loadingText: {
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: theme.spacing.xl,
  },
  saveButton: {
    marginTop: theme.spacing.m,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginBottom: theme.spacing.m,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  successDetails: {
    color: theme.colors.text,
    fontSize: 15,
    marginVertical: 4,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  missingContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.m,
    width: '100%',
  },
  missingFieldItem: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginVertical: 2,
  },
  successButton: {
    marginTop: theme.spacing.m,
    width: '100%',
  },
  successButtonSecondary: {
    backgroundColor: '#4A4A4A',
  },
});
