import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { joinWedding } from '../../api/weddingsApi';
import { JoinWeddingResponse } from '../../types/api';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getParticipantStatusLabel, formatDisplayDate } from '../../utils/displayLabels';

export const JoinWeddingScreen = ({ navigation }: any) => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<JoinWeddingResponse | null>(null);

  const handleJoin = async () => {
    if (!accessCode.trim()) {
      setError('קוד הגישה אינו יכול להיות ריק.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessData(null);
      const data = await joinWedding({ accessCode: accessCode.trim() });
      setSuccessData(data);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'לא ניתן להצטרף לחתונה כרגע.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>הצטרפות לחתונה</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {successData ? (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>הצטרפת בהצלחה!</Text>
            <Text style={styles.successMessage}>
              הצטרפת בהצלחה לחתונה של {successData.weddingName}.
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>חתונה:</Text>
              <Text style={styles.value}>{successData.weddingName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>מזהה:</Text>
              <Text style={styles.value}>{successData.weddingId}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>סטטוס:</Text>
              <Text style={styles.value}>{getParticipantStatusLabel(successData.participantStatus)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>תאריך הצטרפות:</Text>
              <Text style={styles.value}>{formatDisplayDate(successData.joinedAt)}</Text>
            </View>
            <AppButton
              title="החתונות שלי"
              onPress={() => navigation.navigate('MyWeddings')}
              style={styles.myWeddingsButton}
            />
            <AppButton
              title="חזרה לבית"
              onPress={() => navigation.navigate('Me')}
              style={styles.backButton}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.instruction}>
              הזן/י את קוד הגישה שקיבלת כדי להצטרף לחתונה.
            </Text>
            <AppInput
              label="קוד גישה"
              value={accessCode}
              onChangeText={setAccessCode}
              placeholder="קוד גישה"
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <AppButton
              title="הצטרפות לחתונה"
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
    textAlign: 'right',
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'right',
  },
  value: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  successMessage: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    fontWeight: '600',
  },
  myWeddingsButton: {
    marginTop: theme.spacing.xl,
  },
  backButton: {
    marginTop: theme.spacing.m,
    backgroundColor: '#4A4A4A',
  },
});
