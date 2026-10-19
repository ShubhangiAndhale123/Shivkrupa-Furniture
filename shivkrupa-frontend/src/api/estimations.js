import apiClient from './client'

export const estimationsAPI = {
  getAll: (params) => apiClient.get('/estimations', { params }),
  getById: (id) => apiClient.get(`/estimations/${id}`),
  create: (data) => apiClient.post('/estimations', data),
  update: (id, data) => apiClient.put(`/estimations/${id}`, data),
  delete: (id) => apiClient.delete(`/estimations/${id}`),
  calculate: (data) => apiClient.post('/estimations/calculate', data),
}
