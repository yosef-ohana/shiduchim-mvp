import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { AppIcon } from '../../components/foundation/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radii, visual, text, gold, field, shadow } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

// Role Badge (A-08 bounded Staff identity)
const RoleBadge = ({ role }: { role: 'ADMIN' | 'EVENT_MANAGER' }) => {
  const isAdm = role === 'ADMIN';
  return (
    <View style={styles.roleBadgeContainer}>
      <View style={styles.roleBadgePill}>
        <AppIcon
          name={isAdm ? 'shield' : 'calendar'}
          size={14}
          color={gold.focus}
        />
        <Text style={styles.roleBadgeText}>
          {isAdm ? 'מנהל מערכת' : 'מנהל אירוע'}
        </Text>
      </View>
    </View>
  );
};

export const StaffLoginScreen = ({ route, navigation }: any) => {
  const { expectedRole } = route.params || {};
  const isLegalRole = expectedRole === 'ADMIN' || expectedRole === 'EVENT_MANAGER';

  const [screenState, setScreenState] = useState<'form' | 'blocked' | 'inactive'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { staffLogin } = useAuth();

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      if (!text) {
        setEmailError('אנא הזן כתובת אימייל');
      } else {
        setEmailError('');
      }
    }
    if (formError) setFormError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (formError) setFormError('');
  };

  const handleLogin = async () => {
    setFormError('');
    setEmailError('');

    let hasError = false;
    if (!email) {
      setEmailError('אנא הזן כתובת אימייל');
      hasError = true;
    }

    if (!password) {
      setFormError('אנא הזן סיסמה');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      await staffLogin({
        email,
        password,
        expectedRole,
      });
      // Context will automatically update state and trigger navigation to AdminStack / EventManagerStack
    } catch (e: any) {
      const rawMessage = e?.message || e?.response?.data?.message || '';
      const lower = String(rawMessage).toLowerCase();

      if (lower.includes('blocked')) {
        setScreenState('blocked');
      } else if (lower.includes('inactive') && expectedRole === 'EVENT_MANAGER') {
        setScreenState('inactive');
      } else if (
        lower.includes('role mismatch') ||
        lower.includes('not allowed to access') ||
        lower.includes('regular users cannot use staff login')
      ) {
        setFormError('החשבון אינו מורשה לכניסה זו או שאינו תואם לתפקיד שנבחר. אנא חזור ובחר את התפקיד המתאים.');
      } else {
        setFormError(getFriendlyErrorMessage(e, 'לא ניתן להיכנס לפורטל הניהול כרגע.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Guard: Invalid or missing expectedRole fails closed defensively
  if (!isLegalRole) {
    return (
      <View style={styles.darkCanvas}>
        <ScreenContainer
          scroll
          safeEdges={['bottom', 'left', 'right']}
          containerStyle={styles.containerStyle}
          contentStyle={styles.contentStyle}
        >
          <View style={styles.stateCardContainer} testID="staff-invalid-role-state">
            <View style={styles.stateIconCircleWarning}>
              <AppIcon name="alert-circle" size={32} color={colors.statusWarning} />
            </View>
            <Text style={styles.stateCardTitle}>סוג כניסה לא תקין</Text>
            <Text style={styles.stateCardMessage}>
              לא נבחר סוג כניסה תקין לצוות. אנא חזרו למסך בחירת תפקיד כדי להמשיך.
            </Text>
            <TouchableOpacity
              style={styles.primaryGoldButton}
              onPress={() => navigation.navigate('StaffLoginChoice')}
              accessibilityRole="button"
              accessibilityLabel="חזרה לבחירת תפקיד"
              testID="staff-invalid-role-back"
            >
              <Text style={styles.primaryGoldButtonText}>חזרה לבחירת תפקיד</Text>
            </TouchableOpacity>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  // S7-F01-S01 State 1 — Blocked staff account dedicated full-screen state
  if (screenState === 'blocked') {
    return (
      <View style={styles.darkCanvas}>
        <ScreenContainer
          scroll
          safeEdges={['bottom', 'left', 'right']}
          containerStyle={styles.containerStyle}
          contentStyle={styles.contentStyle}
        >
          <View style={styles.stateCardContainer} testID="staff-blocked-state">
            <View style={styles.stateIconCircleError}>
              <AppIcon name="lock" size={32} color={colors.statusError} />
            </View>
            <RoleBadge role={expectedRole} />
            <Text style={styles.stateCardTitle}>החשבון חסום</Text>
            <Text style={styles.stateCardMessage}>
              חשבון הצוות חסום על ידי מנהל המערכת. אנא פנה להנהלת המערכת לקבלת סיוע.
            </Text>
            <TouchableOpacity
              style={styles.primaryGoldButton}
              onPress={() => {
                setScreenState('form');
                navigation.navigate('StaffLoginChoice');
              }}
              accessibilityRole="button"
              accessibilityLabel="חזרה לבחירת תפקיד"
              testID="staff-blocked-back"
            >
              <Text style={styles.primaryGoldButtonText}>חזרה לבחירת תפקיד</Text>
            </TouchableOpacity>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  // S7-F01-S01 State 2 — Inactive EVENT_MANAGER dedicated full-screen state
  if (screenState === 'inactive') {
    return (
      <View style={styles.darkCanvas}>
        <ScreenContainer
          scroll
          safeEdges={['bottom', 'left', 'right']}
          containerStyle={styles.containerStyle}
          contentStyle={styles.contentStyle}
        >
          <View style={styles.stateCardContainer} testID="staff-inactive-state">
            <View style={styles.stateIconCircleWarning}>
              <AppIcon name="calendar" size={32} color={colors.statusWarning} />
            </View>
            <RoleBadge role={expectedRole} />
            <Text style={styles.stateCardTitle}>חשבון מנהל אירוע לא פעיל</Text>
            <Text style={styles.stateCardMessage}>
              חשבון מנהל האירוע אינו פעיל כרגע. אנא פנה למנהל המערכת להפעלת החשבון.
            </Text>
            <TouchableOpacity
              style={styles.primaryGoldButton}
              onPress={() => {
                setScreenState('form');
                navigation.navigate('StaffLoginChoice');
              }}
              accessibilityRole="button"
              accessibilityLabel="חזרה לבחירת תפקיד"
              testID="staff-inactive-back"
            >
              <Text style={styles.primaryGoldButtonText}>חזרה לבחירת תפקיד</Text>
            </TouchableOpacity>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  const roleDisplay = expectedRole === 'ADMIN' ? 'מנהל מערכת' : 'מנהל אירוע';
  const roleTitle = expectedRole === 'ADMIN' ? 'כניסת מנהל מערכת' : 'כניסת מנהל אירוע';

  return (
    <View style={styles.darkCanvas}>
      <ScreenContainer
        scroll
        keyboardAware
        safeEdges={['bottom', 'left', 'right']}
        containerStyle={styles.containerStyle}
        contentStyle={styles.contentStyle}
      >
        {/* Title Section with Role Badge */}
        <View style={styles.titleSection}>
          <RoleBadge role={expectedRole} />

          <View style={styles.titleRow}>
            <Text style={[typography.display, styles.pageTitleText]} accessibilityRole="header">
              {roleTitle}
            </Text>
          </View>

          <Text style={styles.subtitleText}>
            הזן את פרטי ההתחברות של הצוות כדי להמשיך
          </Text>
        </View>

        {/* Form Error Banner */}
        {formError ? (
          <View style={styles.formErrorBanner} testID="staff-login-error">
            <AppIcon name="alert-circle" size={18} color={colors.statusError} />
            <Text style={styles.formErrorText}>{formError}</Text>
          </View>
        ) : null}

        {/* Auth Inputs Form */}
        <View style={styles.formSection}>
          {/* Email Field */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>אימייל</Text>
            <View style={[styles.inputPillContainer, emailError ? styles.inputPillError : null]}>
              <View style={styles.leadingIconWrapper}>
                <AppIcon
                  name="mail"
                  size={20}
                  color={emailError ? field.border.error : colors.accent}
                />
              </View>
              <TextInput
                value={email}
                onChangeText={handleEmailChange}
                placeholder="הזן את אימייל הצוות"
                placeholderTextColor={field.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInputStyle}
                testID="staff-email-input"
                accessibilityLabel="אימייל"
              />
            </View>
            {emailError ? (
              <View style={styles.fieldErrorRow}>
                <AppIcon name="alert-circle" size={16} color={field.errorText} />
                <Text style={styles.fieldErrorText}>{emailError}</Text>
              </View>
            ) : null}
          </View>

          {/* Password Field */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>סיסמה</Text>
            <View style={styles.inputPillContainer}>
              <View style={styles.leadingIconWrapper}>
                <AppIcon name="lock" size={20} color={colors.accent} />
              </View>
              <TextInput
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={true}
                placeholder="הזן את הסיסמה"
                placeholderTextColor={field.placeholder}
                autoCapitalize="none"
                style={styles.textInputStyle}
                testID="staff-password-input"
                accessibilityLabel="סיסמה"
              />
            </View>
          </View>

          {/* Primary Gold Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.primaryGoldButton, isLoading && styles.buttonDisabled]}
            accessibilityRole="button"
            accessibilityLabel={`התחברות בתור ${roleDisplay}`}
            testID="staff-login-submit-button"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={text.onGold} />
            ) : (
              <Text style={styles.primaryGoldButtonText}>
                {`התחברות בתור ${roleDisplay}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  darkCanvas: {
    flex: 1,
    backgroundColor: visual.canvas.dark,
  },
  containerStyle: {
    backgroundColor: 'transparent',
  },
  contentStyle: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },

  // Role Badge (A-08 bounded Staff identity)
  roleBadgeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  roleBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: visual.surface.darkRaised,
    borderColor: gold.border.strong,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  roleBadgeText: {
    color: gold.focus,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pageTitleText: {
    color: text.onDark.primary,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: spacing.xs,
  },
  subtitleText: {
    color: text.onDark.secondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },

  // State Surfaces (Blocked / Inactive / Invalid Role)
  stateCardContainer: {
    backgroundColor: visual.surface.light,
    borderColor: colors.accentBorder,
    borderWidth: 1.5,
    borderRadius: radii.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xl,
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  stateIconCircleError: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.statusErrorBg,
    borderWidth: 1.5,
    borderColor: colors.statusErrorBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateIconCircleWarning: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.statusWarningBg,
    borderWidth: 1.5,
    borderColor: colors.statusWarningBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateCardTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: text.onIvory.primary,
    textAlign: 'center',
  },
  stateCardMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: text.onIvory.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },

  // Form Error
  formErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.statusErrorBg,
    borderColor: colors.statusErrorBorder,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  formErrorText: {
    flex: 1,
    color: colors.statusError,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },

  // Form Section
  formSection: {
    gap: spacing.lg,
  },
  fieldBlock: {
    width: '100%',
  },
  fieldLabel: {
    color: text.onDark.primary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  inputPillContainer: {
    minHeight: 52,
    backgroundColor: visual.surface.light,
    borderWidth: 1.5,
    borderColor: field.border.default,
    borderRadius: radii.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  inputPillError: {
    borderColor: field.border.error,
    backgroundColor: colors.statusErrorBg,
  },
  leadingIconWrapper: {
    paddingEnd: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputStyle: {
    flex: 1,
    minHeight: 48,
    color: text.onIvory.primary,
    fontSize: 16,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  fieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  fieldErrorText: {
    color: field.errorText,
    fontSize: 13,
    fontWeight: '600',
  },

  // Primary Button
  primaryGoldButton: {
    width: '100%',
    minHeight: 52,
    backgroundColor: gold.action.default,
    borderColor: gold.action.pressed,
    borderWidth: 1,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryGoldButtonText: {
    color: text.onGold,
    fontSize: 17,
    fontWeight: '700',
  },
});
