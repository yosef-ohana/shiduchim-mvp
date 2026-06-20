import apiClient from './client';
import {
  WeddingResponse,
  WeddingCreateRequest,
  ParticipantResponse,
  AddParticipantRequest,
  CreateWeddingInviteRequest,
  WeddingInviteResponse,
} from '../types/api';

export const getEventManagerWeddings = async (): Promise<WeddingResponse[]> => {
  const response = await apiClient.get<WeddingResponse[]>('/event-manager/weddings');
  return response.data;
};

export const createWedding = async (data: WeddingCreateRequest): Promise<WeddingResponse> => {
  const response = await apiClient.post<WeddingResponse>('/event-manager/weddings', data);
  return response.data;
};

export const getEventManagerWedding = async (id: number): Promise<WeddingResponse> => {
  const response = await apiClient.get<WeddingResponse>(`/event-manager/weddings/${id}`);
  return response.data;
};

export const getParticipants = async (weddingId: number): Promise<ParticipantResponse[]> => {
  const response = await apiClient.get<ParticipantResponse[]>(`/event-manager/weddings/${weddingId}/participants`);
  return response.data;
};

export const addParticipant = async (weddingId: number, data: AddParticipantRequest): Promise<ParticipantResponse> => {
  const response = await apiClient.post<ParticipantResponse>(`/event-manager/weddings/${weddingId}/participants`, data);
  return response.data;
};

export const removeParticipant = async (weddingId: number, userId: number): Promise<ParticipantResponse> => {
  const response = await apiClient.delete<ParticipantResponse>(`/event-manager/weddings/${weddingId}/participants/${userId}`);
  return response.data;
};

export const closeWedding = async (id: number): Promise<WeddingResponse> => {
  const response = await apiClient.patch<WeddingResponse>(`/event-manager/weddings/${id}/close`);
  return response.data;
};

export const cancelWedding = async (id: number): Promise<WeddingResponse> => {
  const response = await apiClient.patch<WeddingResponse>(`/event-manager/weddings/${id}/cancel`);
  return response.data;
};

export const createInvite = async (weddingId: number, data: CreateWeddingInviteRequest): Promise<WeddingInviteResponse> => {
  const response = await apiClient.post<WeddingInviteResponse>(`/event-manager/weddings/${weddingId}/invites`, data);
  return response.data;
};

export const getInvites = async (weddingId: number): Promise<WeddingInviteResponse[]> => {
  const response = await apiClient.get<WeddingInviteResponse[]>(`/event-manager/weddings/${weddingId}/invites`);
  return response.data;
};

export const cancelInvite = async (weddingId: number, inviteId: number): Promise<WeddingInviteResponse> => {
  const response = await apiClient.patch<WeddingInviteResponse>(`/event-manager/weddings/${weddingId}/invites/${inviteId}/cancel`);
  return response.data;
};

export const restoreInvite = async (weddingId: number, inviteId: number): Promise<WeddingInviteResponse> => {
  const response = await apiClient.patch<WeddingInviteResponse>(`/event-manager/weddings/${weddingId}/invites/${inviteId}/restore`);
  return response.data;
};

export const uploadWeddingBackground = async (weddingId: number, imageUri: string, mimeType?: string, fileName?: string): Promise<WeddingResponse> => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: mimeType || 'image/jpeg',
    name: fileName || 'wedding-bg.jpg',
  } as any);

  const response = await apiClient.post<WeddingResponse>(`/event-manager/weddings/${weddingId}/background`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteWeddingBackground = async (weddingId: number): Promise<WeddingResponse> => {
  const response = await apiClient.delete<WeddingResponse>(`/event-manager/weddings/${weddingId}/background`);
  return response.data;
};

