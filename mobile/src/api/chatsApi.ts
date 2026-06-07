import apiClient from './client';
import { ConversationResponse } from '../types/api';

export const getConversations = async (): Promise<ConversationResponse[]> => {
  const response = await apiClient.get<ConversationResponse[]>('/chats/conversations');
  return response.data;
};
