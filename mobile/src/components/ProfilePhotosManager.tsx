import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { AppButton } from './AppButton';
import { theme } from '../theme/theme';
import { getMyPhotos, uploadPhoto, setPrimaryPhoto, deletePhoto } from '../api/photosApi';
import { PhotoResponse } from '../types/api';
import { getImageUrl } from '../utils/imageUrl';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage } from '../utils/errorMessage';

interface ProfilePhotosManagerProps {
  onPhotosChanged?: () => void;
}

export const ProfilePhotosManager: React.FC<ProfilePhotosManagerProps> = ({ onPhotosChanged }) => {
  const { refreshMe } = useAuth();
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyPhotos();
      setPhotos(data);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'טעינת התמונות נכשלה.'));
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
    if (photos.length >= 2) {
      return;
    }
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
        setError('');
        await uploadPhoto(asset.uri, asset.mimeType || 'image/jpeg', asset.fileName || 'profile-photo.jpg');
        await triggerChange();
      } catch (err: any) {
        const status = err.response?.status;
        const message = err.response?.data?.message || '';
        if (status === 409 || message.toLowerCase().includes('maximum of') || message.toLowerCase().includes('photos allowed') || message.toLowerCase().includes('limit')) {
          setError('באפשרותך להעלות עד 2 תמונות.');
        } else {
          setError('העלאת התמונה נכשלה. אנא נסה שוב.');
        }
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      setActionLoading(true);
      setError('');
      await setPrimaryPhoto(photoId);
      await triggerChange();
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'הגדרת התמונה הראשית נכשלה.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    try {
      setActionLoading(true);
      setError('');
      await deletePhoto(photoId);
      await triggerChange();
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'מחיקת התמונה נכשלה.'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>תמונות הפרופיל</Text>
      <Text style={styles.helperText}>תמונה ראשית נדרשת כדי להופיע במאגרים.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <View style={styles.photoList}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoCard}>
              <Image source={{ uri: getImageUrl(photo.imageUrl) }} style={styles.image} />
              <View style={styles.photoInfo}>
                <Text style={styles.photoText}>מיקום: {photo.orderIndex}</Text>
                {photo.isPrimary && <Text style={styles.primaryBadge}>תמונה ראשית</Text>}
              </View>
              <View style={styles.actions}>
                {!photo.isPrimary && (
                  <AppButton
                    title="הגדרה כתמונה ראשית"
                    onPress={() => handleSetPrimary(photo.id)}
                    disabled={actionLoading}
                    style={styles.actionButton}
                  />
                )}
                <AppButton
                  title="מחיקה"
                  onPress={() => handleDelete(photo.id)}
                  disabled={actionLoading}
                  style={[styles.actionButton, styles.deleteButton]}
                />
              </View>
            </View>
          ))}
          {photos.length === 0 && (
            <Text style={styles.emptyText}>אין תמונות עדיין. ניתן להעלות עד שתי תמונות.</Text>
          )}
        </View>
      )}

      <AppButton
        title="בחירת והעלאת תמונה"
        onPress={handlePickAndUpload}
        loading={actionLoading}
        disabled={photos.length >= 2}
        style={styles.uploadButton}
      />
      {photos.length >= 2 && (
        <Text style={styles.limitText}>הגעת לגבול המקסימלי של 2 תמונות. לא ניתן להעלות תמונות נוספות.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  photoList: {
    marginBottom: theme.spacing.m,
  },
  photoCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    backgroundColor: theme.colors.border,
  },
  photoInfo: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  photoText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  primaryBadge: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.surface,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.s,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'column',
    gap: theme.spacing.s,
  },
  actionButton: {
    marginVertical: 4,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  uploadButton: {
    marginTop: theme.spacing.s,
  },
  helperText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  limitText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.s,
    fontWeight: '500',
  },
});
