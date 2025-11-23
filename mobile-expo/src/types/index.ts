export interface School {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  active: boolean;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'schoolAdmin' | 'superAdmin';
  school?: School | string;
  totalSteps?: number;
  createdAt: string;
}

export interface StepEntry {
  _id: string;
  userId: string;
  steps: number;
  date: string;
  source: 'manual' | 'auto';
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: User;
  totalSteps: number;
  rank: number;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  type: 'class' | 'generation' | 'all_students' | 'all_professors' | 'custom';
  members: User[];
  admin: User | string;
  school: School | string;
  totalSteps?: number;
  createdAt: string;
}

export interface Challenge {
  _id: string;
  name: string;
  description: string;
  targetSteps: number;
  startDate: string;
  endDate: string;
  type: 'individual' | 'group';
  participants: string[];
  createdBy: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface StepStats {
  today: number;
  week: number;
  month: number;
  total: number;
  dailyAverage: number;
}
