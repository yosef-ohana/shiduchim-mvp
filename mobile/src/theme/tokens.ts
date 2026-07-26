/**
 * Semantic Design Tokens — Batch F0 Foundation
 * Light-only "Ceremony Quiet" Design System
 */

export const colors = {
  // Base Surfaces
  background: '#FAF8F5',       // Quiet, warm off-white canvas
  surface: '#FFFFFF',          // Clean card/modal surface
  surfaceElevated: '#FFFFFF',  // Floating elements
  surfaceSubtle: '#F3EFEA',    // Subtle inset / pill background

  // Brand / Interaction Primary (Restrained Stone & Bronze)
  primary: '#1C1917',          // Primary action & dark focus text
  primaryHover: '#292524',
  primaryMuted: '#44403C',
  secondary: '#78716C',        // Secondary neutral tone
  secondarySubtle: '#E7E5E4',

  // Restrained Wedding Context Accent (Warm Bronze)
  accent: '#8B5E34',          // Restrained Ceremony Quiet bronze
  accentMuted: '#F5EBE0',      // Soft tint background
  accentBorder: '#D4B896',

  // Typography Colors
  textPrimary: '#1C1917',
  textSecondary: '#78716C',
  textTertiary: '#A8A29E',
  textDisabled: '#D6D3D1',
  textInverse: '#FFFFFF',
  textAccent: '#8B5E34',

  // Borders & Dividers
  border: '#E7E5E4',
  borderSubtle: '#F5F5F4',
  borderStrong: '#D6D3D1',
  borderFocus: '#8B5E34',

  // Status & Feedback Semantics
  statusSuccess: '#15803D',
  statusSuccessBg: '#F0FDF4',
  statusSuccessBorder: '#BBF7D0',

  statusWarning: '#B45309',
  statusWarningBg: '#FFFBEB',
  statusWarningBorder: '#FDE68A',

  statusError: '#B91C1C',
  statusErrorBg: '#FEF2F2',
  statusErrorBorder: '#FECACA',

  statusInfo: '#1D4ED8',
  statusInfoBg: '#EFF6FF',
  statusInfoBorder: '#BFDBFE',
} as const;

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,      // Canonical 4dp grid unit
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  gigantic: 48,
  massive: 64,
} as const;

export const radii = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const borderWidths = {
  none: 0,
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

export const sizing = {
  minTouchTarget: 48,  // Mandatory minimum touch target size
  buttonHeightSm: 36,
  buttonHeightMd: 44,
  buttonHeightLg: 52,
  inputHeight: 48,
  headerHeight: 56,
  iconXs: 14,
  iconSm: 18,
  iconMd: 24,
  iconLg: 32,
  iconXl: 40,
  maxContentRailWidth: 720, // Continuous responsive rail cap
} as const;

export const tokens = {
  colors,
  spacing,
  radii,
  borderWidths,
  sizing,
} as const;

export type ColorsToken = typeof colors;
export type SpacingToken = typeof spacing;
export type RadiiToken = typeof radii;
export type BorderWidthsToken = typeof borderWidths;
export type SizingToken = typeof sizing;
