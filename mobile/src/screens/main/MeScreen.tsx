import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';

export const MeScreen = ({ navigation }: any) => {
  const { user, logout, refreshMe } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMe();
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
  logoutButton: {
    backgroundColor: theme.colors.error,
  },
  refreshButton: {
    backgroundColor: '#4A4A4A',
  },
});
