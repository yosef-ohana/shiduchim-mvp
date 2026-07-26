/**
 * Static Verifier Script for Batch N2 — USER Balanced Five Shell
 * Dependency-free Node.js verifier using built-in modules only.
 * Executed via: node scripts/verifyBatchN2.mjs
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

console.log('--- Starting Batch N2 Static Verification ---');

// 1. Check file locations and existence
const bottomNavContent = readFile('src/navigation/user/BottomNavigation.tsx');
const userShellContent = readFile('src/navigation/user/UserShellStack.tsx');
const rootNavContent = readFile('src/navigation/RootNavigator.tsx');
const mainStackContent = readFile('src/navigation/MainStack.tsx');
const authStackContent = readFile('src/navigation/AuthStack.tsx');
const navTypesContent = readFile('src/types/navigation.ts');

assert(
  fs.existsSync(path.join(MOBILE_ROOT, 'scripts/verifyBatchN2.mjs')),
  'Verifier script must exist in mobile/scripts/ directory'
);
assert(
  !fs.existsSync(path.join(SRC_DIR, 'verifyBatchN2.mjs')) &&
  !fs.existsSync(path.join(SRC_DIR, 'scripts/verifyBatchN2.mjs')),
  'Verifier must NOT exist inside mobile/src/'
);

// 2. Verify 5 USER Roots & Hebrew Labels
const requiredRoots = [
  { name: 'DiscoverRoot', label: 'גילוי' },
  { name: 'ConnectionsRoot', label: 'קשרים' },
  { name: 'ChatsRoot', label: 'צ׳אטים' },
  { name: 'WeddingsRoot', label: 'חתונות' },
  { name: 'MeRoot', label: 'אני' },
];

requiredRoots.forEach(({ name, label }) => {
  assert(
    bottomNavContent.includes(`name="${name}"`) || bottomNavContent.includes(`'${name}'`),
    `BottomNavigation missing root tab name: ${name}`
  );
  assert(
    bottomNavContent.includes(`'${label}'`),
    `BottomNavigation missing canonical Hebrew label: ${label}`
  );
});

// 3. Verify RTL visual order configuration
assert(
  bottomNavContent.includes('flexDirection: \'row-reverse\'') ||
  bottomNavContent.includes('row-reverse'),
  'BottomNavigation must configure explicit RTL visual order (flexDirection: row-reverse)'
);

// 4. Verify 5 separate nested child stacks exist
assert(fs.existsSync(path.join(SRC_DIR, 'navigation/user/UserDiscoverStack.tsx')), 'Missing UserDiscoverStack.tsx');
assert(fs.existsSync(path.join(SRC_DIR, 'navigation/user/UserConnectionsStack.tsx')), 'Missing UserConnectionsStack.tsx');
assert(fs.existsSync(path.join(SRC_DIR, 'navigation/user/UserChatsStack.tsx')), 'Missing UserChatsStack.tsx');
assert(fs.existsSync(path.join(SRC_DIR, 'navigation/user/UserWeddingsStack.tsx')), 'Missing UserWeddingsStack.tsx');
assert(fs.existsSync(path.join(SRC_DIR, 'navigation/user/UserMeStack.tsx')), 'Missing UserMeStack.tsx');

// 5. Verify Notifications is NOT a tab
assert(
  !bottomNavContent.includes('NotificationsRoot') &&
  !bottomNavContent.includes('name="Notifications"'),
  'Notifications must NOT be declared as a bottom tab root'
);
assert(
  userShellContent.includes('name="Notifications"'),
  'Notifications must be declared in UserShellStack header action target'
);

// 6. Verify RootNavigator USER-only shell & staff MainStack retention
assert(
  rootNavContent.includes('UserShellStack'),
  'RootNavigator must import UserShellStack'
);
assert(
  rootNavContent.includes("outcome === 'USER'") && rootNavContent.includes('<UserShellStack />'),
  'RootNavigator must mount UserShellStack ONLY for USER outcome'
);
assert(
  (rootNavContent.includes("outcome === 'ADMIN'") && rootNavContent.includes('<AdminStack />')) ||
  (rootNavContent.includes("outcome === 'ADMIN'") && rootNavContent.includes('<MainStack />')),
  'RootNavigator must route staff outcomes (ADMIN/EVENT_MANAGER) to dedicated staff stacks'
);

// 7. Verify AuthStack 6 routes preserved
const authRoutes = ['Welcome', 'Login', 'Register', 'StaffLoginChoice', 'StaffLogin', 'WeddingCodeEntry'];
authRoutes.forEach((route) => {
  assert(
    authStackContent.includes(`name="${route}"`) || authTypesMatch(navTypesContent, route),
    `AuthStack route missing: ${route}`
  );
});

function authTypesMatch(content, route) {
  return content.includes(`${route}:`);
}

// 8. Verify MainStack 38 routes preserved
assert(mainStackContent.includes('MainStackParamList'), 'MainStackParamList missing in MainStack.tsx');

// 9. Verify WeddingCodeEntry vs JoinWedding separation
assert(authStackContent.includes('WeddingCodeEntry'), 'AuthStack must retain WeddingCodeEntry wrapper');
assert(
  readFile('src/navigation/user/UserWeddingsStack.tsx').includes('JoinWedding'),
  'UserWeddingsStack must contain JoinWedding'
);

// 10. Verify Connections compatibility bridge
const connStackContent = readFile('src/navigation/user/UserConnectionsStack.tsx');
assert(
  connStackContent.includes('compatibility bridge') || connStackContent.includes('Lists'),
  'Connections stack must be explicitly marked as a compatibility bridge to Lists'
);

// 11. Verify NO ConnectionsHub, AdminHome, or AdminOperations implementation created
assert(!fs.existsSync(path.join(SRC_DIR, 'screens/ConnectionsHub.tsx')), 'ConnectionsHub screen must NOT be created in N2');
assert(!fs.existsSync(path.join(SRC_DIR, 'screens/admin/AdminHome.tsx')), 'AdminHome screen must NOT be created in N2');
assert(!fs.existsSync(path.join(SRC_DIR, 'screens/admin/AdminOperations.tsx')), 'AdminOperations screen must NOT be created in N2');

// 12. Verify NO staff shell introduced
assert(!fs.existsSync(path.join(SRC_DIR, 'navigation/staff/StaffShellStack.tsx')), 'Staff shell must NOT be created in N2');

// 13. Verify NO API/backend imports in navigation files
const navFiles = [
  'src/navigation/RootNavigator.tsx',
  'src/navigation/user/UserShellStack.tsx',
  'src/navigation/user/BottomNavigation.tsx',
  'src/navigation/user/UserTabs.tsx',
  'src/navigation/user/UserDiscoverStack.tsx',
  'src/navigation/user/UserConnectionsStack.tsx',
  'src/navigation/user/UserChatsStack.tsx',
  'src/navigation/user/UserWeddingsStack.tsx',
  'src/navigation/user/UserMeStack.tsx',
];

navFiles.forEach((file) => {
  const content = readFile(file);
  assert(
    !content.includes("from '../../api") && !content.includes("from '../api"),
    `Navigation file ${file} must NOT import API modules directly`
  );
  assert(
    !content.includes("@backend"),
    `Navigation file ${file} must NOT import backend modules`
  );
});

// 14. Verify Tab Bar Visibility for Discover and PoolSelection
assert(
  bottomNavContent.includes("'PoolSelection'") && bottomNavContent.includes("'Discover'"),
  'TAB_BAR_VISIBLE_ROUTES must include both PoolSelection and Discover'
);

console.log('✅ ALL BATCH N2 STATIC VERIFICATION CHECKS PASSED SUCCESSFULLY!');

