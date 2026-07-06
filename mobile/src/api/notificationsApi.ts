import apiClient from './client';
import {
  NotificationPageResponse,
  UnreadNotificationCountResponse,
  NotificationResponse,
} from '../types/api';

export const notificationsApi = {
  getNotifications: async (page = 0, size = 30): Promise<NotificationPageResponse> => {
    const response = await apiClient.get<NotificationPageResponse>('/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  getUnreadNotificationCount: async (): Promise<UnreadNotificationCountResponse> => {
    const response = await apiClient.get<UnreadNotificationCountResponse>('/notifications/unread-count');
    return response.data;
  },

  markNotificationRead: async (notificationId: number): Promise<NotificationResponse> => {
    const response = await apiClient.patch<NotificationResponse>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllNotificationsRead: async (): Promise<UnreadNotificationCountResponse> => {
    const response = await apiClient.patch<UnreadNotificationCountResponse>('/notifications/read-all');
    return response.data;
  },
};
