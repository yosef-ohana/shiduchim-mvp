import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { getMyProfile, updateFullProfile } from '../../api/profileApi';
import { theme } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getYesNoLabel } from '../../utils/displayLabels';

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

export const FullProfileScreen = ({ navigation }: any) => {
  const { refreshMe } = useAuth();
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [headCovering, setHeadCovering] = useState('');
  const [hasDrivingLicense, setHasDrivingLicense] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    profileStatus: string;
    globalPoolEnabled: boolean;
    missingFields: string[];
  } | null>(null);

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await getMyProfile();
      setEducation(data.education || '');
      setOccupation(data.occupation || '');
      setSelfDescription(data.selfDescription || '');
      setHobbies(data.hobbies || '');
      setLookingFor(data.lookingFor || '');
      setFamilyDescription(data.familyDescription || '');
      setHeadCovering(data.headCovering || '');
      setHasDrivingLicense(data.hasDrivingLicense ?? false);
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
    if (
      !education.trim() ||
      !occupation.trim() ||
      !selfDescription.trim() ||
      !hobbies.trim() ||
      !lookingFor.trim()
    ) {
      setErrorMsg('השדות השכלה, עיסוק, תיאור עצמי, תחביבים ומה אני מחפש/ת הם שדות חובה');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateFullProfile({
        education: education.trim(),
        occupation: occupation.trim(),
        selfDescription: selfDescription.trim(),
        hobbies: hobbies.trim(),
        lookingFor: lookingFor.trim(),
        familyDescription: familyDescription.trim() || null,
        headCovering: headCovering.trim() || null,
        hasDrivingLicense: hasDrivingLicense,
      });
      await refreshMe();
      setSuccessInfo(response);
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err, 'שמירת הפרופיל המלא נכשלה.'));
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
        <Text style={styles.title}>פרופיל מלא</Text>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {successInfo ? (
          <View style={styles.successCard}>
            <Text style={styles.successText}>הפרופיל המלא נשמר בהצלחה!</Text>
            
            <Text style={styles.successDetails}>
              סטטוס פרופיל: <Text style={styles.boldText}>{getProfileStatusLabel(successInfo.profileStatus)}</Text>
            </Text>
            
            <Text style={styles.successDetails}>
              מאגר כללי פעיל: <Text style={styles.boldText}>{getYesNoLabel(successInfo.globalPoolEnabled)}</Text>
            </Text>

            {successInfo.missingFields && successInfo.missingFields.length > 0 ? (
              <View style={styles.missingContainer}>
                <Text style={styles.successDetails}>שדות חסרים שנותרו:</Text>
                {successInfo.missingFields.map((field) => (
                  <Text key={field} style={styles.missingFieldItem}>
                    • {translateFieldName(field)}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.successDetails}>כל השדות הושלמו!</Text>
            )}

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
              label="השכלה"
              placeholder="לדוגמה: ישיבה / מדרשה / תואר אקדמי"
              value={education}
              onChangeText={setEducation}
            />

            <AppInput
              label="עיסוק"
              placeholder="לדוגמה: מהנדס תוכנה"
              value={occupation}
              onChangeText={setOccupation}
            />

            <AppInput
              label="כיסוי ראש (אופציונלי)"
              placeholder="לדוגמה: כיפה / מטפחת / ללא"
              value={headCovering}
              onChangeText={setHeadCovering}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>יש רישיון נהיגה</Text>
              <Switch
                value={hasDrivingLicense}
                onValueChange={setHasDrivingLicense}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={hasDrivingLicense ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>

            <AppInput
              label="עליי (תיאור עצמי)"
              placeholder="ספר/י לנו קצת על עצמך..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
              value={selfDescription}
              onChangeText={setSelfDescription}
            />

            <AppInput
              label="תחביבים"
              placeholder="תחביבים ותחומי עניין..."
              multiline
              numberOfLines={3}
              style={styles.textArea}
              value={hobbies}
              onChangeText={setHobbies}
            />

            <AppInput
              label="מה אני מחפש/ת"
              placeholder="מה את/ה מחפש/ת בבן/בת הזוג?"
              multiline
              numberOfLines={4}
              style={styles.textArea}
              value={lookingFor}
              onChangeText={setLookingFor}
            />

            <AppInput
              label="רקע משפחתי (אופציונלי)"
              placeholder="מתאר/ת את הרקע המשפחתי שלך..."
              multiline
              numberOfLines={3}
              style={styles.textArea}
              value={familyDescription}
              onChangeText={setFamilyDescription}
            />

            <AppButton
              title="שמירת פרופיל מלא"
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
  switchRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  switchLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'right',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
