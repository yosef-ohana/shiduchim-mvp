import apiClient from './client';
import { ActionListItemResponse, LikedMeItemResponse, PoolType } from '../types/api';

export interface ListParams {
  poolType?: PoolType;
  weddingId?: number;
}

export const getLikes = async (params?: ListParams): Promise<ActionListItemResponse[]> => {
  const response = await apiClient.get<ActionListItemResponse[]>('/lists/likes', {
    params,
  });
  return response.data;
};

export const getDislikes = async (params?: ListParams): Promise<ActionListItemResponse[]> => {
  const response = await apiClient.get<ActionListItemResponse[]>('/lists/dislikes', {
    params,
  });
  return response.data;
};

export const getFreezes = async (params?: ListParams): Promise<ActionListItemResponse[]> => {
  const response = await apiClient.get<ActionListItemResponse[]>('/lists/freezes', {
    params,
  });
  return response.data;
};

export const getLikedMe = async (params?: ListParams): Promise<LikedMeItemResponse[]> => {
  const response = await apiClient.get<LikedMeItemResponse[]>('/lists/liked-me', {
    params,
  });
  return response.data;
};
