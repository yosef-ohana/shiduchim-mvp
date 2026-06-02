import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../theme/theme';
import { AppButton } from './AppButton';
import { PublicUserCardResponse } from '../types/api';

interface CandidateCardProps {
  candidate: PublicUserCardResponse;
  onViewProfile: () => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onViewProfile }) => {
  const {
    primaryPhotoUrl,
    fullName,
    age,
    heightCm,
    areaOfResidence,
    religiousLevel,
    education,
    occupation,
    lookingForShort,
  } = candidate;

  return (
    <View style={styles.card}>
      {primaryPhotoUrl ? (
        <Image source={{ uri: primaryPhotoUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>No Photo Provided</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.subtitle}>{age} yrs • {heightCm} cm</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Residence:</Text>
          <Text style={styles.infoValue}>{areaOfResidence}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Religious Level:</Text>
          <Text style={styles.infoValue}>{religiousLevel}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Education:</Text>
          <Text style={styles.infoValue}>{education}</Text>
        </View>

        {occupation ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Occupation:</Text>
            <Text style={styles.infoValue}>{occupation}</Text>
          </View>
        ) : null}

        {lookingForShort ? (
          <View style={styles.lookingForContainer}>
            <Text style={styles.lookingForTitle}>Looking For:</Text>
            <Text style={styles.lookingForText} numberOfLines={2}>{lookingForShort}</Text>
          </View>
        ) : null}

        <AppButton
          title="View Profile"
          onPress={onViewProfile}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: theme.colors.border,
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    padding: theme.spacing.m,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.s,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: theme.spacing.s,
  },
  lookingForContainer: {
    marginTop: theme.spacing.s,
    backgroundColor: '#FAF7F0',
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#F0ECE3',
  },
  lookingForTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  lookingForText: {
    fontSize: 13,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  button: {
    marginTop: theme.spacing.m,
  },
});
