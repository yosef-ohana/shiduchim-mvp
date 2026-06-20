import apiClient from './client';
import { 
  CreateProductFeedbackRequest, 
  ProductFeedbackListItemResponse, 
  ProductFeedbackDetailsResponse, 
  UpdateFeedbackStatusRequest 
} from '../types/apiProductFeedback';

export const productFeedbackApi = {
  createFeedback: async (data: CreateProductFeedbackRequest) => {
    const response = await apiClient.post<void>('/api/feedback', data);
    return response.data;
  },

  getAdminFeedbackList: async () => {
    const response = await apiClient.get<ProductFeedbackListItemResponse[]>('/api/admin/feedback');
    return response.data;
  },

  getAdminFeedbackDetails: async (feedbackId: number) => {
    const response = await apiClient.get<ProductFeedbackDetailsResponse>(`/api/admin/feedback/${feedbackId}`);
    return response.data;
  },

  updateAdminFeedbackStatus: async (feedbackId: number, data: UpdateFeedbackStatusRequest) => {
    const response = await apiClient.patch<void>(`/api/admin/feedback/${feedbackId}/status`, data);
    return response.data;
  }
};
