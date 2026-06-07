import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { getEventManagerWedding, getParticipants, addParticipant, removeParticipant } from '../../api/eventManagerApi';
import { WeddingResponse, ParticipantResponse } from '../../types/api';
import { theme } from '../../theme/theme';

export const EventManagerWeddingDetailsScreen = ({ route }: any) => {
  const { weddingId } = route.params;
  const [wedding, setWedding] = useState<WeddingResponse | null>(null);
  const [participants, setParticipants] = useState<ParticipantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [weddingData, participantsData] = await Promise.all([
        getEventManagerWedding(weddingId),
        getParticipants(weddingId)
      ]);
      setWedding(weddingData);
      setParticipants(participantsData);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load wedding details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!newEmail.trim()) return;
    setActionLoading(true);
    try {
      await addParticipant(weddingId, { email: newEmail.trim() });
      setNewEmail('');
      await loadData();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add participant');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveParticipant = async (userId: number) => {
    Alert.alert(
      'Remove Participant',
      'Are you sure you want to remove this participant?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await removeParticipant(weddingId, userId);
              await loadData();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to remove participant');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderParticipant = ({ item }: { item: ParticipantResponse }) => (
    <View style={styles.participantCard}>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{item.fullName}</Text>
        <Text style={styles.participantDetail}>{item.email}</Text>
        <Text style={styles.participantDetail}>Status: {item.participantStatus}</Text>
        <Text style={styles.participantDetail}>Profile: {item.profileStatus}</Text>
      </View>
      {item.participantStatus === 'ACTIVE' && (
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveParticipant(item.userId)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !wedding) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={participants}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={renderParticipant}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadData}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {wedding && (
              <View style={styles.detailsCard}>
                <Text style={styles.title}>{wedding.name}</Text>
                <Text style={styles.detail}>Access Code: <Text style={styles.accessCode}>{wedding.accessCode}</Text></Text>
                <Text style={styles.detail}>City/Date: {wedding.city} - {wedding.weddingDate}</Text>
                <Text style={styles.detail}>Status: {wedding.status}</Text>
                <View style={styles.statsContainer}>
                  <Text style={styles.stats}>Participants: {wedding.participantsCount}</Text>
                  <Text style={styles.stats}>Matches: {wedding.matchesCount}</Text>
                </View>
              </View>
            )}

            <View style={styles.addParticipantContainer}>
              <Text style={styles.sectionTitle}>Add Participant</Text>
              <View style={styles.addFormRow}>
                <TextInput
                  style={styles.input}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="Enter user email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <AppButton 
                  title="Add" 
                  onPress={handleAddParticipant} 
                  loading={actionLoading}
                  style={styles.addButton}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Participants</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No participants found.</Text>}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
  },
  headerContainer: {
    marginBottom: theme.spacing.m,
  },
  detailsCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  detail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  accessCode: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.m,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  stats: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  addParticipantContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.l,
  },
  addFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    padding: theme.spacing.s,
    marginRight: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.text,
  },
  addButton: {
    minWidth: 80,
  },
  participantCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  participantDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  removeButton: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.s,
  },
  removeButtonText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.m,
  },
});
