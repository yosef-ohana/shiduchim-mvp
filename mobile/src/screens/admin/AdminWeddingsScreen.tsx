import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen';
import { adminApi } from '../../api/adminApi';
import { AdminWeddingResponse } from '../../types/api';
import { theme } from '../../theme/theme';

export const AdminWeddingsScreen = () => {
  const [weddings, setWeddings] = useState<AdminWeddingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeddings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getWeddings();
      setWeddings(data);
    } catch (error) {
      console.error('Failed to fetch weddings', error);
      Alert.alert('Error', 'Failed to fetch weddings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeddings();
  }, []);

  const renderItem = ({ item }: { item: AdminWeddingResponse }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name || 'No Name'} (ID: {item.id})</Text>
      <Text style={styles.info}>City: {item.city || 'N/A'}</Text>
      <Text style={styles.info}>Date: {item.weddingDate || 'N/A'}</Text>
      <Text style={styles.info}>Status: {item.status}</Text>
      <Text style={styles.info}>Owner ID: {item.ownerUserId}</Text>
      <Text style={styles.info}>Participants: {item.participantsCount}</Text>
      <Text style={styles.info}>Matches: {item.matchesCount}</Text>
    </View>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <FlatList
            data={weddings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>No weddings found.</Text>}
            refreshing={loading}
            onRefresh={fetchWeddings}
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
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  info: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    color: theme.colors.textSecondary,
  },
});
