import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { joinWedding } from '../../api/weddingsApi';
import { JoinWeddingResponse } from '../../types/api';

export const JoinWeddingScreen = ({ navigation }: any) => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<JoinWeddingResponse | null>(null);

  const handleJoin = async () => {
    if (!accessCode.trim()) {
      setError('Access code cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessData(null);
      const data = await joinWedding({ accessCode: accessCode.trim() });
      setSuccessData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join wedding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Join Wedding</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {successData ? (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Successfully Joined!</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Wedding:</Text>
              <Text style={styles.value}>{successData.weddingName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ID:</Text>
              <Text style={styles.value}>{successData.weddingId}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{successData.participantStatus}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Joined At:</Text>
              <Text style={styles.value}>{new Date(successData.joinedAt).toLocaleDateString()}</Text>
            </View>
            <AppButton
              title="Back to Home"
              onPress={() => navigation.navigate('Me')}
              style={styles.backButton}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.instruction}>
              Enter the access code provided by the event organizer to join the wedding pool.
            </Text>
            <AppInput
              label="Access Code"
              value={accessCode}
              onChangeText={setAccessCode}
              placeholder="e.g. WEDDING-123"
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <AppButton
              title="Join Wedding"
              onPress={handleJoin}
              loading={loading}
              style={styles.joinButton}
            />
          </View>
        )}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  instruction: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: theme.spacing.m,
  },
  joinButton: {
    marginTop: theme.spacing.m,
  },
  successCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: theme.spacing.m,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  backButton: {
    marginTop: theme.spacing.xl,
  },
});
