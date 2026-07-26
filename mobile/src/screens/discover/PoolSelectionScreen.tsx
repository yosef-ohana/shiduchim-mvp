import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { AppHeader } from '../../components/foundation/AppHeader';
import { Card } from '../../components/foundation/Card';
import { Button } from '../../components/foundation/Button';
import { AppIcon } from '../../components/foundation/AppIcon';
import { BidiText } from '../../components/foundation/BidiText';
import { StateSurface } from '../../components/foundation/StateSurface';
import { colors, spacing, radii, sizing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { DiscoverPool, UserWeddingResponse } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { getMyWeddings } from '../../api/weddingsApi';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { formatDisplayDate } from '../../utils/displayLabels';

export const PoolSelectionScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [selectedPool, setSelectedPool] = useState<DiscoverPool>('GLOBAL');
  const [weddings, setWeddings] = useState<UserWeddingResponse[]>([]);
  const [loadingWeddings, setLoadingWeddings] = useState(false);
  const [selectedWeddingId, setSelectedWeddingId] = useState<number | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [ctaAction, setCtaAction] = useState<{ label: string; onPress: () => void } | null>(null);

  // Staff security guard
  const isStaffUser = user?.role === 'ADMIN' || user?.role === 'EVENT_MANAGER';

  const fetchWeddings = async () => {
    setLoadingWeddings(true);
    setErrorText(null);
    try {
      const list = await getMyWeddings();
      setWeddings(list);

      const eligible = list.filter(
        (w) => w.isWeddingPoolEligible && w.weddingStatus === 'ACTIVE' && w.participantStatus === 'ACTIVE'
      );
      if (eligible.length > 0 && !selectedWeddingId) {
        setSelectedWeddingId(eligible[0].weddingId);
      }
    } catch (err: any) {
      setErrorText(getFriendlyErrorMessage(err, 'טעינת החתונות שנרשמת אליהן נכשלה.'));
    } finally {
      setLoadingWeddings(false);
    }
  };

  useEffect(() => {
    if (selectedPool === 'WEDDING') {
      fetchWeddings();
    }
  }, [selectedPool]);

  const eligibleWeddings = weddings.filter(
    (w) => w.isWeddingPoolEligible && w.weddingStatus === 'ACTIVE' && w.participantStatus === 'ACTIVE'
  );

  const handleDiscover = () => {
    setErrorText(null);
    setCtaAction(null);

    // 1. Primary photo check
    if (!user?.hasPrimaryPhoto) {
      setErrorText('אנא העלה/י תמונה ראשית לפני השימוש בחיפוש מועמדים.');
      setCtaAction({
        label: 'להעלאת תמונה ראשית',
        onPress: () => navigation.navigate('Profile', { focusSection: 'photos' }),
      });
      return;
    }

    if (selectedPool === 'GLOBAL') {
      // 2. Global Pool eligibility checks
      if (!user?.profileStatus || user.profileStatus === 'NONE') {
        setErrorText('אנא השלם/י את הפרופיל הבסיסי לפני השימוש במאגר החיפוש.');
        setCtaAction({
          label: 'למילוי פרופיל מלא',
          onPress: () => navigation.navigate('Profile', { intent: 'onboarding_full' }),
        });
        return;
      }
      if (user.profileStatus === 'FULL_INCOMPLETE_BLOCKED') {
        setErrorText('אנא השלם/י את הפרופיל הבסיסי לפני השימוש במאגר החיפוש.');
        setCtaAction({
          label: 'לתיקון והשלמת הפרופיל',
          onPress: () => navigation.navigate('Profile', { intent: 'repair_full' }),
        });
        return;
      }
      if (user.profileStatus === 'BASIC') {
        setErrorText('המאגר הכללי זמין רק לאחר השלמת הפרופיל המלא שלך.');
        setCtaAction({
          label: 'להשלמת פרופיל מלא',
          onPress: () => navigation.navigate('Profile', { intent: 'complete_full' }),
        });
        return;
      }
      navigation.navigate('Discover', { pool: 'GLOBAL' });
    } else {
      // 3. Wedding Pool eligibility checks
      if (!user?.profileStatus || user.profileStatus === 'NONE' || user.profileStatus === 'FULL_INCOMPLETE_BLOCKED') {
        setErrorText('אנא השלם/י את הפרופיל הבסיסי לפני השימוש במאגר החתונה.');
        return;
      }

      if (!selectedWeddingId) {
        setErrorText('אנא בחר/י חתונה מהרשימה.');
        return;
      }
      navigation.navigate('Discover', { pool: 'WEDDING', weddingId: selectedWeddingId });
    }
  };

  if (isStaffUser) {
    return (
      <ScreenContainer header={<AppHeader title="בחירת מאגר" />}>
        <StateSurface
          kind="denied"
          title="אין הרשאת גישה"
          message="משתמשי ניהול ואירועים אינם מורשים להשתמש במאגר המועמדים."
          primaryAction={{
            label: 'חזרה',
            onPress: () => navigation.goBack(),
          }}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll header={<AppHeader title="בחירת מאגר" />}>
      <View style={styles.container}>
        <Text style={[typography.titleLarge, styles.title]}>
          בחירת מאגר
        </Text>
        <Text style={[typography.bodyMedium, styles.subtitle]}>
          אנא בחר/י את מאגר המועמדים שברצונך לחפש.
        </Text>

        <View style={styles.optionsContainer}>
          {/* Global Option Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setSelectedPool('GLOBAL');
              setErrorText(null);
              setCtaAction(null);
            }}
          >
            <Card
              variant={selectedPool === 'GLOBAL' ? 'selectable' : 'outlined'}
              selected={selectedPool === 'GLOBAL'}
              style={styles.optionCard}
            >
              <View style={styles.cardHeaderRow}>
                <AppIcon
                  name="navDiscover"
                  size={sizing.iconMd}
                  color={selectedPool === 'GLOBAL' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    typography.titleMedium,
                    styles.optionTitle,
                    selectedPool === 'GLOBAL' && styles.selectedOptionTitle,
                  ]}
                >
                  מאגר כללי
                </Text>
              </View>
              <Text style={[typography.bodyMedium, styles.optionDescription]}>
                חיפוש מועמדים מתאימים מתוך הרשת הכללית של המשתמשים במערכת.
              </Text>
            </Card>
          </TouchableOpacity>

          {/* Wedding Option Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setSelectedPool('WEDDING');
              setErrorText(null);
              setCtaAction(null);
            }}
          >
            <Card
              variant={selectedPool === 'WEDDING' ? 'selectable' : 'outlined'}
              selected={selectedPool === 'WEDDING'}
              style={styles.optionCard}
            >
              <View style={styles.cardHeaderRow}>
                <AppIcon
                  name="calendar"
                  size={sizing.iconMd}
                  color={selectedPool === 'WEDDING' ? colors.accent : colors.textSecondary}
                />
                <Text
                  style={[
                    typography.titleMedium,
                    styles.optionTitle,
                    selectedPool === 'WEDDING' && styles.selectedOptionTitle,
                  ]}
                >
                  מאגר חתונה
                </Text>
              </View>
              <Text style={[typography.bodyMedium, styles.optionDescription]}>
                חיפוש מועמדים מתאימים מתוך אירוע חתונה ספציפי שהצטרפת אליו.
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {selectedPool === 'WEDDING' && (
          <Card variant="surface" style={styles.weddingInputContainer}>
            {loadingWeddings ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            ) : eligibleWeddings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[typography.bodyMediumBold, styles.emptyText]}>
                  לא הצטרפת לאף חתונה פעילה זמינה כרגע.
                </Text>
                <Text style={[typography.caption, styles.emptySubText]}>
                  אנא הצטרף/י לחתונה באמצעות קוד גישה תחילה באזור החתונות שלי.
                </Text>
              </View>
            ) : (
              <View style={styles.weddingsListContainer}>
                <Text style={[typography.heading, styles.sectionTitle]}>
                  בחירת חתונה:
                </Text>
                {eligibleWeddings.map((w) => {
                  const isSelected = selectedWeddingId === w.weddingId;
                  return (
                    <TouchableOpacity
                      key={w.weddingId}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedWeddingId(w.weddingId);
                        setErrorText(null);
                        setCtaAction(null);
                      }}
                    >
                      <Card
                        variant={isSelected ? 'selectable' : 'outlined'}
                        selected={isSelected}
                        style={styles.weddingCard}
                      >
                        <Text style={[typography.bodyLargeBold, isSelected && styles.selectedWeddingNameText]}>
                          {w.weddingName}
                        </Text>
                        {w.city || w.weddingDate ? (
                          <BidiText
                            value={[w.city, w.weddingDate ? formatDisplayDate(w.weddingDate) : null]
                              .filter(Boolean)
                              .join(' — ')}
                            kind="date"
                            style={[typography.caption, styles.weddingDetailsText]}
                          />
                        ) : null}
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Card>
        )}

        {errorText ? (
          <StateSurface
            kind="error"
            title="נדרש טיפול בזכאות"
            message={errorText}
            primaryAction={
              ctaAction
                ? {
                    label: ctaAction.label,
                    onPress: ctaAction.onPress,
                    icon: 'edit',
                  }
                : undefined
            }
            style={styles.errorSurface}
          />
        ) : null}

        <Button
          label="חיפוש מועמדים"
          onPress={handleDiscover}
          variant="primary"
          iconEnd="search"
          style={styles.actionButton}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    flex: 1,
  },
  title: {
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  optionCard: {
    padding: spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  optionTitle: {
    color: colors.textPrimary,
  },
  selectedOptionTitle: {
    color: colors.primary,
  },
  optionDescription: {
    color: colors.textSecondary,
    textAlign: 'right',
  },
  weddingInputContainer: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  loader: {
    marginVertical: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptySubText: {
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  weddingsListContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  weddingCard: {
    padding: spacing.md,
  },
  selectedWeddingNameText: {
    color: colors.accent,
  },
  weddingDetailsText: {
    color: colors.textSecondary,
    marginTop: spacing.xxs,
    textAlign: 'right',
  },
  errorSurface: {
    marginBottom: spacing.lg,
  },
  actionButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
