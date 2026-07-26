/**
 * AppHeader Primitive — Batch F1
 * Header component for auth, user, and compact detail views with safe-area support and RTL arrow mirroring.
 */
import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, sizing } from '../../theme/tokens';
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
}) => {
  const insets = useSafeAreaInsets();
  const paddingTop = safeArea ? insets.top : 0;

  const isCompact = variant === 'compact-detail';
  const titleTypography = isCompact ? typography.titleSmall : typography.titleMedium;

  return (
    <View style={[styles.container, { paddingTop }, style]} testID={testID}>
      <View style={styles.headerBar}>
        {/* Leading Side (Back or Custom Leading Actions) */}
        <View style={styles.actionGroup}>
          {back && onBack && (
            <IconButton
              icon="arrow-right"
              onPress={onBack}
              accessibilityLabel="חזרה"
              variant="header"
              testID={testID ? `${testID}-back` : undefined}
            />
          )}
          {leadingActions}
        </View>

        {/* Center / Title Column */}
        <View style={styles.titleContainer} accessibilityRole="header">
          <Text
            style={[titleTypography, styles.titleText]}
            numberOfLines={1}
            accessibilityLabel={accessibilityTitle || title}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[typography.caption, styles.subtitleText]} numberOfLines={1}>
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
