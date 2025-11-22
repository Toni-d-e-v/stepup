import api from './api';
import { StepEntry, StepStats } from '../types';

export const stepsService = {
  async addSteps(steps: number, source: 'manual' | 'auto' = 'auto'): Promise<StepEntry> {
    return await api.post<StepEntry>('/steps', {
      steps,
      source,
      date: new Date().toISOString(),
    });
  },

  async getSteps(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<StepEntry[]> {
    return await api.get<StepEntry[]>('/steps', { params });
  },

  async getStepStats(): Promise<StepStats> {
    return await api.get<StepStats>('/steps/stats');
  },

  async getTodaySteps(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const steps = await api.get<StepEntry[]>('/steps', {
      params: {
        startDate: today,
        endDate: today,
      },
    });

    return steps.reduce((total, entry) => total + entry.steps, 0);
  },
};
