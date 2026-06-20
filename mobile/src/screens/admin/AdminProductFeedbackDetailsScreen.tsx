import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { productFeedbackApi } from '../../api/productFeedbackApi';
import { ProductFeedbackDetailsResponse, FeedbackStatus } from '../../types/apiProductFeedback';

export const AdminProductFeedbackDetailsScreen = ({ route, navigation }: any) => {
  const { feedbackId } = route.params;
  const [item, setItem] = useState<ProductFeedbackDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [feedbackId]);

  const fetchDetails = async () => {
    try {
      const data = await productFeedbackApi.getAdminFeedbackDetails(feedbackId);
      setItem(data);
    } catch (error) {
      console.error('Error fetching feedback details:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בטעינת פרטי הפניה');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: FeedbackStatus) => {
    setUpdating(true);
    try {
      await productFeedbackApi.updateAdminFeedbackStatus(feedbackId, { status });
      Alert.alert('הצלחה', 'סטטוס הפניה עודכן בהצלחה');
      fetchDetails();
    } catch (error) {
      console.error('Error updating feedback status:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בעדכון הסטטוס');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'NEW': return 'חדש';
      case 'IN_PROGRESS': return 'בטיפול';
      case 'RESOLVED': return 'טופל';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch(type) {
      case 'BUG': return 'באג';
      case 'IMPROVEMENT': return 'שיפור';
      case 'OTHER': return 'אחר';
      default: return type;
    }
  };

  if (loading || !item) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>פניה #{item.id}</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>סוג:</Text>
            <Text style={styles.value}>{getTypeText(item.type)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>סטטוס:</Text>
            <Text style={styles.value}>{getStatusText(item.status)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>תאריך יצירה:</Text>
            <Text style={styles.value}>{new Date(item.createdAt).toLocaleString('he-IL')}</Text>
          </View>

          {item.resolvedAt && (
            <View style={styles.row}>
              <Text style={styles.label}>תאריך טיפול:</Text>
              <Text style={styles.value}>{new Date(item.resolvedAt).toLocaleString('he-IL')}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>מזהה משתמש:</Text>
            <Text style={styles.value}>{item.userId}</Text>
          </View>

          <Text style={styles.textLabel}>תוכן הפניה:</Text>
          <View style={styles.textBox}>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        </View>

        <Text style={styles.actionsTitle}>עדכון סטטוס:</Text>
        <View style={styles.actionButtons}>
          <AppButton
            title="חדש"
            onPress={() => handleUpdateStatus('NEW')}
            disabled={item.status === 'NEW'}
            loading={updating}
            style={[styles.actionButton, item.status === 'NEW' && styles.actionButtonActive]}
          />
          <AppButton
            title="בטיפול"
            onPress={() => handleUpdateStatus('IN_PROGRESS')}
            disabled={item.status === 'IN_PROGRESS'}
            loading={updating}
            style={[styles.actionButton, item.status === 'IN_PROGRESS' && styles.actionButtonActive]}
          />
          <AppButton
            title="טופל"
            onPress={() => handleUpdateStatus('RESOLVED')}
            disabled={item.status === 'RESOLVED'}
            loading={updating}
            style={[styles.actionButton, item.status === 'RESOLVED' && styles.actionButtonActive]}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.s,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  textLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
    textAlign: 'right',
  },
  textBox: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    minHeight: 100,
  },
  text: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.s,
    backgroundColor: theme.colors.border,
  },
  actionButtonActive: {
    backgroundColor: theme.colors.primary,
  }
});
