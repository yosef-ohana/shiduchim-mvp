import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { UserTabsParamList } from '../../types/navigation';
import { UserDiscoverStack } from './UserDiscoverStack';
import { UserConnectionsStack } from './UserConnectionsStack';
import { UserChatsStack } from './UserChatsStack';
import { UserWeddingsStack } from './UserWeddingsStack';
import { UserMeStack } from './UserMeStack';
import { AppIcon } from '../../components/foundation/AppIcon';
import { colors, spacing, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';

const Tab = createBottomTabNavigator<UserTabsParamList>();

// Routes where the bottom tab bar MUST be visible
const TAB_BAR_VISIBLE_ROUTES = new Set([
  'PoolSelection',
  'Discover',
  'ConnectionsHub',
  'Lists',
  'Chats',
  'MyWeddings',
  'Me',
]);

/**
 * Determines whether the bottom tab bar should be shown based on child stack active route.
 * Centralized tab bar visibility rule — domain screens must NOT contain tab visibility conditions.
 */
export const getTabBarVisibility = (route: any): boolean => {
  const routeName = getFocusedRouteNameFromRoute(route);
  if (!routeName) {
    // If at root of child stack, tab bar is visible
    return true;
  }
  return TAB_BAR_VISIBLE_ROUTES.has(routeName);
};

export const BottomNavigation: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.xs);
  const tabBarHeight = sizing.headerHeight + bottomInset;

  return (
    <Tab.Navigator
      initialRouteName="DiscoverRoot"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderSubtle,
          height: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: spacing.xs,
          flexDirection: 'row-reverse', // Ensures strict RTL visual order: Discover (Right) -> Me (Left)
        },
        tabBarItemStyle: {
          minHeight: sizing.minTouchTarget,
          minWidth: sizing.minTouchTarget,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 12,
          marginTop: 2,
        },
      })}
    >
      {/* 
        Explicit RTL visual order (Right to Left):
        1. DiscoverRoot (גילוי) - Rightmost
        2. ConnectionsRoot (קשרים)
        3. ChatsRoot (צ׳אטים)
        4. WeddingsRoot (חתונות)
        5. MeRoot (אני) - Leftmost
      */}
      <Tab.Screen
        name="DiscoverRoot"
        component={UserDiscoverStack}
        options={({ route }) => ({
          title: 'גילוי',
          tabBarLabel: 'גילוי',
          tabBarAccessibilityLabel: 'גילוי',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="navDiscover" size={size || 24} color={color} />
          ),
          tabBarStyle: getTabBarVisibility(route)
            ? {
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.borderSubtle,
                height: tabBarHeight,
                paddingBottom: bottomInset,
                paddingTop: spacing.xs,
                flexDirection: 'row-reverse',
              }
            : { display: 'none' },
        })}
      />
      <Tab.Screen
        name="ConnectionsRoot"
        component={UserConnectionsStack}
        options={({ route }) => ({
          title: 'קשרים',
          tabBarLabel: 'קשרים',
          tabBarAccessibilityLabel: 'קשרים',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="navConnections" size={size || 24} color={color} />
          ),
          tabBarStyle: getTabBarVisibility(route)
            ? {
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.borderSubtle,
                height: tabBarHeight,
                paddingBottom: bottomInset,
                paddingTop: spacing.xs,
                flexDirection: 'row-reverse',
              }
            : { display: 'none' },
        })}
      />
      <Tab.Screen
        name="ChatsRoot"
        component={UserChatsStack}
        options={({ route }) => ({
          title: 'צ׳אטים',
          tabBarLabel: 'צ׳אטים',
          tabBarAccessibilityLabel: 'צ׳אטים',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="navChats" size={size || 24} color={color} />
          ),
          tabBarStyle: getTabBarVisibility(route)
            ? {
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.borderSubtle,
                height: tabBarHeight,
                paddingBottom: bottomInset,
                paddingTop: spacing.xs,
                flexDirection: 'row-reverse',
              }
            : { display: 'none' },
        })}
      />
      <Tab.Screen
        name="WeddingsRoot"
        component={UserWeddingsStack}
        options={({ route }) => ({
          title: 'חתונות',
          tabBarLabel: 'חתונות',
          tabBarAccessibilityLabel: 'חתונות',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="navWeddings" size={size || 24} color={color} />
          ),
          tabBarStyle: getTabBarVisibility(route)
            ? {
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.borderSubtle,
                height: tabBarHeight,
                paddingBottom: bottomInset,
                paddingTop: spacing.xs,
                flexDirection: 'row-reverse',
              }
            : { display: 'none' },
        })}
      />
      <Tab.Screen
        name="MeRoot"
        component={UserMeStack}
        options={({ route }) => ({
          title: 'אני',
          tabBarLabel: 'אני',
          tabBarAccessibilityLabel: 'אני',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="navMe" size={size || 24} color={color} />
          ),
          tabBarStyle: getTabBarVisibility(route)
            ? {
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.borderSubtle,
                height: tabBarHeight,
                paddingBottom: bottomInset,
                paddingTop: spacing.xs,
                flexDirection: 'row-reverse',
              }
            : { display: 'none' },
        })}
      />
    </Tab.Navigator>
  );
};
