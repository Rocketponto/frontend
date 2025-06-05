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
  }
}