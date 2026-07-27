/**
 * ResponsiveActionGroup Primitive — Batch F1
 * Layout container for adaptive button positioning (inline, stacked, split-destructive).
 */
import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { spacing } from '../../theme/tokens';
import { useResponsive } from '../../utils/responsive';

export type ActionGroupAlignment = 'inline' | 'stacked' | 'split-destructive';

export interface ResponsiveActionGroupProps {
  children: React.ReactNode;
  primaryIndex?: number;
  alignment?: ActionGroupAlignment;
  minButtonWidth?: number;
  compactMode?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const ResponsiveActionGroup: React.FC<ResponsiveActionGroupProps> = ({
  children,
  alignment = 'inline',
  compactMode = false,
  testID,
  style,
}) => {
  const { isCompact } = useResponsive();
  const { width, fontScale } = useWindowDimensions();
  const actionCount = React.Children.count(children);
  const isR2Stacked = actionCount >= 3 || width < 360 || fontScale >= 1.5;

  const shouldStack = alignment === 'stacked' || compactMode || isCompact || (alignment === 'inline' && isR2Stacked);

  if (alignment === 'split-destructive') {
    return (
      <View style={[styles.splitContainer, style]} testID={testID}>
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.baseContainer,
        shouldStack ? styles.stackedLayout : styles.inlineLayout,
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    width: '100%',
    gap: spacing.md,
  },
  inlineLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stackedLayout: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  splitContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
});
