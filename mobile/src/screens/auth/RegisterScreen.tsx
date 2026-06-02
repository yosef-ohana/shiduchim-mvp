import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';

export const RegisterScreen = ({ navigation }: any) => {
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
      setErrorMsg('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await register({ fullName, email, password, gender });
    } catch (e: any) {
      setErrorMsg(e.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <AppInput
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />

        <AppInput
          label="Email"
          placeholder="Enter your email"
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

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'MALE' && styles.genderSelected]} 
            onPress={() => setGender('MALE')}
          >
            <Text style={[styles.genderText, gender === 'MALE' && styles.genderTextSelected]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'FEMALE' && styles.genderSelected]} 
            onPress={() => setGender('FEMALE')}
          >
            <Text style={[styles.genderText, gender === 'FEMALE' && styles.genderTextSelected]}>Female</Text>
          </TouchableOpacity>
        </View>

        <AppButton
          title="Register"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.button}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
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
  },
  genderContainer: {
    flexDirection: 'row',
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
