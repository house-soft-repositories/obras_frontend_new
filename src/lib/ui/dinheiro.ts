/**
 * Formata um valor canonico ("1234.56", ponto decimal) como "R$ 1.234,56"
 * (pt-BR). Vazio/invalido -> "" (para o input exibir o placeholder).
 */
export function formatarBRLEntrada(canonico: string | null | undefined): string {
  if (!canonico) return "";
  const n = Number(canonico);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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
