/**
 * Telefone brasileiro com DDD, no mesmo padrao de mascara progressiva de
 * `documento.ts`. O campo e limitado a 11 digitos — o formato (00) 00000-0000
 * do celular; com 10 digitos sai como (00) 0000-0000, que e o fixo.
 *
 * O valor gravado e so de digitos: a mascara e apresentacao, e normalizar na
 * entrada faz os registros antigos (gravados com mascara) voltarem formatados
 * do mesmo jeito ao passarem por `mascararTelefone` na exibicao.
 */

/** So digitos, no maximo 11 (DDD + 9 do celular). */
export function limparTelefone(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 11);
}

/**
 * Aplica (00) 00000-0000 progressivamente enquanto digita. Ate 10 digitos a
 * quebra e 4+4 (fixo); no 11o o bloco vira 5+4 (celular).
 */
export function mascararTelefone(valor: string): string {
  const d = limparTelefone(valor);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  const corte = d.length > 10 ? 7 : 6;
  const prefixo = d.slice(2, corte);
  const sufixo = d.slice(corte);
  const ddd = `(${d.slice(0, 2)}) `;
  return sufixo ? `${ddd}${prefixo}-${sufixo}` : `${ddd}${prefixo}`;
}

/** Numero completo: 10 digitos (fixo) ou 11 (celular). Vazio nao e invalido. */
export function telefoneValido(valor: string): boolean {
  const d = limparTelefone(valor);
  return d.length === 10 || d.length === 11;
}
