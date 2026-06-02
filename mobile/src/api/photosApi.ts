import apiClient from './client';
import { PhotoResponse, PhotoUploadResponse } from '../types/api';

export const getMyPhotos = async (): Promise<PhotoResponse[]> => {
  const response = await apiClient.get<PhotoResponse[]>('/api/photos/me');
  return response.data;
};

export const uploadPhoto = async (imageUri: string, mimeType?: string, fileName?: string): Promise<PhotoUploadResponse> => {
  const formData = new FormData();
  
  formData.append('image', {
    uri: imageUri,
    type: mimeType || 'image/jpeg',
    name: fileName || 'profile-photo.jpg',
  } as any);

  const response = await apiClient.post<PhotoUploadResponse>('/api/photos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const setPrimaryPhoto = async (photoId: number): Promise<PhotoResponse> => {
  const response = await apiClient.put<PhotoResponse>(`/api/photos/${photoId}/primary`);
  return response.data;
};

export const deletePhoto = async (photoId: number): Promise<void> => {
  await apiClient.delete(`/api/photos/${photoId}`);
};
