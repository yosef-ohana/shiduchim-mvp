import apiClient from './client';
import { JoinWeddingRequest, JoinWeddingResponse, ValidateWeddingCodeRequest, ValidateWeddingCodeResponse, UserWeddingResponse } from '../types/api';

export const joinWedding = async (request: JoinWeddingRequest): Promise<JoinWeddingResponse> => {
  const response = await apiClient.post<JoinWeddingResponse>('/weddings/join', request);
  return response.data;
};

export const validateCode = async (request: ValidateWeddingCodeRequest): Promise<ValidateWeddingCodeResponse> => {
  const response = await apiClient.post<ValidateWeddingCodeResponse>('/weddings/validate-code', request);
  return response.data;
};

export const getMyWeddings = async (): Promise<UserWeddingResponse[]> => {
  const response = await apiClient.get<UserWeddingResponse[]>('/weddings/my');
  return response.data.map(w => ({
    ...w,
    isWeddingPoolEligible: w.isWeddingPoolEligible ?? w.weddingPoolEligible ?? false
  }));
};
