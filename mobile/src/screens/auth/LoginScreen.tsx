import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const LoginScreen = ({ route, navigation }: any) => {
  const pendingWeddingCode = route?.params?.pendingWeddingCode;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('אנא מלא את כל השדות');
      return;
    }
    
    setIsLoading(true);
    try {
      await login({ email, password }, pendingWeddingCode);
    } catch (e: any) {
      setErrorMsg(getFriendlyErrorMessage(e, 'לא ניתן להתחבר כרגע. נסה שוב.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>ברוכים השבים</Text>
      
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <AppInput
        label="אימייל"
        placeholder="הזן את כתובת האימייל"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      
      <AppInput
        label="סיסמה"
        placeholder="הזן את הסיסמה"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <AppButton
        title="התחברות"
        onPress={handleLogin}
        loading={isLoading}
        style={styles.button}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
        <Text style={styles.linkText}>אין לך חשבון? להרשמה</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
  },
  linkContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
