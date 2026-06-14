import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme/theme';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const AppInput: React.FC<AppInputProps> = ({ label, error, style, ...props }) => {
  const isTechnicalInput = 
    props.secureTextEntry || 
    props.keyboardType === 'email-address' || 
    props.keyboardType === 'numeric' ||
    props.keyboardType === 'number-pad' ||
    props.autoComplete === 'password' || 
    props.autoComplete === 'email';

  const textAlignStyle = isTechnicalInput ? styles.inputLeft : styles.inputRight;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, textAlignStyle, error ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.textSecondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
    width: '100%',
  },
  label: {
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  inputLeft: {
    textAlign: 'left',
  },
  inputRight: {
    textAlign: 'right',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});
