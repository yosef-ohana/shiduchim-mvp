import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { colors, spacing, radii } from '../../theme/tokens';
import { typography } from '../../theme/typography';

const welcomeBgSource = require('../../../assets/welcome-bg.png');

export const WelcomeScreen = ({ navigation }: any) => {
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleWeddingCode = () => {
    navigation.navigate('WeddingCodeEntry');
  };

  const handleStaffLogin = () => {
    navigation.navigate('StaffLoginChoice');
  };

  return (
    <View style={styles.outerWrapper}>
      <ImageBackground
        source={welcomeBgSource}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScreenContainer scroll containerStyle={styles.containerStyle} contentStyle={styles.contentStyle}>
          {/* Top Logo / Brand Title Section */}
          <View style={styles.brandHeader}>
            <View style={styles.brandEmblemContainer}>
              <View style={styles.brandDividerLine} />
              <View style={styles.brandIconRing}>
                <AppIcon name="star" size={16} color={colors.accentBorder} />
              </View>
              <View style={styles.brandDividerLine} />
            </View>
            <Text style={[typography.display, styles.brandTitle]} accessibilityRole="header">
              שידוכים
            </Text>
            <View style={styles.brandRingsRow}>
              <View style={styles.smallRingLeft} />
              <View style={styles.smallRingRight} />
            </View>
          </View>

          {/* Central Main Ivory Card */}
          <Card style={styles.mainCard}>
            {/* Overlapping Top Badge Icon */}
            <View style={styles.badgeWrapper}>
              <View style={styles.badgeCircle}>
                <AppIcon name="user" size={24} color={colors.accent} />
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text style={[typography.titleLarge, styles.welcomeHeading]}>
                ברוכים הבאים
              </Text>

              <View style={styles.goldDivider}>
                <View style={styles.goldLine} />
                <AppIcon name="star" size={12} color={colors.accentBorder} />
                <View style={styles.goldLine} />
              </View>

              <Text style={[typography.bodyMedium, styles.taglineText]}>
                המרחב המכבד והבטוח{'\n'}להיכרות רצינית לקראת חתונה.
              </Text>

              {/* Action Buttons Stack */}
              <View style={styles.actionStack}>
                <Button
                  label="התחברות"
                  onPress={handleLogin}
                  variant="primary"
                  iconEnd="chevron-left"
                  fullWidth
                  style={styles.goldButton}
                  labelStyle={styles.goldButtonText}
                  testID="welcome-login-button"
                />

                <Button
                  label="הרשמה"
                  onPress={handleRegister}
                  variant="secondary"
                  iconEnd="chevron-left"
                  fullWidth
                  style={styles.registerButton}
                  labelStyle={styles.registerButtonText}
                  testID="welcome-register-button"
                />

                <Button
                  label="יש לי קוד חתונה"
                  onPress={handleWeddingCode}
                  variant="tertiary"
                  iconStart="link"
                  style={styles.codeButton}
                  labelStyle={styles.codeButtonText}
                  testID="welcome-wedding-code-button"
                />
              </View>
            </View>
          </Card>

          {/* Separated Staff Entry Surface */}
          <View style={styles.staffCardWrapper}>
            <Card
              pressable
              onPress={handleStaffLogin}
              style={styles.staffCard}
              testID="welcome-staff-button"
            >
              <View style={styles.staffRow}>
                <View style={styles.staffLeadingGroup}>
                  <View style={styles.staffIconBadge}>
                    <AppIcon name="shield" size={18} color={colors.accentBorder} />
                  </View>
                  <Text style={[typography.heading, styles.staffText]}>
                    כניסת צוות וניהול
                  </Text>
                </View>
                <AppIcon name="chevron-left" size={20} color={colors.textSecondary} />
              </View>
            </Card>
          </View>
        </ScreenContainer>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#0F0E0D', // Safe dark semantic fallback if image is loading
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  containerStyle: {
    backgroundColor: 'transparent',
  },
  contentStyle: {
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
    minHeight: '100%',
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  brandEmblemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 140,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  brandDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.accentBorder,
    opacity: 0.6,
  },
  brandIconRing: {
    padding: spacing.xxs,
  },
  brandTitle: {
    fontSize: 40,
    lineHeight: 48,
    color: colors.accentMuted, // Warm ivory title
    letterSpacing: 2,
    textAlign: 'center',
  },
  brandRingsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxs,
    gap: -4,
  },
  smallRingLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.accentBorder,
    opacity: 0.8,
  },
  smallRingRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.accentBorder,
    opacity: 0.8,
  },

  // Main Card
  mainCard: {
    backgroundColor: '#FAF6F0', // Quiet ivory card surface
    borderColor: '#E6D7C3',
    borderRadius: radii.xxl,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeWrapper: {
    position: 'absolute',
    top: -28,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FAF6F0',
    borderWidth: 2,
    borderColor: colors.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
  },
  welcomeHeading: {
    fontSize: 28,
    lineHeight: 36,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  goldDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  goldLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.accentBorder,
  },
  taglineText: {
    color: '#6B5E55',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  actionStack: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
  },
  goldButton: {
    backgroundColor: '#C69255', // Restrained warm gold pill
    borderColor: '#B37F43',
    borderRadius: radii.full,
    paddingVertical: spacing.md,
  },
  goldButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: '#FAF6F0',
    borderColor: '#C69255',
    borderWidth: 1.5,
    borderRadius: radii.full,
    paddingVertical: spacing.md,
  },
  registerButtonText: {
    color: '#2C221E',
    fontSize: 16,
    fontWeight: '700',
  },
  codeButton: {
    marginTop: spacing.xs,
  },
  codeButtonText: {
    color: '#7A5A3A',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Staff Entry Card
  staffCardWrapper: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  staffCard: {
    backgroundColor: 'rgba(24, 22, 20, 0.85)', // Dark quiet ceremony bar
    borderColor: '#423932',
    borderWidth: 1,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  staffLeadingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  staffIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A241F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#423932',
  },
  staffText: {
    color: '#E8DFD5',
    fontSize: 15,
    fontWeight: '600',
  },
});
