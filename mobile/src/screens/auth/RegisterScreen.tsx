import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { AppHeader } from '../../components/foundation/AppHeader';
import { AppIcon } from '../../components/foundation/AppIcon';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radii, visual, text, gold, field, shadow, icon } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const RegisterScreen = ({ route, navigation }: any) => {
  const pendingWeddingCode = route?.params?.pendingWeddingCode;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    setErrorMsg('');
    if (!fullName || !email || !password) {
      setErrorMsg('אנא מלא את כל השדות');
      return;
    }

    setIsLoading(true);
    try {
      await register({ fullName, email, password, gender }, pendingWeddingCode);
    } catch (e: any) {
      setErrorMsg(getFriendlyErrorMessage(e, 'לא ניתן ליצור חשבון כרגע. נסה שוב.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.darkCanvas}>
      {/* 1. Existing Auth header/back region */}
      <AppHeader
        title="שידוכים"
        back
        onBack={() => navigation.goBack()}
        appearance="dark"
        testID="register-header-back"
      />

      <ScreenContainer
        scroll={false}
        keyboardAware={true}
        safeEdges={['bottom', 'left', 'right']}
        containerStyle={styles.containerStyle}
        contentStyle={styles.contentStyle}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          testID="register-scroll"
        >
          {/* 2. Register title region */}
          <View style={styles.titleSection}>
            <Text style={[typography.display, styles.pageTitleText]} accessibilityRole="header">
              הרשמה
            </Text>
          </View>

          {/* 3. Main warm-ivory registration form surface */}
          <View style={styles.formSection}>
            {/* 4. Full Name field */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>שם מלא</Text>
              <View style={styles.inputPillContainer}>
                <View style={styles.leadingIconWrapper}>
                  <AppIcon name="user" size={20} color={colors.accent} />
                </View>
                <TextInput
                  value={fullName}
                  onChangeText={(t) => {
                    setFullName(t);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="הזן את שמך המלא"
                  placeholderTextColor={field.placeholder}
                  autoCapitalize="words"
                  style={styles.textInputStyleRtl}
                  testID="register-fullname-input"
                  accessibilityLabel="שם מלא"
                />
              </View>
            </View>

            {/* 5. Email field */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>אימייל</Text>
              <View style={styles.inputPillContainer}>
                <View style={styles.leadingIconWrapper}>
                  <AppIcon name="mail" size={20} color={colors.accent} />
                </View>
                <TextInput
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="הזן כתובת אימייל"
                  placeholderTextColor={field.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.textInputStyleLtr}
                  testID="register-email-input"
                  accessibilityLabel="אימייל"
                />
              </View>
            </View>

            {/* 6. Password field */}
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
                    if (errorMsg) setErrorMsg('');
                  }}
                  secureTextEntry
                  placeholder="הזן סיסמה"
                  placeholderTextColor={field.placeholder}
                  autoCapitalize="none"
                  style={styles.textInputStyleLtr}
                  testID="register-password-input"
                  accessibilityLabel="סיסמה"
                />
              </View>
            </View>

            {/* 7. Gender control */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>מגדר</Text>
              <View style={styles.genderContainer} accessibilityRole="radiogroup" accessibilityLabel="מגדר">
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'MALE' ? styles.genderSelected : styles.genderUnselected,
                  ]}
                  onPress={() => {
                    setGender('MALE');
                    if (errorMsg) setErrorMsg('');
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: gender === 'MALE' }}
                  accessibilityLabel="זכר"
                  testID="register-gender-male"
                >
                  <View style={styles.genderButtonContent}>
                    {gender === 'MALE' && (
                      <AppIcon name="check" size={16} color={icon.onGold} style={styles.genderCheckIcon} />
                    )}
                    <Text style={[styles.genderText, gender === 'MALE' ? styles.genderTextSelected : styles.genderTextUnselected]}>
                      זכר
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'FEMALE' ? styles.genderSelected : styles.genderUnselected,
                  ]}
                  onPress={() => {
                    setGender('FEMALE');
                    if (errorMsg) setErrorMsg('');
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: gender === 'FEMALE' }}
                  accessibilityLabel="נקבה"
                  testID="register-gender-female"
                >
                  <View style={styles.genderButtonContent}>
                    {gender === 'FEMALE' && (
                      <AppIcon name="check" size={16} color={icon.onGold} style={styles.genderCheckIcon} />
                    )}
                    <Text style={[styles.genderText, gender === 'FEMALE' ? styles.genderTextSelected : styles.genderTextUnselected]}>
                      נקבה
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* 8. Existing validation/API error region when present */}
            {errorMsg ? (
              <View style={styles.formErrorBanner} accessibilityRole="alert">
                <AppIcon name="alert-circle" size={18} color={colors.statusError} />
                <Text style={styles.formErrorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* 9. Primary Register action */}
            <AppButton
              title="הרשמה"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.primaryGoldButton}
              accessibilityLabel="הרשמה"
              testID="register-submit-button"
            />
          </View>

          {/* 10. Secondary Login action & divider */}
          <View style={styles.footerSection}>
            <View style={styles.dividerLine} />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login', { pendingWeddingCode })}
              style={styles.loginLinkTouchable}
              accessibilityRole="button"
              accessibilityLabel="כבר יש לך חשבון? להתחברות"
              testID="register-login-link"
            >
              <Text style={styles.loginLinkText}>כבר יש לך חשבון? להתחברות</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
    flexGrow: 1,
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  pageTitleText: {
    color: text.onDark.primary,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
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
  leadingIconWrapper: {
    paddingEnd: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputStyleRtl: {
    flex: 1,
    minHeight: 48,
    color: text.onIvory.primary,
    fontSize: 16,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textInputStyleLtr: {
    flex: 1,
    minHeight: 48,
    color: text.onIvory.primary,
    fontSize: 16,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    textAlign: 'left',
    writingDirection: 'ltr',
  },

  // Gender Control
  genderContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  genderButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderSelected: {
    backgroundColor: gold.action.default,
    borderColor: gold.action.pressed,
    borderWidth: 1.5,
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  genderUnselected: {
    backgroundColor: visual.surface.light,
    borderColor: field.border.default,
    borderWidth: 1.5,
  },
  genderButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  genderCheckIcon: {
    marginEnd: spacing.xxs,
  },
  genderText: {
    fontSize: 16,
    textAlign: 'center',
  },
  genderTextSelected: {
    color: text.onGold,
    fontWeight: '700',
  },
  genderTextUnselected: {
    color: text.onIvory.primary,
    fontWeight: '500',
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

  // Divider and Footer
  dividerLine: {
    height: 1,
    backgroundColor: gold.border.strong,
    opacity: 0.2,
    marginVertical: spacing.md,
    width: '100%',
  },
  footerSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  loginLinkTouchable: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loginLinkText: {
    color: gold.focus,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
