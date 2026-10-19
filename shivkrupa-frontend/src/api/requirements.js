import apiClient from './client'

export const requirementsAPI = {
  getAll: (params) => apiClient.get('/requirements', { params }),
  getById: (id) => apiClient.get(`/requirements/${id}`),
  create: (data) => apiClient.post('/requirements', data),
  update: (id, data) => apiClient.put(`/requirements/${id}`, data),
  delete: (id) => apiClient.delete(`/requirements/${id}`),
  assign: (id, staffId) => apiClient.post(`/requirements/${id}/assign`, { staffId }),
  updateStatus: (id, status) => apiClient.patch(`/requirements/${id}/status`, { status }),
}
