// Update this with your backend URL
export const API_BASE_URL = 'http://localhost:3000/api';

export const COLORS = {
  primary: '#6200ee',
  primaryDark: '#3700b3',
  secondary: '#03dac6',
  background: '#f5f5f5',
  surface: '#ffffff',
  error: '#b00020',
  success: '#4caf50',
  warning: '#ff9800',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e0e0e0',
  gradient: ['#6200ee', '#3700b3'],
};

export const STEP_GOALS = {
  daily: 10000,
  weekly: 70000,
  monthly: 300000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@stepup_auth_token',
  USER_DATA: '@stepup_user_data',
  DAILY_STEPS: '@stepup_daily_steps',
};
