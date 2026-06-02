import apiClient from './client';
import { ChatMessagesResponse, ChatMessageResponse } from '../types/api';

export const getChatMessages = async (matchId: number): Promise<ChatMessagesResponse> => {
  const response = await apiClient.get<ChatMessagesResponse>(`/matches/${matchId}/messages`);
  return response.data;
};

export const sendChatMessage = async (matchId: number, content: string): Promise<ChatMessageResponse> => {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error('Message content cannot be empty');
  }
  const response = await apiClient.post<ChatMessageResponse>(`/matches/${matchId}/messages`, {
    content: trimmed,
  });
  return response.data;
};
