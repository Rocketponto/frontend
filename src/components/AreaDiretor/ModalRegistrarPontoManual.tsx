import { useState, useEffect } from 'react'
import { AiOutlineClose, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { authService } from '../../hooks/useAuth'
import { pontoService } from '../../hooks/usePointRecord'
import { useToast } from '../Toast/ToastProvider'

interface Membro {
   id: string
   name: string
   email: string
   role: string
   isActive: boolean
}

interface ModalRegistrarPontoManualProps {
   isOpen: boolean
   onClose: () => void
   onSuccess: () => void
}

function ModalRegistrarPontoManual({ isOpen, onClose, onSuccess }: ModalRegistrarPontoManualProps) {
   const { showSuccess, showError } = useToast()

   const [membros, setMembros] = useState<Membro[]>([])
   const [loadingMembros, setLoadingMembros] = useState(true)
   const [enviando, setEnviando] = useState(false)

   const [formData, setFormData] = useState({
      userId: '',
      entryDate: '',
      entryTime: '',
      exitDate: '',
      exitTime: '',
      description: ''
   })

   // Buscar membros ao abrir o modal
   useEffect(() => {
      if (isOpen) {
         buscarMembros()
      }
   }, [isOpen])

   const buscarMembros = async () => {
      try {
         setLoadingMembros(true)
         const response = await authService.buscarMembrosAtivo()
         if (response.success && response.data) {
            setMembros(response.data)
         }
      } catch (error) {
         console.error('Erro ao buscar membros:', error)
         showError('Erro', 'Não foi possível carregar a lista de membros')
      } finally {
         setLoadingMembros(false)
      }
   }

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
   }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      // Validações
      if (!formData.userId) {
         showError('Erro', 'Selecione um membro')
         return
      }
      if (!formData.entryDate || !formData.entryTime) {
         showError('Erro', 'Informe a data e hora de entrada')
         return
      }
      if (!formData.exitDate || !formData.exitTime) {
         showError('Erro', 'Informe a data e hora de saída')
         return
      }
      if (!formData.description.trim()) {
         showError('Erro', 'Informe a descrição da atividade')
         return
      }

      const entryLocal = new Date(`${formData.entryDate}T${formData.entryTime}:00`)
      const exitLocal = new Date(`${formData.exitDate}T${formData.exitTime}:00`)

      const entryDateHour = entryLocal.toISOString()
      const exitDateHour = exitLocal.toISOString()

      if (exitLocal <= entryLocal) {
         showError('Erro', 'A data/hora de saída deve ser posterior à entrada')
         return
      }

      // Pegar o ID do diretor logado
      const user = localStorage.getItem('user')
      if (!user) {
         showError('Erro', 'Usuário não autenticado')
         return
      }
      const directorId = JSON.parse(user).id

      try {
         setEnviando(true)

         const response = await pontoService.registrarPontoManual({
            directorId,
            userId: formData.userId,
            entryDateHour,
            exitDateHour,
            description: formData.description.trim()
         })

         if (response.success) {
            showSuccess('Sucesso', 'Ponto registrado com sucesso!')
            limparFormulario()
            onSuccess()
            onClose()
         }
      } catch (error) {
         console.error('Erro ao registrar ponto:', error)
         const errorMessage = error instanceof Error ? error.message : 'Erro ao registrar ponto'
         showError('Erro', errorMessage)
      } finally {
         setEnviando(false)
      }
   }

   const limparFormulario = () => {
      setFormData({
         userId: '',
         entryDate: '',
         entryTime: '',
         exitDate: '',
         exitTime: '',
         description: ''
      })
   }

   const handleClose = () => {
      limparFormulario()
      onClose()
   }

   if (!isOpen) return null

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-gray-rocket-600 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
               <h2 className="text-xl font-bold text-white">Registrar Ponto Manual</h2>
               <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
               >
                  <AiOutlineClose className="text-xl" />
               </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
               {/* Selecionar Membro */}
               <div>
                  <label className="block text-gray-300 text-sm mb-1">
                     Membro *
                  </label>
                  {loadingMembros ? (
                     <div className="flex items-center gap-2 text-gray-400">
                        <AiOutlineLoading3Quarters className="animate-spin" />
                        <span>Carregando membros...</span>
                     </div>
                  ) : (
                     <select
                        name="userId"
                        value={formData.userId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-rocket-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-rocket-red-600"
                        required
                     >
                        <option value="">Selecione um membro</option>
                        {membros.map(membro => (
                           <option key={membro.id} value={membro.id}>
                              {membro.name} - {membro.email}
                           </option>
                        ))}
                     </select>
                  )}
               </div>

               {/* Data e Hora de Entrada */}
               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="block text-gray-300 text-sm mb-1">
                        Data Entrada *
                     </label>
                     <input
                        type="date"
                        name="entryDate"
                        value={formData.entryDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-rocket-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-rocket-red-600"
                        required
                     />
                  </div>
                  <div>
                     <label className="block text-gray-300 text-sm mb-1">
                        Hora Entrada *
                     </label>
                     <input
                        type="time"
                        name="entryTime"
                        value={formData.entryTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-rocket-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-rocket-red-600"
                        required
                     />
                  </div>
               </div>

               {/* Data e Hora de Saída */}
               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="block text-gray-300 text-sm mb-1">
                        Data Saída *
                     </label>
                     <input
                        type="date"
                        name="exitDate"
                        value={formData.exitDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-rocket-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-rocket-red-600"
                        required
                     />
                  </div>
                  <div>
                     <label className="block text-gray-300 text-sm mb-1">
                        Hora Saída *
                     </label>
                     <input
                        type="time"
                        name="exitTime"
                        value={formData.exitTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-rocket-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-rocket-red-600"
                        required
                     />
                  </div>
               </div>

               {/* Descrição */}
               <div>
                  <label className="block text-gray-300 text-sm mb-1">
                     Descrição da Atividade *
                  </label>
                  <textarea
                     name="description"
                     value={formData.description}
                     onChange={handleInputChange}
                     placeholder="Descreva as atividades realizadas..."
                     rows={3}
                     className="w-full px-3 py-2 bg-gray-rocket-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-rocket-red-600 resize-none"
                     required
                  />
               </div>

               {/* Botões */}
               <div className="flex gap-3 pt-2">
                  <button
                     type="button"
                     onClick={handleClose}
                     className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                     Cancelar
                  </button>
                  <button
                     type="submit"
                     disabled={enviando || loadingMembros}
                     className="flex-1 px-4 py-2 bg-rocket-red-600 hover:bg-rocket-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                     {enviando ? (
                        <>
                           <AiOutlineLoading3Quarters className="animate-spin" />
                           Registrando...
                        </>
                     ) : (
                        'Registrar Ponto'
                     )}
                  </button>
               </div>
            </form>
         </div>
      </div>
   )
}

export default ModalRegistrarPontoManual