import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { theme } from '../../theme/theme';
import { DiscoverPool } from '../../types/api';

export const PoolSelectionScreen = ({ navigation }: any) => {
  const [selectedPool, setSelectedPool] = useState<DiscoverPool>('GLOBAL');
  const [weddingIdText, setWeddingIdText] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleDiscover = () => {
    setErrorText(null);

    if (selectedPool === 'GLOBAL') {
      navigation.navigate('Discover', { pool: 'GLOBAL' });
    } else {
      const parsedId = parseInt(weddingIdText.trim(), 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        setErrorText('Please enter a valid, positive numeric Wedding ID.');
        return;
      }
      navigation.navigate('Discover', { pool: 'WEDDING', weddingId: parsedId });
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Discovery Pool</Text>
        <Text style={styles.subtitle}>Select which pool of candidates you would like to search.</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedPool === 'GLOBAL' && styles.selectedOptionCard,
            ]}
            onPress={() => {
              setSelectedPool('GLOBAL');
              setErrorText(null);
            }}
          >
            <Text
              style={[
                styles.optionTitle,
                selectedPool === 'GLOBAL' && styles.selectedOptionTitle,
              ]}
            >
              Global Pool
            </Text>
            <Text style={styles.optionDescription}>
              Discover compatible matches from the global network of participants.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedPool === 'WEDDING' && styles.selectedOptionCard,
            ]}
            onPress={() => {
              setSelectedPool('WEDDING');
              setErrorText(null);
            }}
          >
            <Text
              style={[
                styles.optionTitle,
                selectedPool === 'WEDDING' && styles.selectedOptionTitle,
              ]}
            >
              Wedding Pool
            </Text>
            <Text style={styles.optionDescription}>
              Discover compatible matches specifically from a particular wedding event.
            </Text>
          </TouchableOpacity>
        </View>

        {selectedPool === 'WEDDING' && (
          <View style={styles.weddingInputContainer}>
            <AppInput
              label="Wedding ID"
              placeholder="e.g. 101"
              keyboardType="number-pad"
              value={weddingIdText}
              onChangeText={(text) => {
                setWeddingIdText(text);
                setErrorText(null);
              }}
              error={errorText || undefined}
            />
            <Text style={styles.note}>
              Note: This MVP does not fetch your joined weddings list. Please enter the numeric Wedding ID manually to proceed.
            </Text>
          </View>
        )}

        <AppButton
          title="Discover Candidates"
          onPress={handleDiscover}
          style={styles.actionButton}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
  },
  optionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  selectedOptionCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FAF7F0',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  selectedOptionTitle: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  weddingInputContainer: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  note: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
    marginTop: theme.spacing.s,
  },
  actionButton: {
    marginTop: 'auto',
    marginBottom: theme.spacing.l,
  },
});
