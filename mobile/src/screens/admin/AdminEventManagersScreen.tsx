import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { adminApi } from '../../api/adminApi';
import { AdminUserResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const AdminEventManagersScreen = () => {
  const [managers, setManagers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getEventManagers();
      setManagers(data);
    } catch (error) {
      console.error('Failed to fetch event managers', error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'טעינת מנהלי האירועים נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleBlock = async (id: number) => {
    try {
      await adminApi.blockEventManager(id);
      fetchManagers();
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'חסימת מנהל האירועים נכשלה.'));
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      await adminApi.unblockEventManager(id);
      fetchManagers();
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'ביטול חסימת מנהל האירועים נכשל.'));
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await adminApi.deactivateEventManager(id);
      fetchManagers();
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'השבתת מנהל האירועים נכשלה.'));
    }
  };

  const renderItem = ({ item }: { item: AdminUserResponse }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.fullName}</Text>
      <Text style={styles.email}>{item.email}</Text>
      <Text style={styles.status}>סטטוס: {item.adminBlocked ? 'חסום/מושבת' : 'פעיל'}</Text>
      
      <View style={styles.actions}>
        {item.adminBlocked ? (
          <AppButton title="שחרור חסימה" onPress={() => handleUnblock(item.id)} style={styles.button} />
        ) : (
          <>
            <AppButton title="חסימה" onPress={() => handleBlock(item.id)} style={[styles.button, styles.dangerButton]} />
            <AppButton title="השבתה" onPress={() => handleDeactivate(item.id)} style={[styles.button, styles.dangerButton]} />
          </>
        )}
      </View>
    </View>
  );

  return (
    <Screen>
      <View style={styles.container}>
        <FlatList
          data={managers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchManagers}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>לא נמצאו מנהלי אירוע.</Text>}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: theme.spacing.l,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.s,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  },
});
