import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getPublicProfile } from '../../api/profileApi';
import { PublicProfileResponse } from '../../types/api';

export const CandidateProfileScreen = ({ route, navigation }: any) => {
  const { userId } = route.params || {};
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicProfile(userId);
      setProfile(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load candidate profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.stateText}>Loading profile details...</Text>
      </Screen>
    );
  }

  if (error || !profile) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Profile could not be loaded'}</Text>
        <AppButton title="Retry" onPress={fetchProfile} style={styles.retryButton} />
      </Screen>
    );
  }

  const renderRow = (label: string, value: any, isLongText = false) => {
    const displayValue =
      value === null || value === undefined || value === '' ? 'Not specified' : String(value);

    if (isLongText) {
      return (
        <View style={styles.longTextContainer} key={label}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.longTextValue}>{displayValue}</Text>
        </View>
      );
    }

    return (
      <View style={styles.row} key={label}>
        <Text style={styles.rowLabel}>{label}:</Text>
        <Text style={styles.rowValue}>{displayValue}</Text>
      </View>
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {profile.primaryPhotoUrl ? (
              <Image source={{ uri: profile.primaryPhotoUrl }} style={styles.mainImage} />
            ) : (
              <View style={[styles.mainImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>No Photo</Text>
              </View>
            )}
            {profile.additionalPhotoUrl ? (
              <Image source={{ uri: profile.additionalPhotoUrl }} style={styles.sideImage} />
            ) : null}
          </View>
        </View>

        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.subtitle}>
            {profile.age} yrs • {profile.heightCm} cm
          </Text>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <View style={styles.card}>
            {renderRow('Residence', profile.areaOfResidence)}
            {renderRow('Religious Level', profile.religiousLevel)}
            {renderRow('Head Covering', profile.headCovering)}
            {renderRow(
              'Driving License',
              profile.hasDrivingLicense !== null
                ? profile.hasDrivingLicense
                  ? 'Yes'
                  : 'No'
                : 'Not specified'
            )}
          </View>
        </View>

        {/* Education & Occupation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education & Career</Text>
          <View style={styles.card}>
            {renderRow('Education', profile.education)}
            {renderRow('Occupation', profile.occupation)}
          </View>
        </View>

        {/* Written Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <View style={styles.card}>
            {renderRow('Self Description', profile.selfDescription, true)}
            {renderRow('Hobbies & Interests', profile.hobbies, true)}
            {renderRow('Family Background', profile.familyDescription, true)}
            {renderRow('What I am Looking For', profile.lookingFor, true)}
          </View>
        </View>

        <View style={styles.spacing} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  stateText: {
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  retryButton: {
    width: '60%',
  },
  photoSection: {
    marginBottom: theme.spacing.m,
  },
  photoContainer: {
    flexDirection: 'row',
    height: 280,
    gap: theme.spacing.s,
  },
  mainImage: {
    flex: 1,
    height: '100%',
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.border,
  },
  sideImage: {
    width: 120,
    height: '100%',
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.border,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAEAEA',
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    paddingLeft: theme.spacing.s,
  },
  card: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: theme.spacing.m,
  },
  longTextContainer: {
    paddingVertical: theme.spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  longTextValue: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: theme.spacing.s,
    lineHeight: 20,
  },
  spacing: {
    height: theme.spacing.xl,
  },
});
