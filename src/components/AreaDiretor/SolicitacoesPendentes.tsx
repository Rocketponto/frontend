import {
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineCloseCircle,
  AiOutlineLoading3Quarters,
  AiOutlineReload,
  AiOutlineUser,
} from "react-icons/ai";
import { walletService } from "../../hooks/useWallet";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "../Toast/ToastProvider";

interface Solicitacao {
  id: number;
  walletId: number;
  type: "DEBIT" | "CREDIT";
  amount: string;
  title: string;
  description: string;
  reference: string;
  processedBy: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  balanceBefore: string;
  balanceAfter: string;
  createdAt: string;
  updatedAt: string;
  wallet: {
    id: number;
    userId: number;
    balance: string;
    totalEarned: string;
    totalSpent: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

interface SolicitacoesPendentesProps {
  onUpdate: () => void;
}

function SolicitacoesPendentes({ onUpdate }: SolicitacoesPendentesProps) {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<number | null>(null);
  const [modalRejeitar, setModalRejeitar] = useState<{
    aberto: boolean;
    id: number | null;
  }>({ aberto: false, id: null });
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const { showSuccess, showError } = useToast()

  const [paginacao, setPaginacao] = useState({
    paginaAtual: 1,
    totalPaginas: 1,
    totalItens: 0,
    itensPorPagina: 5,
  });

  const buscarSolicitacoes = useCallback(async () => {
    try {
      setCarregando(true);

      const response = await walletService.buscarTodasSolicitacoesPendentes({
        page: paginacao.paginaAtual,
        limit: paginacao.itensPorPagina,
      });

      if (response.success) {
        setSolicitacoes(response.requests || []);

        if (response.pagination) {
          setPaginacao((prev) => ({
            ...prev,
            totalPaginas: response.pagination?.totalPages || 1,
            totalItens: response.pagination?.totalItems ?? 0,
            itensPorPagina:
              response.pagination?.itemsPerPage ?? paginacao.itensPorPagina,
          }));
        }
      }
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      setSolicitacoes([]);
    } finally {
      setCarregando(false);
    }
  }, [paginacao.paginaAtual, paginacao.itensPorPagina]);

  useEffect(() => {
    buscarSolicitacoes();
  }, [buscarSolicitacoes]);

  const irParaPagina = (pagina: number) => {
    setPaginacao((prev) => ({ ...prev, paginaAtual: pagina }));
  };

  const processarSolicitacao = async (id: number, acao: 'APPROVED' | 'REJECTED', motivo?: string) => {
    try {
      setProcessando(id);

      let response;

      if (acao === 'APPROVED') {
        response = await walletService.aprovarSolicitacao(id);
        showSuccess('Solicitação aprovada!', 'Solicitação de compra aprovada.');
        buscarSolicitacoes();
      } else {
        response = await walletService.rejeitarSolicitacao(id, motivo || 'Rejeitado pelo diretor');
        showSuccess('Solicitação recusada!', 'Solicitação de compra recusada.');
        buscarSolicitacoes();
      }

      if (response.success) {
        await buscarSolicitacoes();
        onUpdate();
      } else {
        throw new Error(response.message || 'Erro ao processar solicitação');
      }
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'Erro desconhecido ao processar solicitação';

      showError('Erro ao processar solicitação!', errorMessage);
    } finally {
      setProcessando(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-600/10 border-yellow-500/30 text-yellow-400";
      case "APPROVED":
        return "bg-green-600/10 border-green-500/30 text-green-400";
      case "REJECTED":
        return "bg-red-600/10 border-red-500/30 text-red-400";
      default:
        return "bg-gray-600/10 border-gray-500/30 text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendente";
      case "APPROVED":
        return "Aprovado";
      case "REJECTED":
        return "Rejeitado";
      default:
        return status;
    }
  };

  const solicitacoesFiltradas = solicitacoes.filter((sol: Solicitacao) => sol.status === 'PENDING');

  const verificarSaldoSuficiente = (solicitacao: Solicitacao) => {
    const saldoAtual = Number(solicitacao.wallet.balance);
    const valorSolicitado = Number(solicitacao.amount);
    return saldoAtual >= valorSolicitado;
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <AiOutlineLoading3Quarters className="text-2xl text-gray-400 animate-spin mr-3" />
        <span className="text-gray-400">Carregando solicitações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {modalRejeitar.aberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-rocket-600 rounded-lg p-6 w-full max-w-sm shadow-lg shadow-black/10">
            <h3 className="text-lg font-semibold text-white mb-2">Motivo da rejeição</h3>
            <textarea
              className="w-full rounded p-2 bg-gray-rocket-700 text-white border-rocket-red-700 focus:border-red-500 mb-4"
              rows={3}
              placeholder="Digite o motivo (opcional)"
              value={motivoRejeicao}
              onChange={e => setMotivoRejeicao(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={() => setModalRejeitar({ aberto: false, id: null })}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={async () => {
                  if (modalRejeitar.id) {
                    await processarSolicitacao(modalRejeitar.id, 'REJECTED', motivoRejeicao || 'Rejeitado pelo diretor');
                  }
                  setModalRejeitar({ aberto: false, id: null });
                  setMotivoRejeicao("");
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <AiOutlineClockCircle className="mr-2 text-yellow-500" />
          Solicitações Pendentes
          {paginacao.totalItens > 0 && (
            <span className="ml-2 text-sm text-gray-400">
              ({paginacao.totalItens}{" "}
              {paginacao.totalItens === 1 ? "solicitação" : "solicitações"})
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
              className={`border rounded-lg p-6 transition-all ${getStatusColor(
                solicitacao.status
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <AiOutlineUser className="text-gray-400" />
                    <div>
                      <h3 className="text-white font-medium">
                        {solicitacao.wallet?.user?.name ||
                          "Usuário não identificado"}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {solicitacao.wallet?.user?.email ||
                          "Email não disponível"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                        solicitacao.status
                      )}`}
                    >
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
                        -RTC$ {Number(solicitacao.amount).toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Solicitado em{" "}
                        {new Date(solicitacao.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>
                      Saldo atual da carteira:{" "}
                      <span className="text-green-700">
                        RTC$ {Number(solicitacao.wallet.balance).toFixed(2)}
                      </span>
                    </span>
                    <span>→</span>
                    {verificarSaldoSuficiente(solicitacao) ? (
                      <span className="text-yellow-400">
                        Saldo após aprovação: RTC${" "}
                        {(
                          Number(solicitacao.wallet.balance) -
                          Number(solicitacao.amount)
                        ).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-red-400 font-medium">
                        ⚠️ Saldo insuficiente (faltam RTC${" "}
                        {(
                          Number(solicitacao.amount) -
                          Number(solicitacao.wallet.balance)
                        ).toFixed(2)}
                        )
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões sempre visíveis para solicitações pendentes */}
              <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setModalRejeitar({ aberto: true, id: solicitacao.id })}
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
                    onClick={() =>
                      processarSolicitacao(solicitacao.id, "APPROVED")
                    }
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
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <AiOutlineClockCircle className="mx-auto text-4xl text-gray-500 mb-4" />
            <h3 className="text-gray-400 text-lg mb-2">
              Nenhuma solicitação pendente
            </h3>
            <p className="text-gray-500">
              Não há solicitações aguardando aprovação no momento
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
            disabled={
              paginacao.paginaAtual === paginacao.totalPaginas || carregando
            }
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}

export default SolicitacoesPendentes;
