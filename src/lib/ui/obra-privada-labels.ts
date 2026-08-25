/**
 * Rotulos PT-BR e tons de chip do modulo Obras Privadas (referencia Claude
 * Design "Obras Privadas"). Funcoes puras: os identificadores do dominio ficam
 * sem acento (decisao 10 do projeto vale para codigo), as strings de interface
 * saem acentuadas.
 *
 * O mapa de tons e a fonte unica da cor de cada estado: listagem, cabecalho,
 * mapa e relatorio leem daqui, entao um chip nunca aparece verde numa tela e
 * cinza em outra.
 */

/** Classe global de chip (definidas em globals.css). */
export type TomChip =
  | "chip-azul"
  | "chip-verde"
  | "chip-vermelho"
  | "chip-cinza"
  | "chip-ambar"
  | "chip-roxo"
  | "chip-teal";

// ---------------------------------------------------------------------------
// Eixo 1 — situacao do alvara
// ---------------------------------------------------------------------------

const SITUACAO_ALVARA: Record<string, { rotulo: string; tom: TomChip }> = {
  SEM_ALVARA: { rotulo: "Sem alvará", tom: "chip-vermelho" },
  COM_ALVARA_VIGENTE: { rotulo: "Alvará vigente", tom: "chip-verde" },
  COM_ALVARA_VENCIDO: { rotulo: "Alvará vencido", tom: "chip-ambar" },
  DISPENSADA: { rotulo: "Dispensada", tom: "chip-cinza" },
};

// ---------------------------------------------------------------------------
// Eixo 2 — andamento
// ---------------------------------------------------------------------------

const ANDAMENTO: Record<string, { rotulo: string; tom: TomChip }> = {
  NAO_INICIADA: { rotulo: "Não iniciada", tom: "chip-cinza" },
  EM_ANDAMENTO: { rotulo: "Em andamento", tom: "chip-azul" },
  PARALISADA: { rotulo: "Paralisada", tom: "chip-vermelho" },
  CONCLUIDA: { rotulo: "Concluída", tom: "chip-verde" },
  DEMOLIDA: { rotulo: "Demolida", tom: "chip-cinza" },
  CANCELADA: { rotulo: "Cancelada", tom: "chip-cinza" },
};

// ---------------------------------------------------------------------------
// Eixo 3 — habite-se
// ---------------------------------------------------------------------------

const HABITE_SE: Record<string, { rotulo: string; tom: TomChip }> = {
  NAO_SOLICITADO: { rotulo: "Habite-se não emitido", tom: "chip-cinza" },
  SOLICITADO: { rotulo: "Habite-se solicitado", tom: "chip-ambar" },
  APROVADO: { rotulo: "Habite-se aprovado", tom: "chip-verde" },
  REPROVADO: { rotulo: "Habite-se reprovado", tom: "chip-vermelho" },
};

// ---------------------------------------------------------------------------
// Demais enums
// ---------------------------------------------------------------------------

const ETAPA: Record<string, string> = {
  NAO_INICIADA: "Não iniciada",
  FUNDACAO: "Fundação",
  ESTRUTURA: "Estrutura",
  ALVENARIA: "Alvenaria",
  COBERTURA: "Cobertura",
  INSTALACOES: "Instalações",
  ACABAMENTO: "Acabamento",
  CONCLUIDA: "Concluída",
};

/** Ordem canonica do stepper da aba Acompanhamento. */
export const ORDEM_ETAPAS = [
  "NAO_INICIADA",
  "FUNDACAO",
  "ESTRUTURA",
  "ALVENARIA",
  "COBERTURA",
  "INSTALACOES",
  "ACABAMENTO",
  "CONCLUIDA",
] as const;

const TIPO_FISCALIZACAO: Record<string, { rotulo: string; tom: TomChip }> = {
  ROTINA: { rotulo: "Rotina", tom: "chip-cinza" },
  DENUNCIA: { rotulo: "Denúncia", tom: "chip-cinza" },
  ENTULHO: { rotulo: "Entulho", tom: "chip-ambar" },
  VERIFICACAO_ALVARA: { rotulo: "Verificação de alvará", tom: "chip-cinza" },
  VISTORIA_HABITE_SE: { rotulo: "Vistoria de habite-se", tom: "chip-cinza" },
  REINCIDENCIA: { rotulo: "Reincidência", tom: "chip-cinza" },
};

const RESULTADO_FISCALIZACAO: Record<
  string,
  { rotulo: string; tom: TomChip }
> = {
  REGULAR: { rotulo: "Regular", tom: "chip-verde" },
  IRREGULAR: { rotulo: "Irregular", tom: "chip-vermelho" },
  NAO_LOCALIZADA: { rotulo: "Não localizada", tom: "chip-cinza" },
  SEM_ACESSO: { rotulo: "Sem acesso", tom: "chip-cinza" },
};

const TIPO_AUTO: Record<string, { rotulo: string; tom: TomChip }> = {
  NOTIFICACAO: { rotulo: "Notificação", tom: "chip-ambar" },
  AUTO_INFRACAO: { rotulo: "Auto de infração", tom: "chip-vermelho" },
  EMBARGO: { rotulo: "Embargo", tom: "chip-vermelho" },
  INTERDICAO: { rotulo: "Interdição", tom: "chip-vermelho" },
  MULTA: { rotulo: "Multa", tom: "chip-roxo" },
};

const SITUACAO_AUTO: Record<string, { rotulo: string; tom: TomChip }> = {
  ABERTO: { rotulo: "Aberto", tom: "chip-ambar" },
  CUMPRIDO: { rotulo: "Cumprido", tom: "chip-verde" },
  EM_RECURSO: { rotulo: "Em recurso", tom: "chip-azul" },
  CANCELADO: { rotulo: "Cancelado", tom: "chip-cinza" },
  QUITADO: { rotulo: "Quitado", tom: "chip-verde" },
};

const SITUACAO_REGISTRO_ALVARA: Record<
  string,
  { rotulo: string; tom: TomChip }
> = {
  VIGENTE: { rotulo: "Vigente", tom: "chip-verde" },
  SUBSTITUIDO: { rotulo: "Substituído", tom: "chip-cinza" },
  VENCIDO: { rotulo: "Vencido", tom: "chip-ambar" },
  INDEFERIDO: { rotulo: "Indeferido", tom: "chip-vermelho" },
};

const TIPO_ALVARA: Record<string, string> = {
  CONSTRUCAO: "Construção",
  REFORMA: "Reforma",
  AMPLIACAO: "Ampliação",
  DEMOLICAO: "Demolição",
  REGULARIZACAO: "Regularização",
  MURO_TAPUME: "Muro / tapume",
};

const MOTIVO_ALVARA: Record<string, string> = {
  ORIGINAL: "Alvará inicial",
  REVALIDACAO: "Revalidação",
  PRORROGACAO: "Prorrogação",
  SEGUNDA_VIA: "2ª via",
};

const USO_EDIFICACAO: Record<string, string> = {
  RESIDENCIAL_UNIFAMILIAR: "Residencial unifamiliar",
  RESIDENCIAL_MULTIFAMILIAR: "Residencial multifamiliar",
  COMERCIAL: "Comercial",
  INDUSTRIAL: "Industrial",
  MISTO: "Misto",
  OUTRO: "Outro",
};

const PAPEL_RT: Record<string, string> = {
  PROJETO_ARQUITETONICO: "Projeto arquitetônico",
  PROJETO_ESTRUTURAL: "Projeto estrutural",
  PROJETO_COMPLEMENTAR: "Projeto complementar",
  EXECUCAO: "Execução",
};

const LOCAL_ENTULHO: Record<string, string> = {
  VIA_PUBLICA: "Via pública",
  PASSEIO: "Passeio",
  TERRENO_VIZINHO: "Terreno vizinho",
  CANTEIRO: "Canteiro",
  AREA_PROTEGIDA: "Área protegida",
};

const CONSELHO: Record<string, string> = {
  CREA: "CREA",
  CAU: "CAU",
  CFT: "CFT",
};

// ---------------------------------------------------------------------------
// API publica
// ---------------------------------------------------------------------------

/** Chip pronto para render: rotulo acentuado + classe global de tom. */
export interface Chip {
  rotulo: string;
  tom: TomChip;
}

const VAZIO: Chip = { rotulo: "—", tom: "chip-cinza" };

function chipDe(
  mapa: Record<string, { rotulo: string; tom: TomChip }>,
  valor: string | null | undefined,
): Chip {
  if (!valor) return VAZIO;
  return mapa[valor] ?? { rotulo: rotuloGenerico(valor), tom: "chip-cinza" };
}

/** Fallback para enum novo que ainda nao tem rotulo: EM_ANDAMENTO -> "Em andamento". */
export function rotuloGenerico(valor: string): string {
  const texto = valor.replace(/_/g, " ").toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export const chipSituacaoAlvara = (v?: string | null) =>
  chipDe(SITUACAO_ALVARA, v);
export const chipAndamento = (v?: string | null) => chipDe(ANDAMENTO, v);
export const chipHabiteSe = (v?: string | null) => chipDe(HABITE_SE, v);

export interface OpcaoEnum {
  valor: string;
  rotulo: string;
}

/**
 * Deriva as opcoes de <select> do MESMO mapa que pinta os chips, aceitando
 * rotulos proprios de formulario. Os valores nunca divergem: uma lista que
 * esquecesse um enum faria o formulario de edicao gravar silenciosamente um
 * valor diferente do que a obra tinha.
 */
function opcoesDe(
  mapa: Record<string, { rotulo: string }>,
  rotulos: Record<string, string> = {},
): OpcaoEnum[] {
  return Object.keys(mapa).map((valor) => ({
    valor,
    rotulo: rotulos[valor] ?? mapa[valor].rotulo,
  }));
}

/** Opcoes dos tres eixos de situacao, compartilhadas por criar e editar obra. */
export const OPCOES_SITUACAO_ALVARA = opcoesDe(SITUACAO_ALVARA);
export const OPCOES_ANDAMENTO = opcoesDe(ANDAMENTO);
// No formulario o campo ja se chama "Habite-se"; repetir a palavra em cada
// opcao ("Habite-se nao emitido") so alonga o select.
export const OPCOES_HABITE_SE = opcoesDe(HABITE_SE, {
  NAO_SOLICITADO: "Não emitido",
  SOLICITADO: "Solicitado",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
});
export const chipTipoFiscalizacao = (v?: string | null) =>
  chipDe(TIPO_FISCALIZACAO, v);
export const chipResultadoFiscalizacao = (v?: string | null) =>
  chipDe(RESULTADO_FISCALIZACAO, v);
export const chipTipoAuto = (v?: string | null) => chipDe(TIPO_AUTO, v);
export const chipSituacaoAuto = (v?: string | null) => chipDe(SITUACAO_AUTO, v);
export const chipSituacaoRegistroAlvara = (v?: string | null) =>
  chipDe(SITUACAO_REGISTRO_ALVARA, v);

export const rotuloEtapa = (v?: string | null) =>
  v ? (ETAPA[v] ?? rotuloGenerico(v)) : "—";
export const rotuloTipoAlvara = (v?: string | null) =>
  v ? (TIPO_ALVARA[v] ?? rotuloGenerico(v)) : "—";
export const rotuloMotivoAlvara = (v?: string | null) =>
  v ? (MOTIVO_ALVARA[v] ?? rotuloGenerico(v)) : "—";
export const rotuloUso = (v?: string | null) =>
  v ? (USO_EDIFICACAO[v] ?? rotuloGenerico(v)) : "—";
export const rotuloPapelRt = (v?: string | null) =>
  v ? (PAPEL_RT[v] ?? rotuloGenerico(v)) : "—";
export const rotuloLocalEntulho = (v?: string | null) =>
  v ? (LOCAL_ENTULHO[v] ?? rotuloGenerico(v)) : "—";
export const rotuloConselho = (v?: string | null) =>
  v ? (CONSELHO[v] ?? v) : "—";

/**
 * Chips de SITUACAO exibidos juntos na listagem e no cabecalho. Sao ate 5 e
 * nascem de eixos independentes — por isso aparecem lado a lado em vez de um
 * campo unico: a obra pode estar em andamento, sem alvará E autuada.
 *
 * A ordem e deliberada: regularidade primeiro (é o que decide a fiscalizacao),
 * depois andamento, depois as consequencias.
 */
export function chipsDaObra(obra: {
  situacaoAlvara?: string | null;
  andamento?: string | null;
  habiteSe?: string | null;
  autuada?: boolean;
  embargada?: boolean;
  fiscalizada?: boolean;
}): Chip[] {
  const chips: Chip[] = [];
  if (obra.situacaoAlvara) chips.push(chipSituacaoAlvara(obra.situacaoAlvara));
  if (obra.andamento) chips.push(chipAndamento(obra.andamento));
  if (obra.habiteSe === "APROVADO") chips.push(chipHabiteSe(obra.habiteSe));
  if (obra.embargada) {
    chips.push({ rotulo: "Embargada", tom: "chip-vermelho" });
  }
  if (obra.autuada) chips.push({ rotulo: "Autuada", tom: "chip-vermelho" });
  // "Fiscalizada" so aparece quando nao ha nada mais grave a dizer: senao o
  // chip cinza competiria visualmente com autuacao e embargo.
  if (obra.fiscalizada && !obra.autuada && !obra.embargada) {
    chips.push({ rotulo: "Fiscalizada", tom: "chip-cinza" });
  }
  return chips;
}

/** Cor do pino no mapa, por situacao de alvara (referencia do design). */
export function corPinoMapa(situacaoAlvara?: string | null): string {
  switch (situacaoAlvara) {
    case "SEM_ALVARA":
      return "#dc2626";
    case "COM_ALVARA_VIGENTE":
      return "#15803d";
    case "COM_ALVARA_VENCIDO":
      return "#ca8a04";
    default:
      return "#9ca3af";
  }
}

/** Legenda do mapa, na mesma ordem do design. */
export const LEGENDA_MAPA = [
  { rotulo: "Sem alvará", cor: "#dc2626" },
  { rotulo: "Alvará vigente", cor: "#15803d" },
  { rotulo: "Alvará vencido", cor: "#ca8a04" },
  { rotulo: "Dispensada", cor: "#9ca3af" },
];

/** Aparencia de cada tipo de evento da linha do tempo (referencia do design). */
export function estiloEventoTimeline(tipo: string): {
  icone: string;
  cor: string;
  fundo: string;
} {
  switch (tipo) {
    case "ALVARA":
      return { icone: "◈", cor: "#0f766e", fundo: "#e6f4f2" };
    case "FISCALIZACAO":
      return { icone: "🔎", cor: "#4b5563", fundo: "#eef0f3" };
    case "FISCALIZACAO_IRREGULAR":
      return { icone: "🔎", cor: "#b91c1c", fundo: "#fdeaea" };
    case "AUTO":
      return { icone: "⚑", cor: "#b91c1c", fundo: "#fdeaea" };
    case "EMBARGO":
      // Vermelho mais escuro que o de auto comum: embargo para a obra.
      return { icone: "⛔", cor: "#7f1d1d", fundo: "#f9dada" };
    case "HABITE_SE":
      return { icone: "✓", cor: "#15803d", fundo: "#e7f6ec" };
    default:
      return { icone: "✎", cor: "#4b5563", fundo: "#eef0f3" };
  }
}
