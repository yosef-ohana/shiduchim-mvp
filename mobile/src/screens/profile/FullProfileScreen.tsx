import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, updateFullProfile } from '../../api/profileApi';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { FullProfileForm } from '../../components/profile/FullProfileForm';
import {
  visual,
  spacing,
  radii,
  gold,
  status as statusTokens,
  text,
  borderWidths,
} from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { FullProfileResponse } from '../../types/api';

const translateFieldName = (field: string) => {
  switch (field) {
    case 'education':
      return 'השכלה';
    case 'occupation':
      return 'עיסוק';
    case 'selfDescription':
      return 'עליי / תיאור עצמי';
    case 'hobbies':
      return 'תחביבים';
    case 'lookingFor':
      return 'מה אני מחפש/ת';
    case 'primaryPhoto':
      return 'תמונה ראשית';
    default:
      return field;
  }
};

export const FullProfileScreen = ({ navigation, route }: any) => {
  const { refreshMe } = useAuth();
  const continueToPhotosAfterFull = route.params?.continueToPhotosAfterFull;
  const returnToWedding = route.params?.returnToWedding;
  const returnWeddingId = route.params?.returnWeddingId;
  const returnWeddingSnapshot = route.params?.returnWeddingSnapshot;
  const accessCode = route.params?.accessCode;
  const originalSource = route.params?.originalSource;
  const source = route.params?.source;

  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [headCovering, setHeadCovering] = useState('');
  const [hasDrivingLicense, setHasDrivingLicense] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [isConflict, setIsConflict] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [serverMissingFields, setServerMissingFields] = useState<string[]>([]);

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
      setProfileStatus(data.profileStatus);
      setIsConflict(false);
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err, 'טעינת נתוני הפרופיל נכשלה.'));
    } finally {
      setIsLoading(false);
    }
  };

  const proceedAfterSuccess = () => {
    if (continueToPhotosAfterFull) {
      navigation.navigate('Photos', {
        returnToWedding,
        returnWeddingId,
        returnWeddingSnapshot,
        accessCode,
        originalSource,
        source,
      });
      return;
    }

    if (returnToWedding && returnWeddingId) {
      navigation.navigate('JoinWedding', {
        weddingId: returnWeddingId,
        weddingSnapshot: returnWeddingSnapshot,
        accessCode,
        originalSource,
        source: 'returnFlow',
      });
      return;
    }

    navigation.navigate('Profile');
  };

  const handleRetrySync = async () => {
    setIsSyncing(true);
    setErrorMsg('');
    try {
      await refreshMe();
      setIsStale(false);
      if (serverMissingFields.length > 0) {
        return;
      }
      proceedAfterSuccess();
    } catch (syncErr: any) {
      setErrorMsg(getFriendlyErrorMessage(syncErr, 'סנכרון נתוני המוכנות נכשל. נסה שנית.'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    setErrorMsg('');
    setIsStale(false);
    setIsConflict(false);
    setServerMissingFields([]);

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
    let updateResponse: FullProfileResponse | null = null;

    try {
      updateResponse = await updateFullProfile({
        education: education.trim(),
        occupation: occupation.trim(),
        selfDescription: selfDescription.trim(),
        hobbies: hobbies.trim(),
        lookingFor: lookingFor.trim(),
        familyDescription: familyDescription.trim() || null,
        headCovering: headCovering.trim() || null,
        hasDrivingLicense: hasDrivingLicense,
      });
    } catch (err: any) {
      setIsSubmitting(false);
      if (err?.response?.status === 409) {
        setIsConflict(true);
        setErrorMsg('נמצא פער בנתונים. יש לרענן את הנתונים לפני המשך עריכה.');
      } else {
        setErrorMsg(getFriendlyErrorMessage(err, 'שמירת הפרופיל המלא נכשלה.'));
      }
      return;
    }

    const missing = updateResponse?.missingFields || [];

    try {
      await refreshMe();
    } catch (syncErr: any) {
      setIsSubmitting(false);
      setServerMissingFields(missing);
      setIsStale(true);
      return;
    }

    setIsSubmitting(false);
    if (missing.length > 0) {
      setServerMissingFields(missing);
      return;
    }

    proceedAfterSuccess();
  };

  if (isLoading) {
    return (
      <ScreenContainer appearance="darkShell" testID="full-profile-loading-screen">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={gold.action.default} />
          <Text style={[typography.bodyMedium, styles.loadingText]}>טוען נתונים...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      appearance="darkShell"
      keyboardAware
      safeEdges={['bottom', 'left', 'right']}
      testID="full-profile-screen-container"
    >
      <ScrollView
        style={styles.scrollViewFlex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {profileStatus === 'NONE' ? (
          <Card appearance="ivory" style={styles.cardSpacing} testID="full-profile-none-card">
            <View style={styles.noticeHeaderRow}>
              <AppIcon name="alert-circle" size={24} color={statusTokens.error.onIvory} />
              <Text style={[typography.titleMedium, styles.noticeTitleText]}>
                נדרש פרופיל בסיסי
              </Text>
            </View>
            <Text style={[typography.bodyMedium, styles.noticeDescText]}>
              לא ניתן למלא פרופיל מלא לפני השלמת פרופיל בסיסי במערכת.
            </Text>
            <Button
              label="חזרה לפרופיל שלי"
              onPress={() => navigation.navigate('Profile')}
              variant="primary"
              visualAppearance="gold"
              style={styles.buttonSpacing}
              testID="full-profile-return-profile-btn"
            />
          </Card>
        ) : (
          <>
            {errorMsg ? (
              <View style={styles.alertErrorCard}>
                <AppIcon name="alert-circle" size={18} color={statusTokens.error.onIvory} />
                <Text style={[typography.bodyMedium, styles.alertErrorText]}>{errorMsg}</Text>
              </View>
            ) : null}

            {isConflict ? (
              <Card appearance="ivory" style={styles.cardSpacing} testID="full-profile-conflict-card">
                <View style={styles.noticeHeaderRow}>
                  <AppIcon name="alert-circle" size={24} color={statusTokens.warning.onIvory} />
                  <Text style={[typography.titleMedium, styles.cardTitleText]}>
                    נמצא פער בנתוני הפרופיל
                  </Text>
                </View>
                <Text style={[typography.bodyMedium, styles.noticeDescText]}>
                  קיים פער בין הנתונים המוצגים לנתונים במערכת. יש לרענן את הנתונים לפני המשך עריכה.
                </Text>
                <Button
                  label="רענן נתונים"
                  onPress={loadCurrentProfile}
                  variant="primary"
                  visualAppearance="gold"
                  style={styles.buttonSpacing}
                  testID="full-profile-conflict-reload-btn"
                />
              </Card>
            ) : null}

            {isStale ? (
              <Card appearance="ivory" style={styles.cardSpacing} testID="full-profile-stale-card">
                <View style={styles.staleHeaderRow}>
                  <AppIcon name="alert-circle" size={24} color={gold.border.strong} />
                  <Text style={[typography.titleMedium, styles.cardTitleText]}>
                    לא הצלחנו לעדכן את מצב המוכנות
                  </Text>
                </View>
                <Text style={[typography.bodyMedium, styles.staleDescText]}>
                  הפרופיל המלא נשמר, אך לא ניתן היה לסנכרן את מצב המוכנות העדכני.
                </Text>
                <View style={styles.staleActionRow}>
                  <Button
                    label="רענון"
                    onPress={handleRetrySync}
                    variant="primary"
                    visualAppearance="gold"
                    loading={isSyncing}
                    disabled={isSyncing}
                    style={styles.buttonSpacing}
                    testID="full-profile-sync-retry-btn"
                  />
                </View>
              </Card>
            ) : null}

            {profileStatus === 'FULL_INCOMPLETE_BLOCKED' || (serverMissingFields && serverMissingFields.length > 0) ? (
              <Card appearance="ivory" style={styles.cardSpacing} testID="full-profile-incomplete-card">
                <View style={styles.noticeHeaderRow}>
                  <AppIcon name="alert-circle" size={24} color={gold.border.strong} />
                  <Text style={[typography.titleMedium, styles.cardTitleText]}>
                    נדרשת השלמת הפרופיל המלא
                  </Text>
                </View>
                <Text style={[typography.bodyMedium, styles.noticeDescText]}>
                  המשך התהליך חסום כרגע עד להשלמת הפרטים ואימותם מחדש.
                </Text>
                {serverMissingFields && serverMissingFields.length > 0 ? (
                  <View style={styles.missingContainer}>
                    <Text style={[typography.bodyMedium, styles.missingTitleText]}>
                      שדות חסרים שנמסרו מהשרת:
                    </Text>
                    {serverMissingFields.map((field) => (
                      <Text key={field} style={[typography.caption, styles.missingFieldItem]}>
                        • {translateFieldName(field)}
                      </Text>
                    ))}
                  </View>
                ) : null}
                {returnWeddingSnapshot?.weddingName ? (
                  <View style={styles.weddingInfoPill}>
                    <AppIcon name="heart" size={14} color={gold.border.strong} />
                    <Text style={[typography.caption, styles.weddingInfoText]}>
                      כוונת חזרה לחתונה נשמרה: {returnWeddingSnapshot.weddingName}
                    </Text>
                  </View>
                ) : null}
              </Card>
            ) : null}

            {returnWeddingSnapshot?.weddingName && profileStatus !== 'FULL_INCOMPLETE_BLOCKED' && (!serverMissingFields || serverMissingFields.length === 0) ? (
              <Card appearance="ivory" style={styles.cardSpacing} testID="full-profile-wedding-context-card">
                <View style={styles.repairContextTitleRow}>
                  <AppIcon name="edit" size={20} color={gold.border.strong} />
                  <Text style={[typography.titleMedium, styles.cardTitleText]}>
                    השלמת פרופיל מלא
                  </Text>
                </View>
                <View style={styles.weddingInfoPill}>
                  <AppIcon name="heart" size={14} color={gold.border.strong} />
                  <Text style={[typography.caption, styles.weddingInfoText]}>
                    חזרה לחתונה: {returnWeddingSnapshot.weddingName}
                  </Text>
                </View>
              </Card>
            ) : null}

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
              onSave={handleSave}
              isSubmitting={isSubmitting}
              disabled={isConflict || isStale}
              profileStatus={profileStatus}
            />
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollViewFlex: {
    flex: 1,
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    color: text.onDark.secondary,
    textAlign: 'center',
  },
  cardSpacing: {
    marginBottom: spacing.md,
  },
  buttonSpacing: {
    marginBottom: spacing.sm,
  },
  alertErrorCard: {
    backgroundColor: visual.surface.ivoryMuted,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: borderWidths.thin,
    borderColor: statusTokens.error.onIvory,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertErrorText: {
    color: statusTokens.error.onIvory,
    flex: 1,
    textAlign: 'right',
  },
  noticeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  noticeTitleText: {
    color: text.onIvory.primary,
    fontWeight: '700',
    flex: 1,
  },
  noticeDescText: {
    color: text.onIvory.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  cardTitleText: {
    color: text.onIvory.primary,
    fontWeight: '700',
    flex: 1,
  },
  staleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  staleDescText: {
    color: text.onIvory.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  staleActionRow: {
    width: '100%',
  },
  missingContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  missingTitleText: {
    color: text.onIvory.primary,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  missingFieldItem: {
    color: text.onIvory.secondary,
    marginVertical: spacing.xxs,
  },
  repairContextTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  weddingInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: visual.surface.ivoryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  weddingInfoText: {
    color: gold.border.strong,
    fontWeight: '600',
  },
});
