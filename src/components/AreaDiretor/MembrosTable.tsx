import {
   AiOutlineLoading3Quarters,
   AiOutlineUser,
   AiOutlineLeft,
   AiOutlineRight
} from 'react-icons/ai'
import { pontoService } from '../../hooks/usePointRecord'
import { useToast } from '../Toast/ToastProvider'
import { useState } from 'react'

interface PontoMembro {
   id: string
   userId: string
   user: {
      id: string
      name: string
      email: string
      role: string
   }
   entryDateHour: string | null
   exitDateHour: string | null
   pointRecordStatus: 'APPROVED' | 'IN_PROGRESS' | 'REJECTED'
   description: string
   workingHours: {
      hours: number
      minutes: number
      totalHours: number
   }
   createdAt: string
   updatedAt: string
}

interface Paginacao {
   page: number
   limit: number
   totalItems: number
   totalPages: number
}

interface TabelaPontosPaginadaProps {
   pontos: PontoMembro[]
   paginacao: Paginacao
   loading: boolean
   erro: string
   processando: string | null
   onAprovarPonto: (pontoId: string) => Promise<void>
   onRejeitarPonto: (pontoId: string) => Promise<void>
   onPaginaChange: (page: number) => void
   onRecarregarTabela: () => Promise<void>
}

function MembrosTable({
   pontos,
   paginacao,
   loading,
   erro,
   onPaginaChange,
   onRecarregarTabela
}: TabelaPontosPaginadaProps) {

   const formatarData = (data: string) => {
      return new Date(data).toLocaleDateString('pt-BR')
   }
   const { showSuccess, showError } = useToast()
   const [processandoFechamento, setProcessandoFechamento] = useState<string | null>(null)

   const formatarHora = (data: string) => {
      return new Date(data).toLocaleTimeString('pt-BR', {
         hour: '2-digit',
         minute: '2-digit'
      })
   }

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'APPROVED':
            return 'bg-green-500/10 text-green-400 border-green-500/30'
         case 'IN_PROGRESS':
            return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
         case 'REJECTED':
            return 'bg-red-500/10 text-red-400 border-red-500/30'
         default:
            return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      }
   }

   const getStatusText = (status: string) => {
      switch (status) {
         case 'APPROVED': return 'Concluído'
         case 'IN_PROGRESS': return 'Em andamento'
         case 'REJECTED': return 'Rejeitado'
         default: return 'Indefinido'
      }
   }

   const handlePaginaAnterior = () => {
      if (paginacao.page > 1) {
         onPaginaChange(paginacao.page - 1)
      }
   }

   const handlePaginaProxima = () => {
      if (paginacao.page < paginacao.totalPages) {
         onPaginaChange(paginacao.page + 1)
      }
   }

   const closedPointRecord = async (recordPointId: number) => {
      try {
         setProcessandoFechamento(recordPointId.toString())

         const response = await pontoService.fecharPonto(recordPointId)

         if (response?.success) {
            showSuccess('Ponto fechado!', 'Ponto fechado com sucesso.')
            await onRecarregarTabela()
         } else {
            showError('Erro ao fechar ponto!', 'Resposta inválida do servidor.')
         }
      } catch (error: any) {
         showError('Erro ao fechar ponto!', error.message || 'Erro ao processar fechamento de ponto.')
      } finally {
         setProcessandoFechamento(null)
      }
   }

   return (
      <div className="bg-transparent border border-zinc-950 rounded-lg overflow-hidden">
         <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
               Resumo dos Registros de Ponto
            </h3>
         </div>

         {erro && (
            <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
               {erro}
            </div>
         )}

         {loading ? (
            <div className="flex items-center justify-center py-12">
               <AiOutlineLoading3Quarters className="text-2xl text-gray-400 animate-spin mr-3" />
               <span className="text-gray-400">Carregando registros...</span>
            </div>
         ) : pontos.length === 0 ? (
            <div className="text-center py-12">
               <AiOutlineUser className="text-4xl text-gray-500 mx-auto mb-4" />
               <p className="text-gray-400">Nenhum registro encontrado</p>
            </div>
         ) : (
            <>
               {/* Tabela */}
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-rocket-red-600/50">
                        <tr>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Funcionário</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Data</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Entrada</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Saída</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Total</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                           <th className="text-left py-3 px-4 font-medium text-gray-300">Descrição</th>
                           {pontos.some(ponto => ponto.pointRecordStatus === 'IN_PROGRESS') && (
                              <th className="text-left py-3 px-4 font-medium text-gray-300">Ação</th>
                           )}
                        </tr>
                     </thead>
                     <tbody>
                        {pontos.map((ponto) => (
                           <tr
                              key={ponto.id}
                              className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                           >
                              <td className="py-4 px-4">
                                 <div>
                                    <p className="text-white font-medium">{ponto.user.name}</p>
                                    <p className="text-gray-400 text-sm">{ponto.user.email}</p>
                                    <p className="text-rocket-red-400 text-xs">{ponto.user.role}</p>
                                 </div>
                              </td>
                              <td className="py-4 px-4">
                                 <span className="text-gray-300">
                                    {formatarData(ponto.createdAt)}
                                 </span>
                              </td>
                              <td className="py-4 px-4">
                                 <span className={`font-mono ${ponto.entryDateHour ? 'text-green-400' : 'text-gray-500'}`}>
                                    {ponto.entryDateHour ? formatarHora(ponto.entryDateHour) : '--:--'}
                                 </span>
                              </td>
                              <td className="py-4 px-4">
                                 <span className={`font-mono ${ponto.exitDateHour ? 'text-red-400' : 'text-gray-500'}`}>
                                    {ponto.exitDateHour ? formatarHora(ponto.exitDateHour) : '--:--'}
                                 </span>
                              </td>
                              <td className="py-4 px-4">
                                 <span className="font-mono text-white">
                                    {ponto.workingHours ?
                                       `${String(ponto.workingHours.hours).padStart(2, '0')}:${String(ponto.workingHours.minutes).padStart(2, '0')}`
                                       : '--:--'
                                    }
                                 </span>
                              </td>
                              <td className="py-4 px-4">
                                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getStatusColor(ponto.pointRecordStatus)}`}>
                                    {getStatusText(ponto.pointRecordStatus)}
                                 </span>
                              </td>
                              <td className="py-4 px-4 max-w-xs">
                                 <span className="text-gray-300 text-sm truncate block" title={ponto.description}>
                                    {ponto.description || 'Sem descrição'}
                                 </span>
                              </td>
                              {pontos.some(p => p.pointRecordStatus === 'IN_PROGRESS') && (
                                 <td className="py-4 px-4 max-w-xs">
                                    {ponto.pointRecordStatus === 'IN_PROGRESS' ? (
                                       <button
                                          onClick={() => closedPointRecord(Number(ponto.id))}
                                          disabled={processandoFechamento === ponto.id}
                                          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg p-2 text-sm transition-colors flex items-center space-x-1"
                                       >
                                          {processandoFechamento === ponto.id ? (
                                             <>
                                                <AiOutlineLoading3Quarters className="animate-spin w-4 h-4" />
                                                <span>Fechando...</span>
                                             </>
                                          ) : (
                                             <span>Fechar ponto</span>
                                          )}
                                       </button>
                                    ) : (
                                       <span className="text-gray-500 text-sm">-</span>
                                    )}
                                 </td>
                              )}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <button
                        onClick={handlePaginaAnterior}
                        disabled={paginacao.page === 1}
                        className="flex items-center px-3 py-2 bg-rocket-red-600/50 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
                     >
                        <AiOutlineLeft className="mr-1" />
                        Anterior
                     </button>

                     <span className="text-gray-300">
                        Página {paginacao.page} de {paginacao.totalPages}
                     </span>

                     <button
                        onClick={handlePaginaProxima}
                        disabled={paginacao.page === paginacao.totalPages}
                        className="flex items-center px-3 py-2 bg-rocket-red-600/50 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
                     >
                        Próxima
                        <AiOutlineRight className="ml-1" />
                     </button>
                  </div>
               </div>
            </>
         )}
      </div>
   )
}

export default MembrosTable