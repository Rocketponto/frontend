interface Paginacao {
  paginaAtual: number;
  itensPorPagina: number;
  totalItens: number;
  totalPaginas: number;
}

export const AuxiliaryFunctions = {

  formatarData: (dataString: string) => {
      const data = new Date(dataString)

      const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      const horaFormatada = data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })

      return `${dataFormatada} às ${horaFormatada}`
    },

    proximaPagina: (paginacao: Paginacao, functionFetch: any) => {
      if (paginacao.paginaAtual < paginacao.totalPaginas) {
        const novaPagina = paginacao.paginaAtual + 1
        return functionFetch(novaPagina, paginacao.itensPorPagina)
      }
    }
}