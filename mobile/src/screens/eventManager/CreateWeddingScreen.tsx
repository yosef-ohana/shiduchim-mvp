import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { createWedding } from '../../api/eventManagerApi';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const CreateWeddingScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !city.trim() || !weddingDate.trim()) {
      Alert.alert('שגיאת אימות', 'שם, עיר ותאריך הם שדות חובה.');
      return;
    }

    setLoading(true);
    try {
      await createWedding({
        name,
        city,
        weddingDate,
        accessCode: accessCode.trim() || undefined,
      });
      Alert.alert('הצלחה', 'החתונה נוצרה בהצלחה', [
        { text: 'אישור', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'יצירת החתונה נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>יצירת חתונה</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>שם החתונה *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="למשל חתונת כהן-לוי"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>עיר *</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="למשל ירושלים"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>תאריך (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            value={weddingDate}
            onChangeText={setWeddingDate}
            placeholder="2026-06-01"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>קוד גישה (אופציונלי)</Text>
          <TextInput
            style={styles.input}
            value={accessCode}
            onChangeText={setAccessCode}
            placeholder="השאר ריק ליצירה אוטומטית"
            autoCapitalize="none"
          />
        </View>

        <AppButton 
          title="יצירת חתונה" 
          onPress={handleCreate} 
          loading={loading}
          style={styles.button}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: theme.spacing.m,
  },
  label: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
    fontWeight: '500',
    textAlign: 'right',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    padding: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'right',
  },
  button: {
    marginTop: theme.spacing.l,
  },
});
