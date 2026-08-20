/**
 * ConnectionsHubScreen — Batch REL-02 C1 Visual Recovery
 * Canonical USER Connections root with three separate canonical domains:
 * 1. Interest (עניין) -> Lists
 * 2. Opening Messages (הודעות פתיחה) -> OpeningMessages
 * 3. Matches (התאמות) -> Matches
 *
 * Visual Authorities:
 * - Primary: Owner Screen 7 (B-05 / S6-A05-F01 Loaded)
 * - Supporting: Owner Screen 18 (R-10 / S6-A05-F02 Unknown Counts + Partial Failure)
 * - Full Empty: OVD-DEV-REL02-001 (R-11 / S6-A05-F03 Bounded Replacement)
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserShellStackParamList, UserConnectionsStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { StateSurface } from '../../components/foundation/StateSurface';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radii, sizing, visual, gold, text as textTokens } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { getLikes } from '../../api/listsApi';
import { getInboxOpeningMessages } from '../../api/openingMessagesApi';
import { getMatches } from '../../api/matchesApi';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

type ConnectionsHubNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<UserConnectionsStackParamList, 'ConnectionsHub'>,
  NativeStackNavigationProp<UserShellStackParamList>
>;

interface DomainState {
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage: string | null;
  isEmpty: boolean;
}

const initialDomainState: DomainState = {
  status: 'idle',
  errorMessage: null,
  isEmpty: false,
};

export const ConnectionsHubScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<ConnectionsHubNavProp>();

  // Domain 1: Interest (עניין)
  const [interestState, setInterestState] = useState<DomainState>(initialDomainState);

  // Domain 2: Opening Messages (הודעות פתיחה)
  const [openingsState, setOpeningsState] = useState<DomainState>(initialDomainState);

  // Domain 3: Matches (התאמות)
  const [matchesState, setMatchesState] = useState<DomainState>(initialDomainState);

  const fetchInterestDomain = useCallback(async () => {
    setInterestState(prev => ({ ...prev, status: 'loading', errorMessage: null }));
    try {
      const res = await getLikes();
      const isArray = Array.isArray(res);
      setInterestState({
        status: 'success',
        errorMessage: null,
        isEmpty: isArray && res.length === 0,
      });
    } catch (err: any) {
      setInterestState({
        status: 'error',
        errorMessage: getFriendlyErrorMessage(err, 'לא ניתן לטעון את התחום כרגע'),
        isEmpty: false,
      });
    }
  }, []);

  const fetchOpeningsDomain = useCallback(async () => {
    setOpeningsState(prev => ({ ...prev, status: 'loading', errorMessage: null }));
    try {
      const res = await getInboxOpeningMessages();
      const isArray = Array.isArray(res);
      setOpeningsState({
        status: 'success',
        errorMessage: null,
        isEmpty: isArray && res.length === 0,
      });
    } catch (err: any) {
      setOpeningsState({
        status: 'error',
        errorMessage: getFriendlyErrorMessage(err, 'לא ניתן לטעון את התחום כרגע'),
        isEmpty: false,
      });
    }
  }, []);

  const fetchMatchesDomain = useCallback(async () => {
    setMatchesState(prev => ({ ...prev, status: 'loading', errorMessage: null }));
    try {
      const res = await getMatches();
      const isArray = Array.isArray(res);
      setMatchesState({
        status: 'success',
        errorMessage: null,
        isEmpty: isArray && res.length === 0,
      });
    } catch (err: any) {
      setMatchesState({
        status: 'error',
        errorMessage: getFriendlyErrorMessage(err, 'לא ניתן לטעון את התחום כרגע'),
        isEmpty: false,
      });
    }
  }, []);

  const refreshAllDomains = useCallback(async () => {
    await Promise.allSettled([
      fetchInterestDomain(),
      fetchOpeningsDomain(),
      fetchMatchesDomain(),
    ]);
  }, [fetchInterestDomain, fetchOpeningsDomain, fetchMatchesDomain]);

  useFocusEffect(
    useCallback(() => {
      if (user && user.role === 'USER') {
        refreshAllDomains();
      }
    }, [user?.id, user?.role, refreshAllDomains])
  );

  // Protected-data-safe denied StateSurface if non-USER reaches screen
  if (!user || user.role !== 'USER') {
    const canGoBack = navigation.canGoBack();
    return (
      <ScreenContainer testID="connections-hub-staff-guard">
        <StateSurface
          kind="denied"
          title="אזור קשרים למשתמשים"
          message="אזור זה מיועד למשתתפים בלבד. צוות המערכת פועל דרך ממשקי הניהול המורשים."
          primaryAction={
            canGoBack
              ? {
                  label: 'חזרה',
                  onPress: () => navigation.goBack(),
                  icon: 'arrow-right',
                }
              : undefined
          }
        />
      </ScreenContainer>
    );
  }

  // Full Empty is valid ONLY when all 3 requests completed successfully and all 3 returned empty collections
  const isFullEmpty =
    interestState.status === 'success' &&
    openingsState.status === 'success' &&
    matchesState.status === 'success' &&
    interestState.isEmpty &&
    openingsState.isEmpty &&
    matchesState.isEmpty;

  const isGlobalLoading =
    interestState.status === 'loading' &&
    openingsState.status === 'loading' &&
    matchesState.status === 'loading';

  return (
    <ScreenContainer scroll testID="connections-hub-screen">
      {/* Header Title & Subtitle */}
      <View style={styles.headerContainer}>
        <View style={styles.titleWrapper}>
          <Text style={[typography.titleLarge, styles.titleText]}>קשרים</Text>
          <View style={styles.headerFlourish} />
        </View>
        <Text style={[typography.bodyMedium, styles.subtitleText]}>
          כל שלב בתהליך נמצא במקום ברור משלו
        </Text>
      </View>

      {/* Full Empty Banner (OVD-DEV-REL02-001 Bounded Replacement) */}
      {isFullEmpty && (
        <Card
          variant="surface"
          appearance="ivory"
          style={styles.emptyCard}
          testID="connections-full-empty-banner"
        >
          <View style={styles.emptyHeaderRow}>
            <AppIcon name="info" size={sizing.iconMd} color={gold.border.strong} />
            <Text style={[typography.titleMedium, styles.emptyTitle]}>
              אין כעת קשרים בשלושת התחומים
            </Text>
          </View>
          <Text style={[typography.caption, styles.emptySubtext]}>
            כל התחומים זמינים לניווט ולמעקב. ניתן לרענן את הנתונים בכל עת.
          </Text>
          <Button
            label="רענן נתונים"
            variant="secondary"
            onPress={refreshAllDomains}
            loading={isGlobalLoading}
            style={styles.refreshButton}
            testID="full-empty-refresh-button"
          />
        </Card>
      )}

      {/* Domain Cards Container */}
      <View style={styles.cardsContainer}>

        {/* DOMAIN 1: Interest (עניין) */}
        <Card
          variant="surface"
          appearance="ivory"
          pressable
          onPress={() => navigation.navigate('Lists')}
          accessibilityLabel="עניין, מעבר לרשימות שלי"
          style={styles.domainCard}
          testID="domain-card-interest"
        >
          <View style={styles.cardHeaderRow}>

            {/* Left side: Chevron */}
            <View style={styles.leftControlContainer}>
              <AppIcon name="chevron-left" size={sizing.iconMd} color={textTokens.onIvory.secondary} mirrorRTL />
            </View>

            {/* Middle: Title, Subtitle, Status */}
            <View style={styles.titleColumn}>
              <View style={styles.titleBadgeRow}>
                <Text style={[typography.titleLarge, styles.cardTitle]}>עניין</Text>
                {interestState.status === 'error' && (
                  <View style={styles.errorBadge}>
                    <Text style={styles.errorBadgeText}>לא זמין</Text>
                  </View>
                )}
                {interestState.status === 'loading' && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>טוען...</Text>
                  </View>
                )}
              </View>
              <Text style={[typography.bodyMedium, styles.cardDescription]}>
                סימוני עניין, מי סימן אותך, לא מתאימים ומעצרים בצד
              </Text>
            </View>

            {/* Right: Icon Circle */}
            <View style={styles.iconCircle}>
              <AppIcon name="heart" size={sizing.iconLg} color={gold.action.default} />
            </View>

          </View>

          {/* Status / Footer / Isolated Error */}
          {interestState.status === 'loading' ? (
            <View style={styles.cardStatusRow}>
              <ActivityIndicator size="small" color={gold.action.default} />
              <Text style={[typography.caption, styles.statusSubtext]}>טוען נתונים...</Text>
            </View>
          ) : interestState.status === 'error' ? (
            <View style={styles.isolatedErrorContainer}>
              <View style={styles.partialErrorHeader}>
                <AppIcon name="alert-circle" size={sizing.iconSm} color={colors.statusWarning} />
                <Text style={[typography.titleSmall, styles.partialErrorTitle]}>
                  טעינה חלקית באזור זה
                </Text>
              </View>
              <Text style={[typography.caption, styles.errorText]}>
                {interestState.errorMessage || 'לא ניתן לטעון את התחום כרגע. אפשר לנסות שוב או להיכנס לאזור.'}
              </Text>
              <Button
                label="נסה שוב"
                variant="secondary"
                onPress={fetchInterestDomain}
                style={styles.retryButton}
                testID="retry-button-interest"
              />
            </View>
          ) : (
            <View style={styles.cardFooterRow}>
              <AppIcon name="calendar" size={sizing.iconXs} color={textTokens.onIvory.secondary} />
              <Text style={[typography.caption, styles.footerSubtext]}>
                הספירה אינה זמינה
              </Text>
            </View>
          )}
        </Card>

        {/* DOMAIN 2: Opening Messages (הודעות פתיחה) */}
        <Card
          variant="surface"
          appearance="ivory"
          pressable
          onPress={() => navigation.navigate('OpeningMessages')}
          accessibilityLabel="הודעות פתיחה, מעבר להודעות פתיחה"
          style={styles.domainCard}
          testID="domain-card-opening-messages"
        >
          <View style={styles.cardHeaderRow}>

            {/* Left side: Chevron */}
            <View style={styles.leftControlContainer}>
              <AppIcon name="chevron-left" size={sizing.iconMd} color={textTokens.onIvory.secondary} mirrorRTL />
            </View>

            {/* Middle: Title, Subtitle, Status */}
            <View style={styles.titleColumn}>
              <View style={styles.titleBadgeRow}>
                <Text style={[typography.titleLarge, styles.cardTitle]}>הודעות פתיחה</Text>
                {openingsState.status === 'error' && (
                  <View style={styles.errorBadge}>
                    <Text style={styles.errorBadgeText}>לא זמין</Text>
                  </View>
                )}
                {openingsState.status === 'loading' && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>טוען...</Text>
                  </View>
                )}
              </View>
              <Text style={[typography.bodyMedium, styles.cardDescription]}>
                הודעות פתיחה שנשלחו והתקבלו
              </Text>
            </View>

            {/* Right: Icon Circle */}
            <View style={styles.iconCircle}>
              <AppIcon name="mail" size={sizing.iconLg} color={gold.action.default} />
            </View>

          </View>

          {/* Status / Footer / Isolated Error */}
          {openingsState.status === 'loading' ? (
            <View style={styles.cardStatusRow}>
              <ActivityIndicator size="small" color={gold.action.default} />
              <Text style={[typography.caption, styles.statusSubtext]}>טוען נתונים...</Text>
            </View>
          ) : openingsState.status === 'error' ? (
            <View style={styles.isolatedErrorContainer}>
              <View style={styles.partialErrorHeader}>
                <AppIcon name="alert-circle" size={sizing.iconSm} color={colors.statusWarning} />
                <Text style={[typography.titleSmall, styles.partialErrorTitle]}>
                  טעינה חלקית באזור זה
                </Text>
              </View>
              <Text style={[typography.caption, styles.errorText]}>
                {openingsState.errorMessage || 'לא ניתן לטעון את התחום כרגע. אפשר לנסות שוב או להיכנס לאזור.'}
              </Text>
              <Button
                label="נסה שוב"
                variant="secondary"
                onPress={fetchOpeningsDomain}
                style={styles.retryButton}
                testID="retry-button-openings"
              />
            </View>
          ) : (
            <View style={styles.cardFooterRow}>
              <AppIcon name="calendar" size={sizing.iconXs} color={textTokens.onIvory.secondary} />
              <Text style={[typography.caption, styles.footerSubtext]}>
                הספירה אינה זמינה
              </Text>
            </View>
          )}
        </Card>

        {/* DOMAIN 3: Matches (התאמות) */}
        <Card
          variant="surface"
          appearance="ivory"
          pressable
          onPress={() => navigation.navigate('Matches')}
          accessibilityLabel="התאמות, מעבר להצעות שלי"
          style={styles.domainCard}
          testID="domain-card-matches"
        >
          <View style={styles.cardHeaderRow}>

            {/* Left side: Chevron */}
            <View style={styles.leftControlContainer}>
              <AppIcon name="chevron-left" size={sizing.iconMd} color={textTokens.onIvory.secondary} mirrorRTL />
            </View>

            {/* Middle: Title, Subtitle, Status */}
            <View style={styles.titleColumn}>
              <View style={styles.titleBadgeRow}>
                <Text style={[typography.titleLarge, styles.cardTitle]}>התאמות</Text>
                {matchesState.status === 'error' && (
                  <View style={styles.errorBadge}>
                    <Text style={styles.errorBadgeText}>לא זמין</Text>
                  </View>
                )}
                {matchesState.status === 'loading' && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>טוען...</Text>
                  </View>
                )}
              </View>
              <Text style={[typography.bodyMedium, styles.cardDescription]}>
                התאמות פעילות ופרטי הקשר
              </Text>
            </View>

            {/* Right: Icon Circle */}
            <View style={styles.iconCircle}>
              <AppIcon name="navConnections" size={sizing.iconLg} color={gold.action.default} />
            </View>

          </View>

          {/* Isolated Partial Failure Panel (Owner Screen 18 R-10 / S6-A05-F02 layout) */}
          {matchesState.status === 'loading' ? (
            <View style={styles.cardStatusRow}>
              <ActivityIndicator size="small" color={gold.action.default} />
              <Text style={[typography.caption, styles.statusSubtext]}>טוען נתונים...</Text>
            </View>
          ) : matchesState.status === 'error' ? (
            <View style={styles.partialErrorContainer}>
              <View style={styles.partialErrorHeader}>
                <AppIcon name="alert-circle" size={sizing.iconSm} color={colors.statusWarning} />
                <Text style={[typography.titleSmall, styles.partialErrorTitle]}>
                  טעינה חלקית באזור זה
                </Text>
              </View>
              <Text style={[typography.caption, styles.partialErrorMessage]}>
                {matchesState.errorMessage || 'חלק מהנתונים לא נטענו. אפשר לנסות שוב או להיכנס לאזור.'}
              </Text>
              <Button
                label="נסה שוב"
                variant="secondary"
                onPress={fetchMatchesDomain}
                style={styles.retryButton}
                testID="retry-button-matches"
              />
            </View>
          ) : (
            <View style={styles.cardFooterRow}>
              <AppIcon name="calendar" size={sizing.iconXs} color={textTokens.onIvory.secondary} />
              <Text style={[typography.caption, styles.footerSubtext]}>
                הספירה אינה זמינה
              </Text>
            </View>
          )}
        </Card>

      </View>

      {/* Restrained Operational Privacy Footer */}
      <Card variant="surface" appearance="ivory" style={styles.privacyCard}>
        <View style={styles.privacyRow}>
          <View style={styles.privacyIconWrapper}>
            <AppIcon name="shield" size={sizing.iconMd} color={gold.action.default} />
          </View>
          <View style={styles.privacyTextColumn}>
            <Text style={[typography.titleMedium, styles.privacyTitle]}>פרטיות ובטחון</Text>
            <Text style={[typography.caption, styles.privacyBody]}>
              המידע המוצג כאן נשמר בפרטיות מלאה ומוצג רק לך.
            </Text>
          </View>
        </View>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginVertical: spacing.lg,
    alignItems: 'center',
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleText: {
    color: textTokens.onDark.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 28,
  },
  headerFlourish: {
    width: 60,
    height: 2,
    backgroundColor: gold.border.strong,
    marginTop: spacing.xxs,
    borderRadius: radii.full,
  },
  subtitleText: {
    color: textTokens.onDark.secondary,
    textAlign: 'center',
  },
  emptyCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: gold.border.strong,
  },
  emptyHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    color: textTokens.onIvory.primary,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: textTokens.onIvory.secondary,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    minHeight: 36,
  },
  cardsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  domainCard: {
    minHeight: 120,
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: gold.border.strong,
  },
  cardHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: visual.surface.dark,
    borderWidth: 1,
    borderColor: gold.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  titleColumn: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  cardTitle: {
    color: textTokens.onIvory.primary,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: visual.surface.ivoryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  statusBadgeText: {
    ...typography.caption,
    color: textTokens.onIvory.secondary,
    fontWeight: '600',
  },
  errorBadge: {
    backgroundColor: colors.statusErrorBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  errorBadgeText: {
    ...typography.caption,
    color: colors.statusError,
    fontWeight: 'bold',
  },
  cardDescription: {
    color: textTokens.onIvory.secondary,
    marginTop: spacing.xxs,
    textAlign: 'right',
  },
  leftControlContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.xs,
  },
  countBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: visual.surface.ivoryMuted,
    borderWidth: 1,
    borderColor: gold.border.restrained,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    ...typography.titleMedium,
    color: textTokens.onIvory.primary,
    fontWeight: 'bold',
  },
  cardStatusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  statusSubtext: {
    color: textTokens.onIvory.secondary,
  },
  cardFooterRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  footerSubtext: {
    color: textTokens.onIvory.secondary,
    fontSize: 12,
  },
  isolatedErrorContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.statusWarningBg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.statusWarningBorder,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  errorText: {
    color: textTokens.onIvory.primary,
    textAlign: 'right',
  },
  partialErrorContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.statusWarningBg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.statusWarningBorder,
  },
  partialErrorHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  partialErrorTitle: {
    color: colors.statusWarning,
    fontWeight: 'bold',
  },
  partialErrorMessage: {
    color: textTokens.onIvory.primary,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  retryButton: {
    alignSelf: 'flex-start',
    minHeight: 36,
  },
  privacyCard: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: gold.border.restrained,
  },
  privacyRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  privacyIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: visual.surface.dark,
    borderWidth: 1,
    borderColor: gold.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTextColumn: {
    flex: 1,
  },
  privacyTitle: {
    color: textTokens.onIvory.primary,
    textAlign: 'right',
    marginBottom: spacing.xxs,
    fontWeight: 'bold',
  },
  privacyBody: {
    color: textTokens.onIvory.secondary,
    textAlign: 'right',
    lineHeight: 18,
  },
});
