import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { adminApi } from '../../api/adminApi';
import { MainStackParamList } from '../../navigation/MainStack';
import { AdminWeddingResponse, WeddingInviteResponse, AdminUserResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getWeddingStatusLabel, getInviteStatusLabel, formatDisplayDate } from '../../utils/displayLabels';
import { WeddingJoinQrCard } from '../../components/WeddingJoinQrCard';
import { WeddingBackgroundManager } from '../../components/WeddingBackgroundManager';
import { useAuth } from '../../context/AuthContext';

type DetailsRouteProp = RouteProp<MainStackParamList, 'AdminWeddingDetails'>;
type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminWeddingDetails'>;

export const AdminWeddingDetailsScreen = () => {
  const route = useRoute<DetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { weddingId } = route.params;
  const { user } = useAuth();

  const [wedding, setWedding] = useState<AdminWeddingResponse | null>(null);
  const [invites, setInvites] = useState<WeddingInviteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [managerIdInput, setManagerIdInput] = useState('');
  const [eventManagers, setEventManagers] = useState<AdminUserResponse[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allWeddings, managers] = await Promise.all([
        adminApi.getWeddings(),
        adminApi.getEventManagers()
      ]);
      setEventManagers(managers);

      const found = allWeddings.find(w => w.id === weddingId);
      if (found) {
        setWedding(found);
        try {
          const invitesData = await adminApi.getInvites(weddingId);
          setInvites(invitesData);
        } catch (e) {
          // It's possible the admin doesn't have invites yet, fail silently
        }
      } else {
        Alert.alert('שגיאה', 'החתונה לא נמצאה.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'טעינת פרטי החתונה או מנהלי האירועים נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [weddingId]);

  const handleAssignManager = async () => {
    if (!managerIdInput) return;
    try {
      const updated = await adminApi.assignManager(weddingId, { managerId: parseInt(managerIdInput, 10) });
      setWedding(updated);
      setManagerIdInput('');
      Alert.alert('הצלחה', 'מנהל האירוע שויך בהצלחה');
    } catch (error: any) {
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'הקצאת מנהל האירועים נכשלה.'));
    }
  };

  const handleAssignSelf = async () => {
    try {
      const updated = await adminApi.assignSelfToWedding(weddingId);
      setWedding(updated);
      Alert.alert('הצלחה', 'החתונה שויכה אליך בהצלחה');
    } catch (error: any) {
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'שיוך עצמי לחתונה נכשל.'));
    }
  };

  const handleClose = async () => {
    Alert.alert(
      'סגירת חתונה',
      'האם אתה בטוח שברצונך לסגור חתונה זו? החתונה תפסיק להיות פעילה ולא ניתן יהיה לנהל עבורה את הרקע.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'סגור חתונה',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await adminApi.closeWedding(weddingId);
              setWedding(updated);
              Alert.alert('הצלחה', 'החתונה נסגרה בהצלחה');
            } catch (error: any) {
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'סגירת החתונה נכשלה.'));
            }
          }
        }
      ]
    );
  };

  const handleCancel = async () => {
    Alert.alert(
      'ביטול חתונה',
      'האם אתה בטוח שברצונך לבטל חתונה זו? החתונה תפסיק להיות פעילה ולא ניתן יהיה לנהל עבורה את הרקע.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'בטל חתונה',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await adminApi.cancelWedding(weddingId);
              setWedding(updated);
              Alert.alert('הצלחה', 'החתונה בוטלה בהצלחה');
            } catch (error: any) {
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'ביטול החתונה נכשל.'));
            }
          }
        }
      ]
    );
  };

  const handleRestoreInvite = async (inviteId: number) => {
    Alert.alert(
      'שחזור הזמנה',
      'האם אתה בטוח שברצונך לשחזר הזמנה זו?',
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'כן, שחזר', 
          onPress: async () => {
            setLoading(true);
            try {
              await adminApi.restoreInvite(weddingId, inviteId);
              Alert.alert('הצלחה', 'ההזמנה שוחזרה בהצלחה.');
              await fetchData();
            } catch (error: any) {
              console.error(error);
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'החזרת ההזמנה נכשלה.'));
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleUploadBackground = async (uri: string, mimeType?: string, fileName?: string) => {
    try {
      const updated = await adminApi.uploadWeddingBackground(weddingId, uri, mimeType, fileName);
      setWedding(updated);
      Alert.alert('הצלחה', 'תמונת הרקע הועלתה בהצלחה.');
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteBackground = async () => {
    try {
      const updated = await adminApi.deleteWeddingBackground(weddingId);
      setWedding(updated);
      Alert.alert('הצלחה', 'תמונת הרקע הוסרה בהצלחה.');
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      </Screen>
    );
  }

  if (!wedding) return null;

  const isInactiveWedding = wedding.status === 'CLOSED' || wedding.status === 'CANCELLED';
  const isWeddingActive = wedding.status === 'ACTIVE';
  const isCurrentUserOwner = user?.id === wedding.ownerUserId;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {isInactiveWedding && (
          <View style={styles.bannerContainer}>
            <Text style={styles.bannerTitle}>
              {wedding.status === 'CLOSED' ? 'החתונה סגורה' : 'החתונה בוטלה'}
            </Text>
            <Text style={styles.bannerBody}>
              המסך מוצג לקריאה בלבד. לא ניתן לבצע פעולות ניהול פעילות עד החזרה לפעילות במחזור נפרד.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.title}>{wedding.name}</Text>
          <Text style={styles.info}>מזהה חתונה: {wedding.id}</Text>
          <Text style={styles.info}>עיר: {wedding.city || 'לא צוין'}</Text>
          <Text style={styles.info}>תאריך החתונה: {formatDisplayDate(wedding.weddingDate)}</Text>
          <Text style={styles.info}>סטטוס: {getWeddingStatusLabel(wedding.status)}</Text>
          <Text style={styles.info}>קוד גישה: {wedding.accessCode || 'לא צוין'}</Text>
          <Text style={styles.info}>
            בעלים: {wedding.ownerName ? `${wedding.ownerName} (${wedding.ownerEmail})` : 'לא צוין'} (מזהה: {wedding.ownerUserId || 'לא צוין'})
          </Text>
          <Text style={styles.info}>משתתפים: {wedding.participantsCount}</Text>
          <Text style={styles.info}>שידוכים: {wedding.matchesCount}</Text>
        </View>

        <TouchableOpacity
          style={[styles.fullBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('WeddingParticipants', {
            weddingId: wedding.id,
            mode: 'ADMIN',
            weddingName: wedding.name,
            weddingStatus: wedding.status
          })}
        >
          <Text style={styles.btnText}>
            {isWeddingActive ? 'צפייה וניהול משתתפי החתונה' : 'צפייה במשתתפי החתונה — קריאה בלבד'}
          </Text>
        </TouchableOpacity>

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
            status={wedding.status}
          />
        )}

        {isWeddingActive && (
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>שיוך מנהל אירוע</Text>

            <ScrollView style={styles.managerList} nestedScrollEnabled={true}>
              {eventManagers.map(manager => {
                const isCurrentOwner = manager.id === wedding.ownerUserId;
                return (
                  <TouchableOpacity
                    key={manager.id}
                    style={[
                      styles.managerCard,
                      managerIdInput === manager.id.toString() && styles.managerCardSelected,
                      isCurrentOwner && styles.managerCardCurrent
                    ]}
                    onPress={() => setManagerIdInput(manager.id.toString())}
                    disabled={isCurrentOwner}
                  >
                    <View style={styles.managerHeaderRow}>
                      {isCurrentOwner && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>מנהל נוכחי</Text>
                        </View>
                      )}
                      <Text style={styles.managerName}>{manager.fullName}</Text>
                    </View>
                    <Text style={styles.managerEmail}>{manager.email}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.fullBtn,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: (managerIdInput && parseInt(managerIdInput, 10) !== wedding.ownerUserId) ? 1 : 0.5
                }
              ]}
              onPress={handleAssignManager}
              disabled={!managerIdInput || parseInt(managerIdInput, 10) === wedding.ownerUserId}
            >
              <Text style={styles.btnText}>שיוך מנהל אירוע שנבחר</Text>
            </TouchableOpacity>

            {isCurrentUserOwner ? (
              <View style={[styles.fullBtn, styles.disabledBtn]}>
                <Text style={styles.disabledBtnText}>החתונה כבר משויכת אליך</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.fullBtn, { backgroundColor: theme.colors.primary }]} onPress={handleAssignSelf}>
                <Text style={styles.btnText}>שיוך עצמי</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.fullBtn, { backgroundColor: '#f0ad4e' }]} onPress={handleClose}>
              <Text style={styles.btnText}>סגירת חתונה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.fullBtn, { backgroundColor: '#d9534f' }]} onPress={handleCancel}>
              <Text style={styles.btnText}>ביטול חתונה</Text>
            </TouchableOpacity>
          </View>
        )}

        {invites.length > 0 && (
          <View style={styles.invitesContainer}>
            <Text style={styles.sectionTitle}>הזמנות ({invites.length})</Text>
            {invites.map((invite) => (
              <View key={`invite-${invite.id}`} style={styles.inviteCard}>
                <View style={{ flex: 1, marginRight: theme.spacing.s }}>
                  <Text style={styles.inviteName}>{invite.fullName}</Text>
                  <Text style={styles.inviteEmail}>{invite.email}</Text>
                  <Text style={styles.inviteStatus}>סטטוס: {getInviteStatusLabel(invite.status)}</Text>
                </View>
                {invite.status === 'CANCELLED' && wedding.status === 'ACTIVE' && (
                  <TouchableOpacity
                    style={styles.restoreBtn}
                    onPress={() => handleRestoreInvite(invite.id)}
                  >
                    <Text style={styles.restoreBtnText}>החזרת הזמנה</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
  },
  card: {
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
    textAlign: 'right',
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  actionsContainer: {
    marginTop: theme.spacing.s,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    marginBottom: theme.spacing.m,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: theme.spacing.s,
  },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.m,
    justifyContent: 'center',
    borderRadius: theme.borderRadius.s,
  },
  fullBtn: {
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  invitesContainer: {
    marginTop: theme.spacing.m,
  },
  inviteCard: {
    backgroundColor: '#FAFAFA',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.s,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restoreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: theme.borderRadius.s,
  },
  restoreBtnText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 13,
  },
  inviteName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  inviteEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textAlign: 'right',
  },
  inviteStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'right',
  },
  managerList: {
    maxHeight: 200,
    marginBottom: theme.spacing.m,
  },
  managerCard: {
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    backgroundColor: theme.colors.surface,
  },
  managerCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  managerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'right',
  },
  managerEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  managerHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  managerCardCurrent: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  disabledBtn: {
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  disabledBtnText: {
    color: '#888',
    fontWeight: 'bold',
  },
  bannerContainer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    borderWidth: 1,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C62828',
    textAlign: 'right',
    marginBottom: 4,
  },
  bannerBody: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'right',
  },
});
