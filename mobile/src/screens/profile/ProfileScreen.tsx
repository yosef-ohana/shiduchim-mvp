import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { getMyProfile } from '../../api/profileApi';
import { ProfileMeResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getGenderLabel, getUserRoleLabel } from '../../utils/displayLabels';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

const getProfileStatusLabel = (status: string) => {
  switch (status) {
    case 'NONE': return 'לא הוגדר';
    case 'BASIC': return 'פרופיל בסיסי';
    case 'FULL': return 'פרופיל מלא';
    case 'FULL_INCOMPLETE_BLOCKED': return 'פרופיל מלא חסר (חסום)';
    default: return status;
  }
};

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
      setError(getFriendlyErrorMessage(err, 'טעינת הפרופיל נכשלה.'));
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
        <Text style={styles.loadingText}>טוען פרופיל...</Text>
      </Screen>
    );
  }

  if (error || !profile) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'טעינת הפרופיל נכשלה.'}</Text>
        <AppButton title="נסה שוב" onPress={fetchProfile} style={styles.retryButton} />
      </Screen>
    );
  }

  const renderRow = (label: string, value: any, isLongText = false) => {
    let displayValue = 'לא צוין';
    if (value !== null && value !== undefined && value !== '') {
      const stringVal = String(value);
      if (stringVal === 'MALE' || stringVal === 'FEMALE') {
        displayValue = getGenderLabel(stringVal);
      } else if (stringVal === 'USER' || stringVal === 'EVENT_MANAGER' || stringVal === 'ADMIN') {
        displayValue = getUserRoleLabel(stringVal);
      } else if (stringVal === 'NONE' || stringVal === 'BASIC' || stringVal === 'FULL' || stringVal === 'FULL_INCOMPLETE_BLOCKED') {
        displayValue = getProfileStatusLabel(stringVal);
      } else if (stringVal === 'Yes' || stringVal === 'true' || value === true) {
        displayValue = 'כן';
      } else if (stringVal === 'No' || stringVal === 'false' || value === false) {
        displayValue = 'לא';
      } else if (stringVal === 'Not specified') {
        displayValue = 'לא צוין';
      } else {
        displayValue = stringVal;
      }
    }
    
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
        <Text style={styles.title}>פרטי הפרופיל שלי</Text>

        {/* Account Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטי החשבון</Text>
          <View style={styles.card}>
            {renderRow('שם מלא', profile.fullName)}
            {renderRow('אימייל', profile.email)}
            {renderRow('מגדר', profile.gender)}
            {renderRow('תפקיד', profile.role)}
            {renderRow('סטטוס פרופיל', profile.profileStatus)}
            {renderRow('חסום על ידי מנהל', profile.adminBlocked)}
          </View>
        </View>

        {/* Basic Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטי פרופיל בסיסי</Text>
          <View style={styles.card}>
            {renderRow('גיל', profile.age)}
            {renderRow('גובה (ס״מ)', profile.heightCm)}
            {renderRow('אזור מגורים', profile.areaOfResidence)}
            {renderRow('רמה דתית', profile.religiousLevel)}
            {renderRow('טלפון', profile.phone)}
          </View>
        </View>

        {/* Full Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטי פרופיל מלא</Text>
          <View style={styles.card}>
            {renderRow('השכלה', profile.education)}
            {renderRow('עיסוק', profile.occupation)}
            {renderRow('כיסוי ראש', profile.headCovering)}
            {renderRow('רישיון נהיגה', profile.hasDrivingLicense)}
            {renderRow('עליי (תיאור עצמי)', profile.selfDescription, true)}
            {renderRow('תחביבים', profile.hobbies, true)}
            {renderRow('מה אני מחפש/ת', profile.lookingFor, true)}
            {renderRow('רקע משפחתי', profile.familyDescription, true)}
          </View>
        </View>

        {/* Photos Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>מידע על תמונות</Text>
          <View style={styles.card}>
            {renderRow('תמונה ראשית הוגדרה', profile.hasPrimaryPhoto)}
            {renderRow('כמות תמונות', profile.photoCount)}
          </View>
        </View>

        <AppButton 
          title="חיפוש מועמדים" 
          onPress={() => navigation.navigate('PoolSelection')}
          style={styles.button}
        />

        <AppButton 
          title="עריכת פרופיל בסיסי" 
          onPress={() => navigation.navigate('BasicProfile')}
          style={styles.button}
        />

        <AppButton 
          title="עריכת פרופיל מלא" 
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
    textAlign: 'center',
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
    paddingRight: theme.spacing.s,
    textAlign: 'right',
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
  button: {
    marginTop: theme.spacing.m,
  },
  secondaryButton: {
    backgroundColor: '#4A4A4A',
    marginBottom: theme.spacing.l,
  },
});
