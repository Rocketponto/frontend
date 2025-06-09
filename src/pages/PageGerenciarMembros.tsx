import { useState, useEffect } from 'react'
import {
   AiOutlineSearch,
   AiOutlineCalendar,
   AiOutlineFilter,
   AiOutlineCheck,
   AiOutlineClockCircle,
   AiOutlineTeam,
   AiOutlineFileText,
   AiOutlineClose,
   AiOutlineArrowLeft,
   AiOutlineUserAdd,
   AiOutlineCrown,
   AiOutlineUserDelete
} from 'react-icons/ai'
import { pontoService } from '../hooks/usePointRecord'
import { authService } from '../hooks/useAuth'
import TabelaPontosPaginada from '../components/AreaDiretor/MembrosTable'
import { useNavigate } from 'react-router-dom'

import ModalCadastrarMembro from '../components/AreaDiretor/ModalCadastrarMembros'
import ModalGerenciarRoles from '../components/AreaDiretor/ModalGerenciarRoles'
import ModalGerenciarStatus from '../components/AreaDiretor/ModalGerenciarStatus'

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

function GerenciarMembros() {
   const [pontos, setPontos] = useState<PontoMembro[]>([])
   const [loading, setLoading] = useState(true)
   const [erro, setErro] = useState('')
   const [processando, setProcessando] = useState<string | null>(null)
   const navigate = useNavigate()

   const [membros, setMembros] = useState<any[]>([])
   const [loadingMembros, setLoadingMembros] = useState(false)
   const [erroMembros, setErroMembros] = useState('')
   const [filtroMembros, setFiltroMembros] = useState('')

   const [activeTab, setActiveTab] = useState<'pontos' | 'membros'>('pontos')

   const [modals, setModals] = useState({
      cadastrar: false,
      roles: false,
      status: false
   })

   const [filtros, setFiltros] = useState({
      name: '',
      date: '',
      status: ''
   })

   const [paginacao, setPaginacao] = useState({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0
   })

   const [stats, setStats] = useState({
      totalMembros: 0,
      pontosHoje: 0,
      pendentes: 0,
      aprovados: 0
   })

   useEffect(() => {
      if (activeTab === 'pontos') {
         buscarPontos()
      } else if (activeTab === 'membros') {
         buscarMembros()
      }
      buscarEstatisticas()
   }, [paginacao.page, filtros, activeTab])

   const buscarPontos = async () => {
      try {
         setLoading(true)
         setErro('')

         const response = await pontoService.buscarPontosMembros({
            page: paginacao.page,
            limit: paginacao.limit,
            name: filtros.name || undefined,
            date: filtros.date || undefined,
            status: filtros.status || undefined
         })

         if (response.success) {
            setPontos(response.data)
            setPaginacao(prev => ({
               ...prev,
               total: response.pagination.total,
               totalPages: response.pagination.totalPages
            }))
         }
      } catch (error: any) {
         setErro(error.message)
      } finally {
         setLoading(false)
      }
   }

   const buscarMembros = async () => {
      try {
         setLoadingMembros(true)
         setErroMembros('')

         const response = await authService.buscarMembrosAtivo()

         if (response.success && response.data) {
            setMembros(response.data)
         }
      } catch (error: any) {
         setErroMembros(error.message || 'Erro ao buscar membros')
      } finally {
         setLoadingMembros(false)
      }
   }

   const buscarEstatisticas = async () => {
      try {
         const hoje = new Date().toISOString().split('T')[0]
         const responsePontosHoje = await pontoService.buscarPontosMembros({ date: hoje })
         const responseTotalMembros = await authService.buscarMembrosAtivo()

         const hojeString = hoje.toString().split('T')[0]

         const pontosHoje = responsePontosHoje.data.filter(ponto => {
            const dataPonto = new Date(ponto.createdAt).toISOString().split('T')[0]
            return dataPonto === hojeString
         })

         const totalPontos = pontosHoje.length
         const pendentes = responsePontosHoje.data.filter(p => p.pointRecordStatus === 'IN_PROGRESS').length
         const aprovados = responsePontosHoje.data.filter(p => p.pointRecordStatus === 'APPROVED').length
         const totalMembros = responseTotalMembros.data.length

         setStats({
            totalMembros: totalMembros,
            pontosHoje: totalPontos,
            pendentes,
            aprovados
         })
      } catch (error) {
         console.error('Erro ao buscar estatísticas:', error)
      }
   }

   const handleFiltroChange = (campo: string, valor: string) => {
      setFiltros(prev => ({
         ...prev,
         [campo]: valor
      }))
      setPaginacao(prev => ({ ...prev, page: 1 }))
   }

   const limparFiltros = () => {
      setFiltros({ name: '', date: '', status: '' })
      setPaginacao(prev => ({ ...prev, page: 1 }))
   }

   const aprovarPonto = async (pontoId: string) => {
      try {
         setProcessando(pontoId)
         await pontoService.aprovarPonto(pontoId)
         await buscarPontos()
         await buscarEstatisticas()
      } catch (error: any) {
         setErro(error.message)
      } finally {
         setProcessando(null)
      }
   }

   const recarregarTabela = async () => {
      await buscarPontos()
   }

   const rejeitarPonto = async (pontoId: string) => {
      try {
         setProcessando(pontoId)
         await pontoService.rejeitarPonto(pontoId)
         await buscarPontos()
         await buscarEstatisticas()
      } catch (error: any) {
         setErro(error.message)
      } finally {
         setProcessando(null)
      }
   }

   const handlePaginaChange = (page: number) => {
      setPaginacao(prev => ({ ...prev, page }))
   }

   const handleBackAreaDiretor = () => {
      navigate('/area-diretor')
   }

   const openModal = (modalName: 'cadastrar' | 'roles' | 'status') => {
      setModals(prev => ({ ...prev, [modalName]: true }))
   }

   const closeModal = (modalName: 'cadastrar' | 'roles' | 'status') => {
      setModals(prev => ({ ...prev, [modalName]: false }))
   }

   const membrosFiltrados = membros.filter(membro =>
      membro.name.toLowerCase().includes(filtroMembros.toLowerCase()) ||
      membro.email.toLowerCase().includes(filtroMembros.toLowerCase())
   )

   const formatarData = (data: string) => {
      return new Date(data).toLocaleDateString('pt-BR')
   }

   return (
      <div className="p-6 space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <button
                  onClick={handleBackAreaDiretor}
                  className="flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  title="Voltar para Área do Diretor"
               >
                  <AiOutlineArrowLeft className="w-5 h-5" />
               </button>

               <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                     Gerenciar Membros
                  </h1>
                  <p className="text-gray-300">
                     Monitore e gerencie os registros de ponto da equipe
                  </p>
               </div>
            </div>

            <div className="flex space-x-3">
               <button
                  onClick={() => openModal('cadastrar')}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  title="Cadastrar novo membro"
               >
                  <AiOutlineUserAdd className="w-4 h-4" />
                  <span>Novo Membro</span>
               </button>

               <button
                  onClick={() => openModal('roles')}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  title="Gerenciar roles e permissões"
               >
                  <AiOutlineCrown className="w-4 h-4" />
                  <span>Cargos</span>
               </button>

               <button
                  onClick={() => openModal('status')}
                  className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  title="Ativar/Inativar membros"
               >
                  <AiOutlineUserDelete className="w-4 h-4" />
                  <span>Status</span>
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-transparent border border-zinc-950 rounded-lg p-6">
               <div className="flex items-center">
                  <AiOutlineTeam className="text-3xl text-blue-500 mr-4" />
                  <div>
                     <p className="text-gray-400 text-sm">Total Membros</p>
                     <p className="text-2xl font-bold text-white">{stats.totalMembros}</p>
                  </div>
               </div>
            </div>

            <div className="bg-transparent border border-zinc-950 rounded-lg p-6">
               <div className="flex items-center">
                  <AiOutlineClockCircle className="text-3xl text-green-500 mr-4" />
                  <div>
                     <p className="text-gray-400 text-sm">Pontos Hoje</p>
                     <p className="text-2xl font-bold text-white">{stats.pontosHoje}</p>
                  </div>
               </div>
            </div>

            <div className="bg-transparent border border-zinc-950 rounded-lg p-6">
               <div className="flex items-center">
                  <AiOutlineFileText className="text-3xl text-yellow-500 mr-4" />
                  <div>
                     <p className="text-gray-400 text-sm">Pendentes</p>
                     <p className="text-2xl font-bold text-white">{stats.pendentes}</p>
                  </div>
               </div>
            </div>

            <div className="bg-transparent border border-zinc-950 rounded-lg p-6">
               <div className="flex items-center">
                  <AiOutlineCheck className="text-3xl text-green-500 mr-4" />
                  <div>
                     <p className="text-gray-400 text-sm">Aprovados</p>
                     <p className="text-2xl font-bold text-white">{stats.aprovados}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Sistema de abas */}
         <div className="bg-transparent border border-zinc-950 rounded-lg overflow-hidden">
            {/* Header das abas */}
            <div className="border-b border-gray-700">
               <div className="flex space-x-1 p-6">
                  <button
                     onClick={() => setActiveTab('pontos')}
                     className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'pontos'
                        ? 'bg-rocket-red-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                  >
                     <div className="flex items-center space-x-2">
                        <AiOutlineClockCircle className="w-4 h-4" />
                        <span>Registros de Ponto</span>
                     </div>
                  </button>

                  <button
                     onClick={() => setActiveTab('membros')}
                     className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'membros'
                        ? 'bg-rocket-red-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                  >
                     <div className="flex items-center space-x-2">
                        <AiOutlineTeam className="w-4 h-4" />
                        <span>Lista de Membros</span>
                     </div>
                  </button>
               </div>
            </div>

            <div className="p-6">
               {activeTab === 'pontos' && (
                  <div className="space-y-6">
                     <div>
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="text-lg font-semibold text-white flex items-center">
                              <AiOutlineFilter className="mr-2" />
                              Filtros
                           </h3>
                           <button
                              onClick={limparFiltros}
                              className="flex items-center space-x-2 bg-rocket-red-600 hover:bg-rocket-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                           >
                              <AiOutlineClose className="w-4 h-4" />
                              <span>Limpar filtros</span>
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                           <div>
                              <label className="block text-gray-300 text-sm font-medium mb-2">
                                 Nome do funcionário
                              </label>
                              <div className="relative">
                                 <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                 <input
                                    type="text"
                                    value={filtros.name}
                                    onChange={(e) => handleFiltroChange('name', e.target.value)}
                                    placeholder="Buscar por nome..."
                                    className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-rocket-red-500 focus:ring-2 focus:ring-rocket-red-500/20 focus:outline-none"
                                 />
                              </div>
                           </div>

                           <div>
                              <label className="block text-gray-300 text-sm font-medium mb-2">
                                 Data
                              </label>
                              <div className="relative">
                                 <AiOutlineCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                 <input
                                    type="date"
                                    value={filtros.date}
                                    onChange={(e) => handleFiltroChange('date', e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-rocket-red-500 focus:ring-2 focus:ring-rocket-red-500/20 focus:outline-none"
                                 />
                              </div>
                           </div>

                           <div>
                              <label className="block text-gray-300 text-sm font-medium mb-2">
                                 Status
                              </label>
                              <select
                                 value={filtros.status}
                                 onChange={(e) => handleFiltroChange('status', e.target.value)}
                                 className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-rocket-red-500 focus:ring-2 focus:ring-rocket-red-500/20 focus:outline-none"
                              >
                                 <option value="">Todos os status</option>
                                 <option value="PENDING">Pendente</option>
                                 <option value="APPROVED">Aprovado</option>
                                 <option value="REJECTED">Rejeitado</option>
                              </select>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'membros' && (
                  <div className="space-y-6">

                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                           <AiOutlineTeam className="mr-2" />
                           Lista de Membros ({membrosFiltrados.length})
                        </h3>

                        <div className="flex items-center space-x-4">
                           <div className="relative">
                              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <input
                                 type="text"
                                 value={filtroMembros}
                                 onChange={(e) => setFiltroMembros(e.target.value)}
                                 placeholder="Buscar por nome ou email..."
                                 className="w-64 bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-rocket-red-500 focus:ring-2 focus:ring-rocket-red-500/20 focus:outline-none"
                              />
                           </div>

                           <button
                              onClick={buscarMembros}
                              disabled={loadingMembros}
                              className="flex items-center space-x-2 bg-rocket-red-600 hover:bg-rocket-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                           >
                              <AiOutlineClockCircle className={loadingMembros ? 'animate-spin' : ''} />
                              <span>Atualizar</span>
                           </button>
                        </div>
                     </div>

                     {erroMembros && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                           {erroMembros}
                        </div>
                     )}

                     {loadingMembros ? (
                        <div className="flex items-center justify-center py-12">
                           <AiOutlineClockCircle className="text-2xl text-gray-400 animate-spin mr-3" />
                           <span className="text-gray-400">Carregando membros...</span>
                        </div>
                     ) : membrosFiltrados.length === 0 ? (
                        <div className="text-center py-12">
                           <AiOutlineTeam className="text-4xl text-gray-500 mx-auto mb-4" />
                           <h3 className="text-xl font-semibold text-white mb-2">
                              {filtroMembros ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
                           </h3>
                           <p className="text-gray-400 mb-6">
                              {filtroMembros
                                 ? 'Tente ajustar os filtros de busca'
                                 : 'Comece cadastrando o primeiro membro da equipe'
                              }
                           </p>
                           {!filtroMembros && (
                              <button
                                 onClick={() => openModal('cadastrar')}
                                 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                              >
                                 <AiOutlineUserAdd className="inline mr-2" />
                                 Cadastrar Primeiro Membro
                              </button>
                           )}
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {membrosFiltrados.map((membro) => (
                              <div
                                 key={membro.id}
                                 className="bg-gray-rocket-700/50 border border-gray-700 rounded-lg p-6 hover:border-rocket-red-500/50 transition-colors"
                              >
                                 <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                       <h4 className="text-lg font-semibold text-white mb-1">
                                          {membro.name}
                                       </h4>
                                       <p className="text-gray-400 text-sm mb-2">
                                          {membro.email}
                                       </p>

                                       <div className="flex items-center space-x-2 mb-3">
                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                                             membro.role === 'DIRETOR'
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                          }`}>
                                             {membro.role === 'DIRETOR' ? (
                                                <AiOutlineCrown className="w-3 h-3 mr-1" />
                                             ) : (
                                                <AiOutlineTeam className="w-3 h-3 mr-1" />
                                             )}
                                             {membro.role}
                                          </span>

                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                                             membro.isActive
                                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                                          }`}>
                                             <div className={`w-2 h-2 rounded-full mr-1 ${
                                                membro.isActive ? 'bg-green-400' : 'bg-red-400'
                                             }`}></div>
                                             {membro.isActive ? 'Ativo' : 'Inativo'}
                                          </span>
                                       </div>

                                       <p className="text-gray-500 text-xs">
                                          Cadastrado em: {formatarData(membro.created_at)}
                                       </p>
                                    </div>
                                 </div>

                                 <div className="flex space-x-2">
                                    <button
                                       onClick={() => openModal('status')}
                                       className="flex-1 bg-rocket-red-600/20 hover:bg-rocket-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                                    >
                                       Status
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {/* Cards de ação rápida */}
                     <div className="border-t border-gray-700 pt-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <button
                              onClick={() => openModal('cadastrar')}
                              className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 text-center hover:bg-green-600/20 transition-colors group"
                           >
                              <AiOutlineUserAdd className="text-2xl text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                              <h5 className="font-semibold text-white mb-1">Cadastrar Membro</h5>
                              <p className="text-gray-400 text-xs">Adicionar novo funcionário</p>
                           </button>

                           <button
                              onClick={() => openModal('roles')}
                              className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4 text-center hover:bg-purple-600/20 transition-colors group"
                           >
                              <AiOutlineCrown className="text-2xl text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                              <h5 className="font-semibold text-white mb-1">Alterar Roles</h5>
                              <p className="text-gray-400 text-xs">Gerenciar permissões</p>
                           </button>

                           <button
                              onClick={() => openModal('status')}
                              className="bg-orange-600/10 border border-orange-500/30 rounded-lg p-4 text-center hover:bg-orange-600/20 transition-colors group"
                           >
                              <AiOutlineUserDelete className="text-2xl text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                              <h5 className="font-semibold text-white mb-1">Gerenciar Status</h5>
                              <p className="text-gray-400 text-xs">Ativar/Inativar membros</p>
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {activeTab === 'pontos' && (
            <TabelaPontosPaginada
               pontos={pontos}
               paginacao={paginacao}
               loading={loading}
               erro={erro}
               processando={processando}
               onAprovarPonto={aprovarPonto}
               onRejeitarPonto={rejeitarPonto}
               onPaginaChange={handlePaginaChange}
               onRecarregarTabela={recarregarTabela}
            />
         )}

         {modals.cadastrar && (
            <ModalCadastrarMembro onClose={() => closeModal('cadastrar')} />
         )}

         {modals.roles && (
            <ModalGerenciarRoles onClose={() => closeModal('roles')} />
         )}

         {modals.status && (
            <ModalGerenciarStatus onClose={() => closeModal('status')} />
         )}
      </div>
   )
}

export default GerenciarMembros