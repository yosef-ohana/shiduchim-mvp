/**
 * TextField Primitive — Batch F1
 * Base input control with visible label, 48dp minimum height, bidi support, and accessible error handling.
 */
import React from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { FormField } from './FormField';
import { BidiValueKind } from './BidiText';
import { getTextAlign } from '../../utils/direction';
import { AppIcon } from './AppIcon';
import { SemanticIconName } from '../../theme/icons';

export type TextFieldMode = 'text' | 'email' | 'phone' | 'password' | 'code' | 'multiline';

export interface TextFieldProps extends Omit<TextInputProps, 'onChangeText'> {
  label?: string;
  iconLabel?: SemanticIconName;
  iconEnd?: SemanticIconName;
  onPressIconEnd?: () => void;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  inputModeType?: TextFieldMode;
  secure?: boolean;
  multiline?: boolean;
  bidiType?: BidiValueKind;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  iconLabel,
  iconEnd,
  onPressIconEnd,
  value,
  onChangeText,
  error,
  helper,
  required = false,
  inputModeType = 'text',
  secure = false,
  multiline = false,
  bidiType,
  disabled = false,
  accessibilityLabel,
  testID,
  containerStyle,
  style,
  keyboardType,
  autoCapitalize,
  ...props
}) => {
  // Determine if input requires technical/LTR formatting (e.g. email, phone, code, password)
  const isLtrMode =
    bidiType ||
    (inputModeType === 'email'
      ? 'email'
      : inputModeType === 'phone'
      ? 'phone'
      : inputModeType === 'code'
      ? 'code'
      : secure || inputModeType === 'password'
      ? 'code'
      : undefined);

  const bidiStyle: TextStyle | undefined = isLtrMode
    ? { writingDirection: 'ltr', textAlign: 'left' }
    : undefined;

  const defaultTextAlign = getTextAlign('start');

  // Derive keyboard settings if not explicitly provided
  const derivedKeyboardType =
    keyboardType ||
    (inputModeType === 'email'
      ? 'email-address'
      : inputModeType === 'phone'
      ? 'phone-pad'
      : inputModeType === 'code'
      ? 'number-pad'
      : 'default');

  const derivedAutoCapitalize =
    autoCapitalize || (inputModeType === 'email' || inputModeType === 'password' || secure ? 'none' : 'sentences');

  const renderInput = () => (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      editable={!disabled}
      secureTextEntry={secure || inputModeType === 'password'}
      multiline={multiline || inputModeType === 'multiline'}
      keyboardType={derivedKeyboardType}
      autoCapitalize={derivedAutoCapitalize}
      placeholderTextColor={colors.textTertiary}
      style={[
        styles.input,
        typography.bodyLarge,
        { textAlign: defaultTextAlign },
        bidiStyle,
        multiline || inputModeType === 'multiline' ? styles.multilineInput : null,
        error ? styles.errorInput : null,
        disabled ? styles.disabledInput : null,
        style,
      ]}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
      testID={testID}
      {...props}
    />
  );

  return (
    <FormField
      label={label}
      iconLabel={iconLabel}
      required={required}
      error={error}
      helper={helper}
      testID={testID ? `${testID}-field` : undefined}
      style={containerStyle}
    >
      {iconEnd ? (
        <View style={[styles.inputWrapper, error ? styles.errorWrapper : null, disabled ? styles.disabledWrapper : null]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            editable={!disabled}
            secureTextEntry={secure}
            multiline={multiline || inputModeType === 'multiline'}
            keyboardType={derivedKeyboardType}
            autoCapitalize={derivedAutoCapitalize}
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.wrappedInput,
              typography.bodyLarge,
              { textAlign: defaultTextAlign },
              bidiStyle,
              style,
            ]}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{ disabled }}
            testID={testID}
            {...props}
          />
          {onPressIconEnd ? (
            <TouchableOpacity
              onPress={onPressIconEnd}
              style={styles.iconEndTouchable}
              accessibilityRole="button"
              accessibilityLabel="הצג/הסתר"
            >
              <AppIcon name={iconEnd} size={sizing.iconSm} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <AppIcon name={iconEnd} size={sizing.iconSm} color={colors.textSecondary} />
          )}
        </View>
      ) : (
        renderInput()
      )}
    </FormField>
  );
};

const styles = StyleSheet.create({
  input: {
    minHeight: sizing.minTouchTarget, // 48dp
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  inputWrapper: {
    minHeight: sizing.minTouchTarget, // 48dp
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrappedInput: {
    flex: 1,
    minHeight: sizing.minTouchTarget,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    color: colors.textPrimary,
  },
  iconEndTouchable: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorWrapper: {
    borderColor: colors.statusError,
  },
  disabledWrapper: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSubtle,
  },
  multilineInput: {
    minHeight: 96,
    maxHeight: 180,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: colors.statusError,
  },
  disabledInput: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSubtle,
    color: colors.textDisabled,
  },
});
