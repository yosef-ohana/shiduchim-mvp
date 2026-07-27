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
import { colors, spacing, radii, sizing, visual, field, text, state, gold } from '../../theme/tokens';
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
  appearance?: 'ivory' | 'light';
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
  appearance,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };
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

  let r2InputStyles: StyleProp<ViewStyle> = undefined;
  let r2TextStyles: StyleProp<TextStyle> = undefined;
  let r2PlaceholderColor: string | undefined = undefined;

  const isError = !!error;
  const isFocus = isFocused && !isError && !disabled;

  if (appearance) {
    r2PlaceholderColor = field.placeholder;
    r2TextStyles = { color: text.onIvory.primary };

    const bg = appearance === 'ivory' ? field.background : visual.surface.light;

    if (disabled) {
      r2InputStyles = {
        backgroundColor: state.disabled.background,
        borderColor: state.disabled.border,
        borderWidth: 1,
      };
      r2TextStyles = { color: state.disabled.text };
      r2PlaceholderColor = state.disabled.text;
    } else if (isError) {
      r2InputStyles = {
        backgroundColor: bg,
        borderColor: field.border.error,
        borderWidth: 1,
      };
    } else if (isFocus) {
      r2InputStyles = {
        backgroundColor: bg,
        borderColor: field.border.focus.ivory.outer.color,
        borderWidth: field.border.focus.ivory.outer.width,
        paddingHorizontal: spacing.lg - (field.border.focus.ivory.outer.width - 1),
      };
    } else {
      r2InputStyles = {
        backgroundColor: bg,
        borderColor: field.border.default,
        borderWidth: 1,
      };
    }
  }

  const renderFocusInner = () => {
    if (appearance && isFocus) {
      return (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderWidth: field.border.focus.ivory.inner.width,
            borderColor: field.border.focus.ivory.inner.color,
            borderRadius: radii.md - field.border.focus.ivory.outer.width,
            pointerEvents: 'none',
          }}
        />
      );
    }
    return null;
  };

  const renderInput = () => {
    const inputNode = (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        secureTextEntry={secure || inputModeType === 'password'}
        multiline={multiline || inputModeType === 'multiline'}
        keyboardType={derivedKeyboardType}
        autoCapitalize={derivedAutoCapitalize}
        placeholderTextColor={r2PlaceholderColor || colors.textTertiary}
        style={[
          styles.input,
          typography.bodyLarge,
          { textAlign: defaultTextAlign },
          bidiStyle,
          multiline || inputModeType === 'multiline' ? styles.multilineInput : null,
          error && !appearance ? styles.errorInput : null,
          disabled && !appearance ? styles.disabledInput : null,
          r2InputStyles,
          r2TextStyles,
          style,
        ]}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityState={{ disabled }}
        testID={testID}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );

    if (appearance) {
      return (
        <View style={styles.r2StandaloneWrapper}>
          {inputNode}
          {renderFocusInner()}
        </View>
      );
    }
    return inputNode;
  };

  return (
    <FormField
      label={label}
      iconLabel={iconLabel}
      required={required}
      error={error}
      helper={helper}
      testID={testID ? `${testID}-field` : undefined}
      style={containerStyle}
      appearance={appearance}
    >
      {iconEnd ? (
        <View style={styles.r2StandaloneWrapper}>
          <View style={[
            styles.inputWrapper,
            error && !appearance ? styles.errorWrapper : null,
            disabled && !appearance ? styles.disabledWrapper : null,
            r2InputStyles
          ]}>
            <TextInput
            value={value}
            onChangeText={onChangeText}
            editable={!disabled}
            secureTextEntry={secure}
            multiline={multiline || inputModeType === 'multiline'}
            keyboardType={derivedKeyboardType}
            autoCapitalize={derivedAutoCapitalize}
            placeholderTextColor={r2PlaceholderColor || colors.textTertiary}
            style={[
              styles.wrappedInput,
              typography.bodyLarge,
              { textAlign: defaultTextAlign },
              bidiStyle,
              r2TextStyles,
              style,
            ]}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{ disabled }}
            testID={testID}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {onPressIconEnd ? (
            <TouchableOpacity
              onPress={onPressIconEnd}
              style={styles.iconEndTouchable}
              accessibilityRole="button"
              accessibilityLabel="הצג/הסתר"
            >
              <AppIcon name={iconEnd} size={sizing.iconSm} color={appearance ? ((r2TextStyles as any)?.color as string | undefined) : colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <AppIcon name={iconEnd} size={sizing.iconSm} color={appearance ? ((r2TextStyles as any)?.color as string | undefined) : colors.textSecondary} />
          )}
          </View>
          {renderFocusInner()}
        </View>
      ) : (
        renderInput()
      )}
    </FormField>
  );
};

const styles = StyleSheet.create({
  r2StandaloneWrapper: {
    position: 'relative',
  },
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
