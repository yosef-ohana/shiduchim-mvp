import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppButton } from './AppButton';
import { theme } from '../theme/theme';
import { getImageUrl } from '../utils/imageUrl';

interface WeddingBackgroundManagerProps {
  backgroundImageUrl?: string | null;
  onUpload: (uri: string, mimeType?: string, fileName?: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const WeddingBackgroundManager: React.FC<WeddingBackgroundManagerProps> = ({
  backgroundImageUrl,
  onUpload,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePickAndUpload = async () => {
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
        setLoading(true);
        await onUpload(asset.uri, asset.mimeType, asset.fileName || 'wedding-bg.jpg');
      } catch (err) {
        // Let parent handle or show error via Alert
        Alert.alert('שגיאה', 'העלאת תמונת הרקע נכשלה.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'הסרת רקע',
      'האם אתה בטוח שברצונך להסיר את תמונת הרקע של החתונה?',
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'הסרה', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await onDelete();
            } catch (err) {
              Alert.alert('שגיאה', 'מחיקת תמונת הרקע נכשלה.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>תמונת רקע</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <View>
          {backgroundImageUrl ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: getImageUrl(backgroundImageUrl) }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.actionsContainer}>
                <AppButton 
                  title="החלפת רקע" 
                  onPress={handlePickAndUpload} 
                  style={styles.actionButton} 
                />
                <AppButton 
                  title="הסרת רקע" 
                  onPress={handleDelete} 
                  style={[styles.actionButton, styles.deleteButton]} 
                />
              </View>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>לא הוגדרה תמונת רקע</Text>
              <AppButton 
                title="העלאת רקע" 
                onPress={handlePickAndUpload} 
                style={styles.uploadButton} 
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.m,
  },
  loader: {
    marginVertical: theme.spacing.l,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.border,
  },
  actionsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  noImageContainer: {
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: '#F5F5F5',
    borderRadius: theme.borderRadius.s,
  },
  noImageText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
  },
  uploadButton: {
    minWidth: 150,
  },
});
