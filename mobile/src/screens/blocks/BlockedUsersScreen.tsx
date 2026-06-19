import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getBlockedUsers, unblockUser } from '../../api/blocksApi';
import { BlockedUserResponse } from '../../types/api';
import { getImageUrl } from '../../utils/imageUrl';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const BlockedUsersScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<BlockedUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBlockedUsers();
      setUsers(data);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'טעינת משתמשים חסומים נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUnblock = async (targetUserId: number, fullName: string) => {
    try {
      await unblockUser(targetUserId);
      Alert.alert('הסרת חסימה', `החסימה על ${fullName} הוסרה בהצלחה.`);
      fetchUsers();
    } catch (err: any) {
      Alert.alert('שגיאה', getFriendlyErrorMessage(err, 'הסרת החסימה נכשלה. אנא נסה שוב.'));
    }
  };

  if (loading) {
    return (
      <Screen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.stateText}>טוען משתמשים חסומים...</Text>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <AppButton title="נסה שוב" onPress={fetchUsers} style={styles.retryButton} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>אין משתמשים חסומים כרגע.</Text>
          </View>
        ) : (
          users.map((user) => (
            <View key={user.userId} style={styles.card}>
              <View style={styles.userInfo}>
                {user.primaryPhotoUrl ? (
                  <Image source={{ uri: getImageUrl(user.primaryPhotoUrl) }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{user.fullName.charAt(0)}</Text>
                  </View>
                )}
                <Text style={styles.name}>{user.fullName}</Text>
              </View>
              <AppButton
                title="הסר חסימה"
                onPress={() => handleUnblock(user.userId, user.fullName)}
                style={styles.unblockButton}
              />
            </View>
          ))
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.m,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: theme.spacing.m,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.m,
  },
  avatarInitial: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  unblockButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    backgroundColor: theme.colors.primary,
  },
});
