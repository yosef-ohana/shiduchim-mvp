import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { AppHeader } from '../../components/foundation/AppHeader';
import { Card } from '../../components/foundation/Card';
import { TextField } from '../../components/foundation/TextField';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { BidiText } from '../../components/foundation/BidiText';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radii } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

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
      <AppHeader
        title="שידוכים"
        back
        onBack={() => navigation.goBack()}
        testID="login-header-back"
      />

      <ScreenContainer
        scroll
        keyboardAware
        safeEdges={['bottom', 'left', 'right']}
        containerStyle={styles.containerStyle}
        contentStyle={styles.contentStyle}
      >
        <View style={styles.titleSection}>
          <Text style={[typography.display, styles.pageTitleText]} accessibilityRole="header">
            התחברות
          </Text>
          {pendingWeddingCode && (
            <Text style={[typography.bodyMedium, styles.subtitleText]}>
              התחברו כדי להמשיך להצטרפות לחתונה
            </Text>
          )}
        </View>

        {/* Retained Wedding Code Banner Card */}
        {pendingWeddingCode && (
          <Card style={styles.pendingCodeBanner}>
            <View style={styles.pendingCodeHeaderRow}>
              <AppIcon name="shield" size={18} color={colors.accentBorder} />
              <Text style={styles.pendingCodeHeaderText}>
                קוד החתונה נשמר להמשך ההצטרפות
              </Text>
            </View>

            <View style={styles.pendingCodeBox}>
              <AppIcon name="star" size={14} color={colors.accentBorder} />
              <BidiText value={pendingWeddingCode} kind="code" style={styles.pendingCodeText} />
              <AppIcon name="star" size={14} color={colors.accentBorder} />
            </View>
          </Card>
        )}

        {/* Auth Form Card */}
        <Card style={styles.formCard}>
          {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}

          {/* Email Field */}
          <TextField
            label="אימייל"
            iconLabel="mail"
            placeholder="הזן כתובת אימייל"
            inputModeType="email"
            bidiType="email"
            value={email}
            onChangeText={handleEmailChange}
            error={emailError}
            required
            testID="login-email-input"
          />

          <View style={styles.cardDivider}>
            <View style={styles.cardDividerLine} />
            <AppIcon name="star" size={12} color={colors.accentBorder} />
            <View style={styles.cardDividerLine} />
          </View>

          {/* Password Field */}
          <TextField
            label="סיסמה"
            iconLabel="lock"
            placeholder="הזן סיסמה"
            inputModeType="password"
            secure={!showPassword}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (formError) setFormError('');
            }}
            iconEnd={showPassword ? 'eye-off' : 'eye'}
            onPressIconEnd={() => setShowPassword(!showPassword)}
            required
            testID="login-password-input"
          />

          {/* Primary Login Button */}
          <Button
            label="התחברות"
            onPress={handleLogin}
            loading={isLoading}
            variant="primary"
            fullWidth
            style={styles.loginSubmitButton}
            labelStyle={styles.loginSubmitButtonText}
            testID="login-submit-button"
          />
        </Card>

        {/* Footer info and Register link */}
        <View style={styles.footerSection}>
          {pendingWeddingCode && (
            <View style={styles.footerNoteRow}>
              <AppIcon name="star" size={12} color={colors.accentBorder} />
              <Text style={styles.footerNoteText}>
                בהתחברות תמשיכו תהליך הצטרפות לחתונה
              </Text>
              <AppIcon name="star" size={12} color={colors.accentBorder} />
            </View>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('Register', { pendingWeddingCode })}
            style={styles.registerLinkContainer}
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
    backgroundColor: '#0F0E0D', // Quiet Ceremony dark background canvas
  },
  containerStyle: {
    backgroundColor: 'transparent',
  },
  contentStyle: {
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },

  // Titles
  titleSection: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  pageTitleText: {
    color: '#F5EBE0',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitleText: {
    color: '#A89F91',
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Pending Code Banner
  pendingCodeBanner: {
    backgroundColor: 'rgba(28, 25, 23, 0.9)',
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  pendingCodeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pendingCodeHeaderText: {
    color: colors.accentBorder,
    fontSize: 14,
    fontWeight: '600',
  },
  pendingCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171412',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    width: '100%',
  },
  pendingCodeText: {
    color: colors.accentMuted,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Auth Form Card
  formCard: {
    backgroundColor: '#FAF6F0', // Ivory card surface
    borderColor: '#E6D7C3',
    borderRadius: radii.xxl,
    padding: spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  formErrorText: {
    color: colors.statusError,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  cardDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.md,
  },
  cardDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6D7C3',
  },
  loginSubmitButton: {
    backgroundColor: '#C69255',
    borderColor: '#B37F43',
    borderRadius: radii.full,
    marginTop: spacing.lg,
  },
  loginSubmitButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },

  // Footer Section
  footerSection: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  footerNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerNoteText: {
    color: '#A89F91',
    fontSize: 13,
  },
  registerLinkContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  registerLinkText: {
    color: colors.accentBorder,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Partial Success Result State (Frame S6-A01-F03)
  resultCard: {
    backgroundColor: '#FAF6F0',
    borderColor: '#E6D7C3',
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  resultCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultTextCol: {
    flex: 1,
    paddingEnd: spacing.md,
  },
  resultSuccessTitle: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  resultFailureTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: spacing.xs,
  },
  resultBodyText: {
    color: '#6B5E55',
    lineHeight: 20,
  },
  successIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.statusSuccessBg,
    borderWidth: 2,
    borderColor: colors.statusSuccessBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  failureIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.statusErrorBg,
    borderWidth: 2,
    borderColor: colors.statusErrorBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },

  incompleteBadgeRow: {
    marginBottom: spacing.md,
  },
  incompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.statusErrorBg,
    borderWidth: 1,
    borderColor: colors.statusErrorBorder,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    gap: spacing.xs,
  },
  incompleteBadgeText: {
    color: colors.statusError,
    fontSize: 12,
    fontWeight: '700',
  },

  retainedCodeSection: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  retainedCodeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  retainedCodeLabelText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  codeDashedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    width: '100%',
    marginVertical: spacing.xs,
  },
  retainedCodeValueText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  retainedCodeHelperText: {
    color: colors.secondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 16,
  },

  errorBannerText: {
    color: colors.statusError,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontSize: 14,
    fontWeight: '600',
  },

  resultActionsStack: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: '#C69255',
    borderColor: '#B37F43',
    borderRadius: radii.full,
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineDarkButton: {
    backgroundColor: 'transparent',
    borderColor: '#423932',
    borderWidth: 1.5,
    borderRadius: radii.full,
  },
  outlineDarkButtonText: {
    color: colors.accentMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
