import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { adminApi } from '../../api/adminApi';
import { AdminUserResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { MainStackParamList } from '../../navigation/MainStack';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminEventManagers'>;

export const AdminEventManagersScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [managers, setManagers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getEventManagers();
      setManagers(data);
    } catch (error) {
      console.error('Failed to fetch event managers', error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'טעינת מנהלי האירועים נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchManagers();
    });
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }: { item: AdminUserResponse }) => {
    const isBlocked = item.adminBlocked;
    const isActive = item.eventManagerActive !== false;

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            חסימה: {isBlocked ? 'חסום' : 'לא חסום'}
          </Text>
          <Text style={styles.statusSeparator}>|</Text>
          <Text style={styles.statusText}>
            פעילות: {isActive ? 'פעיל' : 'מושבת'}
          </Text>
        </View>

        <View style={styles.actions}>
          <AppButton
            title="פרטים וניהול"
            onPress={() => navigation.navigate('AdminEventManagerDetails', { managerId: item.id })}
            style={styles.button}
          />
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <FlatList
          data={managers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchManagers}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>לא נמצאו מנהלי אירוע.</Text>}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: theme.spacing.l,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusSeparator: {
    marginHorizontal: 8,
    color: theme.colors.border,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.s,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  },
});
