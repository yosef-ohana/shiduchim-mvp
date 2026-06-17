import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../theme/theme';
import { buildWeddingJoinLink } from '../utils/weddingJoinLink';

interface WeddingJoinQrCardProps {
  accessCode: string;
  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  weddingName?: string;
}

export const WeddingJoinQrCard: React.FC<WeddingJoinQrCardProps> = ({
  accessCode,
  status,
  weddingName,
}) => {
  if (status === 'CLOSED' || status === 'CANCELLED') {
    return (
      <View style={styles.card}>
        <Text style={styles.warningText}>
          החתונה אינה פתוחה להצטרפות ולכן אין לשתף קישור או QR.
        </Text>
      </View>
    );
  }

  if (!accessCode) {
    return null;
  }

  const joinUrl = buildWeddingJoinLink(accessCode);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>הזמנת משתתפים</Text>
      {weddingName && (
        <Text style={styles.weddingName}>{weddingName}</Text>
      )}
      <Text style={styles.instruction}>
        שתף את הקישור או סרוק את ה-QR להצטרפות לחתונה:
      </Text>
      <View style={styles.qrContainer}>
        <QRCode
          value={joinUrl}
          size={150}
          color={theme.colors.text}
          backgroundColor={theme.colors.surface}
        />
      </View>
      <Text style={styles.linkText} selectable>
        {joinUrl}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginVertical: theme.spacing.m,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  weddingName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  qrContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.l,
  },
  linkText: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#F57C00', // Warning color
    textAlign: 'center',
    fontWeight: '500',
  },
});
