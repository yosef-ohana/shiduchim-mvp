import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { getMyProfile, updateUnifiedProfile } from '../../api/profileApi';
import { ProfileMeResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getGenderLabel, getUserRoleLabel } from '../../utils/displayLabels';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { ProfilePhotosManager } from '../../components/ProfilePhotosManager';
import { useAuth } from '../../context/AuthContext';
import { BasicProfileForm } from '../../components/profile/BasicProfileForm';
import { FullProfileForm } from '../../components/profile/FullProfileForm';

const getProfileStatusLabel = (status: string) => {
  switch (status) {
    case 'NONE': return 'לא הוגדר';
    case 'BASIC': return 'פרופיל בסיסי';
    case 'FULL': return 'פרופיל מלא';
    case 'FULL_INCOMPLETE_BLOCKED': return 'פרופיל מלא חסר (חסום)';
    default: return status;
  }
};

export const ProfileScreen = ({ navigation, route }: any) => {
  const { refreshMe } = useAuth();

  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Photos expansion state
  const [photosExpanded, setPhotosExpanded] = useState(false);

  // Unified editing state
  const [isEditing, setIsEditing] = useState(false);
  const [targetLevel, setTargetLevel] = useState<'BASIC' | 'FULL'>('BASIC');

  // Form states and submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMsg, setFormErrorMsg] = useState('');
  const [formSuccessMsg, setFormSuccessMsg] = useState('');

  // Controlled Basic Profile fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [areaOfResidence, setAreaOfResidence] = useState('');
  const [religiousLevel, setReligiousLevel] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<string | null>(null);

  // Controlled Full Profile fields
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [headCovering, setHeadCovering] = useState('');
  const [hasDrivingLicense, setHasDrivingLicense] = useState(false);
  const [selfDescription, setSelfDescription] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');

  const fetchProfile = async () => {
    try {
      setError(null);
      const data = await getMyProfile();
      setProfile(data);

      // Initialize form fields
      setFullName(data.fullName || '');
      setAge(data.age ? String(data.age) : '');
      setHeightCm(data.heightCm ? String(data.heightCm) : '');
      setAreaOfResidence(data.areaOfResidence || '');
      setReligiousLevel(data.religiousLevel || '');
      setPhone(data.phone || '');
      setGender(data.gender || null);

      setEducation(data.education || '');
      setOccupation(data.occupation || '');
      setHeadCovering(data.headCovering || '');
      setHasDrivingLicense(data.hasDrivingLicense ?? false);
      setSelfDescription(data.selfDescription || '');
      setHobbies(data.hobbies || '');
      setLookingFor(data.lookingFor || '');
      setFamilyDescription(data.familyDescription || '');
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'טעינת הפרופיל נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      setFormErrorMsg('');
      setFormSuccessMsg('');

      const focusSection = route.params?.focusSection;
      const intent = route.params?.intent;

      if (focusSection === 'photos') {
        setPhotosExpanded(true);
      }

      if (intent) {
        if (intent === 'onboarding_basic') {
          setIsEditing(true);
          setTargetLevel('BASIC');
        } else if (intent === 'onboarding_full' || intent === 'complete_full' || intent === 'repair_full') {
          setIsEditing(true);
          setTargetLevel('FULL');
        } else if (intent === 'view') {
          setIsEditing(false);
        }
        // clear consumed parameters so they do not retrigger on every focus
        navigation.setParams({ focusSection: undefined, intent: undefined });
      }
    }, [route.params])
  );

  const handleSaveUnified = async () => {
    setFormErrorMsg('');
    setFormSuccessMsg('');

    // Local Basic Validation
    if (!fullName.trim() || !age.trim() || !heightCm.trim() || !areaOfResidence.trim() || !religiousLevel.trim() || !phone.trim()) {
      setFormErrorMsg('כל שדות הפרופיל הבסיסי הם שדות חובה');
      return;
    }

    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseInt(heightCm, 10);

    if (isNaN(parsedAge) || parsedAge <= 0) {
      setFormErrorMsg('אנא הזן מספר חיובי תקין עבור גיל');
      return;
    }

    if (isNaN(parsedHeight) || parsedHeight <= 0) {
      setFormErrorMsg('אנא הזן מספר חיובי תקין עבור גובה');
      return;
    }

    // Local Full Validation
    if (targetLevel === 'FULL') {
      if (
        !education.trim() ||
        !occupation.trim() ||
        !selfDescription.trim() ||
        !hobbies.trim() ||
        !lookingFor.trim()
      ) {
        setFormErrorMsg('השדות השכלה, עיסוק, תיאור עצמי, תחביבים ומה אני מחפש/ת הם שדות חובה');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        targetLevel,
        fullName: fullName.trim(),
        age: parsedAge,
        heightCm: parsedHeight,
        areaOfResidence: areaOfResidence.trim(),
        religiousLevel: religiousLevel.trim(),
        phone: phone.trim(),
      };

      if (targetLevel === 'FULL') {
        payload.education = education.trim();
        payload.occupation = occupation.trim();
        payload.selfDescription = selfDescription.trim();
        payload.hobbies = hobbies.trim();
        payload.lookingFor = lookingFor.trim();
        payload.familyDescription = familyDescription.trim() || null;
        payload.headCovering = headCovering.trim() || null;
        payload.hasDrivingLicense = hasDrivingLicense;
      }

      const updatedProfile = await updateUnifiedProfile(payload);

      // Apply updated Profile response directly to local state
      setProfile(updatedProfile);

      // Update auth context
      await refreshMe();

      setFormSuccessMsg('הפרופיל נשמר בהצלחה!');
      setIsEditing(false);
    } catch (err: any) {
      setFormErrorMsg(getFriendlyErrorMessage(err, 'שמירת הפרופיל נכשלה.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>טוען פרופיל...</Text>
      </Screen>
    );
  }

  if (error || !profile) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'טעינת הפרופיל נכשלה.'}</Text>
        <AppButton title="נסה שוב" onPress={fetchProfile} style={styles.retryButton} />
      </Screen>
    );
  }

  const renderRow = (label: string, value: any, isLongText = false) => {
    let displayValue = 'לא צוין';
    if (value !== null && value !== undefined && value !== '') {
      const stringVal = String(value);
      if (stringVal === 'MALE' || stringVal === 'FEMALE') {
        displayValue = getGenderLabel(stringVal);
      } else if (stringVal === 'USER' || stringVal === 'EVENT_MANAGER' || stringVal === 'ADMIN') {
        displayValue = getUserRoleLabel(stringVal);
      } else if (stringVal === 'NONE' || stringVal === 'BASIC' || stringVal === 'FULL' || stringVal === 'FULL_INCOMPLETE_BLOCKED') {
        displayValue = getProfileStatusLabel(stringVal);
      } else if (stringVal === 'Yes' || stringVal === 'true' || value === true) {
        displayValue = 'כן';
      } else if (stringVal === 'No' || stringVal === 'false' || value === false) {
        displayValue = 'לא';
      } else if (stringVal === 'Not specified') {
        displayValue = 'לא צוין';
      } else {
        displayValue = stringVal;
      }
    }

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

  const status = profile.profileStatus;

  const getMissingFields = () => {
    const missing = [];
    if (!profile.education || !profile.education.trim()) missing.push('השכלה');
    if (!profile.occupation || !profile.occupation.trim()) missing.push('עיסוק');
    if (!profile.selfDescription || !profile.selfDescription.trim()) missing.push('עליי / תיאור עצמי');
    if (!profile.hobbies || !profile.hobbies.trim()) missing.push('תחביבים');
    if (!profile.lookingFor || !profile.lookingFor.trim()) missing.push('מה אני מחפש/ת');
    if (!profile.hasPrimaryPhoto) missing.push('תמונה ראשית');
    return missing;
  };

  const missingFields = status === 'FULL_INCOMPLETE_BLOCKED' ? getMissingFields() : [];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>הפרופיל שלי</Text>

        {/* Global form alerts/errors */}
        {formErrorMsg ? (
          <View style={styles.formErrorCard}>
            <Text style={styles.formErrorText}>{formErrorMsg}</Text>
          </View>
        ) : null}

        {formSuccessMsg ? (
          <View style={styles.formSuccessCard}>
            <Text style={styles.formSuccessText}>{formSuccessMsg}</Text>
          </View>
        ) : null}

        {/* Compact Photos Card / Manager Section */}
        <View style={styles.section}>
          {photosExpanded ? (
            <View style={styles.photoManagerContainer}>
              <View style={styles.photoManagerHeader}>
                <Text style={styles.photoManagerTitle}>ניהול תמונות פרופיל</Text>
                <TouchableOpacity onPress={() => setPhotosExpanded(false)}>
                  <Text style={styles.photoCollapseAction}>סגירה ✗</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.photoNoteText}>
                שינויי תמונות נשמרים באופן מיידי.
              </Text>
              <ProfilePhotosManager onPhotosChanged={fetchProfile} />
            </View>
          ) : (
            <TouchableOpacity style={styles.photoCard} onPress={() => setPhotosExpanded(true)}>
              <View style={styles.photoCardRow}>
                <Text style={styles.photoCardTitle}>תמונות פרופיל</Text>
                <Text style={styles.photoCardAction}>נהל/י תמונות ✎</Text>
              </View>
              <View style={styles.photoCardRow}>
                <Text style={styles.photoCardMetadata}>
                  הועלו {profile.photoCount} מתוך 2 תמונות
                </Text>
                <Text style={[styles.photoCardStatus, !profile.hasPrimaryPhoto && styles.photoCardStatusMissing]}>
                  {profile.hasPrimaryPhoto ? '✓ תמונה ראשית הוגדרה' : '✗ חסרה תמונה ראשית'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Edit Mode vs View Mode */}
        {isEditing ? (
          <View style={styles.card}>
            {targetLevel === 'FULL' ? (
              <>
                <BasicProfileForm
                  isEmbedded={true}
                  fullName={fullName}
                  setFullName={setFullName}
                  gender={gender}
                  age={age}
                  setAge={setAge}
                  heightCm={heightCm}
                  setHeightCm={setHeightCm}
                  areaOfResidence={areaOfResidence}
                  setAreaOfResidence={setAreaOfResidence}
                  religiousLevel={religiousLevel}
                  setReligiousLevel={setReligiousLevel}
                  phone={phone}
                  setPhone={setPhone}
                />
                <View style={styles.sectionSeparator} />
                <FullProfileForm
                  isEmbedded={true}
                  education={education}
                  setEducation={setEducation}
                  occupation={occupation}
                  setOccupation={setOccupation}
                  headCovering={headCovering}
                  setHeadCovering={setHeadCovering}
                  hasDrivingLicense={hasDrivingLicense}
                  setHasDrivingLicense={setHasDrivingLicense}
                  selfDescription={selfDescription}
                  setSelfDescription={setSelfDescription}
                  hobbies={hobbies}
                  setHobbies={setHobbies}
                  lookingFor={lookingFor}
                  setLookingFor={setLookingFor}
                  familyDescription={familyDescription}
                  setFamilyDescription={setFamilyDescription}
                  profileStatus={status}
                />
              </>
            ) : (
              <BasicProfileForm
                isEmbedded={true}
                fullName={fullName}
                setFullName={setFullName}
                gender={gender}
                age={age}
                setAge={setAge}
                heightCm={heightCm}
                setHeightCm={setHeightCm}
                areaOfResidence={areaOfResidence}
                setAreaOfResidence={setAreaOfResidence}
                religiousLevel={religiousLevel}
                setReligiousLevel={setReligiousLevel}
                phone={phone}
                setPhone={setPhone}
              />
            )}

            <AppButton
              title="שמירת שינויים"
              onPress={handleSaveUnified}
              loading={isSubmitting}
              style={styles.button}
            />
            <AppButton
              title="ביטול"
              variant="secondary"
              onPress={() => {
                setIsEditing(false);
                setFormErrorMsg('');
                setFormSuccessMsg('');
                fetchProfile(); // Reset fields to DB values
              }}
              style={styles.cancelButton}
            />
          </View>
        ) : (
          /* View Mode */
          <View>
            {/* Account Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>פרטי החשבון</Text>
              <View style={styles.card}>
                {renderRow('שם מלא', profile.fullName)}
                {renderRow('אימייל', profile.email)}
                {renderRow('מגדר', profile.gender)}
                {renderRow('תפקיד', profile.role)}
                {renderRow('סטטוס פרופיל', profile.profileStatus)}
                {renderRow('חסום על ידי מנהל', profile.adminBlocked)}
              </View>
            </View>

            {/* Case NONE: show guidance card to complete Profile */}
            {status === 'NONE' && (
              <View style={styles.guidedCard}>
                <Text style={styles.guidedTitle}>השלמת הפרופיל שלך</Text>
                <Text style={styles.guidedText}>
                  כדי להשתמש במאגרים צריך להשלים פרופיל ותמונה ראשית. תמונה ראשית היא חלק מתנאי הזכאות למאגרים.
                </Text>
                <Text style={styles.guidedBullet}>
                  • <Text style={styles.boldText}>פרופיל בסיסי + תמונה ראשית</Text> מאפשרים שימוש במאגרי חתונה (מאגר מקומי).
                </Text>
                <Text style={styles.guidedBullet}>
                  • <Text style={styles.boldText}>פרופיל מלא</Text> כולל קודם את הפרופיל הבסיסי, ויחד עם תמונה ראשית מאפשר גם את המאגר הגלובלי.
                </Text>

                <AppButton
                  title="מסלול בסיסי (פרופיל בסיסי ותמונה)"
                  onPress={() => {
                    setIsEditing(true);
                    setTargetLevel('BASIC');
                    setFormErrorMsg('');
                    setFormSuccessMsg('');
                  }}
                  style={styles.guidedButton}
                />

                <AppButton
                  title="מסלול מלא (פרופיל בסיסי, מלא ותמונה)"
                  onPress={() => {
                    setIsEditing(true);
                    setTargetLevel('FULL');
                    setFormErrorMsg('');
                    setFormSuccessMsg('');
                  }}
                  style={[styles.guidedButton, styles.guidedButtonPrimary]}
                />
              </View>
            )}

            {/* Case FULL_INCOMPLETE_BLOCKED: show warning card listing missing fields */}
            {status === 'FULL_INCOMPLETE_BLOCKED' && (
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>פרופיל מלא חסר (חסום)</Text>
                <Text style={styles.warningText}>
                  הפרופיל המלא שלך אינו שלם. עליך להשלים את כל שדות החובה ולהעלות תמונה ראשית כדי להשתלב במאגרים.
                </Text>
                {missingFields.length > 0 && (
                  <View style={styles.missingList}>
                    <Text style={[styles.warningText, { fontWeight: 'bold', marginBottom: theme.spacing.s }]}>
                      הפרטים החסרים:
                    </Text>
                    {missingFields.map((field, idx) => (
                      <Text key={idx} style={styles.missingItem}>• {field}</Text>
                    ))}
                  </View>
                )}
                <AppButton
                  title="לתיקון והשלמת הפרופיל"
                  onPress={() => {
                    setIsEditing(true);
                    setTargetLevel('FULL');
                    setFormErrorMsg('');
                    setFormSuccessMsg('');
                  }}
                  style={styles.guidedButton}
                />
              </View>
            )}

            {/* Unified Profile Card (for BASIC, FULL, FULL_INCOMPLETE_BLOCKED) */}
            {status !== 'NONE' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>פרטי הפרופיל</Text>
                <View style={styles.card}>
                  {renderRow('גיל', profile.age)}
                  {renderRow('גובה (ס״מ)', profile.heightCm)}
                  {renderRow('אזור מגורים', profile.areaOfResidence)}
                  {renderRow('רמה דתית', profile.religiousLevel)}
                  {renderRow('טלפון', profile.phone)}

                  {(status === 'FULL' || status === 'FULL_INCOMPLETE_BLOCKED') && (
                    <>
                      <View style={styles.sectionSeparator} />
                      {renderRow('השכלה', profile.education)}
                      {renderRow('עיסוק', profile.occupation)}
                      {renderRow('כיסוי ראש', profile.headCovering)}
                      {renderRow('רישיון נהיגה', profile.hasDrivingLicense)}
                      {renderRow('עליי (תיאור עצמי)', profile.selfDescription, true)}
                      {renderRow('תחביבים', profile.hobbies, true)}
                      {renderRow('מה אני מחפש/ת', profile.lookingFor, true)}
                      {renderRow('רקע משפחתי (אופציונלי)', profile.familyDescription, true)}
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Upgrade Card for BASIC users */}
            {status === 'BASIC' && (
              <View style={styles.upgradeCard}>
                <Text style={styles.upgradeTitle}>השלמה לפרופיל מלא</Text>
                <Text style={styles.upgradeText}>
                  פרופיל מלא פותח עבורך את האפשרות להיכנס למאגר השידוכים הגלובלי (בכפוף להעלאת תמונה ראשית תקינה).
                </Text>
                <AppButton
                  title="המשך למילוי פרופיל מלא"
                  onPress={() => {
                    setIsEditing(true);
                    setTargetLevel('FULL');
                    setFormErrorMsg('');
                    setFormSuccessMsg('');
                  }}
                  style={styles.upgradeButton}
                />
              </View>
            )}

            {/* Action Buttons in View Mode */}
            {status === 'BASIC' && (
              <AppButton
                title="עריכת פרופיל בסיסי"
                onPress={() => {
                  setIsEditing(true);
                  setTargetLevel('BASIC');
                  setFormErrorMsg('');
                  setFormSuccessMsg('');
                }}
                style={styles.button}
              />
            )}

            {(status === 'FULL' || status === 'FULL_INCOMPLETE_BLOCKED') && (
              <AppButton
                title="עריכת פרופיל"
                onPress={() => {
                  setIsEditing(true);
                  setTargetLevel('FULL');
                  setFormErrorMsg('');
                  setFormSuccessMsg('');
                }}
                style={styles.button}
              />
            )}

            {(status === 'BASIC' || status === 'FULL') && (
              <AppButton
                title="חיפוש מועמדים"
                onPress={() => navigation.navigate('PoolSelection')}
                style={styles.button}
              />
            )}

            {/* Safe Exit to MeScreen */}
            {(status === 'BASIC' || status === 'FULL' || status === 'FULL_INCOMPLETE_BLOCKED') && (
              <AppButton
                title="סיום ומעבר לאזור שלי"
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Me' }],
                  });
                }}
                style={[styles.button, styles.safeExitButton]}
              />
            )}
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
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  retryButton: {
    width: '60%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  button: {
    marginTop: theme.spacing.m,
  },
  cancelButton: {
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.xl,
  },
  guidedCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: theme.spacing.l,
  },
  guidedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  guidedText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    textAlign: 'right',
    marginBottom: theme.spacing.s,
  },
  guidedBullet: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    textAlign: 'right',
    marginBottom: theme.spacing.s,
    paddingRight: theme.spacing.s,
  },
  boldText: {
    fontWeight: 'bold',
  },
  guidedButton: {
    marginTop: theme.spacing.m,
  },
  guidedButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  warningCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: theme.spacing.l,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    textAlign: 'right',
  },
  missingList: {
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.m,
  },
  missingItem: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'right',
    marginRight: theme.spacing.s,
    lineHeight: 20,
  },
  upgradeCard: {
    backgroundColor: '#F1F8FE',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#90CAF9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: theme.spacing.l,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  upgradeText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    textAlign: 'right',
  },
  upgradeButton: {
    marginTop: theme.spacing.m,
    backgroundColor: '#1976D2',
  },
  formErrorCard: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginBottom: theme.spacing.m,
  },
  formErrorText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  formSuccessCard: {
    backgroundColor: '#E8F5E9',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: theme.spacing.m,
  },
  formSuccessText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  photoCard: {
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
    marginBottom: theme.spacing.m,
  },
  photoCardRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  photoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  photoCardAction: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  photoCardMetadata: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  photoCardStatus: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  photoCardStatusMissing: {
    color: theme.colors.error,
  },
  photoManagerContainer: {
    marginBottom: theme.spacing.m,
  },
  photoManagerHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
    paddingHorizontal: theme.spacing.s,
  },
  photoManagerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  photoCollapseAction: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '600',
  },
  photoNoteText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginBottom: theme.spacing.s,
    paddingHorizontal: theme.spacing.s,
    fontStyle: 'italic',
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.m,
  },
  safeExitButton: {
    backgroundColor: '#3E5C76',
    marginTop: theme.spacing.m,
  },
});
