import { useState, useEffect } from "react";
import {
  AiOutlineMinus,
  AiOutlineUser,
  AiOutlineSearch,
  AiOutlineLoading3Quarters,
  AiOutlineCheckCircle,
  AiOutlineDollarCircle,
  AiOutlineWarning,
} from "react-icons/ai";
import { authService } from "../../hooks/useAuth";
import { walletService } from "../../hooks/useWallet";
import { AuxiliaryFunctions } from "../../utils/AuxiliaryFunctions";

interface Usuario {
  id: number;
  name: string;
  email: string;
  balance?: number;
}

interface RemoverRocketcoinsProps {
  onUpdate: () => void;
}

function RemoverRocketcoins({ onUpdate }: RemoverRocketcoinsProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(
    null
  );
  const [saldoUsuario, setSaldoUsuario] = useState<number | null>(null);
  const [valor, setValor] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarUsuarios();
  }, []);

  useEffect(() => {
    if (usuarioSelecionado) {
      buscarSaldoUsuario(usuarioSelecionado.id);
    } else {
      setSaldoUsuario(null);
    }
  }, [usuarioSelecionado]);

  const buscarUsuarios = async () => {
    try {
      setCarregando(true);
      const response = await authService.buscarMembrosAtivo();

      if (response.data) {
        setUsuarios(
          response.data.map((membro: any) => ({
            id: Number(membro.id),
            name: membro.name,
            email: membro.email,
            balance: membro.balance,
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setErro("Erro ao carregar usuários");
    } finally {
      setCarregando(false);
    }
  };

  const buscarSaldoUsuario = async (userId: number) => {
    try {
      const response = await walletService.buscarSaldoUsuario(userId);
      console.log("Sladinho", response);
      if (response.success) {
        setSaldoUsuario(Number(response.wallet?.balance) || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar saldo:", error);
      setSaldoUsuario(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioSelecionado || !valor || !titulo || !descricao) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    const valorNum = Number(valor);

    if (valorNum <= 0) {
      setErro("O valor deve ser maior que zero");
      return;
    }

    if ( saldoUsuario !== null && Number(valor) > Math.round(saldoUsuario * 100)) {
      setErro(
        `Valor excede o saldo disponível (RC$ ${saldoUsuario.toFixed(2)})`
      );
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const response = await walletService.removerRocketcoins({
        userId: usuarioSelecionado.id,
        amount: Number(valorNum / 100),
        title: titulo,
        description: descricao,
      });

      if (response.success) {
        // Limpar formulário
        setUsuarioSelecionado(null);
        setValor("");
        setTitulo("");
        setDescricao("");
        setSaldoUsuario(null);

        // Atualizar estatísticas
        onUpdate();

        alert(
          `RC$ ${valorNum.toFixed(2)} removido com sucesso de ${
            usuarioSelecionado.name
          }!`
        );
      } else {
        throw new Error(response.message || "Erro ao remover rocketcoins");
      }
    } catch (error: any) {
      console.error("Erro ao remover rocketcoins:", error);
      setErro(error.message || "Erro ao processar solicitação");
    } finally {
      setSalvando(false);
    }
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 9) valor = valor.slice(0, 9);
    setValor(valor);
  };

  const usuariosFiltrados = usuarios.filter(
    (user) =>
      user.name.toLowerCase().includes(busca.toLowerCase()) ||
      user.email.toLowerCase().includes(busca.toLowerCase())
  );

  const valorExcedeSaldo =
    saldoUsuario !== null && Number(valor) > Math.round(saldoUsuario * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <AiOutlineMinus className="text-2xl text-red-500" />
        <div>
          <h2 className="text-xl font-semibold text-white">
            Remover Rocketcoins
          </h2>
          <p className="text-gray-400">Debitar moedas de usuários do sistema</p>
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
                      ? "bg-blue-600/20 border-blue-500/50 text-white"
                      : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{usuario.name}</div>
                      <div className="text-sm text-gray-400">
                        {usuario.email}
                      </div>
                    </div>
                    {usuarioSelecionado?.id === usuario.id && (
                      <AiOutlineCheckCircle className="text-blue-400" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                {busca
                  ? "Nenhum usuário encontrado"
                  : "Nenhum usuário disponível"}
              </div>
            )}
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <AiOutlineDollarCircle className="mr-2 text-red-400" />
            Dados da Transação
          </h3>

          {erro && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuário e Saldo */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Usuário Selecionado
              </label>
              <div
                className={`p-3 rounded-lg border ${
                  usuarioSelecionado
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                    : "bg-gray-700 border-gray-600 text-gray-400"
                }`}
              >
                {usuarioSelecionado
                  ? `${usuarioSelecionado.name} (${usuarioSelecionado.email})`
                  : "Nenhum usuário selecionado"}
              </div>

              {usuarioSelecionado && saldoUsuario !== null && (
                <div className="mt-2 p-2 bg-yellow-600/10 border border-yellow-500/30 rounded text-yellow-400 text-sm">
                  Saldo atual: RC$ {saldoUsuario.toFixed(2)}
                </div>
              )}
            </div>

            {/* Valor */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Valor (RC$) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                max={saldoUsuario || undefined}
                value={AuxiliaryFunctions.formatarMoeda(valor)}
                onChange={handleValorChange}
                placeholder="0.00"
                className={`w-full rounded-lg px-3 py-2 border focus:outline-none ${
                  valorExcedeSaldo
                    ? "bg-red-900/20 border-red-500 text-red-400 focus:border-red-400"
                    : "bg-gray-700 border-gray-600 text-white focus:border-red-500"
                }`}
                required
              />
              {valorExcedeSaldo && (
                <p className="mt-1 text-red-400 text-sm flex items-center">
                  <AiOutlineWarning className="mr-1" />
                  Valor excede o saldo disponível
                </p>
              )}
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
                placeholder="Ex: Desconto por atraso"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-red-500 focus:outline-none"
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
                placeholder="Descreva o motivo da remoção de rocketcoins..."
                rows={3}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-red-500 focus:outline-none resize-none"
                required
              />
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={salvando || !usuarioSelecionado || valorExcedeSaldo}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {salvando ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <AiOutlineMinus />
                  <span>Remover Rocketcoins</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Preview da Transação */}
      {usuarioSelecionado && valor && titulo && !valorExcedeSaldo && (
        <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4">
          <h4 className="text-red-400 font-medium mb-2">
            Preview da Transação
          </h4>
          <div className="text-white">
            <span className="font-bold">
              +RC${" "}
              {(Number(valor || 0) / 100).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            {" será debitado de "}
            <span className="font-bold">{usuarioSelecionado.name}</span>
            {" pelo motivo: "}
            <span className="italic">"{titulo}"</span>
          </div>
          {saldoUsuario !== null && (
            <div className="text-gray-400 text-sm mt-1">
              Saldo após transação: RC${" "}
              {(saldoUsuario - Number(valor || 0) / 100).toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </div>
          )}
        </div>
      )}

      {/* Aviso */}
      <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AiOutlineWarning className="text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-medium mb-1">Atenção</h4>
            <p className="text-gray-300 text-sm">
              Esta ação remove rocketcoins permanentemente do usuário.
              Certifique-se de que a remoção é necessária e justificada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RemoverRocketcoins;
