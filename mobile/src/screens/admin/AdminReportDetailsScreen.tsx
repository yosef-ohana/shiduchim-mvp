import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainStack';
import { UserReportDetailsResponse } from '../../types/api';
import { adminApi } from '../../api/adminApi';

type AdminReportDetailsNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminReportDetails'>;
type AdminReportDetailsRouteProp = RouteProp<MainStackParamList, 'AdminReportDetails'>;

export const AdminReportDetailsScreen = () => {
  const navigation = useNavigation<AdminReportDetailsNavigationProp>();
  const route = useRoute<AdminReportDetailsRouteProp>();
  const { reportId } = route.params;

  const [report, setReport] = useState<UserReportDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);

  const fetchReportDetails = async () => {
    try {
      const data = await adminApi.getReportDetails(reportId);
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch report details', error);
      Alert.alert('שגיאה', 'לא ניתן לטעון את פרטי הדיווח.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReportDetails();
    }, [reportId])
  );

  const handleResolve = async () => {
    try {
      setIsResolving(true);
      await adminApi.resolveReport(reportId);
      Alert.alert('הצלחה', 'הדיווח סומן כטופל.');
      fetchReportDetails();
    } catch (error) {
      console.error('Failed to resolve report', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בעדכון הדיווח.');
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading || !report) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const getReasonText = (reason: string) => {
    switch(reason) {
      case 'PROFILE': return 'פרופיל';
      case 'BEHAVIOR': return 'התנהגות';
      case 'OTHER': return 'אחר';
      default: return reason;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>פרטי דיווח #{report.id}</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>סטטוס:</Text>
          <Text style={[styles.value, report.status === 'NEW' ? styles.statusNew : styles.statusResolved]}>
            {report.status === 'NEW' ? 'חדש' : 'טופל'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>מדווח:</Text>
          <Text style={styles.value}>{report.reporterName || 'לא ידוע'} ({report.reporterEmail || 'לא ידוע'})</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>מזהה מדווח:</Text>
          <Text style={styles.value}>{report.reporterUserId}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>נילון:</Text>
          <Text style={styles.value}>{report.reportedUserName || 'לא ידוע'} ({report.reportedUserEmail || 'לא ידוע'})</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>מזהה נילון:</Text>
          <Text style={styles.value}>{report.reportedUserId}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>סיבה:</Text>
          <Text style={styles.value}>{getReasonText(report.reasonType)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>תאריך יצירה:</Text>
          <Text style={styles.value}>{new Date(report.createdAt).toLocaleString('he-IL')}</Text>
        </View>

        {report.resolvedAt && (
          <View style={styles.row}>
            <Text style={styles.label}>תאריך טיפול:</Text>
            <Text style={styles.value}>{new Date(report.resolvedAt).toLocaleString('he-IL')}</Text>
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.label}>פירוט:</Text>
          <Text style={styles.textContent}>
            {report.text ? report.text : 'התקבל דיווח ללא פירוט.'}
          </Text>
        </View>
      </View>

      {report.status === 'NEW' && (
        <TouchableOpacity 
          style={[styles.button, isResolving && styles.buttonDisabled]} 
          onPress={handleResolve}
          disabled={isResolving}
        >
          <Text style={styles.buttonText}>
            {isResolving ? 'מעדכן...' : 'סמן כטופל'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
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
  content: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#555',
  },
  value: {
    color: '#333',
  },
  statusNew: {
    color: '#856404',
    backgroundColor: '#ffeeba',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusResolved: {
    color: '#155724',
    backgroundColor: '#d4edda',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  textContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  textContent: {
    marginTop: 10,
    color: '#333',
    lineHeight: 22,
    textAlign: 'right',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
