import { useState, useEffect, type JSX } from "react";
import {
  AiOutlinePlus,
  AiOutlineMinus,
  AiOutlineUser,
  AiOutlineTeam,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineBarChart,
  AiOutlineFileText,
  AiOutlineDollarCircle,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import { FaCoins } from "react-icons/fa";
import SolicitacoesPendentes from "../components/AreaDiretor/SolicitacoesPendentes";
import AdicionarRocketcoins from "../components/AreaDiretor/AdicionarRocketcoins";
import RemoverRocketcoins from "../components/AreaDiretor/RemoverRocketcoins";
import RelatorioRocketcoins from "../components/AreaDiretor/RelatorioRocketcoins";
import { walletService } from "../hooks/useWallet";
import { useNavigate } from "react-router-dom";

interface TabOption {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  iconColor: string;
  count?: number;
}

function GerenciarRocketcoins() {
  const [tabAtiva, setTabAtiva] = useState("solicitacoes");
  const [estatisticas, setEstatisticas] = useState({
    totalUsuarios: 0,
    totalDistribuido: 0,
    solicitacoesPendentes: 0,
    transacoesHoje: 0,
  });
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    buscarEstatisticas();
  }, []);

  const buscarEstatisticas = async () => {
    try {
      setCarregando(true);

      // Buscar estatísticas gerais
      const response = await walletService.buscarEstatisticasGerais();

      if (response.success) {
        setEstatisticas({
          totalUsuarios: response.totalUsuarios || 0,
          totalDistribuido: Number(response.totalDistribuido) || 0,
          solicitacoesPendentes: response.solicitacoesPendentes || 0,
          transacoesHoje: response.transacoesHoje || 0,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setCarregando(false);
    }
  };

  const tabs: TabOption[] = [
    {
      id: "solicitacoes",
      title: "Solicitações Pendentes",
      description: "Aprovar ou rejeitar solicitações de gastos",
      icon: <AiOutlineClockCircle />,
      iconColor: "text-yellow-500",
      count: estatisticas.solicitacoesPendentes,
    },
    {
      id: "adicionar",
      title: "Adicionar Rocketcoins",
      description: "Creditar moedas para usuários",
      icon: <AiOutlinePlus />,
      iconColor: "text-green-500",
    },
    {
      id: "remover",
      title: "Remover Rocketcoins",
      description: "Debitar moedas de usuários",
      icon: <AiOutlineMinus />,
      iconColor: "text-red-500",
    },
    {
      id: "relatorio",
      title: "Relatórios",
      description: "Visualizar estatísticas e histórico",
      icon: <AiOutlineBarChart />,
      iconColor: "text-blue-500",
    },
  ];

  const renderConteudo = () => {
    switch (tabAtiva) {
      case "solicitacoes":
        return <SolicitacoesPendentes onUpdate={buscarEstatisticas} />;
      case "adicionar":
        return <AdicionarRocketcoins onUpdate={buscarEstatisticas} />;
      case "remover":
        return <RemoverRocketcoins onUpdate={buscarEstatisticas} />;
      case "relatorio":
        return <RelatorioRocketcoins />;
      default:
        return <SolicitacoesPendentes onUpdate={buscarEstatisticas} />;
    }
  };

  const handleBackAreaDiretor = () => {
    navigate("/area-diretor");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={handleBackAreaDiretor}
            className="flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
            title="Voltar para Área do Diretor"
          >
            <AiOutlineArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-white">
              Gerenciar Rocketcoins
            </h1>
            <p className="text-gray-300">
              Gerencie moedas, solicitações e relatórios
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-400 text-sm font-medium">
                Total de Usuários
              </div>
              <div className="text-2xl font-bold text-white">
                {carregando ? "..." : estatisticas.totalUsuarios}
              </div>
            </div>
            <AiOutlineTeam className="text-blue-400 text-2xl" />
          </div>
        </div>

        <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-400 text-sm font-medium">
                Total Distribuído
              </div>
              <div className="text-2xl font-bold text-white">
                RC${" "}
                {carregando ? "..." : estatisticas.totalDistribuido.toFixed(2)}
              </div>
            </div>
            <AiOutlineDollarCircle className="text-green-400 text-2xl" />
          </div>
        </div>

        <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-yellow-400 text-sm font-medium">
                Solicitações Pendentes
              </div>
              <div className="text-2xl font-bold text-white">
                {carregando ? "..." : estatisticas.solicitacoesPendentes}
              </div>
            </div>
            <AiOutlineClockCircle className="text-yellow-400 text-2xl" />
          </div>
        </div>

        <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-400 text-sm font-medium">
                Transações Hoje
              </div>
              <div className="text-2xl font-bold text-white">
                {carregando ? "..." : estatisticas.transacoesHoje}
              </div>
            </div>
            <AiOutlineFileText className="text-purple-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* Navegação por Tabs */}
      <div className="bg-gray-800/50 rounded-lg p-1 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabAtiva(tab.id)}
              className={`relative p-4 rounded-lg text-left transition-all duration-200 ${
                tabAtiva === tab.id
                  ? "bg-gray-700 text-white border border-gray-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`${tab.iconColor}`}>{tab.icon}</div>
                <div className="font-medium text-sm">{tab.title}</div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{tab.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da Tab Ativa */}
      <div className="min-h-[600px]">{renderConteudo()}</div>
    </div>
  );
}

export default GerenciarRocketcoins;
