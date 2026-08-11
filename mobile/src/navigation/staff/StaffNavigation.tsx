/**
 * StaffNavigation Component — Batch N4
 * Persistent 4-Domain Navigation Shell for canonical ADMIN role.
 * Implements visual authority contract B-08 / S6-A08-F01 with R2 semantic tokens.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../../components/foundation/AppIcon';
import { SemanticIconName } from '../../theme/icons';
import { tokens } from '../../theme/tokens';

export type AdminDomain = 'HOME' | 'USERS' | 'WEDDINGS' | 'OPERATIONS';

export interface AdminDomainItem {
  id: AdminDomain;
  label: string;
  iconName: SemanticIconName;
  rootRoute: string;
}

export const ADMIN_DOMAINS: AdminDomainItem[] = [
  { id: 'HOME', label: 'ראשי', iconName: 'home', rootRoute: 'AdminHome' },
  { id: 'USERS', label: 'משתמשים', iconName: 'user', rootRoute: 'AdminUsers' },
  { id: 'WEDDINGS', label: 'חתונות', iconName: 'navWeddings', rootRoute: 'AdminWeddings' },
  { id: 'OPERATIONS', label: 'תפעול', iconName: 'settings', rootRoute: 'AdminOperations' },
];

/**
 * Validates explicit ADMIN N5E return/domain context for AdminEventManagerDetails.
 * Rejects malformed, wrong-role, inconsistent or illegal explicit context.
 * Returns valid AdminDomain or undefined (fails closed to canonical mapping).
 */
export function validateAdminEventManagerContext(context: any): AdminDomain | undefined {
  if (!context || typeof context !== 'object') return undefined;

  // 1. Role must be ADMIN
  if (context.role !== 'ADMIN') return undefined;

  // 2. Validate source/domain/return pairing and entity IDs
  if (
    context.sourceRoute === 'AdminUsers' &&
    context.domain === 'USERS' &&
    context.returnRoute === 'AdminUsers'
  ) {
    return 'USERS';
  }

  if (
    context.sourceRoute === 'AdminWeddings' &&
    context.domain === 'WEDDINGS' &&
    context.returnRoute === 'AdminWeddings'
  ) {
    return 'WEDDINGS';
  }

  if (
    context.sourceRoute === 'AdminWeddingDetails' &&
    context.domain === 'WEDDINGS' &&
    context.returnRoute === 'AdminWeddingDetails' &&
    typeof context.weddingId === 'number' &&
    !isNaN(context.weddingId) &&
    context.weddingId > 0
  ) {
    return 'WEDDINGS';
  }

  if (
    context.sourceRoute === 'CreateAdminWedding' &&
    context.domain === 'WEDDINGS' &&
    context.returnRoute === 'CreateAdminWedding'
  ) {
    return 'WEDDINGS';
  }

  if (
    context.sourceRoute === 'AdminEventManagers' &&
    context.domain === 'OPERATIONS' &&
    context.returnRoute === 'AdminEventManagers'
  ) {
    return 'OPERATIONS';
  }

  return undefined;
}

export function validateAdminWeddingContext(context: any): AdminDomain | undefined {
  if (!context || typeof context !== 'object') return undefined;
  if (context.role !== 'ADMIN') return undefined;

  if (
    context.sourceRoute === 'AdminEventManagerDetails' &&
    context.returnRoute === 'AdminEventManagerDetails' &&
    typeof context.managerId === 'number' &&
    !isNaN(context.managerId) &&
    context.managerId > 0
  ) {
    if (context.domain === 'USERS' || context.domain === 'WEDDINGS' || context.domain === 'OPERATIONS') {
      return context.domain;
    }
  }

  return undefined;
}

export function validateAdminReportDetailsContext(context: any): AdminDomain | undefined {
  if (!context || typeof context !== 'object') return undefined;
  if (context.role !== 'ADMIN') return undefined;

  if (
    context.sourceRoute === 'AdminReports' &&
    context.domain === 'OPERATIONS' &&
    context.returnRoute === 'AdminReports'
  ) {
    return 'OPERATIONS';
  }

  return undefined;
}

export function validateAdminProductFeedbackDetailsContext(context: any): AdminDomain | undefined {
  if (!context || typeof context !== 'object') return undefined;
  if (context.role !== 'ADMIN') return undefined;

  if (
    context.sourceRoute === 'AdminProductFeedback' &&
    context.domain === 'OPERATIONS' &&
    context.returnRoute === 'AdminProductFeedback'
  ) {
    return 'OPERATIONS';
  }

  return undefined;
}

export function validateStaffParticipantDetailsContext(context: any): AdminDomain | undefined {
  if (!context || typeof context !== 'object') return undefined;
  if (context.role !== 'ADMIN') return undefined;

  if (
    (context.sourceRoute === 'AdminReportDetails' ||
      context.sourceRoute === 'AdminProductFeedbackDetails' ||
      context.sourceRoute === 'AdminProductFeedback') &&
    context.domain === 'OPERATIONS' &&
    (context.returnRoute === 'AdminReportDetails' ||
      context.returnRoute === 'AdminProductFeedbackDetails' ||
      context.returnRoute === 'AdminProductFeedback')
  ) {
    return 'OPERATIONS';
  }

  return undefined;
}

/**
 * Derives the active ADMIN selected domain strictly from route name + params.
 * Selection MUST be derived from route + canonical route params/source, NEVER visible text.
 * Returns undefined for unknown / unmapped routes or sources (fails closed).
 */
export function getAdminSelectedDomain(routeName?: string, params?: any): AdminDomain | undefined {
  if (!routeName) return undefined;

  // 0. Valid explicit N5E return/domain context (Precedence 1)
  if (routeName === 'AdminEventManagerDetails' && params?.returnContext) {
    const validatedDomain = validateAdminEventManagerContext(params.returnContext);
    if (validatedDomain) {
      return validatedDomain;
    }
  }

  if (routeName === 'AdminWeddingDetails' && params?.returnContext) {
    const validatedDomain = validateAdminWeddingContext(params.returnContext);
    if (validatedDomain) {
      return validatedDomain;
    }
  }

  if (routeName === 'AdminReportDetails' && params?.returnContext) {
    const validatedDomain = validateAdminReportDetailsContext(params.returnContext);
    if (validatedDomain) {
      return validatedDomain;
    }
  }

  if (routeName === 'AdminProductFeedbackDetails' && params?.returnContext) {
    const validatedDomain = validateAdminProductFeedbackDetailsContext(params.returnContext);
    if (validatedDomain) {
      return validatedDomain;
    }
  }

  if (routeName === 'StaffParticipantDetails' && params?.returnContext) {
    const validatedDomain = validateStaffParticipantDetailsContext(params.returnContext);
    if (validatedDomain) {
      return validatedDomain;
    }
  }

  // 1. HOME domain mapping
  if (routeName === 'AdminHome') {
    return 'HOME';
  }

  // 2. USERS domain mapping
  if (routeName === 'AdminUsers') {
    return 'USERS';
  }
  if (routeName === 'StaffParticipantDetails' && params?.source === 'ADMIN_USERS') {
    return 'USERS';
  }

  // 3. WEDDINGS domain mapping
  if (
    routeName === 'AdminWeddings' ||
    routeName === 'AdminWeddingDetails' ||
    routeName === 'CreateAdminWedding' ||
    routeName === 'WeddingParticipants'
  ) {
    return 'WEDDINGS';
  }
  if (routeName === 'StaffParticipantDetails' && params?.source === 'PARTICIPANTS') {
    return 'WEDDINGS';
  }

  // 4. OPERATIONS domain mapping
  if (
    routeName === 'AdminOperations' ||
    routeName === 'AdminEventManagers' ||
    routeName === 'AdminEventManagerDetails' ||
    routeName === 'CreateEventManager' ||
    routeName === 'AdminReports' ||
    routeName === 'AdminReportDetails' ||
    routeName === 'AdminProductFeedback' ||
    routeName === 'AdminProductFeedbackDetails'
  ) {
    return 'OPERATIONS';
  }
  if (
    routeName === 'StaffParticipantDetails' &&
    (params?.source === 'ADMIN_REPORTS' || params?.source === 'ADMIN_PRODUCT_FEEDBACK')
  ) {
    return 'OPERATIONS';
  }

  // Unmapped/unknown source on StaffParticipantDetails or any other route fails closed (no domain selected)
  return undefined;
}

export const StaffNavigation: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [navState, setNavState] = React.useState<any>(() => {
    try {
      return navigation.getState();
    } catch {
      return undefined;
    }
  });

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      try {
        setNavState(navigation.getState());
      } catch {
        // Safe fallback
      }
    });
    return unsubscribe;
  }, [navigation]);

  const currentRoute = navState ? navState.routes[navState.index] : undefined;
  const routeName = currentRoute?.name;
  const params = currentRoute?.params;

  const selectedDomain = getAdminSelectedDomain(routeName, params);

  // Hide StaffNavigation surface completely on unmapped routes or full-screen denied boundaries
  if (!selectedDomain) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, tokens.spacing.xs) },
      ]}
      testID="staff-navigation-bar"
    >
      <View style={styles.content}>
        {ADMIN_DOMAINS.map(domain => {
          const isSelected = selectedDomain === domain.id;

          return (
            <TouchableOpacity
              key={domain.id}
              style={[
                styles.tabItem,
                isSelected && styles.tabItemSelected,
              ]}
              onPress={() => navigation.navigate(domain.rootRoute)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={domain.label}
              testID={`staff-nav-tab-${domain.id.toLowerCase()}`}
              activeOpacity={0.7}
            >
              <AppIcon
                name={domain.iconName}
                size={tokens.sizing.iconMd}
                color={
                  isSelected
                    ? tokens.navigation.active.onDark
                    : tokens.navigation.inactive.onDark
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  isSelected ? styles.tabLabelSelected : styles.tabLabelInactive,
                ]}
                numberOfLines={1}
              >
                {domain.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.navigation.surface.dark, // #0C0D0F (Dark Staff Chrome)
    borderTopWidth: tokens.border.standard,
    borderTopColor: tokens.gold.border.restrained, // #C79B62 (Restrained gold border)
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: tokens.spacing.xs,
    paddingTop: tokens.spacing.xs,
    minHeight: tokens.sizing.minTouchTarget, // 48dp minimum touch target
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.xxs,
    borderRadius: tokens.radii.sm,
    minHeight: tokens.sizing.minTouchTarget,
    marginHorizontal: tokens.spacing.xxs,
  },
  tabItemSelected: {
    backgroundColor: tokens.visual.surface.darkRaised, // #18191A (Framed/raised non-color cue)
    borderWidth: tokens.border.standard,
    borderColor: tokens.gold.border.strong, // Restrained gold selection treatment
  },
  tabLabel: {
    fontSize: 12,
    marginTop: tokens.spacing.xxs,
    textAlign: 'center',
  },
  tabLabelSelected: {
    color: tokens.text.onDark.primary, // #F3E7DD (Ivory/gold text)
    fontWeight: '600',
  },
  tabLabelInactive: {
    color: tokens.navigation.inactive.onDark, // #817C78
    fontWeight: '400',
  },
});
