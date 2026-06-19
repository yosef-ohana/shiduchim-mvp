import apiClient from './client';
import { 
  OpeningConversationSummaryResponse,
  OpeningConversationDetailsResponse,
  SendOpeningMessageRequest,
  ReplyOpeningMessageRequest,
  OpeningReplyResponse
} from '../types/api';

export const sendOpeningMessage = async (targetUserId: number, request: SendOpeningMessageRequest): Promise<{ conversationId: number, message: string }> => {
  const response = await apiClient.post(`/opening-messages/${targetUserId}`, request);
  return response.data;
};

export const getInboxOpeningMessages = async (): Promise<OpeningConversationSummaryResponse[]> => {
  const response = await apiClient.get('/opening-messages/inbox');
  return response.data;
};

export const getSentOpeningMessages = async (): Promise<OpeningConversationSummaryResponse[]> => {
  const response = await apiClient.get('/opening-messages/sent');
  return response.data;
};

export const getOpeningConversationDetails = async (conversationId: number): Promise<OpeningConversationDetailsResponse> => {
  const response = await apiClient.get(`/opening-messages/${conversationId}`);
  return response.data;
};

export const replyToOpeningMessage = async (conversationId: number, request: ReplyOpeningMessageRequest): Promise<OpeningReplyResponse> => {
  const response = await apiClient.post(`/opening-messages/${conversationId}/messages`, request);
  return response.data;
};
