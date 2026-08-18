import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { BidiText } from '../../components/foundation/BidiText';
import { ActionButtons } from '../../components/ActionButtons';
import { OpeningMessageComposer } from '../../components/OpeningMessageComposer';
import { colors, spacing, radii, sizing, visual, text, gold } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { getDiscoverCandidates } from '../../api/discoverApi';
import { getMyWeddings } from '../../api/weddingsApi';
import { sendOpeningMessage } from '../../api/openingMessagesApi';
import { getMatches } from '../../api/matchesApi';
import { PublicUserCardResponse, UserWeddingResponse } from '../../types/api';
import { formatDisplayDate, getEmptyLabel } from '../../utils/displayLabels';
import { getImageUrl } from '../../utils/imageUrl';

export type ScreenState =
  | 'LOADING'
  | 'STAFF_DENIED'
  | 'STALE_WEDDING'
  | 'PARTICIPANT_INACTIVE'
  | 'ACCESS_DENIED'
  | 'CONTEXT_NOT_FOUND'
  | 'TRANSPORT_ERROR'
  | 'EMPTY'
  | 'LOADED';

// Decorative Svg Elements for A-03 Discover Family
const KnotOrnament = ({ size = 18, color = gold.border.strong }: { size?: number; color?: string }) => (
  <Svg width={size * 1.6} height={size} viewBox="0 0 32 20" fill="none">
    <Path
      d="M16 10C13 6 8 4 5 7C2 10 2 15 6 17C10 19 14 15 16 10ZM16 10C19 6 24 4 27 7C30 10 30 15 26 17C22 19 18 15 16 10Z"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="16" cy="10" r="1.5" fill={color} />
  </Svg>
);

const KnotDivider = () => (
  <View style={styles.knotDividerRow}>
    <View style={styles.dividerLine} />
    <KnotOrnament size={14} color={gold.border.strong} />
    <View style={styles.dividerLine} />
  </View>
);

const PauseMedallion = () => (
  <View style={styles.medallionWrapper}>
    <View style={styles.medallionCircle}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x="6" y="4" width="4" height="16" rx="1.5" fill={gold.border.strong} />
        <Rect x="14" y="4" width="4" height="16" rx="1.5" fill={gold.border.strong} />
      </Svg>
    </View>
  </View>
);

const SearchMedallion = () => (
  <View style={styles.medallionWrapper}>
    <View style={styles.medallionCircle}>
      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <Circle cx="10" cy="8" r="4" stroke={gold.border.strong} strokeWidth="1.8" />
        <Path
          d="M4 18C4 15 7 14 10 14C11.5 14 13 14.5 14 15.5"
          stroke={gold.border.strong}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Circle cx="16" cy="16" r="5" stroke={gold.border.strong} strokeWidth="1.8" />
        <Path d="M19.5 19.5L22 22" stroke={gold.border.strong} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
  </View>
);

const GlobeBadge = () => (
  <View style={styles.contextBadgeCircle}>
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={gold.border.strong} strokeWidth="1.5" />
      <Path d="M2 12H22" stroke={gold.border.strong} strokeWidth="1.5" strokeLinecap="round" />
      <Path
        d="M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z"
        stroke={gold.border.strong}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

const CalendarBadge = () => (
  <View style={styles.contextBadgeCircle}>
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="3" stroke={gold.border.strong} strokeWidth="1.5" />
      <Path d="M3 9H21" stroke={gold.border.strong} strokeWidth="1.5" />
      <Path d="M8 2V5" stroke={gold.border.strong} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M16 2V5" stroke={gold.border.strong} strokeWidth="1.5" strokeLinecap="round" />
      <Path
        d="M12 13C12 13 10.5 11.5 9.5 12.5C8.5 13.5 10 15 12 16.5C14 15 15.5 13.5 14.5 12.5C13.5 11.5 12 13 12 13Z"
        stroke={gold.border.strong}
        strokeWidth="1.2"
        fill={gold.border.strong}
      />
    </Svg>
  </View>
);

export const DiscoverScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { pool = 'GLOBAL', weddingId } = route.params || {};

  const [candidates, setCandidates] = useState<PublicUserCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>('LOADING');
  const [isPartialError, setIsPartialError] = useState(false);
  const [weddingSnapshot, setWeddingSnapshot] = useState<UserWeddingResponse | null>(null);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [composerTargetId, setComposerTargetId] = useState<number | null>(null);

  // Staff security guard
  const isStaffUser = user?.role === 'ADMIN' || user?.role === 'EVENT_MANAGER';

  const fetchCandidates = useCallback(
    async (showRefreshIndicator = false) => {
      if (isStaffUser) {
        setScreenState('STAFF_DENIED');
        return;
      }

      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setScreenState('LOADING');
      }
      setIsPartialError(false);

      // 1. If WEDDING pool, fetch wedding metadata to inspect authoritative typed weddingStatus & participantStatus
      if (pool === 'WEDDING' && weddingId) {
        try {
          const userWeddings = await getMyWeddings();
          const found = userWeddings.find((w) => w.weddingId === weddingId);
          if (found) {
            setWeddingSnapshot(found);

            // Rule A: Authoritative selected UserWeddingResponse lifecycle status check
            if (
              found.weddingStatus === 'CLOSED' ||
              found.weddingStatus === 'CANCELLED' ||
              found.weddingStatus === 'DELETED'
            ) {
              setScreenState('STALE_WEDDING');
              setLoading(false);
              setRefreshing(false);
              return;
            }

            // Rule B: Authoritative participantStatus === 'REMOVED' check
            if (found.participantStatus === 'REMOVED') {
              setScreenState('PARTICIPANT_INACTIVE');
              setLoading(false);
              setRefreshing(false);
              return;
            }
          }
        } catch (wErr) {
          // Ignore metadata fetch error; discover API request will execute
        }
      }

      // 2. Fetch candidates from discover API
      try {
        const response = await getDiscoverCandidates({
          pool,
          weddingId: pool === 'WEDDING' ? weddingId : undefined,
          limit: 20,
        });
        const items = response.items || [];
        setCandidates(items);
        setScreenState(items.length === 0 ? 'EMPTY' : 'LOADED');
      } catch (err: any) {
        const status = err.response?.status;

        // Rule C: Generic HTTP 403 Forbidden -> ACCESS_DENIED
        if (status === 403) {
          setScreenState('ACCESS_DENIED');
        }
        // Rule D: Generic HTTP 404 Not Found -> CONTEXT_NOT_FOUND
        else if (status === 404) {
          setScreenState('CONTEXT_NOT_FOUND');
        }
        // Rule E: Network / Timeout / 5xx -> TRANSPORT_ERROR
        else if (
          status === 500 ||
          status === 502 ||
          status === 503 ||
          err.code === 'ECONNABORTED' ||
          !err.response
        ) {
          if (candidates.length > 0) {
            setIsPartialError(true);
            setScreenState('LOADED');
          } else {
            setScreenState('TRANSPORT_ERROR');
          }
        }
        // Fallback
        else {
          setScreenState('TRANSPORT_ERROR');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pool, weddingId, isStaffUser, candidates.length]
  );

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleRefresh = () => {
    fetchCandidates(true);
  };

  const handleViewProfile = (candidateUserId: number) => {
    if (pool === 'WEDDING') {
      if (!weddingId) {
        return;
      }
      navigation.navigate('CandidateProfile', {
        userId: candidateUserId,
        sourceType: 'DISCOVER',
        poolType: 'WEDDING',
        weddingId,
        contextLabel: weddingSnapshot?.weddingName || 'מאגר חתונה',
        returnIntent: {
          kind: 'DISCOVER_WEDDING',
          role: 'USER',
          sourceRoute: 'Discover',
          poolType: 'WEDDING',
          weddingId,
        },
      });
    } else {
      navigation.navigate('CandidateProfile', {
        userId: candidateUserId,
        sourceType: 'DISCOVER',
        poolType: 'GLOBAL',
        weddingId: undefined,
        contextLabel: 'מאגר גלובלי',
        returnIntent: {
          kind: 'DISCOVER_GLOBAL',
          role: 'USER',
          sourceRoute: 'Discover',
          poolType: 'GLOBAL',
        },
      });
    }
  };

  // Title Component: A-03 "גילוי" in gold with decorative flourish
  const renderScreenTitle = () => (
    <View style={styles.titleSection}>
      <Text style={styles.screenTitleText}>גילוי</Text>
      <View style={styles.titleKnotWrapper}>
        <KnotOrnament size={16} color={gold.border.strong} />
      </View>
    </View>
  );

  // Context Header Banner (Aligned with Screens 13 and 19)
  const renderContextHeader = () => {
    if (pool === 'WEDDING') {
      const wName = weddingSnapshot?.weddingName || 'מאגר חתונה';
      const details = [
        weddingSnapshot?.city,
        weddingSnapshot?.weddingDate ? formatDisplayDate(weddingSnapshot.weddingDate) : null,
      ]
        .filter(Boolean)
        .join(' — ');

      return (
        <View style={styles.contextHeaderCard}>
          <View style={styles.contextHeaderTopRow}>
            <CalendarBadge />
            <View style={styles.contextHeaderTextGroup}>
              <Text style={styles.contextHeaderTitle} numberOfLines={2}>
                {wName}
              </Text>
              {details ? (
                <BidiText
                  value={`— ${details}`}
                  kind="date"
                  style={styles.contextHeaderSubtitle}
                />
              ) : null}
            </View>
          </View>

          <View style={styles.contextHeaderBottomRow}>
            <Text style={styles.contextHeaderStatus}>
              {screenState === 'STALE_WEDDING' ? 'מאגר חתונה לא פעיל' : 'מאגר חתונה פעיל'}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('PoolSelection')}
              accessibilityRole="button"
              accessibilityLabel="חזרה לבחירת מאגר"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.contextHeaderActionText}>
                {'< חזרה לבחירת מאגר'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Global Pool Header (Owner Screen 19 alignment)
    return (
      <View style={styles.contextHeaderCard}>
        <View style={styles.contextHeaderTopRow}>
          <GlobeBadge />
          <View style={styles.contextHeaderTextGroup}>
            <Text style={styles.contextHeaderTitle}>גילוי גלובלי</Text>
            <Text style={styles.contextHeaderSubtitle}>
              {isPartialError ? 'המידע מוצג חלקית' : 'המאגר הראשי לשידוכים'}
            </Text>
          </View>
        </View>

        <View style={styles.contextHeaderBottomRow}>
          <Text style={styles.contextHeaderStatus}>עודכן לאחרונה: עכשיו</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PoolSelection')}
            accessibilityRole="button"
            accessibilityLabel="חזרה לבחירת מאגר"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.contextHeaderActionText}>
              {'< חזרה לבחירת מאגר'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Candidate Card renderer for vertical FlatList (A-03 ceremony quiet styling)
  const renderCandidateCard = ({ item }: { item: PublicUserCardResponse }) => {
    const resolvedPhotoUrl = getImageUrl(item.primaryPhotoUrl);

    return (
      <View style={styles.candidateCard}>
        {/* Dominant Hero Photo Presentation */}
        <View style={styles.photoContainer}>
          {resolvedPhotoUrl ? (
            <Image source={{ uri: resolvedPhotoUrl }} style={styles.candidatePhoto} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderPhoto}>
              <AppIcon name="camera" size={sizing.iconLg} color={text.onIvory.secondary} />
              <Text style={styles.placeholderText}>לא סופקה תמונה</Text>
            </View>
          )}
        </View>

        {/* Discrete Ivory Info Panel */}
        <View style={styles.candidateInfoPanel}>
          <Text style={styles.candidateName}>{item.fullName}</Text>
          <Text style={styles.candidateSubtitle}>
            {item.age ? `${item.age} שנים` : ''}
            {item.age && item.heightCm ? ' • ' : ''}
            {item.heightCm ? `${item.heightCm} ס״מ` : ''}
          </Text>

          <KnotDivider />

          <View style={styles.metadataGrid}>
            {item.areaOfResidence ? (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>מגורים:</Text>
                <Text style={styles.metadataValue}>{item.areaOfResidence}</Text>
              </View>
            ) : null}

            {item.religiousLevel ? (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>רמה דתית:</Text>
                <Text style={styles.metadataValue}>{getEmptyLabel(item.religiousLevel)}</Text>
              </View>
            ) : null}

            {item.education ? (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>השכלה:</Text>
                <Text style={styles.metadataValue}>{getEmptyLabel(item.education)}</Text>
              </View>
            ) : null}

            {item.occupation ? (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>עיסוק:</Text>
                <Text style={styles.metadataValue}>{getEmptyLabel(item.occupation)}</Text>
              </View>
            ) : null}
          </View>

          {item.lookingForShort ? (
            <View style={styles.lookingForBox}>
              <Text style={styles.lookingForLabel}>מחפש/ת:</Text>
              <Text style={styles.lookingForText} numberOfLines={3}>
                {item.lookingForShort}
              </Text>
            </View>
          ) : null}

          <Button
            label="צפייה בפרופיל המלא"
            onPress={() => handleViewProfile(item.userId)}
            variant="primary"
            visualAppearance="gold"
            iconEnd="chevron-left"
            fullWidth
            style={styles.viewProfileBtn}
          />

          <ActionButtons
            targetUserId={item.userId}
            poolType={pool}
            weddingId={weddingId}
            onActionCompleted={(matchCreated, matchId) => {
              if (matchCreated) {
                if (matchId) {
                  Alert.alert('נוצרה התאמה!', 'נוצרה התאמה! אפשר להמשיך לצ׳אט.', [
                    { text: 'סגור', style: 'cancel' },
                    {
                      text: 'מעבר לצ׳אט',
                      onPress: () => navigation.navigate('Chat', { matchId }),
                    },
                  ]);
                } else {
                  setMatchMessage(`יש התאמה עם ${item.fullName}!`);
                }
              }
              setCandidates((prev) => prev.filter((c) => c.userId !== item.userId));
            }}
            onOpeningMessagePress={() => setComposerTargetId(item.userId)}
            hasOpenOpeningConversation={item.hasOpenOpeningConversation}
            openingConversationDirection={item.openingConversationDirection}
          />
        </View>
      </View>
    );
  };

  // 1. Staff Guard
  if (screenState === 'STAFF_DENIED' || isStaffUser) {
    return (
      <ScreenContainer appearance="darkCanvas" safeEdges={['bottom', 'left', 'right']}>
        {renderScreenTitle()}
        <View style={styles.ivoryPanel}>
          <Text style={styles.ivoryPanelTitle}>אין הרשאת גישה למאגר</Text>
          <Text style={styles.ivoryPanelBody}>
            משתמשי ניהול ואירועים אינם מורשים להשתמש בממשק גילוי מועמדים.
          </Text>
          <Button
            label="חזרה למסך הראשי"
            onPress={() => navigation.goBack()}
            variant="primary"
            visualAppearance="gold"
            fullWidth
            style={styles.panelActionBtn}
          />
        </View>
      </ScreenContainer>
    );
  }

  // 2. Loading State
  if (loading || screenState === 'LOADING') {
    return (
      <ScreenContainer appearance="darkCanvas" safeEdges={['bottom', 'left', 'right']}>
        {renderScreenTitle()}
        {renderContextHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={gold.action.default} />
          <Text style={styles.loadingText}>מחפש התאמות תואמות במאגר...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // 3. Stale Wedding State (Owner Screen 13 Direct Alignment)
  if (screenState === 'STALE_WEDDING') {
    return (
      <ScreenContainer appearance="darkCanvas" scroll safeEdges={['bottom', 'left', 'right']}>
        {renderScreenTitle()}
        {renderContextHeader()}

        <View style={styles.ivoryPanel}>
          <PauseMedallion />

          <Text style={styles.ivoryPanelTitle}>המאגר החתונתי אינו זמין כעת</Text>

          <KnotDivider />

          <Text style={styles.ivoryPanelBody}>
            מאגר הגילוי עבור חתונה זו אינו פעיל כעת.{'\n'}
            ייתכן שהחתונה הסתיימה או נעצרה.{'\n'}
            לא ניתן להציג מועמדים בזמן זה.
          </Text>

          <Button
            label="בדיקת מוכנות"
            onPress={() => fetchCandidates(false)}
            variant="primary"
            visualAppearance="gold"
            iconStart="search"
            fullWidth
            style={styles.panelActionBtn}
          />

          <Pressable
            onPress={() => navigation.navigate('Profile', { focusSection: 'profile' })}
            style={styles.ivoryOutlinedBtn}
            accessibilityRole="button"
            accessibilityLabel="תיקון מוכנות"
          >
            <AppIcon name="edit" size={sizing.iconSm} color={gold.border.strong} style={styles.btnIconStart} />
            <Text style={styles.ivoryOutlinedBtnText}>תיקון מוכנות</Text>
          </Pressable>

          <View style={styles.ivoryPanelDivider} />

          <Pressable
            onPress={() => navigation.navigate('UserTabs', { screen: 'WeddingsRoot' })}
            style={styles.ivoryListRow}
            accessibilityRole="button"
            accessibilityLabel="החתונות שלי"
          >
            <View style={styles.ivoryListRowRight}>
              <AppIcon name="calendar" size={sizing.iconMd} color={gold.border.strong} />
              <Text style={styles.ivoryListRowText}>החתונות שלי</Text>
            </View>
            <AppIcon name="chevron-left" size={sizing.iconSm} color={text.onIvory.secondary} />
          </Pressable>

          <View style={styles.ivoryPanelDivider} />

          <Pressable
            onPress={() => navigation.navigate('PoolSelection')}
            style={styles.ivoryListRow}
            accessibilityRole="button"
            accessibilityLabel="חזרה למקור"
          >
            <View style={styles.ivoryListRowRight}>
              <AppIcon name="arrow-right" size={sizing.iconMd} color={gold.border.strong} />
              <Text style={styles.ivoryListRowText}>חזרה למקור</Text>
            </View>
            <AppIcon name="chevron-left" size={sizing.iconSm} color={text.onIvory.secondary} />
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // 4. Participant Inactive State
  if (screenState === 'PARTICIPANT_INACTIVE') {
    return (
      <ScreenContainer appearance="darkCanvas" scroll safeEdges={['bottom', 'left', 'right']}>
        {renderScreenTitle()}
        {renderContextHeader()}

        <View style={styles.ivoryPanel}>
          <PauseMedallion />
          <Text style={styles.ivoryPanelTitle}>אינך משתתף פעיל בחתונה זו</Text>
          <KnotDivider />
          <Text style={styles.ivoryPanelBody}>
            השתתפותך בחתונה זו אינה פעילה כעת. אינך מורשה לצפות במועמדים במאגר חתונה זה.
          </Text>

          <Button
            label="חזרה לבחירת מאגר"
            onPress={() => navigation.navigate('PoolSelection')}
            variant="primary"
            visualAppearance="gold"
            iconStart="arrow-right"
            fullWidth
            style={styles.panelActionBtn}
          />

          <Pressable
            onPress={() => navigation.navigate('UserTabs', { screen: 'WeddingsRoot' })}
            style={styles.ivoryOutlinedBtn}
            accessibilityRole="button"
            accessibilityLabel="החתונות שלי"
          >
            <AppIcon name="calendar" size={sizing.iconSm} color={gold.border.strong} style={styles.btnIconStart} />
            <Text style={styles.ivoryOutlinedBtnText}>החתונות שלי</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // 5. Access Denied State (HTTP 403)
  if (screenState === 'ACCESS_DENIED') {
    return (
      <ScreenContainer appearance="darkCanvas" scroll safeEdges={['bottom', 'left', 'right']}>
        {renderScreenTitle()}
        {renderContextHeader()}

        <View style={styles.ivoryPanel}>
          <Text style={styles.ivoryPanelTitle}>אין הרשאת גישה למאגר המבוקש</Text>
          <KnotDivider />
          <Text style={styles.ivoryPanelBody}>
            אינך מורשה לגשת למאגר מועמדים זה במצב הנוכחי.
          </Text>

          <Button
            label="חזרה לבחירת מאגר"
            onPress={() => navigation.navigate('PoolSelection')}
            variant="primary"
            visualAppearance="gold"
            iconStart="arrow-right"
            fullWidth
            style={styles.panelActionBtn}
          />
        </View>
      </ScreenContainer>
    );
  }

  // 6. Context Not Found State (HTTP 404)
  if (screenState === 'CONTEXT_NOT_FOUND') {
    return (
      <ScreenContainer appearance="darkCanvas" scroll safeEdges={['bottom', 'left', 'right']}>
        {renderScreenTitle()}
        {renderContextHeader()}

        <View style={styles.ivoryPanel}>
          <Text style={styles.ivoryPanelTitle}>מאגר המועמדים לא נמצא</Text>
          <KnotDivider />
          <Text style={styles.ivoryPanelBody}>
            מאגר המועמדים המבוקש לא נמצא או שאינו זמין כעת.
          </Text>

          <Button
            label="רענון"
            onPress={() => fetchCandidates(false)}
            variant="primary"
            visualAppearance="gold"
            iconStart="refresh"
            fullWidth
            style={styles.panelActionBtn}
          />

          <Pressable
            onPress={() => navigation.navigate('PoolSelection')}
            style={styles.ivoryDarkBtn}
            accessibilityRole="button"
            accessibilityLabel="חזרה לבחירת מאגר"
          >
            <Text style={styles.ivoryDarkBtnText}>חזרה לבחירת מאגר</Text>
            <AppIcon name="chevron-left" size={sizing.iconSm} color={text.onDark.primary} />
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // 7. Transport Error State (HTTP 5xx / Network)
  if (screenState === 'TRANSPORT_ERROR') {
    return (
      <ScreenContainer appearance="darkCanvas" scroll safeEdges={['bottom', 'left', 'right']}>
        {renderScreenTitle()}
        {renderContextHeader()}

        <View style={styles.ivoryPanel}>
          <Text style={styles.ivoryPanelTitle}>שגיאת תקשורת</Text>
          <KnotDivider />
          <Text style={styles.ivoryPanelBody}>
            חיבור לרשת נכשל או שהשרת אינו מגיב. אנא נסו שוב.
          </Text>

          <Button
            label="נסה שוב"
            onPress={() => fetchCandidates(false)}
            variant="primary"
            visualAppearance="gold"
            iconStart="refresh"
            fullWidth
            style={styles.panelActionBtn}
          />

          <Pressable
            onPress={() => navigation.navigate('PoolSelection')}
            style={styles.ivoryDarkBtn}
            accessibilityRole="button"
            accessibilityLabel="חזרה לבחירת מאגר"
          >
            <Text style={styles.ivoryDarkBtnText}>חזרה לבחירת מאגר</Text>
            <AppIcon name="chevron-left" size={sizing.iconSm} color={text.onDark.primary} />
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // 8. Empty Candidate Result State (Owner Screen 19 Direct Alignment)
  if (screenState === 'EMPTY' || candidates.length === 0) {
    return (
      <ScreenContainer appearance="darkCanvas" scroll safeEdges={['bottom', 'left', 'right']}>
        {renderScreenTitle()}
        {renderContextHeader()}

        <View style={styles.ivoryPanel}>
          <SearchMedallion />

          <Text style={styles.ivoryPanelTitle}>אין כרגע מועמדים זמינים</Text>

          <Text style={styles.ivoryPanelBody}>
            {pool === 'WEDDING'
              ? 'מאגר החתונה פעיל, אך כרגע לא נמצאו מועמדים זמינים עבורך.'
              : 'המאגר הגלובלי פעיל, אך כרגע לא נמצאו\nמועמדים זמינים עבורך.'}
          </Text>

          <KnotDivider />

          <Text style={styles.ivoryPanelNotice}>
            {isPartialError
              ? 'חלק מהמידע נטען חלקית.\nאפשר לרענן את התוצאות או לחזור לבחירת מאגר.'
              : 'אפשר לרענן את התוצאות או לחזור לבחירת מאגר.'}
          </Text>

          <Button
            label="רענון תוצאות"
            onPress={handleRefresh}
            variant="primary"
            visualAppearance="gold"
            iconStart="refresh"
            fullWidth
            style={styles.panelActionBtn}
          />

          <Pressable
            onPress={() => navigation.navigate('PoolSelection')}
            style={styles.ivoryDarkBtn}
            accessibilityRole="button"
            accessibilityLabel="חזרה לבחירת מאגר"
          >
            <Text style={styles.ivoryDarkBtnText}>חזרה לבחירת מאגר</Text>
            <AppIcon name="chevron-left" size={sizing.iconSm} color={text.onDark.primary} />
          </Pressable>

          <Pressable
            onPress={() => fetchCandidates(false)}
            style={styles.recheckTextBtn}
            accessibilityRole="button"
            accessibilityLabel="בדיקה מחדש"
          >
            <AppIcon name="refresh" size={sizing.iconSm} color={text.onIvory.primary} />
            <Text style={styles.recheckTextBtnLabel}>בדיקה מחדש</Text>
          </Pressable>
        </View>

        {/* Bottom Context Info Banner */}
        <View style={styles.bottomInfoBanner}>
          <AppIcon name="info" size={sizing.iconSm} color={gold.border.strong} />
          <Text style={styles.bottomInfoBannerText}>
            אם יתווספו מועמדים זמינים הם יוצגו כאן.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // 9. Loaded Candidate List State (Authoritative HTTP 200 with candidates > 0)
  return (
    <ScreenContainer appearance="darkCanvas" safeEdges={['bottom', 'left', 'right']}>
      {matchMessage && (
        <View style={styles.matchBanner}>
          <Text style={styles.matchBannerText}>{matchMessage}</Text>
          <Text style={styles.matchBannerClose} onPress={() => setMatchMessage(null)}>
            ✕
          </Text>
        </View>
      )}

      <FlatList
        data={candidates}
        keyExtractor={(item) => item.userId.toString()}
        ListHeaderComponent={
          <View style={styles.listHeaderContainer}>
            {renderScreenTitle()}
            {renderContextHeader()}
            {isPartialError && (
              <View style={styles.partialNoticeCard}>
                <AppIcon name="alert-circle" size={sizing.iconSm} color={gold.border.strong} />
                <Text style={styles.partialNoticeText}>
                  חלק מהמידע רענן בצורה חלקית. ניתן לנסות לרענן שוב.
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={renderCandidateCard}
        contentContainerStyle={styles.listContentContainer}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
      />

      <OpeningMessageComposer
        visible={composerTargetId !== null}
        onClose={() => setComposerTargetId(null)}
        onSend={async (content) => {
          if (composerTargetId !== null) {
            try {
              await sendOpeningMessage(composerTargetId, {
                content,
                poolType: pool,
                weddingId,
              });
              setMatchMessage('הודעת הפתיחה נשלחה. כעת ממתינים לתגובה מהצד השני.');
              setCandidates((prev) =>
                prev.map((c) =>
                  c.userId === composerTargetId
                    ? { ...c, hasOpenOpeningConversation: true, openingConversationDirection: 'SENT' }
                    : c
                )
              );
            } catch (err: any) {
              const isStaleMatch =
                err.response?.status === 409 &&
                (err.response?.data?.message?.toLowerCase().includes('active match') ||
                  err.response?.data?.message?.toLowerCase().includes('match already exists'));
              if (isStaleMatch) {
                try {
                  const activeMatches = await getMatches();
                  const match = activeMatches.find((m) => m.otherUserId === composerTargetId);
                  if (match && match.matchId) {
                    Alert.alert('כבר נוצרה התאמה', 'כבר נוצרה התאמה עם משתמש זה. אפשר להמשיך בצ׳אט.', [
                      { text: 'סגור', style: 'cancel' },
                      {
                        text: 'מעבר לצ׳אט',
                        onPress: () => navigation.navigate('Chat', { matchId: match.matchId }),
                      },
                    ]);
                  } else {
                    Alert.alert('כבר נוצרה התאמה', 'כבר נוצרה התאמה עם משתמש זה. אפשר להמשיך בצ׳אט.', [
                      { text: 'סגור', style: 'cancel' },
                      {
                        text: 'מעבר לרשימת ההתאמות',
                        onPress: () => navigation.navigate('Matches'),
                      },
                    ]);
                  }
                } catch (fetchErr) {
                  Alert.alert('כבר נוצרה התאמה', 'כבר נוצרה התאמה עם משתמש זה. אפשר להמשיך בצ׳אט.');
                }
              } else {
                throw err;
              }
            }
          }
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  screenTitleText: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: gold.border.strong,
    textAlign: 'center',
  },
  titleKnotWrapper: {
    marginTop: spacing.xxs,
    alignItems: 'center',
  },
  contextHeaderCard: {
    backgroundColor: visual.surface.darkRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(209, 162, 105, 0.35)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  contextHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contextBadgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(209, 162, 105, 0.12)',
    borderWidth: 1,
    borderColor: gold.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextHeaderTextGroup: {
    flex: 1,
  },
  contextHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: text.onDark.primary,
    textAlign: 'right',
  },
  contextHeaderSubtitle: {
    fontSize: 13,
    color: text.onDark.secondary,
    textAlign: 'right',
    marginTop: 2,
  },
  contextHeaderBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(209, 162, 105, 0.15)',
  },
  contextHeaderStatus: {
    fontSize: 12,
    color: text.onDark.muted,
  },
  contextHeaderActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: gold.action.default,
  },
  ivoryPanel: {
    backgroundColor: visual.surface.ivory,
    borderRadius: 24,
    padding: spacing.xl,
    marginVertical: spacing.sm,
    alignItems: 'center',
  },
  medallionWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  medallionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: visual.surface.ivoryHighlight,
    borderWidth: 1.5,
    borderColor: gold.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ivoryPanelTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: text.onIvory.primary,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  ivoryPanelBody: {
    fontSize: 14,
    lineHeight: 22,
    color: text.onIvory.secondary,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  ivoryPanelNotice: {
    fontSize: 13,
    lineHeight: 20,
    color: text.onIvory.secondary,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  panelActionBtn: {
    marginTop: spacing.md,
    width: '100%',
  },
  ivoryOutlinedBtn: {
    minHeight: sizing.minTouchTarget,
    width: '100%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: gold.border.strong,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btnIconStart: {
    marginEnd: spacing.xs,
  },
  ivoryOutlinedBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: text.onIvory.primary,
  },
  ivoryDarkBtn: {
    minHeight: sizing.minTouchTarget,
    width: '100%',
    borderRadius: radii.md,
    backgroundColor: visual.surface.darkRaised,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ivoryDarkBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: text.onDark.primary,
  },
  recheckTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  recheckTextBtnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: text.onIvory.primary,
  },
  ivoryPanelDivider: {
    width: '100%',
    height: 1,
    backgroundColor: gold.border.strong,
    opacity: 0.25,
    marginVertical: spacing.md,
  },
  ivoryListRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    minHeight: sizing.minTouchTarget,
  },
  ivoryListRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ivoryListRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: text.onIvory.primary,
  },
  bottomInfoBanner: {
    backgroundColor: visual.surface.darkRaised,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(209, 162, 105, 0.25)',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  bottomInfoBannerText: {
    fontSize: 13,
    color: text.onDark.secondary,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 240,
  },
  loadingText: {
    marginTop: spacing.md,
    color: text.onDark.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  listHeaderContainer: {
    marginBottom: spacing.xs,
  },
  partialNoticeCard: {
    backgroundColor: visual.surface.darkRaised,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: gold.border.strong,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  partialNoticeText: {
    flex: 1,
    fontSize: 13,
    color: text.onDark.primary,
    textAlign: 'right',
  },
  listContentContainer: {
    paddingBottom: spacing.xxxl,
  },
  candidateCard: {
    backgroundColor: visual.surface.darkRaised,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(209, 162, 105, 0.35)',
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  photoContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#1E1E22',
  },
  candidatePhoto: {
    width: '100%',
    height: '100%',
  },
  placeholderPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E1E22',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  placeholderText: {
    color: text.onDark.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  candidateInfoPanel: {
    backgroundColor: visual.surface.ivory,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: gold.border.strong,
  },
  candidateName: {
    fontSize: 22,
    fontWeight: '700',
    color: text.onIvory.primary,
    textAlign: 'right',
  },
  candidateSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: gold.action.default,
    textAlign: 'right',
    marginTop: 2,
  },
  knotDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: gold.border.strong,
    opacity: 0.35,
  },
  metadataGrid: {
    marginVertical: spacing.xs,
    gap: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: text.onIvory.secondary,
    textAlign: 'right',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: text.onIvory.primary,
    textAlign: 'left',
    flex: 1,
    marginEnd: spacing.sm,
  },
  lookingForBox: {
    backgroundColor: visual.surface.ivoryHighlight,
    borderWidth: 1,
    borderColor: 'rgba(209, 162, 105, 0.3)',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  lookingForLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: gold.border.strong,
    textAlign: 'right',
    marginBottom: 2,
  },
  lookingForText: {
    fontSize: 13,
    lineHeight: 18,
    color: text.onIvory.primary,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  viewProfileBtn: {
    marginTop: spacing.md,
  },
  matchBanner: {
    backgroundColor: colors.statusSuccessBg,
    borderColor: colors.statusSuccessBorder,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchBannerText: {
    color: colors.statusSuccess,
    flex: 1,
    textAlign: 'right',
    fontWeight: '700',
  },
  matchBannerClose: {
    color: colors.statusSuccess,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
});
