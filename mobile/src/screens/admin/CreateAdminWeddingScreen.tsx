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

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const managers = await adminApi.getEventManagers();
        setEventManagers(managers);
      } catch (err) {
        console.error('Failed to load event managers', err);
      }
    };
    fetchManagers();
  }, []);

  const handleCreate = async () => {
    if (!name || !city || !weddingDate) {
      Alert.alert('שגיאת אימות', 'שם, עיר ותאריך החתונה הם שדות חובה.');
      return;
    }
    if (!ownerUserId) {
      Alert.alert('שגיאת אימות', 'אנא בחר מנהל אירועים.');
      return;
    }

    setLoading(true);
    try {
      const ownerId = ownerUserId ? parseInt(ownerUserId, 10) : undefined;
      await adminApi.createWedding({
        name,
        city,
        weddingDate,
        accessCode: accessCode || undefined,
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

        <Text style={styles.label}>קוד גישה (אופציונלי)</Text>
        <TextInput
          style={styles.input}
          value={accessCode}
          onChangeText={setAccessCode}
          placeholder="השאר ריק ליצירה אוטומטית"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>שיוך למנהל אירוע</Text>
        <ScrollView style={styles.managerList} nestedScrollEnabled={true}>
          <TouchableOpacity
            style={[styles.managerCard, ownerUserId === '' && styles.managerCardSelected]}
            onPress={() => setOwnerUserId('')}
          >
            <Text style={styles.managerName}>ללא / מנהל מערכת כבעלים זמני</Text>
          </TouchableOpacity>
          {eventManagers.map(manager => (
            <TouchableOpacity
              key={manager.id}
              style={[
                styles.managerCard,
                ownerUserId === manager.id.toString() && styles.managerCardSelected
              ]}
              onPress={() => setOwnerUserId(manager.id.toString())}
            >
              <Text style={styles.managerName}>{manager.fullName}</Text>
              <Text style={styles.managerEmail}>{manager.email}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'יוצר חתונה...' : 'יצירת חתונה'}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
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
