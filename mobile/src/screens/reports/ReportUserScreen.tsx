import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainStack';
import { ReportReasonType } from '../../types/api';
import { reportsApi } from '../../api/reportsApi';

type ReportUserScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'ReportUser'>;
type ReportUserScreenRouteProp = RouteProp<MainStackParamList, 'ReportUser'>;

export const ReportUserScreen = () => {
  const navigation = useNavigation<ReportUserScreenNavigationProp>();
  const route = useRoute<ReportUserScreenRouteProp>();
  const { userId } = route.params;

  const [reasonType, setReasonType] = useState<ReportReasonType | null>(null);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reasonType) {
      Alert.alert('שגיאה', 'אנא בחר סיבה לדיווח.');
      return;
    }

    try {
      setIsSubmitting(true);
      await reportsApi.createReport(userId, {
        reasonType,
        text: text.trim() ? text.trim() : undefined,
      });
      Alert.alert('הצלחה', 'הדיווח נשלח לאדמין.', [
        { text: 'אישור', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to submit report', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בשליחת הדיווח.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions: { label: string; value: ReportReasonType }[] = [
    { label: 'בעיה בפרופיל (תמונה, פרטים)', value: 'PROFILE' },
    { label: 'התנהגות בלתי הולמת', value: 'BEHAVIOR' },
    { label: 'אחר', value: 'OTHER' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>דיווח על משתמש</Text>
      
      <Text style={styles.label}>סיבת הדיווח:</Text>
      <View style={styles.reasonsContainer}>
        {reasonOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.reasonOption,
              reasonType === option.value && styles.reasonOptionSelected
            ]}
            onPress={() => setReasonType(option.value)}
          >
            <Text
              style={[
                styles.reasonText,
                reasonType === option.value && styles.reasonTextSelected
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>פירוט (אופציונלי):</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        value={text}
        onChangeText={setText}
        placeholder="הוסף פרטים נוספים אם תרצה..."
        textAlign="right"
      />

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'שולח...' : 'שלח דיווח'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>ביטול</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
    textAlign: 'right',
  },
  reasonsContainer: {
    marginBottom: 20,
  },
  reasonOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  reasonOptionSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e6f2ff',
  },
  reasonText: {
    fontSize: 16,
    textAlign: 'right',
    color: '#333',
  },
  reasonTextSelected: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
  },
  actions: {
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#dc3545',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
