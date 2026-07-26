/**
 * MeScreen — Batch A2 Anchor Runtime Proof
 * ME-01 real USER-only Account/Personal Hub.
 * Strictly adheres to Ceremony Quiet light-only design system.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { StateSurface } from '../../components/foundation/StateSurface';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

const getProfileStatusLabel = (status?: string) => {
  switch (status) {
    case 'NONE':
      return 'טרם הוגדר פרופיל';
    case 'BASIC':
      return 'פרופיל בסיסי';
    case 'FULL':
      return 'פרופיל מלא';
    case 'FULL_INCOMPLETE_BLOCKED':
      return 'פרופיל חסר (דרוש תיקון)';
    default:
      return status || 'לא ידוע';
  }
};

export const MeScreen: React.FC = () => {
  const { user, logout, refreshMe } = useAuth();
  const navigation = useNavigation<any>();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      await refreshMe();
    } catch (err: any) {
      setRefreshError(getFriendlyErrorMessage(err, 'רענון נתוני המוכנות נכשל'));
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user && user.role === 'USER') {
        handleRefresh();
      }
    }, [user?.id])
  );

  if (!user) {
    return null;
  }

  // Staff shell isolation guard
  if (user.role !== 'USER') {
    return (
      <ScreenContainer testID="me-screen-staff-guard">
        <StateSurface
          kind="denied"
          title="אזור אישי למשתמשים"
          message="אזור זה מיועד למשתתפים בלבד. צוות המערכת פועל דרך ממשקי הניהול המורשים."
          primaryAction={{
            label: 'התנתקות',
            onPress: logout,
            icon: 'log-out',
          }}
        />
      </ScreenContainer>
    );
  }

  const isProfileComplete = user.profileStatus === 'BASIC' || user.profileStatus === 'FULL';
  const isFullProfile = user.profileStatus === 'FULL';
  const hasPrimaryPhoto = !!user.hasPrimaryPhoto;
  const isReadinessStale = !!refreshError;

  return (
    <ScreenContainer scroll testID="me-screen-user-hub">
      {/* Page Title */}
      <View style={styles.headerContainer}>
        <Text style={[typography.titleLarge, styles.titleText]}>אני</Text>
        <Text style={[typography.bodyMedium, styles.subtitleText]}>
          ניהול חשבון אישי, תמונות והגדרות מוכנות
        </Text>
      </View>

      {/* SECTION 1: Identity & Profile Header Card */}
      <Card variant="surface" style={styles.identityCard} testID="me-identity-card">
        <View style={styles.identityRow}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <AppIcon name="user" size={40} color={colors.textPrimary} />
            </View>
            <View style={styles.cameraBadge}>
              <AppIcon name="edit" size={sizing.iconXs} color={colors.textInverse} />
            </View>
          </View>

          <View style={styles.identityInfo}>
            <Text style={[typography.titleMedium, styles.userNameText]}>{user.fullName}</Text>
            <Text style={[typography.caption, styles.userEmailText]}>{user.email}</Text>
            <View style={styles.statusPill}>
              <AppIcon name="check" size={sizing.iconXs} color={colors.textAccent} />
              <Text style={[typography.caption, styles.statusPillText]}>
                {getProfileStatusLabel(user.profileStatus)}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* SECTION 2: Readiness Summary Card ("המוכנות שלי") */}
      <Card variant="surface" style={styles.readinessCard} testID="me-readiness-card">
        <View style={styles.readinessHeader}>
          <View style={styles.readinessTitleRow}>
            <AppIcon name="shield" size={sizing.iconMd} color={colors.accent} />
            <Text style={[typography.titleLarge, styles.readinessTitle]}>המוכנות שלי</Text>
          </View>
          {isRefreshing && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {isReadinessStale ? (
          /* Stale / Unavailable Readiness State */
          <View style={styles.staleContainer}>
            <Text style={[typography.bodyMedium, styles.staleText]}>
              לא ניתן היה לרענן את נתוני המוכנות העדכניים. תוכן החשבון מוצג על סמך המידע שנשמר.
            </Text>
            <Button
              label="רענן נתוני מוכנות"
              variant="secondary"
              onPress={handleRefresh}
              loading={isRefreshing}
              iconStart="info"
              style={styles.retryButton}
            />
          </View>
        ) : (
          /* Facts-driven Readiness Summary */
          <View style={styles.readinessFactsContainer}>
            <View style={styles.factRow}>
              <View style={styles.factIconCircle}>
                <AppIcon
                  name={isProfileComplete ? 'check' : 'info'}
                  size={sizing.iconSm}
                  color={isProfileComplete ? colors.statusSuccess : colors.statusWarning}
                />
              </View>
              <View style={styles.factTextColumn}>
                <Text style={[typography.titleSmall, styles.factTitle]}>
                  {isProfileComplete ? 'פרופיל אישי הושלם' : 'חסרים פרטי פרופיל אישי'}
                </Text>
                <Text style={[typography.caption, styles.factSubtitle]}>
                  {isFullProfile
                    ? 'פרופיל מלא זמין גם למאגר הגלובלי'
                    : isProfileComplete
                    ? 'פרופיל בסיסי זמין למאגרי חתונה'
                    : 'מילוי פרופיל נדרש להשתתפות במאגרים'}
                </Text>
              </View>
            </View>

            <View style={styles.factRow}>
              <View style={styles.factIconCircle}>
                <AppIcon
                  name={hasPrimaryPhoto ? 'check' : 'info'}
                  size={sizing.iconSm}
                  color={hasPrimaryPhoto ? colors.statusSuccess : colors.statusWarning}
                />
              </View>
              <View style={styles.factTextColumn}>
                <Text style={[typography.titleSmall, styles.factTitle]}>
                  {hasPrimaryPhoto ? 'תמונה ראשית קיימת' : 'עדיין חסרה תמונה ראשית'}
                </Text>
                <Text style={[typography.caption, styles.factSubtitle]}>
                  {hasPrimaryPhoto
                    ? `הועלו ${user.photoCount} תמונות`
                    : 'תמונה ראשית היא תנאי חובה להצגת הפרופיל'}
                </Text>
              </View>
            </View>

            {/* Legal Repair Actions */}
            <View style={styles.repairActionContainer}>
              {!hasPrimaryPhoto && (
                <Button
                  label="הוספת תמונה ראשית"
                  variant="primary"
                  onPress={() => navigation.navigate('Photos')}
                  iconStart="plus"
                  style={styles.repairButton}
                />
              )}

              {user.profileStatus === 'NONE' && (
                <Button
                  label="השלמת פרופיל"
                  variant="primary"
                  onPress={() => navigation.navigate('Profile', { intent: 'onboarding_basic' })}
                  iconStart="edit"
                  style={styles.repairButton}
                />
              )}

              {user.profileStatus === 'BASIC' && (
                <Button
                  label="השלם לפרופיל מלא"
                  variant="secondary"
                  onPress={() => navigation.navigate('Profile', { intent: 'complete_full' })}
                  iconStart="edit"
                  style={styles.repairButton}
                />
              )}

              {user.profileStatus === 'FULL_INCOMPLETE_BLOCKED' && (
                <Button
                  label="עריכת פרופיל"
                  variant="primary"
                  onPress={() => navigation.navigate('Profile', { intent: 'repair_full' })}
                  iconStart="edit"
                  style={styles.repairButton}
                />
              )}
            </View>
          </View>
        )}
      </Card>

      {/* SECTION 3: Account & Personal Menu Groups */}
      <View style={styles.groupsContainer}>

        {/* Group A: Profile & Photos */}
        <Card variant="surface" style={styles.groupCard}>
          <Text style={[typography.titleMedium, styles.groupHeaderTitle]}>פרופיל ותמונות</Text>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('Profile', { intent: 'view' })}
            accessibilityRole="button"
            accessibilityLabel="פרופיל אישי"
          >
            <View style={styles.rowItemRight}>
              <View style={styles.rowIconWrapper}>
                <AppIcon name="user" size={sizing.iconMd} color={colors.textPrimary} />
              </View>
              <View style={styles.rowTextColumn}>
                <Text style={[typography.titleSmall, styles.rowTitle]}>פרופיל אישי</Text>
                <Text style={[typography.caption, styles.rowSubtitle]}>פרטים אישיים, סטטוס והעדפות</Text>
              </View>
            </View>
            <AppIcon name="chevron-left" size={sizing.iconMd} color={colors.textSecondary} mirrorRTL />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('Photos')}
            accessibilityRole="button"
            accessibilityLabel="התמונות שלי"
          >
            <View style={styles.rowItemRight}>
              <View style={styles.rowIconWrapper}>
                <AppIcon name="edit" size={sizing.iconMd} color={colors.textPrimary} />
              </View>
              <View style={styles.rowTextColumn}>
                <Text style={[typography.titleSmall, styles.rowTitle]}>התמונות שלי</Text>
                <Text style={[typography.caption, styles.rowSubtitle]}>הוספה, ארגון וניהול התמונות שלך</Text>
              </View>
            </View>
            <AppIcon name="chevron-left" size={sizing.iconMd} color={colors.textSecondary} mirrorRTL />
          </TouchableOpacity>
        </Card>

        {/* Group B: Account Information */}
        <Card variant="surface" style={styles.groupCard}>
          <Text style={[typography.titleMedium, styles.groupHeaderTitle]}>חשבון</Text>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('Profile', { intent: 'view' })}
            accessibilityRole="button"
            accessibilityLabel="פרטי חשבון"
          >
            <View style={styles.rowItemRight}>
              <View style={styles.rowIconWrapper}>
                <AppIcon name="lock" size={sizing.iconMd} color={colors.textPrimary} />
              </View>
              <View style={styles.rowTextColumn}>
                <Text style={[typography.titleSmall, styles.rowTitle]}>פרטי חשבון</Text>
                <Text style={[typography.caption, styles.rowSubtitle]}>אבטחה, פרטיות וקוד גישה</Text>
              </View>
            </View>
            <AppIcon name="chevron-left" size={sizing.iconMd} color={colors.textSecondary} mirrorRTL />
          </TouchableOpacity>
        </Card>

        {/* Group C: Safety */}
        <Card variant="surface" style={styles.groupCard}>
          <Text style={[typography.titleMedium, styles.groupHeaderTitle]}>בטיחות</Text>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('BlockedUsers')}
            accessibilityRole="button"
            accessibilityLabel="משתמשים חסומים"
          >
            <View style={styles.rowItemRight}>
              <View style={styles.rowIconWrapper}>
                <AppIcon name="shield" size={sizing.iconMd} color={colors.textPrimary} />
              </View>
              <View style={styles.rowTextColumn}>
                <Text style={[typography.titleSmall, styles.rowTitle]}>משתמשים חסומים</Text>
                <Text style={[typography.caption, styles.rowSubtitle]}>ניהול רשימת חסומים</Text>
              </View>
            </View>
            <AppIcon name="chevron-left" size={sizing.iconMd} color={colors.textSecondary} mirrorRTL />
          </TouchableOpacity>
        </Card>

        {/* Group D: Support & Feedback */}
        <Card variant="surface" style={styles.groupCard}>
          <Text style={[typography.titleMedium, styles.groupHeaderTitle]}>תמיכה</Text>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('MyProductFeedback')}
            accessibilityRole="button"
            accessibilityLabel="הבקשות שלי"
          >
            <View style={styles.rowItemRight}>
              <View style={styles.rowIconWrapper}>
                <AppIcon name="info" size={sizing.iconMd} color={colors.textPrimary} />
              </View>
              <View style={styles.rowTextColumn}>
                <Text style={[typography.titleSmall, styles.rowTitle]}>הבקשות שלי</Text>
                <Text style={[typography.caption, styles.rowSubtitle]}>מעקב אחר פניות ובקשות</Text>
              </View>
            </View>
            <AppIcon name="chevron-left" size={sizing.iconMd} color={colors.textSecondary} mirrorRTL />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('SendProductFeedback')}
            accessibilityRole="button"
            accessibilityLabel="פנייה ותמיכה"
          >
            <View style={styles.rowItemRight}>
              <View style={styles.rowIconWrapper}>
                <AppIcon name="mail" size={sizing.iconMd} color={colors.textPrimary} />
              </View>
              <View style={styles.rowTextColumn}>
                <Text style={[typography.titleSmall, styles.rowTitle]}>פנייה ותמיכה</Text>
                <Text style={[typography.caption, styles.rowSubtitle]}>שאלות ותשובות, יצירת קשר</Text>
              </View>
            </View>
            <AppIcon name="chevron-left" size={sizing.iconMd} color={colors.textSecondary} mirrorRTL />
          </TouchableOpacity>
        </Card>
      </View>

      {/* SECTION 4: Destructive Logout Action */}
      <View style={styles.logoutContainer}>
        <Button
          label="התנתקות"
          variant="destructive"
          onPress={logout}
          iconStart="log-out"
          testID="me-logout-button"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginVertical: spacing.lg,
  },
  titleText: {
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  subtitleText: {
    color: colors.textSecondary,
    textAlign: 'right',
  },
  identityCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  identityRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  userNameText: {
    color: colors.textPrimary,
    textAlign: 'right',
  },
  userEmailText: {
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xxs,
  },
  statusPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    marginTop: spacing.xs,
    gap: spacing.xxs,
  },
  statusPillText: {
    color: colors.textAccent,
    fontWeight: 'bold',
  },
  readinessCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  readinessHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  readinessTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
  },
  readinessTitle: {
    color: colors.textPrimary,
  },
  staleContainer: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  staleText: {
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  readinessFactsContainer: {
    gap: spacing.md,
  },
  factRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  factIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factTextColumn: {
    flex: 1,
  },
  factTitle: {
    color: colors.textPrimary,
    textAlign: 'right',
  },
  factSubtitle: {
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  repairActionContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  repairButton: {
    width: '100%',
  },
  groupsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  groupCard: {
    padding: spacing.md,
  },
  groupHeaderTitle: {
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  rowItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: sizing.minTouchTarget,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  rowItemRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  rowIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextColumn: {
    flex: 1,
  },
  rowTitle: {
    color: colors.textPrimary,
    textAlign: 'right',
  },
  rowSubtitle: {
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.xs,
  },
  logoutContainer: {
    marginBottom: spacing.massive,
  },
});
