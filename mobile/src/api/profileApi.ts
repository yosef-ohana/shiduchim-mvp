import apiClient from './client';
import {
  ProfileMeResponse,
  BasicProfileRequest,
  BasicProfileResponse,
  FullProfileRequest,
  FullProfileResponse,
  PublicProfileResponse,
  UnifiedProfileUpdateRequest,
} from '../types/api';

export const getMyProfile = async (): Promise<ProfileMeResponse> => {
  const response = await apiClient.get<ProfileMeResponse>('/profile/me');
  return response.data;
};

export const updateUnifiedProfile = async (
  request: UnifiedProfileUpdateRequest
): Promise<ProfileMeResponse> => {
  const response = await apiClient.put<ProfileMeResponse>('/profile/me', request);
  return response.data;
};

export const updateBasicProfile = async (
  request: BasicProfileRequest
): Promise<BasicProfileResponse> => {
  const response = await apiClient.put<BasicProfileResponse>('/profile/basic', request);
  return response.data;
};

export const updateFullProfile = async (
  request: FullProfileRequest
): Promise<FullProfileResponse> => {
  const response = await apiClient.put<FullProfileResponse>('/profile/full', request);
  return response.data;
};

export const getPublicProfile = async (userId: number): Promise<PublicProfileResponse> => {
  const response = await apiClient.get<PublicProfileResponse>(`/profiles/${userId}`);
  return response.data;
};

