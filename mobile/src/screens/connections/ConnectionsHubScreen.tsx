/**
 * ConnectionsHubScreen — Batch A5 Anchor Runtime Proof
 * REL-02 real USER Connections root with three separate canonical domains:
 * 1. Interest (עניין) -> Lists
 * 2. Opening Messages (הודעות פתיחה) -> OpeningMessages
 * 3. Matches (התאמות) -> Matches
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
import { colors, spacing, radii, sizing } from '../../theme/tokens';
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
      setInterestState({
        status: 'success',
        errorMessage: null,
        isEmpty: Array.isArray(res) && res.length === 0,
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
      setOpeningsState({
        status: 'success',
        errorMessage: null,
        isEmpty: Array.isArray(res) && res.length === 0,
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
      setMatchesState({
        status: 'success',
        errorMessage: null,
        isEmpty: Array.isArray(res) && res.length === 0,
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

  // Full Empty is valid only when all 3 requests completed successfully and all 3 returned empty collections
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
        <Text style={[typography.titleLarge, styles.titleText]}>קשרים</Text>
        <Text style={[typography.bodyMedium, styles.subtitleText]}>
          בחרו תחום להמשך ניהול הקשרים
        </Text>
      </View>

      {/* Full Empty Banner (F03 Textual State) */}
      {isFullEmpty && (
        <Card variant="surface" style={styles.emptyCard} testID="connections-full-empty-banner">
          <View style={styles.emptyHeaderRow}>
            <AppIcon name="info" size={sizing.iconMd} color={colors.textSecondary} />
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
          pressable
          onPress={() => navigation.navigate('Lists')}
          accessibilityLabel="עניין, מעבר לרשימות שלי"
          style={styles.domainCard}
          testID="domain-card-interest"
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <AppIcon name="heart" size={sizing.iconMd} color={colors.textPrimary} />
            </View>
            <View style={styles.titleColumn}>
              <View style={styles.titleBadgeRow}>
                <Text style={[typography.titleLarge, styles.cardTitle]}>עניין</Text>
                <View style={interestState.status === 'error' ? styles.errorBadge : styles.statusBadge}>
                  <Text style={interestState.status === 'error' ? styles.errorBadgeText : styles.statusBadgeText}>
                    {interestState.status === 'error'
                      ? 'לא ניתן לטעון'
                      : interestState.status === 'loading'
                      ? 'טוען...'
                      : 'התחום זמין'}
                  </Text>
                </View>
              </View>
              <Text style={[typography.bodyMedium, styles.cardDescription]}>
                לייקים, מי שהתעניין בי, דיסלייקים ושמירות בצד
              </Text>
            </View>
            <View style={styles.chevronWrapper}>
              <AppIcon name="chevron-left" size={sizing.iconMd} color={colors.textSecondary} mirrorRTL />
            </View>
          </View>

          {interestState.status === 'loading' ? (
            <View style={styles.cardStatusRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[typography.caption, styles.statusSubtext]}>טוען...</Text>
            </View>
          ) : interestState.status === 'error' ? (
            <View style={styles.isolatedErrorContainer}>
              <Text style={[typography.caption, styles.errorText]}>
                {interestState.errorMessage || 'לא ניתן לטעון את התחום כרגע'}
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
              <AppIcon name="info" size={sizing.iconXs} color={colors.textTertiary} />
              <Text style={[typography.caption, styles.footerSubtext]}>
                הספירה אינה זמינה
              </Text>
            </View>
          )}
        </Card>

        {/* DOMAIN 2: Opening Messages (הודעות פתיחה) */}
        <Card
          variant="surface"
          pressable
          onPress={() => navigation.navigate('OpeningMessages')}
          accessibilityLabel="הודעות פתיחה, מעבר להודעות פתיחה"
          style={styles.domainCard}
          testID="domain-card-opening-messages"
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <AppIcon name="mail" size={sizing.iconMd} color={colors.textPrimary} />
            </View>
            <View style={styles.titleColumn}>
              <View style={styles.titleBadgeRow}>
                <Text style={[typography.titleLarge, styles.cardTitle]}>הודעות פתיחה</Text>
                <View style={openingsState.status === 'error' ? styles.errorBadge : styles.statusBadge}>
                  <Text style={openingsState.status === 'error' ? styles.errorBadgeText : styles.statusBadgeText}>
                    {openingsState.status === 'error'
                      ? 'לא ניתן לטעון'
                      : openingsState.status === 'loading'
                      ? 'טוען...'
                      : 'התחום זמין'}
                  </Text>
                </View>
              </View>
              <Text style={[typography.bodyMedium, styles.cardDescription]}>
                הודעות פתיחה שנשלחו והתקבלו
              </Text>
            </View>
            <View style={styles.chevronWrapper}>
              <AppIcon name="chevron-left" size={sizing.iconMd} color={colors.textSecondary} mirrorRTL />
            </View>
          </View>

          {openingsState.status === 'loading' ? (
            <View style={styles.cardStatusRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[typography.caption, styles.statusSubtext]}>טוען...</Text>
            </View>
          ) : openingsState.status === 'error' ? (
            <View style={styles.isolatedErrorContainer}>
              <Text style={[typography.caption, styles.errorText]}>
                {openingsState.errorMessage || 'לא ניתן לטעון את התחום כרגע'}
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
              <AppIcon name="info" size={sizing.iconXs} color={colors.textTertiary} />
              <Text style={[typography.caption, styles.footerSubtext]}>
                הספירה אינה זמינה
              </Text>
            </View>
          )}
        </Card>

        {/* DOMAIN 3: Matches (התאמות) */}
        <Card
          variant="surface"
          pressable
          onPress={() => navigation.navigate('Matches')}
          accessibilityLabel="התאמות, מעבר להצעות שלי"
          style={styles.domainCard}
          testID="domain-card-matches"
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <AppIcon name="navConnections" size={sizing.iconMd} color={colors.textPrimary} />
            </View>
            <View style={styles.titleColumn}>
              <View style={styles.titleBadgeRow}>
                <Text style={[typography.titleLarge, styles.cardTitle]}>התאמות</Text>
                <View style={matchesState.status === 'error' ? styles.errorBadge : styles.statusBadge}>
                  <Text style={matchesState.status === 'error' ? styles.errorBadgeText : styles.statusBadgeText}>
                    {matchesState.status === 'error'
                      ? 'לא ניתן לטעון'
                      : matchesState.status === 'loading'
                      ? 'טוען...'
                      : 'התחום זמין'}
                  </Text>
                </View>
              </View>
              <Text style={[typography.bodyMedium, styles.cardDescription]}>
                התאמות והיסטוריית קשרים
              </Text>
            </View>
            <View style={styles.chevronWrapper}>
              <AppIcon name="chevron-left" size={sizing.iconMd} color={colors.textSecondary} mirrorRTL />
            </View>
          </View>

          {/* Isolated Partial Failure Panel (S6-A05-F02 layout) */}
          {matchesState.status === 'loading' ? (
            <View style={styles.cardStatusRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[typography.caption, styles.statusSubtext]}>טוען...</Text>
            </View>
          ) : matchesState.status === 'error' ? (
            <View style={styles.partialErrorContainer}>
              <View style={styles.partialErrorHeader}>
                <AppIcon name="alert-circle" size={sizing.iconSm} color={colors.statusError} />
                <Text style={[typography.titleSmall, styles.partialErrorTitle]}>
                  טעינה חלקית באזור זה
                </Text>
              </View>
              <Text style={[typography.caption, styles.partialErrorMessage]}>
                {matchesState.errorMessage || 'לא ניתן לטעון את התחום כרגע. אפשר לנסות שוב או להיכנס לאזור.'}
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
              <AppIcon name="info" size={sizing.iconXs} color={colors.textTertiary} />
              <Text style={[typography.caption, styles.footerSubtext]}>
                הספירה אינה זמינה
              </Text>
            </View>
          )}
        </Card>

      </View>

      {/* Restrained Operational Privacy Footer */}
      <Card variant="surface" style={styles.privacyCard}>
        <View style={styles.privacyRow}>
          <View style={styles.privacyIconWrapper}>
            <AppIcon name="shield" size={sizing.iconLg} color={colors.accent} />
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
  emptyCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceSubtle,
  },
  emptyHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    color: colors.textPrimary,
  },
  emptySubtext: {
    color: colors.textSecondary,
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
    minHeight: 110,
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  iconCircle: {
    width: sizing.minTouchTarget,
    height: sizing.minTouchTarget,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
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
    color: colors.textPrimary,
  },
  statusBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  statusBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
    marginTop: spacing.xxs,
    textAlign: 'right',
  },
  chevronWrapper: {
    paddingLeft: spacing.xs,
    justifyContent: 'center',
    minWidth: sizing.minTouchTarget,
    alignItems: 'center',
  },
  cardStatusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  statusSubtext: {
    color: colors.textTertiary,
  },
  cardFooterRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  footerSubtext: {
    color: colors.textTertiary,
  },
  isolatedErrorContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.statusErrorBg,
    borderRadius: radii.sm,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  errorText: {
    color: colors.statusError,
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
  },
  partialErrorMessage: {
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  retryButton: {
    alignSelf: 'flex-start',
    minHeight: 36,
  },
  privacyCard: {
    backgroundColor: colors.surfaceSubtle,
    marginBottom: spacing.xl,
  },
  privacyRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  privacyIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTextColumn: {
    flex: 1,
  },
  privacyTitle: {
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: spacing.xxs,
  },
  privacyBody: {
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 20,
  },
});
