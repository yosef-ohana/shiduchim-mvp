import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { CandidateCard } from '../../components/CandidateCard';
import { theme } from '../../theme/theme';
import { getDiscoverCandidates } from '../../api/discoverApi';
import { PublicUserCardResponse } from '../../types/api';
import { ActionButtons } from '../../components/ActionButtons';
import { OpeningMessageComposer } from '../../components/OpeningMessageComposer';
import { sendOpeningMessage } from '../../api/openingMessagesApi';
import { getMatches } from '../../api/matchesApi';

export const DiscoverScreen = ({ route, navigation }: any) => {
  const { pool, weddingId } = route.params || {};
  const [candidates, setCandidates] = useState<PublicUserCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [composerTargetId, setComposerTargetId] = useState<number | null>(null);

  const fetchCandidates = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await getDiscoverCandidates({
        pool,
        weddingId,
        limit: 20,
      });
      setCandidates(response.items || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'טעינת המועמדים לחיפוש נכשלה. אנא נסו שוב.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [pool, weddingId]);

  const handleRefresh = () => {
    fetchCandidates(true);
  };

  const handleViewProfile = (userId: number) => {
    navigation.navigate('CandidateProfile', {
      userId,
      sourceType: 'DISCOVER',
      poolType: pool,
      weddingId: pool === 'WEDDING' ? weddingId : undefined,
    });
  };

  if (loading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.stateText}>מחפש התאמות תואמות...</Text>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <AppButton title="נסה שוב" onPress={() => fetchCandidates(false)} style={styles.retryButton} />
      </Screen>
    );
  }

  return (
    <Screen>
      {matchMessage && (
        <View style={styles.matchBanner}>
          <Text style={styles.matchBannerText}>{matchMessage}</Text>
          <Text style={styles.matchBannerClose} onPress={() => setMatchMessage(null)}>✕</Text>
        </View>
      )}
      <FlatList
        data={candidates}
        keyExtractor={(item) => item.userId.toString()}
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
                      Alert.alert(
                        'נוצרה התאמה!',
                        'נוצרה התאמה! אפשר להמשיך לצ׳אט.',
                        [
                          { text: 'סגור', style: 'cancel' },
                          {
                            text: 'מעבר לצ׳אט',
                            onPress: () => navigation.navigate('Chat', { matchId }),
                          },
                        ]
                      );
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
        contentContainerStyle={styles.listContainer}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>לא נמצאו מועמדים מתאימים כרגע</Text>
            <Text style={styles.emptySubtitle}>
              אין כרגע מועמדים מתאימים במאגר החיפוש הזה.
            </Text>
            <AppButton title="רענן" onPress={handleRefresh} style={styles.refreshButton} />
          </View>
        }
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
                weddingId: weddingId,
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
              const isStaleMatch = err.response?.status === 409 && (
                err.response?.data?.message?.toLowerCase().includes("active match") ||
                err.response?.data?.message?.toLowerCase().includes("match already exists")
              );
              if (isStaleMatch) {
                try {
                  const activeMatches = await getMatches();
                  const match = activeMatches.find(m => m.otherUserId === composerTargetId);
                  if (match && match.matchId) {
                    Alert.alert(
                      'כבר נוצרה התאמה',
                      'כבר נוצרה התאמה עם משתמש זה. אפשר להמשיך בצ׳אט.',
                      [
                        { text: 'סגור', style: 'cancel' },
                        {
                          text: 'מעבר לצ׳אט',
                          onPress: () => navigation.navigate('Chat', { matchId: match.matchId }),
                        },
                      ]
                    );
                  } else {
                    Alert.alert(
                      'כבר נוצרה התאמה',
                      'כבר נוצרה התאמה עם משתמש זה. אפשר להמשיך בצ׳אט.',
                      [
                        { text: 'סגור', style: 'cancel' },
                        {
                          text: 'מעבר לרשימת ההתאמות',
                          onPress: () => navigation.navigate('Matches'),
                        },
                      ]
                    );
                  }
                } catch (fetchErr) {
                  Alert.alert(
                    'כבר נוצרה התאמה',
                    'כבר נוצרה התאמה עם משתמש זה. אפשר להמשיך בצ׳אט.'
                  );
                }
              } else {
                throw err;
              }
            }
          }
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  stateText: {
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    lineHeight: 22,
  },
  retryButton: {
    width: '60%',
  },
  listContainer: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    lineHeight: 20,
  },
  refreshButton: {
    width: '50%',
  },
  matchBanner: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
    padding: theme.spacing.m,
    marginHorizontal: theme.spacing.m,
    marginTop: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchBannerText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  matchBannerClose: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: theme.spacing.s,
    paddingHorizontal: theme.spacing.s,
  },
});

