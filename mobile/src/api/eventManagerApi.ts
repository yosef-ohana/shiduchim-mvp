import apiClient from './client';
import {
  WeddingResponse,
  WeddingCreateRequest,
  ParticipantResponse,
  AddParticipantRequest,
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
