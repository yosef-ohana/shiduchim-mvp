import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { adminApi } from '../../api/adminApi';
import { MainStackParamList } from '../../navigation/MainStack';
import { theme } from '../../theme/theme';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'CreateAdminWedding'>;

export const CreateAdminWeddingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !city || !weddingDate) {
      Alert.alert('Validation Error', 'Name, city, and wedding date are required.');
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
      Alert.alert('Success', 'Wedding created successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to create wedding:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create wedding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.label}>Wedding Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Cohen-Levi Wedding"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Jerusalem"
        />

        <Text style={styles.label}>Wedding Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={weddingDate}
          onChangeText={setWeddingDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Access Code (Optional)</Text>
        <TextInput
          style={styles.input}
          value={accessCode}
          onChangeText={setAccessCode}
          placeholder="Leave blank to auto-generate"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Owner User ID (Optional)</Text>
        <TextInput
          style={styles.input}
          value={ownerUserId}
          onChangeText={setOwnerUserId}
          placeholder="Assign an Event Manager ID"
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Wedding'}</Text>
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
  },
  input: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: '#e1e1e1',
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
});
