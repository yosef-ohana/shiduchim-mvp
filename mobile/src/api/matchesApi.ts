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
