import apiClient from './client';
import { CreateUserReportRequest, MyUserReportResponse } from '../types/api';

export const reportsApi = {
  createReport: async (reportedUserId: number, request: CreateUserReportRequest): Promise<void> => {
    await apiClient.post(`/reports/users/${reportedUserId}`, request);
  },

  getMyReports: async (): Promise<MyUserReportResponse[]> => {
    const response = await apiClient.get<MyUserReportResponse[]>('/reports/my');
    return response.data;
  },
};
