import { useState, useEffect, useCallback } from 'react'
import {
   AiOutlineBarChart,
   AiOutlineDownload,
   AiOutlineDollarCircle,
   AiOutlineLoading3Quarters,
   AiOutlinePlus,
   AiOutlineMinus,
   AiOutlineEye
} from 'react-icons/ai'
import { walletService } from '../../hooks/useWallet'

interface TransacaoRelatorio {
   id: number
   userId: number
   userName: string
   userEmail: string
   type: 'CREDIT' | 'DEBIT'
   amount: string
   title: string
   description: string
   createdAt: string
   processedBy?: string
   processor: {
      id: string,
      email: string,
      name: string
   }
}

function RelatorioRocketcoins() {
   const [transacoes, setTransacoes] = useState<TransacaoRelatorio[]>([])
   const [carregandoTransacoes, setCarregandoTransacoes] = useState(false)
   const [dataInicio, setDataInicio] = useState('')
   const [dataFim, setDataFim] = useState('')
   const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'CREDIT' | 'DEBIT'>('todos')
   const [paginacao, setPaginacao] = useState({
      paginaAtual: 1,
      totalPaginas: 1,
      totalItens: 0
   })

   const buscarTransacoes = useCallback(async (pagina: number = 1) => {
      try {
         setCarregandoTransacoes(true)

         const response = await walletService.buscarRelatorioTransacoes({
            dataInicio,
            dataFim,
            tipo: tipoFiltro === 'todos' ? undefined : tipoFiltro,
            page: pagina,
            limit: 20
         })

         if (response.success) {
            setTransacoes(response.transacoes || [])

            if (response.pagination) {
               setPaginacao({
                  paginaAtual: response.pagination.currentPage,
                  totalPaginas: response.pagination.totalPages,
                  totalItens: response.pagination.totalItems
               })
            }
         }
      } catch (error) {
         console.error('Erro ao buscar transações:', error)
      } finally {
         setCarregandoTransacoes(false)
      }
   }, [dataInicio, dataFim, tipoFiltro])

   useEffect(() => {
      const hoje = new Date()
      const umMesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate())

      setDataFim(hoje.toISOString().split('T')[0])
      setDataInicio(umMesAtras.toISOString().split('T')[0])
   }, [])

   useEffect(() => {
      if (dataInicio && dataFim) {
         buscarTransacoes()
      }
   }, [dataInicio, dataFim, tipoFiltro, paginacao.paginaAtual, buscarTransacoes])

   const exportarRelatorio = async () => {
      try {
         setCarregandoTransacoes(true)

         const response = await walletService.exportarRelatorio({
            dataInicio,
            dataFim,
            tipo: tipoFiltro === 'todos' ? undefined : tipoFiltro
         })

         if (response.success && response.data) {
            const blob = new Blob([response.data], {
               type: 'text/csv;charset=utf-8;'
            })

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = response.filename || `relatorio-rocketcoins-${dataInicio}-${dataFim}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            alert('Relatório exportado com sucesso!')
         } else {
            throw new Error('Não foi possível exportar o relatório')
         }
      } catch (error) {
         console.error('Erro ao exportar relatório:', error)

         const errorMessage = error instanceof Error
            ? error.message
            : 'Erro desconhecido ao exportar relatório'

         alert(`Erro ao exportar relatório: ${errorMessage}`)
      } finally {
         setCarregandoTransacoes(false)
      }
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
               <AiOutlineBarChart className="text-2xl text-blue-500" />
               <div>
                  <h2 className="text-xl font-semibold text-white">
                     Relatórios de Rocketcoins
                  </h2>
                  <p className="text-gray-400">
                     Estatísticas detalhadas e histórico de transações
                  </p>
               </div>
            </div>

            <button
               onClick={exportarRelatorio}
               disabled={carregandoTransacoes || !dataInicio || !dataFim}
               className="bg-rocket-red-600 hover:bg-rocket-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
               {carregandoTransacoes ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
               ) : (
                  <AiOutlineDownload />
               )}
               <span>
                  {carregandoTransacoes ? 'Exportando...' : 'Exportar CSV'}
               </span>
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
               <label className="block text-gray-300 text-sm font-medium mb-2">
                  Data Início
               </label>
               <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full bg-gray-rocket-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
               />
            </div>

            <div>
               <label className="block text-gray-300 text-sm font-medium mb-2">
                  Data Fim
               </label>
               <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full bg-gray-rocket-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
               />
            </div>

            <div>
               <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tipo de Transação
               </label>
               <select
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value as 'todos' | 'CREDIT' | 'DEBIT')}
                  className="w-full bg-gray-rocket-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
               >
                  <option value="todos">Todas</option>
                  <option value="CREDIT">Créditos</option>
                  <option value="DEBIT">Débitos</option>
               </select>
            </div>

            <div>
               <label className="block text-transparent text-sm font-medium mb-2 select-none">
                  Ação
               </label>
               <button
                  onClick={() => buscarTransacoes(1)}
                  disabled={carregandoTransacoes}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
               >
                  {carregandoTransacoes ? (
                     <AiOutlineLoading3Quarters className="animate-spin" />
                  ) : (
                     <AiOutlineEye />
                  )}
                  <span>Filtrar</span>
               </button>
            </div>
         </div>

         <div className="bg-gray-rocket-700/50 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
               <h3 className="text-lg font-medium text-white flex items-center">
                  <AiOutlineDollarCircle className="mr-2 text-green-400" />
                  Histórico de Transações
                  {paginacao.totalItens > 0 && (
                     <span className="ml-2 text-sm text-gray-400">
                        ({paginacao.totalItens} {paginacao.totalItens === 1 ? 'transação' : 'transações'})
                     </span>
                  )}
               </h3>
            </div>

            <div className="p-6">
               {carregandoTransacoes ? (
                  <div className="flex items-center justify-center py-12">
                     <AiOutlineLoading3Quarters className="animate-spin text-2xl text-gray-400 mr-3" />
                     <span className="text-gray-400">Carregando transações...</span>
                  </div>
               ) : transacoes.length > 0 ? (
                  <div className="space-y-4">
                     {transacoes.map((transacao) => (
                        <div
                           key={transacao.id}
                           className={`p-4 rounded-lg border transition-all ${transacao.type === 'CREDIT'
                              ? 'bg-green-600/10 border-green-500/30'
                              : 'bg-red-600/10 border-red-500/30'
                              }`}
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                 <div className={`p-2 rounded-full ${transacao.type === 'CREDIT' ? 'bg-green-500/20' : 'bg-red-500/20'
                                    }`}>
                                    {transacao.type === 'CREDIT' ? (
                                       <AiOutlinePlus className="text-green-400" />
                                    ) : (
                                       <AiOutlineMinus className="text-red-400" />
                                    )}
                                 </div>

                                 <div>
                                    <h4 className="text-white font-medium">
                                       {transacao.title}
                                    </h4>
                                    <p className="text-gray-400 text-sm">
                                       {transacao.processor.name} ({transacao.processor.email})
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                       {transacao.description}
                                    </p>
                                 </div>
                              </div>

                              <div className="text-right">
                                 <div className={`font-bold text-lg font-mono ${transacao.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {transacao.type === 'CREDIT' ? '+' : '-'}RTC$ {Number(transacao.amount).toFixed(2)}
                                 </div>
                                 <div className="text-gray-400 text-xs">
                                    {new Date(transacao.createdAt).toLocaleDateString('pt-BR')} às{' '}
                                    {new Date(transacao.createdAt).toLocaleTimeString('pt-BR')}
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}

                     {paginacao.totalPaginas > 1 && (
                        <div className="flex items-center justify-center space-x-2 pt-6">
                           <button
                              onClick={() => buscarTransacoes(paginacao.paginaAtual - 1)}
                              disabled={paginacao.paginaAtual === 1 || carregandoTransacoes}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
                           >
                              ← Anterior
                           </button>

                           <span className="text-gray-400 text-sm">
                              Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
                           </span>

                           <button
                              onClick={() => buscarTransacoes(paginacao.paginaAtual + 1)}
                              disabled={paginacao.paginaAtual === paginacao.totalPaginas || carregandoTransacoes}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
                           >
                              Próxima →
                           </button>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="text-center py-12">
                     <AiOutlineBarChart className="mx-auto text-4xl text-gray-500 mb-4" />
                     <h3 className="text-gray-400 text-lg mb-2">
                        Nenhuma transação encontrada
                     </h3>
                     <p className="text-gray-500">
                        Ajuste os filtros para visualizar transações
                     </p>
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}

export default RelatorioRocketcoins