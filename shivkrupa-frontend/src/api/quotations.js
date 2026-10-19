import apiClient from './client'

export const quotationsAPI = {
  getAll: (params) => apiClient.get('/quotations', { params }),
  getById: (id) => apiClient.get(`/quotations/${id}`),
  create: (data) => apiClient.post('/quotations', data),
  update: (id, data) => apiClient.put(`/quotations/${id}`, data),
  delete: (id) => apiClient.delete(`/quotations/${id}`),
  send: (id) => apiClient.post(`/quotations/${id}/send`),
  approve: (id) => apiClient.post(`/quotations/${id}/approve`),
  reject: (id, reason) => apiClient.post(`/quotations/${id}/reject`, { reason }),
  requestRevision: (id, notes) => apiClient.post(`/quotations/${id}/revision`, { notes }),
}
