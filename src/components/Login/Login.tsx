import { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineUser, AiOutlineLock, AiOutlineRocket, AiFillRocket } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../hooks/useAuth'
import { useToast } from '../Toast/ToastProvider'

function Login() {
   const [formData, setFormData] = useState({
      email: '',
      password: ''
   })
   const [mostrarSenha, setMostrarSenha] = useState(false)
   const [carregando, setCarregando] = useState(false)
   const [erro, setErro] = useState('')
   const [lembrarMe, setLembrarMe] = useState(false)
   const { showSuccess, showError, showWarning } = useToast()

   const navigate = useNavigate()

   const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({
         ...prev,
         [field]: value
      }))
      if (erro) setErro('')
   }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!formData.email || !formData.password) {
         showWarning('Campos obrigatórios', 'Por favor, preencha todos os campos para continuar')
         return
      }

      setCarregando(true)
      setErro('')

      try {
         const response = await authService.login({
            email: formData.email,
            password: formData.password
         })

         if (response.token && response.user) {
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response.user))

            if (lembrarMe) {
               localStorage.setItem('rememberMe', 'true')
            }

            showSuccess('Login realizado com sucesso!', `Bem-vindo ao rocketponto!`)

            navigate('/ponto')

         } else {
            showError('Erro no login', 'Resposta inválida do servidor.')
         }
      } catch (error: any) {
         if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            showError(
               'Credenciais inválidas',
               'Email ou senha incorretos. Verifique seus dados e tente novamente.'
            )
         } else if (error.message?.includes('network') || error.message?.includes('Network')) {
            showError(
               'Erro de conexão',
               'Verifique sua conexão com a internet e tente novamente.'
            )
         } else if (error.message?.includes('timeout')) {
            showWarning(
               'Tempo esgotado',
               'O servidor demorou para responder. Tente novamente.'
            )
         } else {
            showError(
               'Erro inesperado',
               error.message || 'Algo deu errado. Tente novamente em alguns instantes.'
            )
         }
      } finally {
         setCarregando(false)
      }
   }

   return (
      <div className="min-h-screen bg-gray-rocket-600 flex items-center justify-center p-4">
         <div className="relative w-full max-w-md">
            <div className="bg-rocket-gray-700 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
               {/* Header */}
               <div className="text-center mb-8">
                  <div className="flex justify-center items-center mb-4">
                     <div className="relative">
                        <AiFillRocket className="text-5xl text-rocket-red-600 drop-shadow-lg" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                     </div>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                     RocketPonto
                  </h1>
                  <p className="text-gray-400 text-sm">
                     Faça login para acessar sua conta
                  </p>
               </div>

               {/* Erro simples */}
               {erro && (
                  <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                     {erro}
                  </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Campo Email */}
                  <div className="relative">
                     <label className="block text-gray-300 text-sm font-medium mb-2">
                        Email
                     </label>
                     <div className="relative">
                        <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                           type="email"
                           value={formData.email}
                           onChange={(e) => handleInputChange('email', e.target.value)}
                           placeholder="seu@email.com"
                           className="w-full bg-gray-rocket-700 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-600 focus:border-rocket-red-600 focus:ring-2 focus:ring-rocket-red-700/20 focus:outline-none transition-all duration-200"
                           disabled={carregando}
                           required
                        />
                     </div>
                  </div>

                  {/* Campo Senha */}
                  <div className="relative">
                     <label className="block text-gray-300 text-sm font-medium mb-2">
                        Senha
                     </label>
                     <div className="relative">
                        <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                           type={mostrarSenha ? 'text' : 'password'}
                           value={formData.password}
                           onChange={(e) => handleInputChange('password', e.target.value)}
                           placeholder="••••••••"
                           className="w-full bg-gray-rocket-700 text-white rounded-lg pl-10 pr-12 py-3 border border-gray-600 focus:border-rocket-red-600 focus:ring-2 focus:ring-rocket-red-700/20 focus:outline-none transition-all duration-200"
                           disabled={carregando}
                           required
                        />
                        <button
                           type="button"
                           onClick={() => setMostrarSenha(!mostrarSenha)}
                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                           disabled={carregando}
                        >
                           {mostrarSenha ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </button>
                     </div>
                  </div>

                  {/* Lembrar e Esqueci a senha */}
                  <div className="flex items-center justify-between text-sm">
                     <label className="flex items-center text-gray-300">
                        <input
                           type="checkbox"
                           checked={lembrarMe}
                           onChange={(e) => setLembrarMe(e.target.checked)}
                           className="mr-2 rounded border-gray-600 bg-gray-700 text-rocket-red-600 focus:ring-rocket-red-700 focus:ring-offset-0"
                           disabled={carregando}
                        />
                        Lembrar-me
                     </label>
                     <a href="#" className="text-white hover:text-rocket-red-600 transition-colors">
                        Esqueci a senha
                     </a>
                  </div>

                  {/* Botão de login */}
                  <button
                     type="submit"
                     disabled={carregando}
                     className="w-full bg-gradient-to-r from-rocket-red-600 to-rocket-red-700 hover:from-rocket-red-700 hover:to-rocket-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:cursor-not-allowed"
                  >
                     {carregando ? (
                        <div className="flex items-center justify-center space-x-2">
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           <span>Entrando...</span>
                        </div>
                     ) : (
                        <div className="flex items-center justify-center space-x-2">
                           <AiOutlineRocket className="text-lg" />
                           <span>Entrar</span>
                        </div>
                     )}
                  </button>
               </form>

               {/* Rodapé */}
               <div className="mt-8 text-center">
                  <p className="text-gray-400 text-sm">
                     Não tem uma conta?{' '}
                     <a href="#" className="text-rocket-red-400 hover:text-rocket-red-300 transition-colors font-medium">
                        Fale com o RH
                     </a>
                  </p>
               </div>
            </div>

            {/* Indicador de versão */}
            <div className="text-center mt-6">
               <p className="text-gray-500 text-xs">
                  RocketPonto v2.0 • Desenvolvido com ❤️
               </p>
            </div>
         </div>
      </div>
   )
}

export default Login