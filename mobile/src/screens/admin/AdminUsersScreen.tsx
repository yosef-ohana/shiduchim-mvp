import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { adminApi } from '../../api/adminApi';
import { AdminUserResponse } from '../../types/api';
import { theme } from '../../theme/theme';

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
      Alert.alert('Error', 'Failed to fetch users');
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
      Alert.alert('Error', 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const renderItem = ({ item }: { item: AdminUserResponse }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.fullName || 'No Name'} (ID: {item.id})</Text>
      <Text style={styles.info}>Email: {item.email || 'N/A'}</Text>
      <Text style={styles.info}>Role: {item.role}</Text>
      <Text style={styles.info}>Profile Status: {item.profileStatus}</Text>
      <Text style={styles.info}>Status: {item.adminBlocked ? 'Blocked' : 'Active'}</Text>

      <AppButton
        title={item.adminBlocked ? 'Unblock User' : 'Block User'}
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
            ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
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
  },
  info: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
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
