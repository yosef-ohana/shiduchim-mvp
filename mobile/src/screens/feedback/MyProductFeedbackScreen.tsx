import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { productFeedbackApi } from '../../api/productFeedbackApi';
import { MyProductFeedbackResponse } from '../../types/apiProductFeedback';

export const MyProductFeedbackScreen = () => {
  const [items, setItems] = useState<MyProductFeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await productFeedbackApi.getMyFeedback();
      // Sort feedback by id descending so newest is on top
      const sortedData = data.sort((a, b) => b.id - a.id);
      setItems(sortedData);
    } catch (err) {
      console.error('Error fetching my product feedback:', err);
      setError('אירעה שגיאה בטעינת הפניות');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeedback();
    }, [])
  );

  const getTypeText = (type: string) => {
    switch (type) {
      case 'BUG': return 'באג';
      case 'IMPROVEMENT': return 'בקשת שיפור';
      case 'OTHER': return 'אחר';
      default: return type;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW': return 'חדש';
      case 'IN_PROGRESS': return 'בטיפול';
      case 'RESOLVED': return 'טופל';
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'NEW': return styles.statusNew;
      case 'IN_PROGRESS': return styles.statusInProgress;
      case 'RESOLVED': return styles.statusResolved;
      default: return styles.statusNew;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('he-IL');
    } catch {
      return dateStr;
    }
  };

  const renderItem = ({ item }: { item: MyProductFeedbackResponse }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>פניה #{item.id}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>סוג:</Text>
        <Text style={styles.cardValue}>{getTypeText(item.type)}</Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>תאריך יצירה:</Text>
        <Text style={styles.cardValue}>{formatDateTime(item.createdAt)}</Text>
      </View>

      {item.resolvedAt ? (
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>תאריך טיפול:</Text>
          <Text style={styles.cardValue}>{formatDateTime(item.resolvedAt)}</Text>
        </View>
      ) : null}

      <Text style={styles.textLabel}>תוכן הפניה:</Text>
      <View style={styles.textBox}>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="נסה שוב" onPress={() => fetchFeedback(false)} style={styles.retryButton} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => fetchFeedback(true)} 
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>עדיין לא שלחת פניות מערכת</Text>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
    paddingBottom: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.s / 2,
    borderRadius: theme.borderRadius.s,
  },
  statusNew: {
    backgroundColor: theme.colors.error + '20',
  },
  statusInProgress: {
    backgroundColor: '#FFD70040',
  },
  statusResolved: {
    backgroundColor: theme.colors.primary + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cardRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: theme.spacing.s,
  },
  cardLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  textLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  textBox: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  text: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    minWidth: 120,
  },
});
