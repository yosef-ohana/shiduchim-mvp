import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Card } from '../../components/foundation/Card';
import { Button } from '../../components/foundation/Button';
import { IconButton } from '../../components/foundation/IconButton';
import { StateSurface } from '../../components/foundation/StateSurface';
import { ResponsiveActionGroup } from '../../components/foundation/ResponsiveActionGroup';
import { AppIcon } from '../../components/foundation/AppIcon';
import { BidiText } from '../../components/foundation/BidiText';
import { CandidateCard } from '../../components/CandidateCard';
import { ActionButtons } from '../../components/ActionButtons';
import { OpeningMessageComposer } from '../../components/OpeningMessageComposer';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { getDiscoverCandidates } from '../../api/discoverApi';
import { getMyWeddings } from '../../api/weddingsApi';
import { sendOpeningMessage } from '../../api/openingMessagesApi';
import { getMatches } from '../../api/matchesApi';
import { PublicUserCardResponse, UserWeddingResponse } from '../../types/api';
import { formatDisplayDate } from '../../utils/displayLabels';

export type ScreenState =
  | 'LOADING'
  | 'STAFF_DENIED'
  | 'STALE_WEDDING'
  | 'PARTICIPANT_INACTIVE'
  | 'ACCESS_DENIED'
  | 'CONTEXT_NOT_FOUND'
  | 'TRANSPORT_ERROR'
  | 'EMPTY'
  | 'LOADED';

export const DiscoverScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { pool = 'GLOBAL', weddingId } = route.params || {};

  const [candidates, setCandidates] = useState<PublicUserCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>('LOADING');
  const [isPartialError, setIsPartialError] = useState(false);
  const [weddingSnapshot, setWeddingSnapshot] = useState<UserWeddingResponse | null>(null);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [composerTargetId, setComposerTargetId] = useState<number | null>(null);

  // Staff security guard
  const isStaffUser = user?.role === 'ADMIN' || user?.role === 'EVENT_MANAGER';

  const fetchCandidates = useCallback(async (showRefreshIndicator = false) => {
    if (isStaffUser) {
      setScreenState('STAFF_DENIED');
      return;
    }

    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setScreenState('LOADING');
    }
    setIsPartialError(false);

    // 1. If WEDDING pool, fetch wedding metadata to inspect authoritative typed weddingStatus & participantStatus
    if (pool === 'WEDDING' && weddingId) {
      try {
        const userWeddings = await getMyWeddings();
        const found = userWeddings.find((w) => w.weddingId === weddingId);
        if (found) {
          setWeddingSnapshot(found);

          // Rule A: Authoritative selected UserWeddingResponse lifecycle status check
          if (found.weddingStatus === 'CLOSED' || found.weddingStatus === 'CANCELLED' || found.weddingStatus === 'DELETED') {
            setScreenState('STALE_WEDDING');
            setLoading(false);
            setRefreshing(false);
            return;
          }

          // Rule B: Authoritative participantStatus === 'REMOVED' check
          if (found.participantStatus === 'REMOVED') {
            setScreenState('PARTICIPANT_INACTIVE');
            setLoading(false);
            setRefreshing(false);
            return;
          }
        }
      } catch (wErr) {
        // Ignore metadata fetch error; discover API request will execute
      }
    }

    // 2. Fetch candidates from discover API (state selected strictly without text-message parsing)
    try {
      const response = await getDiscoverCandidates({
        pool,
        weddingId: pool === 'WEDDING' ? weddingId : undefined,
        limit: 20,
      });
      const items = response.items || [];
      setCandidates(items);
      setScreenState(items.length === 0 ? 'EMPTY' : 'LOADED');
    } catch (err: any) {
      const status = err.response?.status;

      // Rule C: Generic HTTP 403 Forbidden -> ACCESS_DENIED
      if (status === 403) {
        setScreenState('ACCESS_DENIED');
      }
      // Rule D: Generic HTTP 404 Not Found -> CONTEXT_NOT_FOUND
      else if (status === 404) {
        setScreenState('CONTEXT_NOT_FOUND');
      }
      // Rule E: Network / Timeout / 5xx -> TRANSPORT_ERROR
      else if (status === 500 || status === 502 || status === 503 || err.code === 'ECONNABORTED' || !err.response) {
        if (candidates.length > 0) {
          setIsPartialError(true);
          setScreenState('LOADED');
        } else {
          setScreenState('TRANSPORT_ERROR');
        }
      }
      // Fallback
      else {
        setScreenState('TRANSPORT_ERROR');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pool, weddingId, isStaffUser, candidates.length]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleRefresh = () => {
    fetchCandidates(true);
  };

  const handleViewProfile = (candidateUserId: number) => {
    navigation.navigate('CandidateProfile', {
      userId: candidateUserId,
      sourceType: 'DISCOVER',
      poolType: pool,
      weddingId: pool === 'WEDDING' ? weddingId : undefined,
      contextLabel: pool === 'WEDDING' ? (weddingSnapshot?.weddingName || 'מאגר חתונה') : 'מאגר גלובלי',
      sourceContext: 'DISCOVER',
    });
  };

  // Header Component (Neutral Authority-Safe Copy)
  const renderHeader = () => {
    if (pool === 'WEDDING') {
      const wName = weddingSnapshot?.weddingName || 'מאגר חתונה';
      const details = [weddingSnapshot?.city, weddingSnapshot?.weddingDate ? formatDisplayDate(weddingSnapshot.weddingDate) : null]
        .filter(Boolean)
        .join(' — ');

      return (
        <Card variant="outlined" style={styles.contextHeaderCard}>
          <View style={styles.contextHeaderTop}>
            <View style={styles.contextBadge}>
              <AppIcon name="calendar" size={sizing.iconSm} color={colors.accent} />
              <Text style={[typography.captionBold, { color: colors.accent }]}>
                מאגר חתונה
              </Text>
            </View>
            <IconButton icon="search" variant="plain" onPress={handleRefresh} accessibilityLabel="רענון" />
          </View>

          <Text style={[typography.titleMedium, styles.contextTitle]}>
            {wName}
          </Text>
          {details ? (
            <BidiText value={details} kind="date" style={[typography.bodyMedium, styles.contextSubtitle]} />
          ) : null}

          <View style={styles.contextFooterRow}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {screenState === 'STALE_WEDDING' ? 'מאגר חתונה לא פעיל' : 'מאגר חתונה'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PoolSelection')}>
              <Text style={[typography.captionBold, { color: colors.accent }]}>
                שינוי מאגר
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      );
    }

    // Global Pool Header (Neutral Authority-Safe Copy — No unproven "active" or readiness claims)
    return (
      <Card variant="outlined" style={styles.contextHeaderCard}>
        <View style={styles.contextHeaderTop}>
          <View style={styles.contextBadge}>
            <AppIcon name="navDiscover" size={sizing.iconSm} color={colors.primary} />
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              המאגר הגלובלי
            </Text>
          </View>
          <IconButton icon="search" variant="plain" onPress={handleRefresh} accessibilityLabel="רענן" />
        </View>

        <Text style={[typography.titleMedium, styles.contextTitle]}>
          גילוי מועמדים גלובלי
        </Text>
        <Text style={[typography.bodyMedium, styles.contextSubtitle]}>
          מועמדים המתאימים לפרופיל ולזכאות שלך
        </Text>

        <View style={styles.contextFooterRow}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            המאגר הגלובלי
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PoolSelection')}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              חזרה לבחירת מאגר
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  // 1. Staff Guard
  if (screenState === 'STAFF_DENIED' || isStaffUser) {
    return (
      <ScreenContainer safeEdges={['bottom', 'left', 'right']}>
        <StateSurface
          kind="denied"
          title="אין הרשאת גישה למאגר"
          message="משתמשי ניהול ואירועים אינם מורשים להשתמש בממשק גילוי מועמדים."
          primaryAction={{
            label: 'חזרה למסך הראשי',
            onPress: () => navigation.goBack(),
          }}
        />
      </ScreenContainer>
    );
  }

  // 2. Loading State
  if (loading || screenState === 'LOADING') {
    return (
      <ScreenContainer safeEdges={['bottom', 'left', 'right']}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.bodyMedium, styles.stateText]}>
            מחפש התאמות תואמות במאגר...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // 3. Stale Wedding State (Authoritative typed lifecycle status CLOSED / CANCELLED / DELETED)
  if (screenState === 'STALE_WEDDING') {
    return (
      <ScreenContainer safeEdges={['bottom', 'left', 'right']}>
        {renderHeader()}
        <View style={styles.stateWrapper}>
          <StateSurface
            kind="stale"
            title="המאגר החתונתי אינו זמין כעת"
            message="מאגר הגילוי עבור חתונה זו אינו פעיל כעת. ייתכן שהחתונה הסתיימה או נעצרה. לא ניתן להציג מועמדים בזמן זה."
            testID="stale-wedding-surface"
          />

          <Card variant="surface" style={styles.actionsCard}>
            <ResponsiveActionGroup alignment="stacked" style={styles.fullWidthActions}>
              <Button
                label="בדיקת מוכנות"
                onPress={() => fetchCandidates(false)}
                variant="primary"
                iconStart="search"
              />
              <Button
                label="תיקון מוכנות"
                onPress={() => navigation.navigate('Profile', { focusSection: 'profile' })}
                variant="secondary"
                iconStart="edit"
              />
              <Button
                label="החתונות שלי"
                onPress={() => navigation.navigate('UserTabs', { screen: 'WeddingsRoot' })}
                variant="secondary"
                iconStart="calendar"
              />
              <Button
                label="חזרה למקור"
                onPress={() => navigation.navigate('PoolSelection')}
                variant="secondary"
                iconStart="arrow-right"
              />
            </ResponsiveActionGroup>
          </Card>
        </View>
      </ScreenContainer>
    );
  }

  // 4. Participant Inactive State (Authoritative typed participantStatus === 'REMOVED')
  if (screenState === 'PARTICIPANT_INACTIVE') {
    return (
      <ScreenContainer safeEdges={['bottom', 'left', 'right']}>
        {renderHeader()}
        <View style={styles.stateWrapper}>
          <StateSurface
            kind="denied"
            title="אינך משתתף פעיל בחתונה זו"
            message="השתתפותך בחתונה זו אינה פעילה כעת. אינך מורשה לצפות במועמדים במאגר חתונה זה."
            primaryAction={{
              label: 'חזרה לבחירת מאגר',
              onPress: () => navigation.navigate('PoolSelection'),
              icon: 'arrow-right',
            }}
            secondaryAction={{
              label: 'החתונות שלי',
              onPress: () => navigation.navigate('UserTabs', { screen: 'WeddingsRoot' }),
              icon: 'calendar',
            }}
          />
        </View>
      </ScreenContainer>
    );
  }

  // 5. Generic HTTP 403 Access Denied State (NO Profile repair CTA)
  if (screenState === 'ACCESS_DENIED') {
    return (
      <ScreenContainer safeEdges={['bottom', 'left', 'right']}>
        {renderHeader()}
        <View style={styles.stateWrapper}>
          <StateSurface
            kind="denied"
            title="אין הרשאת גישה למאגר המבוקש"
            message="אינך מורשה לגשת למאגר מועמדים זה במצב הנוכחי."
            primaryAction={{
              label: 'חזרה לבחירת מאגר',
              onPress: () => navigation.navigate('PoolSelection'),
              icon: 'arrow-right',
            }}
            secondaryAction={
              pool === 'WEDDING'
                ? {
                    label: 'החתונות שלי',
                    onPress: () => navigation.navigate('UserTabs', { screen: 'WeddingsRoot' }),
                    icon: 'calendar',
                  }
                : undefined
            }
          />
        </View>
      </ScreenContainer>
    );
  }

  // 6. Generic HTTP 404 Context Not Found State (Safe unavailable treatment; no false lifecycle claims)
  if (screenState === 'CONTEXT_NOT_FOUND') {
    return (
      <ScreenContainer safeEdges={['bottom', 'left', 'right']}>
        {renderHeader()}
        <View style={styles.stateWrapper}>
          <StateSurface
            kind="error"
            title="מאגר המועמדים לא נמצא"
            message="מאגר המועמדים המבוקש לא נמצא או שאינו זמין כעת."
            primaryAction={{
              label: 'רענון',
              onPress: () => fetchCandidates(false),
              icon: 'search',
            }}
            secondaryAction={{
              label: 'חזרה לבחירת מאגר',
              onPress: () => navigation.navigate('PoolSelection'),
              icon: 'arrow-right',
            }}
          />
        </View>
      </ScreenContainer>
    );
  }

  // 7. Transport / Network / 5xx Error State
  if (screenState === 'TRANSPORT_ERROR') {
    return (
      <ScreenContainer safeEdges={['bottom', 'left', 'right']}>
        {renderHeader()}
        <View style={styles.stateWrapper}>
          <StateSurface
            kind="error"
            title="שגיאת תקשורת"
            message="חיבור לרשת נכשל או שהשרת אינו מגיב. אנא נסו שוב."
            primaryAction={{
              label: 'נסה שוב',
              onPress: () => fetchCandidates(false),
              icon: 'search',
            }}
            secondaryAction={{
              label: 'חזרה לבחירת מאגר',
              onPress: () => navigation.navigate('PoolSelection'),
              icon: 'arrow-right',
            }}
          />
        </View>
      </ScreenContainer>
    );
  }

  // 8. Empty Candidate Result State (Authoritative HTTP 200 with 0 candidates)
  if (screenState === 'EMPTY' || candidates.length === 0) {
    return (
      <ScreenContainer safeEdges={['bottom', 'left', 'right']}>
        {renderHeader()}

        {isPartialError && (
          <StateSurface
            kind="partial"
            title="מידע נטען חלקית"
            message="חלק מהמידע נטען חלקית. אפשר לרענן את התוצאות או לחזור לבחירת מאגר."
            style={styles.partialSurface}
          />
        )}

        <StateSurface
          kind="empty"
          title="אין כרגע מועמדים זמינים"
          message="המאגר המבוקש פעיל, אך כרגע לא נמצאו מועמדים זמינים התואמים את הגדרות החיפוש והזכאות שלך."
          primaryAction={{
            label: 'רענון תוצאות',
            onPress: handleRefresh,
            icon: 'search',
          }}
          secondaryAction={{
            label: 'חזרה לבחירת מאגר',
            onPress: () => navigation.navigate('PoolSelection'),
            icon: 'arrow-right',
          }}
        />

        <View style={styles.footerNoteContainer}>
          <AppIcon name="info" size={sizing.iconSm} color={colors.textSecondary} />
          <Text style={[typography.caption, styles.footerNoteText]}>
            אם יתווספו מועמדים זמינים הם יוצגו כאן.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // 9. Loaded Candidate List State (Authoritative HTTP 200 with candidates > 0)
  return (
    <ScreenContainer safeEdges={['bottom', 'left', 'right']}>
      {matchMessage && (
        <View style={styles.matchBanner}>
          <Text style={styles.matchBannerText}>{matchMessage}</Text>
          <Text style={styles.matchBannerClose} onPress={() => setMatchMessage(null)}>
            ✕
          </Text>
        </View>
      )}

      {isPartialError && (
        <StateSurface
          kind="partial"
          title="מידע חלקי"
          message="חלק מהמידע רענן בצורה חלקית. ניתן לנסות לרענן שוב."
          style={styles.partialSurface}
        />
      )}

      <FlatList
        data={candidates}
        keyExtractor={(item) => item.userId.toString()}
        ListHeaderComponent={
          <View style={styles.listHeaderArea}>
            {renderHeader()}
            <Text style={[typography.heading, styles.candidatesSectionTitle]}>
              מועמדים במאגר
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CandidateCard
            candidate={item}
            onViewProfile={() => handleViewProfile(item.userId)}
            actionButtons={
              <ActionButtons
                targetUserId={item.userId}
                poolType={pool}
                weddingId={weddingId}
                onActionCompleted={(matchCreated, matchId) => {
                  if (matchCreated) {
                    if (matchId) {
                      Alert.alert('נוצרה התאמה!', 'נוצרה התאמה! אפשר להמשיך לצ׳אט.', [
                        { text: 'סגור', style: 'cancel' },
                        {
                          text: 'מעבר לצ׳אט',
                          onPress: () => navigation.navigate('Chat', { matchId }),
                        },
                      ]);
                    } else {
                      setMatchMessage(`יש התאמה עם ${item.fullName}!`);
                    }
                  }
                  setCandidates((prev) => prev.filter((c) => c.userId !== item.userId));
                }}
                onOpeningMessagePress={() => setComposerTargetId(item.userId)}
                hasOpenOpeningConversation={item.hasOpenOpeningConversation}
                openingConversationDirection={item.openingConversationDirection}
              />
            }
          />
        )}
        contentContainerStyle={styles.listContentContainer}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
      />

      <OpeningMessageComposer
        visible={composerTargetId !== null}
        onClose={() => setComposerTargetId(null)}
        onSend={async (content) => {
          if (composerTargetId !== null) {
            try {
              await sendOpeningMessage(composerTargetId, {
                content,
                poolType: pool,
                weddingId,
              });
              setMatchMessage('הודעת הפתיחה נשלחה. כעת ממתינים לתגובה מהצד השני.');
              setCandidates((prev) =>
                prev.map((c) =>
                  c.userId === composerTargetId
                    ? { ...c, hasOpenOpeningConversation: true, openingConversationDirection: 'SENT' }
                    : c
                )
              );
            } catch (err: any) {
              const isStaleMatch =
                err.response?.status === 409 &&
                (err.response?.data?.message?.toLowerCase().includes('active match') ||
                  err.response?.data?.message?.toLowerCase().includes('match already exists'));
              if (isStaleMatch) {
                try {
                  const activeMatches = await getMatches();
                  const match = activeMatches.find((m) => m.otherUserId === composerTargetId);
                  if (match && match.matchId) {
                    Alert.alert('כבר נוצרה התאמה', 'כבר נוצרה התאמה עם משתמש זה. אפשר להמשיך בצ׳אט.', [
                      { text: 'סגור', style: 'cancel' },
                      {
                        text: 'מעבר לצ׳אט',
                        onPress: () => navigation.navigate('Chat', { matchId: match.matchId }),
                      },
                    ]);
                  } else {
                    Alert.alert('כבר נוצרה התאמה', 'כבר נוצרה התאמה עם משתמש זה. אפשר להמשיך בצ׳אט.', [
                      { text: 'סגור', style: 'cancel' },
                      {
                        text: 'מעבר לרשימת ההתאמות',
                        onPress: () => navigation.navigate('Matches'),
                      },
                    ]);
                  }
                } catch (fetchErr) {
                  Alert.alert('כבר נוצרה התאמה', 'כבר נוצרה התאמה עם משתמש זה. אפשר להמשיך בצ׳אט.');
                }
              } else {
                throw err;
              }
            }
          }
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  stateText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contextHeaderCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  contextHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contextTitle: {
    color: colors.textPrimary,
    marginVertical: spacing.xxs,
  },
  contextSubtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  contextFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  stateWrapper: {
    marginVertical: spacing.sm,
  },
  actionsCard: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  fullWidthActions: {
    width: '100%',
  },
  partialSurface: {
    marginBottom: spacing.md,
  },
  footerNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    marginVertical: spacing.md,
  },
  footerNoteText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listHeaderArea: {
    marginBottom: spacing.sm,
  },
  candidatesSectionTitle: {
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  listContentContainer: {
    paddingBottom: spacing.xxl,
  },
  matchBanner: {
    backgroundColor: colors.statusSuccessBg,
    borderColor: colors.statusSuccessBorder,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchBannerText: {
    color: colors.statusSuccess,
    flex: 1,
    textAlign: 'right',
    fontWeight: '700',
  },
  matchBannerClose: {
    color: colors.statusSuccess,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
});
