/**
 * RTL and Direction Helpers — Batch F0 Foundation
 * Hebrew-first logical alignment and direction utilities.
 */
import { I18nManager, TextStyle, ViewStyle } from 'react-native';

export function isRTL(): boolean {
  return I18nManager.isRTL;
}

export type LogicalAlignment = 'start' | 'end' | 'center';

export function getTextAlign(alignment: LogicalAlignment = 'start'): TextStyle['textAlign'] {
  if (alignment === 'center') return 'center';
  if (alignment === 'start') return isRTL() ? 'right' : 'left';
  return isRTL() ? 'left' : 'right';
}

export function getFlexDirection(reverse: boolean = false): ViewStyle['flexDirection'] {
  if (reverse) {
    return isRTL() ? 'row' : 'row-reverse';
  }
  return isRTL() ? 'row-reverse' : 'row';
}

export function shouldMirrorIcon(isDirectional: boolean, forceMirror?: boolean): boolean {
  if (forceMirror !== undefined) return forceMirror;
  return isDirectional && isRTL();
}
