import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { adminApi } from '../../api/adminApi';
import { MainStackParamList } from '../../navigation/MainStack';
import { theme } from '../../theme/theme';
import { AdminUserResponse } from '../../types/api';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { isValidDateString } from '../../utils/validation';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'CreateAdminWedding'>;

export const CreateAdminWeddingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventManagers, setEventManagers] = useState<AdminUserResponse[]>([]);

  const fetchManagers = async () => {
    try {
      const managers = await adminApi.getEventManagers();
      setEventManagers(managers);

      // Reconcile selection state: if currently selected manager is now blocked/inactive, clear selection
      if (ownerUserId) {
        const selectedManager = managers.find(m => m.id.toString() === ownerUserId);
        if (selectedManager) {
          const isBlocked = selectedManager.adminBlocked === true;
          const isActive = selectedManager.eventManagerActive !== false;
          if (isBlocked || !isActive) {
            setOwnerUserId('');
            Alert.alert('עדכון סטטוס', 'מנהל האירוע שנבחר אינו זמין יותר. אנא בחר מנהל אחר.');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load event managers', err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchManagers();
    });
    return unsubscribe;
  }, [navigation, ownerUserId]);

  const handleCreate = async () => {
    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedDate = weddingDate.trim();
    const trimmedAccessCode = accessCode.trim();

    if (!trimmedName || !trimmedCity || !trimmedDate) {
      Alert.alert('שגיאת אימות', 'שם, עיר ותאריך החתונה הם שדות חובה.');
      return;
    }
    if (!ownerUserId) {
      Alert.alert('שגיאת אימות', 'אנא בחר מנהל אירועים.');
      return;
    }

    if (!isValidDateString(trimmedDate)) {
      Alert.alert('שגיאת אימות', 'יש להזין תאריך במבנה YYYY-MM-DD, לדוגמה 2026-07-21.');
      return;
    }

    setLoading(true);
    try {
      const ownerId = ownerUserId ? parseInt(ownerUserId, 10) : undefined;
      await adminApi.createWedding({
        name: trimmedName,
        city: trimmedCity,
        weddingDate: trimmedDate,
        accessCode: trimmedAccessCode || undefined,
        ownerUserId: isNaN(ownerId as number) ? undefined : ownerId,
      });
      Alert.alert('הצלחה', 'החתונה נוצרה בהצלחה');
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to create wedding:', error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'יצירת החתונה נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.label}>שם החתונה</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="לדוגמה: חתונת כהן-לוי"
          />

          <Text style={styles.label}>עיר</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="לדוגמה: ירושלים"
          />

          <Text style={styles.label}>תאריך החתונה (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={weddingDate}
            onChangeText={setWeddingDate}
            placeholder="YYYY-MM-DD"
          />
          <Text style={styles.helperText}>מבנה נדרש: שנה-חודש-יום, לדוגמה 2026-07-21</Text>

          <Text style={styles.label}>קוד גישה (אופציונלי)</Text>
          <TextInput
            style={styles.input}
            value={accessCode}
            onChangeText={setAccessCode}
            placeholder="לדוגמה: חתונה-כהן-123"
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>אפשר להשאיר ריק ליצירת קוד אוטומטי. לדוגמה: חתונה-כהן-123</Text>

          <Text style={styles.label}>שיוך למנהל אירוע</Text>
          <ScrollView style={styles.managerList} nestedScrollEnabled={true}>
            <TouchableOpacity
              style={[styles.managerCard, ownerUserId === '' && styles.managerCardSelected]}
              onPress={() => setOwnerUserId('')}
            >
              <Text style={styles.managerName}>ללא / מנהל מערכת כבעלים זמני</Text>
            </TouchableOpacity>
            {eventManagers.map(manager => {
              const isBlocked = manager.adminBlocked === true;
              const isActive = manager.eventManagerActive !== false;
              const isSelectable = !isBlocked && isActive;
              const isSelected = ownerUserId === manager.id.toString();

              return (
                <View
                  key={manager.id}
                  style={[
                    styles.managerCardRow,
                    isSelected && styles.managerCardSelected,
                    !isSelectable && styles.managerCardUnavailable
                  ]}
                >
                  <TouchableOpacity
                    style={styles.managerSelectionArea}
                    onPress={() => {
                      if (isSelectable) {
                        setOwnerUserId(manager.id.toString());
                      }
                    }}
                    disabled={!isSelectable}
                  >
                    <View style={styles.managerHeaderRow}>
                      {!isSelectable && (
                        <View style={styles.unavailableBadge}>
                          <Text style={styles.unavailableBadgeText}>
                            {isBlocked && !isActive ? 'חסום ומושבת' : isBlocked ? 'חסום' : 'מושבת'}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.managerName}>{manager.fullName}</Text>
                    </View>
                    <Text style={styles.managerEmail}>{manager.email}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.managerDetailsAction}
                    onPress={() => navigation.navigate('AdminEventManagerDetails', { managerId: manager.id })}
                  >
                    <Text style={styles.managerDetailsActionText}>פרטים ➔</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'יוצר חתונה...' : 'יצירת חתונה'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: theme.spacing.xl,
  },
  container: {
    flex: 1,
    padding: theme.spacing.m,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textAlign: 'right',
  },
  input: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    textAlign: 'right',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  managerList: {
    maxHeight: 250,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.s,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: -theme.spacing.s,
    marginBottom: theme.spacing.m,
    textAlign: 'right',
  },
  managerCard: {
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    backgroundColor: theme.colors.surface,
  },
  managerCardRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
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
  managerCardUnavailable: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E0E0E0',
    opacity: 0.8,
  },
  managerSelectionArea: {
    flex: 1,
    padding: theme.spacing.m,
  },
  managerDetailsAction: {
    padding: theme.spacing.m,
    borderLeftWidth: 1,
    borderLeftColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  managerDetailsActionText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  managerHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  unavailableBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unavailableBadgeText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
