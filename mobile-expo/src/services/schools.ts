import api from './api';
import { School } from '../types';

export const schoolsService = {
  async getSchools(): Promise<School[]> {
    return await api.get<School[]>('/schools');
  },

  async getSchool(id: string): Promise<School> {
    return await api.get<School>(`/schools/${id}`);
  },
};
