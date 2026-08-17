import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from './foundation/Button';
import { AppIcon } from './foundation/AppIcon';
import { theme } from '../theme/theme';
import { tokens } from '../theme/tokens';
import { getMyPhotos, uploadPhoto, setPrimaryPhoto, deletePhoto } from '../api/photosApi';
import { PhotoResponse } from '../types/api';
import { getImageUrl } from '../utils/imageUrl';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage } from '../utils/errorMessage';
import { SemanticIconName } from '../theme/icons';

type PhotoOperation = 'upload' | 'delete' | 'setPrimary' | null;

interface ProfilePhotosManagerProps {
  onPhotosChanged?: () => void;
}

export const ProfilePhotosManager: React.FC<ProfilePhotosManagerProps> = ({ onPhotosChanged }) => {
  const { refreshMe } = useAuth();
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [operationType, setOperationType] = useState<PhotoOperation>(null);
  const [failedOperation, setFailedOperation] = useState<PhotoOperation>(null);
  const [targetPhotoId, setTargetPhotoId] = useState<number | null>(null);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setGlobalError('');
      const data = await getMyPhotos();
      setPhotos(data);
    } catch (err: any) {
      setGlobalError(getFriendlyErrorMessage(err, 'טעינת התמונות נכשלה.'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [])
  );

  const triggerChange = async () => {
    await loadPhotos();
    await refreshMe();
    if (onPhotosChanged) {
      onPhotosChanged();
    }
  };

  const handlePickAndUpload = async () => {
    if (photos.length >= 2) return;

    setFailedOperation(null);
    setTargetPhotoId(null);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('הרשאה נדחתה', 'סליחה, אנו זקוקים להרשאת גישה לגלריית התמונות כדי להמשיך!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      try {
        setActionLoading(true);
        setOperationType('upload');
        setFailedOperation(null);
        await uploadPhoto(asset.uri, asset.mimeType || 'image/jpeg', asset.fileName || 'profile-photo.jpg');
        await triggerChange();
        setOperationType(null);
      } catch (err: any) {
        setFailedOperation('upload');
        setOperationType(null);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      setActionLoading(true);
      setOperationType('setPrimary');
      setTargetPhotoId(photoId);
      setFailedOperation(null);
      await setPrimaryPhoto(photoId);
      await triggerChange();
      setOperationType(null);
      setTargetPhotoId(null);
    } catch (err: any) {
      setFailedOperation('setPrimary');
      setTargetPhotoId(photoId);
      setOperationType(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    try {
      setActionLoading(true);
      setOperationType('delete');
      setTargetPhotoId(photoId);
      setFailedOperation(null);
      await deletePhoto(photoId);
      await triggerChange();
      setOperationType(null);
      setTargetPhotoId(null);
    } catch (err: any) {
      setFailedOperation('delete');
      setTargetPhotoId(photoId);
      setOperationType(null);
    } finally {
      setActionLoading(false);
    }
  };

  const getTopStatus = () => {
    if (operationType === 'delete') {
      return {
        title: 'התמונה הראשית נשארת פעילה',
        body: 'השינוי יוצג רק לאחר אישור השרת.',
        icon: 'check' as SemanticIconName,
      };
    }
    if (failedOperation === 'delete') {
      return {
        title: 'לא בוצע שינוי בתמונות',
        body: 'המצב התקף נשמר לאחר כשל המחיקה.',
        icon: 'check' as SemanticIconName,
      };
    }
    if (operationType === 'setPrimary') {
      return {
        title: 'התמונה הראשית הנוכחית נשארת בתוקף',
        body: 'הסימון ישתנה רק לאחר הצלחת הפעולה.',
        icon: 'check' as SemanticIconName,
      };
    }
    if (failedOperation === 'setPrimary') {
      return {
        title: 'התמונה הראשית לא השתנתה',
        body: 'הכשל לא מחליף את התמונה הראשית הנוכחית.',
        icon: 'check' as SemanticIconName,
      };
    }
    if (failedOperation === 'upload') {
      if (photos.length > 0) {
        return {
          title: 'התמונה הראשית נשמרה',
          body: 'הכשל בהעלאה לא שינה את התמונה הקיימת.',
          icon: 'check' as SemanticIconName,
        };
      }
    }

    if (photos.length === 0) {
      return {
        title: 'עדיין חסרה תמונה ראשית',
        body: 'הוספת תמונה ראשית משלימה את דרישת התמונות. מצב המוכנות מתעדכן לפי נתוני הפרופיל.',
        icon: 'alert-circle' as SemanticIconName,
      };
    }

    if (photos.length === 1) {
      return {
        title: 'תמונה ראשית קיימת',
        body: 'המצב נשמר לפי הנתונים המעודכנים מהשרת.',
        icon: 'check' as SemanticIconName,
      };
    }

    return {
      title: 'התמונה הראשית תקינה',
      body: 'תמונה ראשית אחת מסומנת במפורש; התמונה השנייה נשארת משנית.',
      icon: 'check' as SemanticIconName,
    };
  };

  const topStatus = getTopStatus();

  if (loading && photos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tokens.gold.border.strong} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {globalError ? (
        <View style={styles.globalErrorCard}>
          <AppIcon name="alert-circle" size={24} color={tokens.status.error.onIvory} />
          <Text style={styles.globalErrorText}>{globalError}</Text>
        </View>
      ) : null}

      {/* 1. Photo Status Surface */}
      <View style={styles.topStatusCard}>
        <View style={styles.statusIconContainer}>
          <AppIcon name={topStatus.icon} size={24} color={tokens.gold.border.strong} />
        </View>
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusTitle}>{topStatus.title}</Text>
          <Text style={styles.statusBody}>{topStatus.body}</Text>
        </View>
      </View>

      {/* 2. Count Surface */}
      <View style={styles.countCard}>
        <Text style={styles.countTitle}>התמונות שלי</Text>
        <Text style={styles.countValue}>{photos.length} מתוך 2</Text>
        <Text style={styles.countBody}>
          {photos.length >= 2 ? 'הגעת למספר התמונות המרבי' : 'ניתן לשמור עד שתי תמונות'}
        </Text>
      </View>

      {/* 3. Photo Cards */}
      <View style={styles.photosList}>
        {photos.map(photo => {
          const isTarget = targetPhotoId === photo.id;
          const isDeleteLoading = operationType === 'delete' && isTarget;
          const isSetPrimaryLoading = operationType === 'setPrimary' && isTarget;
          const hasDeleteFailed = failedOperation === 'delete' && isTarget;
          const hasSetPrimaryFailed = failedOperation === 'setPrimary' && isTarget;
          const anyActionLoading = actionLoading;

          return (
            <View key={photo.id} style={styles.photoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconCircle}>
                  <AppIcon name={photo.isPrimary ? 'check' : 'camera'} size={20} color={tokens.gold.border.strong} />
                </View>
                <View style={styles.cardTitles}>
                  <Text style={styles.cardTitle}>{photo.isPrimary ? 'תמונה ראשית' : 'תמונה נוספת'}</Text>
                  <Text style={styles.cardSubtitle}>{photo.isPrimary ? 'התמונה הראשית התקפה' : 'תמונה שנייה בפרופיל'}</Text>
                </View>
              </View>

              <Image source={{ uri: getImageUrl(photo.imageUrl) }} style={photos.length === 1 ? styles.imageSingle : styles.imageDense} resizeMode="cover" />

              <View style={styles.actionsContainer}>
                {!photo.isPrimary && (
                  <View style={styles.actionWrap}>
                    <Button
                      label={isSetPrimaryLoading ? "מגדיר/ה כתמונה ראשית..." : "הגדרה כתמונה ראשית"}
                      iconStart="star"
                      variant="primary"
                      onPress={() => handleSetPrimary(photo.id)}
                      disabled={anyActionLoading}
                      loading={isSetPrimaryLoading}
                      style={styles.actionButton}
                    />
                  </View>
                )}
                <View style={styles.actionWrap}>
                  <Button
                    label={isDeleteLoading ? "מוחק/ת..." : "מחיקה"}
                    iconStart="trash"
                    variant="primary"
                    onPress={() => handleDelete(photo.id)}
                    disabled={anyActionLoading}
                    loading={isDeleteLoading}
                    style={styles.actionButton}
                  />
                </View>
              </View>

              {hasSetPrimaryFailed && (
                <View style={styles.errorBox}>
                  <AppIcon name="alert-circle" size={16} color={tokens.status.error.onIvory} />
                  <Text style={styles.errorBoxText}>הגדרת התמונה הראשית נכשלה. אפשר לנסות שוב.</Text>
                </View>
              )}
              {hasDeleteFailed && (
                <View style={styles.errorBox}>
                  <AppIcon name="alert-circle" size={16} color={tokens.status.error.onIvory} />
                  <Text style={styles.errorBoxText}>מחיקת התמונה נכשלה. אפשר לנסות שוב.</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Upload Surface */}
        {photos.length < 2 && (
          failedOperation === 'upload' ? (
            <View style={styles.uploadFailureCard}>
              <View style={styles.cardHeader}>
                <View style={styles.errorIconCircle}>
                  <AppIcon name="alert-circle" size={20} color={tokens.status.error.onIvory} />
                </View>
                <View style={styles.cardTitles}>
                  <Text style={styles.errorTitle}>העלאת התמונה נכשלה</Text>
                  <Text style={styles.errorBody}>
                    {photos.length === 0 ? 'אפשר לבחור תמונה ולנסות שוב.' : 'התמונה הקיימת נשמרה. אפשר לבחור תמונה ולנסות שוב.'}
                  </Text>
                </View>
              </View>
              <View style={styles.uploadButtonWrapper}>
                <Button
                  label={photos.length === 0 ? 'הוספת תמונה' : 'הוספת תמונה שנייה'}
                  iconStart="refresh"
                  visualAppearance="gold"
                  variant="primary"
                  onPress={handlePickAndUpload}
                  disabled={actionLoading}
                  loading={operationType === 'upload'}
                  fullWidth
                />
              </View>
            </View>
          ) : (
            <View style={photos.length === 0 ? styles.emptyStateCard : styles.photoCard}>
              {photos.length === 0 ? (
                <View style={styles.emptyStateContent}>
                  <View style={styles.emptyStateIconWrapper}>
                    <AppIcon name="camera" size={32} color={tokens.gold.border.strong} />
                  </View>
                  <Text style={styles.emptyStateTitle}>עדיין אין תמונות</Text>
                  <Text style={styles.emptyStateBody}>
                    אפשר להעלות עד שתי תמונות. התמונה הראשונה תהפוך אוטומטית לתמונה הראשית.
                  </Text>
                </View>
              ) : (
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconCircle}>
                    <AppIcon name="camera" size={20} color={tokens.gold.border.strong} />
                  </View>
                  <View style={styles.cardTitles}>
                    <Text style={styles.cardTitle}>אפשר להוסיף תמונה נוספת</Text>
                    <Text style={styles.cardSubtitle}>לאחר ההעלאה יוצגו לכל היותר שתי תמונות.</Text>
                  </View>
                </View>
              )}

              <View style={styles.uploadButtonWrapper}>
                <Button
                  label={photos.length === 0 ? 'הוספת תמונה' : 'הוספת תמונה שנייה'}
                  iconStart="plus"
                  visualAppearance="gold"
                  variant="primary"
                  onPress={handlePickAndUpload}
                  disabled={actionLoading}
                  loading={operationType === 'upload'}
                  fullWidth
                />
              </View>
            </View>
          )
        )}
      </View>

      {/* 4. Operation Feedback Notices */}
      {operationType === 'delete' && (
        <View style={styles.boundedNoticeSurface}>
          <ActivityIndicator size="small" color={tokens.gold.border.strong} />
          <Text style={styles.boundedNoticeText}>מחיקת התמונה מתבצעת. פעולות נוספות מושהות עד לסיום.</Text>
        </View>
      )}
      {operationType === 'setPrimary' && (
        <View style={styles.boundedNoticeSurface}>
          <ActivityIndicator size="small" color={tokens.gold.border.strong} />
          <Text style={styles.boundedNoticeText}>מעדכן/ת את התמונה הראשית. אין שינוי חזותי מוקדם.</Text>
        </View>
      )}
      {photos.length >= 2 && !operationType && (
        <View style={styles.boundedNoticeErrorSurface}>
          <AppIcon name="alert-circle" size={16} color={tokens.gold.border.strong} />
          <Text style={styles.boundedNoticeErrorText}>לא ניתן להעלות תמונה שלישית.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: tokens.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    gap: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  globalErrorCard: {
    backgroundColor: tokens.visual.surface.ivory,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.status.error.onIvory,
  },
  globalErrorText: {
    flex: 1,
    fontSize: 16,
    color: tokens.status.error.onIvory,
    textAlign: 'right',
  },
  topStatusCard: {
    backgroundColor: tokens.visual.surface.ivory,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.gold.border.strong,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.gold.border.strong,
  },
  statusTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.text.onIvory.primary,
    marginBottom: tokens.spacing.xs,
    textAlign: 'right',
  },
  statusBody: {
    fontSize: 14,
    color: tokens.text.onIvory.secondary,
    textAlign: 'right',
    lineHeight: 20,
  },
  countCard: {
    backgroundColor: tokens.visual.surface.ivory,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.gold.border.strong,
  },
  countTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.text.onIvory.primary,
    marginBottom: tokens.spacing.xs,
  },
  countValue: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.gold.border.strong,
    marginBottom: tokens.spacing.xs,
  },
  countBody: {
    fontSize: 14,
    color: tokens.text.onIvory.secondary,
  },
  photosList: {
    gap: tokens.spacing.lg,
  },
  photoCard: {
    backgroundColor: tokens.visual.surface.ivory,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.gold.border.strong,
  },
  emptyStateCard: {
    backgroundColor: tokens.visual.surface.ivory,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.xl,
    gap: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.gold.border.strong,
    alignItems: 'center',
  },
  emptyStateContent: {
    alignItems: 'center',
    width: '100%',
    gap: tokens.spacing.sm,
  },
  emptyStateIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: tokens.gold.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.sm,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.text.onIvory.primary,
    textAlign: 'center',
  },
  emptyStateBody: {
    fontSize: 14,
    color: tokens.text.onIvory.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.gold.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitles: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.text.onIvory.primary,
    textAlign: 'right',
  },
  cardSubtitle: {
    fontSize: 14,
    color: tokens.text.onIvory.secondary,
    textAlign: 'right',
  },
  imageSingle: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.visual.surface.ivoryMuted,
  },
  imageDense: {
    width: '100%',
    aspectRatio: 10 / 3,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.visual.surface.ivoryMuted,
  },
  actionsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  actionWrap: {
    flex: 1,
    minWidth: 120,
  },
  actionButton: {
    flex: 1,
  },
  uploadButtonWrapper: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: tokens.visual.surface.ivoryHighlight,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    gap: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.status.error.onIvory,
  },
  errorBoxText: {
    color: tokens.status.error.onIvory,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  uploadErrorBox: {
    flexDirection: 'row-reverse',
    backgroundColor: tokens.visual.surface.ivoryHighlight,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.status.error.onIvory,
    gap: tokens.spacing.md,
    alignItems: 'flex-start',
  },
  errorTextCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  errorTitle: {
    color: tokens.status.error.onIvory,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'right',
  },
  errorBody: {
    color: tokens.text.onIvory.primary,
    fontSize: 14,
    textAlign: 'right',
  },
  boundedNoticeSurface: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    padding: tokens.spacing.md,
    backgroundColor: tokens.visual.surface.dark,
    borderWidth: 1,
    borderColor: tokens.gold.border.strong,
    borderRadius: tokens.radii.md,
  },
  boundedNoticeText: {
    color: tokens.text.onDark.primary,
    fontSize: 14,
  },
  boundedNoticeErrorSurface: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    padding: tokens.spacing.md,
    backgroundColor: tokens.visual.surface.dark,
    borderWidth: 1,
    borderColor: tokens.gold.border.strong,
    borderRadius: tokens.radii.md,
  },
  boundedNoticeErrorText: {
    color: tokens.text.onDark.primary,
    fontSize: 14,
  },
  uploadFailureCard: {
    backgroundColor: tokens.visual.surface.ivory,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.status.error.onIvory,
  },
  errorIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.status.error.onIvory,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
