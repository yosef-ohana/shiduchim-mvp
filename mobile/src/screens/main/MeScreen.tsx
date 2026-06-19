import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';
import { adminApi } from '../../api/adminApi';
import { getUnreadCount } from '../../api/chatsApi';
import { AdminDashboardResponse } from '../../types/api';
import { getYesNoLabel, getUserRoleLabel } from '../../utils/displayLabels';

const getProfileStatusLabel = (status: string) => {
  switch (status) {
    case 'NONE': return 'לא הוגדר';
    case 'BASIC': return 'פרופיל בסיסי';
    case 'FULL': return 'פרופיל מלא';
    case 'FULL_INCOMPLETE_BLOCKED': return 'פרופיל מלא חסר (חסום)';
    default: return status;
  }
};

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
        <Text style={styles.title}>החשבון שלי</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>שם מלא:</Text>
            <Text style={styles.value}>{user.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>אימייל:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>תפקיד:</Text>
            <Text style={styles.value}>{getUserRoleLabel(user.role)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>סטטוס:</Text>
            <Text style={styles.value}>{getProfileStatusLabel(user.profileStatus)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>חסום:</Text>
            <Text style={styles.value}>{getYesNoLabel(user.adminBlocked)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>תמונה ראשית:</Text>
            <Text style={styles.value}>{getYesNoLabel(user.hasPrimaryPhoto)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>כמות תמונות:</Text>
            <Text style={styles.value}>{user.photoCount}</Text>
          </View>
        </View>

        {user.role === 'USER' && (
          <>
            <AppButton 
              title="פרטי הפרופיל שלי" 
              onPress={() => navigation.navigate('Profile')}
              style={styles.button}
            />

            <AppButton 
              title="חיפוש מועמדים" 
              onPress={() => navigation.navigate('PoolSelection')}
              style={styles.button}
            />

            <AppButton 
              title="הרשימות שלי" 
              onPress={() => navigation.navigate('Lists')}
              style={styles.button}
            />

            <AppButton
              title="ההתאמות שלי"
              onPress={() => navigation.navigate('Matches')}
              style={styles.button}
            />

            <AppButton
              title="הודעות פתיחה"
              onPress={() => navigation.navigate('OpeningMessages')}
              style={styles.button}
            />

            <AppButton
              title="משתמשים חסומים"
              onPress={() => navigation.navigate('BlockedUsers')}
              style={styles.button}
            />

            <AppButton
              title={totalUnreadCount > 0 ? `צ׳אטים (${totalUnreadCount})` : 'צ׳אטים'}
              onPress={() => navigation.navigate('Chats')}
              style={styles.button}
            />

            <AppButton
              title="השלמת פרופיל בסיסי"
              onPress={() => navigation.navigate('BasicProfile')}
              style={styles.button}
            />

            <AppButton 
              title="השלמת פרופיל מלא" 
              onPress={() => navigation.navigate('FullProfile')}
              style={styles.button}
            />

            <AppButton 
              title="התמונות שלי" 
              onPress={() => navigation.navigate('Photos')}
              style={styles.button}
            />

            <AppButton 
              title="החתונות שלי" 
              onPress={() => navigation.navigate('MyWeddings')}
              style={styles.button}
            />

            <AppButton 
              title="הצטרפות לחתונה" 
              onPress={() => navigation.navigate('JoinWedding')}
              style={styles.button}
            />

            <AppButton 
              title="רענון פרופיל" 
              onPress={handleRefresh} 
              loading={isRefreshing}
              style={[styles.button, styles.refreshButton]}
            />
          </>
        )}

        {user.role === 'ADMIN' && (
          <>
            <Text style={styles.sectionTitle}>דף בית מנהל</Text>

            {isLoadingDashboard ? (
              <Text style={styles.dashboardStatusText}>טוען נתוני לוח בקרה...</Text>
            ) : dashboardData ? (
              <View style={styles.dashboardContainer}>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardNum}>{dashboardData.usersCount}</Text>
                  <Text style={styles.dashboardLabel}>משתמשים</Text>
                </View>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardNum}>{dashboardData.eventManagersCount}</Text>
                  <Text style={styles.dashboardLabel}>מנהלי אירועים</Text>
                </View>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardNum}>{dashboardData.weddingsCount}</Text>
                  <Text style={styles.dashboardLabel}>חתונות</Text>
                </View>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardNum}>{dashboardData.activeWeddingsCount}</Text>
                  <Text style={styles.dashboardLabel}>חתונות פעילות</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.dashboardErrorText}>טעינת נתוני לוח הבקרה נכשלה</Text>
            )}

            <AppButton 
              title="משתמשים" 
              onPress={() => navigation.navigate('AdminUsers')}
              style={styles.button}
            />
            <AppButton 
              title="חתונות" 
              onPress={() => navigation.navigate('AdminWeddings')}
              style={styles.button}
            />
            <AppButton 
              title="מנהלי אירועים" 
              onPress={() => navigation.navigate('AdminEventManagers')}
              style={styles.button}
            />
            <AppButton 
              title="יצירת מנהל אירוע" 
              onPress={() => navigation.navigate('CreateEventManager')}
              style={styles.button}
            />
            <AppButton
              title="ניהול דיווחים"
              onPress={() => navigation.navigate('AdminReports')}
              style={styles.button}
            />
          </>
        )}

        {user.role === 'EVENT_MANAGER' && (
          <>
            <Text style={styles.sectionTitle}>דף בית מנהל אירוע</Text>
            <AppButton 
              title="החתונות שלי" 
              onPress={() => navigation.navigate('EventManagerWeddings')}
              style={styles.button}
            />
            <AppButton 
              title="יצירת חתונה" 
              onPress={() => navigation.navigate('CreateWedding')}
              style={styles.button}
            />
          </>
        )}
        
        <AppButton 
          title="התנתקות" 
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
    flexDirection: 'row-reverse',
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
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
  },
  refreshButton: {
    backgroundColor: '#4A4A4A',
  },
  dashboardContainer: {
    flexDirection: 'row-reverse',
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
