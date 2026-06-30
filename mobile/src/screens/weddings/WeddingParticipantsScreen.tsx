import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { adminApi } from '../../api/adminApi';
import {
  getParticipants as emGetParticipants,
  addParticipant as emAddParticipant,
  removeParticipant as emRemoveParticipant,
  createInvite as emCreateInvite
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'ADD' | 'INVITE'>('ADD');

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

  const handleCloseModal = () => {
    setNewEmail('');
    setInviteName('');
    setInviteEmail('');
    setIsModalVisible(false);
  };

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
      handleCloseModal();
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
      if (mode === 'ADMIN') {
        await adminApi.createInvite(weddingId, { fullName: trimmedName, email: trimmedEmail });
      } else {
        await emCreateInvite(weddingId, { fullName: trimmedName, email: trimmedEmail });
      }
      Alert.alert(
        'הצלחה',
        `נוצרה הזמנה עבור ${trimmedName}. שים לב: המוזמן לא יתווסף אוטומטית לרשימת המשתתפים.`
      );
      handleCloseModal();
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
              <AppButton
                title="הוסף / הזמן משתתף"
                onPress={() => setIsModalVisible(true)}
                style={styles.openModalButton}
              />
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

      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={handleCloseModal}>
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>הוסף / הזמן משתתף</Text>

                  {/* Tab Selector */}
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[styles.tabButton, activeTab === 'ADD' && styles.activeTabButton]}
                      onPress={() => setActiveTab('ADD')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tabButtonText, activeTab === 'ADD' && styles.activeTabButtonText]}>
                        הוספת משתמש קיים
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tabButton, activeTab === 'INVITE' && styles.activeTabButton]}
                      onPress={() => setActiveTab('INVITE')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tabButtonText, activeTab === 'INVITE' && styles.activeTabButtonText]}>
                        הזמנת משתמש חדש
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {activeTab === 'ADD' ? (
                    <View style={styles.formContainer}>
                      <Text style={styles.formSubtitle}>הוספת משתמש רשום קיים באמצעות כתובת האימייל שלו.</Text>
                      <AppInput
                        label="כתובת אימייל"
                        value={newEmail}
                        onChangeText={setNewEmail}
                        placeholder="email@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!actionLoading}
                      />
                      <View style={styles.modalActions}>
                        <AppButton
                          title="ביטול"
                          onPress={handleCloseModal}
                          variant="secondary"
                          disabled={actionLoading}
                          style={styles.modalButton}
                        />
                        <AppButton
                          title="הוספה"
                          onPress={handleAddParticipant}
                          loading={actionLoading}
                          style={styles.modalButton}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.formContainer}>
                      <Text style={styles.formSubtitle}>
                        הזמנת משתמש חדש באמצעות שם מלא ואימייל. שים לב: המוזמן לא יתווסף אוטומטית לרשימת המשתתפים.
                      </Text>
                      <AppInput
                        label="שם מלא"
                        value={inviteName}
                        onChangeText={setInviteName}
                        placeholder="שם מלא"
                        autoCapitalize="words"
                        editable={!actionLoading}
                      />
                      <AppInput
                        label="כתובת אימייל"
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        placeholder="email@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!actionLoading}
                      />
                      <View style={styles.modalActions}>
                        <AppButton
                          title="ביטול"
                          onPress={handleCloseModal}
                          variant="secondary"
                          disabled={actionLoading}
                          style={styles.modalButton}
                        />
                        <AppButton
                          title="יצירת הזמנה"
                          onPress={handleCreateInvite}
                          loading={actionLoading}
                          style={styles.modalButton}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'right',
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
  openModalButton: {
    marginVertical: theme.spacing.s,
    backgroundColor: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.l,
    borderTopRightRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.l,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  tabContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F5F5F5',
    borderRadius: theme.borderRadius.m,
    padding: 4,
    marginBottom: theme.spacing.m,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.s,
  },
  activeTabButton: {
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: theme.colors.primary,
  },
  formContainer: {
    width: '100%',
  },
  formSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginBottom: theme.spacing.m,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: theme.spacing.m,
    marginTop: theme.spacing.m,
  },
  modalButton: {
    flex: 1,
  },
});
