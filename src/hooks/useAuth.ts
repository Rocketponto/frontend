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

interface RegisterMember {
  name: string
  email: string
  password: string
  role: string
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

  buscarMembrosAtivo: async (): Promise<{ success: boolean, data: Membro[] }> => {
    try {
      const response = await api.get('/auth/get-users-active')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar membros')
    }
  },

  cadastrarMembro: async (data: RegisterMember): Promise<{ success: boolean }> => {
    try {
      await api.post('/auth/register', data)
      return { success: true }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao cadastrar membro')
    }
  },

  atualizarRoleUser: async (id: number, role: string): Promise<{ success: boolean }> => {
    try {
      await api.put(`/auth/update-role/${id}`, {
        role: role
      })
      return { success: true }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar cargo do membro')
    }
  },

  atualizarStatusUser: async (id: number, status: boolean): Promise<{ success: boolean }> => {
    try {
      await api.put(`/auth/update-status/${id}`, {
        status: status
      })
      return { success: true }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar cargo do membro')
    }
  },

  buscarMembros: async (): Promise<{ success: boolean, data: Membro[] }> => {
    try {
      const response = await api.get('/auth/get-all-users')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar membros')
    }
  },
}