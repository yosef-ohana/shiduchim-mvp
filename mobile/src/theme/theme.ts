/**
 * Theme Compatibility Facade — Batch F0 Foundation
 * Wraps semantic tokens for backward compatibility with existing screen consumers.
 */
import { tokens, LEGACY_GOLD_COMPAT } from './tokens';

export const theme = {
  // Direct reference to semantic tokens
  tokens,

  // Backward compatibility facade for existing consumers
  colors: {
    primary: LEGACY_GOLD_COMPAT, // Legacy gold accent compatibility alias
    background: tokens.colors.background,
    surface: tokens.colors.surface,
    text: tokens.colors.textPrimary,
    textSecondary: tokens.colors.textSecondary,
    error: tokens.colors.statusError,
    border: tokens.colors.border,
    // Extended aliases mapping to tokens
    accent: tokens.colors.accent,
    success: tokens.colors.statusSuccess,
    warning: tokens.colors.statusWarning,
    info: tokens.colors.statusInfo,
  },
  spacing: {
    s: tokens.spacing.sm,    // 8
    m: tokens.spacing.lg,    // 16
    l: tokens.spacing.xxl,   // 24
    xl: tokens.spacing.xxxl, // 32
  },
  borderRadius: {
    s: tokens.radii.sm, // 4
    m: tokens.radii.md, // 8
    l: tokens.radii.lg, // 12
  },
};

export type Theme = typeof theme;
