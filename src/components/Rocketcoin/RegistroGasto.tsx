import { useState } from 'react'
import { AiOutlinePlus, AiOutlineShoppingCart, AiOutlineDollarCircle, AiOutlineFileText, AiOutlineCheck } from 'react-icons/ai'
import { walletService } from '../../hooks/useWallet'

interface Gasto {
  id: string
  titulo: string
  descricao: string
  valor: number
  data: string
}

function RegistrarGasto() {
  const [gastos, setGastos] = useState<Gasto[]>([
    {
      id: '1',
      titulo: 'Desconto Almoço',
      descricao: 'Resgate de 10% desconto no almoço',
      valor: 15.00,
      data: '04/06/2025'
    },
    {
      id: '2',
      titulo: 'Home Office',
      descricao: 'Dia de trabalho remoto',
      valor: 100.00,
      data: '02/06/2025'
    }
  ])

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formulario, setFormulario] = useState({
    titulo: '',
    descricao: '',
    valor: ''
  })
  const [salvando, setSalvando] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormulario(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const [erro, setErro] = useState('')

  // E atualize o handleSubmit:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formulario.titulo || !formulario.descricao || !formulario.valor) {
      return
    }

    setSalvando(true)
    setErro('') // Limpar erro anterior

    try {
      await walletService.solicitarTransacao(
        formulario.titulo,
        formulario.descricao,
        parseFloat(formulario.valor),
        new Date().toISOString()
      )

      // Sucesso
      setFormulario({ titulo: '', descricao: '', valor: '' })
      setMostrarFormulario(false)

    } catch (error: any) {
      setErro(error.message || 'Saldo insuficiente ou erro na transação')
    } finally {
      setSalvando(false)
    }
  }

  const cancelarFormulario = () => {
    setFormulario({ titulo: '', descricao: '', valor: '' })
    setMostrarFormulario(false)
  }

  const totalGastos = gastos.reduce((acc, gasto) => acc + gasto.valor, 0)

  return (
    <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          Meus Gastos
          <AiOutlineShoppingCart className="ml-2 text-white" />
        </h3>

        {!mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-rocket-red-600 hover:bg-rocket-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <AiOutlinePlus className="text-sm" />
            <span>Novo Gasto</span>
          </button>
        )}
      </div>

      {/* Formulário */}
      {mostrarFormulario && (
        <div className="mb-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-medium mb-4 flex items-center">
            <AiOutlinePlus className="mr-2 text-rocket-red-600" />
            Registrar Novo Gasto
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formulario.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Ex: Desconto Almoço"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-rocket-red-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Descrição *
              </label>
              <textarea
                value={formulario.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descreva o que você gastou..."
                rows={3}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-rocket-red-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Valor (RC$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formulario.valor}
                onChange={(e) => handleInputChange('valor', e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-rocket-red-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 bg-rocket-red-600 hover:bg-rocket-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {salvando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <AiOutlineCheck />
                    <span>Salvar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={cancelarFormulario}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>

            </div>
            {erro && (
              <div className="mb-4 p-3 text-center bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {erro}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Total de Gastos */}
      <div className="mb-6 bg-red-600/10 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-red-400 text-sm font-medium">Total de Gastos</div>
            <div className="text-2xl font-bold text-white">
              RC$ {totalGastos.toFixed(2)}
            </div>
          </div>
          <AiOutlineDollarCircle className="text-red-400 text-2xl" />
        </div>
      </div>

      {/* Lista de Gastos */}
      <div className="space-y-3">
        {gastos.length > 0 ? (
          gastos.map((gasto) => (
            <div
              key={gasto.id}
              className="bg-red-600/10 border border-red-500/30 rounded-lg p-4 hover:bg-red-600/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm mb-1">
                    {gasto.titulo}
                  </h4>
                  <p className="text-gray-400 text-xs mb-2 leading-relaxed">
                    {gasto.descricao}
                  </p>
                  <div className="text-gray-500 text-xs">
                    {gasto.data}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-red-400 font-bold text-lg font-mono">
                    -RC$ {gasto.valor.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <AiOutlineFileText className="mx-auto text-4xl text-gray-500 mb-4" />
            <div className="text-gray-400 mb-2">
              Nenhum gasto registrado
            </div>
            <p className="text-gray-500 text-sm">
              Clique em "Novo Gasto" para registrar seus gastos com Rocketcoins
            </p>
          </div>
        )}
      </div>

      {/* Rodapé */}
      {gastos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <span className="text-sm text-gray-400">
              {gastos.length} {gastos.length === 1 ? 'gasto registrado' : 'gastos registrados'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegistrarGasto