import apiClient from './client';
import { ConversationResponse, UnreadCountResponse } from '../types/api';

export const getConversations = async (): Promise<ConversationResponse[]> => {
  const response = await apiClient.get<ConversationResponse[]>('/chats/conversations');
  return response.data;
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await apiClient.get<UnreadCountResponse>('/chats/unread-count');
  return response.data;
};
