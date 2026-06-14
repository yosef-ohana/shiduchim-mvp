import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { DiscoverPool, UserWeddingResponse } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { getMyWeddings } from '../../api/weddingsApi';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const PoolSelectionScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [selectedPool, setSelectedPool] = useState<DiscoverPool>('GLOBAL');
  const [weddings, setWeddings] = useState<UserWeddingResponse[]>([]);
  const [loadingWeddings, setLoadingWeddings] = useState(false);
  const [selectedWeddingId, setSelectedWeddingId] = useState<number | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const fetchWeddings = async () => {
    setLoadingWeddings(true);
    setErrorText(null);
    try {
      const list = await getMyWeddings();
      setWeddings(list);
      
      const eligible = list.filter(
        (w) => w.isWeddingPoolEligible && w.weddingStatus === 'ACTIVE' && w.participantStatus === 'ACTIVE'
      );
      if (eligible.length > 0 && !selectedWeddingId) {
        setSelectedWeddingId(eligible[0].weddingId);
      }
    } catch (err: any) {
      setErrorText(getFriendlyErrorMessage(err, 'Failed to load joined weddings.'));
    } finally {
      setLoadingWeddings(false);
    }
  };

  useEffect(() => {
    if (selectedPool === 'WEDDING') {
      fetchWeddings();
    }
  }, [selectedPool]);

  const eligibleWeddings = weddings.filter(
    (w) => w.isWeddingPoolEligible && w.weddingStatus === 'ACTIVE' && w.participantStatus === 'ACTIVE'
  );

  const handleDiscover = () => {
    setErrorText(null);

    // 1. Primary photo check
    if (!user?.hasPrimaryPhoto) {
      setErrorText("Please upload a primary photo before using Discover.");
      return;
    }

    if (selectedPool === 'GLOBAL') {
      // 2. Global Pool eligibility checks
      if (!user?.profileStatus || user.profileStatus === 'NONE' || user.profileStatus === 'FULL_INCOMPLETE_BLOCKED') {
        setErrorText("Please complete your basic profile before using the discovery pool.");
        return;
      }
      if (user.profileStatus === 'BASIC') {
        setErrorText("Global Pool is available only after completing your full profile.");
        return;
      }
      navigation.navigate('Discover', { pool: 'GLOBAL' });
    } else {
      // 3. Wedding Pool eligibility checks
      if (!user?.profileStatus || user.profileStatus === 'NONE' || user.profileStatus === 'FULL_INCOMPLETE_BLOCKED') {
        setErrorText("Please complete your basic profile before using the wedding pool.");
        return;
      }
      
      if (!selectedWeddingId) {
        setErrorText('Please select a wedding from the list.');
        return;
      }
      navigation.navigate('Discover', { pool: 'WEDDING', weddingId: selectedWeddingId });
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
            {loadingWeddings ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
            ) : eligibleWeddings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>You haven't joined any eligible weddings yet.</Text>
                <Text style={styles.emptySubText}>Please join a wedding with an access code first.</Text>
              </View>
            ) : (
              <View style={styles.weddingsListContainer}>
                <Text style={styles.sectionTitle}>Select a Wedding:</Text>
                {eligibleWeddings.map((w) => {
                  const isSelected = selectedWeddingId === w.weddingId;
                  return (
                    <TouchableOpacity
                      key={w.weddingId}
                      style={[
                        styles.weddingCard,
                        isSelected && styles.selectedWeddingCard,
                      ]}
                      onPress={() => {
                        setSelectedWeddingId(w.weddingId);
                        setErrorText(null);
                      }}
                    >
                      <Text style={[styles.weddingNameText, isSelected && styles.selectedWeddingNameText]}>
                        {w.weddingName}
                      </Text>
                      {w.city || w.weddingDate ? (
                        <Text style={styles.weddingDetailsText}>
                          {[w.city, w.weddingDate ? new Date(w.weddingDate).toLocaleDateString() : null]
                            .filter(Boolean)
                            .join(' - ')}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
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
  loader: {
    marginVertical: theme.spacing.m,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  weddingsListContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  weddingCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  selectedWeddingCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FAF7F0',
  },
  weddingNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectedWeddingNameText: {
    color: theme.colors.primary,
  },
  weddingDetailsText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  actionButton: {
    marginTop: 'auto',
    marginBottom: theme.spacing.l,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
  },
});
