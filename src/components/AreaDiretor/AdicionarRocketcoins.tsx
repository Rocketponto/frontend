import { useState, useEffect } from 'react'
import {
  AiOutlinePlus,
  AiOutlineUser,
  AiOutlineSearch,
  AiOutlineLoading3Quarters,
  AiOutlineCheckCircle,
  AiOutlineDollarCircle
} from 'react-icons/ai'
import { authService } from '../../hooks/useAuth'
import { walletService } from '../../hooks/useWallet'

interface Usuario {
  id: number
  name: string
  email: string
  balance?: number
}

interface AdicionarRocketcoinsProps {
  onUpdate: () => void
}

function AdicionarRocketcoins({ onUpdate }: AdicionarRocketcoinsProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null)
  const [valor, setValor] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    buscarUsuarios()
  }, [])

  const buscarUsuarios = async () => {
    try {
      setCarregando(true)
      const response = await authService.buscarMembrosAtivo()

      if (response.data) {
        setUsuarios(response.data.map((membro: any) => ({
          id: Number(membro.id),
          name: membro.name,
          email: membro.email,
          balance: membro.balance
        })))
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setErro('Erro ao carregar usuários')
    } finally {
      setCarregando(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!usuarioSelecionado || !valor || !titulo || !descricao) {
      setErro('Preencha todos os campos obrigatórios')
      return
    }

    if (Number(valor) <= 0) {
      setErro('O valor deve ser maior que zero')
      return
    }

    try {
      setSalvando(true)
      setErro('')

      const response = await walletService.adicionarRocketcoins({
        userId: usuarioSelecionado.id,
        amount: Number(valor),
        title: titulo,
        description: descricao
      })

      if (response.success) {
        setUsuarioSelecionado(null)
        setValor('')
        setTitulo('')
        setDescricao('')

        onUpdate()

        alert(`RC$ ${Number(valor).toFixed(2)} adicionado com sucesso para ${usuarioSelecionado.name}!`)
      } else {
        throw new Error(response.message || 'Erro ao adicionar rocketcoins')
      }
    } catch (error: any) {
      console.error('Erro ao adicionar rocketcoins:', error)
      setErro(error.message || 'Erro ao processar solicitação')
    } finally {
      setSalvando(false)
    }
  }

  const usuariosFiltrados = usuarios.filter(user =>
    user.name.toLowerCase().includes(busca.toLowerCase()) ||
    user.email.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <AiOutlinePlus className="text-2xl text-green-500" />
        <div>
          <h2 className="text-xl font-semibold text-white">
            Adicionar Rocketcoins
          </h2>
          <p className="text-gray-400">
            Creditar moedas para usuários do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seleção de Usuário */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <AiOutlineUser className="mr-2 text-blue-400" />
            Selecionar Usuário
          </h3>

          {/* Busca */}
          <div className="relative mb-4">
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Lista de Usuários */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {carregando ? (
              <div className="flex items-center justify-center py-8">
                <AiOutlineLoading3Quarters className="animate-spin text-2xl text-gray-400 mr-2" />
                <span className="text-gray-400">Carregando usuários...</span>
              </div>
            ) : usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((usuario) => (
                <button
                  key={usuario.id}
                  onClick={() => setUsuarioSelecionado(usuario)}
                  className={`w-full p-3 rounded-lg text-left transition-all border ${
                    usuarioSelecionado?.id === usuario.id
                      ? 'bg-blue-600/20 border-blue-500/50 text-white'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{usuario.name}</div>
                      <div className="text-sm text-gray-400">{usuario.email}</div>
                    </div>
                    {usuarioSelecionado?.id === usuario.id && (
                      <AiOutlineCheckCircle className="text-blue-400" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                {busca ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
              </div>
            )}
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <AiOutlineDollarCircle className="mr-2 text-green-400" />
            Dados da Transação
          </h3>

          {erro && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuário Selecionado */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Usuário Selecionado
              </label>
              <div className={`p-3 rounded-lg border ${
                usuarioSelecionado
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                  : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}>
                {usuarioSelecionado
                  ? `${usuarioSelecionado.name} (${usuarioSelecionado.email})`
                  : 'Nenhum usuário selecionado'
                }
              </div>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Valor (RC$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
                required
              />
            </div>

            {/* Título */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Título *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Bônus por desempenho"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Descrição *
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o motivo da adição de rocketcoins..."
                rows={3}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none resize-none"
                required
              />
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={salvando || !usuarioSelecionado}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {salvando ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <AiOutlinePlus />
                  <span>Adicionar Rocketcoins</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Preview da Transação */}
      {usuarioSelecionado && valor && titulo && (
        <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-green-400 font-medium mb-2">Preview da Transação</h4>
          <div className="text-white">
            <span className="font-bold">+RC$ {Number(valor || 0).toFixed(2)}</span>
            {' será creditado para '}
            <span className="font-bold">{usuarioSelecionado.name}</span>
            {' pelo motivo: '}
            <span className="italic">"{titulo}"</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdicionarRocketcoins