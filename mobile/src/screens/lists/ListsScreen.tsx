import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { CandidateCard } from '../../components/CandidateCard';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getLikes, getDislikes, getFreezes, getLikedMe } from '../../api/listsApi';
import { likeUser, dislikeUser, removeAction } from '../../api/actionsApi';
import { PoolType } from '../../types/api';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { OpeningMessageComposer } from '../../components/OpeningMessageComposer';
import { sendOpeningMessage } from '../../api/openingMessagesApi';

type TabType = 'likes' | 'dislikes' | 'freezes' | 'liked-me';

export const ListsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('likes');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [composerTarget, setComposerTarget] = useState<{ userId: number; poolType: PoolType; weddingId?: number } | null>(null);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'likes', label: 'לייקים' },
    { id: 'dislikes', label: 'לא מתאימים' },
    { id: 'freezes', label: 'שמורים בצד' },
    { id: 'liked-me', label: 'עשו לי לייק' },
  ];

  const fetchList = async (tab: TabType) => {
    setLoading(true);
    setError(null);
    try {
      let data: any[] = [];
      if (tab === 'likes') {
        data = await getLikes();
      } else if (tab === 'dislikes') {
        data = await getDislikes();
      } else if (tab === 'freezes') {
        data = await getFreezes();
      } else if (tab === 'liked-me') {
        data = await getLikedMe();
      }
      setItems(data);
    } catch (err: any) {
      setError(
        getFriendlyErrorMessage(err, 'טעינת הרשימה נכשלה. אנא נסה שוב.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(activeTab);
  }, [activeTab]);

  const handleLike = async (targetUserId: number, poolType: PoolType, weddingId?: number) => {
    const execute = async () => {
      setProcessingId(targetUserId);
      setError(null);
      try {
        const response = await likeUser(targetUserId, { poolType, weddingId });
        await fetchList(activeTab);
        if (response.matchCreated) {
          Alert.alert('נוצרה התאמה!', 'עכשיו אתם יכולים להתכתב.');
        }
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err, 'סימון הלייק נכשל. אנא נסה שוב.'));
      } finally {
        setProcessingId(null);
      }
    };

    if (activeTab === 'liked-me') {
      Alert.alert(
        'סימון לייק',
        'פעולה זו עשויה ליצור התאמה מיידית אם המשתמש השני כבר סימן לך לייק.',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'לייק', onPress: execute },
        ]
      );
    } else {
      Alert.alert(
        'סימון לייק',
        'אם גם הצד השני יסמן לייק, ייווצר שידוך ותוכלו להתכתב.',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'לייק', onPress: execute },
        ]
      );
    }
  };

  const handleDislike = async (targetUserId: number, poolType: PoolType, weddingId?: number) => {
    const execute = async () => {
      setProcessingId(targetUserId);
      setError(null);
      try {
        await dislikeUser(targetUserId, { poolType, weddingId });
        await fetchList(activeTab);
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err, 'הפעולה נכשלה. אנא נסה שוב.'));
      } finally {
        setProcessingId(null);
      }
    };

    Alert.alert(
      'לא מתאים',
      'משתמש זה יועבר לרשימת הלא מתאימים ולא יופיע שוב בפיד שלך.',
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'לא מתאים', style: 'destructive', onPress: execute },
      ]
    );
  };

  const handleRemoveAction = async (targetUserId: number, poolType: PoolType, weddingId?: number) => {
    const execute = async () => {
      setProcessingId(targetUserId);
      setError(null);
      try {
        await removeAction(targetUserId, { poolType, weddingId });
        await fetchList(activeTab);
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err, 'ההחזרה לפיד נכשלה. אנא נסה שוב.'));
      } finally {
        setProcessingId(null);
      }
    };

    if (activeTab === 'freezes') {
      Alert.alert(
        'החזרה לפיד',
        'משתמש זה יוסר מהשמורים בצד ועשוי להופיע שוב בפיד שלך אם הוא עדיין מתאים.',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'החזרה לפיד', onPress: execute },
        ]
      );
    } else {
      Alert.alert(
        'החזרה לפיד',
        'פעולה זו תבוטל, והמשתמש עשוי להופיע שוב בפיד שלך אם הוא עדיין מתאים.',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'החזרה לפיד', onPress: execute },
        ]
      );
    }
  };

  const handleViewProfile = (userId: number) => {
    navigation.navigate('CandidateProfile', { userId });
  };

  const renderOpeningMessageButton = (item: any) => {
    if (item.hasOpenOpeningConversation) {
      let title = 'יש הודעת פתיחה פעילה';
      if (item.openingConversationDirection === 'SENT') {
        title = 'הודעת פתיחה נשלחה';
      } else if (item.openingConversationDirection === 'RECEIVED') {
        title = 'התקבלה הודעת פתיחה';
      }
      return (
        <AppButton
          title={title}
          disabled={true}
          style={styles.actionButton}
        />
      );
    }

    return (
      <AppButton
        title="הודעת פתיחה"
        onPress={() =>
          setComposerTarget({
            userId: item.userId,
            poolType: item.poolType,
            weddingId: item.weddingId,
          })
        }
        style={styles.actionButton}
      />
    );
  };

  return (
    <Screen>
      {/* Segmented Buttons/Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.stateText}>טוען רשימה...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="נסה שוב" onPress={() => fetchList(activeTab)} style={styles.retryButton} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => `${item.userId}-${index}`}
          renderItem={({ item }) => (
            <CandidateCard
              candidate={{
                userId: item.userId,
                fullName: item.fullName,
                primaryPhotoUrl: item.primaryPhotoUrl,
                age: item.age,
                heightCm: item.heightCm,
                areaOfResidence: item.areaOfResidence,
                religiousLevel: item.religiousLevel,
                education: item.education,
                lookingForShort: item.lookingForShort,
              }}
              onViewProfile={() => handleViewProfile(item.userId)}
              actionButtons={
                <View style={styles.actionsContainer}>
                  {activeTab === 'likes' && (
                    <>
                      {renderOpeningMessageButton(item)}
                      <AppButton title="לא מתאים" onPress={() => handleDislike(item.userId, item.poolType, item.weddingId)} loading={processingId === item.userId} style={styles.actionButton} />
                      <AppButton title="החזרה לפיד" onPress={() => handleRemoveAction(item.userId, item.poolType, item.weddingId)} loading={processingId === item.userId} style={styles.returnButton} />
                    </>
                  )}
                  {activeTab === 'dislikes' && (
                    <>
                      {renderOpeningMessageButton(item)}
                      <AppButton title="לייק" onPress={() => handleLike(item.userId, item.poolType, item.weddingId)} loading={processingId === item.userId} style={styles.actionButton} />
                      <AppButton title="החזרה לפיד" onPress={() => handleRemoveAction(item.userId, item.poolType, item.weddingId)} loading={processingId === item.userId} style={styles.returnButton} />
                    </>
                  )}
                  {activeTab === 'freezes' && (
                    <>
                      {renderOpeningMessageButton(item)}
                      <AppButton title="לייק" onPress={() => handleLike(item.userId, item.poolType, item.weddingId)} loading={processingId === item.userId} style={styles.actionButton} />
                      <AppButton title="לא מתאים" onPress={() => handleDislike(item.userId, item.poolType, item.weddingId)} loading={processingId === item.userId} style={styles.actionButton} />
                      <AppButton title="החזרה לפיד" onPress={() => handleRemoveAction(item.userId, item.poolType, item.weddingId)} loading={processingId === item.userId} style={styles.returnButton} />
                    </>
                  )}
                  {activeTab === 'liked-me' && (
                    <>
                      <AppButton title="לייק" onPress={() => handleLike(item.userId, item.poolType, item.weddingId)} loading={processingId === item.userId} style={styles.actionButton} />
                      <AppButton title="לא מתאים" onPress={() => handleDislike(item.userId, item.poolType, item.weddingId)} loading={processingId === item.userId} style={styles.actionButton} />
                    </>
                  )}
                </View>
              }
            />
          )}
          contentContainerStyle={styles.listContainer}
          onRefresh={() => fetchList(activeTab)}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>לא נמצאו משתמשים</Text>
              <Text style={styles.emptySubtitle}>
                רשימת ה"{tabs.find((t) => t.id === activeTab)?.label}" שלך ריקה כרגע.
              </Text>
            </View>
          }
        />
      )}
      <OpeningMessageComposer
        visible={composerTarget !== null}
        onClose={() => setComposerTarget(null)}
        onSend={async (content) => {
          if (composerTarget !== null) {
            await sendOpeningMessage(composerTarget.userId, {
              content,
              poolType: composerTarget.poolType,
              weddingId: composerTarget.weddingId,
            });
            Alert.alert('הצלחה', 'הודעת הפתיחה נשלחה בהצלחה.');
            fetchList(activeTab);
          }
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
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
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: theme.spacing.s,
  },
  actionButton: {
    marginTop: theme.spacing.s,
  },
  returnButton: {
    marginTop: theme.spacing.s,
    backgroundColor: '#757575',
  },
});
