import apiClient from './client'

export const employeesAPI = {
  getAll: (params) => apiClient.get('/employees', { params }),
  getById: (id) => apiClient.get(`/employees/${id}`),
  create: (data) => apiClient.post('/employees', data),
  update: (id, data) => apiClient.put(`/employees/${id}`, data),
  delete: (id) => apiClient.delete(`/employees/${id}`),
}
