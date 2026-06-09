import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme/theme';

export const StaffLoginChoiceScreen = ({ navigation }: any) => {
  const handleSelectRole = (role: 'ADMIN' | 'EVENT_MANAGER') => {
    navigation.navigate('StaffLogin', { role });
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Staff Portal</Text>
        <Text style={styles.subtitle}>Select your staff portal to log in</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleSelectRole('ADMIN')}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🔑</Text>
            </View>
            <Text style={styles.cardTitle}>Admin Portal</Text>
            <Text style={styles.cardDesc}>Manage users, weddings, and global system operations.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleSelectRole('EVENT_MANAGER')}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📅</Text>
            </View>
            <Text style={styles.cardTitle}>Event Manager Portal</Text>
            <Text style={styles.cardDesc}>Manage your weddings, access codes, and participants.</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl * 1.5,
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    gap: theme.spacing.l,
  },
  roleCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FAF6E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  iconText: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  cardDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
