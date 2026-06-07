import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { adminApi } from '../../api/adminApi';
import { theme } from '../../theme/theme';

export const CreateEventManagerScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await adminApi.createEventManager({ email, password, fullName });
      Alert.alert('Success', 'Event Manager created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to create Event Manager', error);
      Alert.alert('Error', 'Failed to create Event Manager. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
});
