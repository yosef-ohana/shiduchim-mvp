import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
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
      setErrorText("אנא העלה/י תמונה ראשית לפני השימוש בחיפוש מועמדים.");
      setCtaAction({
        label: "להעלאת תמונה ראשית",
        onPress: () => navigation.navigate('Profile', { focusSection: 'photos' }),
      });
      return;
    }

    if (selectedPool === 'GLOBAL') {
      // 2. Global Pool eligibility checks
      if (!user?.profileStatus || user.profileStatus === 'NONE') {
        setErrorText("אנא השלם/י את הפרופיל הבסיסי לפני השימוש במאגר החיפוש.");
        setCtaAction({
          label: "למילוי פרופיל מלא",
          onPress: () => navigation.navigate('Profile', { intent: 'onboarding_full' }),
        });
        return;
      }
      if (user.profileStatus === 'FULL_INCOMPLETE_BLOCKED') {
        setErrorText("אנא השלם/י את הפרופיל הבסיסי לפני השימוש במאגר החיפוש.");
        setCtaAction({
          label: "לתיקון והשלמת הפרופיל",
          onPress: () => navigation.navigate('Profile', { intent: 'repair_full' }),
        });
        return;
      }
      if (user.profileStatus === 'BASIC') {
        setErrorText("המאגר הכללי זמין רק לאחר השלמת הפרופיל המלא שלך.");
        setCtaAction({
          label: "להשלמת פרופיל מלא",
          onPress: () => navigation.navigate('Profile', { intent: 'complete_full' }),
        });
        return;
      }
      navigation.navigate('Discover', { pool: 'GLOBAL' });
    } else {
      // 3. Wedding Pool eligibility checks
      if (!user?.profileStatus || user.profileStatus === 'NONE' || user.profileStatus === 'FULL_INCOMPLETE_BLOCKED') {
        setErrorText("אנא השלם/י את הפרופיל הבסיסי לפני השימוש במאגר החתונה.");
        return;
      }
      
      if (!selectedWeddingId) {
        setErrorText('אנא בחר/י חתונה מהרשימה.');
        return;
      }
      navigation.navigate('Discover', { pool: 'WEDDING', weddingId: selectedWeddingId });
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>בחירת מאגר</Text>
        <Text style={styles.subtitle}>אנא בחר/י את מאגר המועמדים שברצונך לחפש.</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedPool === 'GLOBAL' && styles.selectedOptionCard,
            ]}
            onPress={() => {
              setSelectedPool('GLOBAL');
              setErrorText(null);
              setCtaAction(null);
            }}
          >
            <Text
              style={[
                styles.optionTitle,
                selectedPool === 'GLOBAL' && styles.selectedOptionTitle,
              ]}
            >
              מאגר כללי
            </Text>
            <Text style={styles.optionDescription}>
              חיפוש מועמדים מתאימים מתוך הרשת הכללית של המשתמשים.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedPool === 'WEDDING' && styles.selectedOptionCard,
            ]}
            onPress={() => {
              setSelectedPool('WEDDING');
              setErrorText(null);
              setCtaAction(null);
            }}
          >
            <Text
              style={[
                styles.optionTitle,
                selectedPool === 'WEDDING' && styles.selectedOptionTitle,
              ]}
            >
              מאגר חתונה
            </Text>
            <Text style={styles.optionDescription}>
              חיפוש מועמדים מתאימים במיוחד מתוך אירוע חתונה ספציפי.
            </Text>
          </TouchableOpacity>
        </View>

        {selectedPool === 'WEDDING' && (
          <View style={styles.weddingInputContainer}>
            {loadingWeddings ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
            ) : eligibleWeddings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>לא הצטרפת לאף חתונה פעילה זמינה כרגע.</Text>
                <Text style={styles.emptySubText}>אנא הצטרף/י לחתונה באמצעות קוד גישה תחילה.</Text>
              </View>
            ) : (
              <View style={styles.weddingsListContainer}>
                <Text style={styles.sectionTitle}>בחירת חתונה:</Text>
                {eligibleWeddings.map((w) => {
                  const isSelected = selectedWeddingId === w.weddingId;
                  return (
                    <TouchableOpacity
                      key={w.weddingId}
                      style={[
                        styles.weddingCard,
                        isSelected && styles.selectedWeddingCard,
                      ]}
                      onPress={() => {
                        setSelectedWeddingId(w.weddingId);
                        setErrorText(null);
                        setCtaAction(null);
                      }}
                    >
                      <Text style={[styles.weddingNameText, isSelected && styles.selectedWeddingNameText]}>
                        {w.weddingName}
                      </Text>
                      {w.city || w.weddingDate ? (
                        <Text style={styles.weddingDetailsText}>
                          {[w.city, w.weddingDate ? formatDisplayDate(w.weddingDate) : null]
                            .filter(Boolean)
                            .join(' - ')}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {errorText ? (
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.m }}>
            <Text style={styles.errorText}>{errorText}</Text>
            {ctaAction && (
              <AppButton
                title={ctaAction.label}
                onPress={ctaAction.onPress}
                style={{ marginTop: theme.spacing.s, width: '80%' }}
              />
            )}
          </View>
        ) : null}
        <AppButton
          title="חיפוש מועמדים"
          onPress={handleDiscover}
          style={styles.actionButton}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
  },
  optionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  selectedOptionCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FAF7F0',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  selectedOptionTitle: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'right',
  },
  weddingInputContainer: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  loader: {
    marginVertical: theme.spacing.m,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  weddingsListContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'right',
  },
  weddingCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  selectedWeddingCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FAF7F0',
  },
  weddingNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'right',
  },
  selectedWeddingNameText: {
    color: theme.colors.primary,
  },
  weddingDetailsText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  actionButton: {
    marginTop: 'auto',
    marginBottom: theme.spacing.l,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
  },
});
