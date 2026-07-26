/**
 * Canonical AppIcon Component — Batch F0 Foundation
 * Provider-isolated semantic icon API supporting directional RTL mirroring.
 * Modular provider: @react-native-vector-icons/material-design-icons
 */
import React from 'react';
import { I18nManager, StyleProp, ViewStyle, View } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import {
  ICON_REGISTRY,
  SemanticIconName,
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_COLOR,
} from '../../theme/icons';

export interface AppIconProps {
  name: SemanticIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  mirrorRTL?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  style,
  mirrorRTL,
  accessible = false,
  accessibilityLabel,
}) => {
  const iconDef = ICON_REGISTRY[name];
  if (!iconDef) {
    console.warn(`[AppIcon] Unknown semantic icon name: ${name}`);
    return null;
  }

  // Determine if mirroring should occur: explicit prop override or registry default
  const shouldMirror = (mirrorRTL ?? iconDef.isDirectional) && I18nManager.isRTL;
  const transformStyle: ViewStyle | undefined = shouldMirror
    ? { transform: [{ scaleX: -1 }] }
    : undefined;

  const combinedStyle = [transformStyle, style];

  return (
    <View
      style={combinedStyle}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessible ? 'image' : undefined}
    >
      <MaterialDesignIcons
        name={iconDef.glyph}
        size={size}
        color={color}
      />
    </View>
  );
};
