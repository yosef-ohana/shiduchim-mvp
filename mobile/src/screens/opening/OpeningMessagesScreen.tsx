import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getInboxOpeningMessages, getSentOpeningMessages } from '../../api/openingMessagesApi';
import { OpeningConversationSummaryResponse } from '../../types/api';
import { getImageUrl } from '../../utils/imageUrl';
import { getPoolTypeLabel, formatDisplayDate } from '../../utils/displayLabels';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

type Tab = 'INBOX' | 'SENT';

export const OpeningMessagesScreen = ({ navigation }: any) => {
  const [tab, setTab] = useState<Tab>('INBOX');
  const [conversations, setConversations] = useState<OpeningConversationSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    }
    setError(null);
    try {
      let data: OpeningConversationSummaryResponse[];
      if (tab === 'INBOX') {
        data = await getInboxOpeningMessages();
      } else {
        data = await getSentOpeningMessages();
      }
      data.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
        const valA = isNaN(timeA) ? 0 : timeA;
        const valB = isNaN(timeB) ? 0 : timeB;
        return valB - valA;
      });
      setConversations(data);
    } catch (err: any) {
      setError(
        getFriendlyErrorMessage(err, 'טעינת ההודעות נכשלה. אנא נסו שוב.')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations(conversations.length === 0);
    }, [tab])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations(false);
  };

  const renderItem = ({ item }: { item: OpeningConversationSummaryResponse }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <TouchableOpacity
            style={styles.headerTouchable}
            onPress={() => navigation.navigate('CandidateProfile', {
              userId: item.otherUserId,
              sourceContext: 'OPENING_LIST',
              contextLabel: 'הגעת מרשימת הודעות פתיחה'
            })}
            activeOpacity={0.7}
          >
            <View style={styles.headerRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.otherUserName}
              </Text>
              <Text style={styles.poolTag}>
                {getPoolTypeLabel(item.poolType)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bodyTouchable}
            onPress={() => navigation.navigate('OpeningConversationDetails', {
              conversationId: item.conversationId,
              otherUserName: item.otherUserName
            })}
            activeOpacity={0.7}
          >
            <Text style={styles.messagePreview} numberOfLines={2}>
              {item.lastMessagePreview || 'הודעה חדשה'}
            </Text>

            <Text style={styles.dateText}>
              {formatDisplayDate(item.lastMessageAt || item.createdAt)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>אין הודעות פתיחה כרגע</Text>
        <Text style={styles.emptySubtitle}>
          {tab === 'INBOX' ? 'עדיין לא קיבלת הודעות פתיחה.' : 'עדיין לא שלחת הודעות פתיחה.'}
        </Text>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, tab === 'INBOX' && styles.activeTab]} 
          onPress={() => setTab('INBOX')}
        >
          <Text style={[styles.tabText, tab === 'INBOX' && styles.activeTabText]}>נכנסות</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, tab === 'SENT' && styles.activeTab]} 
          onPress={() => setTab('SENT')}
        >
          <Text style={[styles.tabText, tab === 'SENT' && styles.activeTabText]}>נשלחו</Text>
        </TouchableOpacity>
      </View>
      
      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="נסה שוב" onPress={() => fetchConversations()} style={styles.retryButton} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversationId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={renderEmptyState}
        />
      )}
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
  tabsContainer: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row-reverse',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
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
    marginRight: theme.spacing.s,
  },
  messagePreview: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'left',
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
  headerTouchable: {
    width: '100%',
    paddingBottom: theme.spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  bodyTouchable: {
    width: '100%',
    paddingTop: theme.spacing.s,
  },
});
