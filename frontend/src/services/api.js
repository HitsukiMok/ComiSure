import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'comisure-auth-token';

export const api = axios.create({
  baseURL: API_URL,
});

// Attach stored token on every request (picks up latest from localStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const commissionService = {
  create: (data) => api.post('/contracts', data).then(res => res.data),
  getAll: (filters) => api.get('/contracts', { params: filters }).then(res => res.data),
  getById: (id) => api.get(`/contracts/${id}`).then(res => res.data),
  update: (id, data) => api.patch(`/contracts/${id}`, data).then(res => res.data),
  adminRefund: (id) => api.post(`/contracts/${id}/refund`).then(res => res.data),
  adminForceRelease: (id) => api.post(`/contracts/${id}/release`).then(res => res.data),
  clientRefund: (id) => api.post(`/contracts/${id}/client-refund`).then(res => res.data),
};

export const disputeService = {
  create: (data) => api.post('/disputes', data).then(res => res.data),
  getAll: () => api.get('/disputes').then(res => res.data),
  resolve: (id, resolution) => api.patch(`/disputes/${id}/resolve?resolution=${resolution}`).then(res => res.data),
};

export const milestoneService = {
  getMilestones: (id) => api.get(`/contracts/${id}/milestones`).then(res => res.data),
  approve: (id, index) => api.post(`/contracts/${id}/milestones/${index}/approve`).then(res => res.data),
};
