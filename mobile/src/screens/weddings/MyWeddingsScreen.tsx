import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { getMyWeddings } from '../../api/weddingsApi';
import { UserWeddingResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getWeddingStatusLabel, getParticipantStatusLabel, formatDisplayDate } from '../../utils/displayLabels';

export const MyWeddingsScreen = () => {
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

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.weddingName}</Text>
        
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
          {item.isWeddingPoolEligible ? (
            <Text style={styles.eligibleText}>זמין למאגר החתונה</Text>
          ) : (
            <Text style={styles.ineligibleText}>לא זמין כרגע למאגר החתונה</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>החתונות שלי</Text>
        
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : errorMsg ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
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
  eligibleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  ineligibleText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
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
});
