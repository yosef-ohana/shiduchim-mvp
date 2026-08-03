import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { AppHeader } from '../../components/foundation/AppHeader';
import { Card } from '../../components/foundation/Card';
import { TextField } from '../../components/foundation/TextField';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { BidiText } from '../../components/foundation/BidiText';
import { useAuth } from '../../context/AuthContext';
import { loginUser, getMe } from '../../api/authApi';
import { saveAccessToken, clearAccessToken } from '../../storage/authStorage';
import { joinWedding } from '../../api/weddingsApi';
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

  // Partial success result state (Frame S6-A01-F03)
  const [partialSuccess, setPartialSuccess] = useState<{
    pendingCode: string;
    errorDetails?: string;
  } | null>(null);

  const isPromotingRef = useRef(false);
  const { refreshMe } = useAuth();

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

  // Shared session-promotion function for Continue, Header Back, and beforeRemove
  const handleContinueToSystem = useCallback(async () => {
    if (isPromotingRef.current) return;
    isPromotingRef.current = true;
    setIsLoading(true);
    try {
      await refreshMe();
    } catch (err: any) {
      isPromotingRef.current = false;
      setIsLoading(false);
      setFormError(
        getFriendlyErrorMessage(err, 'לא ניתן להתחבר למערכת כרגע. אנא נסה שוב.')
      );
    }
  }, [refreshMe]);

  // Install React Navigation beforeRemove listener while partialSuccess is active
  useEffect(() => {
    if (!partialSuccess) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isPromotingRef.current) {
        return;
      }
      e.preventDefault();
      handleContinueToSystem();
    });

    return unsubscribe;
  }, [navigation, partialSuccess, handleContinueToSystem]);

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
      // Step A: Credential Authentication (ONCE)
      const authResponse = await loginUser({ email: email.trim(), password });
      await saveAccessToken(authResponse.accessToken);

      // Step B: Role Verification
      const me = await getMe();

      if (me.role !== 'USER') {
        // Non-USER account entered in AUTH-02: Purge token immediately and reject safely
        await clearAccessToken();
        if (me.role === 'ADMIN' || me.role === 'EVENT_MANAGER') {
          setFormError('חשבון מנהל/צוות אינו יכול להתחבר דרך מסך זה. אנא השתמש במסך כניסת צוות וניהול.');
        } else {
          setFormError('סוג חשבון לא נתמך. אנא פנה לתמיכה.');
        }
        setIsLoading(false);
        return;
      }

      // Step C & D: USER Role Execution
      if (pendingWeddingCode) {
        // Attempt Wedding Join ONCE for authenticated USER
        try {
          await joinWedding({ accessCode: pendingWeddingCode });
          // Join succeeded: promote session ONCE via refreshMe
          await handleContinueToSystem();
        } catch (weddingErr: any) {
          // Join failed: token is preserved in SecureStore, show partial success S6-A01-F03
          setPartialSuccess({
            pendingCode: pendingWeddingCode,
            errorDetails: getFriendlyErrorMessage(
              weddingErr,
              'אירעה תקלה בעת ניסיון ההצטרפות. הקוד שנמסר נשמר וניתן לנסות שוב.'
            ),
          });
        }
      } else {
        // USER without pending wedding code: promote session ONCE via refreshMe
        await handleContinueToSystem();
      }
    } catch (err: any) {
      setFormError(getFriendlyErrorMessage(err, 'לא ניתן להתחבר כרגע. נסה שוב.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Retry Join Action: Call joinWedding ONCE for USER role, zero re-authentications
  const handleRetryJoin = async () => {
    if (!partialSuccess?.pendingCode || isPromotingRef.current) return;
    setIsLoading(true);
    setFormError('');
    try {
      await joinWedding({ accessCode: partialSuccess.pendingCode });
      // Join succeeded on retry: promote session to USER shell
      await handleContinueToSystem();
    } catch (err: any) {
      setFormError(
        getFriendlyErrorMessage(err, 'ניסיון נוסף נכשל. הקוד נשמר וניתן לנסות שוב מאוחר יותר.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Edit Code Action: Navigates to WeddingCodeEntry
  const handleEditCode = () => {
    navigation.navigate('WeddingCodeEntry', {
      accessCode: partialSuccess?.pendingCode || pendingWeddingCode,
    });
  };

  // ==========================================
  // RENDER STATE 2: Partial Success (S6-A01-F03)
  // ==========================================
  if (partialSuccess) {
    return (
      <View style={styles.darkCanvas}>
        <AppHeader
          title="שידוכים"
          back
          onBack={handleContinueToSystem}
        />

        <ScreenContainer scroll containerStyle={styles.containerStyle} contentStyle={styles.contentStyle}>
          <Text style={[typography.display, styles.pageTitleText]} accessibilityRole="header">
            עדכון מצב
          </Text>

          {/* Card 1: Auth Success Surface */}
          <Card style={styles.resultCard}>
            <View style={styles.resultCardRow}>
              <View style={styles.resultTextCol}>
                <Text style={[typography.titleLarge, styles.resultSuccessTitle]}>
                  התחברת בהצלחה
                </Text>
                <Text style={[typography.bodyMedium, styles.resultBodyText]}>
                  כניסתך למערכת בוצעה בהצלחה.{'\n'}אתה מחובר למערכת.
                </Text>
              </View>
              <View style={styles.successIconBadge}>
                <AppIcon name="check" size={28} color={colors.statusSuccess} />
              </View>
            </View>
          </Card>

          {/* Card 2: Wedding Join Failure Surface */}
          <Card style={styles.resultCard}>
            <View style={styles.incompleteBadgeRow}>
              <View style={styles.incompleteBadge}>
                <AppIcon name="alert-circle" size={14} color={colors.statusError} />
                <Text style={styles.incompleteBadgeText}>לא הושלם</Text>
              </View>
            </View>

            <View style={styles.resultCardRow}>
              <View style={styles.resultTextCol}>
                <Text style={[typography.titleMedium, styles.resultFailureTitle]}>
                  ההצטרפות לחתונת{'\n'}משפחות אבוחצירא-בן-דוד{'\n'}לא הושלמה
                </Text>
                <Text style={[typography.bodyMedium, styles.resultBodyText]}>
                  אירעה תקלה בעת ניסיון ההצטרפות.{'\n'}הקוד שנמסר נשמר וניתן לנסות שוב.
                </Text>
              </View>
              <View style={styles.failureIconBadge}>
                <AppIcon name="x" size={28} color={colors.statusError} />
              </View>
            </View>

            <View style={styles.cardDivider}>
              <View style={styles.cardDividerLine} />
              <AppIcon name="star" size={12} color={colors.accentBorder} />
              <View style={styles.cardDividerLine} />
            </View>

            <View style={styles.retainedCodeSection}>
              <View style={styles.retainedCodeLabelRow}>
                <AppIcon name="shield" size={16} color={colors.accent} />
                <Text style={styles.retainedCodeLabelText}>קוד החתונה נשמר</Text>
              </View>

              <View style={styles.codeDashedPill}>
                <AppIcon name="link" size={18} color={colors.accent} />
                <BidiText value={partialSuccess.pendingCode} kind="code" style={styles.retainedCodeValueText} />
              </View>

              <Text style={styles.retainedCodeHelperText}>
                ניתן להשתמש בקוד זה לניסיון הצטרפות חוזר{'\n'}או להעבירו אליך אחר.
              </Text>
            </View>
          </Card>

          {formError ? <Text style={styles.errorBannerText}>{formError}</Text> : null}

          {/* Action Stack */}
          <View style={styles.resultActionsStack}>
            <Button
              label="ניסיון נוסף"
              onPress={handleRetryJoin}
              loading={isLoading}
              variant="primary"
              iconStart="chevron-left"
              fullWidth
              style={styles.retryButton}
              labelStyle={styles.retryButtonText}
              testID="result-retry-button"
            />

            <Button
              label="עריכת הקוד"
              onPress={handleEditCode}
              variant="secondary"
              iconEnd="edit"
              fullWidth
              style={styles.outlineDarkButton}
              labelStyle={styles.outlineDarkButtonText}
              testID="result-edit-code-button"
            />

            <Button
              label="המשך למערכת"
              onPress={handleContinueToSystem}
              loading={isLoading}
              variant="secondary"
              iconEnd="calendar"
              fullWidth
              style={styles.outlineDarkButton}
              labelStyle={styles.outlineDarkButtonText}
              testID="result-continue-button"
            />
          </View>
        </ScreenContainer>
      </View>
    );
  }

  // ==========================================
  // RENDER STATE 1: Standard Login Form (S6-A01-F02)
  // ==========================================
  return (
    <View style={styles.darkCanvas}>
      <AppHeader
        title="שידוכים"
        back
        onBack={() => navigation.goBack()}
        testID="login-header-back"
      />

      <ScreenContainer scroll keyboardAware containerStyle={styles.containerStyle} contentStyle={styles.contentStyle}>
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
