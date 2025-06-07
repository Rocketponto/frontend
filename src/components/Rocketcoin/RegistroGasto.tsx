import { useEffect, useState } from "react";
import {
  AiOutlinePlus,
  AiOutlineShoppingCart,
  AiOutlineDollarCircle,
  AiOutlineFileText,
  AiOutlineCheck,
} from "react-icons/ai";
import { walletService } from "../../hooks/useWallet";
import { AuxiliaryFunctions } from "../../utils/AuxiliaryFunctions";

interface Solicitacao {
  id: number;
  walletId: number;
  type: string;
  amount: string;
  title: string;
  description: string;
  reference: string;
  processedBy: number | null;
  status: string;
  balanceBefore: string;
  balanceAfter: string;
  createdAt: string;
  updatedAt: string;
  processor: any | null;
}

function RegistrarGasto() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [total, setTotal] = useState(0);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState({
    titulo: "",
    descricao: "",
    valor: "",
  });
  const [salvando, setSalvando] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormulario((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [erro, setErro] = useState("");

  const [paginacao, setPaginacao] = useState({
    paginaAtual: 1,
    itensPorPagina: 5,
    totalItens: 0,
    totalPaginas: 0,
  });
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formulario.titulo || !formulario.descricao || !formulario.valor) {
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      await walletService.solicitarTransacao(
        formulario.titulo,
        formulario.descricao,
        parseFloat((Number(formulario.valor) / 100).toFixed(2)),
        new Date().toISOString()
      );

      setFormulario({ titulo: "", descricao: "", valor: "" });
      setMostrarFormulario(false);
      await fetchSolicitacoesPendentes(1, paginacao.itensPorPagina);
    } catch (error: any) {
      setErro(error.message || "Saldo insuficiente ou erro na transação");
    } finally {
      setSalvando(false);
    }
  };

  const cancelarFormulario = () => {
    setFormulario({ titulo: "", descricao: "", valor: "" });
    setMostrarFormulario(false);
  };

  const fetchSolicitacoesPendentes = async (
    pagina: number = 1,
    limite: number = 10
  ) => {
    try {
      setCarregando(true);

      const response = await walletService.buscarMinhasSolicitaçõesPendentes({
        page: pagina,
        limit: limite,
      });

      if (response.success) {
        const totalGastoSolicitacoes = response.summary;
        setTotal(totalGastoSolicitacoes);

        const solicitacoes = response.requests || [];
        setSolicitacoes(solicitacoes);

        if (response.pagination) {
          setPaginacao({
            paginaAtual: response.pagination.currentPage || pagina,
            itensPorPagina: response.pagination.itemsPerPage || limite,
            totalItens: response.pagination.totalItems || 0,
            totalPaginas: response.pagination.totalPages || 0,
          });
        }
      }
    } catch (error: any) {
      setErro(error.message || "Erro ao buscar solicitações de transação.");
      setCarregando(false);
    } finally {
      setCarregando(false);
    }
  };

  const proximaPagina = () => {
    if (paginacao.paginaAtual < paginacao.totalPaginas) {
      const novaPagina = paginacao.paginaAtual + 1;
      fetchSolicitacoesPendentes(novaPagina, paginacao.itensPorPagina);
    }
  };

  const paginaAnterior = () => {
    if (paginacao.paginaAtual > 1) {
      const novaPagina = paginacao.paginaAtual - 1;
      fetchSolicitacoesPendentes(novaPagina, paginacao.itensPorPagina);
    }
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 9) valor = valor.slice(0, 9);
    setFormulario((prev) => ({
      ...prev,
      valor,
    }));
  };

  const irParaPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= paginacao.totalPaginas) {
      fetchSolicitacoesPendentes(pagina, paginacao.itensPorPagina);
    }
  };

  useEffect(() => {
    fetchSolicitacoesPendentes(1, 5);
  }, []);

  return (
    <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          Minhas Solicitações de Gastos
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

      {mostrarFormulario && (
        <div className="mb-6 bg-gray-rocket-700/50 rounded-lg p-4 shadow-lg shadow-black/20">
          <h4 className="text-white font-medium mb-4 flex items-center">
            Solicitar Novo Gasto
            <AiOutlinePlus className="ml-2 text-rocket-red-600" />
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formulario.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                placeholder="Ex: Desconto Almoço"
                className="w-full bg-gray-rocket-700 text-white rounded-lg px-3 py-2 border border-rocket-red-700 focus:border-rocket-red-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Descrição *
              </label>
              <textarea
                value={formulario.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva o que você gastou..."
                rows={3}
                className="w-full bg-gray-rocket-700 text-white rounded-lg px-3 py-2 border border-rocket-red-600 focus:border-rocket-red-700 focus:outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Valor (RC$) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={AuxiliaryFunctions.formatarMoeda(formulario.valor)}
                onChange={handleValorChange}
                placeholder="0,00"
                className="w-full bg-gray-rocket-700 text-white rounded-lg px-3 py-2 border border-rocket-red-600 focus:border-rocket-red-700 focus:outline-none"
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

      <div className="mb-6 bg-red-600/10 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-red-400 text-sm font-medium">
              Total de RC$ nas Solicitações
            </div>
            <div className="text-2xl font-bold text-white">
              RC$ {total.toFixed(2)}
            </div>
          </div>
          <AiOutlineDollarCircle className="text-red-400 text-2xl" />
        </div>
      </div>

      <div className="space-y-3">
        {solicitacoes.length > 0 ? (
          solicitacoes.map((solicitacao) => (
            <div
              key={solicitacao.id}
              className="bg-gray-rocket-700/10 border border-yellow-500/30 rounded-lg p-4 hover:bg-yellow-600/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm mb-1">
                    {solicitacao.title}
                  </h4>
                  <p className="text-gray-400 text-xs mb-1 leading-relaxed">
                    {solicitacao.description}
                  </p>
                  <span className="bg-yellow-600 p-1 text-white rounded-lg text-xs">
                    {solicitacao.status && "Pendente"}
                  </span>
                  <div className="text-gray-500 text-xs mt-1">
                    {AuxiliaryFunctions.formatarData(solicitacao.createdAt)}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-white font-bold text-lg font-mono">
                    RC$ {solicitacao.amount}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <AiOutlineFileText className="mx-auto text-4xl text-gray-500 mb-4" />
            <div className="text-gray-400 mb-2">
              Nenhuma solicitação registrada
            </div>
            <p className="text-gray-500 text-sm">
              Clique em "Novo Gasto" para registrar seus gastos com Rocketcoins
            </p>
          </div>
        )}
      </div>

      {paginacao.totalPaginas > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Página {paginacao.paginaAtual} de {paginacao.totalPaginas}(
              {paginacao.totalItens}{" "}
              {paginacao.totalItens === 1 ? "solicitação" : "solicitações"})
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={paginaAnterior}
                disabled={paginacao.paginaAtual === 1 || carregando}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
              >
                ← Anterior
              </button>

              <div className="flex space-x-1">
                {Array.from(
                  { length: Math.min(5, paginacao.totalPaginas) },
                  (_, i) => {
                    let numeroPagina;

                    if (paginacao.totalPaginas <= 5) {
                      numeroPagina = i + 1;
                    } else {
                      const meio = Math.floor(5 / 2);
                      let inicio = Math.max(1, paginacao.paginaAtual - meio);
                      let fim = Math.min(paginacao.totalPaginas, inicio + 4);

                      if (fim - inicio < 4) {
                        inicio = Math.max(1, fim - 4);
                      }

                      numeroPagina = inicio + i;
                    }

                    return (
                      <button
                        key={numeroPagina}
                        onClick={() => irParaPagina(numeroPagina)}
                        disabled={carregando}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          numeroPagina === paginacao.paginaAtual
                            ? "bg-rocket-red-600 text-white"
                            : "bg-gray-600 hover:bg-gray-700 text-white"
                        }`}
                      >
                        {numeroPagina}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={proximaPagina}
                disabled={
                  paginacao.paginaAtual === paginacao.totalPaginas || carregando
                }
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
              >
                Próxima →
              </button>
            </div>
          </div>

          {carregando && (
            <div className="text-center mt-2">
              <span className="text-sm text-gray-400">Carregando...</span>
            </div>
          )}
        </div>
      )}

      {solicitacoes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <span className="text-sm text-gray-400">
              {solicitacoes.length}{" "}
              {solicitacoes.length === 1
                ? "solicitação registrada"
                : "solicitações registradas"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrarGasto;
