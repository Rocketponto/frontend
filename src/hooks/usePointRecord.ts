import api from '../services/api'

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
      pointRecordStatus: 'APPROVED' | 'PENDING' | 'REJECTED'
      description: string
      workingHours: {
         hours: number
         minutes: number
         totalHours: number
      }
      createdAt: string
      updatedAt: string
   }[]
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
   pointRecordStatus: 'APPROVED' | 'PENDING' | 'REJECTED'
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

export const pontoService = {
   registrarPonto: async (data: RegistrarPontoData): Promise<PontoResponse> => {
      try {
         const response = await api.post('/pointRecord', data)
         return response.data
      } catch (error: any) {
         throw new Error(error.response?.data?.message || 'Erro ao registrar ponto')
      }
   },

   buscarHistoricoPontos: async (): Promise<HistoricoPontoResponse> => {
      try {
         const response = await api.get(`/pointRecord/my-records`)
         return response.data
      } catch (error: any) {
         throw new Error(error.response?.data?.message || 'Erro ao buscar registros')
      }
   },

   buscarRegistrosDia: async (data?: string): Promise<any> => {
      try {
         const response = await api.get(`/pointRecord${data ? `?date=${data}` : ''}`)
         return response.data
      } catch (error: any) {
         throw new Error(error.response?.data?.message || 'Erro ao buscar registros')
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
         return response.data
      } catch (error: any) {
         throw new Error(error.response?.data?.message || 'Erro ao buscar pontos')
      }
   },

   // Aprovar ponto
   aprovarPonto: async (pontoId: string): Promise<{ success: boolean }> => {
      try {
         const response = await api.patch(`/pointRecord/${pontoId}/approve`)
         return response.data
      } catch (error: any) {
         throw new Error(error.response?.data?.message || 'Erro ao aprovar ponto')
      }
   },

   // Rejeitar ponto
   rejeitarPonto: async (pontoId: string): Promise<{ success: boolean }> => {
      try {
         const response = await api.patch(`/pointRecord/${pontoId}/reject`)
         return response.data
      } catch (error: any) {
         throw new Error(error.response?.data?.message || 'Erro ao rejeitar ponto')
      }
   }
}