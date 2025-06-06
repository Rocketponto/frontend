import { useState, useEffect } from 'react'
import { AiOutlineClose, AiOutlineCrown, AiOutlineSearch, AiOutlineLoading3Quarters, AiOutlineCheck } from 'react-icons/ai'
import { authService } from '../../hooks/useAuth'

interface Usuario {
   id: string
   name: string
   email: string
   role: 'MEMBRO' | 'DIRETOR'
   isActive: boolean
}

interface ModalGerenciarRolesProps {
   onClose: () => void
   onSuccess?: () => void
}

function ModalGerenciarRoles({ onClose, onSuccess }: ModalGerenciarRolesProps) {
   const [usuarios, setUsuarios] = useState<Usuario[]>([])
   const [loading, setLoading] = useState(true)
   const [salvando, setSalvando] = useState<string | null>(null)
   const [filtro, setFiltro] = useState('')
   const [erro, setErro] = useState('')

   useEffect(() => {
      buscarUsuarios()
   }, [])

   const buscarUsuarios = async () => {
      try {
         setLoading(true)
         setErro('')
         const response = await authService.buscarMembrosAtivo()

         if (response.success && response.data) {
            const usuariosFormatados = response.data.map((user: any) => ({
               id: user.id,
               name: user.name,
               email: user.email,
               role: user.role as 'MEMBRO' | 'DIRETOR',
               isActive: user.isActive ?? true
            }))
            setUsuarios(usuariosFormatados)
         }
         } catch (error: any) {
            setErro(error.message || 'Erro ao buscar usuários')
         } finally {
            setLoading(false)
         }
      }

   const alterarRole = async (id: string, novoRole: Usuario['role']) => {
         try {
            setSalvando(id)
            setErro('')

            await authService.atualizarRoleUser(Number(id), novoRole)

            console.log(`Alterando role do usuário ${id} para ${novoRole}`)

            setUsuarios(prev =>
               prev.map(user =>
                  user.id === id ? { ...user, role: novoRole } : user
               )
            )

            onSuccess?.()
         } catch (error: any) {
            setErro(error.message || 'Erro ao alterar role')
         } finally {
            setSalvando(null)
         }
      }

      const usuariosFiltrados = usuarios.filter(user =>
         user.name.toLowerCase().includes(filtro.toLowerCase()) ||
         user.email.toLowerCase().includes(filtro.toLowerCase())
      )

      const getRoleColor = (role: string) => {
         switch (role) {
            case 'DIRETOR': return 'bg-green-500/10 text-white border-green-500/30'
            case 'MEMBRO': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
         }
      }

      const getRoleText = (role: string) => {
         switch (role) {
            case 'DIRETOR': return 'Diretor'
            case 'MEMBRO': return 'Membro'
            default: return role
         }
      }

      return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-rocket-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
               <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white flex items-center">
                     Gerenciar Cargos
                     <AiOutlineCrown className="ml-2 text-rocket-red-700" />
                  </h2>
                  <button
                     onClick={onClose}
                     className="text-gray-400 hover:text-white transition-colors"
                  >
                     <AiOutlineClose className="w-5 h-5" />
                  </button>
               </div>

               <div className="p-6">
                  {erro && (
                     <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                        {erro}
                     </div>
                  )}

                  {/* Filtro */}
                  <div className="mb-6">
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
                  </div>

                  {/* Lista de usuários */}
                  {loading ? (
                     <div className="flex items-center justify-center py-12">
                        <AiOutlineLoading3Quarters className="text-2xl text-rocket-red-700 animate-spin mr-3" />
                        <span className="text-rocket-red-700">Carregando usuários...</span>
                     </div>
                  ) : (
                     <div className="space-y-3">
                        {usuariosFiltrados.map((usuario) => (
                           <div key={usuario.id} className="bg-gray-rocket-700/30 border border-black/10 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                 <div className="flex-1">
                                    <h3 className="text-white font-medium">{usuario.name}</h3>
                                    <p className="text-gray-400 text-sm">{usuario.email}</p>
                                    <div className="flex items-center mt-2">
                                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getRoleColor(usuario.role)}`}>
                                          {getRoleText(usuario.role)}
                                       </span>
                                       {!usuario.isActive && (
                                          <span className="ml-2 bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-1 rounded-full text-xs">
                                             Inativo
                                          </span>
                                       )}
                                    </div>
                                 </div>

                                 <div className="ml-4">
                                    <select
                                       value={usuario.role}
                                       onChange={(e) => alterarRole(usuario.id, e.target.value as Usuario['role'])}
                                       disabled={salvando === usuario.id || !usuario.isActive}
                                       className="bg-gray-rocket-700 text-white rounded-lg px-3 py-2 border border-gray-500 focus:border-rocket-red-700 focus:outline-none disabled:opacity-50"
                                    >
                                       <option value="MEMBRO">Membro</option>
                                       <option value="DIRETOR">Diretor</option>
                                    </select>

                                    {salvando === usuario.id && (
                                       <div className="flex items-center mt-2 text-purple-400 text-sm">
                                          <AiOutlineLoading3Quarters className="animate-spin mr-1" />
                                          Salvando...
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}

                        {usuariosFiltrados.length === 0 && (
                           <div className="text-center py-8">
                              <AiOutlineCrown className="text-4xl text-gray-500 mx-auto mb-2" />
                              <p className="text-gray-400">Nenhum usuário encontrado</p>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-end pt-6">
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

   export default ModalGerenciarRoles