import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getPublicProfile } from '../../api/profileApi';
import { PublicProfileResponse } from '../../types/api';
import { getImageUrl } from '../../utils/imageUrl';
import { getYesNoLabel, getEmptyLabel } from '../../utils/displayLabels';


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
          'טעינת פרופיל המועמד נכשלה. אנא נסו שוב.'
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
        <Text style={styles.stateText}>טוען פרטי פרופיל...</Text>
      </Screen>
    );
  }

  if (error || !profile) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'לא ניתן היה לטעון את הפרופיל'}</Text>
        <AppButton title="נסה שוב" onPress={fetchProfile} style={styles.retryButton} />
      </Screen>
    );
  }

  const renderRow = (label: string, value: any, isLongText = false) => {
    const displayValue = getEmptyLabel(value);

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
            {getImageUrl(profile.primaryPhotoUrl) ? (
              <Image source={{ uri: getImageUrl(profile.primaryPhotoUrl) }} style={styles.mainImage} />
            ) : (
              <View style={[styles.mainImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>אין תמונה</Text>
              </View>
            )}
            {getImageUrl(profile.additionalPhotoUrl) ? (
              <Image source={{ uri: getImageUrl(profile.additionalPhotoUrl) }} style={styles.sideImage} />
            ) : null}
          </View>
        </View>

        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.subtitle}>
            {profile.age} שנים • {profile.heightCm} ס״מ
          </Text>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטי פרופיל</Text>
          <View style={styles.card}>
            {renderRow('אזור מגורים', profile.areaOfResidence)}
            {renderRow('רמה דתית', profile.religiousLevel)}
            {renderRow('כיסוי ראש', profile.headCovering)}
            {renderRow('רישיון נהיגה', getYesNoLabel(profile.hasDrivingLicense))}
          </View>
        </View>

        {/* Education & Occupation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>השכלה וקריירה</Text>
          <View style={styles.card}>
            {renderRow('השכלה', profile.education)}
            {renderRow('עיסוק', profile.occupation)}
          </View>
        </View>

        {/* Written Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>עליי</Text>
          <View style={styles.card}>
            {renderRow('תיאור עצמי', profile.selfDescription, true)}
            {renderRow('תחביבים ותחומי עניין', profile.hobbies, true)}
            {renderRow('רקע משפחתי', profile.familyDescription, true)}
            {renderRow('מה אני מחפש/ת', profile.lookingFor, true)}
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
    paddingRight: theme.spacing.s,
    textAlign: 'right',
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  rowValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'left',
    flex: 1,
    marginRight: theme.spacing.m,
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
    textAlign: 'right',
  },
  spacing: {
    height: theme.spacing.xl,
  },
});
