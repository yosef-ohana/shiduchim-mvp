import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute, StackActions } from '@react-navigation/native';
import { StyleSheet, Pressable, Text } from 'react-native';
import { UserTabsParamList } from '../../types/navigation';
import { UserDiscoverStack } from './UserDiscoverStack';
import { UserConnectionsStack } from './UserConnectionsStack';
import { UserChatsStack } from './UserChatsStack';
import { UserWeddingsStack } from './UserWeddingsStack';
import { UserMeStack } from './UserMeStack';
import { AppIcon } from '../../components/foundation/AppIcon';
import { navigation as navTokens, visual, gold, spacing, sizing, radii, borderWidths } from '../../theme/tokens';
import { typography, FONT_KEYS } from '../../theme/typography';

const Tab = createBottomTabNavigator<UserTabsParamList>();

// Legal USER root-experience surfaces where bottom navigation is visible
const TAB_BAR_VISIBLE_ROUTES = new Set([
  'PoolSelection',
  'Discover',
  'ConnectionsHub',
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
  const tabBarMinHeight = sizing.headerHeight + bottomInset;

  return (
    <Tab.Navigator
      initialRouteName="DiscoverRoot"
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: navTokens.active.onDark,
        tabBarInactiveTintColor: navTokens.inactive.onDark,
        tabBarStyle: getTabBarVisibility(route)
          ? {
              backgroundColor: navTokens.surface.dark,
              borderTopWidth: borderWidths.thin,
              borderTopColor: visual.surface.darkRaised,
              minHeight: tabBarMinHeight,
              paddingBottom: bottomInset,
              paddingTop: spacing.xs,
            }
          : { display: 'none' },
        tabBarItemStyle: {
          minHeight: sizing.minTouchTarget,
          minWidth: sizing.minTouchTarget,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
        tabBarButton: (props) => {
          const { accessibilityState, style, children, ...rest } = props;
          const focused = accessibilityState?.selected ?? false;
          return (
            <Pressable
              {...rest}
              accessibilityState={accessibilityState}
              style={[
                style,
                styles.tabItem,
                focused ? styles.tabItemSelected : styles.tabItemUnselected,
              ]}
            >
              {children}
            </Pressable>
          );
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
        listeners={({ navigation }) => ({
          tabPress: () => {
            if (navigation.isFocused()) {
              navigation.dispatch(StackActions.popToTop());
            }
          },
        })}
        options={{
          title: 'גילוי',
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={[
                typography.caption,
                {
                  color,
                  fontFamily: focused ? FONT_KEYS.bold : FONT_KEYS.regular,
                  fontWeight: focused ? '700' : '400',
                  fontSize: 12,
                  marginTop: 2,
                },
              ]}
            >
              גילוי
            </Text>
          ),
          tabBarAccessibilityLabel: 'גילוי',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="navDiscover" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ConnectionsRoot"
        component={UserConnectionsStack}
        listeners={({ navigation }) => ({
          tabPress: () => {
            if (navigation.isFocused()) {
              navigation.dispatch(StackActions.popToTop());
            }
          },
        })}
        options={{
          title: 'קשרים',
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={[
                typography.caption,
                {
                  color,
                  fontFamily: focused ? FONT_KEYS.bold : FONT_KEYS.regular,
                  fontWeight: focused ? '700' : '400',
                  fontSize: 12,
                  marginTop: 2,
                },
              ]}
            >
              קשרים
            </Text>
          ),
          tabBarAccessibilityLabel: 'קשרים',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="navConnections" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatsRoot"
        component={UserChatsStack}
        listeners={({ navigation }) => ({
          tabPress: () => {
            if (navigation.isFocused()) {
              navigation.dispatch(StackActions.popToTop());
            }
          },
        })}
        options={{
          title: 'צ׳אטים',
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={[
                typography.caption,
                {
                  color,
                  fontFamily: focused ? FONT_KEYS.bold : FONT_KEYS.regular,
                  fontWeight: focused ? '700' : '400',
                  fontSize: 12,
                  marginTop: 2,
                },
              ]}
            >
              צ׳אטים
            </Text>
          ),
          tabBarAccessibilityLabel: 'צ׳אטים',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="navChats" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WeddingsRoot"
        component={UserWeddingsStack}
        listeners={({ navigation }) => ({
          tabPress: () => {
            if (navigation.isFocused()) {
              navigation.dispatch(StackActions.popToTop());
            }
          },
        })}
        options={{
          title: 'חתונות',
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={[
                typography.caption,
                {
                  color,
                  fontFamily: focused ? FONT_KEYS.bold : FONT_KEYS.regular,
                  fontWeight: focused ? '700' : '400',
                  fontSize: 12,
                  marginTop: 2,
                },
              ]}
            >
              חתונות
            </Text>
          ),
          tabBarAccessibilityLabel: 'חתונות',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="navWeddings" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MeRoot"
        component={UserMeStack}
        listeners={({ navigation }) => ({
          tabPress: () => {
            if (navigation.isFocused()) {
              navigation.dispatch(StackActions.popToTop());
            }
          },
        })}
        options={{
          title: 'אני',
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={[
                typography.caption,
                {
                  color,
                  fontFamily: focused ? FONT_KEYS.bold : FONT_KEYS.regular,
                  fontWeight: focused ? '700' : '400',
                  fontSize: 12,
                  marginTop: 2,
                },
              ]}
            >
              אני
            </Text>
          ),
          tabBarAccessibilityLabel: 'אני',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="navMe" size={size || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    minHeight: sizing.minTouchTarget,
    minWidth: sizing.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xxs,
    marginVertical: spacing.xxs,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  tabItemSelected: {
    backgroundColor: visual.surface.darkRaised,
    borderWidth: borderWidths.thin,
    borderColor: gold.border.restrained,
  },
  tabItemUnselected: {
    backgroundColor: 'transparent',
    borderWidth: borderWidths.thin,
    borderColor: 'transparent',
  },
});
