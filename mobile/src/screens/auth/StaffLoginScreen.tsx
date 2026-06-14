import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const StaffLoginScreen = ({ route, navigation }: any) => {
  const { role } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { staffLogin } = useAuth();

  const expectedRoleDisplay = role === 'ADMIN' ? 'מנהל מערכת' : 'מנהל אירוע';

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('אנא מלא את כל השדות');
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
      setErrorMsg(getFriendlyErrorMessage(e, 'לא ניתן להיכנס לפורטל הניהול כרגע.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>כניסת {expectedRoleDisplay}</Text>
        <Text style={styles.subtitle}>הזן את פרטי ההתחברות של הצוות כדי להמשיך</Text>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <AppInput
          label="אימייל"
          placeholder="הזן את אימייל הצוות"
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
          title={`התחברות בתור ${expectedRoleDisplay}`}
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
