import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppInput } from '../AppInput';
import { AppButton } from '../AppButton';
import { theme } from '../../theme/theme';
import { getGenderLabel } from '../../utils/displayLabels';

export interface BasicProfileFormProps {
  fullName: string;
  setFullName: (text: string) => void;
  gender: string | null;
  age: string;
  setAge: (text: string) => void;
  heightCm: string;
  setHeightCm: (text: string) => void;
  areaOfResidence: string;
  setAreaOfResidence: (text: string) => void;
  religiousLevel: string;
  setReligiousLevel: (text: string) => void;
  phone: string;
  setPhone: (text: string) => void;
  onSave: () => void;
  isSubmitting: boolean;
}

export const BasicProfileForm = ({
  fullName,
  setFullName,
  gender,
  age,
  setAge,
  heightCm,
  setHeightCm,
  areaOfResidence,
  setAreaOfResidence,
  religiousLevel,
  setReligiousLevel,
  phone,
  setPhone,
  onSave,
  isSubmitting,
}: BasicProfileFormProps) => {
  return (
    <View style={styles.formCard}>
      <AppInput
        label="שם מלא"
        placeholder="לדוגמה: ישראל ישראלי"
        value={fullName}
        onChangeText={setFullName}
      />

      <View style={styles.lockedFieldContainer}>
        <Text style={styles.lockedFieldLabel}>מגדר</Text>
        <View style={styles.lockedValueBox}>
          <Text style={styles.lockedValueText}>
            {getGenderLabel(gender)}
          </Text>
        </View>
        <Text style={styles.lockedFieldNotice}>
          המגדר נקבע בהרשמה ואינו ניתן לעריכה כרגע. אם יש בעיה, פנה/י לאדמין.
        </Text>
      </View>

      <AppInput
        label="גיל"
        placeholder="לדוגמה: 25"
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
      />

      <AppInput
        label="גובה (ס״מ)"
        placeholder="לדוגמה: 175"
        keyboardType="number-pad"
        value={heightCm}
        onChangeText={setHeightCm}
      />

      <AppInput
        label="אזור מגורים"
        placeholder="לדוגמה: ירושלים"
        value={areaOfResidence}
        onChangeText={setAreaOfResidence}
      />

      <AppInput
        label="רמה דתית"
        placeholder="לדוגמה: דתי לאומי"
        value={religiousLevel}
        onChangeText={setReligiousLevel}
      />

      <AppInput
        label="מספר טלפון"
        placeholder="לדוגמה: 0501234567"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <AppButton
        title="שמירת פרופיל בסיסי"
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
  saveButton: {
    marginTop: theme.spacing.m,
  },
  lockedFieldContainer: {
    marginBottom: theme.spacing.m,
    width: '100%',
  },
  lockedFieldLabel: {
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  lockedValueBox: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    backgroundColor: '#F5F5F5',
  },
  lockedValueText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  lockedFieldNotice: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
});
