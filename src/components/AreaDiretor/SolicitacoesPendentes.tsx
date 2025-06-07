import { AiOutlineCheckCircle, AiOutlineClockCircle, AiOutlineCloseCircle, AiOutlineLoading3Quarters, AiOutlineReload, AiOutlineUser } from "react-icons/ai"
import { walletService } from "../../hooks/useWallet"
import { useEffect, useState } from "react"

interface Solicitacao {
   id: number
   walletId: number
   type: 'DEBIT' | 'CREDIT'
   amount: string
   title: string
   description: string
   reference: string
   processedBy: string | null
   status: 'PENDING' | 'APPROVED' | 'REJECTED'
   balanceBefore: string
   balanceAfter: string
   createdAt: string
   updatedAt: string
   wallet: {
     id: number
     userId: number
     balance: string
     totalEarned: string
     totalSpent: string
     isActive: boolean
     createdAt: string
     updatedAt: string
     user: {
       id: string
       name: string
       email: string
       role: string
     }
   }
 }

interface SolicitacoesPendentesProps {
  onUpdate: () => void;
}

function SolicitacoesPendentes({ onUpdate }: SolicitacoesPendentesProps) {
   const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
   const [carregando, setCarregando] = useState(true)
   const [processando, setProcessando] = useState<number | null>(null)
   const [filtro, setFiltro] = useState<'todos' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

   const [paginacao, setPaginacao] = useState({
     paginaAtual: 1,
     totalPaginas: 1,
     totalItens: 0,
     itensPorPagina: 5
   })

   useEffect(() => {
     buscarSolicitacoes()
   }, [filtro, paginacao.paginaAtual])

   const buscarSolicitacoes = async () => {
     try {
       setCarregando(true)

       let response

       if (filtro === 'PENDING' || filtro === 'todos') {
         response = await walletService.buscarTodasSolicitacoesPendentes({
           page: paginacao.paginaAtual,
           limit: paginacao.itensPorPagina
         })
       } else {
         response = await walletService.buscarTodasSolicitacoesPendentes({
           page: paginacao.paginaAtual,
           limit: paginacao.itensPorPagina
         })
       }

       if (response.success) {
         setSolicitacoes(response.requests || [])

         if (response.pagination) {
           setPaginacao(prev => ({
             ...prev,
             totalPaginas: response.pagination?.totalPages || 1,
             totalItens: response.pagination?.totalItems ?? 0,
             itensPorPagina: response.pagination?.itemsPerPage ?? paginacao.itensPorPagina
           }))
         }
       }
     } catch (error) {
       console.error('Erro ao buscar solicitações:', error)
       setSolicitacoes([])
     } finally {
       setCarregando(false)
     }
   }

   const handleFiltroChange = (novoFiltro: typeof filtro) => {
     setFiltro(novoFiltro)
     setPaginacao(prev => ({ ...prev, paginaAtual: 1 }))
   }

   const irParaPagina = (pagina: number) => {
     setPaginacao(prev => ({ ...prev, paginaAtual: pagina }))
   }

   const processarSolicitacao = async (id: number, acao: 'APPROVED' | 'REJECTED') => {
     try {
       setProcessando(id)

       let response

       if (acao === 'APPROVED') {
         response = await walletService.aprovarSolicitacao(id)
         buscarSolicitacoes()
       } else {
         const motivo = prompt('Digite o motivo da rejeição (opcional):') || 'Rejeitado pelo diretor'
         response = await walletService.rejeitarSolicitacao(id, motivo)
         buscarSolicitacoes()
       }

       if (response.success) {
         await buscarSolicitacoes()
         onUpdate()

       } else {
         throw new Error(response.message || 'Erro ao processar solicitação')
       }
     } catch (error: any) {
       console.error('Erro ao processar solicitação:', error)
     } finally {
       setProcessando(null)
     }
   }

   const getStatusColor = (status: string) => {
     switch (status) {
       case 'PENDING': return 'bg-yellow-600/10 border-yellow-500/30 text-yellow-400'
       case 'APPROVED': return 'bg-green-600/10 border-green-500/30 text-green-400'
       case 'REJECTED': return 'bg-red-600/10 border-red-500/30 text-red-400'
       default: return 'bg-gray-600/10 border-gray-500/30 text-gray-400'
     }
   }

   const getStatusText = (status: string) => {
     switch (status) {
       case 'PENDING': return 'Pendente'
       case 'APPROVED': return 'Aprovado'
       case 'REJECTED': return 'Rejeitado'
       default: return status
     }
   }

   const solicitacoesFiltradas = filtro === 'todos'
     ? solicitacoes
     : solicitacoes.filter((sol: { status: any }) => sol.status === filtro)

   const verificarSaldoSuficiente = (solicitacao: Solicitacao) => {
     const saldoAtual = Number(solicitacao.wallet.balance)
     const valorSolicitado = Number(solicitacao.amount)
     return saldoAtual >= valorSolicitado
   }

   if (carregando) {
     return (
       <div className="flex items-center justify-center py-12">
         <AiOutlineLoading3Quarters className="text-2xl text-gray-400 animate-spin mr-3" />
         <span className="text-gray-400">Carregando solicitações...</span>
       </div>
     )
   }

   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <h2 className="text-xl font-semibold text-white flex items-center">
           <AiOutlineClockCircle className="mr-2 text-yellow-500" />
           Solicitações de Gastos
           {paginacao.totalItens > 0 && (
             <span className="ml-2 text-sm text-gray-400">
               ({paginacao.totalItens} {paginacao.totalItens === 1 ? 'solicitação' : 'solicitações'})
             </span>
           )}
         </h2>

         <div className="flex items-center space-x-4">
           <button
             onClick={buscarSolicitacoes}
             disabled={carregando}
             className="flex items-center bg-rocket-red-600 hover:bg-rocket-red-700 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
           >
            <AiOutlineReload className="mr-2" />
             Atualizar
           </button>
         </div>
       </div>

       <div className="space-y-4">
         {solicitacoesFiltradas.length > 0 ? (
           solicitacoesFiltradas.map((solicitacao) => (
             <div
               key={solicitacao.id}
               className={`border rounded-lg p-6 transition-all ${getStatusColor(solicitacao.status)}`}
             >
               <div className="flex items-start justify-between">
                 <div className="flex-1">
                   <div className="flex items-center space-x-3 mb-3">
                     <AiOutlineUser className="text-gray-400" />
                     <div>
                       <h3 className="text-white font-medium">
                         {solicitacao.wallet?.user?.name || 'Usuário não identificado'}
                       </h3>
                       <p className="text-gray-400 text-sm">
                         {solicitacao.wallet?.user?.email || 'Email não disponível'}
                       </p>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(solicitacao.status)}`}>
                       {getStatusText(solicitacao.status)}
                     </span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                       <h4 className="text-white font-medium text-lg">
                         {solicitacao.title}
                       </h4>
                       <p className="text-gray-400 text-sm">
                         {solicitacao.description}
                       </p>
                       {solicitacao.reference && (
                         <p className="text-gray-500 text-xs mt-1">
                           Ref: {solicitacao.reference}
                         </p>
                       )}
                     </div>

                     <div className="text-right">
                       <div className="text-red-400 font-bold text-xl font-mono">
                         -RC$ {Number(solicitacao.amount).toFixed(2)}
                       </div>
                       <div className="text-gray-400 text-sm">
                         Solicitado em {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}
                       </div>
                     </div>
                   </div>

                   <div className="flex items-center space-x-4 text-sm text-gray-400">
                     {solicitacao.status === 'PENDING' ? (
                       <>
                         <span>Saldo atual da carteira: <span className="text-green-700">RC$ {Number(solicitacao.wallet.balance).toFixed(2)}</span></span>
                         <span>→</span>
                         {verificarSaldoSuficiente(solicitacao) ? (
                           <span className="text-yellow-400">
                             Saldo após aprovação: RC$ {(Number(solicitacao.wallet.balance) - Number(solicitacao.amount)).toFixed(2)}
                           </span>
                         ) : (
                           <span className="text-red-400 font-medium">
                             ⚠️ Saldo insuficiente (faltam RC$ {(Number(solicitacao.amount) - Number(solicitacao.wallet.balance)).toFixed(2)})
                           </span>
                         )}
                       </>
                     ) : solicitacao.status === 'APPROVED' ? (
                       <>
                         <span>Valor processado: RC$ {Number(solicitacao.amount).toFixed(2)}</span>
                         <span>•</span>
                         <span className="text-green-400">Aprovado e debitado</span>
                         <span>•</span>
                         <span>Saldo atual: RC$ {Number(solicitacao.wallet.balance).toFixed(2)}</span>
                       </>
                     ) : solicitacao.status === 'REJECTED' ? (
                       <>
                         <span>Valor solicitado: RC$ {Number(solicitacao.amount).toFixed(2)}</span>
                         <span>•</span>
                         <span className="text-red-400">Rejeitado - sem alteração no saldo</span>
                         <span>•</span>
                         <span>Saldo atual: RC$ {Number(solicitacao.wallet.balance).toFixed(2)}</span>
                       </>
                     ) : (
                       <>
                         <span>Valor: RC$ {Number(solicitacao.amount).toFixed(2)}</span>
                         <span>•</span>
                         <span>Saldo atual: RC$ {Number(solicitacao.wallet.balance).toFixed(2)}</span>
                       </>
                     )}
                   </div>
                 </div>
               </div>

               {solicitacao.status === 'PENDING' && (
                 <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-700">
                   <button
                     onClick={() => processarSolicitacao(solicitacao.id, 'REJECTED')}
                     disabled={processando === solicitacao.id}
                     className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                   >
                     {processando === solicitacao.id ? (
                       <AiOutlineLoading3Quarters className="animate-spin" />
                     ) : (
                       <AiOutlineCloseCircle />
                     )}
                     <span>Rejeitar</span>
                   </button>

                   {verificarSaldoSuficiente(solicitacao) ? (
                     <button
                       onClick={() => processarSolicitacao(solicitacao.id, 'APPROVED')}
                       disabled={processando === solicitacao.id}
                       className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                     >
                       {processando === solicitacao.id ? (
                         <AiOutlineLoading3Quarters className="animate-spin" />
                       ) : (
                         <AiOutlineCheckCircle />
                       )}
                       <span>Aprovar</span>
                     </button>
                   ) : (
                     <button
                       disabled
                       className="flex items-center space-x-2 bg-gray-600 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
                       title="Saldo insuficiente para aprovação"
                     >
                       <AiOutlineCloseCircle />
                       <span>Saldo Insuficiente</span>
                     </button>
                   )}
                 </div>
               )}
             </div>
           ))
         ) : (
           <div className="text-center py-12">
             <AiOutlineClockCircle className="mx-auto text-4xl text-gray-500 mb-4" />
             <h3 className="text-gray-400 text-lg mb-2">
               Nenhuma solicitação encontrada
             </h3>
             <p className="text-gray-500">
               {filtro === 'PENDING'
                 ? 'Não há solicitações pendentes no momento'
                 : `Não há solicitações com status "${getStatusText(filtro)}"`
               }
             </p>
           </div>
         )}
       </div>

       {paginacao.totalPaginas > 1 && (
         <div className="flex items-center justify-center space-x-2 pt-6">
           <button
             onClick={() => irParaPagina(paginacao.paginaAtual - 1)}
             disabled={paginacao.paginaAtual === 1 || carregando}
             className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
           >
             ← Anterior
           </button>

           <span className="text-gray-400 text-sm">
             Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
           </span>

           <button
             onClick={() => irParaPagina(paginacao.paginaAtual + 1)}
             disabled={paginacao.paginaAtual === paginacao.totalPaginas || carregando}
             className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
           >
             Próxima →
           </button>
         </div>
       )}
     </div>
   )
 }

 export default SolicitacoesPendentes