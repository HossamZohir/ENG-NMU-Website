import { apiClient } from './client'
import type { User } from '@/types'

interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // FastAPI OAuth2 uses form data
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    const { data } = await apiClient.post<LoginResponse>('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },

  me: async (token: string): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  createAdmin: async (payload: {
    email: string
    password: string
    full_name: string
    full_name_ar: string
    role: 'admin' | 'super_admin'
  }): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/register', payload)
    return data
  },

  updatePassword: async (payload: {
    current_password: string
    new_password: string
  }): Promise<void> => {
    await apiClient.put('/auth/change-password', payload)
  },
}
