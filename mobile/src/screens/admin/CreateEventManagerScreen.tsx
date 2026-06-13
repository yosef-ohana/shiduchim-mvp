import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { adminApi } from '../../api/adminApi';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const CreateEventManagerScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdManager, setCreatedManager] = useState<{email: string, pass: string} | null>(null);

  const handleCreate = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('שגיאת אימות', 'אנא מלא את כל השדות');
      return;
    }

    setLoading(true);
    try {
      await adminApi.createEventManager({ email, password, fullName });
      setCreatedManager({ email, pass: password });
    } catch (error) {
      console.error('Failed to create Event Manager', error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'יצירת מנהל האירועים נכשלה. אנא נסה שוב.'));
    } finally {
      setLoading(false);
    }
  };

  if (createdManager) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.form}>
            <Text style={styles.successTitle}>Event Manager Created!</Text>
            <Text style={styles.instruction}>You can share these login details:</Text>
            
            <View style={styles.detailsCard}>
              <Text style={styles.detailText} selectable>Email: {createdManager.email}</Text>
              <Text style={styles.detailText} selectable>Password: {createdManager.pass}</Text>
              <Text style={styles.detailText} selectable>Role: EVENT_MANAGER</Text>
            </View>

            <AppButton
              title="Done"
              onPress={() => navigation.goBack()}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.form}>
          <AppInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Doe"
            autoCapitalize="words"
          />
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="manager@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter a secure password"
            secureTextEntry
          />

          <AppButton
            title="Create Event Manager"
            onPress={handleCreate}
            loading={loading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
    flexGrow: 1,
  },
  form: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    marginTop: theme.spacing.l,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    fontFamily: 'monospace',
  },
});
