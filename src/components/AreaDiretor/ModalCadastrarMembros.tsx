import { useState } from 'react'
import { AiOutlineClose, AiOutlineUser, AiOutlineMail, AiOutlineLock, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { authService } from '../../hooks/useAuth'

interface ModalCadastrarMembroProps {
   onClose: () => void
   onSuccess?: () => void
}

interface FormData {
   name: string
   email: string
   password: string
   confirmPassword: string
   role: 'MEMBRO' | 'DIRETOR'
}

function ModalCadastrarMembro({ onClose, onSuccess }: ModalCadastrarMembroProps) {
   const [formData, setFormData] = useState<FormData>({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'MEMBRO'
   })
   const [loading, setLoading] = useState(false)
   const [erro, setErro] = useState('')

   const handleInputChange = (field: keyof FormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      setErro('')
   }

   const validarFormulario = () => {
      if (!formData.name.trim()) return 'Nome é obrigatório'
      if (!formData.email.trim()) return 'Email é obrigatório'
      if (!formData.email.includes('@')) return 'Email inválido'
      if (formData.password.length < 6) return 'Senha deve ter pelo menos 6 caracteres'
      if (formData.password !== formData.confirmPassword) return 'Senhas não coincidem'
      return null
   }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      const erroValidacao = validarFormulario()
      if (erroValidacao) {
         setErro(erroValidacao)
         return
      }

      try {
         setLoading(true)
         setErro('')

         await authService.cadastrarMembro({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
         })

         console.log('Cadastrando membro:', formData)

         onSuccess?.()
         onClose()
      } catch (error: any) {
         setErro(error.message || 'Erro ao cadastrar membro')
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-gray-rocket-700 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-rocket-red-700">
               <h2 className="text-xl font-bold text-white flex items-center">
                  Cadastrar Novo Membro
                  <AiOutlineUser className="ml-2 text-rocket-red-600" />
               </h2>
               <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
               >
                  <AiOutlineClose className="w-5 h-5" />
               </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               {erro && (
                  <div className="bg-red-500/10 border border-red-600/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                     {erro}
                  </div>
               )}

               {/* Nome */}
               <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                     Nome Completo *
                  </label>
                  <div className="relative">
                     <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                     <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Digite o nome completo"
                        className="w-full bg-gray-rocket-700 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-600 focus:border-rocket-red-700 focus:ring-2 focus:ring-rocket-red-700/20 focus:outline-none"
                        required
                     />
                  </div>
               </div>

               {/* Email */}
               <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                     Email *
                  </label>
                  <div className="relative">
                     <AiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                     <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Digite o email"
                        autoComplete='new-email'
                        name='new-email'
                        className="w-full bg-gray-rocket-700 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-600 focus:border-rocket-red-700 focus:ring-2 focus:ring-rocket-red-700/20 focus:outline-none"
                        required
                     />
                  </div>
               </div>

               {/* Senha */}
               <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                     Senha *
                  </label>
                  <div className="relative">
                     <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                     <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete='new-password'
                        name="new-password"
                        className="w-full bg-gray-rocket-700 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-600 focus:border-rocket-red-700 focus:ring-2 focus:ring-rocket-red-700/20 focus:outline-none"
                        required
                     />
                  </div>
               </div>

               {/* Confirmar Senha */}
               <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                     Confirmar Senha *
                  </label>
                  <div className="relative">
                     <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                     <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirme a senha"
                        className="w-full bg-gray-rocket-700 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-600 focus:border-rocket-red-700 focus:ring-2 focus:ring-rocket-red-700/20 focus:outline-none"
                        required
                     />
                  </div>
               </div>

               {/* Role */}
               <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                     Cargo *
                  </label>
                  <select
                     value={formData.role}
                     onChange={(e) => handleInputChange('role', e.target.value as FormData['role'])}
                     className="w-full bg-gray-rocket-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-rocket-red-700 focus:ring-2 focus:ring-rocket-red-700/20 focus:outline-none"
                  >
                     <option value="MEMBRO">Membro</option>
                     <option value="DIRETOR">Diretor</option>
                  </select>
               </div>

               {/* Buttons */}
               <div className="flex space-x-3 pt-4">
                  <button
                     type="button"
                     onClick={onClose}
                     className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                     Cancelar
                  </button>
                  <button
                     type="submit"
                     disabled={loading}
                     className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                     {loading ? (
                        <>
                           <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                           Cadastrando...
                        </>
                     ) : (
                        'Cadastrar'
                     )}
                  </button>
               </div>
            </form>
         </div>
      </div>
   )
}

export default ModalCadastrarMembro