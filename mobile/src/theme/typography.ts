/**
 * Typography Foundation — Batch F0
 * Maps semantic typography roles to verified @expo-google-fonts/heebo weights.
 */
import { TextStyle, Platform } from 'react-native';
import { colors } from './tokens';

// Verified export names from @expo-google-fonts/heebo
export const FONT_KEYS = {
  regular: 'Heebo_400Regular',
  medium: 'Heebo_500Medium',
  semiBold: 'Heebo_600SemiBold',
  bold: 'Heebo_700Bold',
} as const;

// Fallback font families if custom font is loading or in controlled fallback
export const FALLBACK_FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'sans-serif',
});

export type TypographyRole =
  | 'display'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'heading'
  | 'bodyLarge'
  | 'bodyLargeBold'
  | 'bodyMedium'
  | 'bodyMediumMedium'
  | 'bodyMediumBold'
  | 'caption'
  | 'captionBold'
  | 'buttonLabel'
  | 'overline';

export interface TypographyStyle extends TextStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
}

export const typography: Record<TypographyRole, TypographyStyle> = {
  display: {
    fontFamily: FONT_KEYS.bold,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleLarge: {
    fontFamily: FONT_KEYS.bold,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleMedium: {
    fontFamily: FONT_KEYS.semiBold,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  titleSmall: {
    fontFamily: FONT_KEYS.semiBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  heading: {
    fontFamily: FONT_KEYS.semiBold,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bodyLarge: {
    fontFamily: FONT_KEYS.regular,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  bodyLargeBold: {
    fontFamily: FONT_KEYS.bold,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontFamily: FONT_KEYS.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  bodyMediumMedium: {
    fontFamily: FONT_KEYS.medium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  bodyMediumBold: {
    fontFamily: FONT_KEYS.bold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  caption: {
    fontFamily: FONT_KEYS.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  captionBold: {
    fontFamily: FONT_KEYS.semiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  buttonLabel: {
    fontFamily: FONT_KEYS.semiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.textInverse,
  },
  overline: {
    fontFamily: FONT_KEYS.semiBold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
};
