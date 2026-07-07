import apiClient from './client';
import {
  ProfileMeResponse,
  BasicProfileRequest,
  BasicProfileResponse,
  FullProfileRequest,
  FullProfileResponse,
  PublicProfileResponse,
  UnifiedProfileUpdateRequest,
  CandidateProfileSourceType,
  PoolType,
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

export interface ProfileSourceDescriptor {
  sourceType?: CandidateProfileSourceType;
  sourceId?: number;
  poolType?: PoolType;
  weddingId?: number;
}

export const getPublicProfile = async (
  userId: number,
  source?: ProfileSourceDescriptor
): Promise<PublicProfileResponse> => {
  const queryParams: Record<string, any> = {};
  if (source) {
    if (source.sourceType !== undefined && source.sourceType !== null) {
      queryParams.sourceType = source.sourceType;
    }
    if (source.sourceId !== undefined && source.sourceId !== null) {
      queryParams.sourceId = source.sourceId;
    }
    if (source.poolType !== undefined && source.poolType !== null) {
      queryParams.poolType = source.poolType;
    }
    if (source.weddingId !== undefined && source.weddingId !== null) {
      queryParams.weddingId = source.weddingId;
    }
  }
  const response = await apiClient.get<PublicProfileResponse>(`/profiles/${userId}`, {
    params: queryParams,
  });
  return response.data;
};

