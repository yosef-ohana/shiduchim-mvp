import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { getEventManagerWeddings } from '../../api/eventManagerApi';
import { WeddingResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getWeddingStatusLabel, formatDisplayDate } from '../../utils/displayLabels';
import { useFocusEffect } from '@react-navigation/native';

export const EventManagerWeddingsScreen = ({ navigation }: any) => {
  const [weddings, setWeddings] = useState<WeddingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeddings = useCallback(async (isMounted = { current: true }) => {
    setLoading(true);
    try {
      const data = await getEventManagerWeddings();
      if (isMounted.current) {
        setWeddings(data);
      }
    } catch (error) {
      console.error(error);
      if (isMounted.current) {
        Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'טעינת החתונות נכשלה.'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const isMounted = { current: true };
      fetchWeddings(isMounted);
      return () => {
        isMounted.current = false;
      };
    }, [fetchWeddings])
  );

  const renderItem = ({ item }: { item: WeddingResponse }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EventManagerWeddingDetails', { weddingId: item.id })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.detail}>עיר/תאריך: {item.city} - {formatDisplayDate(item.weddingDate)}</Text>
      <Text style={styles.detail}>סטטוס: {getWeddingStatusLabel(item.status)}</Text>
      <Text style={styles.detail}>קוד גישה: {item.accessCode}</Text>
      <View style={styles.statsContainer}>
        <Text style={styles.stats}>משתתפים: {item.participantsCount}</Text>
        <Text style={styles.stats}>שידוכים: {item.matchesCount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>החתונות שלי</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <FlatList
            data={weddings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={fetchWeddings}
            ListEmptyComponent={<Text style={styles.emptyText}>לא נמצאו חתונות.</Text>}
          />
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'right',
  },
  list: {
    paddingBottom: theme.spacing.xl,
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
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  detail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.s,
  },
  stats: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  },
});
