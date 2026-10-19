import supabase from '../lib/supabase'
import apiClient from './client'

export const authAPI = {
  // Supabase Auth direct methods
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  register: async ({ email, password, fullName, mobile, address }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          mobile,
          address,
        },
      },
    })
    if (error) throw error
    return data
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  forgotPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    return data
  },

  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  updateProfile: async (userId, profileData) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Fallback REST endpoints if connecting to separate microservice
  rest: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (data) => apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
  },
}

export default authAPI
