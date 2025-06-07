import { useEffect, useState } from 'react'
import { AiOutlinePlus, AiOutlineMinus, AiOutlineCalendar, AiOutlineFilter } from 'react-icons/ai'
import { walletService } from '../../hooks/useWallet'

interface Transacao {
  id: string
  title: string
  description: string
  amount: string
  data: string
  type: 'DEBIT' | 'CREDIT'
  wallet?: {
    totalEaned: number
    totalSpent: number
  }
}

function HistoricoTransacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [totalSaida, setTotalSaida] = useState(0)
  const [totalEntrada, setTotalEntrada] = useState(0)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos')
  const [paginacao, setPaginacao] = useState({
    paginaAtual: 1,
    itensPorPagina: 5,
    totalItens: 0,
    totalPaginas: 0
  })


  const fetchHistoricoTransacoes = async (pagina: number = 1, limite: number = 5) => {
    try {
      setCarregando(true)

      const response = await walletService.buscarHistoricoTransacoes({
        page: pagina,
        limit: limite
      });

      if (response.success) {
        const transacoes = response.transactions
        setTransacoes(transacoes)
        console.log("aqui", response)

        const totalSaida = response.wallet.totalSpent
        setTotalSaida(Number(totalSaida))

        const totalEntrada = response.wallet.totalEarned
        setTotalEntrada(Number(totalEntrada))

        if (response.pagination) {
          setPaginacao({
            paginaAtual: response.pagination.currentPage || pagina,
            itensPorPagina: response.pagination.itemsPerPage || limite,
            totalItens: response.pagination.totalItems || 0,
            totalPaginas: response.pagination.totalPages || 0
          })
        }
      }
    } catch (error: any) {
      setErro(error.message || 'Erro ao buscar solicitações de transação.')
      setCarregando(false)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    fetchHistoricoTransacoes(1, 5)
  }, [])

  const proximaPagina = () => {
    if (paginacao.paginaAtual < paginacao.totalPaginas) {
      const novaPagina = paginacao.paginaAtual + 1
      fetchHistoricoTransacoes(novaPagina, paginacao.itensPorPagina)
    }
  }

  const paginaAnterior = () => {
    if (paginacao.paginaAtual > 1) {
      const novaPagina = paginacao.paginaAtual - 1
      fetchHistoricoTransacoes(novaPagina, paginacao.itensPorPagina)
    }
  }

  const irParaPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= paginacao.totalPaginas) {
      fetchHistoricoTransacoes(pagina, paginacao.itensPorPagina)
    }
  }

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
            RC$ {Number(totalEntrada.toFixed(2))}
          </div>
        </div>
        <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-3">
          <div className="text-red-400 text-xs font-medium">Total Saídas</div>
          <div className="text-lg font-bold text-white">
            RC$ {Number(totalSaida.toFixed(2))}
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-96">
        {transacoes.length > 0 ? (
          transacoes.map((transacao) => (
            <div
              key={transacao.id}
              className={`relative p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${transacao.type === 'CREDIT'
                  ? 'bg-green-600/10 border-green-500/30 hover:bg-green-600/20'
                  : 'bg-red-600/10 border-red-500/30 hover:bg-red-600/20'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${transacao.type === 'CREDIT'
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20'
                    }`}>
                    {transacao.type === 'CREDIT' ? (
                      <AiOutlinePlus className={`text-lg ${transacao.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'
                        }`} />
                    ) : (
                      <AiOutlineMinus className={`text-lg ${transacao.type === 'DEBIT' ? 'text-red-400' : 'text-red-400'
                        }`} />
                    )}
                  </div>

                  <div>
                    <h4 className="text-white font-medium text-sm">
                      {transacao.title}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold text-lg font-mono ${transacao.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {transacao.type === 'CREDIT' ? '+' : '-'}RC$ {Number(transacao.amount).toFixed(2)}
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

        {paginacao.totalPaginas > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
                ({paginacao.totalItens} {paginacao.totalItens === 1 ? 'solicitação' : 'solicitações'})
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={paginaAnterior}
                  disabled={paginacao.paginaAtual === 1 || carregando}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
                >
                  ← Anterior
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, paginacao.totalPaginas) }, (_, i) => {
                    let numeroPagina;

                    if (paginacao.totalPaginas <= 5) {
                      numeroPagina = i + 1;
                    } else {
                      const meio = Math.floor(5 / 2);
                      let inicio = Math.max(1, paginacao.paginaAtual - meio);
                      let fim = Math.min(paginacao.totalPaginas, inicio + 4);

                      if (fim - inicio < 4) {
                        inicio = Math.max(1, fim - 4);
                      }

                      numeroPagina = inicio + i;
                    }

                    return (
                      <button
                        key={numeroPagina}
                        onClick={() => irParaPagina(numeroPagina)}
                        disabled={carregando}
                        className={`px-3 py-1 rounded text-sm transition-colors ${numeroPagina === paginacao.paginaAtual
                            ? 'bg-rocket-red-600 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                          }`}
                      >
                        {numeroPagina}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={proximaPagina}
                  disabled={paginacao.paginaAtual === paginacao.totalPaginas || carregando}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
                >
                  Próxima →
                </button>
              </div>
            </div>

            {carregando && (
              <div className="text-center mt-2">
                <span className="text-sm text-gray-400">Carregando...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoricoTransacoes