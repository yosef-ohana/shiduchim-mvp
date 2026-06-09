import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme/theme';

export const WelcomeScreen = ({ navigation }: any) => {
  const handleWeddingCode = () => {
    navigation.navigate('WeddingCodeEntry');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        {/* Stylized premium logo design */}
        <View style={styles.logoContainer}>
          <View style={styles.logoRing1} />
          <View style={styles.logoRing2} />
          <Text style={styles.logoText}>ש</Text>
        </View>

        <Text style={styles.title}>Shiduchim</Text>
        <Text style={styles.tagline}>Connecting Hearts, Building Families</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>I want to meet someone</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleWeddingCode}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>I have a wedding code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('StaffLoginChoice')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkButtonText}>Staff Portal (Admin / Event Manager)</Text>
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
  logoContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    position: 'relative',
  },
  logoRing1: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    opacity: 0.8,
    transform: [{ translateX: -12 }],
  },
  logoRing2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    opacity: 0.8,
    transform: [{ translateX: 12 }],
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    zIndex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.s,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl * 1.5,
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.m,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    paddingVertical: theme.spacing.s,
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  linkButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
