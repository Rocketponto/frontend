import { useState, useEffect, useRef, useCallback } from 'react'
import { AiOutlineClose, AiOutlineUserDelete, AiOutlineSearch, AiOutlineLoading3Quarters, AiOutlineCheck, AiOutlineStop } from 'react-icons/ai'
import { authService } from '../../hooks/useAuth'

interface Usuario {
   id: string
   name: string
   email: string
   role: 'MEMBRO' | 'DIRETOR'
   isActive: boolean
   created_at: string
}

// ✅ ADICIONAR: Interface para resposta da API
interface UsuarioResponse {
   id: string | number
   name: string
   email: string
   role: string
   isActive?: boolean
   created_at: string
}

interface ModalGerenciarStatusProps {
   onClose: () => void
   onSuccess?: () => void
}

function ModalGerenciarStatus({ onClose, onSuccess }: ModalGerenciarStatusProps) {
   const [usuarios, setUsuarios] = useState<Usuario[]>([])
   const [loading, setLoading] = useState(true)
   const [loadingMore, setLoadingMore] = useState(false)
   const [processando, setProcessando] = useState<string | null>(null)
   const [filtro, setFiltro] = useState('')
   const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')
   const [erro, setErro] = useState('')

   const [paginacao, setPaginacao] = useState({
      paginaAtual: 1,
      totalPaginas: 1,
      totalItens: 0,
      itensPorPagina: 10,
      hasMore: true
   })

   const scrollContainerRef = useRef<HTMLDivElement>(null)

   // ✅ CORRIGIR: useCallback para evitar warning de dependência
   const buscarUsuarios = useCallback(async (pagina: number = 1, reset: boolean = false) => {
      try {
         if (reset) {
            setLoading(true)
            setUsuarios([])
         } else {
            setLoadingMore(true)
         }

         setErro('')

         const response = await authService.buscarMembros({
            page: pagina,
            limit: paginacao.itensPorPagina
         })

         if (response.success && response.data) {
            // ✅ CORRIGIR: Tipar adequadamente removendo 'any'
            const usuariosFormatados = response.data.map((user: UsuarioResponse) => ({
               id: String(user.id), // Garantir que seja string
               name: user.name,
               email: user.email,
               role: user.role as 'MEMBRO' | 'DIRETOR',
               isActive: user.isActive ?? true,
               created_at: user.created_at
            }))

            if (reset) {
               setUsuarios(usuariosFormatados)
            } else {
               setUsuarios(prev => [...prev, ...usuariosFormatados])
            }

            if (response.pagination) {
               setPaginacao({
                  paginaAtual: response.pagination.currentPage,
                  totalPaginas: response.pagination.totalPages,
                  totalItens: response.pagination.totalItems,
                  itensPorPagina: response.pagination.itemsPerPage,
                  hasMore: response.pagination.currentPage < response.pagination.totalPages
               })
            } else {
               setPaginacao(prev => ({ ...prev, hasMore: false }))
            }
         }
      } catch (error) { // ✅ CORRIGIR: Remover 'any'
         console.error('Erro ao buscar usuários:', error)

         const errorMessage = error instanceof Error
            ? error.message
            : 'Erro ao buscar usuários'

         setErro(errorMessage)
         setPaginacao(prev => ({ ...prev, hasMore: false }))
      } finally {
         setLoading(false)
         setLoadingMore(false)
      }
   }, [paginacao.itensPorPagina]) // ✅ ADICIONAR dependência necessária

   // ✅ CORRIGIR: Incluir buscarUsuarios nas dependências
   useEffect(() => {
      buscarUsuarios(1, true)
   }, [buscarUsuarios])

   // ✅ CORRIGIR: useCallback com dependências adequadas
   const handleScroll = useCallback(() => {
      if (!scrollContainerRef.current || loadingMore || !paginacao.hasMore) return

      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current

      if (scrollHeight - scrollTop - clientHeight < 200) {
         buscarUsuarios(paginacao.paginaAtual + 1, false)
      }
   }, [loadingMore, paginacao.hasMore, paginacao.paginaAtual, buscarUsuarios])

   useEffect(() => {
      const container = scrollContainerRef.current
      if (container) {
         container.addEventListener('scroll', handleScroll)
         return () => container.removeEventListener('scroll', handleScroll)
      }
   }, [handleScroll])

   const alterarStatus = async (userId: string, novoStatus: boolean) => {
      try {
         setProcessando(userId)
         setErro('')

         await authService.atualizarStatusUser(Number(userId), novoStatus)

         setUsuarios(prev =>
            prev.map(user =>
               user.id === userId ? { ...user, isActive: novoStatus } : user
            )
         )

         onSuccess?.()
      } catch (error) { // ✅ CORRIGIR: Remover 'any'
         console.error('Erro ao alterar status:', error)

         const errorMessage = error instanceof Error
            ? error.message
            : 'Erro ao alterar status'

         setErro(errorMessage)
      } finally {
         setProcessando(null)
      }
   }

   const usuariosFiltrados = usuarios.filter(user => {
      const matchNome = user.name.toLowerCase().includes(filtro.toLowerCase()) ||
                       user.email.toLowerCase().includes(filtro.toLowerCase())

      const matchStatus = filtroStatus === 'todos' ||
                         (filtroStatus === 'ativo' && user.isActive) ||
                         (filtroStatus === 'inativo' && !user.isActive)

      return matchNome && matchStatus
   })

   const formatarData = (data: string) => {
      return new Date(data).toLocaleDateString('pt-BR')
   }

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-gray-rocket-700 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
               <h2 className="text-xl font-bold text-white flex items-center">
                  Gerenciar Status dos Membros
                  <AiOutlineUserDelete className="ml-2 text-rocket-red-700" />
               </h2>
               <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
               >
                  <AiOutlineClose className="w-5 h-5" />
               </button>
            </div>

            <div
               ref={scrollContainerRef}
               className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
            >
               {erro && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                     {erro}
                  </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                     <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                     <input
                        type="text"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        placeholder="Buscar por nome ou email..."
                        className="w-full bg-gray-rocket-700 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-600 focus:border-rocket-red-700 focus:ring-2 focus:ring-rocket-red-700/20 focus:outline-none"
                     />
                  </div>

                  {/* ✅ CORRIGIR: Remover 'as any' e tipar adequadamente */}
                  <select
                     value={filtroStatus}
                     onChange={(e) => setFiltroStatus(e.target.value as 'todos' | 'ativo' | 'inativo')}
                     className="bg-gray-rocket-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-rocket-red-700 focus:ring-2 focus:ring-rocket-red-700/20 focus:outline-none"
                  >
                     <option value="todos">Todos os status</option>
                     <option value="ativo">Apenas ativos</option>
                     <option value="inativo">Apenas inativos</option>
                  </select>
               </div>

               <div className="mb-4 text-sm text-gray-400">
                  Mostrando {usuarios.length} de {paginacao.totalItens} usuários
               </div>

               {loading ? (
                  <div className="flex items-center justify-center py-12">
                     <AiOutlineLoading3Quarters className="text-2xl text-gray-400 animate-spin mr-3" />
                     <span className="text-gray-400">Carregando usuários...</span>
                  </div>
               ) : (
                  <div className="space-y-3">
                     {usuariosFiltrados.map((usuario) => (
                        <div key={usuario.id} className="bg-gray-rocket-700/30 border border-gray-900 rounded-lg p-4">
                           <div className="flex items-center justify-between">
                              <div className="flex-1">
                                 <div className="flex items-center space-x-3">
                                    <div>
                                       <h3 className="text-white font-medium">{usuario.name}</h3>
                                       <p className="text-gray-400 text-sm">{usuario.email}</p>
                                       <p className="text-gray-500 text-xs">Cadastrado em: {formatarData(usuario.created_at)}</p>
                                    </div>
                                 </div>

                                 <div className="flex items-center mt-2 space-x-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                                       usuario.isActive
                                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                                    }`}>
                                       {usuario.isActive ? (
                                          <>
                                             <AiOutlineCheck className="w-3 h-3 mr-1" />
                                             Ativo
                                          </>
                                       ) : (
                                          <>
                                             <AiOutlineStop className="w-3 h-3 mr-1" />
                                             Inativo
                                          </>
                                       )}
                                    </span>

                                    <span className="text-gray-500 text-xs">
                                       {usuario.role}
                                    </span>
                                 </div>
                              </div>

                              <div className="ml-4 flex flex-col space-y-2">
                                 {usuario.isActive ? (
                                    <button
                                       onClick={() => alterarStatus(usuario.id, false)}
                                       disabled={processando === usuario.id}
                                       className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                       {processando === usuario.id ? (
                                          <AiOutlineLoading3Quarters className="animate-spin" />
                                       ) : (
                                          <AiOutlineStop className="w-4 h-4" />
                                       )}
                                       <span>Inativar</span>
                                    </button>
                                 ) : (
                                    <button
                                       onClick={() => alterarStatus(usuario.id, true)}
                                       disabled={processando === usuario.id}
                                       className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                       {processando === usuario.id ? (
                                          <AiOutlineLoading3Quarters className="animate-spin" />
                                       ) : (
                                          <AiOutlineCheck className="w-4 h-4" />
                                       )}
                                       <span>Ativar</span>
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))}

                     {loadingMore && (
                        <div className="flex items-center justify-center py-8">
                           <AiOutlineLoading3Quarters className="text-xl text-gray-400 animate-spin mr-2" />
                           <span className="text-gray-400 text-sm">Carregando mais usuários...</span>
                        </div>
                     )}

                     {usuariosFiltrados.length === 0 && !loading && (
                        <div className="text-center py-8">
                           <AiOutlineUserDelete className="text-4xl text-gray-500 mx-auto mb-2" />
                           <p className="text-gray-400">Nenhum usuário encontrado</p>
                        </div>
                     )}
                  </div>
               )}

               <div className="flex justify-end pt-6 mt-6 border-t border-gray-700">
                  <button
                     onClick={onClose}
                     className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                     Fechar
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}

export default ModalGerenciarStatus