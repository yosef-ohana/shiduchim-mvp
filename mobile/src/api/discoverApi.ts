import apiClient from './client';
import { DiscoverPool, DiscoverResponse } from '../types/api';

export interface DiscoverParams {
  pool: DiscoverPool;
  weddingId?: number;
  limit?: number;
}

export const getDiscoverCandidates = async (params: DiscoverParams): Promise<DiscoverResponse> => {
  const queryParams: any = {
    pool: params.pool,
    limit: params.limit ?? 20,
  };

  if (params.pool === 'WEDDING' && params.weddingId !== undefined) {
    queryParams.weddingId = params.weddingId;
  }

  const response = await apiClient.get<DiscoverResponse>('/discover', {
    params: queryParams,
  });
  return response.data;
};
