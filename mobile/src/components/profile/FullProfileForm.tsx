import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { AppInput } from '../AppInput';
import { AppButton } from '../AppButton';
import { theme } from '../../theme/theme';

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
  onSave: () => void;
  isSubmitting: boolean;
  profileStatus: string | null;
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
  isSubmitting,
  profileStatus,
}: FullProfileFormProps) => {
  return (
    <View style={styles.formCard}>
      {profileStatus === 'BASIC' && (
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            לתשומת לבך: ניתן לעצור את מילוי הפרטים בכל שלב. הפרופיל שלך יישאר בסטטוס "פרופיל בסיסי" בלבד, ולא ישתנה לפרופיל מלא עד לשמירת הטופס.
          </Text>
        </View>
      )}
      <AppInput
        label="השכלה"
        placeholder="לדוגמה: ישיבה / מדרשה / תואר אקדמי"
        value={education}
        onChangeText={setEducation}
      />

      <AppInput
        label="עיסוק"
        placeholder="לדוגמה: מהנדס תוכנה"
        value={occupation}
        onChangeText={setOccupation}
      />

      <AppInput
        label="כיסוי ראש (אופציונלי)"
        placeholder="לדוגמה: כיפה / מטפחת / ללא"
        value={headCovering}
        onChangeText={setHeadCovering}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>יש רישיון נהיגה</Text>
        <Switch
          value={hasDrivingLicense}
          onValueChange={setHasDrivingLicense}
          trackColor={{ false: '#767577', true: theme.colors.primary }}
          thumbColor={hasDrivingLicense ? '#FFFFFF' : '#f4f3f4'}
        />
      </View>

      <AppInput
        label="עליי (תיאור עצמי)"
        placeholder="ספר/י לנו קצת על עצמך..."
        multiline
        numberOfLines={4}
        style={styles.textArea}
        value={selfDescription}
        onChangeText={setSelfDescription}
      />

      <AppInput
        label="תחביבים"
        placeholder="תחביבים ותחומי עניין..."
        multiline
        numberOfLines={3}
        style={styles.textArea}
        value={hobbies}
        onChangeText={setHobbies}
      />

      <AppInput
        label="מה אני מחפש/ת"
        placeholder="מה את/ה מחפש/ת בבן/בת הזוג?"
        multiline
        numberOfLines={4}
        style={styles.textArea}
        value={lookingFor}
        onChangeText={setLookingFor}
      />

      <AppInput
        label="רקע משפחתי (אופציונלי)"
        placeholder="מתאר/ת את הרקע המשפחתי שלך..."
        multiline
        numberOfLines={3}
        style={styles.textArea}
        value={familyDescription}
        onChangeText={setFamilyDescription}
      />

      <AppButton
        title="שמירת פרופיל מלא"
        onPress={onSave}
        loading={isSubmitting}
        style={styles.saveButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
    flexDirection: 'row-reverse',
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
    textAlign: 'right',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: theme.spacing.m,
  },
  noteCard: {
    backgroundColor: '#E3F2FD',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#90CAF9',
    marginBottom: theme.spacing.m,
  },
  noteText: {
    color: '#0D47A1',
    fontSize: 14,
    textAlign: 'right',
    lineHeight: 20,
  },
});
