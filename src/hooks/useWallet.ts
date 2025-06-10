import api from '../services/api'
import { AxiosError } from 'axios'

interface Transaction {
  id: string
  type: 'EARNED' | 'SPENT' | 'CREDIT' | 'DEBIT'
  amount: string
  title: string
  description: string
  createdAt: string
  data: string
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

// ✅ Interface específica para respostas de erro da API
interface ApiErrorResponse {
  message: string
  error?: string
  statusCode?: number
}

// ✅ Interface para histórico de transações
interface HistoricoTransacoesResponse {
  wallet: {
    totalEarned: number
    totalSpent: number
  }
  transactions: Transaction[]
  success: boolean
  pagination?: {
    itemsPerPage: number
    currentPage: number
    totalPages: number
    totalItems: number
    limit: number
  }
}

// ✅ Interface para minhas solicitações pendentes
interface MinhasSolicitacoesPendentesResponse {
  summary: number
  requests: WalletRequest[]
  success: boolean
  pagination?: {
    itemsPerPage: number
    currentPage: number
    totalPages: number
    totalItems: number
    limit: number
  }
}

interface ReportResponse {
  transacoes: never[]
  success: boolean
  transactions: Transaction[]
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  summary?: {
    totalCredito: string
    totalDebito: string
    saldoLiquido: string
    totalTransacoes: number
  }
}

interface WalletResponse {
  success: boolean
  wallet?: Wallet
  message?: string
}

interface DashboardStatistics {
  success: boolean
  totalUsuarios: number
  totalDistribuido: string
  solicitacoesPendentes: number
  transacoesHoje: number
}

interface WalletRequest {
  id: number
  walletId: number
  type: 'DEBIT' | 'CREDIT'
  amount: string
  title: string
  description: string
  reference: string
  processedBy: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  balanceBefore: string
  balanceAfter: string
  createdAt: string
  updatedAt: string
  wallet: {
    id: number
    userId: number
    balance: string
    totalEarned: string
    totalSpent: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }
}

interface RequestsResponse {
  success: boolean
  requests: WalletRequest[]
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

// ✅ Interface para resposta de transações com wallet
interface TransactionWalletResponse {
  success: boolean
  message?: string
  transaction?: WalletRequest
  wallet?: Wallet
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
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao buscar carteira:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao buscar carteira')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  buscarSaldoUsuario: async (id: number): Promise<WalletResponse> => {
    try {
      const response = await api.get(`/wallet/get-wallet-user/${id}`)
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao buscar carteira:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao buscar carteira')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  adicionarSaldo: async (userId: string, amount: number, description: string): Promise<{ success: boolean, message?: string }> => {
    try {
      const response = await api.post(`/wallet/add-balance/${userId}`, {
        amount,
        description
      })
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao adicionar saldo:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao adicionar saldo')
      }

      throw new Error('Erro de conexão. Tente novamente.')
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
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao gastar saldo:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao gastar saldo')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  // Buscar histórico de transações
  buscarTransacoes: async (userId?: string): Promise<{ success: boolean, transactions: Transaction[] }> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const id = userId || currentUser.id

      const response = await api.get(`/wallet/transactions/${id}`)
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao buscar transações:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao buscar transações')
      }

      throw new Error('Erro de conexão. Tente novamente.')
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
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao solicitar transação:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao aprovar transação')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  // ✅ CORRIGIR: Remover 'any' dos tipos de retorno
  buscarMinhasSolicitaçõesPendentes: async (params?: { page?: number, limit?: number }): Promise<MinhasSolicitacoesPendentesResponse> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const id = currentUser.id

      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const response = await api.get(`/wallet/my-requests/${id}?${queryParams.toString()}`)
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao buscar solicitações:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao buscar solicitações')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  // ✅ CORRIGIR: Remover 'any' dos tipos de retorno
  buscarHistoricoTransacoes: async (params?: { page?: number, limit?: number }): Promise<HistoricoTransacoesResponse> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const id = currentUser.id

      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const response = await api.get(`/wallet/my-history-transactions/${id}?${queryParams.toString()}`)
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao buscar histórico:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao buscar histórico')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  buscarTodasSolicitacoesPendentes: async (params?: {
    page?: number
    limit?: number
  }): Promise<RequestsResponse> => {
    try {
      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const response = await api.get(`/wallet/pending-requests?${queryParams.toString()}`)
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao buscar todas as solicitações:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao buscar todas as solicitações')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  // ✅ CORRIGIR: Remover 'any' dos tipos de retorno
  aprovarSolicitacao: async (transactionId: number): Promise<TransactionWalletResponse> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const directorId = currentUser.id

      const response = await api.put(`/wallet/approve/${transactionId}`, {
        directorId
      })
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao aprovar solicitação:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao aprovar solicitação')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  rejeitarSolicitacao: async (transactionId: number, rejectionReason: string): Promise<{
    success: boolean
    message?: string
    transaction?: WalletRequest
    reason?: string
  }> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const directorId = currentUser.id

      const response = await api.put(`/wallet/reject/${transactionId}`, {
        directorId,
        rejectionReason
      })
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao rejeitar solicitação:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao rejeitar solicitação')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  // ✅ CORRIGIR: Remover 'any' dos tipos de retorno
  adicionarRocketcoins: async (params: {
    userId: number
    amount: number
    title: string
    description: string
    reference?: string
  }): Promise<TransactionWalletResponse> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const directorId = currentUser.id

      const response = await api.post('/wallet/add-coins', {
        id: params.userId,
        amount: params.amount,
        title: params.title,
        description: params.description,
        reference: params.reference || new Date().toISOString(),
        processedBy: directorId
      })
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao adicionar rocketcoins:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao adicionar rocketcoins')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  // ✅ CORRIGIR: Remover 'any' dos tipos de retorno
  removerRocketcoins: async (params: {
    userId: number
    amount: number
    title: string
    description: string
    reference?: string
  }): Promise<TransactionWalletResponse> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const directorId = currentUser.id

      const response = await api.post('/wallet/remove-coins', {
        id: params.userId,
        amount: params.amount,
        title: params.title,
        description: params.description,
        reference: params.reference || new Date().toISOString(),
        processedBy: directorId
      })
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao remover rocketcoins:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao remover rocketcoins')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  buscarEstatisticasGerais: async (): Promise<DashboardStatistics> => {
    try {
      const response = await api.get('/wallet/dashboard-statistics')
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao buscar estatísticas do dashboard:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao buscar estatísticas do dashboard')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  buscarRelatorioTransacoes: async (params: {
    dataInicio?: string
    dataFim?: string
    tipo?: 'CREDIT' | 'DEBIT' | 'todos'
    page?: number
    limit?: number
  }): Promise<ReportResponse> => {
    try {
      const queryParams = new URLSearchParams()

      if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio)
      if (params.dataFim) queryParams.append('dataFim', params.dataFim)
      if (params.tipo) queryParams.append('tipo', params.tipo)
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())

      const response = await api.get(`/wallet/transactions-report?${queryParams.toString()}`)
      return response.data
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao buscar relatório de transações:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as ApiErrorResponse
        throw new Error(errorData.message || 'Erro ao buscar relatório de transações')
      }

      throw new Error('Erro de conexão. Tente novamente.')
    }
  },

  exportarRelatorio: async (params: {
    dataInicio?: string
    dataFim?: string
    tipo?: 'CREDIT' | 'DEBIT'
  }): Promise<{
    success: boolean
    data?: string
    filename?: string
    error?: string
  }> => {
    try {
      const queryParams = new URLSearchParams()

      if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio)
      if (params.dataFim) queryParams.append('dataFim', params.dataFim)
      if (params.tipo) queryParams.append('tipo', params.tipo)

      const response = await api.get(`/wallet/export-report?${queryParams.toString()}`, {
        responseType: 'text'
      })

      return {
        success: true,
        data: response.data,
        filename: `relatorio-rocketcoins-${params.dataInicio || 'inicio'}-${params.dataFim || 'fim'}.csv`
      }
    } catch (error) { // ✅ CORRIGIR: Remover 'any'
      console.error('Erro ao exportar relatório:', error)

      // ✅ TRATAMENTO adequado do erro
      if (error instanceof AxiosError && error.response?.data) {
        try {
          const errorData = typeof error.response.data === 'string'
            ? JSON.parse(error.response.data)
            : error.response.data

          throw new Error(errorData.error || 'Erro ao exportar relatório')
        } catch { // ✅ CORRIGIR: Remover variável não usada 'parseError'
          throw new Error(error.response.data || 'Erro ao exportar relatório')
        }
      }

      throw new Error('Erro ao exportar relatório')
    }
  },
}