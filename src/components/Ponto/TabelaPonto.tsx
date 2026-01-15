import { useState, useEffect, useCallback } from 'react'
import { AiOutlineCheck, AiOutlineClose, AiOutlineClockCircle, AiOutlineCalendar, AiOutlineLoading3Quarters, AiOutlineReload } from 'react-icons/ai'
import { pontoService } from '../../hooks/usePointRecord'

interface RegistroPonto {
   id: string
   data: string
   entrada: string | null
   saida: string | null
   total: string
   status: 'completo' | 'pendente' | 'ausente'
   description?: string
   totalHoras?: number
}

function TabelaPonto() {
   const [registros, setRegistros] = useState<RegistroPonto[]>([])
   const [loading, setLoading] = useState(true)
   const [erro, setErro] = useState('')

   const [paginacao, setPaginacao] = useState({
      paginaAtual: 1,
      totalPaginas: 1,
      totalItens: 0,
      itensPorPagina: 10
   })

   // CORRIGIR: Remover estado não usado ou implementar sua funcionalidade
   // Se não for usar o resumo, remova completamente
   // Se for usar, adicione onde necessário na UI
   // const [resumo, setResumo] = useState({
   //    totalRecords: 0,
   //    recordsInProgress: 0,
   //    recordsApproved: 0
   // })

   const buscarHistorico = useCallback(async () => {
      try {
         setLoading(true)
         setErro('')

         const user = localStorage.getItem('user')
         const userData = user ? JSON.parse(user) : null

         const response = await pontoService.buscarHistoricoPonto( userData.id,{
            page: paginacao.paginaAtual,
            limit: paginacao.itensPorPagina
         })

         if (response.success && response.data) {
            const registrosFormatados = response.data.map(ponto => {
               const data = new Date(ponto.createdAt).toLocaleDateString('pt-BR')

               const entrada = ponto.entryDateHour
                  ? new Date(ponto.entryDateHour).toLocaleTimeString('pt-BR', {
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit'
                  })
                  : null

               const saida = ponto.exitDateHour
                  ? new Date(ponto.exitDateHour).toLocaleTimeString('pt-BR', {
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit'
                  })
                  : null

               const total = ponto.workingHours
                  ? `${String(ponto.workingHours.hours).padStart(2, '0')}:${String(ponto.workingHours.minutes).padStart(2, '0')}:00`
                  : '--:--:--'

               let status: 'completo' | 'pendente' | 'ausente'
               if (ponto.pointRecordStatus === 'APPROVED' && entrada && saida) {
                  status = 'completo'
               } else if (ponto.pointRecordStatus === 'PENDING' || (entrada && !saida)) {
                  status = 'pendente'
               } else {
                  status = 'ausente'
               }

               return {
                  id: ponto.id,
                  data,
                  entrada,
                  saida,
                  total,
                  status,
                  description: ponto.description,
                  totalHoras: ponto.workingHours?.totalHours || 0
               }
            })

            setRegistros(registrosFormatados)

            if (response.pagination) {
               setPaginacao({
                  paginaAtual: response.pagination.currentPage,
                  totalPaginas: response.pagination.totalPages,
                  totalItens: response.pagination.totalItems,
                  itensPorPagina: response.pagination.itemsPerPage
               })
            }

            // ✅ CORRIGIR: Se quiser usar o resumo, descomente e implemente na UI
            // if (response.summary) {
            //    setResumo(response.summary)
            // }
         }
      } catch (error) { // ✅ CORRIGIR: Remover 'any'
         console.error('Erro ao buscar histórico:', error)

         // ✅ TRATAMENTO adequado do erro
         const errorMessage = error instanceof Error
            ? error.message
            : 'Erro ao buscar histórico de pontos'

         setErro(errorMessage)
      } finally {
         setLoading(false)
      }
   }, [paginacao.paginaAtual, paginacao.itensPorPagina]) // ✅ ADICIONAR dependências necessárias

   // ✅ CORRIGIR: Incluir buscarHistorico nas dependências
   useEffect(() => {
      buscarHistorico()
   }, [buscarHistorico])

   const getStatusIcon = (status: string) => {
      switch (status) {
         case 'completo':
            return <AiOutlineCheck className="text-green-500" />
         case 'pendente':
            return <AiOutlineClockCircle className="text-yellow-500" />
         case 'ausente':
            return <AiOutlineClose className="text-red-500" />
         default:
            return <AiOutlineClockCircle className="text-gray-500" />
      }
   }

   const getStatusText = (status: string) => {
      switch (status) {
         case 'completo':
            return 'Aprovado'
         case 'pendente':
            return 'Pendente'
         case 'ausente':
            return 'Ausente'
         default:
            return 'Indefinido'
      }
   }

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'completo':
            return 'text-green-500 bg-green-500/10'
         case 'pendente':
            return 'text-yellow-500 bg-yellow-500/10'
         case 'ausente':
            return 'text-red-500 bg-red-500/10'
         default:
            return 'text-gray-500 bg-gray-500/10'
      }
   }

   const irParaPagina = (pagina: number) => {
      setPaginacao(prev => ({ ...prev, paginaAtual: pagina }))
   }

   if (loading) {
      return (
         <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
            <div className="flex items-center justify-center h-64">
               <div className="flex items-center space-x-3 text-gray-400">
                  <AiOutlineLoading3Quarters className="text-2xl animate-spin" />
                  <span>Carregando histórico...</span>
               </div>
            </div>
         </div>
      )
   }

   if (erro) {
      return (
         <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
            <div className="flex items-center justify-center h-64">
               <div className="text-center">
                  <AiOutlineClose className="text-4xl text-red-500 mx-auto mb-4" />
                  <p className="text-red-400 mb-4">{erro}</p>
                  <button
                     onClick={buscarHistorico}
                     className="bg-rocket-red-600 hover:bg-rocket-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                     Tentar novamente
                  </button>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
               Histórico de Registros
               <AiOutlineCalendar className="ml-2 text-white" />
            </h3>
            <div className="flex items-center space-x-4">
               <span className="text-sm text-gray-400">
                  {registros.length} registros
               </span>
               <button
                  onClick={buscarHistorico}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-rocket-red-600 hover:bg-rocket-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg disabled:cursor-not-allowed"
               >
                  {loading ? (
                     <>
                        <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                        <span>Atualizando...</span>
                     </>
                  ) : (
                     <>
                        <AiOutlineReload className="w-4 h-4" />
                        <span>Atualizar</span>
                     </>
                  )}
               </button>
            </div>
         </div>

         {registros.length === 0 ? (
            <div className="text-center py-12">
               <AiOutlineClockCircle className="text-4xl text-gray-500 mx-auto mb-4" />
               <p className="text-gray-400">Nenhum registro encontrado</p>
            </div>
         ) : (
            <>
               {/* Tabela */}
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="border-b border-gray-700">
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Data</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Entrada</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Saída</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Total</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Descrição</th>
                        </tr>
                     </thead>
                     <tbody>
                        {registros.map((registro) => (
                           <tr
                              key={registro.id}
                              className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                           >
                              <td className="py-4 px-4">
                                 <span className="text-white font-medium">
                                    {registro.data}
                                 </span>
                              </td>
                              <td className="py-4 px-4">
                                 <span className={`font-mono ${registro.entrada ? 'text-green-400' : 'text-gray-500'}`}>
                                    {registro.entrada || '--:--:--'}
                                 </span>
                              </td>
                              <td className="py-4 px-4">
                                 <span className={`font-mono ${registro.saida ? 'text-red-400' : 'text-gray-500'}`}>
                                    {registro.saida || '--:--:--'}
                                 </span>
                              </td>
                              <td className="py-4 px-4">
                                 <span className={`font-mono font-bold ${registro.status === 'completo' ? 'text-white' : 'text-gray-500'}`}>
                                    {registro.total}
                                 </span>
                              </td>
                              <td className="py-4 px-4">
                                 <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getStatusColor(registro.status)}`}>
                                    {getStatusIcon(registro.status)}
                                    <span className="font-medium">
                                       {getStatusText(registro.status)}
                                    </span>
                                 </div>
                              </td>
                              <td className="py-4 px-4 max-w-xs">
                                 <span className="text-gray-300 text-sm truncate block" title={registro.description}>
                                    {registro.description || 'Sem descrição'}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Cards de Estatísticas */}
               <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                     <div className="text-green-400 text-sm font-medium">Aprovados</div>
                     <div className="text-2xl font-bold text-white">
                        {registros.filter(r => r.status === 'completo').length}
                     </div>
                  </div>
                  <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                     <div className="text-yellow-400 text-sm font-medium">Pendentes</div>
                     <div className="text-2xl font-bold text-white">
                        {registros.filter(r => r.status === 'pendente').length}
                     </div>
                  </div>
                  <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4">
                     <div className="text-red-400 text-sm font-medium">Ausências</div>
                     <div className="text-2xl font-bold text-white">
                        {registros.filter(r => r.status === 'ausente').length}
                     </div>
                  </div>
                  <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                     <div className="text-blue-400 text-sm font-medium">Total Horas</div>
                     <div className="text-2xl font-bold text-white">
                        {registros.reduce((acc, r) => acc + (r.totalHoras || 0), 0).toFixed(1)}h
                     </div>
                  </div>
               </div>

               {/* Paginação */}
               {paginacao.totalPaginas > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-4">
                     <button
                        onClick={() => irParaPagina(paginacao.paginaAtual - 1)}
                        disabled={paginacao.paginaAtual === 1}
                        className="px-3 py-1 bg-rocket-red-600 hover:bg-rocket-red-700 disabled:bg-gray-800 text-white rounded"
                     >
                        ← Anterior
                     </button>

                     <span className="text-gray-400">
                        Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
                     </span>

                     <button
                        onClick={() => irParaPagina(paginacao.paginaAtual + 1)}
                        disabled={paginacao.paginaAtual === paginacao.totalPaginas}
                        className="px-3 py-1 bg-rocket-red-600 hover:bg-rocket-red-700 disabled:bg-gray-800 text-white rounded"
                     >
                        Próxima →
                     </button>
                  </div>
               )}
            </>
         )}
      </div>
   )
}

export default TabelaPonto