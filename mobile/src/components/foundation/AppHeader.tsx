/**
 * AppHeader Primitive — Batch F1
 * Header component for auth, user, and compact detail views with safe-area support and RTL arrow mirroring.
 */
import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, sizing, visual, text } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { IconButton } from './IconButton';

export type AppHeaderVariant = 'auth' | 'user' | 'compact-detail';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  leadingActions?: React.ReactNode;
  trailingActions?: React.ReactNode;
  safeArea?: boolean;
  accessibilityTitle?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  variant?: AppHeaderVariant;
  appearance?: 'dark' | 'ivory' | 'light';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  back = false,
  onBack,
  leadingActions,
  trailingActions,
  safeArea = true,
  accessibilityTitle,
  testID,
  style,
  variant = 'user',
  appearance,
}) => {
  const insets = useSafeAreaInsets();
  const paddingTop = safeArea ? insets.top : 0;

  const isCompact = variant === 'compact-detail';
  const titleTypography = isCompact ? typography.titleSmall : typography.titleMedium;

  let r2ContainerStyle: StyleProp<ViewStyle> = undefined;
  let r2TitleStyle: StyleProp<TextStyle> = undefined;
  let r2SubtitleStyle: StyleProp<TextStyle> = undefined;
  let r2BackAppearance: 'onDark' | 'onIvory' | undefined = undefined;

  if (appearance === 'dark') {
    r2ContainerStyle = { backgroundColor: visual.shell.dark, borderBottomWidth: 0 };
    r2TitleStyle = { color: text.onDark.primary };
    r2SubtitleStyle = { color: text.onDark.secondary };
    r2BackAppearance = 'onDark';
  } else if (appearance === 'ivory') {
    r2ContainerStyle = { backgroundColor: visual.surface.ivory, borderBottomWidth: 0 };
    r2TitleStyle = { color: text.onIvory.primary };
    r2SubtitleStyle = { color: text.onIvory.secondary };
    r2BackAppearance = 'onIvory';
  } else if (appearance === 'light') {
    r2ContainerStyle = { backgroundColor: visual.surface.light, borderBottomWidth: 0 };
    r2TitleStyle = { color: text.onIvory.primary };
    r2SubtitleStyle = { color: text.onIvory.secondary };
    r2BackAppearance = 'onIvory';
  }

  return (
    <View style={[styles.container, { paddingTop }, r2ContainerStyle, style]} testID={testID}>
      <View style={styles.headerBar}>
        {/* Leading Side (Back or Custom Leading Actions) */}
        <View style={styles.actionGroup}>
          {back && onBack && (
            <IconButton
              icon="arrow-right"
              onPress={onBack}
              accessibilityLabel="חזרה"
              variant="header"
              appearance={r2BackAppearance}
              testID={testID ? `${testID}-back` : undefined}
            />
          )}
          {leadingActions}
        </View>

        {/* Center / Title Column */}
        <View style={styles.titleContainer} accessibilityRole="header">
          <Text
            style={[titleTypography, styles.titleText, r2TitleStyle]}
            numberOfLines={1}
            accessibilityLabel={accessibilityTitle || title}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[typography.caption, styles.subtitleText, r2SubtitleStyle]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Trailing Side */}
        <View style={styles.actionGroup}>
          {trailingActions}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    width: '100%',
  },
  headerBar: {
    minHeight: sizing.headerHeight, // 56dp
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  titleText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitleText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
