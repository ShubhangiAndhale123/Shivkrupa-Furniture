import apiClient from './client'

export const ordersAPI = {
  getAll: (params) => apiClient.get('/orders', { params }),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post('/orders', data),
  update: (id, data) => apiClient.put(`/orders/${id}`, data),
  delete: (id) => apiClient.delete(`/orders/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/orders/${id}/status`, { status }),
  assignProduction: (id, staffId) => apiClient.post(`/orders/${id}/assign-production`, { staffId }),
  getTimeline: (id) => apiClient.get(`/orders/${id}/timeline`),
}
