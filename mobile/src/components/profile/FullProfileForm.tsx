import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { AppInput } from '../AppInput';
import { AppButton } from '../AppButton';
import { Card } from '../foundation/Card';
import { visual, spacing, gold, text, borderWidths } from '../../theme/tokens';
import { typography } from '../../theme/typography';

export interface FullProfileFormProps {
  education: string;
  setEducation: (text: string) => void;
  occupation: string;
  setOccupation: (text: string) => void;
  headCovering: string;
  setHeadCovering: (text: string) => void;
  hasDrivingLicense: boolean;
  setHasDrivingLicense: (value: boolean) => void;
  selfDescription: string;
  setSelfDescription: (text: string) => void;
  hobbies: string;
  setHobbies: (text: string) => void;
  lookingFor: string;
  setLookingFor: (text: string) => void;
  familyDescription: string;
  setFamilyDescription: (text: string) => void;
  onSave?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  profileStatus: string | null;
  isEmbedded?: boolean;
}

export const FullProfileForm = ({
  education,
  setEducation,
  occupation,
  setOccupation,
  headCovering,
  setHeadCovering,
  hasDrivingLicense,
  setHasDrivingLicense,
  selfDescription,
  setSelfDescription,
  hobbies,
  setHobbies,
  lookingFor,
  setLookingFor,
  familyDescription,
  setFamilyDescription,
  onSave,
  isSubmitting = false,
  disabled = false,
  isEmbedded = false,
}: FullProfileFormProps) => {
  const content = (
    <>
      {isEmbedded && (
        <Text style={[typography.titleMedium, styles.sectionHeading]}>
          עליי ומה אני מחפש/ת
        </Text>
      )}

      <AppInput
        label="השכלה"
        placeholder="לדוגמה: ישיבה / מדרשה / תואר אקדמי"
        value={education}
        onChangeText={setEducation}
        disabled={disabled || isSubmitting}
        containerStyle={styles.fieldSpacing}
        testID="full-profile-education-input"
      />

      <AppInput
        label="עיסוק"
        placeholder="לדוגמה: מהנדס תוכנה"
        value={occupation}
        onChangeText={setOccupation}
        disabled={disabled || isSubmitting}
        containerStyle={styles.fieldSpacing}
        testID="full-profile-occupation-input"
      />

      <AppInput
        label="כיסוי ראש (אופציונלי)"
        placeholder="לדוגמה: כיפה / מטפחת / ללא"
        value={headCovering}
        onChangeText={setHeadCovering}
        disabled={disabled || isSubmitting}
        containerStyle={styles.fieldSpacing}
        testID="full-profile-headcovering-input"
      />

      <View style={styles.switchRow}>
        <Text style={[typography.bodyMedium, styles.switchLabel]}>יש רישיון נהיגה</Text>
        <Switch
          value={hasDrivingLicense}
          onValueChange={setHasDrivingLicense}
          disabled={disabled || isSubmitting}
          trackColor={{ false: visual.surface.darkRaised, true: gold.border.strong }}
          thumbColor={hasDrivingLicense ? text.onDark.primary : visual.surface.dark}
          testID="full-profile-driving-license-switch"
        />
      </View>

      <AppInput
        label="עליי (תיאור עצמי)"
        placeholder="ספר/י לנו קצת על עצמך..."
        multiline
        numberOfLines={4}
        value={selfDescription}
        onChangeText={setSelfDescription}
        disabled={disabled || isSubmitting}
        containerStyle={styles.fieldSpacing}
        testID="full-profile-selfdescription-input"
      />

      <AppInput
        label="תחביבים"
        placeholder="תחביבים ותחומי עניין..."
        multiline
        numberOfLines={3}
        value={hobbies}
        onChangeText={setHobbies}
        disabled={disabled || isSubmitting}
        containerStyle={styles.fieldSpacing}
        testID="full-profile-hobbies-input"
      />

      <AppInput
        label="מה אני מחפש/ת"
        placeholder="מה את/ה מחפש/ת בבן/בת הזוג?"
        multiline
        numberOfLines={4}
        value={lookingFor}
        onChangeText={setLookingFor}
        disabled={disabled || isSubmitting}
        containerStyle={styles.fieldSpacing}
        testID="full-profile-lookingfor-input"
      />

      <AppInput
        label="רקע משפחתי (אופציונלי)"
        placeholder="מתאר/ת את הרקע המשפחתי שלך..."
        multiline
        numberOfLines={3}
        value={familyDescription}
        onChangeText={setFamilyDescription}
        disabled={disabled || isSubmitting}
        containerStyle={styles.fieldSpacing}
        testID="full-profile-familydescription-input"
      />

      {!isEmbedded && onSave && (
        <AppButton
          title="שמירת פרופיל מלא"
          onPress={onSave}
          loading={isSubmitting}
          disabled={disabled || isSubmitting}
          style={styles.saveButton}
          testID="full-profile-save-btn"
        />
      )}
    </>
  );

  if (isEmbedded) {
    return <View>{content}</View>;
  }

  return (
    <Card appearance="ivory" style={styles.formCard} testID="full-profile-form-card">
      {content}
    </Card>
  );
};

const styles = StyleSheet.create({
  formCard: {
    marginBottom: spacing.xl,
  },
  fieldSpacing: {
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderBottomWidth: borderWidths.thin,
    borderBottomColor: visual.surface.darkRaised,
  },
  switchLabel: {
    color: text.onIvory.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  saveButton: {
    marginTop: spacing.md,
  },
  sectionHeading: {
    color: gold.border.strong,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'right',
  },
});
