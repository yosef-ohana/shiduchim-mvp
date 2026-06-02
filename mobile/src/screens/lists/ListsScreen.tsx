import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { CandidateCard } from '../../components/CandidateCard';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getLikes, getDislikes, getFreezes, getLikedMe } from '../../api/listsApi';
import { unfreezeUser } from '../../api/actionsApi';
import { PoolType } from '../../types/api';

type TabType = 'likes' | 'dislikes' | 'freezes' | 'liked-me';

export const ListsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('likes');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unfreezingId, setUnfreezingId] = useState<number | null>(null);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'likes', label: 'Likes' },
    { id: 'dislikes', label: 'Dislikes' },
    { id: 'freezes', label: 'Freezes' },
    { id: 'liked-me', label: 'Liked Me' },
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
        err.response?.data?.message ||
          err.message ||
          `Failed to load list. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(activeTab);
  }, [activeTab]);

  const handleUnfreeze = async (targetUserId: number, poolType: PoolType, weddingId?: number) => {
    setUnfreezingId(targetUserId);
    setError(null);
    try {
      await unfreezeUser(targetUserId, { poolType, weddingId });
      // Refresh the list immediately after unfreezing
      await fetchList('freezes');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          `Failed to unfreeze user. Please try again.`
      );
    } finally {
      setUnfreezingId(null);
    }
  };

  const handleViewProfile = (userId: number) => {
    navigation.navigate('CandidateProfile', { userId });
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
          <Text style={styles.stateText}>Loading list...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="Retry" onPress={() => fetchList(activeTab)} style={styles.retryButton} />
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
                activeTab === 'freezes' ? (
                  <AppButton
                    title="Unfreeze"
                    onPress={() => handleUnfreeze(item.userId, item.poolType, item.weddingId)}
                    loading={unfreezingId === item.userId}
                    style={styles.unfreezeButton}
                  />
                ) : undefined
              }
            />
          )}
          contentContainerStyle={styles.listContainer}
          onRefresh={() => fetchList(activeTab)}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySubtitle}>
                Your "{tabs.find((t) => t.id === activeTab)?.label}" list is currently empty.
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
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
  unfreezeButton: {
    marginTop: theme.spacing.s,
    backgroundColor: '#757575',
  },
});
