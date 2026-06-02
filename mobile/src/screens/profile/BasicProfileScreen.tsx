import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { getMyProfile, updateBasicProfile } from '../../api/profileApi';
import { theme } from '../../theme/theme';

export const BasicProfileScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [areaOfResidence, setAreaOfResidence] = useState('');
  const [religiousLevel, setReligiousLevel] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    profileStatus: string;
    missingFields: string[];
    hasPrimaryPhoto: boolean;
  } | null>(null);

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await getMyProfile();
      setFullName(data.fullName || '');
      setAge(data.age ? String(data.age) : '');
      setHeightCm(data.heightCm ? String(data.heightCm) : '');
      setAreaOfResidence(data.areaOfResidence || '');
      setReligiousLevel(data.religiousLevel || '');
      setPhone(data.phone || '');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load current profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessInfo(null);

    // Local validation
    if (!fullName.trim() || !age.trim() || !heightCm.trim() || !areaOfResidence.trim() || !religiousLevel.trim() || !phone.trim()) {
      setErrorMsg('All fields are required');
      return;
    }

    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseInt(heightCm, 10);

    if (isNaN(parsedAge) || parsedAge <= 0) {
      setErrorMsg('Please enter a valid positive number for Age');
      return;
    }

    if (isNaN(parsedHeight) || parsedHeight <= 0) {
      setErrorMsg('Please enter a valid positive number for Height');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateBasicProfile({
        fullName: fullName.trim(),
        age: parsedAge,
        heightCm: parsedHeight,
        areaOfResidence: areaOfResidence.trim(),
        religiousLevel: religiousLevel.trim(),
        phone: phone.trim(),
      });
      setSuccessInfo(response);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save basic profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading current data...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Basic Profile</Text>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {successInfo ? (
          <View style={styles.successCard}>
            <Text style={styles.successText}>Basic profile saved successfully!</Text>
            <Text style={styles.successDetails}>
              Profile Status: <Text style={styles.boldText}>{successInfo.profileStatus}</Text>
            </Text>
            {successInfo.missingFields && successInfo.missingFields.length > 0 ? (
              <View style={styles.missingContainer}>
                <Text style={styles.successDetails}>Missing fields for Full status:</Text>
                {successInfo.missingFields.map((field) => (
                  <Text key={field} style={styles.missingFieldItem}>
                    • {field}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.successDetails}>No missing fields for Full status!</Text>
            )}
            <AppButton
              title="Go to My Profile"
              onPress={() => navigation.navigate('Profile')}
              style={styles.successButton}
            />
            <AppButton
              title="Go back to Home"
              onPress={() => navigation.navigate('Me')}
              style={[styles.successButton, styles.successButtonSecondary]}
            />
          </View>
        ) : (
          <View style={styles.formCard}>
            <AppInput
              label="Full Name"
              placeholder="e.g. John Doe"
              value={fullName}
              onChangeText={setFullName}
            />

            <AppInput
              label="Age"
              placeholder="e.g. 25"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />

            <AppInput
              label="Height (cm)"
              placeholder="e.g. 175"
              keyboardType="number-pad"
              value={heightCm}
              onChangeText={setHeightCm}
            />

            <AppInput
              label="Area of Residence"
              placeholder="e.g. Jerusalem"
              value={areaOfResidence}
              onChangeText={setAreaOfResidence}
            />

            <AppInput
              label="Religious Level"
              placeholder="e.g. Modern Orthodox"
              value={religiousLevel}
              onChangeText={setReligiousLevel}
            />

            <AppInput
              label="Phone Number"
              placeholder="e.g. +972501234567"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <AppButton
              title="Save Basic Profile"
              onPress={handleSave}
              loading={isSubmitting}
              style={styles.saveButton}
            />
          </View>
        )}
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: theme.spacing.xl,
  },
  saveButton: {
    marginTop: theme.spacing.m,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginBottom: theme.spacing.m,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  successDetails: {
    color: theme.colors.text,
    fontSize: 15,
    marginVertical: 4,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  missingContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.m,
    width: '100%',
  },
  missingFieldItem: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginVertical: 2,
  },
  successButton: {
    marginTop: theme.spacing.m,
    width: '100%',
  },
  successButtonSecondary: {
    backgroundColor: '#4A4A4A',
  },
});
