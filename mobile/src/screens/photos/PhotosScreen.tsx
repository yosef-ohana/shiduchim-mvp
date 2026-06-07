import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { getMyPhotos, uploadPhoto, setPrimaryPhoto, deletePhoto } from '../../api/photosApi';
import { PhotoResponse } from '../../types/api';
import { getImageUrl } from '../../utils/imageUrl';
import { useAuth } from '../../context/AuthContext';

export const PhotosScreen = () => {
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
      setError(err.response?.data?.message || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [])
  );

  const handlePickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
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
        await uploadPhoto(asset.uri, asset.mimeType, asset.fileName || 'profile-photo.jpg');
        await loadPhotos();
        await refreshMe();
      } catch (err: any) {
        const status = err.response?.status;
        const message = err.response?.data?.message || '';
        if (status === 409 || message.toLowerCase().includes('maximum of') || message.toLowerCase().includes('photos allowed') || message.toLowerCase().includes('limit')) {
          setError('You can upload up to 2 photos.');
        } else {
          setError('Failed to upload photo. Please try again.');
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
      await loadPhotos();
      await refreshMe();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set primary photo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    try {
      setActionLoading(true);
      setError('');
      await deletePhoto(photoId);
      await loadPhotos();
      await refreshMe();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete photo');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Photos</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <View style={styles.photoList}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoCard}>
                <Image source={{ uri: getImageUrl(photo.imageUrl) }} style={styles.image} />
                <View style={styles.photoInfo}>
                  <Text style={styles.photoText}>Order: {photo.orderIndex}</Text>
                  {photo.isPrimary && <Text style={styles.primaryBadge}>Primary</Text>}
                </View>
                <View style={styles.actions}>
                  {!photo.isPrimary && (
                    <AppButton
                      title="Set Primary"
                      onPress={() => handleSetPrimary(photo.id)}
                      disabled={actionLoading}
                      style={styles.actionButton}
                    />
                  )}
                  <AppButton
                    title="Delete"
                    onPress={() => handleDelete(photo.id)}
                    disabled={actionLoading}
                    style={[styles.actionButton, styles.deleteButton]}
                  />
                </View>
              </View>
            ))}
            {photos.length === 0 && (
              <Text style={styles.emptyText}>No photos yet. Upload up to two photos.</Text>
            )}
          </View>
        )}

        <AppButton
          title="Pick and Upload Photo"
          onPress={handlePickAndUpload}
          loading={actionLoading}
          style={styles.uploadButton}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
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
    marginBottom: theme.spacing.xl,
  },
  photoList: {
    marginBottom: theme.spacing.xl,
  },
  photoCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    backgroundColor: theme.colors.border,
  },
  photoInfo: {
    flexDirection: 'row',
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
    marginTop: 'auto',
  },
});
