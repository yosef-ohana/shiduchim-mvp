import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, updateBasicProfile } from '../../api/profileApi';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getGenderLabel } from '../../utils/displayLabels';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { TextField } from '../../components/foundation/TextField';
import { Button } from '../../components/foundation/Button';
import { ResponsiveActionGroup } from '../../components/foundation/ResponsiveActionGroup';
import { AppIcon } from '../../components/foundation/AppIcon';
import {
  visual,
  spacing,
  radii,
  gold,
  status as statusTokens,
  text,
} from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { BasicProfileResponse } from '../../types/api';

const getProfileStatusLabel = (status: string) => {
  switch (status) {
    case 'NONE':
      return 'לא הוגדר';
    case 'BASIC':
      return 'פרופיל בסיסי';
    case 'FULL':
      return 'פרופיל מלא';
    case 'FULL_INCOMPLETE_BLOCKED':
      return 'פרופיל מלא חסר (חסום)';
    default:
      return status;
  }
};

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

export const BasicProfileScreen = ({ navigation, route }: any) => {
  const { refreshMe } = useAuth();

  const returnToWedding = route.params?.returnToWedding;
  const returnWeddingId = route.params?.returnWeddingId;
  const returnWeddingSnapshot = route.params?.returnWeddingSnapshot;
  const accessCode = route.params?.accessCode;
  const originalSource = route.params?.originalSource;
  const source = route.params?.source;
  const continueToFullAfterBasic = route.params?.continueToFullAfterBasic;
  const continueToPhotosAfterFull = route.params?.continueToPhotosAfterFull;

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [areaOfResidence, setAreaOfResidence] = useState('');
  const [religiousLevel, setReligiousLevel] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | string | null>(null);

  const baselineRef = useRef({
    fullName: '',
    age: '',
    heightCm: '',
    areaOfResidence: '',
    religiousLevel: '',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successInfo, setSuccessInfo] = useState<BasicProfileResponse | null>(null);

  const bypassBackRef = useRef(false);

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await getMyProfile();
      const loadedFullName = data.fullName || '';
      const loadedAge = data.age ? String(data.age) : '';
      const loadedHeightCm = data.heightCm ? String(data.heightCm) : '';
      const loadedAreaOfResidence = data.areaOfResidence || '';
      const loadedReligiousLevel = data.religiousLevel || '';
      const loadedPhone = data.phone || '';

      setFullName(loadedFullName);
      setAge(loadedAge);
      setHeightCm(loadedHeightCm);
      setAreaOfResidence(loadedAreaOfResidence);
      setReligiousLevel(loadedReligiousLevel);
      setPhone(loadedPhone);
      setGender(data.gender || null);

      baselineRef.current = {
        fullName: loadedFullName,
        age: loadedAge,
        heightCm: loadedHeightCm,
        areaOfResidence: loadedAreaOfResidence,
        religiousLevel: loadedReligiousLevel,
        phone: loadedPhone,
      };
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err, 'טעינת נתוני הפרופיל נכשלה.'));
    } finally {
      setIsLoading(false);
    }
  };

  const isDirty = useMemo(() => {
    if (successInfo) return false;
    return (
      fullName !== baselineRef.current.fullName ||
      age !== baselineRef.current.age ||
      heightCm !== baselineRef.current.heightCm ||
      areaOfResidence !== baselineRef.current.areaOfResidence ||
      religiousLevel !== baselineRef.current.religiousLevel ||
      phone !== baselineRef.current.phone
    );
  }, [fullName, age, heightCm, areaOfResidence, religiousLevel, phone, successInfo]);

  const isDirtyRef = useRef(false);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (bypassBackRef.current || !isDirtyRef.current) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'ביטול שינויים',
        'ישנם שינויים שלא נשמרו. האם לצאת ללא שמירה?',
        [
          { text: 'המשך עריכה', style: 'cancel' },
          {
            text: 'צא ללא שמירה',
            style: 'destructive',
            onPress: () => {
              bypassBackRef.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation]);

  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        'ביטול שינויים',
        'האם לבטל את השינויים שביצעת ולצאת?',
        [
          { text: 'המשך עריכה', style: 'cancel' },
          {
            text: 'בטל שינויים',
            style: 'destructive',
            onPress: () => {
              bypassBackRef.current = true;
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessInfo(null);
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = 'שדה חובה';
    if (!age.trim()) errors.age = 'שדה חובה';
    if (!heightCm.trim()) errors.heightCm = 'שדה חובה';
    if (!areaOfResidence.trim()) errors.areaOfResidence = 'שדה חובה';
    if (!religiousLevel.trim()) errors.religiousLevel = 'שדה חובה';
    if (!phone.trim()) errors.phone = 'שדה חובה';

    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseInt(heightCm, 10);

    if (age.trim() && (isNaN(parsedAge) || parsedAge <= 0)) {
      errors.age = 'אנא הזן מספר חיובי תקין עבור גיל';
    }

    if (heightCm.trim() && (isNaN(parsedHeight) || parsedHeight <= 0)) {
      errors.heightCm = 'אנא הזן מספר חיובי תקין עבור גובה';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('יש למלא את כל שדות החובה כנדרש');
      return;
    }

    setFieldErrors({});
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
      <ScreenContainer appearance="darkShell" testID="basic-profile-loading-screen">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={gold.action.default} />
          <Text style={[typography.bodyMedium, styles.loadingText]}>טוען נתונים...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const hasWeddingReturn = Boolean(returnToWedding && returnWeddingId);

  return (
    <ScreenContainer
      appearance="darkShell"
      keyboardAware
      safeEdges={['bottom', 'left', 'right']}
      testID="basic-profile-screen-container"
    >
      <ScrollView
        style={styles.scrollViewFlex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {errorMsg ? (
          <View style={styles.alertErrorCard}>
            <AppIcon name="alert-circle" size={18} color={statusTokens.error.onIvory} />
            <Text style={[typography.bodyMedium, styles.alertErrorText]}>{errorMsg}</Text>
          </View>
        ) : null}

        {successInfo ? (
          <Card appearance="ivory" style={styles.cardSpacing} testID="basic-profile-success-card">
            <View style={styles.successHeaderRow}>
              <AppIcon name="check" size={24} color={statusTokens.success.onIvory} />
              <Text style={[typography.titleMedium, styles.successTitleText]}>
                הפרופיל הבסיסי נשמר בהצלחה!
              </Text>
            </View>

            <View style={styles.successDetailsBlock}>
              <Text style={[typography.bodyMedium, styles.successDetailsText]}>
                סטטוס פרופיל:{' '}
                <Text style={styles.boldText}>{getProfileStatusLabel(successInfo.profileStatus)}</Text>
              </Text>

              {successInfo.missingFields && successInfo.missingFields.length > 0 ? (
                <View style={styles.missingContainer}>
                  <Text style={[typography.bodyMedium, styles.successDetailsText]}>
                    שדות חסרים לקבלת סטטוס פרופיל מלא:
                  </Text>
                  {successInfo.missingFields.map((f) => (
                    <Text key={f} style={[typography.caption, styles.missingFieldItem]}>
                      • {translateFieldName(f)}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={[typography.bodyMedium, styles.successDetailsText]}>
                  אין שדות חסרים לקבלת סטטוס פרופיל מלא!
                </Text>
              )}
            </View>

            {continueToFullAfterBasic ? (
              <>
                <Text style={[typography.bodyMedium, styles.continuationExplanationText]}>
                  הפרופיל הבסיסי נשמר! באפשרותך להמשיך כעת לפרופיל המלא, או לסיים כאן ולהישאר עם פרופיל בסיסי.
                </Text>
                <View style={styles.successActionsContainer}>
                  <Button
                    label="המשך למילוי פרופיל מלא"
                    onPress={() =>
                      navigation.navigate('FullProfile', {
                        continueToPhotosAfterFull,
                        returnToWedding,
                        returnWeddingId,
                        returnWeddingSnapshot,
                        accessCode,
                        originalSource,
                        source,
                      })
                    }
                    variant="primary"
                    visualAppearance="gold"
                    style={styles.buttonSpacing}
                    testID="basic-profile-continue-full-btn"
                  />
                  <Button
                    label="סיום כעת והישארות עם פרופיל בסיסי"
                    onPress={() => navigation.navigate('Profile')}
                    variant="secondary"
                    style={styles.buttonSpacing}
                    testID="basic-profile-finish-me-btn"
                  />
                  {hasWeddingReturn ? (
                    <Button
                      label="חזרה לפרטי החתונה"
                      onPress={() =>
                        navigation.navigate('JoinWedding', {
                          weddingId: returnWeddingId,
                          weddingSnapshot: returnWeddingSnapshot,
                          accessCode,
                          originalSource,
                          source: 'returnFlow',
                        })
                      }
                      variant="secondary"
                      style={styles.buttonSpacing}
                      testID="basic-profile-return-wedding-btn"
                    />
                  ) : null}
                </View>
              </>
            ) : (
              <View style={styles.successActionsContainer}>
                {hasWeddingReturn ? (
                  <>
                    <Button
                      label="חזרה לפרטי החתונה"
                      onPress={() =>
                        navigation.navigate('JoinWedding', {
                          weddingId: returnWeddingId,
                          weddingSnapshot: returnWeddingSnapshot,
                          accessCode,
                          originalSource,
                          source: 'returnFlow',
                        })
                      }
                      variant="primary"
                      visualAppearance="gold"
                      style={styles.buttonSpacing}
                      testID="basic-profile-return-wedding-btn"
                    />
                    <Button
                      label="מעבר לפרופיל שלי"
                      onPress={() => navigation.navigate('Profile')}
                      variant="secondary"
                      style={styles.buttonSpacing}
                      testID="basic-profile-go-profile-btn"
                    />
                  </>
                ) : (
                  <Button
                    label="מעבר לפרופיל שלי"
                    onPress={() => navigation.navigate('Profile')}
                    variant="primary"
                    visualAppearance="gold"
                    style={styles.buttonSpacing}
                    testID="basic-profile-go-profile-btn"
                  />
                )}
                <Button
                  label="חזרה לדף הבית"
                  onPress={() =>
                    navigation.navigate('UserTabs', {
                      screen: 'MeRoot',
                      params: {
                        screen: 'Me',
                      },
                    })
                  }
                  variant="secondary"
                  style={styles.buttonSpacing}
                  testID="basic-profile-go-me-btn"
                />
              </View>
            )}
          </Card>
        ) : (
          <>
            <Card appearance="ivory" style={styles.cardSpacing} testID="basic-profile-repair-context-card">
              <View style={styles.repairContextTitleRow}>
                <AppIcon name="edit" size={20} color={gold.border.strong} />
                <Text style={[typography.titleMedium, styles.cardTitleText]}>
                  השלמת פרופיל בסיסי
                </Text>
              </View>
              <Text style={[typography.bodyMedium, styles.repairContextDesc]}>
                כדי להמשיך, יש למלא את פרטי החובה הבסיסיים ולשמור אותם.
              </Text>
              {returnWeddingSnapshot?.weddingName ? (
                <View style={styles.weddingInfoPill}>
                  <AppIcon name="heart" size={14} color={gold.border.strong} />
                  <Text style={[typography.caption, styles.weddingInfoText]}>
                    חזרה לחתונה: {returnWeddingSnapshot.weddingName}
                  </Text>
                </View>
              ) : null}
              {continueToFullAfterBasic ? (
                <Text style={[typography.caption, styles.repairContextSubText]}>
                  לאחר שמירת הפרטים, תוכל להמשיך למילוי הפרופיל המלא.
                </Text>
              ) : null}
            </Card>

            <Card appearance="ivory" style={styles.cardSpacing} testID="basic-profile-form-card">
              <TextField
                label="שם מלא"
                value={fullName}
                onChangeText={setFullName}
                appearance="ivory"
                required
                error={fieldErrors.fullName}
                containerStyle={styles.fieldSpacing}
              />

              <TextField
                label="מגדר"
                value={gender ? getGenderLabel(gender) : 'לא צוין'}
                onChangeText={() => {}}
                disabled
                appearance="ivory"
                helper="שדה לקריאה בלבד"
                containerStyle={styles.fieldSpacing}
              />

              <TextField
                label="גיל"
                value={age}
                onChangeText={setAge}
                inputModeType="phone"
                keyboardType="numeric"
                appearance="ivory"
                required
                error={fieldErrors.age}
                containerStyle={styles.fieldSpacing}
              />

              <TextField
                label="גובה (ס״מ)"
                value={heightCm}
                onChangeText={setHeightCm}
                inputModeType="phone"
                keyboardType="numeric"
                appearance="ivory"
                required
                error={fieldErrors.heightCm}
                containerStyle={styles.fieldSpacing}
              />

              <TextField
                label="אזור מגורים"
                value={areaOfResidence}
                onChangeText={setAreaOfResidence}
                appearance="ivory"
                required
                error={fieldErrors.areaOfResidence}
                containerStyle={styles.fieldSpacing}
              />

              <TextField
                label="רמה דתית"
                value={religiousLevel}
                onChangeText={setReligiousLevel}
                appearance="ivory"
                required
                error={fieldErrors.religiousLevel}
                containerStyle={styles.fieldSpacing}
              />

              <TextField
                label="מספר טלפון"
                value={phone}
                onChangeText={setPhone}
                inputModeType="phone"
                keyboardType="phone-pad"
                bidiType="phone"
                appearance="ivory"
                required
                error={fieldErrors.phone}
                containerStyle={styles.fieldSpacing}
              />
            </Card>

            <ResponsiveActionGroup style={styles.actionGroupSpacing}>
              <Button
                label="שמור פרופיל בסיסי"
                onPress={handleSave}
                variant="primary"
                visualAppearance="gold"
                loading={isSubmitting}
                disabled={isSubmitting}
                testID="basic-profile-save-btn"
              />
              <Button
                label="ביטול"
                onPress={handleCancel}
                variant="secondary"
                disabled={isSubmitting}
                testID="basic-profile-cancel-btn"
              />
            </ResponsiveActionGroup>
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
  fieldSpacing: {
    marginBottom: spacing.md,
  },
  actionGroupSpacing: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  alertErrorCard: {
    backgroundColor: visual.surface.ivoryMuted,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
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
  repairContextTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardTitleText: {
    color: text.onIvory.primary,
    fontWeight: '700',
  },
  repairContextDesc: {
    color: text.onIvory.secondary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  repairContextSubText: {
    color: text.onIvory.secondary,
    marginTop: spacing.xs,
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
  successHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  successTitleText: {
    color: statusTokens.success.onIvory,
    fontWeight: '700',
    flex: 1,
  },
  successDetailsBlock: {
    marginBottom: spacing.md,
  },
  successDetailsText: {
    color: text.onIvory.primary,
    marginVertical: spacing.xxs,
  },
  boldText: {
    fontWeight: '700',
  },
  missingContainer: {
    marginTop: spacing.sm,
  },
  missingFieldItem: {
    color: text.onIvory.secondary,
    marginVertical: spacing.xxs,
  },
  continuationExplanationText: {
    color: text.onIvory.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  successActionsContainer: {
    width: '100%',
  },
  buttonSpacing: {
    marginBottom: spacing.sm,
  },
});
