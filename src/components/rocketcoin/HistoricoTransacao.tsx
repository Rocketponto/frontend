import { useState } from 'react'
import { AiOutlinePlus, AiOutlineMinus, AiOutlineCalendar, AiOutlineFilter } from 'react-icons/ai'

interface Transacao {
  id: string
  titulo: string
  valor: number
  data: string
  tipo: 'entrada' | 'saida'
  categoria?: string
}

function HistoricoTransacoes() {
  const [transacoes] = useState<Transacao[]>([
    {
      id: '1',
      titulo: 'Ponto Registrado',
      valor: 25.00,
      data: '05/06/2025',
      tipo: 'entrada',
      categoria: 'Ponto'
    },
    {
      id: '2',
      titulo: 'Bônus Semanal',
      valor: 50.00,
      data: '04/06/2025',
      tipo: 'entrada',
      categoria: 'Bônus'
    },
    {
      id: '3',
      titulo: 'Desconto Almoço',
      valor: 15.00,
      data: '04/06/2025',
      tipo: 'saida',
      categoria: 'Recompensa'
    },
    {
      id: '4',
      titulo: 'Pontualidade',
      valor: 10.00,
      data: '03/06/2025',
      tipo: 'entrada',
      categoria: 'Bônus'
    },
    {
      id: '5',
      titulo: 'Home Office',
      valor: 100.00,
      data: '02/06/2025',
      tipo: 'saida',
      categoria: 'Recompensa'
    },
    {
      id: '6',
      titulo: 'Ponto Registrado',
      valor: 25.00,
      data: '02/06/2025',
      tipo: 'entrada',
      categoria: 'Ponto'
    },
    {
      id: '7',
      titulo: 'Overtime Bonus',
      valor: 75.00,
      data: '01/06/2025',
      tipo: 'entrada',
      categoria: 'Bônus'
    },
    {
      id: '8',
      titulo: 'Vale Transporte',
      valor: 30.00,
      data: '01/06/2025',
      tipo: 'saida',
      categoria: 'Recompensa'
    }
  ])

  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos')

  const transacoesFiltradas = filtroTipo === 'todos'
    ? transacoes
    : transacoes.filter(t => t.tipo === filtroTipo)

  const totalEntradas = transacoes
    .filter(t => t.tipo === 'entrada')
    .reduce((acc, t) => acc + t.valor, 0)

  const totalSaidas = transacoes
    .filter(t => t.tipo === 'saida')
    .reduce((acc, t) => acc + t.valor, 0)

  return (
    <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          Histórico de Transações
          <AiOutlineCalendar className="ml-2 text-white" />
        </h3>

        <div className="flex items-center space-x-2">
          <AiOutlineFilter className="text-gray-400" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as any)}
            className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600"
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-green-400 text-xs font-medium">Total Entradas</div>
          <div className="text-lg font-bold text-white">
            RC$ {totalEntradas.toFixed(2)}
          </div>
        </div>
        <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-3">
          <div className="text-red-400 text-xs font-medium">Total Saídas</div>
          <div className="text-lg font-bold text-white">
            RC$ {totalSaidas.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transacoesFiltradas.length > 0 ? (
          transacoesFiltradas.map((transacao) => (
            <div
              key={transacao.id}
              className={`relative p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                transacao.tipo === 'entrada'
                  ? 'bg-green-600/10 border-green-500/30 hover:bg-green-600/20'
                  : 'bg-red-600/10 border-red-500/30 hover:bg-red-600/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transacao.tipo === 'entrada'
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    {transacao.tipo === 'entrada' ? (
                      <AiOutlinePlus className={`text-lg ${
                        transacao.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'
                      }`} />
                    ) : (
                      <AiOutlineMinus className={`text-lg ${
                        transacao.tipo === 'saida' ? 'text-red-400' : 'text-red-400'
                      }`} />
                    )}
                  </div>

                  <div>
                    <h4 className="text-white font-medium text-sm">
                      {transacao.titulo}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {transacao.categoria}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold text-lg font-mono ${
                    transacao.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transacao.tipo === 'entrada' ? '+' : '-'}RC$ {transacao.valor.toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {transacao.data}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400">
              Nenhuma transação encontrada
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-center">
          <span className="text-sm text-gray-400">
            {transacoesFiltradas.length} de {transacoes.length} transações
          </span>
        </div>
      </div>
    </div>
  )
}

export default HistoricoTransacoes