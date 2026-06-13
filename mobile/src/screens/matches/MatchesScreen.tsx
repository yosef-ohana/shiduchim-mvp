import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getMatches } from '../../api/matchesApi';
import { MatchResponse } from '../../types/api';
import { getImageUrl } from '../../utils/imageUrl';


export const MatchesScreen = ({ navigation }: any) => {
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getMatches();
      const activeMatches = data.filter(m => m.status === 'ACTIVE');
      activeMatches.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        const valA = isNaN(timeA) ? 0 : timeA;
        const valB = isNaN(timeB) ? 0 : timeB;
        return valB - valA;
      });
      setMatches(activeMatches);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load matches. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMatches(matches.length === 0);
    }, [matches.length])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMatches(false);
  };

  const renderItem = ({ item }: { item: MatchResponse }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MatchDetails', { matchId: item.matchId })}
        activeOpacity={0.8}
      >
        {getImageUrl(item.otherUserPrimaryPhotoUrl) ? (
          <Image source={{ uri: getImageUrl(item.otherUserPrimaryPhotoUrl) }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.otherUserFullName}
            </Text>
            <Text style={styles.poolTag}>
              {item.poolType === 'WEDDING' ? 'Wedding Pool' : item.poolType === 'GLOBAL' ? 'Global Pool' : item.poolType}
            </Text>
          </View>
          
          <Text style={styles.dateText}>
            Matched on {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          
          <Text style={styles.actionText}>Tap to view details & chat →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <AppButton title="Retry" onPress={() => fetchMatches()} style={styles.retryButton} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>My Matches</Text>
        <TouchableOpacity onPress={() => fetchMatches()} style={styles.refreshIconContainer}>
          <Text style={styles.refreshIconText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={matches}
        keyExtractor={(item) => item.matchId.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Matches Yet</Text>
            <Text style={styles.emptySubtitle}>
              Keep active in discovery! When you like someone and they like you back, you'll see your matches here.
            </Text>
          </View>
        }
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
  loadingText: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.s,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  refreshIconContainer: {
    padding: 6,
    borderRadius: theme.borderRadius.s,
    backgroundColor: theme.colors.border,
  },
  refreshIconText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  listContainer: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.border,
  },
  placeholderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
    marginLeft: theme.spacing.m,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  poolTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginLeft: theme.spacing.s,
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: 6,
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
});
