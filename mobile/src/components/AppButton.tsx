import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { theme } from '../theme/theme';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  loading,
  style,
  disabled,
  variant = 'primary',
  ...props
}) => {
  const isSecondary = variant === 'secondary';
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary && styles.buttonSecondary,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? theme.colors.primary : theme.colors.surface} />
      ) : (
        <Text style={[styles.text, isSecondary && styles.textSecondary]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textSecondary: {
    color: theme.colors.primary,
  },
});
