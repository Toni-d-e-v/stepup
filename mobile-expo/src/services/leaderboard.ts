import api from './api';
import { LeaderboardEntry } from '../types';

export const leaderboardService = {
  async getDailyLeaderboard(groupId?: string): Promise<LeaderboardEntry[]> {
    return await api.get<LeaderboardEntry[]>('/leaderboard/daily', {
      params: groupId ? { groupId } : {},
    });
  },

  async getWeeklyLeaderboard(groupId?: string): Promise<LeaderboardEntry[]> {
    return await api.get<LeaderboardEntry[]>('/leaderboard/weekly', {
      params: groupId ? { groupId } : {},
    });
  },

  async getMonthlyLeaderboard(groupId?: string): Promise<LeaderboardEntry[]> {
    return await api.get<LeaderboardEntry[]>('/leaderboard/monthly', {
      params: groupId ? { groupId } : {},
    });
  },
};
