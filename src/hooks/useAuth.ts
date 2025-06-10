import api from '../services/api'
import { AxiosError } from 'axios'

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

// ✅ Interface para respostas de erro da API
interface ApiErrorResponse {
  message: string
  error?: string
  statusCode?: number
}

// ✅ Interface para resposta de buscar membros
interface BuscarMembrosResponse {
  success: boolean
  data: Membro[]
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export const authService = {
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', data)
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro no login:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao fazer login')
      }

      throw new Error('Erro de conexão. Tente novamente.')
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
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao buscar membros ativos:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao buscar membros')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  cadastrarMembro: async (data: RegisterMember): Promise<{ success: boolean }> => {
    try {
      await api.post('/auth/register', data)
      return { success: true }
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao cadastrar membro:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao cadastrar membro')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  atualizarRoleUser: async (id: number, role: string): Promise<{ success: boolean }> => {
    try {
      await api.put(`/auth/update-role/${id}`, {
        role: role
      })
      return { success: true }
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao atualizar role do usuário:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao atualizar cargo do membro')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  atualizarStatusUser: async (id: number, status: boolean): Promise<{ success: boolean }> => {
    try {
      await api.put(`/auth/update-status/${id}`, {
        status: status
      })
      return { success: true }
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao atualizar status do usuário:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao atualizar status do membro')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  buscarMembros: async (params?: {
    page?: number
    limit?: number
  }): Promise<BuscarMembrosResponse> => { // ✅ CORRIGIR: Remover 'any' do retorno
    try {
      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const response = await api.get(`/auth/get-all-users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao buscar todos os membros:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao buscar membros')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },
}