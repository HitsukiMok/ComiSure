import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export const commissionService = {
  create: (data) => api.post('/commissions/', data).then(res => res.data),
  getAll: (filters) => api.get('/commissions/', { params: filters }).then(res => res.data),
  getById: (id) => api.get(`/commissions/${id}`).then(res => res.data),
  update: (id, data) => api.patch(`/commissions/${id}`, data).then(res => res.data),
  adminRefund: (id) => api.post(`/commissions/${id}/admin_refund`).then(res => res.data),
  adminForceRelease: (id) => api.post(`/commissions/${id}/admin_force_release`).then(res => res.data),
  clientRefund: (id) => api.post(`/contracts/${id}/client-refund`).then(res => res.data),
};

export const disputeService = {
  create: (data) => api.post('/disputes/', data).then(res => res.data),
  getAll: () => api.get('/disputes/').then(res => res.data),
  resolve: (id, resolution) => api.patch(`/disputes/${id}/resolve?resolution=${resolution}`).then(res => res.data),
};
