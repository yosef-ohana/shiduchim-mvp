import apiClient from './client';
import { ActionResponse, UnfreezeResponse, PoolType } from '../types/api';

export interface ActionParams {
  poolType: PoolType;
  weddingId?: number;
}

export const likeUser = async (targetUserId: number, params: ActionParams): Promise<ActionResponse> => {
  const queryParams: any = { poolType: params.poolType };
  if (params.poolType === 'WEDDING' && params.weddingId !== undefined) {
    queryParams.weddingId = params.weddingId;
  }
  const response = await apiClient.post<ActionResponse>(`/actions/${targetUserId}/like`, null, {
    params: queryParams,
  });
  return response.data;
};

export const dislikeUser = async (targetUserId: number, params: ActionParams): Promise<ActionResponse> => {
  const queryParams: any = { poolType: params.poolType };
  if (params.poolType === 'WEDDING' && params.weddingId !== undefined) {
    queryParams.weddingId = params.weddingId;
  }
  const response = await apiClient.post<ActionResponse>(`/actions/${targetUserId}/dislike`, null, {
    params: queryParams,
  });
  return response.data;
};

export const freezeUser = async (targetUserId: number, params: ActionParams): Promise<ActionResponse> => {
  const queryParams: any = { poolType: params.poolType };
  if (params.poolType === 'WEDDING' && params.weddingId !== undefined) {
    queryParams.weddingId = params.weddingId;
  }
  const response = await apiClient.post<ActionResponse>(`/actions/${targetUserId}/freeze`, null, {
    params: queryParams,
  });
  return response.data;
};

export const unfreezeUser = async (targetUserId: number, params: ActionParams): Promise<UnfreezeResponse> => {
  const queryParams: any = { poolType: params.poolType };
  if (params.poolType === 'WEDDING' && params.weddingId !== undefined) {
    queryParams.weddingId = params.weddingId;
  }
  const response = await apiClient.delete<UnfreezeResponse>(`/actions/${targetUserId}/freeze`, {
    params: queryParams,
  });
  return response.data;
};
