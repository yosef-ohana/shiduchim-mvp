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

type DetailsRouteProp = RouteProp<MainStackParamList, 'AdminWeddingDetails'>;
type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminWeddingDetails'>;

export const AdminWeddingDetailsScreen = () => {
  const route = useRoute<DetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { weddingId } = route.params;

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
    try {
      const updated = await adminApi.closeWedding(weddingId);
      setWedding(updated);
      Alert.alert('הצלחה', 'החתונה נסגרה בהצלחה');
    } catch (error: any) {
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'סגירת החתונה נכשלה.'));
    }
  };

  const handleCancel = async () => {
    try {
      const updated = await adminApi.cancelWedding(weddingId);
      setWedding(updated);
      Alert.alert('הצלחה', 'החתונה בוטלה בהצלחה');
    } catch (error: any) {
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'ביטול החתונה נכשל.'));
    }
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


  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      </Screen>
    );
  }

  if (!wedding) return null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
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

        {wedding && (
          <WeddingJoinQrCard
            accessCode={wedding.accessCode}
            status={wedding.status}
            weddingName={wedding.name}
          />
        )}

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>שיוך מנהל אירוע</Text>
          
          <ScrollView style={styles.managerList} nestedScrollEnabled={true}>
            {eventManagers.map(manager => (
              <TouchableOpacity
                key={manager.id}
                style={[
                  styles.managerCard,
                  managerIdInput === manager.id.toString() && styles.managerCardSelected
                ]}
                onPress={() => setManagerIdInput(manager.id.toString())}
              >
                <Text style={styles.managerName}>{manager.fullName}</Text>
                <Text style={styles.managerEmail}>{manager.email}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={[styles.fullBtn, { backgroundColor: theme.colors.primary, opacity: managerIdInput ? 1 : 0.5 }]} 
            onPress={handleAssignManager}
            disabled={!managerIdInput}
          >
            <Text style={styles.btnText}>שיוך מנהל אירוע שנבחר</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.fullBtn, { backgroundColor: theme.colors.primary }]} onPress={handleAssignSelf}>
            <Text style={styles.btnText}>שיוך עצמי</Text>
          </TouchableOpacity>

          {wedding.status === 'ACTIVE' && (
            <>
              <TouchableOpacity style={[styles.fullBtn, { backgroundColor: '#f0ad4e' }]} onPress={handleClose}>
                <Text style={styles.btnText}>סגירת חתונה</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.fullBtn, { backgroundColor: '#d9534f' }]} onPress={handleCancel}>
                <Text style={styles.btnText}>ביטול חתונה</Text>
              </TouchableOpacity>
            </>
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
        </View>
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
});
