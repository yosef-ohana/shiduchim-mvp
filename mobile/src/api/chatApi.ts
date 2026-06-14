import apiClient from './client';
import { ChatMessagesResponse, ChatMessageResponse, UnreadCountResponse } from '../types/api';

export const getChatMessages = async (matchId: number): Promise<ChatMessagesResponse> => {
  const response = await apiClient.get<ChatMessagesResponse>(`/matches/${matchId}/messages`);
  return response.data;
};

export const sendChatMessage = async (matchId: number, content: string): Promise<ChatMessageResponse> => {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error('תוכן ההודעה לא יכול להיות ריק');
  }
  const response = await apiClient.post<ChatMessageResponse>(`/matches/${matchId}/messages`, {
    content: trimmed,
  });
  return response.data;
};

export const markMessagesAsRead = async (matchId: number): Promise<UnreadCountResponse> => {
  const response = await apiClient.patch<UnreadCountResponse>(`/matches/${matchId}/messages/read`);
  return response.data;
};
