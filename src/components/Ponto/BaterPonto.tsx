import { useState, useEffect } from 'react'
import { AiOutlineLogin, AiOutlineLogout, AiOutlineClose, AiOutlineCheck } from 'react-icons/ai'
import { pontoService } from '../../hooks/usePointRecord'
import { useToast } from '../../components/Toast/ToastProvider'
import { MdRefresh } from 'react-icons/md'

interface StatusProps {
  entrada: string | null
  saida: string | null
  loading: boolean
  tipo: 'entrada' | 'saida'
}

function BaterPonto() {
  const [pontoStatus, setPontoStatus] = useState<StatusProps>({
    entrada: null,
    saida: null,
    loading: false,
    tipo: 'entrada'
  })

  const [showDescriptionModal, setShowDescriptionModal] = useState(false)
  const [description, setDescription] = useState('')
  const [erro, setErro] = useState('')
  const [carregandoStatus, setCarregandoStatus] = useState(true)
  const { showSuccess, showError } = useToast()

  const salvarStatusLocal = (status: StatusProps) => {
    const hoje = new Date().toISOString().split('T')[0]
    localStorage.setItem(`pontoStatus_${hoje}`, JSON.stringify(status))
  }

  useEffect(() => {
    buscarStatusReal()
  }, [])

  const buscarStatusReal = async () => {
    try {
      setCarregandoStatus(true)

      const user = localStorage.getItem('user')
      const userData = user ? JSON.parse(user) : null

      const response = await pontoService.buscarRegistrosDia(userData.id)

      if (response && response.lastPointRecord) {
        const ultimoPonto = response.lastPointRecord

        let novoStatus: StatusProps

        if (ultimoPonto.exitDateHour === null) {
          novoStatus = {
            entrada: ultimoPonto.entryDateHour ?
              new Date(ultimoPonto.entryDateHour).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }) : null,
            saida: null,
            loading: false,
            tipo: 'saida'
          }
        } else {
          novoStatus = {
            entrada: ultimoPonto.entryDateHour ?
              new Date(ultimoPonto.entryDateHour).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }) : null,
            saida: ultimoPonto.exitDateHour ?
              new Date(ultimoPonto.exitDateHour).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }) : null,
            loading: false,
            tipo: 'entrada'
          }
        }

        setPontoStatus(novoStatus)
        salvarStatusLocal(novoStatus)

      } else {
        const statusInicial: StatusProps = {
          entrada: null,
          saida: null,
          loading: false,
          tipo: 'entrada'
        }
        setPontoStatus(statusInicial)
        salvarStatusLocal(statusInicial)
      }

    } catch (error) {
      console.error('❌ Erro:', error)

      const hoje = new Date().toISOString().split('T')[0]
      const statusSalvo = localStorage.getItem(`pontoStatus_${hoje}`)

      if (statusSalvo) {
        setPontoStatus(JSON.parse(statusSalvo))
      }
    } finally {
      setCarregandoStatus(false)
    }
  }

  const revalidarStatus = async () => {
    await buscarStatusReal()
  }

  const handleBaterPonto = () => {
    if (pontoStatus.loading || carregandoStatus) return

    setErro('')

    if (pontoStatus.tipo === 'entrada') {
      registrarEntrada()
    } else {
      setShowDescriptionModal(true)
      setDescription('')
    }
  }

  const registrarEntrada = async () => {
    setPontoStatus(prev => ({ ...prev, loading: true }))

    try {
      const response = await pontoService.registrarPonto({
        description: 'Ponto de entrada registrado'
      })

      if (response.success) {
        showSuccess('Ponto batido!', 'Entrada registrada com sucesso.')

        await revalidarStatus()
      }
    } catch (error: any) {
      setErro(error.message)
      showError('Erro ao bater ponto!', 'Erro no processamento de bater ponto.')
      setPontoStatus(prev => ({ ...prev, loading: false }))
    }
  }

  const confirmarSaida = async () => {
    if (!description.trim()) {
      setErro('Descrição é obrigatória para o ponto de saída')
      return
    }

    setPontoStatus(prev => ({ ...prev, loading: true }))
    setShowDescriptionModal(false)

    try {
      const response = await pontoService.registrarPonto({
        description: description.trim()
      })

      if (response.success) {
        showSuccess('Ponto batido!', 'Ponto de saída registrado com sucesso.')

        await revalidarStatus()

        setDescription('')
      }
    } catch (error: any) {
      setErro(error.message)
      showError('Erro ao bater ponto!', 'Erro ao processar ponto.')
      setPontoStatus(prev => ({ ...prev, loading: false }))
      setShowDescriptionModal(true)
    }
  }

  const cancelarSaida = () => {
    setShowDescriptionModal(false)
    setDescription('')
    setErro('')
  }

  const getButtonText = () => {
    if (pontoStatus.loading) return 'Registrando...'
    if (carregandoStatus) return 'Verificando status...'

    if (pontoStatus.tipo === 'entrada') {
      if (pontoStatus.entrada && pontoStatus.saida) {
        return 'Bater Novo Ponto'
      }
      return 'Bater Ponto de Entrada'
    }

    if (pontoStatus.tipo === 'saida') {
      return 'Registrar Saída'
    }
  }

  const getButtonIcon = () => {
    if (pontoStatus.tipo === 'entrada') return <AiOutlineLogin className="text-xl" />
    if (pontoStatus.tipo === 'saida') return <AiOutlineLogout className="text-xl" />
  }

  const getStatusColor = () => {
    if (carregandoStatus) return 'bg-blue-500 animate-pulse'
    if (pontoStatus.saida) return 'bg-green-500'
    if (pontoStatus.entrada) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  const getStatusText = () => {
    if (carregandoStatus) return 'Verificando...'
    if (pontoStatus.saida) return 'Dia Finalizado'
    if (pontoStatus.entrada) return 'Trabalhando'
    return 'Pendente'
  }

  if (carregandoStatus) {
    return (
      <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando status do ponto...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
        <div className="text-center">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Registro de Ponto
            </h3>

            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${getStatusColor()}`}></div>
              <span className="text-sm text-gray-400">
                {getStatusText()}
              </span>

              <button
                onClick={revalidarStatus}
                disabled={carregandoStatus}
                className="text-gray-400 hover:text-white text-xs ml-2"
                title="Atualizar status"
              >
                <MdRefresh className="text-lg text-rocket-red-600 hover:text-rocket-red-700"/>
              </button>
            </div>
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {erro}
            </div>
          )}

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

          {pontoStatus.saida && (
            <div className="mb-6 space-y-3">
              <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <AiOutlineLogout className="text-blue-500" />
                  <span className="text-blue-500 font-semibold">Saída Registrada</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {pontoStatus.saida}
                </div>
              </div>
            </div>
          )}

          {pontoStatus.tipo === 'saida' && !pontoStatus.saida && (
            <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-500 rounded-lg">
              <p className="text-yellow-400 text-sm">
                ⚠️ Para registrar a saída, você deve descrever suas atividades do dia
              </p>
            </div>
          )}

          <div className="mt-auto">
            <button
              onClick={handleBaterPonto}
              disabled={pontoStatus.loading || carregandoStatus}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                pontoStatus.loading || carregandoStatus
                  ? 'bg-gray-600 cursor-not-allowed'
                  : pontoStatus.tipo === 'entrada'
                  ? 'bg-rocket-red-600 hover:bg-rocket-red-700 hover:scale-105'
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
              } text-white shadow-lg`}
            >
              {pontoStatus.loading || carregandoStatus ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{getButtonText()}</span>
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

      {showDescriptionModal && (
        <div className="fixed inset-0 bg-gray-rocket-700 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-rocket-600 shadow-xl shadow-rocket-red-600/10 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Registrar Saída
              </h3>
              <button
                onClick={cancelarSaida}
                className="text-gray-400 hover:text-white"
              >
                <AiOutlineClose />
              </button>
            </div>

            {erro && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {erro}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Descreva suas atividades do dia *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Finalizei as tarefas do projeto X, organizei documentos, respondi emails dos clientes..."
                rows={4}
                className="w-full bg-gray-rocket-700 text-white rounded-lg px-3 py-2 border border-rocket-red-600 focus:border-rocket-red-700 focus:ring-2 focus:ring-rocket-red-600/20 focus:outline-none resize-none"
                required
              />
              <p className="text-gray-400 text-xs mt-1">
                Descrição obrigatória para registrar o ponto de saída
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmarSaida}
                disabled={!description.trim()}
                className="flex-1 bg-rocket-red-600 hover:bg-rocket-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <AiOutlineCheck />
                <span>Registrar Saída</span>
              </button>

              <button
                onClick={cancelarSaida}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BaterPonto