import { useState, useEffect } from 'react'
import { AiFillDollarCircle, AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineWarning, AiOutlineRise, AiOutlineFall, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { walletService } from '../../hooks/useWallet'

interface CardCoinProps {
  // Props opcionais para override manual
  saldoAtual?: number
  ganhosMes?: number
  gastosMes?: number
  metaMensal?: number
  // Nova prop para forçar carregamento da API
  loadFromAPI?: boolean
}

function CardCoin({
  saldoAtual,
  ganhosMes,
  gastosMes,
  metaMensal = 500,
  loadFromAPI = true
}: CardCoinProps) {
  const [animatedSaldo, setAnimatedSaldo] = useState(0)
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    ganhosMes: 0,
    gastosMes: 0
  })
  const [loading, setLoading] = useState(loadFromAPI)
  const [erro, setErro] = useState('')

  // Calcular ganhos/gastos do mês atual das transações
  const calcularMovimentacaoMes = (transactions: any[]) => {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    let ganhosMesAtual = 0
    let gastosMesAtual = 0

    transactions.forEach(transaction => {
      const dataTransacao = new Date(transaction.createdAt)

      if (dataTransacao >= inicioMes && dataTransacao <= fimMes) {
        const valor = parseFloat(transaction.amount)

        if (transaction.type === 'EARNED') {
          ganhosMesAtual += valor
        } else if (transaction.type === 'SPENT') {
          gastosMesAtual += valor
        }
      }
    })

    return { ganhosMesAtual, gastosMesAtual }
  }

  // Buscar dados da carteira quando loadFromAPI é true
  useEffect(() => {
    if (loadFromAPI) {
      buscarDadosCarteira()
    }
  }, [loadFromAPI])

  const buscarDadosCarteira = async () => {
    try {
      setLoading(true)
      setErro('')

      const response = await walletService.buscarCarteira()

      if (response.success && response.wallet) {
        const wallet = response.wallet

        // Calcular movimentação do mês
        const { ganhosMesAtual, gastosMesAtual } = calcularMovimentacaoMes(wallet.transactions)

        const dadosCarteira = {
          balance: parseFloat(wallet.balance),
          totalEarned: parseFloat(wallet.totalEarned),
          totalSpent: parseFloat(wallet.totalSpent),
          ganhosMes: ganhosMesAtual,
          gastosMes: gastosMesAtual
        }

        setWalletData(dadosCarteira)

        console.log('Dados da carteira carregados:', dadosCarteira)
      } else {
        throw new Error(response.message || 'Erro ao carregar carteira')
      }
    } catch (error: any) {
      console.error('Erro ao buscar carteira:', error)
      setErro(error.message || 'Erro ao carregar dados da carteira')

      setWalletData({
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        ganhosMes: 0,
        gastosMes: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Usar dados da API ou props passadas
  const saldoFinal = saldoAtual !== undefined ? saldoAtual : walletData.balance
  const ganhosFinal = ganhosMes !== undefined ? ganhosMes : walletData.ganhosMes
  const gastosFinal = gastosMes !== undefined ? gastosMes : walletData.gastosMes

  const saldoLiquidoMes = ganhosFinal - gastosFinal
  const percentualMeta = (ganhosFinal / metaMensal) * 100
  const crescimentoPositivo = saldoLiquidoMes > 0

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedSaldo(saldoFinal)
    }, 300)
    return () => clearTimeout(timer)
  }, [saldoFinal])

  const getTrendingColor = () => {
    if (percentualMeta >= 100) return 'text-green-500'
    if (percentualMeta >= 75) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getMesAtual = () => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return meses[new Date().getMonth()]
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-rocket-red-700 to-rocket-grey-600 rounded-lg p-6 shadow-xl border border-zinc-950">
        <div className="flex items-center justify-center py-12">
          <AiOutlineLoading3Quarters className="text-2xl text-white animate-spin mr-3" />
          <span className="text-white">Carregando carteira...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-rocket-red-700 to-rocket-grey-600 rounded-lg p-6 shadow-xl border border-zinc-950">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          Minha Carteira RocketCoins
          <AiFillDollarCircle className="ml-2 text-yellow-500 text-2xl" />
        </h2>
        <div className="text-sm text-gray-400">
          {getMesAtual()} 2025
        </div>
      </div>

      {erro && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {erro}
          <button
            onClick={buscarDadosCarteira}
            className="ml-2 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="text-gray-300 text-sm mb-2">Saldo Atual</div>
        <div className="text-5xl font-bold text-white mb-2 font-mono">
          RC$ {animatedSaldo.toFixed(2)}
        </div>
        <div className={`flex items-center justify-center space-x-1 ${
          crescimentoPositivo ? 'text-green-400' : 'text-red-400'
        }`}>
          {crescimentoPositivo ? (
            <AiOutlineRise className="text-lg" />
          ) : (
            <AiOutlineFall className="text-lg" />
          )}
          <span className="text-sm font-medium text-white">
            RC$ {Math.abs(saldoLiquidoMes).toFixed(2)} este mês
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-900 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-400 text-sm font-medium">Ganhos do Mês</div>
              <div className="text-xl font-bold text-white">
                RC$ {ganhosFinal.toFixed(2)}
              </div>
            </div>
            <AiOutlineArrowUp className="text-green-400 text-xl" />
          </div>
        </div>

        <div className="bg-red-900 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-red-400 text-sm font-medium">Gastos do Mês</div>
              <div className="text-xl font-bold text-white">
                RC$ {gastosFinal.toFixed(2)}
              </div>
            </div>
            <AiOutlineArrowDown className="text-red-400 text-xl" />
          </div>
        </div>

        <div className={`bg-blue-900 border border-blue-500/30 rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-400 text-sm font-medium">Meta Mensal</div>
              <div className={`text-xl font-bold text-white`}>
                {percentualMeta.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">
                RC$ {ganhosFinal.toFixed(0)} / RC$ {metaMensal}
              </div>
            </div>
            <AiOutlineWarning className={`text-xl ${getTrendingColor()}`} />
          </div>
        </div>
      </div>

      {/* Botão para atualizar dados */}
      <div className="flex justify-end">
        <button
          onClick={buscarDadosCarteira}
          disabled={loading}
          className="text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Atualizando...' : 'Atualizar dados'}
        </button>
      </div>
    </div>
  )
}

export default CardCoin