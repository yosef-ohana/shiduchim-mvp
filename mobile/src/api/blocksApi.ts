import client from './client';
import { BlockedUserResponse } from '../types/api';

export const blockUser = async (targetUserId: number): Promise<void> => {
  await client.post(`/blocks/${targetUserId}`);
};

export const unblockUser = async (targetUserId: number): Promise<void> => {
  await client.patch(`/blocks/${targetUserId}/unblock`);
};

export const getBlockedUsers = async (): Promise<BlockedUserResponse[]> => {
  const response = await client.get<BlockedUserResponse[]>('/blocks');
  return response.data;
};
