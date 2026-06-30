import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { adminApi } from '../../api/adminApi';
import { 
  getParticipantDetails as emGetParticipantDetails, 
  restoreParticipant as emRestoreParticipant,
  removeParticipant as emRemoveParticipant
} from '../../api/eventManagerApi';
import { StaffParticipantDetailsResponse } from '../../types/api';
import { theme } from '../../theme/theme';
import { getFriendlyErrorMessage } from '../../utils/errorMessage';
import { getGenderLabel } from '../../utils/displayLabels';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../../utils/imageUrl';

const getProfileStatusLabel = (status: string) => {
  switch (status) {
    case 'NONE': return 'ללא פרופיל';
    case 'BASIC': return 'פרופיל בסיסי';
    case 'FULL': return 'פרופיל מלא';
    case 'FULL_INCOMPLETE_BLOCKED': return 'פרופיל חסום';
    default: return status;
  }
};

const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'USER': return 'משתמש';
    case 'EVENT_MANAGER': return 'מנהל אירוע';
    case 'ADMIN': return 'מנהל מערכת';
    default: return role || 'לא ידוע';
  }
};

export const StaffParticipantDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { weddingId, userId, mode } = route.params;

  const [details, setDetails] = useState<StaffParticipantDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const loadData = async () => {
    if (mode === 'EVENT_MANAGER' && !weddingId) {
      setValidationError('שגיאה: חסר מזהה חתונה לצפייה בפרטי המשתתף כסגל אירוע.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let data: StaffParticipantDetailsResponse;
      if (mode === 'ADMIN') {
        if (weddingId) {
          data = await adminApi.getParticipantDetails(weddingId, userId);
        } else {
          data = await adminApi.getUserDetails(userId);
        }
      } else {
        data = await emGetParticipantDetails(weddingId!, userId);
      }
      setDetails(data);
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'טעינת פרטי המשתתף נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (mode === 'ADMIN' && !weddingId) {
      navigation.setOptions({ title: 'פרטי משתמש' });
    } else {
      navigation.setOptions({ title: 'פרטי משתתף' });
    }
  }, [weddingId, userId, mode]);

  const handleBlockToggle = async () => {
    if (!details) return;
    const isBlocked = details.adminBlocked;
    const actionName = isBlocked ? 'שחרור חסימה' : 'חסימה';
    
    Alert.alert(
      actionName,
      `האם אתה בטוח שברצונך ${isBlocked ? 'לשחרר חסימה של' : 'לחסום את'} משתמש זה?`,
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'אישור', 
          style: isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              if (isBlocked) {
                await adminApi.unblockUser(userId);
              } else {
                await adminApi.blockUser(userId);
              }
              Alert.alert('הצלחה', `המשתמש ${isBlocked ? 'שוחרר מחסימה' : 'נחסם'}.`);
              await loadData();
            } catch (error: any) {
              console.error(error);
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, `פעולת ה${actionName} נכשלה.`));
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRemove = async (targetWeddingId: number) => {
    Alert.alert(
      'הסרת משתתף',
      `האם אתה בטוח שברצונך להסיר משתתף זה מחתונה זו?`,
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'הסרה', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              if (mode === 'ADMIN') {
                await adminApi.removeParticipant(targetWeddingId, userId);
              } else {
                await emRemoveParticipant(targetWeddingId, userId);
              }
              Alert.alert('הצלחה', 'המשתתף הוסר.');
              await loadData();
            } catch (error: any) {
              console.error(error);
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'הסרת המשתתף נכשלה.'));
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRestore = async (targetWeddingId: number) => {
    Alert.alert(
      'שחזור משתתף',
      `האם אתה בטוח שברצונך לשחזר משתתף זה לחתונה זו?`,
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'שחזור', 
          onPress: async () => {
            setActionLoading(true);
            try {
              if (mode === 'ADMIN') {
                await adminApi.restoreParticipant(targetWeddingId, userId);
              } else {
                await emRestoreParticipant(targetWeddingId, userId);
              }
              Alert.alert('הצלחה', 'המשתתף שוחזר.');
              await loadData();
            } catch (error: any) {
              console.error(error);
              Alert.alert('שגיאה', getFriendlyErrorMessage(error, 'שחזור המשתתף נכשל.'));
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (validationError) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{validationError}</Text>
        </View>
      </Screen>
    );
  }

  if (loading && !details) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!details) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>לא נמצאו פרטים.</Text>
        </View>
      </Screen>
    );
  }

  const primaryPhoto = details.photos?.find((p) => p.isPrimary) || details.photos?.[0];

  const hasBasicDetails = details.age !== null ||
                          details.heightCm !== null ||
                          details.areaOfResidence !== null ||
                          details.religiousLevel !== null ||
                          details.phone !== null;

  const hasFullDetails = details.education !== null ||
                         details.occupation !== null ||
                         details.lookingFor !== null ||
                         details.selfDescription !== null ||
                         details.hobbies !== null ||
                         details.familyDescription !== null ||
                         details.headCovering !== null ||
                         details.hasDrivingLicense !== null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header section */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            {primaryPhoto ? (
              <Image 
                source={{ uri: getImageUrl(primaryPhoto.imageUrl) }} 
                style={styles.avatar} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>אין תמונה</Text>
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{details.fullName}</Text>
              <Text style={styles.email}>{details.email}</Text>
              <View style={styles.labelsRow}>
                <Text style={styles.label}>{getGenderLabel(details.gender)}</Text>
                <Text style={styles.label}>{getProfileStatusLabel(details.profileStatus)}</Text>
                {details.role && <Text style={styles.label}>{getRoleLabel(details.role)}</Text>}
                <Text style={styles.label}>{details.hasPrimaryPhoto ? 'יש תמונה ראשית' : 'אין תמונה ראשית'}</Text>
              </View>
              {details.adminBlocked && (
                <Text style={styles.blockedText}>משתמש חסום מערכתית</Text>
              )}
            </View>
          </View>
        </View>

        {/* Photos Section */}
        {details.photos && details.photos.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>תמונות ({details.photos.length})</Text>
            <View style={styles.photosGrid}>
              {details.photos.map((photo, index) => (
                <View key={photo.id || index} style={styles.photoContainer}>
                  <Image
                    source={{ uri: getImageUrl(photo.imageUrl) }}
                    style={styles.gridPhoto}
                    resizeMode="cover"
                  />
                  {photo.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>ראשית</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Basic Profile */}
        {hasBasicDetails && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>פרופיל בסיסי</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>גיל:</Text>
              <Text style={styles.infoValue}>{details.age || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>גובה:</Text>
              <Text style={styles.infoValue}>{details.heightCm ? `${details.heightCm} ס"מ` : '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>אזור מגורים:</Text>
              <Text style={styles.infoValue}>{details.areaOfResidence || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>רמה דתית:</Text>
              <Text style={styles.infoValue}>{details.religiousLevel || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>טלפון:</Text>
              <Text style={styles.infoValue}>{details.phone || '-'}</Text>
            </View>
          </View>
        )}

        {/* Full Profile */}
        {hasFullDetails && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>פרופיל מלא</Text>
            {details.education !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>השכלה:</Text>
                <Text style={styles.infoValue}>{details.education || '-'}</Text>
              </View>
            )}
            {details.occupation !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>עיסוק:</Text>
                <Text style={styles.infoValue}>{details.occupation || '-'}</Text>
              </View>
            )}
            {details.lookingFor !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>מחפש/ת:</Text>
                <Text style={styles.infoValue}>{details.lookingFor || '-'}</Text>
              </View>
            )}
            {details.selfDescription !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>תיאור עצמי:</Text>
                <Text style={styles.infoValue}>{details.selfDescription || '-'}</Text>
              </View>
            )}
            {details.hobbies !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>תחביבים:</Text>
                <Text style={styles.infoValue}>{details.hobbies || '-'}</Text>
              </View>
            )}
            {details.familyDescription !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>רקע משפחתי:</Text>
                <Text style={styles.infoValue}>{details.familyDescription || '-'}</Text>
              </View>
            )}
            {details.headCovering !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>כיסוי ראש:</Text>
                <Text style={styles.infoValue}>{details.headCovering || '-'}</Text>
              </View>
            )}
            {details.hasDrivingLicense !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>רישיון נהיגה:</Text>
                <Text style={styles.infoValue}>{details.hasDrivingLicense ? 'כן' : 'לא'}</Text>
              </View>
            )}
          </View>
        )}

        {/* Weddings Management */}
        {details.manageableWeddings && details.manageableWeddings.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>חתונות בניהולך</Text>
            {details.manageableWeddings.map((w) => (
              <View key={w.weddingId} style={styles.weddingItem}>
                <View style={styles.weddingInfo}>
                  <Text style={styles.weddingName}>{w.weddingName}</Text>
                  <Text style={styles.weddingDetail}>סטטוס חתונה: {w.weddingStatus}</Text>
                  <Text style={styles.weddingDetail}>סטטוס משתתף: {w.participantStatus}</Text>
                </View>
                <View style={styles.weddingActions}>
                  {w.canRemove && (
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => handleRemove(w.weddingId)}
                      disabled={actionLoading}
                    >
                      <Text style={styles.actionButtonText}>הסרה</Text>
                    </TouchableOpacity>
                  )}
                  {w.canRestore && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.restoreButton]} 
                      onPress={() => handleRestore(w.weddingId)}
                      disabled={actionLoading}
                    >
                      <Text style={styles.restoreButtonText}>שחזור</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Admin Actions */}
        {mode === 'ADMIN' && (
          <View style={styles.adminCard}>
            <Text style={styles.adminSectionTitle}>פעולות מנהל מערכת</Text>
            <AppButton 
              title={details.adminBlocked ? "שחרר חסימת משתמש" : "חסום משתמש מערכתית"}
              onPress={handleBlockToggle}
              loading={actionLoading}
              style={details.adminBlocked ? styles.unblockButton : styles.blockButton}
            />
          </View>
        )}

      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  adminCard: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEE',
    marginLeft: theme.spacing.m,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEE',
    marginLeft: theme.spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#999',
    fontSize: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'right',
  },
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  labelsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginTop: theme.spacing.s,
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
  },
  blockedText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.m,
  },
  adminSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C62828',
    textAlign: 'right',
    marginBottom: theme.spacing.m,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 2,
    textAlign: 'right',
  },
  weddingItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: theme.spacing.s,
    paddingTop: theme.spacing.m,
  },
  weddingInfo: {
    flex: 1,
    marginLeft: theme.spacing.s,
  },
  weddingName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'right',
  },
  weddingDetail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  weddingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: theme.borderRadius.m,
  },
  actionButtonText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 13,
  },
  restoreButton: {
    backgroundColor: '#E8F5E9',
  },
  restoreButtonText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 13,
  },
  blockButton: {
    backgroundColor: '#D32F2F',
  },
  unblockButton: {
    backgroundColor: '#2E7D32',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  photosGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: theme.spacing.s,
  },
  photoContainer: {
    position: 'relative',
  },
  gridPhoto: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.m,
    backgroundColor: '#EEE',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: theme.borderRadius.s,
  },
  primaryBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});
