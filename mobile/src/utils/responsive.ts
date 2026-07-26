/**
 * Central Responsive Helpers — Batch F0 Foundation
 * Continuous layout math, adaptive gutters, and centered rail calculation.
 */
import { useWindowDimensions } from 'react-native';
import { sizing } from '../theme/tokens';

export interface ResponsiveMetrics {
  width: number;
  height: number;
  gutter: number;
  contentWidth: number;
  railOffset: number;
  isCompact: boolean; // width < 360
  isWide: boolean;    // width >= 768
}

/**
 * Pure calculation helper for continuous responsive metrics.
 * Validation anchors: 320, 360, 390, 430, 1024
 */
export function calculateResponsiveMetrics(
  width: number,
  height: number
): ResponsiveMetrics {
  // Continuous gutter calculation based on approved width bands
  let gutter = 16;
  if (width < 360) {
    gutter = 16;
  } else if (width < 390) {
    gutter = 16;
  } else if (width < 430) {
    gutter = 20;
  } else if (width < 768) {
    gutter = 24;
  } else {
    gutter = 32;
  }

  // Continuous centered rail capped at 720dp
  const rawAvailable = width - gutter * 2;
  const contentWidth = Math.min(rawAvailable, sizing.maxContentRailWidth);
  const railOffset = Math.max(0, (width - contentWidth) / 2);

  return {
    width,
    height,
    gutter,
    contentWidth,
    railOffset,
    isCompact: width < 360,
    isWide: width >= 768,
  };
}

/**
 * React hook exposing responsive layout metrics dynamically.
 */
export function useResponsive(): ResponsiveMetrics {
  const { width, height } = useWindowDimensions();
  return calculateResponsiveMetrics(width, height);
}
