/**
 * Card Primitive — Batch F1
 * Structural container supporting surface, elevated, outlined, and selectable variants.
 */
import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radii } from '../../theme/tokens';
import { elevationStyles } from '../../theme/elevation';

export type CardVariant = 'surface' | 'elevated-subtle' | 'outlined' | 'selectable';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: number | keyof typeof spacing;
  pressable?: boolean;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  padding = 'lg',
  pressable = false,
  onPress,
  selected = false,
  disabled = false,
  accessibilityLabel,
  testID,
  style,
}) => {
  const isInteractive = (pressable || !!onPress) && !disabled;
  const paddingValue = typeof padding === 'number' ? padding : spacing[padding] ?? spacing.lg;

  let variantStyle: ViewStyle = styles.surfaceVariant;
  let elevationStyle: ViewStyle = elevationStyles.none;

  if (variant === 'elevated-subtle') {
    variantStyle = styles.surfaceVariant;
    elevationStyle = elevationStyles.low;
  } else if (variant === 'outlined') {
    variantStyle = styles.outlinedVariant;
  } else if (variant === 'selectable') {
    variantStyle = selected ? styles.selectedVariant : styles.outlinedVariant;
  }

  const containerStyles = [
    styles.baseCard,
    variantStyle,
    elevationStyle,
    { padding: paddingValue },
    disabled && styles.disabledCard,
    style,
  ];

  if (pressable || onPress) {
    return (
      <Pressable
        onPress={isInteractive ? onPress : undefined}
        disabled={!isInteractive}
        style={({ pressed }) => [
          containerStyles,
          pressed && isInteractive && styles.pressedCard,
        ]}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.05)', borderless: false }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected, disabled }}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={containerStyles}
      accessibilityRole="none"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  surfaceVariant: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
  },
  outlinedVariant: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  selectedVariant: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentBorder,
    borderWidth: 2,
  },
  pressedCard: {
    opacity: 0.9,
  },
  disabledCard: {
    opacity: 0.6,
    backgroundColor: colors.surfaceSubtle,
  },
});
