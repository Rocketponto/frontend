interface Paginacao {
  paginaAtual: number;
  itensPorPagina: number;
  totalItens: number;
  totalPaginas: number;
}

// ✅ CORRIGIR: Interface específica para função de fetch em vez de usar 'any'
interface FunctionFetch {
  (pagina: number, itensPorPagina: number): Promise<void> | void;
}

export const AuxiliaryFunctions = {
  formatarData: (dataString: string): string => {
    const data = new Date(dataString);

    const dataFormatada = data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const horaFormatada = data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${dataFormatada} às ${horaFormatada}`;
  },

  proximaPagina: (paginacao: Paginacao, functionFetch: FunctionFetch): Promise<void> | void => {
    if (paginacao.paginaAtual < paginacao.totalPaginas) {
      const novaPagina = paginacao.paginaAtual + 1;
      return functionFetch(novaPagina, paginacao.itensPorPagina);
    }
  },

  formatarMoeda: (valor: string): string => {
    const numero = Number(valor.replace(/\D/g, ""));
    return (numero / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  // ✅ FUNÇÕES EXTRAS ÚTEIS para o projeto

  formatarDataSimples: (dataString: string): string => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  },

  formatarHora: (dataString: string): string => {
    const data = new Date(dataString);
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  calcularDiferenca: (dataInicio: string, dataFim: string): string => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diferencaMs = fim.getTime() - inicio.getTime();

    const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${horas}h ${minutos}m`;
  },

  formatarNumero: (numero: number): string => {
    return numero.toLocaleString("pt-BR");
  },

  formatarMoedaCompleta: (valor: number): string => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },

  validarEmail: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  truncarTexto: (texto: string, limite: number): string => {
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + "...";
  },

  capitalizar: (texto: string): string => {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  },

  formatarTelefone: (telefone: string): string => {
    const numero = telefone.replace(/\D/g, "");

    if (numero.length === 11) {
      return numero.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (numero.length === 10) {
      return numero.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return telefone;
  },

  formatarCPF: (cpf: string): string => {
    const numero = cpf.replace(/\D/g, "");
    return numero.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  },

  removerAcentos: (texto: string): string => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  },

  gerarId: (): string => {
    return Math.random().toString(36).substr(2, 9);
  },

  isDataValida: (data: string): boolean => {
    const dataObj = new Date(data);
    return !isNaN(dataObj.getTime());
  },

  calcularIdade: (dataNascimento: string): number => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  },

  proximaPaginaSegura: (paginacao: Paginacao, functionFetch: FunctionFetch): void => {
    try {
      if (paginacao.paginaAtual < paginacao.totalPaginas) {
        const novaPagina = paginacao.paginaAtual + 1;
        functionFetch(novaPagina, paginacao.itensPorPagina);
      }
    } catch (error) {
      console.error('Erro ao buscar próxima página:', error);
    }
  },

  paginaAnterior: (paginacao: Paginacao, functionFetch: FunctionFetch): void => {
    try {
      if (paginacao.paginaAtual > 1) {
        const paginaAnterior = paginacao.paginaAtual - 1;
        functionFetch(paginaAnterior, paginacao.itensPorPagina);
      }
    } catch (error) {
      console.error('Erro ao buscar página anterior:', error);
    }
  },

  irParaPagina: (paginacao: Paginacao, numeroPagina: number, functionFetch: FunctionFetch): void => {
    try {
      if (numeroPagina >= 1 && numeroPagina <= paginacao.totalPaginas) {
        functionFetch(numeroPagina, paginacao.itensPorPagina);
      }
    } catch (error) {
      console.error('Erro ao ir para página específica:', error);
    }
  }
};
