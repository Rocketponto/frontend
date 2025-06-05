import api from '../services/api'

interface LoginData {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    nome: string
    email: string
    cargo: string
  }
  message?: string
}

interface Membro {
   id: string
   name: string
   email: string
   role: string
   isActive: boolean
   created_at: string
   updated_at: string
}

export const authService = {
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login')
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token')
    return !!token
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  buscarMembros: async (): Promise<{ success: boolean, data: Membro[] }> => {
   try {
      const response = await api.get('/auth/get-users')
      return response.data
   } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar membros')
   }
},
}