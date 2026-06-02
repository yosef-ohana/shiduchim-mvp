import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { getMyProfile } from '../../api/profileApi';
import { ProfileMeResponse } from '../../types/api';
import { theme } from '../../theme/theme';

export const ProfileScreen = ({ navigation }: any) => {
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setError(null);
      const data = await getMyProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  if (loading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
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
    const displayValue = value === null || value === undefined || value === '' ? 'Not specified' : String(value);
    
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
        <Text style={styles.title}>Profile Details</Text>

        {/* Account Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <View style={styles.card}>
            {renderRow('Full Name', profile.fullName)}
            {renderRow('Email', profile.email)}
            {renderRow('Gender', profile.gender)}
            {renderRow('Role', profile.role)}
            {renderRow('Profile Status', profile.profileStatus)}
            {renderRow('Admin Blocked', profile.adminBlocked ? 'Yes' : 'No')}
          </View>
        </View>

        {/* Basic Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Profile Info</Text>
          <View style={styles.card}>
            {renderRow('Age', profile.age)}
            {renderRow('Height (cm)', profile.heightCm)}
            {renderRow('Area of Residence', profile.areaOfResidence)}
            {renderRow('Religious Level', profile.religiousLevel)}
            {renderRow('Phone', profile.phone)}
          </View>
        </View>

        {/* Full Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Profile Info</Text>
          <View style={styles.card}>
            {renderRow('Education', profile.education)}
            {renderRow('Occupation', profile.occupation)}
            {renderRow('Head Covering', profile.headCovering)}
            {renderRow('Has Driving License', profile.hasDrivingLicense !== null ? (profile.hasDrivingLicense ? 'Yes' : 'No') : 'Not specified')}
            {renderRow('Self Description', profile.selfDescription, true)}
            {renderRow('Hobbies', profile.hobbies, true)}
            {renderRow('Looking For', profile.lookingFor, true)}
            {renderRow('Family Description', profile.familyDescription, true)}
          </View>
        </View>

        {/* Photos Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos Info</Text>
          <View style={styles.card}>
            {renderRow('Primary Photo Set', profile.hasPrimaryPhoto ? 'Yes' : 'No')}
            {renderRow('Photo Count', profile.photoCount)}
          </View>
        </View>

        <AppButton 
          title="Edit Basic Profile" 
          onPress={() => navigation.navigate('BasicProfile')}
          style={styles.button}
        />

        <AppButton 
          title="Edit Full Profile" 
          onPress={() => navigation.navigate('FullProfile')}
          style={[styles.button, styles.secondaryButton]}
        />
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
  loadingText: {
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  button: {
    marginTop: theme.spacing.m,
  },
  secondaryButton: {
    backgroundColor: '#4A4A4A',
    marginBottom: theme.spacing.l,
  },
});
