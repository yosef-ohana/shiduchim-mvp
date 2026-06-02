import apiClient from './client';
import { JoinWeddingRequest, JoinWeddingResponse } from '../types/api';

export const joinWedding = async (request: JoinWeddingRequest): Promise<JoinWeddingResponse> => {
  const response = await apiClient.post<JoinWeddingResponse>('/weddings/join', request);
  return response.data;
};
