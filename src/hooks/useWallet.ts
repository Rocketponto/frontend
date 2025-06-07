import api from '../services/api'

interface Transaction {
  id: string
  type: 'EARNED' | 'SPENT'
  amount: string
  description: string
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Wallet {
  id: number
  userId: number
  balance: string
  totalEarned: string
  totalSpent: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  user: User
  transactions: Transaction[]
}

interface WalletResponse {
  success: boolean
  wallet?: Wallet
  message?: string
}

export const walletService = {
  buscarCarteira: async (): Promise<WalletResponse> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const id = currentUser.id

      if (!id) {
        throw new Error('ID do usuário não encontrado')
      }

      const response = await api.get(`/wallet/get-wallet/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar carteira:', error)
      throw new Error(error.response?.data?.message || 'Erro ao buscar carteira')
    }
  },

  // Adicionar saldo (para admins/diretores)
  adicionarSaldo: async (userId: string, amount: number, description: string): Promise<{ success: boolean, message?: string }> => {
    try {
      const response = await api.post(`/wallet/add-balance/${userId}`, {
        amount,
        description
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao adicionar saldo')
    }
  },

  // Gastar saldo
  gastarSaldo: async (amount: number, description: string): Promise<{ success: boolean, message?: string }> => {
    try {
      const response = await api.post('/wallet/spend', {
        amount,
        description
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao gastar saldo')
    }
  },

  // Buscar histórico de transações
  buscarTransacoes: async (userId?: string): Promise<{ success: boolean, transactions: Transaction[] }> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const id = userId || currentUser.id

      const response = await api.get(`/wallet/transactions/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar transações')
    }
  },

  solicitarTransacao: async (title: string, description: string, amount: number, reference?: string): Promise<{ success: boolean }> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const id = currentUser.id

      const response = await api.post(`/wallet/request-spending/${id}`, {
        title,
        description,
        amount,
        reference
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao aprovar transação')
    }
  },

  buscarMinhasSolicitaçõesPendentes: async (params?: {page?: number, limit?: number}): Promise<{
    summary: any
    requests: any,
    success: true,
    pagination?: {
      itemsPerPage: number
      currentPage: number
      totalPages: number
      totalItems: number
      limit: number
    }
  }> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const id = currentUser.id

      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())


      const response = await api.get(`/wallet/my-requests/${id}?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar solicitações')
    }
  },

  buscarHistoricoTransacoes: async (params?: {page?: number, limit?: number}): Promise<{
    wallet: any
    transactions: any,
    success: true,
    pagination?: {
      itemsPerPage: number
      currentPage: number
      totalPages: number
      totalItems: number
      limit: number
    }
  }> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const id = currentUser.id

      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())


      const response = await api.get(`/wallet/my-history-transactions/${id}?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar histórico')
    }
  }
}