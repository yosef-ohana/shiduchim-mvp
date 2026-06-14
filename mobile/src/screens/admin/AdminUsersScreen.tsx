import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { adminApi } from '../../api/adminApi';
import { AdminUserResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getUserRoleLabel } from '../../utils/displayLabels';

const getProfileStatusLabel = (status: string) => {
  switch (status) {
    case 'NONE': return 'לא הוגדר';
    case 'BASIC': return 'פרופיל בסיסי';
    case 'FULL': return 'פרופיל מלא';
    case 'FULL_INCOMPLETE_BLOCKED': return 'פרופיל מלא חסר (חסום)';
    default: return status;
  }
};

export const AdminUsersScreen = () => {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'טעינת המשתמשים נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user: AdminUserResponse) => {
    setActionLoading(user.id);
    try {
      if (user.adminBlocked) {
        await adminApi.unblockUser(user.id);
      } else {
        await adminApi.blockUser(user.id);
      }
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to update user block status', error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'עדכון סטטוס המשתמש נכשל.'));
    } finally {
      setActionLoading(null);
    }
  };

  const renderItem = ({ item }: { item: AdminUserResponse }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.fullName || 'לא צוין'} (מזהה: {item.id})</Text>
      <Text style={styles.info}>אימייל: {item.email || 'לא צוין'}</Text>
      <Text style={styles.info}>תפקיד: {getUserRoleLabel(item.role)}</Text>
      <Text style={styles.info}>סטטוס פרופיל: {getProfileStatusLabel(item.profileStatus)}</Text>
      <Text style={styles.info}>סטטוס: {item.adminBlocked ? 'חסום' : 'פעיל'}</Text>

      <AppButton
        title={item.adminBlocked ? 'שחרור חסימה' : 'חסימה'}
        onPress={() => handleToggleBlock(item)}
        loading={actionLoading === item.id}
        style={[styles.button, item.adminBlocked ? styles.unblockButton : styles.blockButton]}
      />
    </View>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>לא נמצאו משתמשים.</Text>}
            refreshing={loading}
            onRefresh={fetchUsers}
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
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  info: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    textAlign: 'right',
  },
  button: {
    marginTop: theme.spacing.m,
  },
  blockButton: {
    backgroundColor: theme.colors.error,
  },
  unblockButton: {
    backgroundColor: '#4CAF50',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    color: theme.colors.textSecondary,
  },
});
