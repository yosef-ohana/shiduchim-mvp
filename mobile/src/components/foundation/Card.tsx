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
import { colors, spacing, radii, visual, gold, border } from '../../theme/tokens';
import { elevationStyles, elevation } from '../../theme/elevation';

export type CardVariant = 'surface' | 'elevated-subtle' | 'outlined' | 'selectable';

export type CardProps = {
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
} & (
  | { appearance?: never; borderAppearance?: never; elevationLevel?: never }
  | { appearance: 'dark'; borderAppearance?: 'strongGold' | 'restrainedGold' | 'doubleGold'; elevationLevel?: 0 | 1 | 2 }
  | { appearance: 'darkRaised'; borderAppearance?: 'strongGold' | 'restrainedGold'; elevationLevel?: 1 | 2 }
  | { appearance: 'ivory' | 'ivoryMuted' | 'ivoryHighlight'; borderAppearance?: never; elevationLevel?: 0 | 1 }
);

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
  appearance,
  borderAppearance,
  elevationLevel,
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

  let r2Overrides: StyleProp<ViewStyle> = undefined;
  let doubleGoldInner: React.ReactNode = null;

  if (appearance) {
    let appearanceBackgroundColor: string = colors.surface;
    if (appearance === 'dark') appearanceBackgroundColor = visual.surface.dark;
    else if (appearance === 'darkRaised') appearanceBackgroundColor = visual.surface.darkRaised;
    else if (appearance === 'ivory') appearanceBackgroundColor = visual.surface.ivory;
    else if (appearance === 'ivoryMuted') appearanceBackgroundColor = visual.surface.ivoryMuted;
    else if (appearance === 'ivoryHighlight') appearanceBackgroundColor = visual.surface.ivoryHighlight;

    let r2ElevationStyle = undefined;
    if (elevationLevel !== undefined) {
      r2ElevationStyle = elevation[elevationLevel as 0 | 1 | 2];
    }

    let r2BorderStyle: ViewStyle = { borderWidth: 0, borderColor: 'transparent' };
    if (borderAppearance === 'strongGold') {
      r2BorderStyle = { borderWidth: border.strong, borderColor: gold.border.strong };
    } else if (borderAppearance === 'restrainedGold') {
      r2BorderStyle = { borderWidth: border.strong, borderColor: gold.border.restrained };
    } else if (borderAppearance === 'doubleGold') {
      r2BorderStyle = {
        borderWidth: border.doubleGold.outer,
        borderColor: border.doubleGold.color,
      };
      doubleGoldInner = (
        <View
          style={{
            position: 'absolute',
            top: border.doubleGold.gap,
            bottom: border.doubleGold.gap,
            left: border.doubleGold.gap,
            right: border.doubleGold.gap,
            borderWidth: border.doubleGold.inner,
            borderColor: border.doubleGold.color,
            borderRadius: radii.lg - border.doubleGold.gap - border.doubleGold.outer,
            pointerEvents: 'none',
          }}
        />
      );
    }

    r2Overrides = [
      { backgroundColor: appearanceBackgroundColor },
      r2BorderStyle,
      r2ElevationStyle,
    ];
  }

  const finalContainerStyles = [
    containerStyles,
    r2Overrides,
  ];

  if (pressable || onPress) {
    return (
      <Pressable
        onPress={isInteractive ? onPress : undefined}
        disabled={!isInteractive}
        style={({ pressed }) => [
          finalContainerStyles,
          pressed && isInteractive && styles.pressedCard,
        ]}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.05)', borderless: false }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected, disabled }}
        testID={testID}
      >
        {doubleGoldInner}
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={finalContainerStyles}
      accessibilityRole="none"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {doubleGoldInner}
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
