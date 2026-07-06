import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { adminApi } from '../../api/adminApi';
import { MainStackParamList } from '../../navigation/MainStack';
import { AdminEventManagerDetailsResponse, ManagedWeddingSummaryResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getWeddingStatusLabel, getUserRoleLabel, formatDisplayDate } from '../../utils/displayLabels';

type DetailsRouteProp = RouteProp<MainStackParamList, 'AdminEventManagerDetails'>;
type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminEventManagerDetails'>;

export const AdminEventManagerDetailsScreen = () => {
  const route = useRoute<DetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { managerId } = route.params;

  const [manager, setManager] = useState<AdminEventManagerDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [selectedWeddingIds, setSelectedWeddingIds] = useState<number[]>([]);
  const activeRequestId = useRef(0);

  const fetchDetails = useCallback(async (isSilent = false) => {
    const requestId = ++activeRequestId.current;
    if (!isSilent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    try {
      const data = await adminApi.getEventManagerDetails(managerId);
      if (activeRequestId.current !== requestId) return;
      setManager(data);
      // Reconcile selection state with refreshed details
      setSelectedWeddingIds(prev => prev.filter(id => data.weddings.some(w => w.id === id)));
    } catch (err) {
      if (activeRequestId.current !== requestId) return;
      console.error(err);
      setError(getFriendlyErrorMessage(err, 'טעינת פרטי מנהל האירוע נכשלה.'));
    } finally {
      if (activeRequestId.current === requestId) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [managerId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useFocusEffect(
    useCallback(() => {
      fetchDetails(true);
    }, [fetchDetails])
  );

  const handleBlock = () => {
    const hasWeddings = manager && manager.weddings.length > 0;
    const warning = hasWeddings
      ? '\n\nשים לב: מנהל האירוע עדיין מנהל חתונות פעילות. חסימת מנהל האירוע לא תעביר את החתונות שלו באופן אוטומטי.'
      : '';

    Alert.alert(
      'חסימת מנהל אירוע',
      `האם אתה בטוח שברצונך לחסום מנהל אירוע זה?${warning}`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'חסום',
          style: 'destructive',
          onPress: async () => {
            setActionInProgress(true);
            try {
              await adminApi.blockEventManager(managerId);
              Alert.alert('הצלחה', 'מנהל האירוע נחסם בהצלחה.');
              fetchDetails(true);
            } catch (err) {
              Alert.alert('שגיאה', getFriendlyErrorMessage(err, 'חסימת מנהל האירוע נכשלה.'));
            } finally {
              setActionInProgress(false);
            }
          }
        }
      ]
    );
  };

  const handleUnblock = () => {
    Alert.alert(
      'ביטול חסימת מנהל אירוע',
      'האם אתה בטוח שברצונך לבטל את החסימה של מנהל אירוע זה?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'בטל חסימה',
          onPress: async () => {
            setActionInProgress(true);
            try {
              await adminApi.unblockEventManager(managerId);
              Alert.alert('הצלחה', 'חסימת מנהל האירוע בוטלה בהצלחה.');
              fetchDetails(true);
            } catch (err) {
              Alert.alert('שגיאה', getFriendlyErrorMessage(err, 'ביטול חסימת מנהל האירוע נכשל.'));
            } finally {
              setActionInProgress(false);
            }
          }
        }
      ]
    );
  };

  const handleDeactivate = () => {
    const hasWeddings = manager && manager.weddings.length > 0;
    const warning = hasWeddings
      ? '\n\nשים לב: מנהל האירוע עדיין מנהל חתונות פעילות. השבתת מנהל האירוע לא תעביר את החתונות שלו באופן אוטומטי.'
      : '';

    Alert.alert(
      'השבתת מנהל אירוע',
      `האם אתה בטוח שברצונך להשבית מנהל אירוע זה?${warning}`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'השבת',
          style: 'destructive',
          onPress: async () => {
            setActionInProgress(true);
            try {
              await adminApi.deactivateEventManager(managerId);
              Alert.alert('הצלחה', 'מנהל האירוע הושבת בהצלחה.');
              fetchDetails(true);
            } catch (err) {
              Alert.alert('שגיאה', getFriendlyErrorMessage(err, 'השבתת מנהל האירוע נכשלה.'));
            } finally {
              setActionInProgress(false);
            }
          }
        }
      ]
    );
  };

  const handleActivate = () => {
    Alert.alert(
      'הפעלת מנהל אירוע',
      'האם אתה בטוח שברצונך להפעיל מנהל אירוע זה?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'הפעל',
          onPress: async () => {
            setActionInProgress(true);
            try {
              await adminApi.activateEventManager(managerId);
              Alert.alert('הצלחה', 'מנהל האירוע הופעל בהצלחה.');
              fetchDetails(true);
            } catch (err) {
              Alert.alert('שגיאה', getFriendlyErrorMessage(err, 'הפעלת מנהל האירוע נכשלה.'));
            } finally {
              setActionInProgress(false);
            }
          }
        }
      ]
    );
  };

  const handleReassign = () => {
    if (selectedWeddingIds.length === 0) return;

    Alert.alert(
      'העברת חתונות למנהל הנוכחי',
      `האם אתה בטוח שברצונך להסיר ${selectedWeddingIds.length} חתונות שנבחרו ממנהל האירוע ולהעביר את ניהולן אליך (מנהל המערכת הנוכחי)?\n\n` +
      '• פעולה זו אינה מוחקת את החתונות.\n' +
      '• הסטטוס, המשתתפים, ההזמנות, ההתאמות וההיסטוריה של החתונות יישארו ללא שינוי.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'העבר ניהול',
          onPress: async () => {
            setActionInProgress(true);
            try {
              const updated = await adminApi.reassignManagedWeddingsToCurrentAdmin(managerId, selectedWeddingIds);
              setManager(updated);
              setSelectedWeddingIds([]);
              Alert.alert('הצלחה', 'החתונות הועברו אליך בהצלחה.');
              fetchDetails(true);
            } catch (err) {
              Alert.alert('שגיאה', getFriendlyErrorMessage(err, 'העברת החתונות נכשלה.'));
            } finally {
              setActionInProgress(false);
            }
          }
        }
      ]
    );
  };

  const toggleSelectWedding = (weddingId: number) => {
    setSelectedWeddingIds(prev =>
      prev.includes(weddingId)
        ? prev.filter(id => id !== weddingId)
        : [...prev, weddingId]
    );
  };

  const renderWeddingItem = ({ item }: { item: ManagedWeddingSummaryResponse }) => {
    const isSelected = selectedWeddingIds.includes(item.id);
    return (
      <View style={styles.weddingCard}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleSelectWedding(item.id)}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <View style={styles.checkboxInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.weddingDetailsContainer}
          onPress={() => navigation.navigate('AdminWeddingDetails', { weddingId: item.id })}
        >
          <Text style={styles.weddingName}>{item.name}</Text>
          <Text style={styles.weddingInfo}>עיר: {item.city}</Text>
          <Text style={styles.weddingInfo}>תאריך: {formatDisplayDate(item.weddingDate)}</Text>
          <Text style={styles.weddingInfo}>סטטוס: {getWeddingStatusLabel(item.status)}</Text>
          <Text style={styles.weddingInfo}>קוד גישה: {item.accessCode}</Text>
          <Text style={styles.weddingInfo}>משתתפים: {item.participantsCount} | שידוכים: {item.matchesCount}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !manager) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Screen>
    );
  }

  if (error && !manager) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchDetails()}>
          <Text style={styles.retryButtonText}>נסה שוב</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  if (!manager) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.errorText}>מנהל האירוע לא נמצא.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>חזור</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  const isBlocked = manager.adminBlocked;
  const isActive = manager.eventManagerActive !== false;

  return (
    <Screen>
      <FlatList
        data={manager.weddings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderWeddingItem}
        refreshing={refreshing}
        onRefresh={() => fetchDetails(true)}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.managerTitle}>{manager.fullName}</Text>
              <Text style={styles.managerSub}>{manager.email}</Text>
              <Text style={styles.infoText}>תפקיד: {getUserRoleLabel(manager.role)}</Text>
              <Text style={styles.infoText}>תאריך הצטרפות: {formatDisplayDate(manager.createdAt)}</Text>
              <Text style={styles.infoText}>חתונות בניהולו: {manager.weddings.length}</Text>

              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, isBlocked ? styles.badgeDanger : styles.badgeSuccess]}>
                  <Text style={styles.badgeText}>{isBlocked ? 'חסום' : 'לא חסום'}</Text>
                </View>
                <View style={[styles.statusBadge, isActive ? styles.badgeSuccess : styles.badgeDanger]}>
                  <Text style={styles.badgeText}>{isActive ? 'פעיל במערכת' : 'מושבת במערכת'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionsCard}>
              <Text style={styles.sectionTitle}>פעולות ניהול חשבון</Text>
              <View style={styles.buttonRow}>
                {isActive ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.dangerBtn, actionInProgress && styles.disabledBtn]}
                    onPress={handleDeactivate}
                    disabled={actionInProgress}
                  >
                    <Text style={styles.actionBtnText}>השבת מנהל</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.successBtn, actionInProgress && styles.disabledBtn]}
                    onPress={handleActivate}
                    disabled={actionInProgress}
                  >
                    <Text style={styles.actionBtnText}>הפעל מנהל</Text>
                  </TouchableOpacity>
                )}

                {isBlocked ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.successBtn, actionInProgress && styles.disabledBtn]}
                    onPress={handleUnblock}
                    disabled={actionInProgress}
                  >
                    <Text style={styles.actionBtnText}>בטל חסימה</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.dangerBtn, actionInProgress && styles.disabledBtn]}
                    onPress={handleBlock}
                    disabled={actionInProgress}
                  >
                    <Text style={styles.actionBtnText}>חסום מנהל</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {manager.weddings.length > 0 && (
              <View style={styles.reassignCard}>
                <Text style={styles.sectionTitle}>העברת חתונות לניהולך</Text>
                <Text style={styles.reassignInfo}>
                  בחר חתונות מרשימת החתונות למטה, והעבר את הניהול שלהן למשתמש האדמין הנוכחי שלך.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.reassignSubmitBtn,
                    (selectedWeddingIds.length === 0 || actionInProgress) && styles.reassignSubmitBtnDisabled
                  ]}
                  onPress={handleReassign}
                  disabled={selectedWeddingIds.length === 0 || actionInProgress}
                >
                  <Text style={styles.reassignSubmitBtnText}>
                    העבר {selectedWeddingIds.length} חתונות שנבחרו
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.listTitle}>רשימת חתונות בניהולו</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>אין חתונות בניהולו של מנהל אירוע זה.</Text>
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
    padding: theme.spacing.l,
  },
  listContainer: {
    padding: theme.spacing.m,
  },
  headerContainer: {
    marginBottom: theme.spacing.m,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: theme.spacing.m,
  },
  managerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: 4,
  },
  managerSub: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginBottom: theme.spacing.m,
  },
  infoText: {
    fontSize: 15,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.s,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    gap: theme.spacing.s,
    marginTop: theme.spacing.m,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.s,
  },
  badgeSuccess: {
    backgroundColor: '#E8F5E9',
  },
  badgeDanger: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  actionsCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.m,
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    gap: theme.spacing.m,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBtn: {
    backgroundColor: theme.colors.primary,
  },
  dangerBtn: {
    backgroundColor: theme.colors.error,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  actionBtnText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 15,
  },
  reassignCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: theme.spacing.m,
  },
  reassignInfo: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginBottom: theme.spacing.m,
  },
  reassignSubmitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reassignSubmitBtnDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  reassignSubmitBtnText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'right',
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  weddingCard: {
    flexDirection: 'row-reverse',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
    backgroundColor: '#FAFAFA',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: theme.colors.surface,
  },
  weddingDetailsContainer: {
    flex: 1,
    padding: theme.spacing.m,
  },
  weddingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: 4,
  },
  weddingInfo: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginBottom: 2,
  },
  emptyContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
  },
  retryButtonText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
});
