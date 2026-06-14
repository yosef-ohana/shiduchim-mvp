import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { 
  getEventManagerWedding, 
  getParticipants, 
  addParticipant, 
  removeParticipant,
  closeWedding,
  cancelWedding,
  getInvites,
  createInvite,
  cancelInvite,
  restoreInvite
} from '../../api/eventManagerApi';
import { WeddingResponse, ParticipantResponse, WeddingInviteResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const EventManagerWeddingDetailsScreen = ({ route }: any) => {
  const { weddingId } = route.params;
  const [wedding, setWedding] = useState<WeddingResponse | null>(null);
  const [participants, setParticipants] = useState<ParticipantResponse[]>([]);
  const [invites, setInvites] = useState<WeddingInviteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newInviteName, setNewInviteName] = useState('');
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [weddingData, participantsData, invitesData] = await Promise.all([
        getEventManagerWedding(weddingId),
        getParticipants(weddingId),
        getInvites(weddingId).catch(() => [])
      ]);
      setWedding(weddingData);
      setParticipants(participantsData);
      setInvites(invitesData);
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'טעינת פרטי החתונה נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!newEmail.trim()) {
      Alert.alert('שגיאת אימות', 'אנא הזן כתובת אימייל תקינה.');
      return;
    }
    setActionLoading(true);
    try {
      await addParticipant(weddingId, { email: newEmail.trim() });
      Alert.alert('Success', `Participant ${newEmail.trim()} has been added to the wedding.`);
      setNewEmail('');
      await loadData();
    } catch (error: any) {
      console.error(error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'הוספת המשתתף נכשלה.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!newInviteName.trim() || !newInviteEmail.trim()) {
      Alert.alert('שגיאת אימות', 'אנא הזן שם וכתובת אימייל תקינים.');
      return;
    }
    setActionLoading(true);
    try {
      await createInvite(weddingId, { fullName: newInviteName.trim(), email: newInviteEmail.trim() });
      Alert.alert('Success', `Invitation created for ${newInviteEmail.trim()}`);
      setNewInviteName('');
      setNewInviteEmail('');
      await loadData();
    } catch (error: any) {
      console.error(error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'יצירת ההזמנה נכשלה.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelInvite = async (inviteId: number) => {
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel this invitation?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelInvite(weddingId, inviteId);
              Alert.alert('Success', 'Invitation cancelled.');
              await loadData();
            } catch (error: any) {
              console.error(error);
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'ביטול ההזמנה נכשל.'));
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRestoreInvite = async (inviteId: number) => {
    Alert.alert(
      'Restore Invitation',
      'Are you sure you want to restore this invitation?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Restore', 
          onPress: async () => {
            setActionLoading(true);
            try {
              await restoreInvite(weddingId, inviteId);
              Alert.alert('Success', 'Invitation restored.');
              await loadData();
            } catch (error: any) {
              console.error(error);
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'החזרת ההזמנה נכשלה.'));
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };


  const handleRemoveParticipant = async (userId: number, email: string) => {
    Alert.alert(
      'Remove Participant',
      `Are you sure you want to remove participant ${email} from this wedding?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await removeParticipant(weddingId, userId);
              Alert.alert('Success', `Participant ${email} has been removed.`);
              await loadData();
            } catch (error: any) {
              console.error(error);
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'הסרת המשתתף נכשלה.'));
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCloseWedding = async () => {
    Alert.alert(
      'Close Wedding',
      'Are you sure you want to close this wedding? New participants will not be able to join. Existing matches and chats will remain active.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Wedding',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await closeWedding(weddingId);
              Alert.alert('Success', 'Wedding has been closed successfully.');
              await loadData();
            } catch (error: any) {
              console.error(error);
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'סגירת החתונה נכשלה.'));
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelWedding = async () => {
    Alert.alert(
      'Cancel Wedding',
      'Are you sure you want to cancel this wedding? New participants will not be able to join, and the wedding status will be set to CANCELLED.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cancel Wedding',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelWedding(weddingId);
              Alert.alert('Success', 'Wedding has been cancelled successfully.');
              await loadData();
            } catch (error: any) {
              console.error(error);
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'ביטול החתונה נכשל.'));
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
        <View style={styles.participantStatusContainer}>
          <Text style={[
            styles.statusLabel,
            item.participantStatus === 'ACTIVE' ? styles.statusActive : styles.statusRemoved
          ]}>
            Status: {item.participantStatus}
          </Text>
          <Text style={styles.profileLabel}>
            Profile: {item.profileStatus}
          </Text>
        </View>
      </View>
      {item.participantStatus === 'ACTIVE' && wedding?.status === 'ACTIVE' && (
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveParticipant(item.userId, item.email)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return styles.badgeActive;
      case 'CLOSED':
        return styles.badgeClosed;
      case 'CANCELLED':
        return styles.badgeCancelled;
      default:
        return styles.badgeDefault;
    }
  };

  if (loading && !wedding) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  const invitationText = wedding 
    ? `Join our wedding pool on Shiduchim!\nWedding: ${wedding.name}\nAccess Code: ${wedding.accessCode}\n\nDownload the app, register/login, select "Join Wedding" on the main page, and enter the Access Code above to participate.`
    : '';

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
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{wedding.name}</Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(wedding.status)]}>
                    <Text style={styles.statusText}>{wedding.status}</Text>
                  </View>
                </View>

                <Text style={styles.detail}>City: <Text style={styles.detailValue}>{wedding.city}</Text></Text>
                <Text style={styles.detail}>Date: <Text style={styles.detailValue}>{wedding.weddingDate}</Text></Text>
                {wedding.ownerUserId && (
                  <Text style={styles.detail}>Owner User ID: <Text style={styles.detailValue}>{wedding.ownerUserId}</Text></Text>
                )}

                <View style={styles.accessCodeBox}>
                  <Text style={styles.accessCodeLabel}>ACCESS CODE</Text>
                  <Text style={styles.accessCodeValue} selectable={true}>{wedding.accessCode}</Text>
                  <Text style={styles.accessCodeHint}>(Press and hold to copy)</Text>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{wedding.participantsCount ?? participants.length}</Text>
                    <Text style={styles.statLabel}>Participants</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>
                      {wedding.matchesCount !== undefined && wedding.matchesCount !== null 
                        ? wedding.matchesCount 
                        : 'N/A'}
                    </Text>
                    <Text style={styles.statLabel}>Active Matches</Text>
                  </View>
                </View>

                {wedding.status === 'ACTIVE' && (
                  <View style={styles.actionsRow}>
                    <AppButton
                      title="Close Wedding"
                      onPress={handleCloseWedding}
                      loading={actionLoading}
                      style={styles.closeButton}
                    />
                    <AppButton
                      title="Cancel Wedding"
                      onPress={handleCancelWedding}
                      loading={actionLoading}
                      style={styles.cancelButton}
                    />
                  </View>
                )}
              </View>
            )}

            {wedding && wedding.status === 'ACTIVE' && (
              <View style={styles.inviteCard}>
                <Text style={styles.inviteTitle}>Manual Invitation Text</Text>
                <Text style={styles.inviteDescription}>
                  You can copy the message template below and share it with potential participants:
                </Text>
                <View style={styles.inviteTextBox}>
                  <Text style={styles.inviteText} selectable={true}>
                    {invitationText}
                  </Text>
                </View>
                <Text style={styles.copyHint}>Note: Double-tap or long-press the text above to copy it.</Text>
              </View>
            )}

            {wedding && wedding.status === 'ACTIVE' && (
              <View style={styles.addParticipantContainer}>
                <Text style={styles.sectionTitle}>Create Invitation</Text>
                <Text style={styles.addParticipantSubtitle}>
                  Invite someone to the wedding. They will receive an email if implemented.
                </Text>
                <View style={styles.addFormCol}>
                  <TextInput
                    style={[styles.input, { marginBottom: theme.spacing.s, width: '100%' }]}
                    value={newInviteName}
                    onChangeText={setNewInviteName}
                    placeholder="Full Name"
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={[styles.input, { marginBottom: theme.spacing.s, width: '100%' }]}
                    value={newInviteEmail}
                    onChangeText={setNewInviteEmail}
                    placeholder="Email address"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <AppButton 
                    title="Create Invite" 
                    onPress={handleCreateInvite} 
                    loading={actionLoading}
                    style={styles.addButton}
                  />
                </View>
              </View>
            )}

            {invites.length > 0 && (
              <View style={styles.addParticipantContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Invitations</Text>
                  <Text style={styles.listCount}>({invites.length})</Text>
                </View>
                {invites.map(invite => (
                  <View key={`invite-${invite.id}`} style={styles.participantCard}>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>{invite.fullName}</Text>
                      <Text style={styles.participantDetail}>{invite.email}</Text>
                      <View style={styles.participantStatusContainer}>
                        <Text style={[
                          styles.statusLabel,
                          invite.status === 'ACCEPTED' ? styles.statusActive : 
                          invite.status === 'CANCELLED' ? styles.statusRemoved : { color: '#FF9800', fontWeight: '600' }
                        ]}>
                          Status: {invite.status}
                        </Text>
                      </View>
                    </View>
                    {invite.status === 'PENDING' && wedding?.status === 'ACTIVE' && (
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleCancelInvite(invite.id)}
                      >
                        <Text style={styles.removeButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                    {invite.status === 'CANCELLED' && wedding?.status === 'ACTIVE' && (
                      <TouchableOpacity 
                        style={styles.restoreButton}
                        onPress={() => handleRestoreInvite(invite.id)}
                      >
                        <Text style={styles.restoreButtonText}>Restore</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {wedding && wedding.status === 'ACTIVE' && (
              <View style={styles.addParticipantContainer}>
                <Text style={styles.sectionTitle}>Add Existing Participant</Text>
                <Text style={styles.addParticipantSubtitle}>
                  Add an existing registered user by their email address.
                </Text>
                <View style={styles.addFormRow}>
                  <TextInput
                    style={styles.input}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder="User's email address"
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
            )}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Participants List</Text>
              <Text style={styles.listCount}>({participants.length})</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No participants found for this wedding yet.</Text>
          </View>
        }
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
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.s,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badgeActive: {
    backgroundColor: '#4CAF50', // Green
  },
  badgeClosed: {
    backgroundColor: '#9E9E9E', // Gray
  },
  badgeCancelled: {
    backgroundColor: '#F44336', // Red
  },
  badgeDefault: {
    backgroundColor: theme.colors.primary,
  },
  detail: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  detailValue: {
    fontWeight: '500',
    color: theme.colors.text,
  },
  accessCodeBox: {
    backgroundColor: '#FDF7E7', // Very light gold/yellow background
    borderColor: '#F0D177',
    borderWidth: 1,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    marginVertical: theme.spacing.m,
  },
  accessCodeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D1C',
    letterSpacing: 1,
    marginBottom: 4,
  },
  accessCodeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: 2,
  },
  accessCodeHint: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.m,
    marginVertical: theme.spacing.s,
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.m,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#757575',
    marginRight: theme.spacing.s,
    paddingVertical: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    marginLeft: theme.spacing.s,
    paddingVertical: 12,
  },
  inviteCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  inviteDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
    lineHeight: 18,
  },
  inviteTextBox: {
    backgroundColor: '#F5F5F5',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inviteText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    fontFamily: 'System',
  },
  copyHint: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.s,
    fontStyle: 'italic',
  },
  addParticipantContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  listCount: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  addParticipantSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
  },
  addFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFormCol: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.m,
    marginRight: theme.spacing.s,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: '#FAFAFA',
  },
  addButton: {
    minWidth: 80,
    paddingVertical: 12,
  },
  participantCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  participantInfo: {
    flex: 1,
    marginRight: theme.spacing.s,
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
    marginBottom: 4,
  },
  participantStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  statusLabel: {
    fontSize: 12,
    marginRight: theme.spacing.m,
  },
  statusActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  statusRemoved: {
    color: '#F44336',
    fontWeight: '600',
  },
  profileLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: theme.borderRadius.s,
  },
  removeButtonText: {
    color: '#C62828',
    fontWeight: '600',
    fontSize: 13,
  },
  restoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: theme.borderRadius.s,
  },
  restoreButtonText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
});
