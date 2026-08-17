/**
 * Canonical Semantic Icon Registry — Batch F0 Foundation
 * Modular provider: @react-native-vector-icons/material-design-icons
 */
import { MaterialDesignIconsIconName } from '@react-native-vector-icons/material-design-icons';
import { colors, sizing } from './tokens';

export interface SemanticIconDefinition {
  glyph: MaterialDesignIconsIconName;
  isDirectional: boolean; // Indicates if icon should mirror in RTL contexts
}

export const ICON_REGISTRY = {
  // Non-directional icons (MUST NOT mirror)
  'user': { glyph: 'account', isDirectional: false },
  'search': { glyph: 'magnify', isDirectional: false },
  'heart': { glyph: 'heart', isDirectional: false },
  'phone': { glyph: 'phone', isDirectional: false },
  'mail': { glyph: 'email', isDirectional: false },
  'lock': { glyph: 'lock', isDirectional: false },
  'eye': { glyph: 'eye', isDirectional: false },
  'eye-off': { glyph: 'eye-off', isDirectional: false },
  'calendar': { glyph: 'calendar', isDirectional: false },
  'link': { glyph: 'link', isDirectional: false },
  'info': { glyph: 'information', isDirectional: false },
  'alert-circle': { glyph: 'alert-circle', isDirectional: false },
  'check': { glyph: 'check', isDirectional: false },
  'x': { glyph: 'close', isDirectional: false },
  'settings': { glyph: 'cog', isDirectional: false },
  'bell': { glyph: 'bell', isDirectional: false },
  'home': { glyph: 'home', isDirectional: false },
  'filter': { glyph: 'filter-variant', isDirectional: false },
  'plus': { glyph: 'plus', isDirectional: false },
  'edit': { glyph: 'pencil', isDirectional: false },
  'trash': { glyph: 'delete', isDirectional: false },
  'shield': { glyph: 'shield', isDirectional: false },
  'star': { glyph: 'star', isDirectional: false },
  'camera': { glyph: 'camera', isDirectional: false },
  'refresh': { glyph: 'refresh', isDirectional: false },

  // N2 Navigation Icons (Non-directional)
  'navDiscover': { glyph: 'magnify', isDirectional: false },
  'navConnections': { glyph: 'account-multiple-outline', isDirectional: false },
  'navChats': { glyph: 'chat-outline', isDirectional: false },
  'navWeddings': { glyph: 'ring', isDirectional: false },
  'navMe': { glyph: 'account-outline', isDirectional: false },
  'notifications': { glyph: 'bell-outline', isDirectional: false },

  // Directional icons (MUST mirror in RTL context)
  'chevron-left': { glyph: 'chevron-left', isDirectional: true },
  'chevron-right': { glyph: 'chevron-right', isDirectional: true },
  'chevron-down': { glyph: 'chevron-down', isDirectional: false },
  'chevron-up': { glyph: 'chevron-up', isDirectional: false },
  'arrow-left': { glyph: 'arrow-left', isDirectional: true },
  'arrow-right': { glyph: 'arrow-right', isDirectional: true },
  'log-out': { glyph: 'logout', isDirectional: true },
} as const satisfies Record<string, SemanticIconDefinition>;

export type SemanticIconName = keyof typeof ICON_REGISTRY;

export const DEFAULT_ICON_SIZE = sizing.iconMd; // 24dp
export const DEFAULT_ICON_COLOR = colors.textPrimary;
