import apiClient from './client'

export const customersAPI = {
  getAll: (params) => apiClient.get('/customers', { params }),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
  getRequirements: (id) => apiClient.get(`/customers/${id}/requirements`),
  getOrders: (id) => apiClient.get(`/customers/${id}/orders`),
}
