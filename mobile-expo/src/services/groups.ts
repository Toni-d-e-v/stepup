import api from './api';
import { Group, LeaderboardEntry } from '../types';

export const groupsService = {
  async getGroups(params?: {
    type?: string;
    search?: string;
  }): Promise<Group[]> {
    return await api.get<Group[]>('/groups', { params });
  },

  async getGroup(id: string): Promise<Group> {
    return await api.get<Group>(`/groups/${id}`);
  },

  async joinGroup(id: string): Promise<Group> {
    return await api.post<Group>(`/groups/${id}/join`);
  },

  async leaveGroup(id: string): Promise<void> {
    await api.post(`/groups/${id}/leave`);
  },

  async getGroupLeaderboard(id: string): Promise<LeaderboardEntry[]> {
    return await api.get<LeaderboardEntry[]>(`/groups/${id}/leaderboard`);
  },
};
