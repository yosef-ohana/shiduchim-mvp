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
import { 
  getWeddingStatusLabel, 
  getParticipantStatusLabel, 
  getInviteStatusLabel, 
  formatDisplayDate 
} from '../../utils/displayLabels';
import { WeddingJoinQrCard } from '../../components/WeddingJoinQrCard';
import { WeddingBackgroundManager } from '../../components/WeddingBackgroundManager';
import { uploadWeddingBackground, deleteWeddingBackground } from '../../api/eventManagerApi';

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
      Alert.alert('הצלחה', `המשתתף ${newEmail.trim()} נוסף לחתונה.`);
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
      Alert.alert('הצלחה', `נוצרה הזמנה עבור ${newInviteEmail.trim()}`);
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
      'ביטול הזמנה',
      'האם אתה בטוח שברצונך לבטל הזמנה זו?',
      [
        { text: 'לא', style: 'cancel' },
        { 
          text: 'כן, ביטול', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelInvite(weddingId, inviteId);
              Alert.alert('הצלחה', 'ההזמנה בוטלה.');
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
      'החזרת הזמנה',
      'האם אתה בטוח שברצונך להחזיר הזמנה זו?',
      [
        { text: 'לא', style: 'cancel' },
        { 
          text: 'כן, החזרה', 
          onPress: async () => {
            setActionLoading(true);
            try {
              await restoreInvite(weddingId, inviteId);
              Alert.alert('הצלחה', 'ההזמנה הוחזרה.');
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
      'הסרת משתתף',
      `האם אתה בטוח שברצונך להסיר את המשתתף ${email} מחתונה זו?`,
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'הסרה', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await removeParticipant(weddingId, userId);
              Alert.alert('הצלחה', `המשתתף ${email} הוסר.`);
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
      'סגירת חתונה',
      'האם אתה בטוח שברצונך לסגור חתונה זו? משתתפים חדשים לא יוכלו להצטרף. שידוכים וצ׳אטים קיימים יישארו פעילים.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'סגירת חתונה',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await closeWedding(weddingId);
              Alert.alert('הצלחה', 'החתונה נסגרה בהצלחה.');
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
      'ביטול חתונה',
      'האם אתה בטוח שברצונך לבטל חתונה זו? משתתפים חדשים לא יוכלו להצטרף, וסטטוס החתונה ישונה למבוטל.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'ביטול חתונה',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelWedding(weddingId);
              Alert.alert('הצלחה', 'החתונה בוטלה בהצלחה.');
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

  const handleUploadBackground = async (uri: string, mimeType?: string, fileName?: string) => {
    try {
      const updated = await uploadWeddingBackground(weddingId, uri, mimeType, fileName);
      setWedding(updated);
      Alert.alert('הצלחה', 'תמונת הרקע הועלתה בהצלחה.');
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteBackground = async () => {
    try {
      const updated = await deleteWeddingBackground(weddingId);
      setWedding(updated);
      Alert.alert('הצלחה', 'תמונת הרקע הוסרה בהצלחה.');
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  const renderParticipant = ({ item }: { item: ParticipantResponse }) => (
    <View style={styles.participantCard}>
      {item.participantStatus === 'ACTIVE' && wedding?.status === 'ACTIVE' && (
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveParticipant(item.userId, item.email)}
        >
          <Text style={styles.removeButtonText}>הסרה</Text>
        </TouchableOpacity>
      )}
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{item.fullName}</Text>
        <Text style={styles.participantDetail}>{item.email}</Text>
        <View style={styles.participantStatusContainer}>
          <Text style={styles.profileLabel}>
            פרופיל: {item.profileStatus}
          </Text>
          <Text style={[
            styles.statusLabel,
            item.participantStatus === 'ACTIVE' ? styles.statusActive : styles.statusRemoved
          ]}>
            סטטוס: {getParticipantStatusLabel(item.participantStatus)}
          </Text>
        </View>
      </View>
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
                  <View style={[styles.statusBadge, getStatusBadgeStyle(wedding.status)]}>
                    <Text style={styles.statusText}>{getWeddingStatusLabel(wedding.status)}</Text>
                  </View>
                  <Text style={styles.title}>{wedding.name}</Text>
                </View>

                <Text style={styles.detail}>עיר: <Text style={styles.detailValue}>{wedding.city}</Text></Text>
                <Text style={styles.detail}>תאריך: <Text style={styles.detailValue}>{formatDisplayDate(wedding.weddingDate)}</Text></Text>
                {wedding.ownerUserId && (
                  <Text style={styles.detail}>מזהה משתמש בעלים: <Text style={styles.detailValue}>{wedding.ownerUserId}</Text></Text>
                )}

                <View style={styles.accessCodeBox}>
                  <Text style={styles.accessCodeLabel}>קוד גישה</Text>
                  <Text style={styles.accessCodeValue} selectable={true}>{wedding.accessCode}</Text>
                  <Text style={styles.accessCodeHint}>(לחץ לחיצה ארוכה להעתקה)</Text>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{wedding.participantsCount ?? participants.length}</Text>
                    <Text style={styles.statLabel}>משתתפים</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>
                      {wedding.matchesCount !== undefined && wedding.matchesCount !== null 
                        ? wedding.matchesCount 
                        : 'N/A'}
                    </Text>
                    <Text style={styles.statLabel}>שידוכים פעילים</Text>
                  </View>
                </View>

                {wedding.status === 'ACTIVE' && (
                  <View style={styles.actionsRow}>
                    <AppButton
                      title="סגירת חתונה"
                      onPress={handleCloseWedding}
                      loading={actionLoading}
                      style={styles.closeButton}
                    />
                    <AppButton
                      title="ביטול חתונה"
                      onPress={handleCancelWedding}
                      loading={actionLoading}
                      style={styles.cancelButton}
                    />
                  </View>
                )}
              </View>
            )}

            {wedding && (
              <WeddingJoinQrCard
                accessCode={wedding.accessCode}
                status={wedding.status}
                weddingName={wedding.name}
                city={wedding.city}
                weddingDate={wedding.weddingDate}
              />
            )}

            {wedding && (
              <WeddingBackgroundManager
                backgroundImageUrl={wedding.backgroundImageUrl}
                onUpload={handleUploadBackground}
                onDelete={handleDeleteBackground}
              />
            )}

            {wedding && wedding.status === 'ACTIVE' && (
              <View style={styles.addParticipantContainer}>
                <Text style={styles.sectionTitle}>הזמנת משתמש חדש</Text>
                <Text style={styles.addParticipantSubtitle}>
                  הזמן משתמש חדש להצטרף לחתונה.
                </Text>
                <View style={styles.addFormCol}>
                  <TextInput
                    style={[styles.input, { marginBottom: theme.spacing.s, width: '100%' }]}
                    value={newInviteName}
                    onChangeText={setNewInviteName}
                    placeholder="שם מלא"
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={[styles.input, { marginBottom: theme.spacing.s, width: '100%' }]}
                    value={newInviteEmail}
                    onChangeText={setNewInviteEmail}
                    placeholder="כתובת אימייל"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <AppButton 
                    title="יצירת הזמנה" 
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
                  <Text style={styles.sectionTitle}>הזמנות</Text>
                  <Text style={styles.listCount}>({invites.length})</Text>
                </View>
                {invites.map(invite => (
                  <View key={`invite-${invite.id}`} style={styles.participantCard}>
                    {invite.status === 'PENDING' && wedding?.status === 'ACTIVE' && (
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleCancelInvite(invite.id)}
                      >
                        <Text style={styles.removeButtonText}>ביטול</Text>
                      </TouchableOpacity>
                    )}
                    {invite.status === 'CANCELLED' && wedding?.status === 'ACTIVE' && (
                      <TouchableOpacity 
                        style={styles.restoreButton}
                        onPress={() => handleRestoreInvite(invite.id)}
                      >
                        <Text style={styles.restoreButtonText}>החזרת הזמנה</Text>
                      </TouchableOpacity>
                    )}
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>{invite.fullName}</Text>
                      <Text style={styles.participantDetail}>{invite.email}</Text>
                      <View style={styles.participantStatusContainer}>
                        <Text style={[
                          styles.statusLabel,
                          invite.status === 'ACCEPTED' ? styles.statusActive : 
                          invite.status === 'CANCELLED' ? styles.statusRemoved : { color: '#FF9800', fontWeight: '600' }
                        ]}>
                          סטטוס: {getInviteStatusLabel(invite.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {wedding && wedding.status === 'ACTIVE' && (
              <View style={styles.addParticipantContainer}>
                <Text style={styles.sectionTitle}>הוספת משתמש קיים לפי אימייל</Text>
                <Text style={styles.addParticipantSubtitle}>
                  הוספת משתמש רשום קיים באמצעות כתובת האימייל שלו.
                </Text>
                <View style={styles.addFormRow}>
                  <TextInput
                    style={styles.input}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder="כתובת אימייל של המשתמש"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <AppButton 
                    title="הוספה" 
                    onPress={handleAddParticipant} 
                    loading={actionLoading}
                    style={styles.addButton}
                  />
                </View>
              </View>
            )}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>רשימת משתתפים</Text>
              <Text style={styles.listCount}>({participants.length})</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>עדיין לא נמצאו משתתפים לחתונה זו.</Text>
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
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
    textAlign: 'right',
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
    flexDirection: 'row-reverse',
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: theme.spacing.m,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#757575',
    marginLeft: theme.spacing.s,
    paddingVertical: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    marginRight: theme.spacing.s,
    paddingVertical: 12,
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
    textAlign: 'right',
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  listCount: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  addParticipantSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
    textAlign: 'right',
  },
  addFormRow: {
    flexDirection: 'row-reverse',
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
    marginLeft: theme.spacing.s,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: '#FAFAFA',
    textAlign: 'right',
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  participantInfo: {
    flex: 1,
    marginLeft: theme.spacing.s,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
    textAlign: 'right',
  },
  participantDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textAlign: 'right',
  },
  participantStatusContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  statusLabel: {
    fontSize: 12,
    marginLeft: theme.spacing.m,
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
