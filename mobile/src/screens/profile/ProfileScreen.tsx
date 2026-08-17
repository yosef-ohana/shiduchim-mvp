/**
 * ProfileScreen — Screen Record PROF-01 (Flow 2)
 * Personal profile view and unified editing in the approved dark personal shell & warm ivory cards.
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserShellStackParamList } from '../../types/navigation';
import { getMyProfile, updateUnifiedProfile } from '../../api/profileApi';
import { getMyPhotos } from '../../api/photosApi';
import { ProfileMeResponse, UnifiedProfileUpdateRequest, ProfileStatus } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { getGenderLabel } from '../../utils/displayLabels';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { TextField } from '../../components/foundation/TextField';
import { Button } from '../../components/foundation/Button';
import { ResponsiveActionGroup } from '../../components/foundation/ResponsiveActionGroup';
import { AppIcon } from '../../components/foundation/AppIcon';
import { BidiText } from '../../components/foundation/BidiText';
import {
  colors,
  spacing,
  radii,
  visual,
  text,
  gold,
  status as statusTokens,
  field,
} from '../../theme/tokens';
import { typography } from '../../theme/typography';

type ProfileScreenNavigationProp = NativeStackNavigationProp<UserShellStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<UserShellStackParamList, 'Profile'>;

const getProfileStatusLabel = (profileStatus?: ProfileStatus | string) => {
  switch (profileStatus) {
    case 'NONE':
      return 'טרם הוגדר פרופיל';
    case 'BASIC':
      return 'פרופיל בסיסי';
    case 'FULL':
      return 'פרופיל מלא';
    case 'FULL_INCOMPLETE_BLOCKED':
      return 'פרופיל חסר (דרוש תיקון)';
    default:
      return profileStatus || 'לא צוין';
  }
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const { refreshMe } = useAuth();

  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryPhotoUrl, setPrimaryPhotoUrl] = useState<string | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [targetLevel, setTargetLevel] = useState<'BASIC' | 'FULL'>('BASIC');

  // Form submission and feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMsg, setFormErrorMsg] = useState('');
  const [formSuccessMsg, setFormSuccessMsg] = useState('');
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Controlled BASIC fields
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [areaOfResidence, setAreaOfResidence] = useState('');
  const [religiousLevel, setReligiousLevel] = useState('');
  const [phone, setPhone] = useState('');

  // Controlled FULL fields
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [headCovering, setHeadCovering] = useState('');
  const [hasDrivingLicense, setHasDrivingLicense] = useState(false);
  const [selfDescription, setSelfDescription] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');

  const isDirtyRef = useRef(false);
  const bypassBackRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<{ basic: number; full: number; photos: number }>({
    basic: 0,
    full: 0,
    photos: 0,
  });

  const setBaselineFromProfile = useCallback((data: ProfileMeResponse) => {
    setFullName(data.fullName || '');
    setGender(data.gender || null);
    setAge(data.age ? String(data.age) : '');
    setHeightCm(data.heightCm ? String(data.heightCm) : '');
    setAreaOfResidence(data.areaOfResidence || '');
    setReligiousLevel(data.religiousLevel || '');
    setPhone(data.phone || '');

    setEducation(data.education || '');
    setOccupation(data.occupation || '');
    setHeadCovering(data.headCovering || '');
    setHasDrivingLicense(data.hasDrivingLicense ?? false);
    setSelfDescription(data.selfDescription || '');
    setHobbies(data.hobbies || '');
    setLookingFor(data.lookingFor || '');
    setFamilyDescription(data.familyDescription || '');
  }, []);

  const isDirty = useMemo(() => {
    if (!isEditing || !profile) return false;

    const basicDirty =
      fullName !== (profile.fullName || '') ||
      age !== (profile.age ? String(profile.age) : '') ||
      heightCm !== (profile.heightCm ? String(profile.heightCm) : '') ||
      areaOfResidence !== (profile.areaOfResidence || '') ||
      religiousLevel !== (profile.religiousLevel || '') ||
      phone !== (profile.phone || '');

    if (targetLevel === 'BASIC') {
      return basicDirty;
    }

    const fullDirty =
      education !== (profile.education || '') ||
      occupation !== (profile.occupation || '') ||
      headCovering !== (profile.headCovering || '') ||
      hasDrivingLicense !== (profile.hasDrivingLicense ?? false) ||
      selfDescription !== (profile.selfDescription || '') ||
      hobbies !== (profile.hobbies || '') ||
      lookingFor !== (profile.lookingFor || '') ||
      familyDescription !== (profile.familyDescription || '');

    return basicDirty || fullDirty;
  }, [
    isEditing,
    profile,
    targetLevel,
    fullName,
    age,
    heightCm,
    areaOfResidence,
    religiousLevel,
    phone,
    education,
    occupation,
    headCovering,
    hasDrivingLicense,
    selfDescription,
    hobbies,
    lookingFor,
    familyDescription,
  ]);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      const data = await getMyProfile();
      setProfile(data);
      setBaselineFromProfile(data);

      // Auxiliary portrait load
      let photoUrl: string | null = null;
      try {
        const photos = await getMyPhotos();
        const primary = photos.find((p) => p.isPrimary);
        if (primary) {
          photoUrl = primary.imageUrl;
        } else if (photos.length > 0) {
          photoUrl = photos[0].imageUrl;
        }
      } catch {
        // Non-critical auxiliary portrait load failure; fallback cleanly
      }
      setPrimaryPhotoUrl(photoUrl);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'טעינת הפרופיל נכשלה.'));
    } finally {
      setLoading(false);
    }
  }, [setBaselineFromProfile]);

  const scrollToSection = useCallback((section: 'profile' | 'full' | 'photos') => {
    const y =
      section === 'profile'
        ? sectionOffsets.current.basic
        : section === 'full'
        ? sectionOffsets.current.full
        : sectionOffsets.current.photos;

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
    }, 100);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Focus safety: do not overwrite dirty in-progress form
      if (!isDirtyRef.current) {
        fetchProfile();
      }

      setFormErrorMsg('');
      setFormSuccessMsg('');

      const intent = route.params?.intent;
      const focusSection = route.params?.focusSection;

      if (intent) {
        if (intent === 'onboarding_basic') {
          setIsEditing(true);
          setTargetLevel('BASIC');
        } else if (
          intent === 'onboarding_full' ||
          intent === 'complete_full' ||
          intent === 'repair_full'
        ) {
          setIsEditing(true);
          setTargetLevel('FULL');
        } else if (intent === 'view') {
          setIsEditing(false);
        }
      }

      if (focusSection) {
        scrollToSection(focusSection);
      }

      if (intent || focusSection) {
        const preservedWeddingParams: any = {};
        if (route.params?.returnToWedding !== undefined) {
          preservedWeddingParams.returnToWedding = route.params.returnToWedding;
        }
        if (route.params?.returnWeddingId !== undefined) {
          preservedWeddingParams.returnWeddingId = route.params.returnWeddingId;
        }
        if (route.params?.returnWeddingSnapshot !== undefined) {
          preservedWeddingParams.returnWeddingSnapshot = route.params.returnWeddingSnapshot;
        }
        if (route.params?.accessCode !== undefined) {
          preservedWeddingParams.accessCode = route.params.accessCode;
        }
        if (route.params?.originalSource !== undefined) {
          preservedWeddingParams.originalSource = route.params.originalSource;
        }
        if (route.params?.source !== undefined) {
          preservedWeddingParams.source = route.params.source;
        }

        navigation.setParams({
          ...preservedWeddingParams,
          focusSection: undefined,
          intent: undefined,
        });
      }
    }, [fetchProfile, navigation, route.params, scrollToSection])
  );

  // Dirty navigation interception for Stack Header Back
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
              if (profile) {
                setBaselineFromProfile(profile);
              }
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, profile, setBaselineFromProfile]);

  const navigateToPhotos = useCallback(() => {
    const weddingParams: any = {};
    if (route.params?.returnToWedding !== undefined) {
      weddingParams.returnToWedding = route.params.returnToWedding;
    }
    if (route.params?.returnWeddingId !== undefined) {
      weddingParams.returnWeddingId = route.params.returnWeddingId;
    }
    if (route.params?.returnWeddingSnapshot !== undefined) {
      weddingParams.returnWeddingSnapshot = route.params.returnWeddingSnapshot;
    }
    if (route.params?.accessCode !== undefined) {
      weddingParams.accessCode = route.params.accessCode;
    }
    if (route.params?.originalSource !== undefined) {
      weddingParams.originalSource = route.params.originalSource;
    }
    if (route.params?.source !== undefined) {
      weddingParams.source = route.params.source;
    }

    navigation.navigate('Photos', weddingParams);
  }, [navigation, route.params]);

  const handleManagePhotos = () => {
    if (isDirty) {
      Alert.alert(
        'מעבר לניהול תמונות',
        'ישנם שינויים שלא נשמרו בטופס הפרופיל. האם לצאת לניהול תמונות ולבטל את השינויים?',
        [
          { text: 'הישאר בטופס', style: 'cancel' },
          {
            text: 'עבור לניהול תמונות',
            style: 'destructive',
            onPress: () => {
              if (profile) {
                setBaselineFromProfile(profile);
              }
              setIsEditing(false);
              navigateToPhotos();
            },
          },
        ]
      );
    } else {
      navigateToPhotos();
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        'ביטול שינויים',
        'האם לבטל את השינויים שביצעת ולחזור לצפייה בפרופיל?',
        [
          { text: 'המשך עריכה', style: 'cancel' },
          {
            text: 'בטל שינויים',
            style: 'destructive',
            onPress: () => {
              if (profile) {
                setBaselineFromProfile(profile);
              }
              setIsEditing(false);
              setFormErrorMsg('');
              setFormSuccessMsg('');
              setFieldErrors({});
            },
          },
        ]
      );
    } else {
      setIsEditing(false);
      setFormErrorMsg('');
      setFormSuccessMsg('');
      setFieldErrors({});
    }
  };

  const handleStartEdit = () => {
    setFormErrorMsg('');
    setFormSuccessMsg('');
    setFieldErrors({});
    if (profile?.profileStatus === 'FULL' || profile?.profileStatus === 'FULL_INCOMPLETE_BLOCKED') {
      setTargetLevel('FULL');
    } else {
      setTargetLevel('BASIC');
    }
    setIsEditing(true);
  };

  const handleSaveUnified = async () => {
    setFormErrorMsg('');
    setFormSuccessMsg('');
    setSyncWarning(null);

    const errors: Record<string, string> = {};

    // BASIC validations
    if (!fullName.trim()) errors.fullName = 'שדה חובה';
    if (!age.trim()) errors.age = 'שדה חובה';
    if (!heightCm.trim()) errors.heightCm = 'שדה חובה';
    if (!areaOfResidence.trim()) errors.areaOfResidence = 'שדה חובה';
    if (!religiousLevel.trim()) errors.religiousLevel = 'שדה חובה';
    if (!phone.trim()) errors.phone = 'שדה חובה';

    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseInt(heightCm, 10);

    if (age.trim() && (isNaN(parsedAge) || parsedAge <= 0)) {
      errors.age = 'אנא הזן גיל חיובי תקין';
    }

    if (heightCm.trim() && (isNaN(parsedHeight) || parsedHeight <= 0)) {
      errors.heightCm = 'אנא הזן גובה חיובי תקין';
    }

    // FULL validations
    if (targetLevel === 'FULL') {
      if (!education.trim()) errors.education = 'שדה חובה';
      if (!occupation.trim()) errors.occupation = 'שדה חובה';
      if (!selfDescription.trim()) errors.selfDescription = 'שדה חובה';
      if (!hobbies.trim()) errors.hobbies = 'שדה חובה';
      if (!lookingFor.trim()) errors.lookingFor = 'שדה חובה';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormErrorMsg('יש למלא את כל שדות החובה כנדרש');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload: UnifiedProfileUpdateRequest = {
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

      // Step 1: PUT /profile/me
      const updatedProfile = await updateUnifiedProfile(payload);

      // Step 2 & 3: Authoritative state & baseline update
      setProfile(updatedProfile);
      setBaselineFromProfile(updatedProfile);

      // Step 4: Separate secondary try/catch for refreshMe()
      try {
        await refreshMe();
      } catch (refreshErr) {
        setSyncWarning('הפרופיל נשמר בהצלחה, אך עדכון המוכנות הראשי יתעדכן בחיבור הבא.');
      }

      // Step 5 & 6: Return to view & show success feedback
      setIsEditing(false);
      setFormSuccessMsg('הפרופיל נשמר בהצלחה');
    } catch (err: any) {
      setFormErrorMsg(getFriendlyErrorMessage(err, 'שמירת הפרופיל נכשלה.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer appearance="darkShell" testID="profile-loading-screen">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={gold.action.default} />
          <Text style={[typography.bodyMedium, styles.loadingText]}>טוען פרופיל...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error || !profile) {
    return (
      <ScreenContainer appearance="darkShell" testID="profile-error-screen">
        <View style={styles.centerContainer}>
          <Text style={[typography.bodyLarge, styles.errorText]}>
            {error || 'טעינת הפרופיל נכשלה.'}
          </Text>
          <Button
            label="נסה שוב"
            onPress={fetchProfile}
            variant="primary"
            visualAppearance="gold"
            style={styles.retryButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  // Server-authoritative readiness (Profile Status & Primary Photo only)
  const isBasicComplete =
    profile.profileStatus === 'BASIC' || profile.profileStatus === 'FULL';
  const isFullComplete = profile.profileStatus === 'FULL';
  const hasPrimaryPhoto = Boolean(profile.hasPrimaryPhoto);

  return (
    <ScreenContainer
      appearance="darkShell"
      keyboardAware
      safeEdges={['bottom', 'left', 'right']}
      testID="profile-screen-container"
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollViewFlex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Bounded Notifications / Alerts */}
        {formErrorMsg ? (
          <View style={styles.alertErrorCard}>
            <AppIcon name="alert-circle" size={18} color={statusTokens.error.onIvory} />
            <Text style={[typography.bodyMedium, styles.alertErrorText]}>{formErrorMsg}</Text>
          </View>
        ) : null}

        {formSuccessMsg ? (
          <View style={styles.alertSuccessCard}>
            <AppIcon name="check" size={18} color={statusTokens.success.onIvory} />
            <Text style={[typography.bodyMedium, styles.alertSuccessText]}>{formSuccessMsg}</Text>
          </View>
        ) : null}

        {syncWarning ? (
          <View style={styles.alertWarningCard}>
            <AppIcon name="info" size={18} color={statusTokens.warning.onIvory} />
            <Text style={[typography.bodyMedium, styles.alertWarningText]}>{syncWarning}</Text>
          </View>
        ) : null}

        {/* 1. Identity Card */}
        <Card appearance="ivory" style={styles.cardSpacing} testID="profile-identity-card">
          <View style={styles.identityRow}>
            <View style={styles.avatarContainer}>
              {primaryPhotoUrl ? (
                <Image
                  source={{ uri: primaryPhotoUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <AppIcon name="user" size={36} color={text.onIvory.secondary} />
                </View>
              )}
            </View>

            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={[typography.titleLarge, styles.userNameText]}>
                  {profile.fullName || 'משתמש'}
                </Text>
                <AppIcon name="user" size={20} color={text.onIvory.secondary} />
              </View>

              <View style={styles.identityInfoRow}>
                <AppIcon name="home" size={14} color={text.onIvory.secondary} />
                <Text style={[typography.bodyMedium, styles.identityLocationText]}>
                  {profile.areaOfResidence || 'לא צוין'}
                </Text>
              </View>

              <View style={styles.statusBadgeRow}>
                <AppIcon name="shield" size={14} color={gold.border.strong} />
                <Text style={[typography.caption, styles.statusBadgeText]}>
                  {getProfileStatusLabel(profile.profileStatus)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.ornamentContainer}>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentDiamond}>❖</Text>
            <View style={styles.ornamentLine} />
          </View>
        </Card>

        {/* 2. Readiness Summary Card ("המוכנות שלי") */}
        <Card appearance="ivory" style={styles.cardSpacing} testID="profile-readiness-card">
          <View style={styles.readinessHeaderRow}>
            <Text style={[typography.titleMedium, styles.cardTitleText]}>המוכנות שלי</Text>
            <AppIcon name="star" size={20} color={gold.border.strong} />
          </View>

          <View style={styles.readinessColumnsRow}>
            {/* Column 1: BASIC readiness */}
            <View style={styles.readinessColumn}>
              <AppIcon
                name="shield"
                size={22}
                color={isBasicComplete ? statusTokens.success.onIvory : text.onIvory.secondary}
              />
              <Text style={[typography.caption, styles.readinessColumnTitle]}>
                {isBasicComplete ? 'פרופיל בסיסי הושלם' : 'פרופיל בסיסי חסר'}
              </Text>
            </View>

            <View style={styles.readinessVerticalDivider} />

            {/* Column 2: FULL readiness */}
            <View style={styles.readinessColumn}>
              <AppIcon
                name="shield"
                size={22}
                color={isFullComplete ? statusTokens.success.onIvory : text.onIvory.secondary}
              />
              <Text style={[typography.caption, styles.readinessColumnTitle]}>
                {isFullComplete ? 'פרופיל מלא הושלם' : 'פרופיל מלא חסר'}
              </Text>
            </View>

            <View style={styles.readinessVerticalDivider} />

            {/* Column 3: Primary Photo readiness */}
            <View style={styles.readinessColumn}>
              <AppIcon
                name="eye"
                size={22}
                color={hasPrimaryPhoto ? statusTokens.success.onIvory : text.onIvory.secondary}
              />
              <Text style={[typography.caption, styles.readinessColumnTitle]}>
                {hasPrimaryPhoto ? 'תמונה ראשית קיימת' : 'חסרה תמונה ראשית'}
              </Text>
            </View>
          </View>
        </Card>

        {isEditing ? (
          /* EDIT MODE COMPOSITION */
          <>
            {/* 3. BASIC Form Fields */}
            <View
              onLayout={(e) => {
                sectionOffsets.current.basic = e.nativeEvent.layout.y;
              }}
            >
              <Card appearance="ivory" style={styles.cardSpacing} testID="profile-basic-edit-card">
                <View style={styles.cardHeaderWithBadge}>
                  <Text style={[typography.titleMedium, styles.cardTitleText]}>פרטים אישיים</Text>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>BASIC</Text>
                  </View>
                </View>

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
            </View>

            {/* 4. FULL Form Fields (when FULL edit is active) */}
            {targetLevel === 'FULL' && (
              <View
                onLayout={(e) => {
                  sectionOffsets.current.full = e.nativeEvent.layout.y;
                }}
              >
                <Card appearance="ivory" style={styles.cardSpacing} testID="profile-full-edit-card">
                  <View style={styles.cardHeaderWithBadge}>
                    <Text style={[typography.titleMedium, styles.cardTitleText]}>פרטים מורחבים</Text>
                    <View style={styles.badgePill}>
                      <Text style={styles.badgePillText}>FULL</Text>
                    </View>
                  </View>

                  <TextField
                    label="השכלה"
                    value={education}
                    onChangeText={setEducation}
                    appearance="ivory"
                    required
                    error={fieldErrors.education}
                    containerStyle={styles.fieldSpacing}
                  />

                  <TextField
                    label="עיסוק"
                    value={occupation}
                    onChangeText={setOccupation}
                    appearance="ivory"
                    required
                    error={fieldErrors.occupation}
                    containerStyle={styles.fieldSpacing}
                  />

                  <TextField
                    label="כיסוי ראש (אופציונלי)"
                    value={headCovering}
                    onChangeText={setHeadCovering}
                    appearance="ivory"
                    containerStyle={styles.fieldSpacing}
                  />

                  <View style={[styles.switchRow, styles.fieldSpacing]}>
                    <Text style={[typography.bodyMedium, styles.switchLabel]}>יש רישיון נהיגה</Text>
                    <Switch
                      value={hasDrivingLicense}
                      onValueChange={setHasDrivingLicense}
                      trackColor={{ false: colors.secondarySubtle, true: gold.action.default }}
                      thumbColor={visual.surface.light}
                    />
                  </View>

                  <TextField
                    label="עליי (תיאור עצמי)"
                    value={selfDescription}
                    onChangeText={setSelfDescription}
                    multiline
                    numberOfLines={3}
                    appearance="ivory"
                    required
                    error={fieldErrors.selfDescription}
                    containerStyle={styles.fieldSpacing}
                  />

                  <TextField
                    label="תחביבים"
                    value={hobbies}
                    onChangeText={setHobbies}
                    multiline
                    numberOfLines={2}
                    appearance="ivory"
                    required
                    error={fieldErrors.hobbies}
                    containerStyle={styles.fieldSpacing}
                  />

                  <TextField
                    label="מה אני מחפש/ת"
                    value={lookingFor}
                    onChangeText={setLookingFor}
                    multiline
                    numberOfLines={3}
                    appearance="ivory"
                    required
                    error={fieldErrors.lookingFor}
                    containerStyle={styles.fieldSpacing}
                  />

                  <TextField
                    label="רקע משפחתי (אופציונלי)"
                    value={familyDescription}
                    onChangeText={setFamilyDescription}
                    multiline
                    numberOfLines={2}
                    appearance="ivory"
                    containerStyle={styles.fieldSpacing}
                  />
                </Card>
              </View>
            )}

            {/* 5. Primary Photo Summary & Manage Photos Entry */}
            <View
              onLayout={(e) => {
                sectionOffsets.current.photos = e.nativeEvent.layout.y;
              }}
            >
              <Card appearance="ivory" style={styles.cardSpacing} testID="profile-photos-edit-card">
                <Text style={[typography.titleMedium, styles.cardTitleText]}>תמונה ראשית</Text>
                <View style={styles.photosEditRow}>
                  <Text style={[typography.bodyMedium, styles.photosSubtitleText]}>
                    {profile.photoCount} תמונות •{' '}
                    {profile.hasPrimaryPhoto ? 'תמונה ראשית קיימת' : 'חסרה תמונה ראשית'}
                  </Text>
                  <Button
                    label="ניהול תמונות"
                    variant="secondary"
                    onPress={handleManagePhotos}
                    style={styles.photosManageSmallBtn}
                  />
                </View>
              </Card>
            </View>

            {/* 6. Edit Actions (Save & Cancel) */}
            <View style={styles.actionsContainer}>
              <ResponsiveActionGroup alignment="stacked">
                <Button
                  label="שמירת שינויים"
                  variant="primary"
                  visualAppearance="gold"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  onPress={handleSaveUnified}
                  testID="profile-save-btn"
                />
                <Button
                  label="ביטול"
                  variant="secondary"
                  disabled={isSubmitting}
                  onPress={handleCancel}
                  testID="profile-cancel-btn"
                />
              </ResponsiveActionGroup>
            </View>
          </>
        ) : (
          /* VIEW MODE COMPOSITION */
          <>
            {/* 3. BASIC Information Card */}
            <View
              onLayout={(e) => {
                sectionOffsets.current.basic = e.nativeEvent.layout.y;
              }}
            >
              <Card appearance="ivory" style={styles.cardSpacing} testID="profile-basic-view-card">
                <Text style={[typography.titleMedium, styles.cardTitleText, styles.cardTitleMargin]}>
                  פרטים אישיים
                </Text>

                <View style={styles.infoTableRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>שם מלא</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableValue]}>
                    {profile.fullName || 'לא צוין'}
                  </Text>
                </View>

                <View style={styles.infoTableRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>מגדר</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableValue]}>
                    {profile.gender ? getGenderLabel(profile.gender) : 'לא צוין'}
                  </Text>
                </View>

                <View style={styles.infoTableRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>גיל</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableValue]}>
                    {profile.age ? String(profile.age) : 'לא צוין'}
                  </Text>
                </View>

                <View style={styles.infoTableRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>גובה</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableValue]}>
                    {profile.heightCm ? `ס״מ ${profile.heightCm}` : 'לא צוין'}
                  </Text>
                </View>

                <View style={styles.infoTableRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>אזור מגורים</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableValue]}>
                    {profile.areaOfResidence || 'לא צוין'}
                  </Text>
                </View>

                <View style={styles.infoTableRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>רמה דתית</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableValue]}>
                    {profile.religiousLevel || 'לא צוין'}
                  </Text>
                </View>

                <View style={[styles.infoTableRow, styles.infoTableRowLast]}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>מספר טלפון</Text>
                  <BidiText
                    value={profile.phone || 'לא צוין'}
                    kind="phone"
                    style={[typography.bodyMedium, styles.infoTableValue]}
                  />
                </View>
              </Card>
            </View>

            {/* 4. FULL Information Card */}
            <View
              onLayout={(e) => {
                sectionOffsets.current.full = e.nativeEvent.layout.y;
              }}
            >
              <Card appearance="ivory" style={styles.cardSpacing} testID="profile-full-view-card">
                <Text style={[typography.titleMedium, styles.cardTitleText, styles.cardTitleMargin]}>
                  פרטים מורחבים
                </Text>

                <View style={styles.infoTableRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>השכלה</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableValue]}>
                    {profile.education || 'לא צוין'}
                  </Text>
                </View>

                <View style={styles.infoTableRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>עיסוק</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableValue]}>
                    {profile.occupation || 'לא צוין'}
                  </Text>
                </View>

                <View style={styles.infoTableRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>כיסוי ראש</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableValue]}>
                    {profile.headCovering || '-'}
                  </Text>
                </View>

                <View style={styles.infoTableRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>רישיון נהיגה</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableValue]}>
                    {profile.hasDrivingLicense ? 'יש' : profile.hasDrivingLicense === false ? 'אין' : 'לא צוין'}
                  </Text>
                </View>

                <View style={styles.infoTableColumnRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>עליי</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableLongValue]}>
                    {profile.selfDescription || 'לא צוין'}
                  </Text>
                </View>

                <View style={styles.infoTableColumnRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>תחביבים</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableLongValue]}>
                    {profile.hobbies || 'לא צוין'}
                  </Text>
                </View>

                <View style={styles.infoTableColumnRow}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>מה אני מחפש/ת</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableLongValue]}>
                    {profile.lookingFor || 'לא צוין'}
                  </Text>
                </View>

                <View style={[styles.infoTableColumnRow, styles.infoTableRowLast]}>
                  <Text style={[typography.bodyMedium, styles.infoTableLabel]}>רקע משפחתי</Text>
                  <Text style={[typography.bodyMedium, styles.infoTableLongValue]}>
                    {profile.familyDescription || 'לא צוין'}
                  </Text>
                </View>
              </Card>
            </View>

            {/* 5. Photos Summary Card */}
            <View
              onLayout={(e) => {
                sectionOffsets.current.photos = e.nativeEvent.layout.y;
              }}
            >
              <Card appearance="ivory" style={styles.cardSpacing} testID="profile-photos-summary-card">
                <Text style={[typography.titleMedium, styles.cardTitleText]}>תמונות</Text>
                <Text style={[typography.bodyMedium, styles.photosSubtitleText]}>
                  {profile.photoCount} תמונות •{' '}
                  {profile.hasPrimaryPhoto ? 'תמונה ראשית קיימת' : 'חסרה תמונה ראשית'}
                </Text>
              </Card>
            </View>

            {/* 6. View Mode Actions */}
            <View style={styles.actionsContainer}>
              <ResponsiveActionGroup alignment="stacked">
                <Button
                  label="עריכת הפרופיל"
                  variant="primary"
                  visualAppearance="gold"
                  onPress={handleStartEdit}
                  testID="profile-edit-btn"
                />
                <Button
                  label="ניהול תמונות"
                  variant="secondary"
                  onPress={handleManagePhotos}
                  testID="profile-photos-btn"
                />
              </ResponsiveActionGroup>
            </View>
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: text.onDark.secondary,
    textAlign: 'center',
  },
  errorText: {
    color: statusTokens.error.onIvory,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 160,
  },
  cardSpacing: {
    marginBottom: spacing.lg,
  },
  fieldSpacing: {
    marginBottom: spacing.md,
  },

  // Alert Cards
  alertErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: visual.surface.ivoryMuted,
    borderWidth: 1,
    borderColor: statusTokens.error.onIvory,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  alertErrorText: {
    flex: 1,
    color: statusTokens.error.onIvory,
    textAlign: 'right',
  },
  alertSuccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: visual.surface.ivoryHighlight,
    borderWidth: 1,
    borderColor: statusTokens.success.onIvory,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  alertSuccessText: {
    flex: 1,
    color: statusTokens.success.onIvory,
    textAlign: 'right',
  },
  alertWarningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: visual.surface.ivoryHighlight,
    borderWidth: 1,
    borderColor: statusTokens.warning.onIvory,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  alertWarningText: {
    flex: 1,
    color: statusTokens.warning.onIvory,
    textAlign: 'right',
  },

  // Identity Card
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: gold.border.strong,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: visual.surface.ivoryMuted,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  userNameText: {
    color: text.onIvory.primary,
    fontWeight: '700',
  },
  identityInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  identityLocationText: {
    color: text.onIvory.secondary,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusBadgeText: {
    color: gold.border.restrained,
    fontWeight: '600',
  },
  ornamentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: gold.border.restrained,
    opacity: 0.4,
  },
  ornamentDiamond: {
    color: gold.border.strong,
    fontSize: 12,
  },

  // Readiness Card
  readinessHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitleText: {
    color: text.onIvory.primary,
    fontWeight: '700',
    textAlign: 'right',
  },
  cardTitleMargin: {
    marginBottom: spacing.sm,
  },
  readinessColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs,
  },
  readinessColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  readinessColumnTitle: {
    color: text.onIvory.primary,
    textAlign: 'center',
    fontSize: 12,
  },
  readinessVerticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: visual.surface.ivoryMuted,
  },

  // Information Table (View Mode)
  infoTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: visual.surface.ivoryMuted,
  },
  infoTableRowLast: {
    borderBottomWidth: 0,
  },
  infoTableLabel: {
    color: text.onIvory.secondary,
    textAlign: 'right',
  },
  infoTableValue: {
    color: text.onIvory.primary,
    textAlign: 'left',
    fontWeight: '500',
  },
  infoTableColumnRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: visual.surface.ivoryMuted,
    gap: spacing.xs,
  },
  infoTableLongValue: {
    color: text.onIvory.primary,
    textAlign: 'right',
    lineHeight: 22,
  },

  // Card Header with Badge (Edit Mode)
  cardHeaderWithBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgePill: {
    backgroundColor: visual.surface.ivoryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
  },
  badgePillText: {
    ...typography.caption,
    color: text.onIvory.secondary,
    fontWeight: '700',
  },

  // Switch Row (Edit Mode)
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  switchLabel: {
    color: text.onIvory.primary,
  },

  // Photos Card
  photosSubtitleText: {
    color: text.onIvory.secondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  photosEditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  photosManageSmallBtn: {
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },

  // Bottom Actions
  actionsContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
