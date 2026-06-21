import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme/theme';
import { productFeedbackApi } from '../../api/productFeedbackApi';
import { ProductFeedbackListItemResponse } from '../../types/apiProductFeedback';

export const AdminProductFeedbackScreen = ({ navigation }: any) => {
  const [items, setItems] = useState<ProductFeedbackListItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const data = await productFeedbackApi.getAdminFeedbackList();
      setItems(data);
    } catch (error) {
      console.error('Error fetching feedback items:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בטעינת פניות המערכת');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const getStatusText = (status: string) => {
    switch(status) {
      case 'NEW': return 'חדש';
      case 'IN_PROGRESS': return 'בטיפול';
      case 'RESOLVED': return 'טופל';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch(type) {
      case 'BUG': return 'באג';
      case 'IMPROVEMENT': return 'שיפור';
      case 'OTHER': return 'אחר';
      default: return type;
    }
  };

  const renderItem = ({ item }: { item: ProductFeedbackListItemResponse }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('AdminProductFeedbackDetails', { feedbackId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>פניה #{item.id}</Text>
        <View style={[
          styles.statusBadge, 
          item.status === 'NEW' ? styles.statusNew : 
          item.status === 'IN_PROGRESS' ? styles.statusInProgress : 
          styles.statusResolved
        ]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>סוג:</Text>
        <Text style={styles.cardValue}>{getTypeText(item.type)}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>תאריך:</Text>
        <Text style={styles.cardValue}>{new Date(item.createdAt).toLocaleDateString('he-IL')}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>משתמש:</Text>
        <Text style={styles.cardValue}>{item.senderUserId}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchItems} />
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>אין פניות מערכת</Text> : null
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
  },
  statusNew: {
    backgroundColor: theme.colors.error + '20',
  },
  statusInProgress: {
    backgroundColor: '#FFD700' + '40', // warning/goldish
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
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    fontSize: 16,
    color: theme.colors.textSecondary,
  }
});
