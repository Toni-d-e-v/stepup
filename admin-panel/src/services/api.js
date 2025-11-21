import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Admin Dashboard
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStatistics: (period = 'weekly') => api.get('/admin/statistics', { params: { period } }),
  exportData: (type) => api.get(`/admin/export/${type}`),
};

// User Management
export const userAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
  createBulk: (users) => api.post('/admin/users/bulk', { users }),
};

// Group Management
export const groupAPI = {
  getAll: (params) => api.get('/admin/groups', { params }),
  getById: (id) => api.get(`/admin/groups/${id}`),
  create: (data) => api.post('/admin/groups', data),
  update: (id, data) => api.put(`/admin/groups/${id}`, data),
  delete: (id) => api.delete(`/admin/groups/${id}`),
  addMembers: (id, userIds) => api.post(`/admin/groups/${id}/members`, { userIds }),
  removeMember: (id, userId) => api.delete(`/admin/groups/${id}/members/${userId}`),
  generate: (data) => api.post('/admin/groups/generate', data),
};

// Challenge Management
export const challengeAPI = {
  getAll: (params) => api.get('/admin/challenges', { params }),
  getById: (id) => api.get(`/admin/challenges/${id}`),
  create: (data) => api.post('/admin/challenges', data),
  update: (id, data) => api.put(`/admin/challenges/${id}`, data),
  delete: (id) => api.delete(`/admin/challenges/${id}`),
  updateProgress: (id) => api.post(`/admin/challenges/${id}/update-progress`),
  getStatistics: (id) => api.get(`/admin/challenges/${id}/statistics`),
  addParticipants: (id, userIds) => api.post(`/admin/challenges/${id}/participants`, { userIds }),
};

export default api;
