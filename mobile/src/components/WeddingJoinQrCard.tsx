import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../theme/theme';
import { buildWeddingJoinLink } from '../utils/weddingJoinLink';
import { generateWeddingInvitationText } from '../utils/weddingInvitationText';

interface WeddingJoinQrCardProps {
  accessCode: string;
  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  weddingName?: string;
  city?: string;
  weddingDate?: string;
}

export const WeddingJoinQrCard: React.FC<WeddingJoinQrCardProps> = ({
  accessCode,
  status,
  weddingName,
  city,
  weddingDate,
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
  const invitationText = generateWeddingInvitationText({
    name: weddingName || '',
    city,
    weddingDate,
    accessCode,
  });

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

      {/* Divider */}
      <View style={styles.divider} />

      {/* Manual Invitation Text Section */}
      <View style={styles.inviteSection}>
        <Text style={styles.inviteTitle}>טקסט הזמנה ידנית</Text>
        <Text style={styles.inviteDescription}>
          באפשרותך להעתיק את תבנית ההודעה להלן ולשתף אותה עם משתתפים פוטנציאליים:
        </Text>
        <View style={styles.inviteTextBox}>
          <Text style={styles.inviteText} selectable={true}>
            {invitationText}
          </Text>
        </View>
        <Text style={styles.copyHint}>
          הערה: לחץ לחיצה כפולה או לחיצה ארוכה על הטקסט לעיל כדי להעתיק אותו.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'stretch',
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
    alignSelf: 'center',
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
    marginBottom: theme.spacing.m,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.l,
    width: '100%',
  },
  inviteSection: {
    alignItems: 'stretch',
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'right',
  },
  inviteDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
    lineHeight: 18,
    textAlign: 'right',
  },
  inviteTextBox: {
    backgroundColor: '#F5F5F5',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inviteText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    fontFamily: 'System',
    textAlign: 'right',
  },
  copyHint: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.s,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  warningText: {
    fontSize: 14,
    color: '#F57C00', // Warning color
    textAlign: 'center',
    fontWeight: '500',
  },
});
