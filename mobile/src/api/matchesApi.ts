import apiClient from './client';
import { MatchResponse, MatchDetailsResponse } from '../types/api';

export const getMatches = async (): Promise<MatchResponse[]> => {
  const response = await apiClient.get<MatchResponse[]>('/matches');
  return response.data;
};

export const getMatchDetails = async (matchId: number): Promise<MatchDetailsResponse> => {
  const response = await apiClient.get<MatchDetailsResponse>(`/matches/${matchId}`);
  return response.data;
};

export const cancelMatch = async (matchId: number): Promise<void> => {
  await apiClient.patch(`/matches/${matchId}/cancel`);
};
