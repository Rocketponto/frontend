import { useState, useEffect } from 'react'
import { AiFillDollarCircle, AiOutlineLoading3Quarters, AiOutlineReload, AiOutlineWallet } from 'react-icons/ai'
import { walletService } from '../../hooks/useWallet'

interface CardCoinProps {
  saldoAtual?: number
  loadFromAPI?: boolean
}

function CardCoin({
  saldoAtual,
  loadFromAPI = true
}: CardCoinProps) {
  const [animatedSaldo, setAnimatedSaldo] = useState(0)
  const [saldo, setSaldo] = useState(0)
  const [loading, setLoading] = useState(loadFromAPI)
  const [erro, setErro] = useState('')
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)

  useEffect(() => {
    if (loadFromAPI) {
      buscarSaldo()
    }
  }, [loadFromAPI])

  const buscarSaldo = async () => {
    try {
      setLoading(true)
      setErro('')

      const response = await walletService.buscarCarteira()

      if (response.success && response.wallet) {
        const novoSaldo = parseFloat(response.wallet.balance)
        setSaldo(novoSaldo)
        setUltimaAtualizacao(new Date())
      } else {
        throw new Error(response.message || 'Erro ao carregar saldo')
      }
    } catch (error: any) {
      console.error('Erro ao buscar saldo:', error)
      setErro('Erro ao carregar saldo')
      setSaldo(0)
    } finally {
      setLoading(false)
    }
  }

  // Usar saldo da API ou prop passada
  const saldoFinal = saldoAtual !== undefined ? saldoAtual : saldo

  // Animação do saldo
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedSaldo(saldoFinal)
    }, 300)
    return () => clearTimeout(timer)
  }, [saldoFinal])

  const formatarHora = (data: Date) => {
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-rocket-red-600 via-rocket-red-700 to-rocket-grey-700 rounded-xl p-8 shadow-xl border border-zinc-800">
        <div className="flex items-center justify-center py-16">
          <AiOutlineLoading3Quarters className="text-3xl text-white animate-spin mr-3" />
          <span className="text-white text-lg">Carregando saldo...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-rocket-red-600 via-rocket-red-700 to-rocket-grey-700 rounded-xl p-8 shadow-2xl border border-zinc-800 relative overflow-hidden shadow-lg shadow-black/10">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-rocket-700 p-3 rounded-full">
              <AiOutlineWallet className="text-yellow-400 text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Minha Carteira
              </h2>
              <p className="text-gray-300 text-sm">
                RocketCoins disponíveis
              </p>
            </div>
          </div>

          <button
            onClick={buscarSaldo}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
            title="Atualizar saldo"
          >
            <AiOutlineReload className={`text-white text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Erro */}
        {erro && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-red-300 text-sm">{erro}</span>
              <button
                onClick={buscarSaldo}
                className="text-red-300 hover:text-red-200 text-sm underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        <div className="text-center mb-8">

          <div className="bg-gray-rocket-700 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Carteira ativa</span>
              </div>

              {ultimaAtualizacao && (
                <div className="text-gray-400 text-xs">
                  Atualizado às {formatarHora(ultimaAtualizacao)}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center mb-4">
              <AiFillDollarCircle className="text-yellow-400 text-4xl mr-2" />
              <span className="text-gray-300 text-lg font-medium">RTC$</span>
            </div>

            <div className="text-6xl font-bold text-white mb-2 font-mono tracking-tight">
              {animatedSaldo.toFixed(2)}
            </div>

            <div className="text-gray-300 text-sm">
              Saldo atual disponível
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-rocket-700 border border-gray-rocket-600 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500/20 p-1 rounded">
              <AiFillDollarCircle className="text-yellow-400 text-sm" />
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1">
                Dica Rocket 💡
              </p>
              <p className="text-white text-xs leading-relaxed">
                Use seus RocketCoins para solicitar gastos e recompensas. Ganhe mais cumprindo suas metas!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardCoin