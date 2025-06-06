import { useState, useEffect } from 'react'
import { AiOutlineLogin, AiOutlineLogout, AiOutlineClose, AiOutlineCheck } from 'react-icons/ai'
import { pontoService } from '../../hooks/usePointRecord'

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

  // Função para salvar estado no localStorage
  const salvarStatusLocal = (status: StatusProps) => {
    const hoje = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    localStorage.setItem(`pontoStatus_${hoje}`, JSON.stringify(status))
  }

  // Função para carregar estado do localStorage
  const carregarStatusLocal = (): StatusProps | null => {
    const hoje = new Date().toISOString().split('T')[0]
    const statusSalvo = localStorage.getItem(`pontoStatus_${hoje}`)

    if (statusSalvo) {
      return JSON.parse(statusSalvo)
    }
    return null
  }

  // Carregar estado quando componente monta
  useEffect(() => {
    const statusSalvo = carregarStatusLocal()

    if (statusSalvo) {
      console.log('Estado recuperado do localStorage:', statusSalvo)
      setPontoStatus(statusSalvo)
    } else {
      console.log('Nenhum estado salvo encontrado')
      buscarRegistrosDia()
    }
  }, [])

  const buscarRegistrosDia = async () => {
    try {
      const response = await pontoService.buscarHistoricoPontos()

      if (response.success && response.data && response.data.length > 0) {
        const hoje = new Date().toISOString().split('T')[0]

        // Filtrar registros de hoje
        const registrosHoje = response.data.filter((registro: any) => {
          const dataRegistro = new Date(registro.createdAt).toISOString().split('T')[0]
          return dataRegistro === hoje
        })

        if (registrosHoje.length > 0) {
          // Pegar o último registro
          const ultimoRegistro = registrosHoje[registrosHoje.length - 1]

          let novoStatus: StatusProps

          if (ultimoRegistro.entryDateHour && ultimoRegistro.exitDateHour) {
            // Tem entrada E saída - dia finalizado
            novoStatus = {
              entrada: new Date(ultimoRegistro.entryDateHour).toLocaleTimeString('pt-BR'),
              saida: new Date(ultimoRegistro.exitDateHour).toLocaleTimeString('pt-BR'),
              loading: false,
              tipo: 'entrada' // Pode registrar nova entrada
            }
          } else if (ultimoRegistro.entryDateHour) {
            // Tem apenas entrada - próximo é saída
            novoStatus = {
              entrada: new Date(ultimoRegistro.entryDateHour).toLocaleTimeString('pt-BR'),
              saida: null,
              loading: false,
              tipo: 'saida'
            }
          } else {
            // Estado padrão
            novoStatus = {
              entrada: null,
              saida: null,
              loading: false,
              tipo: 'entrada'
            }
          }

          setPontoStatus(novoStatus)
          salvarStatusLocal(novoStatus)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar registros:', error)
    }
  }

  const handleBaterPonto = () => {
    if (pontoStatus.loading) return

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
        const agora = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })

        const novoStatus: StatusProps = {
          entrada: agora,
          saida: null,
          loading: false,
          tipo: 'saida' // IMPORTANTE: Muda para saída
        }

        setPontoStatus(novoStatus)
        salvarStatusLocal(novoStatus) // Salva no localStorage

        console.log('Entrada registrada - próximo é saída')
      }
    } catch (error: any) {
      setErro(error.message)
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
        const agora = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })

        const novoStatus: StatusProps = {
          entrada: pontoStatus.entrada,
          saida: agora,
          loading: false,
          tipo: 'entrada' // Volta para entrada após saída
        }

        setPontoStatus(novoStatus)
        salvarStatusLocal(novoStatus)

        console.log('Saída registrada - dia finalizado')

        // Resetar após 5 segundos para mostrar o sucesso
        setTimeout(() => {
          const statusLimpo: StatusProps = {
            entrada: null,
            saida: null,
            loading: false,
            tipo: 'entrada'
          }
          setPontoStatus(statusLimpo)
          salvarStatusLocal(statusLimpo)
        }, 5000)

        setDescription('')
      }
    } catch (error: any) {
      setErro(error.message)
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
    if (pontoStatus.tipo === 'entrada') return 'Bater Ponto de Entrada'
    if (pontoStatus.tipo === 'saida') return 'Bater Ponto de Saída'
  }

  const getButtonIcon = () => {
    if (pontoStatus.tipo === 'entrada') return <AiOutlineLogin className="text-xl" />
    if (pontoStatus.tipo === 'saida') return <AiOutlineLogout className="text-xl" />
  }

  const getStatusColor = () => {
    if (pontoStatus.saida) return 'bg-green-500' // Verde quando finalizado
    if (pontoStatus.entrada) return 'bg-yellow-500' // Amarelo quando trabalhando
    return 'bg-gray-500' // Cinza quando pendente
  }

  const getStatusText = () => {
    if (pontoStatus.saida) return 'Dia Finalizado'
    if (pontoStatus.entrada) return 'Trabalhando'
    return 'Pendente'
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
              <div className={`w-3 h-3 rounded-full transition-colors ${getStatusColor()} ${
                pontoStatus.loading ? 'animate-pulse' : ''
              }`}></div>
              <span className="text-sm text-gray-400">
                {getStatusText()}
              </span>
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