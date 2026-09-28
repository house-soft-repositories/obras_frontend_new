export type ObraOrcamentoReadModel = {
  orcamentoId: string;
  obraId: string;
  fonte: {
    fonteId: string;
    fonteNome: string;
    fonteDescricao: string | null;
    valor: string;
  };
};
