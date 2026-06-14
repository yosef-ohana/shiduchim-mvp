import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';

export const RegisterScreen = ({ route, navigation }: any) => {
  const pendingWeddingCode = route?.params?.pendingWeddingCode;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();

  const handleRegister = async () => {
    setErrorMsg('');
    if (!fullName || !email || !password) {
      setErrorMsg('אנא מלא את כל השדות');
      return;
    }
    
    setIsLoading(true);
    try {
      await register({ fullName, email, password, gender }, pendingWeddingCode);
    } catch (e: any) {
      setErrorMsg(getFriendlyErrorMessage(e, 'לא ניתן ליצור חשבון כרגע. נסה שוב.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>יצירת חשבון</Text>
        
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <AppInput
          label="שם מלא"
          placeholder="הזן את שמך המלא"
          value={fullName}
          onChangeText={setFullName}
        />

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

        <Text style={styles.label}>מגדר</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'MALE' && styles.genderSelected]} 
            onPress={() => setGender('MALE')}
          >
            <Text style={[styles.genderText, gender === 'MALE' && styles.genderTextSelected]}>זכר</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'FEMALE' && styles.genderSelected]} 
            onPress={() => setGender('FEMALE')}
          >
            <Text style={[styles.genderText, gender === 'FEMALE' && styles.genderTextSelected]}>נקבה</Text>
          </TouchableOpacity>
        </View>

        <AppButton
          title="הרשמה"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.button}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
          <Text style={styles.linkText}>כבר יש לך חשבון? להתחברות</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    flexGrow: 1,
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
  label: {
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  genderContainer: {
    flexDirection: 'row-reverse',
    marginBottom: theme.spacing.m,
  },
  genderButton: {
    flex: 1,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginHorizontal: theme.spacing.s / 2,
    borderRadius: theme.borderRadius.m,
  },
  genderSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  genderTextSelected: {
    color: theme.colors.surface,
  },
});
