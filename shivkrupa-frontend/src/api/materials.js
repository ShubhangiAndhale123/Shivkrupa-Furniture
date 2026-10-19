import apiClient from './client'

export const materialsAPI = {
  getAll: (params) => apiClient.get('/materials', { params }),
  getById: (id) => apiClient.get(`/materials/${id}`),
  create: (data) => apiClient.post('/materials', data),
  update: (id, data) => apiClient.put(`/materials/${id}`, data),
  delete: (id) => apiClient.delete(`/materials/${id}`),
}
