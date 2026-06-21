import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainStack';
import { UserReportSummaryResponse } from '../../types/api';
import { adminApi } from '../../api/adminApi';

type AdminReportsNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminReports'>;

export const AdminReportsScreen = () => {
  const navigation = useNavigation<AdminReportsNavigationProp>();
  const [reports, setReports] = useState<UserReportSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const data = await adminApi.getReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getStatusText = (status: string) => {
    return status === 'NEW' ? 'חדש' : 'טופל';
  };

  const getReasonText = (reason: string) => {
    switch(reason) {
      case 'PROFILE': return 'פרופיל';
      case 'BEHAVIOR': return 'התנהגות';
      case 'OTHER': return 'אחר';
      default: return reason;
    }
  };

  const renderItem = ({ item }: { item: UserReportSummaryResponse }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('AdminReportDetails', { reportId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.status, item.status === 'NEW' ? styles.statusNew : styles.statusResolved]}>
          {getStatusText(item.status)}
        </Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('he-IL')}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.text}>מדווח: {item.reporterName || 'לא ידוע'} ({item.reporterEmail || 'לא ידוע'})</Text>
        <Text style={styles.text}>נילון: {item.reportedUserName || 'לא ידוע'} ({item.reportedUserEmail || 'לא ידוע'})</Text>
        <Text style={styles.text}>סיבה: {getReasonText(item.reasonType)}</Text>
        <Text style={styles.text}>פירוט: {item.hasText ? 'כן' : 'לא'}</Text>
        <Text style={styles.secondaryText}>מזהה מדווח: {item.reporterUserId} | מזהה נילון: {item.reportedUserId}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>אין דיווחים להצגה</Text>}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  status: {
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusNew: {
    backgroundColor: '#ffeeba',
    color: '#856404',
  },
  statusResolved: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  date: {
    color: '#6c757d',
    fontSize: 12,
  },
  cardBody: {
    gap: 4,
  },
  text: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
  },
  secondaryText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#6c757d',
    fontSize: 16,
  },
});
