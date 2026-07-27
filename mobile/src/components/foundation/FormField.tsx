/**
 * FormField Primitive Helper — Batch F1
 * Narrow layout abstraction providing consistent label, required star, helper, and error text formatting.
 */
import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, sizing, text, field, icon } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { getTextAlign } from '../../utils/direction';
import { AppIcon } from './AppIcon';
import { SemanticIconName } from '../../theme/icons';

export interface FormFieldProps {
  label?: string;
  iconLabel?: SemanticIconName;
  required?: boolean;
  error?: string;
  helper?: string;
  children: React.ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  appearance?: 'ivory' | 'light';
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  iconLabel,
  required = false,
  error,
  helper,
  children,
  testID,
  style,
  appearance,
}) => {
  const textAlignStyle = { textAlign: getTextAlign('start') };

  let r2LabelColor = undefined;
  let r2IconColor = undefined;
  let r2RequiredColor = undefined;
  let r2ErrorColor = undefined;
  let r2HelperColor = undefined;

  if (appearance) {
    r2LabelColor = text.onIvory.primary;
    r2IconColor = icon.onIvory;
    r2RequiredColor = field.requiredIndicator;
    r2ErrorColor = field.errorText;
    r2HelperColor = field.helper;
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <View style={styles.labelRow}>
          {iconLabel && (
            <AppIcon
              name={iconLabel}
              size={sizing.iconSm}
              color={r2IconColor || colors.textSecondary}
              style={styles.labelIcon}
            />
          )}
          <Text style={[typography.bodyMediumMedium, styles.labelText, r2LabelColor ? { color: r2LabelColor } : undefined, textAlignStyle]}>
            {label}
            {required && <Text style={[styles.requiredStar, r2RequiredColor ? { color: r2RequiredColor } : undefined]}> *</Text>}
          </Text>
        </View>
      )}
      {children}
      {error ? (
        <View style={styles.errorRow}>
          <AppIcon name="alert-circle" size={sizing.iconSm} color={r2ErrorColor || colors.statusError} style={styles.errorIcon} />
          <Text style={[typography.caption, styles.errorText, r2ErrorColor ? { color: r2ErrorColor } : undefined, textAlignStyle]}>
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text style={[typography.caption, styles.helperText, r2HelperColor ? { color: r2HelperColor } : undefined, textAlignStyle]}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  labelIcon: {
    marginEnd: spacing.xxs,
  },
  labelText: {
    color: colors.textPrimary,
  },
  requiredStar: {
    color: colors.statusError,
    fontWeight: '700',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  errorIcon: {
    marginEnd: spacing.xxs,
  },
  errorText: {
    color: colors.statusError,
    flexShrink: 1,
  },
  helperText: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
