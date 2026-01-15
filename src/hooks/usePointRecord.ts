import api from '../services/api'
import { AxiosError } from 'axios'

interface RegistrarPontoData {
   description: string
}

interface PontoResponse {
   success: boolean
   data?: {
      id: string
      userId: string
      description: string
      createdAt: string
      type: 'entrada' | 'saida'
   }
   message?: string
}

interface HistoricoPontoResponse {
   success: boolean
   data: {
      id: string
      userId: string
      user: {
         id: string
         name: string
         email: string
      }
      entryDateHour: string | null
      exitDateHour: string | null
      pointRecordStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'IN_PROGRESS'
      description: string
      workingHours: {
         hours: number
         minutes: number
         totalHours: number
      }
      createdAt: string
      updatedAt: string
   }[]
   pagination?: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPrevPage: boolean
   }
   summary?: {
      totalRecords: number
      recordsInProgress: number
      recordsApproved: number
   }
}

// ✅ Interface para resposta de buscar registros do dia
interface RegistrosDiaResponse {
   success: boolean
   lastPointRecord?: {
      id: string
      userId: string
      entryDateHour: string | null
      exitDateHour: string | null
      pointRecordStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'IN_PROGRESS'
      description: string
      workingHours?: {
         hours: number
         minutes: number
         totalHours: number
      }
      createdAt: string
      updatedAt: string
   }
   message?: string
}

// ✅ Interface para respostas de erro da API
interface ApiErrorResponse {
   message: string
   error?: string
   statusCode?: number
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

interface PontoMembro {
   id: string
   userId: string
   user: Membro
   entryDateHour: string | null
   exitDateHour: string | null
   pointRecordStatus: 'APPROVED' | 'IN_PROGRESS' | 'REJECTED'
   description: string
   workingHours: {
      hours: number
      minutes: number
      totalHours: number
   }
   createdAt: string
   updatedAt: string
}

interface FiltrosPontos {
   page?: number
   limit?: number
   name?: string
   date?: string
   status?: string
}

interface ResponsePaginada {
   success: boolean
   data: PontoMembro[]
   pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
   }
}

interface FiltrosHistorico {
   page?: number
   limit?: number
}

export const pontoService = {
   registrarPonto: async (data: RegistrarPontoData): Promise<PontoResponse> => {
      try {
         const response = await api.post('/pointRecord', data)
         return response.data
      } catch (error) { // ✅ CORRIGIR: Remover 'any'
         console.error('Erro ao registrar ponto:', error)

         // ✅ TRATAMENTO adequado do erro
         if (error instanceof AxiosError && error.response) {
            const errorData = error.response.data as ApiErrorResponse
            throw new Error(errorData.message || 'Erro ao registrar ponto')
         }

         throw new Error('Erro de conexão. Tente novamente.')
      }
   },

   fecharPonto: async (recordPointId: number): Promise<{success: true} | undefined> => {
      try {
         const response = await api.put(`/pointRecord/closed-point/${recordPointId}`)
         return response.data
      } catch (error) {
         console.error('Erro ao fechar ponto:', error)
         return undefined
      }
   },

   buscarHistoricoPonto: async (userId: number, filtros: FiltrosHistorico = {}): Promise<HistoricoPontoResponse> => {
      try {
         const params = new URLSearchParams()

         if (filtros.page) params.append('page', filtros.page.toString())
         if (filtros.limit) params.append('limit', filtros.limit.toString())

         const queryString = params.toString()
         const endpoint = `/pointRecord/my-records/${userId}${queryString ? `?${queryString}` : ''}`

         const response = await api.get(endpoint)
         return response.data
      } catch (error) {
         console.error('Erro ao buscar histórico de pontos:', error)

         // ✅ TRATAMENTO adequado do erro
         if (error instanceof AxiosError && error.response) {
            const errorData = error.response.data as ApiErrorResponse
            throw new Error(errorData.message || 'Erro ao buscar registros')
         }

         throw new Error('Erro de conexão. Tente novamente.')
      }
   },

   buscarRegistrosDia: async (userId: number): Promise<RegistrosDiaResponse> => { // ✅ CORRIGIR: Remover 'any' do retorno
      try {
         const response = await api.get(`/pointRecord/get-last-point/${userId}`)
         return response.data
      } catch (error) { // ✅ CORRIGIR: Remover 'any'
         console.error('Erro ao buscar registros do dia:', error)

         // ✅ TRATAMENTO adequado do erro
         if (error instanceof AxiosError && error.response) {
            const errorData = error.response.data as ApiErrorResponse
            throw new Error(errorData.message || 'Erro ao buscar registros')
         }

         throw new Error('Erro de conexão. Tente novamente.')
      }
   },

   buscarPontosMembros: async (filtros: FiltrosPontos = {}): Promise<ResponsePaginada> => {
      try {
         const params = new URLSearchParams()

         if (filtros.page) params.append('page', filtros.page.toString())
         if (filtros.limit) params.append('limit', filtros.limit.toString())
         if (filtros.name) params.append('name', filtros.name)
         if (filtros.date) params.append('date', filtros.date)
         if (filtros.status) params.append('status', filtros.status)

         const response = await api.get(`/pointRecord/all?${params.toString()}`)
         console.log("response ", response.data)
         return response.data
      } catch (error) {
         console.error('Erro ao buscar pontos dos membros:', error)

         if (error instanceof AxiosError && error.response) {
            const errorData = error.response.data as ApiErrorResponse
            throw new Error(errorData.message || 'Erro ao buscar pontos')
         }

         throw new Error('Erro de conexão. Tente novamente.')
      }
   },

   // Aprovar ponto
   aprovarPonto: async (pontoId: string): Promise<{ success: boolean }> => {
      try {
         const response = await api.patch(`/pointRecord/${pontoId}/approve`)
         return response.data
      } catch (error) { // ✅ CORRIGIR: Remover 'any'
         console.error('Erro ao aprovar ponto:', error)

         // ✅ TRATAMENTO adequado do erro
         if (error instanceof AxiosError && error.response) {
            const errorData = error.response.data as ApiErrorResponse
            throw new Error(errorData.message || 'Erro ao aprovar ponto')
         }

         throw new Error('Erro de conexão. Tente novamente.')
      }
   },

   // Rejeitar ponto
   rejeitarPonto: async (pontoId: string): Promise<{ success: boolean }> => {
      try {
         const response = await api.patch(`/pointRecord/${pontoId}/reject`)
         return response.data
      } catch (error) { // ✅ CORRIGIR: Remover 'any'
         console.error('Erro ao rejeitar ponto:', error)

         // ✅ TRATAMENTO adequado do erro
         if (error instanceof AxiosError && error.response) {
            const errorData = error.response.data as ApiErrorResponse
            throw new Error(errorData.message || 'Erro ao rejeitar ponto')
         }

         throw new Error('Erro de conexão. Tente novamente.')
      }
   }
}