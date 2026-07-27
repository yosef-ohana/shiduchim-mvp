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

/**
 * Legacy compatibility value for gold primary accent.
 * Must remain a legacy compatibility value and must not become an approved R2 semantic role.
 */
export const LEGACY_GOLD_COMPAT = '#D4AF37';

// Approved R2-F1 Option B Semantic Token Families

export const visual = {
  canvas: {
    dark: '#0B0B0D',
    lightException: '#FAF7F2',
  },
  shell: {
    dark: '#0C0D0F',
  },
  surface: {
    dark: '#0D0D0E',
    darkRaised: '#18191A',
    light: '#FFFDF9',
    ivory: '#F3E6DC',
    ivoryMuted: '#EEE2D4',
    ivoryHighlight: '#F8EEE5',
  },
} as const;

export const gold = {
  action: {
    default: '#D1A269',
    pressed: '#C19662',
    disabled: '#E7E1E4',
  },
  focus: '#D1A978',
  border: {
    strong: '#D1A978',
    restrained: '#C79B62',
  },
  selected: '#D1A269', // alias of gold.action.default
} as const;

export const status = {
  success: {
    onIvory: '#3A402A',
    onDark: '#89C283',
  },
  warning: {
    onIvory: '#7B5200',
  },
  error: {
    onIvory: '#8E1D1A',
  },
} as const;

export const text = {
  onDark: {
    primary: '#F3E7DD',
    secondary: '#C6C5C7',
    muted: '#7C7B7D',
  },
  onIvory: {
    primary: '#121213',
    secondary: '#6D6760',
    muted: '#6D6760', // alias of text.onIvory.secondary
  },
  onGold: '#121213', // alias of text.onIvory.primary
  disabled: '#625960',
  technical: {
    ltr: {
      onDark: gold.border.strong, // alias of gold.border.strong (#D1A978)
      onIvory: '#121213', // alias of text.onIvory.primary (#121213)
    },
  },
} as const;

export const field = {
  background: '#F5E9E0',
  border: {
    default: '#8D7F87',
    focus: {
      dark: {
        width: 2,
        color: gold.focus, // alias of gold.focus (#D1A978)
      },
      ivory: {
        outer: {
          width: 2,
          color: text.onIvory.primary, // alias of text.onIvory.primary (#121213)
        },
        inner: {
          width: 1,
          color: gold.focus, // alias of gold.focus (#D1A978)
        },
      },
    },
    error: '#8E1D1A',
    disabled: '#D6CDD1',
  },
  placeholder: text.onIvory.secondary, // alias of text.onIvory.secondary (#6D6760)
  helper: text.onIvory.secondary, // alias of text.onIvory.secondary (#6D6760)
  requiredIndicator: status.error.onIvory, // alias of status.error.onIvory (#8E1D1A)
  errorText: status.error.onIvory, // alias of status.error.onIvory (#8E1D1A)
} as const;

export const icon = {
  onDark: {
    primary: text.onDark.primary, // alias of text.onDark.primary (#F3E7DD)
    accent: gold.border.strong, // alias of gold.border.strong (#D1A978)
  },
  onIvory: text.onIvory.primary, // alias of text.onIvory.primary (#121213)
  onGold: text.onGold, // alias of text.onGold (#121213)
  back: {
    onDark: text.onDark.primary, // alias of text.onDark.primary (#F3E7DD)
  },
  disabled: text.disabled, // alias of text.disabled (#625960)
} as const;

export const navigation = {
  surface: {
    dark: visual.shell.dark, // alias of visual.shell.dark (#0C0D0F)
  },
  active: {
    onDark: gold.border.strong, // alias of gold.border.strong (#D1A978)
  },
  inactive: {
    onDark: '#817C78',
  },
  badge: {
    foreground: text.onGold, // alias of text.onGold (#121213)
    background: gold.action.default, // alias of gold.action.default (#D1A269)
  },
} as const;

export const state = {
  disabled: {
    background: gold.action.disabled, // #E7E1E4
    text: text.disabled, // #625960
    border: field.border.disabled, // #D6CDD1
    icon: icon.disabled, // #625960
  },
} as const;

export const gradient = {
  goldAction: {
    axis: 'left-to-right',
    opacity: 1,
    stops: [
      { stop: 0, color: '#C99A61' },
      { stop: 0.5, color: '#DCB27C' },
      { stop: 1, color: '#D2A46C' },
    ],
  },
} as const;

export const shadow = {
  color: visual.canvas.dark, // alias of visual.canvas.dark (#0B0B0D)
} as const;

export const glow = {
  focus: {
    gold: {
      color: gold.focus, // alias of gold.focus (#D1A978)
      opacity: 0.28,
      radius: 6,
      offset: 0,
    },
  },
} as const;

export const border = {
  standard: 1,
  strong: 2,
  doubleGold: {
    outer: 1,
    gap: 3,
    inner: 1,
    color: gold.border.strong, // alias of gold.border.strong (#D1A978)
  },
} as const;

export const divider = {
  standard: 1,
} as const;

export const tokens = {
  colors,
  spacing,
  radii,
  borderWidths,
  sizing,

  visual,
  text,
  gold,
  field,
  status,
  state,
  icon,
  navigation,
  gradient,
  shadow,
  glow,
  border,
  divider,
} as const;

export type ColorsToken = typeof colors;
export type SpacingToken = typeof spacing;
export type RadiiToken = typeof radii;
export type BorderWidthsToken = typeof borderWidths;
export type SizingToken = typeof sizing;

export type VisualToken = typeof visual;
export type TextToken = typeof text;
export type GoldToken = typeof gold;
export type FieldToken = typeof field;
export type StatusToken = typeof status;
export type StateToken = typeof state;
export type IconToken = typeof icon;
export type NavigationToken = typeof navigation;
export type GradientToken = typeof gradient;
export type ShadowToken = typeof shadow;
export type GlowToken = typeof glow;
export type BorderToken = typeof border;
export type DividerToken = typeof divider;
export type Tokens = typeof tokens;
