/**
 * Formatacao monetaria do sistema (fonte unica). Padrao pt-BR:
 * "R$ 1.234.567,89" — simbolo "R$", espaco normal, "." separando milhar e ","
 * com exatamente 2 casas de centavos. Todas as funcoes daqui sao PURAS.
 *
 * A API trafega o valor canonico com ponto decimal ("1234.56"); a formatacao e
 * so de apresentacao.
 */

const FORMATADOR_NUMERO = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const FORMATADOR_COMPACTO = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Converte a entrada em numero finito; devolve null quando nao ha valor. */
function paraNumero(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === "string" && valor.trim() === "") return null;
  const n = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(n) ? n : null;
}

/**
 * Formata um valor monetario como "R$ 1.234,56". Negativos saem com o sinal
 * antes do simbolo ("-R$ 1.000,00"). Nulo, vazio ou nao numerico devolve
 * `vazio` (padrao "—").
 */
export function formatarMoeda(
  valor: string | number | null | undefined,
  { vazio = "—" }: { vazio?: string } = {},
): string {
  const n = paraNumero(valor);
  if (n === null) return vazio;
  const sinal = n < 0 ? "-" : "";
  return `${sinal}R$ ${FORMATADOR_NUMERO.format(Math.abs(n))}`;
}

/**
 * Variante compacta para eixos de grafico: "R$ 1,5 mi", "R$ 450 mil".
 * Nulo/invalido devolve `vazio` (padrao "—").
 */
export function formatarMoedaCompacta(
  valor: string | number | null | undefined,
  { vazio = "—" }: { vazio?: string } = {},
): string {
  const n = paraNumero(valor);
  if (n === null) return vazio;
  const sinal = n < 0 ? "-" : "";
  // O ICU separa o numero do sufixo ("mi", "mil") com espaco nao separavel;
  // normalizado para espaco comum para o texto nao variar entre runtimes.
  const compacto = FORMATADOR_COMPACTO.format(Math.abs(n)).replace(
    /\u00a0/g,
    " ",
  );
  return `${sinal}R$ ${compacto}`;
}

/**
 * Formata um valor canonico ("1234.56", ponto decimal) como "R$ 1.234,56"
 * (pt-BR). Vazio/invalido -> "" (para o input exibir o placeholder).
 */
export function formatarBRLEntrada(canonico: string | null | undefined): string {
  return formatarMoeda(canonico, { vazio: "" });
}

/**
 * Extrai os digitos (centavos) de uma entrada e devolve o valor canonico
 * "1234.56" (ponto decimal, 2 casas). Sem digitos -> "".
 */
export function digitosParaCanonico(entrada: string): string {
  const digitos = entrada.replace(/\D/g, "");
  if (!digitos) return "";
  return (Number(digitos) / 100).toFixed(2);
}
