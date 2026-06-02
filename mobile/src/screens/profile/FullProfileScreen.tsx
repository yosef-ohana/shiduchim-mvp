import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { getMyProfile, updateFullProfile } from '../../api/profileApi';
import { theme } from '../../theme/theme';

export const FullProfileScreen = ({ navigation }: any) => {
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [headCovering, setHeadCovering] = useState('');
  const [hasDrivingLicense, setHasDrivingLicense] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    profileStatus: string;
    globalPoolEnabled: boolean;
    missingFields: string[];
  } | null>(null);

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await getMyProfile();
      setEducation(data.education || '');
      setOccupation(data.occupation || '');
      setSelfDescription(data.selfDescription || '');
      setHobbies(data.hobbies || '');
      setLookingFor(data.lookingFor || '');
      setFamilyDescription(data.familyDescription || '');
      setHeadCovering(data.headCovering || '');
      setHasDrivingLicense(data.hasDrivingLicense ?? false);
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
    if (
      !education.trim() ||
      !occupation.trim() ||
      !selfDescription.trim() ||
      !hobbies.trim() ||
      !lookingFor.trim()
    ) {
      setErrorMsg('Education, Occupation, Self Description, Hobbies, and Looking For are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateFullProfile({
        education: education.trim(),
        occupation: occupation.trim(),
        selfDescription: selfDescription.trim(),
        hobbies: hobbies.trim(),
        lookingFor: lookingFor.trim(),
        familyDescription: familyDescription.trim() || null,
        headCovering: headCovering.trim() || null,
        hasDrivingLicense: hasDrivingLicense,
      });
      setSuccessInfo(response);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save full profile');
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
        <Text style={styles.title}>Full Profile</Text>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {successInfo ? (
          <View style={styles.successCard}>
            <Text style={styles.successText}>Full profile saved successfully!</Text>
            
            <Text style={styles.successDetails}>
              Profile Status: <Text style={styles.boldText}>{successInfo.profileStatus}</Text>
            </Text>
            
            <Text style={styles.successDetails}>
              Global Pool Enabled: <Text style={styles.boldText}>{successInfo.globalPoolEnabled ? 'Yes' : 'No'}</Text>
            </Text>

            {successInfo.missingFields && successInfo.missingFields.length > 0 ? (
              <View style={styles.missingContainer}>
                <Text style={styles.successDetails}>Remaining missing fields:</Text>
                {successInfo.missingFields.map((field) => (
                  <Text key={field} style={styles.missingFieldItem}>
                    • {field}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.successDetails}>All fields complete!</Text>
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
              label="Education"
              placeholder="e.g. Yeshiva / College / Degree"
              value={education}
              onChangeText={setEducation}
            />

            <AppInput
              label="Occupation"
              placeholder="e.g. Software Engineer"
              value={occupation}
              onChangeText={setOccupation}
            />

            <AppInput
              label="Head Covering (Optional)"
              placeholder="e.g. Kippah / None"
              value={headCovering}
              onChangeText={setHeadCovering}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Has Driving License</Text>
              <Switch
                value={hasDrivingLicense}
                onValueChange={setHasDrivingLicense}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={hasDrivingLicense ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>

            <AppInput
              label="Self Description"
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
              value={selfDescription}
              onChangeText={setSelfDescription}
            />

            <AppInput
              label="Hobbies"
              placeholder="Your hobbies and interests..."
              multiline
              numberOfLines={3}
              style={styles.textArea}
              value={hobbies}
              onChangeText={setHobbies}
            />

            <AppInput
              label="Looking For"
              placeholder="What are you looking for in a partner?"
              multiline
              numberOfLines={4}
              style={styles.textArea}
              value={lookingFor}
              onChangeText={setLookingFor}
            />

            <AppInput
              label="Family Description (Optional)"
              placeholder="Describe your family background..."
              multiline
              numberOfLines={3}
              style={styles.textArea}
              value={familyDescription}
              onChangeText={setFamilyDescription}
            />

            <AppButton
              title="Save Full Profile"
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  switchLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
