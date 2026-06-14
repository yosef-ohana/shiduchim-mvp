import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getMatchDetails } from '../../api/matchesApi';
import { dislikeUser } from '../../api/actionsApi';
import { MatchDetailsResponse } from '../../types/api';
import { getImageUrl } from '../../utils/imageUrl';
import { getYesNoLabel, getEmptyLabel } from '../../utils/displayLabels';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const MatchDetailsScreen = ({ route, navigation }: any) => {
  const { matchId } = route.params || {};
  const [details, setDetails] = useState<MatchDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dislikeLoading, setDislikeLoading] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMatchDetails(matchId);
      setDetails(data);
    } catch (err: any) {
      setError(
        getFriendlyErrorMessage(err, 'טעינת פרטי ההתאמה נכשלה. אנא נסה שוב.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [matchId]);

  const handleCancelMatch = async () => {
    if (!details || !details.otherUserProfile?.userId) return;

    setDislikeLoading(true);
    try {
      await dislikeUser(details.otherUserProfile.userId, {
        poolType: details.poolType,
        weddingId: details.weddingId ?? undefined,
      });

      Alert.alert(
        'ההתאמה בוטלה',
        'ההתאמה בוטלה בהצלחה.',
        [
          {
            text: 'אישור',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'שגיאה',
        getFriendlyErrorMessage(err, 'ביטול ההתאמה נכשל. אנא נסה שוב.')
      );
    } finally {
      setDislikeLoading(false);
    }
  };

  const handleCancelMatchPress = () => {
    Alert.alert(
      'ביטול התאמה',
      'התאמה זו והצ׳אט יבוטלו, והמשתמש יועבר לרשימת הלא מתאימים.',
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'כן, ביטול התאמה', style: 'destructive', onPress: handleCancelMatch },
      ]
    );
  };

  if (loading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.stateText}>טוען פרטי התאמה...</Text>
      </Screen>
    );
  }

  if (error || !details) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'לא ניתן לטעון את פרטי ההתאמה'}</Text>
        <AppButton title="נסה שוב" onPress={fetchDetails} style={styles.retryButton} />
      </Screen>
    );
  }

  const profile = details.otherUserProfile;

  const renderRow = (label: string, value: any, isLongText = false) => {
    const displayValue =
      value === null || value === undefined || value === '' ? 'לא צוין' : String(value);

    if (isLongText) {
      return (
        <View style={styles.longTextContainer} key={label}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.longTextValue}>{displayValue}</Text>
        </View>
      );
    }

    return (
      <View style={styles.row} key={label}>
        <Text style={styles.rowLabel}>{label}:</Text>
        <Text style={styles.rowValue}>{displayValue}</Text>
      </View>
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {getImageUrl(profile.primaryPhotoUrl) ? (
              <Image source={{ uri: getImageUrl(profile.primaryPhotoUrl) }} style={styles.mainImage} />
            ) : (
              <View style={[styles.mainImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>אין תמונה</Text>
              </View>
            )}
          </View>
        </View>

        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.subtitle}>
            {profile.age} שנים • {profile.heightCm} ס״מ
          </Text>
        </View>

        {/* Button Actions Section */}
        <View style={styles.actionsSection}>
          <AppButton
            title="💬 פתיחת צ׳אט"
            onPress={() => navigation.navigate('Chat', { matchId: details.matchId })}
            style={styles.chatButton}
          />
          {profile.userId ? (
            <AppButton
              title="👤 צפייה בפרופיל מועמד מלא"
              onPress={() => navigation.navigate('CandidateProfile', { userId: profile.userId })}
              style={styles.profileButton}
            />
          ) : null}
          <AppButton
            title="💔 ביטול התאמה"
            onPress={handleCancelMatchPress}
            style={styles.dislikeButton}
            loading={dislikeLoading}
            disabled={dislikeLoading}
          />
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטי הפרופיל</Text>
          <View style={styles.card}>
            {renderRow('מגורים', getEmptyLabel(profile.areaOfResidence))}
            {renderRow('רמה דתית', getEmptyLabel(profile.religiousLevel))}
            {renderRow('כיסוי ראש', getEmptyLabel(profile.headCovering))}
            {renderRow('רישיון נהיגה', getYesNoLabel(profile.hasDrivingLicense))}
          </View>
        </View>

        {/* Education & Occupation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>השכלה וקריירה</Text>
          <View style={styles.card}>
            {renderRow('השכלה', getEmptyLabel(profile.education))}
            {renderRow('עיסוק', getEmptyLabel(profile.occupation))}
          </View>
        </View>

        {/* Written Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>קצת עליי</Text>
          <View style={styles.card}>
            {renderRow('תיאור עצמי', getEmptyLabel(profile.selfDescription), true)}
            {renderRow('תחביבים ותחומי עניין', getEmptyLabel(profile.hobbies), true)}
            {renderRow('רקע משפחתי', getEmptyLabel(profile.familyDescription), true)}
            {renderRow('מה שאני מחפש/ת', getEmptyLabel(profile.lookingFor), true)}
          </View>
        </View>

        <View style={styles.spacing} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  stateText: {
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  retryButton: {
    width: '60%',
  },
  photoSection: {
    marginBottom: theme.spacing.m,
  },
  photoContainer: {
    flexDirection: 'row',
    height: 280,
  },
  mainImage: {
    flex: 1,
    height: '100%',
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.border,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAEAEA',
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  actionsSection: {
    marginBottom: theme.spacing.l,
  },
  chatButton: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  profileButton: {
    backgroundColor: '#4A4A4A',
  },
  dislikeButton: {
    backgroundColor: theme.colors.error,
    marginTop: theme.spacing.s,
  },
  section: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    paddingRight: theme.spacing.s,
    textAlign: 'right',
  },
  card: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  rowValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'left',
    flex: 1,
    marginRight: theme.spacing.m,
  },
  longTextContainer: {
    paddingVertical: theme.spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  longTextValue: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: theme.spacing.s,
    lineHeight: 20,
    textAlign: 'right',
  },
  spacing: {
    height: theme.spacing.xl,
  },
});
