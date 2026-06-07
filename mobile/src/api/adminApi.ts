import apiClient from './client';
import { 
  AdminUserResponse, 
  AdminWeddingResponse, 
  CreateEventManagerRequest 
} from '../types/api';

export const adminApi = {
  createEventManager: async (request: CreateEventManagerRequest): Promise<AdminUserResponse> => {
    const response = await apiClient.post<AdminUserResponse>('/api/admin/event-managers', request);
    return response.data;
  },

  getUsers: async (): Promise<AdminUserResponse[]> => {
    const response = await apiClient.get<AdminUserResponse[]>('/api/admin/users');
    return response.data;
  },

  blockUser: async (userId: number): Promise<AdminUserResponse> => {
    const response = await apiClient.patch<AdminUserResponse>(`/api/admin/users/${userId}/block`);
    return response.data;
  },

  unblockUser: async (userId: number): Promise<AdminUserResponse> => {
    const response = await apiClient.patch<AdminUserResponse>(`/api/admin/users/${userId}/unblock`);
    return response.data;
  },

  getWeddings: async (): Promise<AdminWeddingResponse[]> => {
    const response = await apiClient.get<AdminWeddingResponse[]>('/api/admin/weddings');
    return response.data;
  },
};
