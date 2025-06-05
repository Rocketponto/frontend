import { useState, useEffect } from 'react'
import { AiFillDollarCircle, AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineWarning, AiOutlineRise, AiOutlineFall } from 'react-icons/ai'

interface CardCoinProps {
  saldoAtual: number
  ganhosMes: number
  gastosMes: number
  metaMensal?: number
}

function CardCoin({ saldoAtual, ganhosMes, gastosMes, metaMensal = 500 }: CardCoinProps) {
  const [animatedSaldo, setAnimatedSaldo] = useState(0)

  const saldoLiquidoMes = ganhosMes - gastosMes
  const percentualMeta = (ganhosMes / metaMensal) * 100
  const crescimentoPositivo = saldoLiquidoMes > 0

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedSaldo(saldoAtual)
    }, 300)
    return () => clearTimeout(timer)
  }, [saldoAtual])

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

  return (
    <div className="bg-gradient-to-r from-rocket-red-700 to-rocket-grey-600 rounded-lg p-6 shadow-xl border border-zinc-950">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          Minha Carteira Rocketcoins
          <AiFillDollarCircle className="ml-2 text-yellow-500 text-2xl" />
        </h2>
        <div className="text-sm text-gray-400">
          {getMesAtual()} 2025
        </div>
      </div>

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
              <div className="text-green-400 text-sm font-medium">Ganhos</div>
              <div className="text-xl font-bold text-white">
                RC$ {ganhosMes.toFixed(2)}
              </div>
            </div>
            <AiOutlineArrowUp className="text-green-400 text-xl" />
          </div>
        </div>

        <div className="bg-red-900 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-red-400 text-sm font-medium">Gastos</div>
              <div className="text-xl font-bold text-white">
                RC$ {gastosMes.toFixed(2)}
              </div>
            </div>
            <AiOutlineArrowDown className="text-red-400 text-xl" />
          </div>
        </div>

        <div className={`bg-blue-900 border border-blue-500/30 rounded-lg p-4 ${getTrendingColor()}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-400 text-sm font-medium">Meta Mensal</div>
              <div className="text-xl font-bold text-white">
                {percentualMeta.toFixed(0)}%
              </div>
            </div>
            <AiOutlineWarning className={`text-xl ${getTrendingColor()}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardCoin