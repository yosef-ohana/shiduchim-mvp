import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { getMyProfile, updateBasicProfile, updateFullProfile } from '../../api/profileApi';
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
  const focusSection = route?.params?.focusSection;
  const { refreshMe } = useAuth();

  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditChoices, setShowEditChoices] = useState(false);

  // Editing state controls
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingFull, setIsEditingFull] = useState(false);
  const [chosenTrack, setChosenTrack] = useState<'BASIC' | 'FULL' | null>(null);

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
      setShowEditChoices(false);
      setIsEditingBasic(false);
      setIsEditingFull(false);
      setChosenTrack(null);
      setFormErrorMsg('');
      setFormSuccessMsg('');
    }, [])
  );

  const handleSaveBasic = async () => {
    setFormErrorMsg('');
    setFormSuccessMsg('');

    // Local validation
    if (!fullName.trim() || !age.trim() || !heightCm.trim() || !areaOfResidence.trim() || !religiousLevel.trim() || !phone.trim()) {
      setFormErrorMsg('כל השדות הם שדות חובה');
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

    setIsSubmitting(true);
    try {
      await updateBasicProfile({
        fullName: fullName.trim(),
        age: parsedAge,
        heightCm: parsedHeight,
        areaOfResidence: areaOfResidence.trim(),
        religiousLevel: religiousLevel.trim(),
        phone: phone.trim(),
      });

      await refreshMe();
      await fetchProfile();

      setFormSuccessMsg('הפרופיל הבסיסי נשמר בהצלחה!');
      setIsEditingBasic(false);

      if (chosenTrack === 'FULL') {
        setIsEditingFull(true);
      }
      setChosenTrack(null);
    } catch (err: any) {
      setFormErrorMsg(getFriendlyErrorMessage(err, 'שמירת הפרופיל הבסיסי נכשלה.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveFull = async () => {
    setFormErrorMsg('');
    setFormSuccessMsg('');

    // Local validation
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

    setIsSubmitting(true);
    try {
      await updateFullProfile({
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
      await fetchProfile();

      setFormSuccessMsg('הפרופיל המלא נשמר בהצלחה!');
      setIsEditingFull(false);
    } catch (err: any) {
      setFormErrorMsg(getFriendlyErrorMessage(err, 'שמירת הפרופיל המלא נכשלה.'));
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
        <Text style={styles.title}>הפרטים שלי</Text>

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

        {/* Dynamic content rendering based on mode */}
        {isEditingBasic ? (
          <View>
            <Text style={styles.formSectionTitle}>עריכת פרופיל בסיסי</Text>
            <BasicProfileForm
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
              onSave={handleSaveBasic}
              isSubmitting={isSubmitting}
            />
            <AppButton
              title="ביטול"
              variant="secondary"
              onPress={() => {
                setIsEditingBasic(false);
                setChosenTrack(null);
                setFormErrorMsg('');
                setFormSuccessMsg('');
              }}
              style={styles.cancelButton}
            />
          </View>
        ) : isEditingFull ? (
          <View>
            <Text style={styles.formSectionTitle}>עריכת פרופיל מלא</Text>
            <FullProfileForm
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
              onSave={handleSaveFull}
              isSubmitting={isSubmitting}
              profileStatus={status}
            />
            <AppButton
              title="ביטול"
              variant="secondary"
              onPress={() => {
                setIsEditingFull(false);
                setFormErrorMsg('');
                setFormSuccessMsg('');
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

            {/* Case NONE: show guidance card to complete Basic Profile */}
            {status === 'NONE' && (
              <View style={styles.guidedCard}>
                <Text style={styles.guidedTitle}>השלמת הפרופיל שלך</Text>
                <Text style={styles.guidedText}>
                  כדו להשתמש במאגרים צריך להשלים פרופיל ותמונה ראשית. תמונה ראשית היא חלק מתנאי הזכאות למאגרים.
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
                    setIsEditingBasic(true);
                    setChosenTrack('BASIC');
                    setFormErrorMsg('');
                    setFormSuccessMsg('');
                  }}
                  style={styles.guidedButton}
                />

                <AppButton
                  title="מסלול מלא (פרופיל בסיסי, מלא ותמונה)"
                  onPress={() => {
                    setIsEditingBasic(true);
                    setChosenTrack('FULL');
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
                    setIsEditingFull(true);
                    setFormErrorMsg('');
                    setFormSuccessMsg('');
                  }}
                  style={styles.guidedButton}
                />
              </View>
            )}

            {/* Basic Profile Section (shown to BASIC, FULL, FULL_INCOMPLETE_BLOCKED) */}
            {status !== 'NONE' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>פרטי פרופיל בסיסי</Text>
                <View style={styles.card}>
                  {renderRow('גיל', profile.age)}
                  {renderRow('גובה (ס״מ)', profile.heightCm)}
                  {renderRow('אזור מגורים', profile.areaOfResidence)}
                  {renderRow('רמה דתית', profile.religiousLevel)}
                  {renderRow('טלפון', profile.phone)}
                </View>
              </View>
            )}

            {/* Full Profile Section (shown to FULL, or FULL_INCOMPLETE_BLOCKED if they have details) */}
            {(status === 'FULL' || status === 'FULL_INCOMPLETE_BLOCKED') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>פרטי פרופיל מלא</Text>
                <View style={styles.card}>
                  {renderRow('השכלה', profile.education)}
                  {renderRow('עיסוק', profile.occupation)}
                  {renderRow('כיסוי ראש', profile.headCovering)}
                  {renderRow('רישיון נהיגה', profile.hasDrivingLicense)}
                  {renderRow('עליי (תיאור עצמי)', profile.selfDescription, true)}
                  {renderRow('תחביבים', profile.hobbies, true)}
                  {renderRow('מה אני מחפש/ת', profile.lookingFor, true)}
                  {renderRow('רקע משפחתי', profile.familyDescription, true)}
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
                    setIsEditingFull(true);
                    setFormErrorMsg('');
                    setFormSuccessMsg('');
                  }}
                  style={styles.upgradeButton}
                />
              </View>
            )}

            {/* Photos Info Section (shown to BASIC, FULL, FULL_INCOMPLETE_BLOCKED) */}
            {status !== 'NONE' && (
              <View style={styles.section}>
                {focusSection === 'photos' && (
                  <View style={styles.photosGuidanceCard}>
                    <Text style={styles.photosGuidanceTitle}>השלב הבא: העלאת תמונה ראשית</Text>
                    <Text style={styles.photosGuidanceText}>
                      תמונה ראשית נדרשת כדי להופיע במאגרי החתונה ובמאגר הגלובלי לפי זכאות הפרופיל.
                    </Text>
                  </View>
                )}
                <ProfilePhotosManager onPhotosChanged={fetchProfile} />
              </View>
            )}

            {/* Navigation CTAs / Action Buttons */}
            {status === 'BASIC' && (
              <>
                <AppButton
                  title="עריכת פרופיל בסיסי"
                  onPress={() => {
                    setIsEditingBasic(true);
                    setFormErrorMsg('');
                    setFormSuccessMsg('');
                  }}
                  style={styles.button}
                />
              </>
            )}

            {(status === 'FULL' || status === 'FULL_INCOMPLETE_BLOCKED') && (
              <>
                {!showEditChoices ? (
                  <AppButton
                    title="עריכת פרופיל"
                    onPress={() => setShowEditChoices(true)}
                    style={styles.button}
                  />
                ) : (
                  <View style={styles.editChoicesContainer}>
                    <AppButton
                      title="עריכת פרטים בסיסיים"
                      onPress={() => {
                        setShowEditChoices(false);
                        setIsEditingBasic(true);
                        setFormErrorMsg('');
                        setFormSuccessMsg('');
                      }}
                      style={styles.button}
                    />
                    <AppButton
                      title="עריכת פרטים מלאים"
                      onPress={() => {
                        setShowEditChoices(false);
                        setIsEditingFull(true);
                        setFormErrorMsg('');
                        setFormSuccessMsg('');
                      }}
                      style={[styles.button, styles.secondaryButton]}
                    />
                    <AppButton
                      title="ביטול"
                      onPress={() => setShowEditChoices(false)}
                      variant="secondary"
                      style={styles.button}
                    />
                  </View>
                )}
              </>
            )}

            {(status === 'BASIC' || status === 'FULL') && (
              <AppButton
                title="חיפוש מועמדים"
                onPress={() => navigation.navigate('PoolSelection')}
                style={styles.button}
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
  formSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
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
  secondaryButton: {
    backgroundColor: '#4A4A4A',
    marginBottom: theme.spacing.l,
  },
  primaryCtaButton: {
    backgroundColor: theme.colors.primary,
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
  photosGuidanceCard: {
    backgroundColor: '#E8F5E9',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: theme.spacing.m,
  },
  photosGuidanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
    textAlign: 'right',
  },
  photosGuidanceText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    textAlign: 'right',
  },
  editChoicesContainer: {
    width: '100%',
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
});
