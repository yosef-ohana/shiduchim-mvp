/**
 * IconButton Primitive — Batch F1
 * Base interactive icon button with 48dp hit target, variants, and optional badge indicator.
 */
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { AppIcon } from './AppIcon';
import { SemanticIconName } from '../../theme/icons';

export type IconButtonVariant = 'plain' | 'contained' | 'destructive' | 'header';

export interface IconButtonProps {
  icon: SemanticIconName;
  onPress: (event?: any) => void;
  accessibilityLabel?: string;
  variant?: IconButtonVariant;
  disabled?: boolean;
  decorative?: boolean;
  badge?: number | boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'plain',
  disabled = false,
  decorative = false,
  badge,
  testID,
  style,
}) => {
  const isInteractive = !disabled && !decorative;

  let containerVariantStyle: StyleProp<ViewStyle> = styles.plainContainer;
  let iconColor: string = colors.textPrimary;

  if (variant === 'contained') {
    containerVariantStyle = styles.containedContainer;
    iconColor = colors.primary;
  } else if (variant === 'destructive') {
    containerVariantStyle = styles.destructiveContainer;
    iconColor = colors.statusError;
  } else if (variant === 'header') {
    containerVariantStyle = styles.headerContainer;
    iconColor = colors.primary;
  }

  if (disabled) {
    iconColor = colors.textDisabled;
    containerVariantStyle = [containerVariantStyle, styles.disabledContainer];
  }

  const renderBadge = () => {
    if (!badge) return null;
    const isNumber = typeof badge === 'number' && badge > 0;
    const displayValue = isNumber ? (badge > 99 ? '99+' : String(badge)) : null;

    return (
      <View style={[styles.badge, isNumber && styles.numberBadge]}>
        {displayValue && (
          <Text style={styles.badgeText}>{displayValue}</Text>
        )}
      </View>
    );
  };

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.baseContainer,
        containerVariantStyle,
        pressed && isInteractive && styles.pressedState,
        style,
      ]}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', borderless: true, radius: 24 }}
      accessibilityRole={decorative ? 'none' : 'button'}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      <AppIcon name={icon} size={sizing.iconMd} color={iconColor} />
      {renderBadge()}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    minWidth: sizing.minTouchTarget,  // 48dp
    minHeight: sizing.minTouchTarget, // 48dp
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.full,
    position: 'relative',
  },
  plainContainer: {
    backgroundColor: 'transparent',
  },
  containedContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  destructiveContainer: {
    backgroundColor: colors.statusErrorBg,
    borderWidth: 1,
    borderColor: colors.statusErrorBorder,
  },
  headerContainer: {
    backgroundColor: 'transparent',
  },
  pressedState: {
    opacity: 0.7,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    end: spacing.xs,
    minWidth: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.statusError,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  numberBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    top: 2,
    end: 2,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    textAlign: 'center',
  },
});
