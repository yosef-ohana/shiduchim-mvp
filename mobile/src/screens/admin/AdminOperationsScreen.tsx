/**
 * AdminOperationsScreen Component — Batch A8
 * Canonical ADMIN operations hub surface for Event Managers, Reports, and Product Feedback.
 * Role-restricted to ADMIN. Truthful count authority, independent partial-failure behavior,
 * and navigable cards.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
import { reportsApi } from '../../api/reportsApi';
import { productFeedbackApi } from '../../api/productFeedbackApi';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { AppIcon } from '../../components/foundation/AppIcon';
import { StateSurface } from '../../components/foundation/StateSurface';
import { Button } from '../../components/foundation/Button';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminOperations'>;

interface DomainState {
  loading: boolean;
  error: boolean;
  count?: number | null;
}

export const AdminOperationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  const [emState, setEmState] = useState<DomainState>({ loading: false, error: false, count: null });
  const [reportsState, setReportsState] = useState<DomainState>({ loading: false, error: false });
  const [feedbackState, setFeedbackState] = useState<DomainState>({ loading: false, error: false });

  // Independent Fetch Handlers
  const fetchEventManagersCount = useCallback(async () => {
    if (!isAdmin) return;
    setEmState(prev => ({ ...prev, loading: true, error: false }));
    try {
      const dashboard = await adminApi.getDashboard();
      setEmState({ loading: false, error: false, count: dashboard.eventManagersCount });
    } catch (err: any) {
      // Clear data on error (including 401/403)
      setEmState({ loading: false, error: true, count: null });
    }
  }, [isAdmin]);

  const checkReportsStatus = useCallback(async () => {
    if (!isAdmin) return;
    setReportsState(prev => ({ ...prev, loading: true, error: false }));
    try {
      await adminApi.getReports();
      setReportsState({ loading: false, error: false });
    } catch (err: any) {
      setReportsState({ loading: false, error: true });
    }
  }, [isAdmin]);

  const checkFeedbackStatus = useCallback(async () => {
    if (!isAdmin) return;
    setFeedbackState(prev => ({ ...prev, loading: true, error: false }));
    try {
      await productFeedbackApi.getAdminFeedbackList();
      setFeedbackState({ loading: false, error: false });
    } catch (err: any) {
      setFeedbackState({ loading: false, error: true });
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchEventManagersCount();
      checkReportsStatus();
      checkFeedbackStatus();
    } else {
      setEmState({ loading: false, error: false, count: null });
      setReportsState({ loading: false, error: false });
      setFeedbackState({ loading: false, error: false });
    }
  }, [isAdmin, fetchEventManagersCount, checkReportsStatus, checkFeedbackStatus]);

  // Role Guard Surface
  if (!isAdmin) {
    return (
      <ScreenContainer scroll testID="admin-operations-denied">
        <StateSurface
          kind="denied"
          title="גישה נדחתה"
          message="אין לך הרשאות לצפות במסך תפעול המערכת."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll testID="admin-operations-screen">
      {/* Header Context */}
      <View style={styles.headerContext}>
        <Text style={[typography.titleLarge, styles.titleText]}>
          תפעול ומנהלי אירועים
        </Text>
        <Text style={[typography.bodyMedium, styles.subtitleText]}>
          מרכז תפעול המערכת, מעקב אחר דיווחים, פניות ומנהלי אירועים
        </Text>
      </View>

      {/* Canonical Operations Navigation Cards */}
      <View style={styles.cardsStack}>
        {/* Card 1: Event Managers */}
        <Card
          pressable
          onPress={() => navigation.navigate('AdminEventManagers')}
          variant="surface"
          style={styles.navCard}
          accessibilityLabel={`מנהלי אירועים, ${
            emState.count !== null && emState.count !== undefined
              ? `${emState.count} מנהלי אירועים רשומים`
              : 'הספירה אינה זמינה'
          }`}
          testID="admin-operations-event-managers-card"
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconContainer}>
                <AppIcon name="user" size={sizing.iconMd} color={colors.primary} />
              </View>
              <Text style={[typography.titleMedium, styles.cardTitle]}>
                מנהלי אירועים
              </Text>
            </View>

            {emState.loading ? (
              <View style={styles.statusBadgeNeutral}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
              </View>
            ) : emState.count !== null && emState.count !== undefined ? (
              <View style={styles.statusBadgeAuthoritative}>
                <Text style={[typography.captionBold, styles.authoritativeStatusText]}>
                  {emState.count.toLocaleString('he-IL')} מנהלים
                </Text>
              </View>
            ) : (
              <View style={styles.statusBadgeNeutral}>
                <Text style={[typography.caption, styles.neutralStatusText]}>
                  הספירה אינה זמינה
                </Text>
              </View>
            )}
          </View>

          <Text style={[typography.bodyMedium, styles.cardDescription]}>
            ניהול צוות מנהלי האירועים והרשאותיהם
          </Text>

          {emState.error && (
            <View style={styles.domainErrorContainer}>
              <Text style={[typography.caption, styles.domainErrorText]}>
                שגיאה בטעינת סטטוס מנהלי אירועים
              </Text>
              <Button
                label="רענן סטטוס"
                onPress={fetchEventManagersCount}
                variant="secondary"
              />
            </View>
          )}

          <View style={styles.cardFooter}>
            <Text style={[typography.heading, styles.navigateActionText]}>
              לניהול מנהלי אירועים ←
            </Text>
          </View>
        </Card>

        {/* Card 2: Reports */}
        <Card
          pressable
          onPress={() => navigation.navigate('AdminReports')}
          variant="surface"
          style={styles.navCard}
          accessibilityLabel="ניהול דיווחים, הספירה אינה זמינה"
          testID="admin-operations-reports-card"
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconContainer}>
                <AppIcon name="alert-circle" size={sizing.iconMd} color={colors.primary} />
              </View>
              <Text style={[typography.titleMedium, styles.cardTitle]}>
                ניהול דיווחים
              </Text>
            </View>

            {reportsState.loading ? (
              <View style={styles.statusBadgeNeutral}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
              </View>
            ) : (
              <View style={styles.statusBadgeNeutral}>
                <Text style={[typography.caption, styles.neutralStatusText]}>
                  הספירה אינה זמינה
                </Text>
              </View>
            )}
          </View>

          <Text style={[typography.bodyMedium, styles.cardDescription]}>
            טיפול בדיווחי משתמשים ותלונות
          </Text>

          {reportsState.error && (
            <View style={styles.domainErrorContainer}>
              <Text style={[typography.caption, styles.domainErrorText]}>
                שגיאה בטעינת סטטוס דיווחים
              </Text>
              <Button
                label="רענן סטטוס"
                onPress={checkReportsStatus}
                variant="secondary"
              />
            </View>
          )}

          <View style={styles.cardFooter}>
            <Text style={[typography.heading, styles.navigateActionText]}>
              לניהול דיווחים ←
            </Text>
          </View>
        </Card>

        {/* Card 3: Product Feedback */}
        <Card
          pressable
          onPress={() => navigation.navigate('AdminProductFeedback')}
          variant="surface"
          style={styles.navCard}
          accessibilityLabel="פניות מערכת, הספירה אינה זמינה"
          testID="admin-operations-feedback-card"
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconContainer}>
                <AppIcon name="info" size={sizing.iconMd} color={colors.primary} />
              </View>
              <Text style={[typography.titleMedium, styles.cardTitle]}>
                פניות מערכת
              </Text>
            </View>

            {feedbackState.loading ? (
              <View style={styles.statusBadgeNeutral}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
              </View>
            ) : (
              <View style={styles.statusBadgeNeutral}>
                <Text style={[typography.caption, styles.neutralStatusText]}>
                  הספירה אינה זמינה
                </Text>
              </View>
            )}
          </View>

          <Text style={[typography.bodyMedium, styles.cardDescription]}>
            מעקב וניהול פניות ומשוב על המוצר
          </Text>

          {feedbackState.error && (
            <View style={styles.domainErrorContainer}>
              <Text style={[typography.caption, styles.domainErrorText]}>
                שגיאה בטעינת סטטוס פניות מערכת
              </Text>
              <Button
                label="רענן סטטוס"
                onPress={checkFeedbackStatus}
                variant="secondary"
              />
            </View>
          )}

          <View style={styles.cardFooter}>
            <Text style={[typography.heading, styles.navigateActionText]}>
              לפניות מערכת ←
            </Text>
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContext: {
    marginVertical: spacing.lg,
  },
  titleText: {
    color: colors.textPrimary,
    writingDirection: 'rtl',
  },
  subtitleText: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    writingDirection: 'rtl',
  },
  cardsStack: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  navCard: {
    minHeight: 48,
    borderRadius: radii.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: colors.textPrimary,
    writingDirection: 'rtl',
  },
  cardDescription: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
    writingDirection: 'rtl',
  },
  domainErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.xs,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  domainErrorText: {
    color: colors.statusError,
    writingDirection: 'rtl',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  navigateActionText: {
    color: colors.primary,
    writingDirection: 'rtl',
  },
  statusBadgeNeutral: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  neutralStatusText: {
    color: colors.textSecondary,
    writingDirection: 'rtl',
  },
  statusBadgeAuthoritative: {
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  authoritativeStatusText: {
    color: colors.primary,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
});
