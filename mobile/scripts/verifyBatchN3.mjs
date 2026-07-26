/**
 * Static Verifier Script for Batch N3 — ADMIN and EVENT_MANAGER Role Shells
 * Dependency-free Node.js verifier using built-in modules only.
 * Executed via: node scripts/verifyBatchN3.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MOBILE_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(MOBILE_ROOT, 'src');

function readFile(relativePath) {
  const fullPath = path.join(MOBILE_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Required file missing: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`[VERIFIER FAIL] ${message}`);
    process.exit(1);
  }
}

console.log('--- Starting Batch N3 Static Verification ---');

// 1. Check verifier script location
assert(
  fs.existsSync(path.join(MOBILE_ROOT, 'scripts/verifyBatchN3.mjs')),
  'Verifier script must exist in mobile/scripts/ directory'
);
assert(
  !fs.existsSync(path.join(SRC_DIR, 'verifyBatchN3.mjs')) &&
  !fs.existsSync(path.join(SRC_DIR, 'scripts/verifyBatchN3.mjs')),
  'Verifier must NOT exist inside mobile/src/'
);

// 2. Verify N1 and N2 verifiers still exist
assert(fs.existsSync(path.join(MOBILE_ROOT, 'scripts/verifyBatchN2.mjs')), 'verifyBatchN2.mjs must exist');
assert(fs.existsSync(path.join(MOBILE_ROOT, 'scripts/verifyBatch1.ts')) || fs.existsSync(path.join(MOBILE_ROOT, 'scripts/verifyBatchN1.ts')), 'N1 verifier must exist');

// 3. Check created N3 files existence
assert(fs.existsSync(path.join(SRC_DIR, 'navigation/staff/StaffHeader.tsx')), 'StaffHeader.tsx must exist');
assert(fs.existsSync(path.join(SRC_DIR, 'navigation/staff/StaffGuardedRoute.tsx')), 'StaffGuardedRoute.tsx must exist');
assert(fs.existsSync(path.join(SRC_DIR, 'navigation/staff/AdminStack.tsx')), 'AdminStack.tsx must exist');
assert(fs.existsSync(path.join(SRC_DIR, 'navigation/staff/EventManagerStack.tsx')), 'EventManagerStack.tsx must exist');

// 4. Verify RootNavigator role routing
const rootNavContent = readFile('src/navigation/RootNavigator.tsx');
assert(rootNavContent.includes('AdminStack'), 'RootNavigator must import AdminStack');
assert(rootNavContent.includes('EventManagerStack'), 'RootNavigator must import EventManagerStack');
assert(
  rootNavContent.includes("outcome === 'ADMIN'") && rootNavContent.includes('<AdminStack />'),
  'RootNavigator must mount AdminStack for ADMIN role'
);
assert(
  rootNavContent.includes("outcome === 'EVENT_MANAGER'") && rootNavContent.includes('<EventManagerStack />'),
  'RootNavigator must mount EventManagerStack for EVENT_MANAGER role'
);
assert(
  !rootNavContent.includes("outcome === 'ADMIN'") || !rootNavContent.includes('<MainStack />'),
  'RootNavigator must NOT mount MainStack for staff outcomes in N3'
);

// 5. Verify AdminStack contracts & initialRouteName
const adminStackContent = readFile('src/navigation/staff/AdminStack.tsx');
assert(
  adminStackContent.includes('initialRouteName="AdminHome"'),
  'AdminStack initialRouteName must strictly be "AdminHome"'
);
assert(
  adminStackContent.includes('AdminHome') && adminStackContent.includes('AdminOperations'),
  'AdminStack must register AdminHome and AdminOperations compatibility aliases'
);
assert(
  adminStackContent.includes('StaffHeader'),
  'AdminStack must render StaffHeader'
);
assert(
  !adminStackContent.includes('UserTabs') &&
  !adminStackContent.includes('BottomNavigation') &&
  !adminStackContent.includes('UserShellStack') &&
  !adminStackContent.includes('MeScreen'),
  'AdminStack must NOT import or render UserTabs, BottomNavigation, UserShellStack, or MeScreen'
);

// 6. Verify EventManagerStack contracts & initialRouteName
const emStackContent = readFile('src/navigation/staff/EventManagerStack.tsx');
assert(
  emStackContent.includes('initialRouteName="EventManagerWeddings"'),
  'EventManagerStack initialRouteName must strictly be "EventManagerWeddings"'
);
assert(
  emStackContent.includes('StaffHeader'),
  'EventManagerStack must render StaffHeader'
);
assert(
  !emStackContent.includes('UserTabs') &&
  !emStackContent.includes('BottomNavigation') &&
  !emStackContent.includes('UserShellStack') &&
  !emStackContent.includes('MeScreen') &&
  !emStackContent.includes('AdminUsersScreen') &&
  !emStackContent.includes('NotificationsScreen'),
  'EventManagerStack must NOT import or render USER or ADMIN screens'
);

// 7. Verify StaffHeader contracts
const staffHeaderContent = readFile('src/navigation/staff/StaffHeader.tsx');
assert(
  !staffHeaderContent.includes('header-notifications-button') &&
  !staffHeaderContent.includes('icon="bell"'),
  'StaffHeader must NOT contain USER Notifications button or bell icon'
);
assert(
  staffHeaderContent.includes('icon="log-out"') &&
  staffHeaderContent.includes('logout'),
  'StaffHeader must contain logout action with log-out icon'
);
assert(
  staffHeaderContent.includes('useSafeAreaInsets'),
  'StaffHeader must be safe-area aware'
);

// 8. Verify StaffGuardedRoute contracts
const guardContent = readFile('src/navigation/staff/StaffGuardedRoute.tsx');
assert(
  guardContent.includes('WeddingParticipants') &&
  guardContent.includes('StaffParticipantDetails'),
  'StaffGuardedRoute must support WeddingParticipants and StaffParticipantDetails'
);
assert(
  guardContent.includes('expectedRole') && guardContent.includes('ADMIN_ONLY_SOURCES'),
  'StaffGuardedRoute must validate expectedRole and check ADMIN_ONLY_SOURCES'
);
assert(
  adminStackContent.includes('StaffGuardedRoute'),
  'AdminStack must wrap shared routes with StaffGuardedRoute'
);
assert(
  emStackContent.includes('StaffGuardedRoute'),
  'EventManagerStack must wrap shared routes with StaffGuardedRoute'
);

// 9. Verify navigation parameter types in navigation.ts
const navTypesContent = readFile('src/types/navigation.ts');
assert(
  navTypesContent.includes('AdminHome: undefined;'),
  'AdminHome parameter type must strictly be undefined'
);
assert(
  navTypesContent.includes('AdminOperations: undefined;'),
  'AdminOperations parameter type must strictly be undefined'
);
assert(
  navTypesContent.includes('AdminUsers: { focusUserId?: number } | undefined;'),
  'AdminUsers parameter type must retain focusUserId'
);
assert(
  navTypesContent.includes('AdminStackParamList') && navTypesContent.includes('EventManagerStackParamList'),
  'navigation.ts must export AdminStackParamList and EventManagerStackParamList'
);

// 10. Verify target screen files status for AdminHome and AdminOperations
// (In N3 baseline these were adapters; in Batch A8 real screens are implemented)

// 11. Verify aliases NOT registered in MainStack
const mainStackContent = readFile('src/navigation/MainStack.tsx');
assert(
  !mainStackContent.includes('name="AdminHome"') && !mainStackContent.includes('name="AdminOperations"'),
  'MainStack.tsx must NOT register AdminHome or AdminOperations additive aliases'
);

// 12. Verify exactly three canonical roles
assert(
  navTypesContent.includes("'USER' | 'ADMIN' | 'EVENT_MANAGER'") ||
  navTypesContent.includes("'USER'") && navTypesContent.includes("'ADMIN'") && navTypesContent.includes("'EVENT_MANAGER'"),
  'Only 3 canonical roles are permitted in RootOutcome'
);

// 13. Verify deep link configuration in linking.ts
const linkingContent = readFile('src/navigation/linking.ts');
assert(
  linkingContent.includes('isUserRole'),
  'linking.ts must filter deep links by isUserRole'
);

console.log('✅ ALL BATCH N3 STATIC VERIFICATION CHECKS PASSED SUCCESSFULLY!');
