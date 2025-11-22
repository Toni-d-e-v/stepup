import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { AuthResponse, User } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

    return response;
  },

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'professor';
    school?: string;
    class?: string;
    generation?: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);

    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

    return response;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  async getCurrentUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};
