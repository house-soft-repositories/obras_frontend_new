/**
 * Contagem de prazo e formatacao de area/data do modulo Obras Privadas.
 * Funcoes puras.
 *
 * As datas sao tratadas por fatiamento de string, nunca por `new Date(iso)` —
 * mesma decisao de `lib/ui/datas.ts`: `new Date("2026-08-11")` e interpretado
 * como UTC e, em fuso negativo, exibe o dia anterior.
 */

const MS_DIA = 86_400_000;

/** Hoje em ISO curto (YYYY-MM-DD), no fuso local. */
export function hojeIso(agora: Date = new Date()): string {
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/** Diferenca em dias entre duas datas ISO curtas (destino − origem). */
export function diasEntre(origem: string, destino: string): number | null {
  const a = Date.parse(`${origem}T00:00:00Z`);
  const b = Date.parse(`${destino}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / MS_DIA);
}

export interface Contagem {
  dias: number | null;
  vencido: boolean;
  rotulo: string;
}

/**
 * Contagem regressiva de um prazo (RN-PRV-11). `encerrado` cobre auto CUMPRIDO
 * ou QUITADO: satisfeita a obrigacao, o prazo perde o efeito e nao deve
 * aparecer em vermelho no meio de uma lista.
 */
export function contarPrazo(
  dataLimite: string | null | undefined,
  encerrado = false,
  hoje: string = hojeIso(),
): Contagem {
  if (!dataLimite) return { dias: null, vencido: false, rotulo: "" };
  const dias = diasEntre(hoje, dataLimite);
  if (dias === null) return { dias: null, vencido: false, rotulo: "" };
  if (encerrado) return { dias, vencido: false, rotulo: "no prazo" };
  if (dias < 0) {
    return {
      dias,
      vencido: true,
      rotulo: `vencido há ${Math.abs(dias)} ${plural(Math.abs(dias), "dia", "dias")}`,
    };
  }
  if (dias === 0) return { dias, vencido: false, rotulo: "vence hoje" };
  return { dias, vencido: false, rotulo: `faltam ${dias} dias` };
}

/** Situacoes de auto em que o prazo ja nao corre. */
export function prazoEncerrado(situacao: string | null | undefined): boolean {
  return situacao === "CUMPRIDO" || situacao === "QUITADO";
}

/** Validade do alvara: "faltam 34 dias" / "vencido há 10 dias". */
export function contarValidadeAlvara(
  dataValidade: string | null | undefined,
  hoje: string = hojeIso(),
): Contagem {
  return contarPrazo(dataValidade, false, hoje);
}

function plural(n: number, singular: string, plural_: string): string {
  return n === 1 ? singular : plural_;
}

/**
 * "Última visita" na listagem. Mais de 90 dias sem visita e o sinal que o
 * fiscal procura, entao a funcao devolve tambem o alerta.
 */
export function resumoUltimaVisita(
  dataIso: string | null | undefined,
  hoje: string = hojeIso(),
): { rotulo: string; dias: number | null; alerta: boolean } {
  if (!dataIso) return { rotulo: "Nunca visitada", dias: null, alerta: true };
  const dias = diasEntre(dataIso, hoje);
  return {
    rotulo: formatarDataCurta(dataIso),
    dias,
    alerta: dias !== null && dias > 90,
  };
}

/** dd/mm/aaaa a partir de ISO curto, sem passar por Date. */
export function formatarDataCurta(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : "—";
}

/** dd/mm/aaaa HH:MM a partir de ISO completo (timeline). */
export function formatarDataHora(iso: string | null | undefined): string {
  if (!iso) return "—";
  const data = formatarDataCurta(iso);
  const hora = iso.slice(11, 16);
  return hora ? `${data} ${hora}` : data;
}

/** Area em m2 no padrao pt-BR: "212,50 m²". */
export function formatarArea(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m²`;
}

/**
 * Excedente entre area executada e aprovada. Retorna null quando nao ha
 * divergencia — a interface so mostra o alerta quando ha o que alertar.
 */
export function excedenteArea(
  aprovada: string | null | undefined,
  executada: string | null | undefined,
): string | null {
  if (!aprovada || !executada) return null;
  const diff = Number(executada) - Number(aprovada);
  if (!Number.isFinite(diff) || diff <= 0) return null;
  return formatarArea(diff);
}

/** Volume de entulho: "6,00 m³". */
export function formatarVolume(
  valor: string | number | null | undefined,
): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m³`;
}

/** Tamanho de arquivo legivel: "1,8 MB". */
export function formatarTamanho(bytes: number | string | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === "") return "—";
  const n = typeof bytes === "number" ? bytes : Number(bytes);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) {
    return `${(n / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} KB`;
  }
  return `${(n / 1024 / 1024).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} MB`;
}
