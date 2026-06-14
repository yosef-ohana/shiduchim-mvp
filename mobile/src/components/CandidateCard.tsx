import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../theme/theme';
import { AppButton } from './AppButton';
import { PublicUserCardResponse } from '../types/api';
import { getImageUrl } from '../utils/imageUrl';
import { getEmptyLabel } from '../utils/displayLabels';


interface CandidateCardProps {
  candidate: PublicUserCardResponse;
  onViewProfile: () => void;
  actionButtons?: React.ReactNode;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onViewProfile, actionButtons }) => {
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

  const resolvedPhotoUrl = getImageUrl(primaryPhotoUrl);

  return (
    <View style={styles.card}>
      {resolvedPhotoUrl ? (
        <Image source={{ uri: resolvedPhotoUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>לא סופקה תמונה</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.subtitle}>{age} שנים • {heightCm} ס״מ</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>מגורים:</Text>
          <Text style={styles.infoValue}>{getEmptyLabel(areaOfResidence)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>רמה דתית:</Text>
          <Text style={styles.infoValue}>{getEmptyLabel(religiousLevel)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>השכלה:</Text>
          <Text style={styles.infoValue}>{getEmptyLabel(education)}</Text>
        </View>

        {occupation ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>עיסוק:</Text>
            <Text style={styles.infoValue}>{getEmptyLabel(occupation)}</Text>
          </View>
        ) : null}

        {lookingForShort ? (
          <View style={styles.lookingForContainer}>
            <Text style={styles.lookingForTitle}>מחפש/ת:</Text>
            <Text style={styles.lookingForText} numberOfLines={2}>{lookingForShort}</Text>
          </View>
        ) : null}

        <AppButton
          title="צפייה בפרופיל"
          onPress={onViewProfile}
          style={styles.button}
        />

        {actionButtons}
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
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.s,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'left',
    flex: 1,
    marginRight: theme.spacing.s,
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
    textAlign: 'right',
  },
  lookingForText: {
    fontSize: 13,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'right',
  },
  button: {
    marginTop: theme.spacing.m,
  },
});
