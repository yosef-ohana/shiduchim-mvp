import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { adminApi } from '../../api/adminApi';
import {
  getParticipants as emGetParticipants,
  addParticipant as emAddParticipant,
  removeParticipant as emRemoveParticipant
} from '../../api/eventManagerApi';
import { ParticipantResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getParticipantStatusLabel, getGenderLabel } from '../../utils/displayLabels';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';

const getProfileStatusLabel = (status: string) => {
  switch (status) {
    case 'NONE':
      return 'ללא פרופיל';
    case 'BASIC':
      return 'פרופיל בסיסי';
    case 'FULL':
      return 'פרופיל מלא';
    case 'FULL_INCOMPLETE_BLOCKED':
      return 'פרופיל חסום';
    default:
      return status;
  }
};

export const WeddingParticipantsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { weddingId, mode, weddingName, weddingStatus } = route.params;

  const [participants, setParticipants] = useState<ParticipantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      let data: ParticipantResponse[] = [];
      if (mode === 'ADMIN') {
        data = await adminApi.getParticipants(weddingId);
      } else {
        data = await emGetParticipants(weddingId);
      }
      setParticipants(data);
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'טעינת רשימת המשתתפים נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      if (weddingName) {
        navigation.setOptions({ title: `משתתפי החתונה: ${weddingName}` });
      }
    }, [weddingId, weddingName, mode])
  );

  const handleAddParticipant = async () => {
    if (!newEmail.trim()) {
      Alert.alert('שגיאת אימות', 'אנא הזן כתובת אימייל תקינה.');
      return;
    }
    setActionLoading(true);
    try {
      if (mode === 'ADMIN') {
        await adminApi.addParticipant(weddingId, { email: newEmail.trim() });
      } else {
        await emAddParticipant(weddingId, { email: newEmail.trim() });
      }
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
    const trimmedName = inviteName.trim();
    const trimmedEmail = inviteEmail.trim();

    if (!trimmedName) {
      Alert.alert('שגיאת אימות', 'אנא הזן שם מלא.');
      return;
    }
    if (!trimmedEmail) {
      Alert.alert('שגיאת אימות', 'אנא הזן כתובת אימייל.');
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.createInvite(weddingId, { fullName: trimmedName, email: trimmedEmail });
      Alert.alert(
        'הצלחה',
        `נוצרה הזמנה עבור ${trimmedName}. שים לב: המוזמן לא יתווסף אוטומטית לרשימת המשתתפים.`
      );
      setInviteName('');
      setInviteEmail('');
    } catch (error: any) {
      console.error(error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'יצירת ההזמנה נכשלה.'));
    } finally {
      setActionLoading(false);
    }
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
              if (mode === 'ADMIN') {
                await adminApi.removeParticipant(weddingId, userId);
              } else {
                await emRemoveParticipant(weddingId, userId);
              }
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

  const renderParticipant = ({ item }: { item: ParticipantResponse }) => {
    const isParticipantActive = item.participantStatus === 'ACTIVE';
    const isWeddingActive = weddingStatus === 'ACTIVE';

    return (
      <TouchableOpacity
        style={styles.participantCard}
        onPress={() => {
          navigation.navigate('StaffParticipantDetails', {
            weddingId,
            userId: item.userId,
            mode,
            weddingName,
            weddingStatus,
          });
        }}
        activeOpacity={0.7}
      >
        {isParticipantActive && isWeddingActive && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={(e) => {
              // Prevent the parent card press if possible, though React Native handles inner touchables nicely.
              handleRemoveParticipant(item.userId, item.email);
            }}
            disabled={actionLoading}
          >
            <Text style={styles.removeButtonText}>הסרה</Text>
          </TouchableOpacity>
        )}
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{item.fullName}</Text>
          <Text style={styles.participantDetail}>{item.email}</Text>
          <View style={styles.participantStatusContainer}>
            <Text style={styles.profileLabel}>
              פרופיל: {getProfileStatusLabel(item.profileStatus)}
            </Text>
            <Text style={styles.genderLabel}>
              מין: {getGenderLabel(item.gender)}
            </Text>
            <Text style={styles.photoLabel}>
              {item.hasPrimaryPhoto ? '📸 יש תמונה' : '❌ ללא תמונה'}
            </Text>
            <Text style={[
              styles.statusLabel,
              isParticipantActive ? styles.statusActive : styles.statusRemoved
            ]}>
              סטטוס: {getParticipantStatusLabel(item.participantStatus)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && participants.length === 0) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  const isWeddingActive = weddingStatus === 'ACTIVE';

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
            {!isWeddingActive && (
              <View style={styles.bannerContainer}>
                <Text style={styles.bannerText}>
                  החתונה סגורה/מבוטלת — רשימת המשתתפים מוצגת לקריאה בלבד.
                </Text>
              </View>
            )}

            {isWeddingActive && (
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
                    editable={!actionLoading}
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

            {isWeddingActive && mode === 'ADMIN' && (
              <View style={styles.addParticipantContainer}>
                <Text style={styles.sectionTitle}>הזמנת משתמש חדש לחתונה</Text>
                <Text style={styles.addParticipantSubtitle}>
                  הזמנת משתמש חדש באמצעות שם מלא ואימייל. שים לב: המוזמן לא יתווסף אוטומטית לרשימת המשתתפים.
                </Text>
                <View style={styles.addFormCol}>
                  <TextInput
                    style={[styles.input, styles.stackedInput]}
                    value={inviteName}
                    onChangeText={setInviteName}
                    placeholder="שם מלא"
                    autoCapitalize="words"
                    editable={!actionLoading}
                  />
                  <TextInput
                    style={[styles.input, styles.stackedInput]}
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    placeholder="כתובת אימייל"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!actionLoading}
                  />
                  <AppButton
                    title="יצירת הזמנה"
                    onPress={handleCreateInvite}
                    loading={actionLoading}
                    style={styles.submitInviteButton}
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
            <Text style={styles.emptyText}>אין משתתפים בחתונה זו עדיין.</Text>
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
  addParticipantContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
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
  addParticipantSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: theme.spacing.m,
    textAlign: 'right',
  },
  addFormRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.s,
    fontSize: 15,
    textAlign: 'right',
    marginLeft: theme.spacing.s,
  },
  addButton: {
    minWidth: 80,
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  listCount: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  participantCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantInfo: {
    flex: 1,
    marginLeft: theme.spacing.s,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'right',
  },
  participantDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  participantStatusContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginTop: theme.spacing.s,
    gap: 8,
  },
  profileLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
  },
  genderLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
  },
  photoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
  },
  statusActive: {
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  statusRemoved: {
    color: '#C62828',
    backgroundColor: '#FFEBEE',
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: theme.borderRadius.m,
  },
  removeButtonText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  addFormCol: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  stackedInput: {
    width: '100%',
    marginLeft: 0,
    marginBottom: theme.spacing.s,
  },
  submitInviteButton: {
    marginTop: theme.spacing.s,
    width: '100%',
  },
  bannerContainer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    borderWidth: 1,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  bannerText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
