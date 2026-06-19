import apiClient from './client';
import { CreateUserReportRequest } from '../types/api';

export const reportsApi = {
  createReport: async (reportedUserId: number, request: CreateUserReportRequest): Promise<void> => {
    await apiClient.post(`/reports/users/${reportedUserId}`, request);
  },
};
