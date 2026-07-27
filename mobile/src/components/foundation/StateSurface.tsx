/**
 * StateSurface Primitive — Batch F1
 * Normal document flow container displaying loading, empty, error, partial, denied, stale, and success states.
 */
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, radii, sizing, visual, status, text } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { AppIcon } from './AppIcon';
import { Button } from './Button';
import { ResponsiveActionGroup } from './ResponsiveActionGroup';
import { SemanticIconName } from '../../theme/icons';

export type StateSurfaceKind =
  | 'loading'
  | 'empty'
  | 'error'
  | 'partial'
  | 'denied'
  | 'stale'
  | 'success'
  | 'warning';

export interface StateSurfaceAction {
  label: string;
  onPress: (event?: any) => void;
  icon?: SemanticIconName;
}

export type StateSurfaceVisualState =
  | { kind: 'success'; appearance: 'ivory' | 'dark' }
  | { kind: 'error'; appearance: 'ivory' }
  | { kind: 'warning'; appearance: 'ivory' };

export type StateSurfaceProps = {
  kind: StateSurfaceKind;
  title: string;
  message?: string;
  primaryAction?: StateSurfaceAction;
  secondaryAction?: StateSurfaceAction;
  live?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
} & (
  | { visualState?: never }
  | { kind: 'success'; visualState: { kind: 'success'; appearance: 'ivory' | 'dark' } }
  | { kind: 'error'; visualState: { kind: 'error'; appearance: 'ivory' } }
  | { kind: 'warning'; visualState: { kind: 'warning'; appearance: 'ivory' } }
);

export const StateSurface: React.FC<StateSurfaceProps> = ({
  kind,
  title,
  message,
  primaryAction,
  secondaryAction,
  live = false,
  testID,
  style,
  visualState,
}) => {
  const isError = kind === 'error' || kind === 'denied';
  const liveRegionPolicy = live || isError ? 'assertive' : kind === 'loading' ? 'polite' : 'none';

  let r2SurfaceStyles: StyleProp<ViewStyle> = undefined;
  let r2IconWrapperStyles: StyleProp<ViewStyle> = undefined;
  let r2TitleStyles: StyleProp<TextStyle> = undefined;
  let r2MessageStyles: StyleProp<TextStyle> = undefined;
  let r2IconColorOverride: string | undefined = undefined;

  if (visualState) {
    const vs = visualState as StateSurfaceVisualState;
    if (vs.kind === 'success' && vs.appearance === 'ivory') {
      r2SurfaceStyles = { backgroundColor: visual.surface.ivory, borderColor: 'transparent', borderWidth: 0 };
      r2TitleStyles = { color: text.onIvory.primary };
      r2MessageStyles = { color: text.onIvory.secondary };
      r2IconWrapperStyles = { backgroundColor: 'transparent' };
      r2IconColorOverride = status.success.onIvory;
    } else if (vs.kind === 'success' && vs.appearance === 'dark') {
      r2SurfaceStyles = { backgroundColor: visual.surface.dark, borderColor: 'transparent', borderWidth: 0 };
      r2TitleStyles = { color: text.onDark.primary };
      r2MessageStyles = { color: text.onDark.secondary };
      r2IconWrapperStyles = { backgroundColor: 'transparent' };
      r2IconColorOverride = status.success.onDark;
    } else if (vs.kind === 'error' && vs.appearance === 'ivory') {
      r2SurfaceStyles = { backgroundColor: visual.surface.ivory, borderColor: 'transparent', borderWidth: 0 };
      r2TitleStyles = { color: text.onIvory.primary };
      r2MessageStyles = { color: text.onIvory.secondary };
      r2IconWrapperStyles = { backgroundColor: 'transparent' };
      r2IconColorOverride = status.error.onIvory;
    } else if (vs.kind === 'warning' && vs.appearance === 'ivory') {
      r2SurfaceStyles = { backgroundColor: visual.surface.ivory, borderColor: 'transparent', borderWidth: 0 };
      r2TitleStyles = { color: text.onIvory.primary };
      r2MessageStyles = { color: text.onIvory.secondary };
      r2IconWrapperStyles = { backgroundColor: 'transparent' };
      r2IconColorOverride = status.warning.onIvory;
    }
  }

  const renderVisualElement = () => {
    if (kind === 'loading') {
      return (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.visualElement}
        />
      );
    }

    let iconName: SemanticIconName = 'info';
    let iconColor: string = colors.primary;

    if (kind === 'empty') {
      iconName = 'search';
      iconColor = colors.textSecondary;
    } else if (kind === 'error') {
      iconName = 'alert-circle';
      iconColor = colors.statusError;
    } else if (kind === 'partial') {
      iconName = 'info';
      iconColor = colors.statusWarning;
    } else if (kind === 'denied') {
      iconName = 'lock';
      iconColor = colors.statusError;
    } else if (kind === 'stale') {
      iconName = 'info';
      iconColor = colors.textSecondary;
    } else if (kind === 'success') {
      iconName = 'check';
      iconColor = colors.statusSuccess;
    } else if (kind === 'warning') {
      iconName = 'alert-circle';
      iconColor = colors.statusWarning;
    }

    if (r2IconColorOverride) {
      iconColor = r2IconColorOverride;
    }

    return (
      <View style={[styles.iconWrapper, r2IconWrapperStyles]}>
        <AppIcon name={iconName} size={sizing.iconXl} color={iconColor} />
      </View>
    );
  };

  return (
    <View
      style={[styles.container, r2SurfaceStyles, style]}
      accessibilityLiveRegion={liveRegionPolicy}
      accessibilityState={{ busy: kind === 'loading' }}
      testID={testID}
    >
      {renderVisualElement()}
      <Text style={[typography.titleMedium, styles.titleText, r2TitleStyles]}>{title}</Text>
      {message && (
        <Text style={[typography.bodyMedium, styles.messageText, r2MessageStyles]}>{message}</Text>
      )}

      {(primaryAction || secondaryAction) && (
        <ResponsiveActionGroup alignment="inline" style={styles.actionsGroup}>
          {secondaryAction && (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="secondary"
              iconStart={secondaryAction.icon}
            />
          )}
          {primaryAction && (
            <Button
              label={primaryAction.label}
              onPress={primaryAction.onPress}
              variant={isError ? 'destructive' : 'primary'}
              iconStart={primaryAction.icon}
            />
          )}
        </ResponsiveActionGroup>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xxl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: spacing.md,
  },
  visualElement: {
    marginBottom: spacing.lg,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  titleText: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  messageText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionsGroup: {
    marginTop: spacing.md,
  },
});
