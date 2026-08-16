import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { AppHeader } from '../../components/foundation/AppHeader';
import { AppIcon } from '../../components/foundation/AppIcon';
import { BidiText } from '../../components/foundation/BidiText';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radii, visual, text, gold, status, field, shadow } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

// SVG Decorative Flourish Elements backed by Stage 6 Owner Screen 9
const KnotOrnament = ({ size = 20, color = gold.border.strong }: { size?: number; color?: string }) => (
  <Svg width={size * 1.6} height={size} viewBox="0 0 32 20" fill="none">
    <Path
      d="M16 10C13 6 8 4 5 7C2 10 2 15 6 17C10 19 14 15 16 10ZM16 10C19 6 24 4 27 7C30 10 30 15 26 17C22 19 18 15 16 10Z"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="16" cy="10" r="1.5" fill={color} />
  </Svg>
);

const TitleFlourishLeft = () => (
  <Svg width={60} height={36} viewBox="0 0 60 36" fill="none">
    <Path
      d="M58 18C44 18 36 28 24 28C14 28 8 20 14 12C18 6 26 8 24 14C22 20 12 22 4 16C1 13.5 2 7 8 4"
      stroke={gold.border.strong}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.85"
    />
    <Circle cx="8" cy="4" r="1.5" fill={gold.border.strong} />
    <Circle cx="38" cy="10" r="1" fill={gold.border.strong} opacity="0.6" />
    <Circle cx="50" cy="8" r="1.2" fill={gold.border.strong} opacity="0.7" />
  </Svg>
);

const TitleFlourishRight = () => (
  <Svg width={60} height={36} viewBox="0 0 60 36" fill="none">
    <Path
      d="M2 18C16 18 24 28 36 28C46 28 52 20 46 12C42 6 34 8 36 14C38 20 48 22 56 16C59 13.5 58 7 52 4"
      stroke={gold.border.strong}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.85"
    />
    <Circle cx="52" cy="4" r="1.5" fill={gold.border.strong} />
    <Circle cx="22" cy="10" r="1" fill={gold.border.strong} opacity="0.6" />
    <Circle cx="10" cy="8" r="1.2" fill={gold.border.strong} opacity="0.7" />
  </Svg>
);

const KnotDivider = () => (
  <View style={styles.knotDividerContainer}>
    <View style={styles.dividerLine} />
    <KnotOrnament size={16} color={gold.border.strong} />
    <View style={styles.dividerLine} />
  </View>
);

const ShieldCheckOrnament = () => (
  <Svg width={36} height={42} viewBox="0 0 36 42" fill="none">
    <Path
      d="M18 3L4 9V19C4 28.5 10 36.5 18 39C26 36.5 32 28.5 32 19V9L18 3Z"
      stroke={colors.accent}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 20L16 24L24 16"
      stroke={colors.accent}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LoginScreen = ({ route, navigation }: any) => {
  const pendingWeddingCode = route?.params?.pendingWeddingCode;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const validateEmailFormat = (val: string): boolean => {
    if (!val) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      if (!text.trim()) {
        setEmailError('אנא הזן כתובת אימייל');
      } else if (!validateEmailFormat(text)) {
        setEmailError('כתובת האימייל אינה תקינה');
      } else {
        setEmailError('');
      }
    }
  };

  const handleLogin = async () => {
    setFormError('');
    setEmailError('');

    let hasError = false;
    if (!email.trim()) {
      setEmailError('אנא הזן כתובת אימייל');
      hasError = true;
    } else if (!validateEmailFormat(email)) {
      setEmailError('כתובת האימייל אינה תקינה');
      hasError = true;
    }

    if (!password) {
      setFormError('אנא הזן סיסמה');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      await login({ email: email.trim(), password }, pendingWeddingCode);
    } catch (err: any) {
      setFormError(getFriendlyErrorMessage(err, 'לא ניתן להתחבר כרגע. נסה שוב.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.darkCanvas}>
      {/* Header with App Title & Back affordance */}
      <AppHeader
        title="שידוכים"
        back
        onBack={() => navigation.goBack()}
        appearance="dark"
        testID="login-header-back"
      />
      <View style={styles.headerKnotWrapper}>
        <KnotOrnament size={12} color={gold.border.strong} />
      </View>

      <ScreenContainer
        scroll
        keyboardAware
        safeEdges={['bottom', 'left', 'right']}
        containerStyle={styles.containerStyle}
        contentStyle={styles.contentStyle}
      >
        {/* Title Section with Ceremonial Flourishes */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <TitleFlourishLeft />
            <Text style={[typography.display, styles.pageTitleText]} accessibilityRole="header">
              התחברות
            </Text>
            <TitleFlourishRight />
          </View>
          <View style={styles.titleKnotRow}>
            <KnotOrnament size={14} color={gold.border.strong} />
          </View>
        </View>

        {/* Retained Wedding Code Banner (if present) */}
        {pendingWeddingCode && (
          <View style={styles.pendingCodeBanner}>
            <View style={styles.pendingCodeIconCol}>
              <ShieldCheckOrnament />
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.pendingCodeTextCol}>
              <View style={styles.codePillRow}>
                <Text style={styles.pendingCodeLabelText}>קוד החתונה</Text>
                <View style={styles.codePillBadge}>
                  <BidiText value={pendingWeddingCode} kind="code" style={styles.pendingCodeValue} />
                </View>
              </View>
              <Text style={styles.pendingCodeSubtext}>נשמר להמשך ההצטרפות</Text>
            </View>
          </View>
        )}

        {/* Form Error Notification */}
        {formError ? (
          <View style={styles.formErrorBanner}>
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
                placeholder="הזן כתובת אימייל"
                placeholderTextColor={field.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInputStyle}
                testID="login-email-input"
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
                onChangeText={(t) => {
                  setPassword(t);
                  if (formError) setFormError('');
                }}
                secureTextEntry={!showPassword}
                placeholder="הזן סיסמה"
                placeholderTextColor={field.placeholder}
                autoCapitalize="none"
                style={styles.textInputStyle}
                testID="login-password-input"
                accessibilityLabel="סיסמה"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.trailingIconTouch}
                accessibilityRole="button"
                accessibilityLabel="הצג או הסתר סיסמה"
              >
                <AppIcon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.accent}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Gold Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.primaryGoldButton, isLoading && styles.buttonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="התחברות"
            testID="login-submit-button"
          >
            <Text style={styles.primaryGoldButtonText}>
              {isLoading ? 'מתחבר...' : 'התחברות'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider & Navigation Links */}
        <View style={styles.footerSection}>
          <KnotDivider />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register', { pendingWeddingCode })}
            style={styles.registerLinkTouchable}
            accessibilityRole="button"
            accessibilityLabel="אין לך חשבון? להרשמה"
            testID="login-register-link"
          >
            <Text style={styles.registerLinkText}>אין לך חשבון? להרשמה</Text>
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
  headerKnotWrapper: {
    alignItems: 'center',
    marginTop: -8,
    marginBottom: spacing.xs,
  },
  containerStyle: {
    backgroundColor: 'transparent',
  },
  contentStyle: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
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
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: spacing.xs,
  },
  titleKnotRow: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },

  // Retained Wedding Code Banner Card
  pendingCodeBanner: {
    backgroundColor: visual.surface.ivoryHighlight,
    borderColor: colors.accentBorder,
    borderWidth: 1.5,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  pendingCodeIconCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingEnd: spacing.sm,
  },
  bannerDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  pendingCodeTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  codePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 2,
  },
  pendingCodeLabelText: {
    color: text.onIvory.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  codePillBadge: {
    backgroundColor: visual.surface.ivoryMuted,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pendingCodeValue: {
    color: text.onIvory.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pendingCodeSubtext: {
    color: text.onIvory.secondary,
    fontSize: 12,
    textAlign: 'right',
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
  trailingIconTouch: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Divider and Footer
  knotDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: gold.border.strong,
    opacity: 0.35,
  },
  footerSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  registerLinkTouchable: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  registerLinkText: {
    color: gold.focus,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
