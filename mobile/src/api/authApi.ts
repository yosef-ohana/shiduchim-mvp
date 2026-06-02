import apiClient from './client';
import { RegisterRequest, LoginRequest, AuthResponse, MeResponse } from '../types/api';

export const registerUser = async (request: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', request);
  return response.data;
};

export const loginUser = async (request: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', request);
  return response.data;
};

export const getMe = async (): Promise<MeResponse> => {
  const response = await apiClient.get<MeResponse>('/users/me');
  return response.data;
};
