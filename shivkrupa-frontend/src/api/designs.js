import apiClient from './client'

export const designsAPI = {
  getAll: (params) => apiClient.get('/designs', { params }),
  getById: (id) => apiClient.get(`/designs/${id}`),
  create: (data) => apiClient.post('/designs', data),
  update: (id, data) => apiClient.put(`/designs/${id}`, data),
  delete: (id) => apiClient.delete(`/designs/${id}`),
  uploadImage: (id, file) => {
    const formData = new FormData()
    formData.append('image', file)
    return apiClient.post(`/designs/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getVersions: (id) => apiClient.get(`/designs/${id}/versions`),
  createVersion: (id, data) => apiClient.post(`/designs/${id}/versions`, data),
}
