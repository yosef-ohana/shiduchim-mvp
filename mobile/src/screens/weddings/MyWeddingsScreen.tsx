import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { getMyWeddings } from '../../api/weddingsApi';
import { UserWeddingResponse } from '../../types/api';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { formatDisplayDate, getParticipantStatusLabel } from '../../utils/displayLabels';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  spacing,
  radii,
  sizing,
  visual,
  text,
  gold,
  status,
} from '../../theme/tokens';
import { FONT_KEYS } from '../../theme/typography';

interface StatusBadgeConfig {
  label: string;
  dotColor: string;
  textColor: string;
}

const getStatusConfig = (weddingStatus: string): StatusBadgeConfig => {
  switch (weddingStatus) {
    case 'ACTIVE':
      return {
        label: 'פעילה',
        dotColor: status.success.onIvory,
        textColor: status.success.onIvory,
      };
    case 'CLOSED':
      return {
        label: 'סגורה לצפייה בלבד',
        dotColor: text.onIvory.secondary,
        textColor: text.onIvory.secondary,
      };
    case 'CANCELLED':
      return {
        label: 'מבוטלת לצפייה בלבד',
        dotColor: status.error.onIvory,
        textColor: status.error.onIvory,
      };
    default:
      return {
        label: weddingStatus,
        dotColor: text.onIvory.secondary,
        textColor: text.onIvory.secondary,
      };
  }
};

const RefreshErrorBanner: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <View style={styles.refreshErrorCard}>
      <View style={styles.refreshErrorHeader}>
        <AppIcon name="alert-circle" size={sizing.iconMd} color={status.error.onIvory} />
        <Text style={styles.refreshErrorTitle}>לא הצלחנו לרענן</Text>
      </View>
      <Text style={styles.refreshErrorText}>המידע האחרון נשאר מוצג</Text>
      <Text style={styles.refreshErrorText}>אפשר לנסות שוב בלי לאבד הקשר</Text>
      <Pressable
        style={styles.retryPillButton}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="נסה שוב לרענן"
      >
        <AppIcon name="refresh" size={sizing.iconXs} color={text.onDark.primary} />
        <Text style={styles.retryPillText}>נסה שוב</Text>
      </Pressable>
    </View>
  );
};

export const MyWeddingsScreen = () => {
  const navigation = useNavigation<any>();
  const [weddings, setWeddings] = useState<UserWeddingResponse[] | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const weddingsRef = useRef<UserWeddingResponse[] | null>(null);
  weddingsRef.current = weddings;

  const fetchWeddings = useCallback(async (isRefresh = false, isMounted = { current: true }) => {
    const hasData = weddingsRef.current !== null;
    if (isRefresh || hasData) {
      setIsRefreshing(true);
      setRefreshError(null);
    } else {
      setIsInitialLoading(true);
      setInitialError(null);
    }

    try {
      const data = await getMyWeddings();
      if (isMounted.current) {
        setWeddings(data);
        setInitialError(null);
        setRefreshError(null);
      }
    } catch (error: any) {
      console.error('[MyWeddingsScreen] fetch error:', error);
      const friendlyError = getFriendlyErrorMessage(error, 'טעינת החתונות נכשלה.');
      if (isMounted.current) {
        if (weddingsRef.current !== null) {
          setRefreshError(friendlyError);
        } else {
          setInitialError(friendlyError);
        }
      }
    } finally {
      if (isMounted.current) {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const isMounted = { current: true };
      fetchWeddings(weddingsRef.current !== null, isMounted);
      return () => {
        isMounted.current = false;
      };
    }, [fetchWeddings])
  );

  const handleWeddingPress = (item: UserWeddingResponse) => {
    navigation.navigate('JoinWedding', {
      weddingId: item.weddingId,
      weddingSnapshot: item,
      source: 'myWeddings',
    });
  };

  const renderItem = ({ item }: { item: UserWeddingResponse }) => {
    const statusConfig = getStatusConfig(item.weddingStatus);
    const formattedDate = formatDisplayDate(item.weddingDate).replace(/\//g, '.');
    const participantLabel =
      item.participantStatus === 'ACTIVE'
        ? 'משתתף פעיל'
        : `משתתף ${getParticipantStatusLabel(item.participantStatus)}`;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => handleWeddingPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.weddingName}, ${statusConfig.label}`}
        testID={`wedding-card-${item.weddingId}`}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.weddingName}>
            {item.weddingName}
          </Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.dotColor }]} />
            <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.metadataCol}>
            {item.city ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaValue}>{item.city}</Text>
                <Text style={styles.metaLabel}>מיקום</Text>
              </View>
            ) : null}

            {item.weddingDate ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaValue}>{formattedDate}</Text>
                <Text style={styles.metaLabel}>תאריך</Text>
              </View>
            ) : null}

            {item.participantStatus ? (
              <Text style={styles.participantText}>{participantLabel}</Text>
            ) : null}
          </View>

          <View style={styles.chevronContainer}>
            <AppIcon name="chevron-left" size={sizing.iconMd} color={gold.border.strong} />
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        {refreshError && (
          <RefreshErrorBanner onRetry={() => fetchWeddings(true)} />
        )}
        <View style={styles.emptyContent}>
          <View style={styles.ringIconCircle}>
            <AppIcon name="navWeddings" size={40} color={gold.border.strong} />
          </View>
          <Text style={styles.emptyTitle}>עדיין אין לך חתונות</Text>
          <Text style={styles.emptySubtitle}>
            אפשר להצטרף לחתונה באמצעות מסך ההצטרפות
          </Text>
        </View>
      </View>
    );
  };

  if (isInitialLoading && weddings === null) {
    return (
      <ScreenContainer appearance="darkCanvas" testID="my-weddings-screen">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={gold.action.default} />
        </View>
        <View style={styles.bottomBar}>
          <Button
            label="הצטרפות לחתונה"
            visualAppearance="gold"
            fullWidth
            onPress={() => navigation.navigate('JoinWedding')}
            testID="join-wedding-cta"
          />
        </View>
      </ScreenContainer>
    );
  }

  if (initialError && weddings === null) {
    return (
      <ScreenContainer appearance="darkCanvas" testID="my-weddings-screen">
        <View style={styles.centerContainer}>
          <AppIcon name="alert-circle" size={48} color={status.error.onIvory} />
          <Text style={styles.initialErrorTitle}>לא הצלחנו לטעון את החתונות</Text>
          <Text style={styles.initialErrorText}>{initialError}</Text>
          <Button
            label="נסה שוב"
            variant="secondary"
            onPress={() => fetchWeddings(false)}
            iconStart="refresh"
            style={styles.initialRetryButton}
          />
        </View>
        <View style={styles.bottomBar}>
          <Button
            label="הצטרפות לחתונה"
            visualAppearance="gold"
            fullWidth
            onPress={() => navigation.navigate('JoinWedding')}
            testID="join-wedding-cta"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer appearance="darkCanvas" testID="my-weddings-screen">
      <View style={styles.contentWrapper}>
        {weddings && weddings.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={weddings || []}
            keyExtractor={(item) => String(item.weddingId)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              refreshError ? (
                <RefreshErrorBanner onRetry={() => fetchWeddings(true)} />
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchWeddings(true)}
                tintColor={gold.action.default}
                colors={[gold.action.default]}
              />
            }
          />
        )}
      </View>
      <View style={styles.bottomBar}>
        <Button
          label="הצטרפות לחתונה"
          visualAppearance="gold"
          fullWidth
          onPress={() => navigation.navigate('JoinWedding')}
          testID="join-wedding-cta"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: visual.surface.ivory,
    borderWidth: 1,
    borderColor: gold.border.restrained,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: sizing.minTouchTarget,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  weddingName: {
    flex: 1,
    flexShrink: 1,
    fontSize: 18,
    fontFamily: FONT_KEYS.bold,
    fontWeight: '700',
    color: text.onIvory.primary,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: visual.surface.ivoryHighlight,
    borderWidth: 1,
    borderColor: gold.border.restrained,
    borderRadius: radii.full,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONT_KEYS.medium,
    fontWeight: '500',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metadataCol: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaValue: {
    fontSize: 14,
    fontFamily: FONT_KEYS.bold,
    fontWeight: '700',
    color: text.onIvory.primary,
    flexShrink: 1,
  },
  metaLabel: {
    fontSize: 14,
    fontFamily: FONT_KEYS.regular,
    fontWeight: '400',
    color: text.onIvory.secondary,
    flexShrink: 1,
  },
  participantText: {
    fontSize: 14,
    fontFamily: FONT_KEYS.regular,
    fontWeight: '400',
    color: text.onIvory.secondary,
    textAlign: 'right',
    flexShrink: 1,
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingStart: spacing.xs,
  },
  bottomBar: {
    paddingVertical: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  initialErrorTitle: {
    fontSize: 18,
    fontFamily: FONT_KEYS.bold,
    fontWeight: '700',
    color: text.onDark.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  initialErrorText: {
    fontSize: 14,
    fontFamily: FONT_KEYS.regular,
    fontWeight: '400',
    color: text.onDark.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  initialRetryButton: {
    minWidth: 140,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  ringIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: gold.border.strong,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: FONT_KEYS.bold,
    fontWeight: '700',
    color: text.onDark.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: FONT_KEYS.regular,
    fontWeight: '400',
    color: text.onDark.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  refreshErrorCard: {
    backgroundColor: visual.surface.ivory,
    borderWidth: 1,
    borderColor: gold.border.restrained,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  refreshErrorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  refreshErrorTitle: {
    fontSize: 18,
    fontFamily: FONT_KEYS.bold,
    fontWeight: '700',
    color: text.onIvory.primary,
    textAlign: 'right',
  },
  refreshErrorText: {
    fontSize: 14,
    fontFamily: FONT_KEYS.regular,
    fontWeight: '400',
    color: text.onIvory.secondary,
    textAlign: 'right',
    lineHeight: 20,
  },
  retryPillButton: {
    backgroundColor: visual.surface.dark,
    borderRadius: radii.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    minHeight: sizing.minTouchTarget,
  },
  retryPillText: {
    fontSize: 14,
    fontFamily: FONT_KEYS.semiBold,
    fontWeight: '600',
    color: text.onDark.primary,
  },
});
