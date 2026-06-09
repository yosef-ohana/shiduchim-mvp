import apiClient from './client';
import { JoinWeddingRequest, JoinWeddingResponse, ValidateWeddingCodeRequest, ValidateWeddingCodeResponse } from '../types/api';

export const joinWedding = async (request: JoinWeddingRequest): Promise<JoinWeddingResponse> => {
  const response = await apiClient.post<JoinWeddingResponse>('/weddings/join', request);
  return response.data;
};

export const validateCode = async (request: ValidateWeddingCodeRequest): Promise<ValidateWeddingCodeResponse> => {
  const response = await apiClient.post<ValidateWeddingCodeResponse>('/weddings/validate-code', request);
  return response.data;
};
