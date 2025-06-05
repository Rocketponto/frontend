import { useState } from 'react'
import { AiOutlineLogin, AiOutlineLogout } from 'react-icons/ai'

interface StatusProps {
   entrada: string | null,
   saida: string | null,
   loading: boolean,
   tipo: 'entrada' | 'saida'
}

function BaterPonto() {
  const [pontoStatus, setPontoStatus] = useState<StatusProps>({
    entrada: null,
    saida: null,
    loading: false,
    tipo: 'entrada'
  })

  const baterPonto = async () => {
    setPontoStatus(prev => ({ ...prev, loading: true }))

    setTimeout(() => {
      const agora = new Date()
      const horario = agora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      if (pontoStatus.tipo === 'entrada') {
        setPontoStatus({
          ...pontoStatus,
          entrada: horario,
          loading: false,
          tipo: 'saida'
        })
      } else {
        setPontoStatus({
          entrada: null,
          saida: null,
          loading: false,
          tipo: 'entrada'
        })
      }
    }, 1500)
  }

  const getButtonText = () => {
    if (pontoStatus.loading) return 'Registrando...'
    if (pontoStatus.tipo === 'entrada') return 'Bater Ponto de Entrada'
    if (pontoStatus.tipo === 'saida') return 'Bater Ponto de Saída'
  }

  const getButtonIcon = () => {
    if (pontoStatus.tipo === 'entrada') return <AiOutlineLogin className="text-xl" />
    if (pontoStatus.tipo === 'saida') return <AiOutlineLogout className="text-xl" />
  }

  const getStatusColor = () => {
    if (pontoStatus.entrada) return 'bg-green-500'
    return 'bg-gray-500'
  }

  const getStatusText = () => {
    if (pontoStatus.entrada) return 'Trabalhando'
    return 'Pendente'
  }

  return (
    <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
      <div className="text-center">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Registro de Ponto
          </h3>

          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${getStatusColor()} ${
              pontoStatus.loading ? 'animate-pulse' : ''
            }`}></div>
            <span className="text-sm text-gray-400">
              {getStatusText()}
            </span>
          </div>
        </div>

        {pontoStatus.entrada && (
          <div className="mb-6 space-y-3">
            <div className="bg-green-600/20 border border-green-500 rounded-lg p-3">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <AiOutlineLogin className="text-green-500" />
                <span className="text-green-500 font-semibold">Entrada Registrada</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {pontoStatus.entrada}
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto">
          <button
            onClick={baterPonto}
            disabled={pontoStatus.loading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
              pontoStatus.loading
                ? 'bg-gray-600 cursor-not-allowed'
                : pontoStatus.tipo === 'entrada'
                ? 'bg-rocket-red-600 hover:bg-rocket-red-700 hover:scale-105'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
            } text-white shadow-lg`}
          >
            {pontoStatus.loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Registrando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                {getButtonIcon()}
                <span>{getButtonText()}</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BaterPonto