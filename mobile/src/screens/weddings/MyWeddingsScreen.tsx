import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { getMyWeddings } from '../../api/weddingsApi';
import { UserWeddingResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getWeddingStatusLabel, getParticipantStatusLabel, formatDisplayDate } from '../../utils/displayLabels';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { getWeddingReadiness } from '../../utils/weddingReadiness';
import { AppButton } from '../../components/AppButton';


export const MyWeddingsScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [weddings, setWeddings] = useState<UserWeddingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchWeddings();
  }, []);

  const fetchWeddings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getMyWeddings();
      setWeddings(data);
    } catch (error: any) {
      console.error(error);
      const friendlyError = getFriendlyErrorMessage(error, 'טעינת החתונות נכשלה.');
      setErrorMsg(friendlyError);
      Alert.alert('שגיאה', friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: UserWeddingResponse }) => {
    const formattedDate = formatDisplayDate(item.weddingDate);
    const formattedJoinedDate = formatDisplayDate(item.joinedAt);
    const isActive = item.weddingStatus === 'ACTIVE' && item.participantStatus === 'ACTIVE';

    const readiness = getWeddingReadiness({
      user,
      weddingStatus: item.weddingStatus,
      participantStatus: item.participantStatus,
      isJoined: true,
    });

    const getReadinessText = (state: string) => {
      switch (state) {
        case 'READY':
          return 'זמין למאגר החתונה';
        case 'JOINED_MISSING_BASIC_PROFILE':
          return 'חסר פרופיל בסיסי';
        case 'JOINED_MISSING_PRIMARY_PHOTO':
          return 'חסרה תמונה ראשית';
        case 'JOINED_MISSING_BOTH':
          return 'חסרים פרופיל ותמונה';
        case 'INACTIVE_WEDDING':
          return 'החתונה אינה פעילה';
        case 'INACTIVE_PARTICIPANT':
          return 'המשתתף אינו פעיל';
        case 'BLOCKED_USER':
          return 'המשתמש חסום';
        default:
          return 'סטטוס לא ידוע';
      }
    };

    const getReadinessColor = (state: string) => {
      switch (state) {
        case 'READY':
          return theme.colors.primary;
        case 'JOINED_MISSING_BASIC_PROFILE':
        case 'JOINED_MISSING_PRIMARY_PHOTO':
        case 'JOINED_MISSING_BOTH':
          return '#E65100'; // Amber/Orange
        case 'INACTIVE_WEDDING':
        case 'INACTIVE_PARTICIPANT':
          return '#757575'; // Gray
        case 'BLOCKED_USER':
          return theme.colors.error;
        default:
          return theme.colors.textSecondary;
      }
    };

    const readinessLabel = getReadinessText(readiness.state);
    const readinessColor = getReadinessColor(readiness.state);

    const handlePress = () => {
      navigation.navigate('JoinWedding', {
        weddingId: item.weddingId,
        weddingSnapshot: item,
        source: 'myWeddings',
      });
    };

    return (
      <TouchableOpacity
        style={[styles.card, !isActive && styles.disabledCard]}
        onPress={handlePress}
        disabled={!isActive}
        activeOpacity={0.7}
      >
        <Text style={[styles.name, !isActive && styles.disabledName]}>{item.weddingName}</Text>
        
        {item.city ? (
          <View style={styles.row}>
            <Text style={styles.label}>עיר:</Text>
            <Text style={styles.value}>{item.city}</Text>
          </View>
        ) : null}

        {item.weddingDate ? (
          <View style={styles.row}>
            <Text style={styles.label}>תאריך החתונה:</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.label}>סטטוס חתונה:</Text>
          <Text style={styles.value}>{getWeddingStatusLabel(item.weddingStatus)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>סטטוס משתתף:</Text>
          <Text style={styles.value}>{getParticipantStatusLabel(item.participantStatus)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>תאריך הצטרפות:</Text>
          <Text style={styles.value}>{formattedJoinedDate}</Text>
        </View>

        <View style={styles.eligibilityContainer}>
          <Text style={[styles.readinessText, { color: readinessColor }]}>
            {readinessLabel}
          </Text>
          {isActive && (
            <Text style={styles.clickHint}>
              לחץ למעבר לאזור החתונה
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const hasAnyWeddings = weddings.length > 0;
  const hasActiveWeddings = weddings.some(w => w.weddingStatus === 'ACTIVE' && w.participantStatus === 'ACTIVE');
  const showInactiveExplanation = hasAnyWeddings && !hasActiveWeddings;

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>החתונות שלי</Text>
        
        {showInactiveExplanation && (
          <View style={styles.inactiveBanner}>
            <Text style={styles.inactiveBannerText}>
              שים לב: אין לך חתונות פעילות כרגע. חתונות סגורות, מבוטלות או חתונות שהוסרת מהן אינן מהוות מאגר שידוכים פעיל.
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : errorMsg ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={weddings}
              keyExtractor={(item) => item.weddingId.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              refreshing={loading}
              onRefresh={fetchWeddings}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>עדיין לא הצטרפת לאף חתונה.</Text>
                </View>
              }
            />
            <AppButton
              title="הצטרפות לחתונה"
              onPress={() => navigation.navigate('JoinWedding')}
              style={styles.joinButton}
            />
          </>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabledCard: {
    opacity: 0.65,
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 4,
    textAlign: 'right',
  },
  disabledName: {
    color: '#888888',
    borderBottomColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  eligibilityContainer: {
    marginTop: theme.spacing.s,
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  readinessText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  clickHint: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  inactiveBanner: {
    backgroundColor: '#F9F6F0',
    borderColor: '#E0D0B0',
    borderWidth: 1,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  inactiveBannerText: {
    color: '#7C6E52',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  joinButton: {
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
});
