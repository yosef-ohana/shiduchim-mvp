import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';
import { adminApi } from '../../api/adminApi';
import { getUnreadCount } from '../../api/chatsApi';
import { AdminDashboardResponse } from '../../types/api';

export const MeScreen = ({ navigation }: any) => {
  const { user, logout, refreshMe } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);

  const fetchDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const data = await adminApi.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const fetchTotalUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setTotalUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching total unread count:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user && user.role === 'ADMIN') {
        fetchDashboard();
      }
      if (user && user.role === 'USER') {
        fetchTotalUnreadCount();
      }
    }, [user])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMe();
      if (user && user.role === 'ADMIN') {
        const data = await adminApi.getDashboard();
        setDashboardData(data);
      }
      if (user && user.role === 'USER') {
        await fetchTotalUnreadCount();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) return null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Account</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{user.role}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{user.profileStatus}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Blocked:</Text>
            <Text style={styles.value}>{user.adminBlocked ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Primary Photo:</Text>
            <Text style={styles.value}>{user.hasPrimaryPhoto ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Photo Count:</Text>
            <Text style={styles.value}>{user.photoCount}</Text>
          </View>
        </View>

        {user.role === 'USER' && (
          <>
            <AppButton 
              title="My Profile Details" 
              onPress={() => navigation.navigate('Profile')}
              style={styles.button}
            />

            <AppButton 
              title="Discover Candidates" 
              onPress={() => navigation.navigate('PoolSelection')}
              style={styles.button}
            />

            <AppButton 
              title="My Lists" 
              onPress={() => navigation.navigate('Lists')}
              style={styles.button}
            />

            <AppButton 
              title="My Matches" 
              onPress={() => navigation.navigate('Matches')}
              style={styles.button}
            />

            <AppButton 
              title={totalUnreadCount > 0 ? `Chats (${totalUnreadCount})` : 'Chats'} 
              onPress={() => navigation.navigate('Chats')}
              style={styles.button}
            />

            <AppButton 
              title="Complete Basic Profile" 
              onPress={() => navigation.navigate('BasicProfile')}
              style={styles.button}
            />

            <AppButton 
              title="Complete Full Profile" 
              onPress={() => navigation.navigate('FullProfile')}
              style={styles.button}
            />

            <AppButton 
              title="My Photos" 
              onPress={() => navigation.navigate('Photos')}
              style={styles.button}
            />

            <AppButton 
              title="My Weddings" 
              onPress={() => navigation.navigate('MyWeddings')}
              style={styles.button}
            />

            <AppButton 
              title="Join Wedding" 
              onPress={() => navigation.navigate('JoinWedding')}
              style={styles.button}
            />

            <AppButton 
              title="Refresh Profile" 
              onPress={handleRefresh} 
              loading={isRefreshing}
              style={[styles.button, styles.refreshButton]}
            />
          </>
        )}

        {user.role === 'ADMIN' && (
          <>
            <Text style={styles.sectionTitle}>Admin Home</Text>

            {isLoadingDashboard ? (
              <Text style={styles.dashboardStatusText}>Loading dashboard...</Text>
            ) : dashboardData ? (
              <View style={styles.dashboardContainer}>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardNum}>{dashboardData.usersCount}</Text>
                  <Text style={styles.dashboardLabel}>Users</Text>
                </View>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardNum}>{dashboardData.eventManagersCount}</Text>
                  <Text style={styles.dashboardLabel}>Event MGRs</Text>
                </View>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardNum}>{dashboardData.weddingsCount}</Text>
                  <Text style={styles.dashboardLabel}>Weddings</Text>
                </View>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardNum}>{dashboardData.activeWeddingsCount}</Text>
                  <Text style={styles.dashboardLabel}>Active Weddings</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.dashboardErrorText}>Failed to load dashboard statistics</Text>
            )}

            <AppButton 
              title="Users" 
              onPress={() => navigation.navigate('AdminUsers')}
              style={styles.button}
            />
            <AppButton 
              title="Weddings" 
              onPress={() => navigation.navigate('AdminWeddings')}
              style={styles.button}
            />
            <AppButton 
              title="Event Managers" 
              onPress={() => navigation.navigate('AdminEventManagers')}
              style={styles.button}
            />
            <AppButton 
              title="Create Event Manager" 
              onPress={() => navigation.navigate('CreateEventManager')}
              style={styles.button}
            />
          </>
        )}

        {user.role === 'EVENT_MANAGER' && (
          <>
            <Text style={styles.sectionTitle}>Event Manager Home</Text>
            <AppButton 
              title="My Weddings" 
              onPress={() => navigation.navigate('EventManagerWeddings')}
              style={styles.button}
            />
            <AppButton 
              title="Create Wedding" 
              onPress={() => navigation.navigate('CreateWedding')}
              style={styles.button}
            />
          </>
        )}
        
        <AppButton 
          title="Logout" 
          onPress={logout} 
          style={[styles.button, styles.logoutButton]}
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
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  button: {
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
  },
  refreshButton: {
    backgroundColor: '#4A4A4A',
  },
  dashboardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.s,
  },
  dashboardCard: {
    backgroundColor: theme.colors.surface,
    width: '48%',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dashboardNum: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  dashboardLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  dashboardStatusText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  dashboardErrorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
    fontWeight: '500',
  },
});
