import apiClient from './client';
import { 
  AdminUserResponse, 
  AdminWeddingResponse, 
  AdminCreateWeddingRequest,
  AssignManagerRequest,
  CreateEventManagerRequest,
  WeddingInviteResponse,
  CreateWeddingInviteRequest,
  AdminDashboardResponse
} from '../types/api';

export const adminApi = {
  createEventManager: async (request: CreateEventManagerRequest): Promise<AdminUserResponse> => {
    const response = await apiClient.post<AdminUserResponse>('/admin/event-managers', request);
    return response.data;
  },

  getEventManagers: async (): Promise<AdminUserResponse[]> => {
    const response = await apiClient.get<AdminUserResponse[]>('/admin/event-managers');
    return response.data;
  },

  blockEventManager: async (id: number): Promise<AdminUserResponse> => {
    const response = await apiClient.patch<AdminUserResponse>(`/admin/event-managers/${id}/block`);
    return response.data;
  },

  unblockEventManager: async (id: number): Promise<AdminUserResponse> => {
    const response = await apiClient.patch<AdminUserResponse>(`/admin/event-managers/${id}/unblock`);
    return response.data;
  },

  deactivateEventManager: async (id: number): Promise<AdminUserResponse> => {
    const response = await apiClient.patch<AdminUserResponse>(`/admin/event-managers/${id}/deactivate`);
    return response.data;
  },

  getUsers: async (): Promise<AdminUserResponse[]> => {
    const response = await apiClient.get<AdminUserResponse[]>('/admin/users');
    return response.data;
  },

  blockUser: async (userId: number): Promise<AdminUserResponse> => {
    const response = await apiClient.patch<AdminUserResponse>(`/admin/users/${userId}/block`);
    return response.data;
  },

  unblockUser: async (userId: number): Promise<AdminUserResponse> => {
    const response = await apiClient.patch<AdminUserResponse>(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  getWeddings: async (): Promise<AdminWeddingResponse[]> => {
    const response = await apiClient.get<AdminWeddingResponse[]>('/admin/weddings');
    return response.data;
  },

  createWedding: async (request: AdminCreateWeddingRequest): Promise<AdminWeddingResponse> => {
    const response = await apiClient.post<AdminWeddingResponse>('/admin/weddings', request);
    return response.data;
  },

  assignManager: async (weddingId: number, request: AssignManagerRequest): Promise<AdminWeddingResponse> => {
    const response = await apiClient.patch<AdminWeddingResponse>(`/admin/weddings/${weddingId}/assign-manager`, request);
    return response.data;
  },

  assignSelfToWedding: async (weddingId: number): Promise<AdminWeddingResponse> => {
    const response = await apiClient.patch<AdminWeddingResponse>(`/admin/weddings/${weddingId}/assign-self`);
    return response.data;
  },

  closeWedding: async (weddingId: number): Promise<AdminWeddingResponse> => {
    const response = await apiClient.patch<AdminWeddingResponse>(`/admin/weddings/${weddingId}/close`);
    return response.data;
  },

  cancelWedding: async (weddingId: number): Promise<AdminWeddingResponse> => {
    const response = await apiClient.patch<AdminWeddingResponse>(`/admin/weddings/${weddingId}/cancel`);
    return response.data;
  },

  getInvites: async (weddingId: number): Promise<WeddingInviteResponse[]> => {
    const response = await apiClient.get<WeddingInviteResponse[]>(`/event-manager/weddings/${weddingId}/invites`);
    return response.data;
  },

  createInvite: async (weddingId: number, data: CreateWeddingInviteRequest): Promise<WeddingInviteResponse> => {
    const response = await apiClient.post<WeddingInviteResponse>(`/event-manager/weddings/${weddingId}/invites`, data);
    return response.data;
  },

  cancelInvite: async (weddingId: number, inviteId: number): Promise<WeddingInviteResponse> => {
    const response = await apiClient.patch<WeddingInviteResponse>(`/event-manager/weddings/${weddingId}/invites/${inviteId}/cancel`);
    return response.data;
  },

  restoreInvite: async (weddingId: number, inviteId: number): Promise<WeddingInviteResponse> => {
    const response = await apiClient.patch<WeddingInviteResponse>(`/event-manager/weddings/${weddingId}/invites/${inviteId}/restore`);
    return response.data;
  },

  getDashboard: async (): Promise<AdminDashboardResponse> => {
    const response = await apiClient.get<AdminDashboardResponse>('/admin/dashboard');
    return response.data;
  },
};

