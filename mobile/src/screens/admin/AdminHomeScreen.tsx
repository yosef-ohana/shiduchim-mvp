/**
 * AdminHomeScreen Component — Batch A8
 * Canonical ADMIN landing hub surface with truthful status/count presentation.
 * Role-restricted to ADMIN. Cards remain navigable independently of status/count fetching.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
import { AdminDashboardResponse } from '../../types/api';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { AppIcon } from '../../components/foundation/AppIcon';
import { StateSurface } from '../../components/foundation/StateSurface';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminHome'>;

export const AdminHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const fetchDashboard = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(false);
    try {
      const data = await adminApi.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      // Clear protected dashboard data on error (including 401/403)
      setDashboardData(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboard();
    } else {
      setDashboardData(null);
    }
  }, [isAdmin, fetchDashboard]);

  // Role Guard Surface
  if (!isAdmin) {
    return (
      <ScreenContainer scroll testID="admin-home-denied">
        <StateSurface
          kind="denied"
          title="גישה נדחתה"
          message="אין לך הרשאות לצפות במסך מנהל מערכת."
        />
      </ScreenContainer>
    );
  }

  const renderCardStatus = (
    explicitCount: number | undefined,
    isUnknown: boolean = false
  ) => {
    if (isUnknown) {
      return (
        <View style={styles.statusBadgeNeutral}>
          <Text style={[typography.caption, styles.neutralStatusText]}>
            הספירה אינה זמינה
          </Text>
        </View>
      );
    }

    if (loading && !dashboardData) {
      return (
        <View style={styles.statusBadgeNeutral}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
        </View>
      );
    }

    if (error || explicitCount === undefined) {
      return (
        <View style={styles.statusBadgeNeutral}>
          <Text style={[typography.caption, styles.neutralStatusText]}>
            הספירה אינה זמינה
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.statusBadgeAuthoritative}>
        <Text style={[typography.captionBold, styles.authoritativeStatusText]}>
          {explicitCount.toLocaleString('he-IL')} רשומים
        </Text>
      </View>
    );
  };

  return (
    <ScreenContainer scroll testID="admin-home-screen">
      {/* Header Context */}
      <View style={styles.headerContext}>
        <Text style={[typography.titleLarge, styles.titleText]}>
          ניהול מערכת
        </Text>
        <Text style={[typography.bodyMedium, styles.subtitleText]}>
          לוח בקרה מרכזי לניהול משתמשים, חתונות ותפעול המערכת
        </Text>
      </View>

      {/* Domain Partial Failure Surface */}
      {error && (
        <StateSurface
          kind="partial"
          title="טעינת חלק מנתוני הספירה נכשלה"
          message="לא ניתן להציג את נתוני הספירה המעודכנים. הניווט במערכת נשאר זמין ללא שינוי."
          primaryAction={{
            label: 'נסה שוב',
            onPress: fetchDashboard,
            icon: 'info',
          }}
          style={styles.errorSurface}
          testID="admin-home-partial-error"
        />
      )}

      {/* Canonical Navigation Cards */}
      <View style={styles.cardsStack}>
        {/* Card 1: Users */}
        <Card
          pressable
          onPress={() => navigation.navigate('AdminUsers')}
          variant="surface"
          style={styles.navCard}
          accessibilityLabel={`משתמשים, ${
            dashboardData
              ? `${dashboardData.usersCount} משתמשים רשומים`
              : 'הספירה אינה זמינה'
          }`}
          testID="admin-home-users-card"
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconContainer}>
                <AppIcon name="user" size={sizing.iconMd} color={colors.primary} />
              </View>
              <Text style={[typography.titleMedium, styles.cardTitle]}>
                משתמשים
              </Text>
            </View>
            {renderCardStatus(dashboardData?.usersCount)}
          </View>
          <Text style={[typography.bodyMedium, styles.cardDescription]}>
            ניהול כלל המשתמשים במערכת והרשאותיהם
          </Text>
          <View style={styles.cardFooter}>
            <Text style={[typography.heading, styles.navigateActionText]}>
              לניהול משתמשים ←
            </Text>
          </View>
        </Card>

        {/* Card 2: Weddings */}
        <Card
          pressable
          onPress={() => navigation.navigate('AdminWeddings')}
          variant="surface"
          style={styles.navCard}
          accessibilityLabel={`חתונות, ${
            dashboardData
              ? `${dashboardData.weddingsCount} חתונות במערכת`
              : 'הספירה אינה זמינה'
          }`}
          testID="admin-home-weddings-card"
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconContainer}>
                <AppIcon name="heart" size={sizing.iconMd} color={colors.primary} />
              </View>
              <Text style={[typography.titleMedium, styles.cardTitle]}>
                חתונות
              </Text>
            </View>
            {renderCardStatus(dashboardData?.weddingsCount)}
          </View>
          <Text style={[typography.bodyMedium, styles.cardDescription]}>
            ניהול אירועי חתונה, משתתפים והגדרות
          </Text>
          <View style={styles.cardFooter}>
            <Text style={[typography.heading, styles.navigateActionText]}>
              לניהול חתונות ←
            </Text>
          </View>
        </Card>

        {/* Card 3: Operations */}
        <Card
          pressable
          onPress={() => navigation.navigate('AdminOperations')}
          variant="surface"
          style={styles.navCard}
          accessibilityLabel="תפעול ומנהלי אירועים, הספירה אינה זמינה"
          testID="admin-home-operations-card"
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconContainer}>
                <AppIcon name="settings" size={sizing.iconMd} color={colors.primary} />
              </View>
              <Text style={[typography.titleMedium, styles.cardTitle]}>
                תפעול ומנהלי אירועים
              </Text>
            </View>
            {renderCardStatus(undefined, true)}
          </View>
          <Text style={[typography.bodyMedium, styles.cardDescription]}>
            ניהול מנהלי אירועים, דיווחי משתמשים ופניות מערכת
          </Text>
          <View style={styles.cardFooter}>
            <Text style={[typography.heading, styles.navigateActionText]}>
              לתפעול המערכת ←
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
  errorSurface: {
    marginBottom: spacing.md,
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
