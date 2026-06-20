import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { productFeedbackApi } from '../../api/productFeedbackApi';
import { FeedbackType } from '../../types/apiProductFeedback';

export const SendProductFeedbackScreen = ({ navigation }: any) => {
  const [type, setType] = useState<FeedbackType>('BUG');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('שגיאה', 'יש להזין תוכן לפניה');
      return;
    }

    setLoading(true);
    try {
      await productFeedbackApi.createFeedback({ type, text });
      Alert.alert('הצלחה', 'הפניה נשלחה בהצלחה', [
        { text: 'אישור', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error sending feedback:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בשליחת הפניה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>שליחת פניית מערכת</Text>
        <Text style={styles.subtitle}>כאן תוכלו לדווח על תקלה באפליקציה, להציע שיפור או לשלוח כל משוב אחר.</Text>

        <Text style={styles.label}>סוג פניה:</Text>
        <View style={styles.typeButtons}>
          {(['BUG', 'IMPROVEMENT', 'OTHER'] as FeedbackType[]).map(t => (
            <AppButton
              key={t}
              title={t === 'BUG' ? 'באג' : t === 'IMPROVEMENT' ? 'שיפור' : 'אחר'}
              onPress={() => setType(t)}
              style={[
                styles.typeButton,
                type !== t && styles.typeButtonInactive
              ]}
            />
          ))}
        </View>

        <Text style={styles.label}>תוכן הפניה:</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholder="פירוט הפניה..."
          value={text}
          onChangeText={setText}
        />

        <AppButton 
          title="שליחה" 
          onPress={handleSubmit} 
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.l,
    textAlign: 'right',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  typeButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.l,
  },
  typeButton: {
    flex: 1,
    marginHorizontal: theme.spacing.s,
  },
  typeButtonInactive: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  typeButtonTextInactive: {
    color: theme.colors.primary,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.xl,
    minHeight: 120,
  },
  submitButton: {
    marginTop: 'auto',
  }
});
