import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';

export const StaffLoginScreen = ({ route, navigation }: any) => {
  const { role } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { staffLogin } = useAuth();

  const expectedRoleDisplay = role === 'ADMIN' ? 'Admin' : 'Event Manager';

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await staffLogin({
        email,
        password,
        expectedRole: role,
      });
      // Context will automatically update state and trigger navigation to MainStack if successful
    } catch (e: any) {
      const message = e.message || '';
      const status = e.response?.status;
      const errorData = e.response?.data?.message || '';
      
      const fullErrorText = (message + ' ' + errorData).toLowerCase();

      if (fullErrorText.includes('blocked') || fullErrorText.includes('deactivated')) {
        setErrorMsg('This staff account has been deactivated or blocked. Please contact system support.');
      } else if (status === 403 || fullErrorText.includes('forbidden') || fullErrorText.includes('access denied') || fullErrorText.includes('role mismatch') || fullErrorText.includes('not allowed')) {
        setErrorMsg(`Access denied. Your account does not have the required ${expectedRoleDisplay} permissions.`);
      } else if (status === 401 || fullErrorText.includes('unauthorized') || fullErrorText.includes('incorrect') || fullErrorText.includes('invalid credentials')) {
        setErrorMsg('Invalid staff credentials. Please check your email and password and try again.');
      } else if (fullErrorText.includes('network') || fullErrorText.includes('timeout') || (status && status >= 500)) {
        setErrorMsg('Network error. Please check your connection and try again.');
      } else {
        setErrorMsg(errorData || message || 'Staff login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>{expectedRoleDisplay} Login</Text>
        <Text style={styles.subtitle}>Enter your staff credentials to continue</Text>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <AppInput
          label="Email"
          placeholder="Enter your staff email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <AppInput
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <AppButton
          title={`Log In as ${expectedRoleDisplay}`}
          onPress={handleLogin}
          loading={isLoading}
          style={styles.button}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.l,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
    fontWeight: '600',
  },
});
