/**
 * StaffHeader Component — Batch N3
 * Role-aware, safe-area aware header for ADMIN and EVENT_MANAGER navigation shells.
 */
import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { IconButton } from '../../components/foundation/IconButton';
import { useAuth } from '../../context/AuthContext';
import { getUserRoleLabel } from '../../utils/displayLabels';

export interface StaffHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  safeArea?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  title,
  subtitle,
  back = false,
  onBack,
  safeArea = true,
  testID,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const paddingTop = safeArea ? insets.top : 0;
  const { user, logout } = useAuth();

  const roleLabel = getUserRoleLabel(user?.role);
  const accountContextText = user?.email
    ? `${roleLabel} • ${user.email}`
    : roleLabel;

  return (
    <View style={[styles.container, { paddingTop }, style]} testID={testID}>
      <View style={styles.headerBar}>
        {/* Leading Side (Back action if enabled) */}
        <View style={styles.actionGroup}>
          {back && onBack ? (
            <IconButton
              icon="arrow-right"
              onPress={onBack}
              accessibilityLabel="חזרה"
              variant="header"
              testID={testID ? `${testID}-back` : 'staff-header-back-button'}
            />
          ) : (
            <View style={styles.placeholderAction} />
          )}
        </View>

        {/* Center Title & Role/Account Context Column */}
        <View style={styles.titleContainer} accessibilityRole="header">
          <Text
            style={[typography.titleMedium, styles.titleText]}
            numberOfLines={1}
            accessibilityLabel={title}
          >
            {title}
          </Text>
          <Text
            style={[typography.caption, styles.subtitleText]}
            numberOfLines={1}
            accessibilityLabel={subtitle || accountContextText}
          >
            {subtitle || accountContextText}
          </Text>
        </View>

        {/* Trailing Side (Logout action ONLY - NO USER bell/notifications) */}
        <View style={styles.actionGroup}>
          <IconButton
            icon="log-out"
            onPress={logout}
            accessibilityLabel="התנתקות"
            variant="header"
            testID="header-logout-button"
          />
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
    minWidth: sizing.minTouchTarget, // 48dp
    justifyContent: 'center',
  },
  placeholderAction: {
    width: sizing.minTouchTarget, // 48dp placeholder alignment balance
    height: sizing.minTouchTarget,
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
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});
