/**
 * Button Primitive — Batch F1
 * Base adaptive button with 48dp min touch target, semantic styling, and RTL icon positioning.
 */
import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { AppIcon } from './AppIcon';
import { SemanticIconName } from '../../theme/icons';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

export interface ButtonProps {
  label: string;
  onPress: (event?: any) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  iconStart?: SemanticIconName;
  iconEnd?: SemanticIconName;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  iconStart,
  iconEnd,
  fullWidth = false,
  accessibilityLabel,
  testID,
  style,
  labelStyle,
}) => {
  const isInteractive = !disabled && !loading;

  // Variant color mappings
  let containerVariantStyle: StyleProp<ViewStyle> = styles.primaryContainer;
  let textVariantStyle: StyleProp<TextStyle> = styles.primaryText;
  let iconColor: string = colors.textInverse;
  let spinnerColor: string = colors.textInverse;

  if (variant === 'secondary') {
    containerVariantStyle = styles.secondaryContainer;
    textVariantStyle = styles.secondaryText;
    iconColor = colors.primary;
    spinnerColor = colors.primary;
  } else if (variant === 'tertiary') {
    containerVariantStyle = styles.tertiaryContainer;
    textVariantStyle = styles.tertiaryText;
    iconColor = colors.primary;
    spinnerColor = colors.primary;
  } else if (variant === 'destructive') {
    containerVariantStyle = styles.destructiveContainer;
    textVariantStyle = styles.destructiveText;
    iconColor = colors.statusError;
    spinnerColor = colors.statusError;
  }

  if (disabled) {
    containerVariantStyle = [containerVariantStyle, styles.disabledContainer];
    textVariantStyle = [textVariantStyle, styles.disabledText];
    iconColor = colors.textDisabled;
    spinnerColor = colors.textDisabled;
  }

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.baseContainer,
        containerVariantStyle,
        fullWidth && styles.fullWidth,
        pressed && isInteractive && styles.pressedState,
        style,
      ]}
      android_ripple={{
        color: variant === 'primary' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        borderless: false,
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {iconStart && (
            <AppIcon
              name={iconStart}
              size={sizing.iconSm}
              color={iconColor}
              style={styles.iconStart}
            />
          )}
          <Text style={[typography.buttonLabel, textVariantStyle, labelStyle]} numberOfLines={0}>
            {label}
          </Text>
          {iconEnd && (
            <AppIcon
              name={iconEnd}
              size={sizing.iconSm}
              color={iconColor}
              style={styles.iconEnd}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    minHeight: sizing.minTouchTarget, // 48dp
    minWidth: sizing.minTouchTarget,   // 48dp
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  iconStart: {
    marginEnd: spacing.xs,
  },
  iconEnd: {
    marginStart: spacing.xs,
  },

  // Variants
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.textInverse,
  },

  secondaryContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  secondaryText: {
    color: colors.primary,
  },

  tertiaryContainer: {
    backgroundColor: 'transparent',
  },
  tertiaryText: {
    color: colors.primary,
  },

  destructiveContainer: {
    backgroundColor: colors.statusErrorBg,
    borderWidth: 1,
    borderColor: colors.statusErrorBorder,
  },
  destructiveText: {
    color: colors.statusError,
  },

  // States
  pressedState: {
    opacity: 0.8,
  },
  disabledContainer: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSubtle,
    opacity: 0.6,
  },
  disabledText: {
    color: colors.textDisabled,
  },
});
