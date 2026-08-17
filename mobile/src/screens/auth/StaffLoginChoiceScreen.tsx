import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppIcon } from '../../components/foundation/AppIcon';
import { colors, spacing, radii, visual, shadow } from '../../theme/tokens';
import { typography } from '../../theme/typography';

export const StaffLoginChoiceScreen = ({ navigation }: any) => {
  const handleSelectRole = (expectedRole: 'ADMIN' | 'EVENT_MANAGER') => {
    navigation.navigate('StaffLogin', { expectedRole });
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        {/* Title & Flourish Section */}
        <View style={styles.headerSection}>
          <Text style={[typography.titleLarge, styles.title]} accessibilityRole="header">
            כניסת צוות
          </Text>
          <View style={styles.goldDivider}>
            <View style={styles.goldLine} />
            <AppIcon name="star" size={12} color={colors.accentBorder} />
            <View style={styles.goldLine} />
          </View>
          <Text style={[typography.bodyMedium, styles.subtitle]}>
            בחרו את סוג הכניסה המתאים כדי להמשיך.
          </Text>
        </View>

        {/* Role Cards Stack */}
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleSelectRole('ADMIN')}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="כניסה כמנהל מערכת"
            testID="staff-choice-admin"
          >
            <View style={styles.iconCircle}>
              <AppIcon name="shield" size={22} color={colors.accent} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[typography.titleSmall, styles.cardTitle]}>מנהל מערכת</Text>
              <Text style={[typography.caption, styles.cardDesc]}>
                כניסה לממשק ניהול המערכת.
              </Text>
            </View>
            <View style={styles.chevronWrapper}>
              <AppIcon name="chevron-left" size={20} color={colors.accent} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleSelectRole('EVENT_MANAGER')}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="כניסה כמנהל אירוע"
            testID="staff-choice-event-manager"
          >
            <View style={styles.iconCircle}>
              <AppIcon name="calendar" size={22} color={colors.accent} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[typography.titleSmall, styles.cardTitle]}>מנהל אירוע</Text>
              <Text style={[typography.caption, styles.cardDesc]}>
                כניסה לניהול חתונה או אירוע במסגרת ההרשאות שלך.
              </Text>
            </View>
            <View style={styles.chevronWrapper}>
              <AppIcon name="chevron-left" size={20} color={colors.accent} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  headerSection: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.textPrimary,
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
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    gap: spacing.md,
  },
  roleCard: {
    minHeight: 80,
    backgroundColor: visual.surface.light,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.accentBorder,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: spacing.xxs,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  chevronWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
