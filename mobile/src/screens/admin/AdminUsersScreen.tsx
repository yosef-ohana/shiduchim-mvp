import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

type AdminUsersRouteProp = RouteProp<MainStackParamList, 'AdminUsers'>;
type AdminUsersNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminUsers'>;

export const AdminUsersScreen = () => {
  const route = useRoute<AdminUsersRouteProp>();
  const navigation = useNavigation<AdminUsersNavigationProp>();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [focusUserId, setFocusUserId] = useState<number | null>(null);

  useEffect(() => {
    if (route.params?.focusUserId) {
      setFocusUserId(route.params.focusUserId);
    } else {
      setFocusUserId(null);
    }
  }, [route.params?.focusUserId]);

  const handleClearFocus = () => {
    setFocusUserId(null);
    navigation.setParams({ focusUserId: undefined });
  };

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

  const displayedUsers = focusUserId
    ? users.filter(u => u.id === focusUserId)
    : users;

  const handleCardPress = (user: AdminUserResponse) => {
    navigation.navigate('StaffParticipantDetails', {
      userId: user.id,
      mode: 'ADMIN',
      source: 'ADMIN_USERS'
    });
  };

  const renderItem = ({ item }: { item: AdminUserResponse }) => {
    const isFocused = item.id === focusUserId;
    const isEventManager = item.role === 'EVENT_MANAGER';
    return (
      <View style={[styles.card, isFocused && styles.focusedCard]}>
        <TouchableOpacity
          onPress={() => handleCardPress(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.name}>{item.fullName || 'לא צוין'} (מזהה: {item.id})</Text>
          <Text style={styles.info}>אימייל: {item.email || 'לא צוין'}</Text>
          <Text style={styles.info}>תפקיד: {getUserRoleLabel(item.role)}</Text>
          <Text style={styles.info}>סטטוס פרופיל: {getProfileStatusLabel(item.profileStatus)}</Text>
          <Text style={styles.info}>סטטוס: {item.adminBlocked ? 'חסום' : 'פעיל'}</Text>
        </TouchableOpacity>

        {isEventManager && (
          <AppButton
            title="פרטים וניהול"
            onPress={() => navigation.navigate('AdminEventManagerDetails', { managerId: item.id })}
            style={[styles.button, styles.detailsButton]}
          />
        )}

        {isFocused ? (
          <View style={styles.buttonRow}>
            <AppButton
              title="פתח פרטי משתמש"
              variant="secondary"
              onPress={() => handleCardPress(item)}
              style={[styles.button, styles.ctaButton]}
            />
            <AppButton
              title={item.adminBlocked ? 'שחרור חסימה' : 'חסימה'}
              onPress={() => handleToggleBlock(item)}
              loading={actionLoading === item.id}
              style={[styles.button, styles.blockButtonHalf, item.adminBlocked ? styles.unblockButton : styles.blockButton]}
            />
          </View>
        ) : (
          <AppButton
            title={item.adminBlocked ? 'שחרור חסימה' : 'חסימה'}
            onPress={() => handleToggleBlock(item)}
            loading={actionLoading === item.id}
            style={[styles.button, item.adminBlocked ? styles.unblockButton : styles.blockButton]}
          />
        )}
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        {focusUserId && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>מציג משתמש מסוים</Text>
            <TouchableOpacity onPress={handleClearFocus} style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>הצג את כל המשתמשים</Text>
            </TouchableOpacity>
          </View>
        )}
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <FlatList
            data={displayedUsers}
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
  buttonRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: theme.spacing.s,
    marginTop: theme.spacing.m,
  },
  ctaButton: {
    flex: 1,
    marginTop: 0,
  },
  blockButtonHalf: {
    flex: 1,
    marginTop: 0,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    color: theme.colors.textSecondary,
  },
  banner: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    borderColor: '#91d5ff',
    borderWidth: 1,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
  },
  bannerText: {
    color: '#0050b3',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'right',
  },
  bannerButton: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.s,
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  focusedCard: {
    borderColor: '#1890ff',
    borderWidth: 2,
  },
  detailsButton: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.s,
  },
});
