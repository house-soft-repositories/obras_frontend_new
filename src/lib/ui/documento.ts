/**
 * CPF, CNPJ e a deteccao automatica entre os dois (RN-PRV-02). Espelha a
 * validacao do backend: o formulario rejeita antes de enviar, mas quem decide
 * continua sendo a API — aqui a validacao existe para dar retorno imediato ao
 * fiscal que esta digitando em campo.
 *
 * `cnpj.ts` ja cobre CNPJ com consulta a BrasilAPI; este arquivo adiciona CPF e
 * o despacho por tipo, sem duplicar a logica de CNPJ.
 */

import { cnpjValido, mascararCnpj } from "@/lib/api/cnpj";

export type TipoPessoa = "FISICA" | "JURIDICA";

export function limparCpf(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 11);
}

/** Aplica a mascara 000.000.000-00 progressivamente enquanto digita. */
export function mascararCpf(valor: string): string {
  const d = limparCpf(valor);
  let r = d.slice(0, 3);
  if (d.length > 3) r += "." + d.slice(3, 6);
  if (d.length > 6) r += "." + d.slice(6, 9);
  if (d.length > 9) r += "-" + d.slice(9, 11);
  return r;
}

/** Valida os digitos verificadores (modulo 11); rejeita sequencias repetidas. */
export function cpfValido(valor: string): boolean {
  const d = limparCpf(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (pesos: number[]) => {
    const soma = pesos.reduce((acc, p, i) => acc + p * Number(d[i]), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const dv1 = dv([10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = dv([11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv1 === Number(d[9]) && dv2 === Number(d[10]);
}

/** So digitos, no maximo 14 (o suficiente para CPF ou CNPJ). */
export function limparDocumento(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 14);
}

/**
 * Mascara conforme o tipo declarado. Usada nos campos de formulario, onde o
 * usuario ja escolheu PF ou PJ — o truncamento em 11 digitos no modo PF evita
 * que ele digite um CNPJ inteiro sem perceber o erro.
 */
export function mascararPorTipo(valor: string, tipo: TipoPessoa): string {
  return tipo === "FISICA" ? mascararCpf(valor) : mascararCnpj(valor);
}

/** Valida conforme o tipo declarado; a checagem e cruzada, como no backend. */
export function documentoValidoParaTipo(
  valor: string,
  tipo: TipoPessoa,
): boolean {
  return tipo === "FISICA" ? cpfValido(valor) : cnpjValido(valor);
}

/** Sequencia de digitos iguais: passa no mod 11 mas a Receita nao aceita. */
function sequenciaRepetida(digitos: string): boolean {
  return digitos.length > 1 && /^(\d)\1*$/.test(digitos);
}

/**
 * Diz O QUE esta errado no documento, ou `null` se estiver valido. Existe
 * porque "confira os digitos" e a resposta certa para apenas UM dos motivos de
 * recusa: numero incompleto (o caso do CPF colado de planilha, que perde o zero
 * a esquerda) e sequencia repetida davam a mesma mensagem e mandavam o usuario
 * conferir digitos que estavam corretos.
 */
export function problemaDocumento(
  valor: string,
  tipo: TipoPessoa,
): string | null {
  const digitos = limparDocumento(valor);
  const rotulo = rotuloDocumento(tipo);
  const esperado = tipo === "FISICA" ? 11 : 14;

  if (digitos.length === 0) return `Informe o ${rotulo}.`;
  if (digitos.length < esperado) {
    const faltam = esperado - digitos.length;
    return `${rotulo} incompleto: ${digitos.length} de ${esperado} dígitos (falta${faltam > 1 ? "m" : ""} ${faltam}). Se copiou de planilha, confira o zero à esquerda.`;
  }
  if (digitos.length > esperado) {
    return `${rotulo} deve ter ${esperado} dígitos, e foram informados ${digitos.length}.`;
  }
  if (sequenciaRepetida(digitos)) {
    return `${rotulo} inválido: números com todos os dígitos iguais não são aceitos pela Receita Federal.`;
  }
  if (!documentoValidoParaTipo(digitos, tipo)) {
    return `${rotulo} inválido: os dígitos verificadores não conferem.`;
  }
  return null;
}

/**
 * Mascara por DEDUCAO do tamanho, para exibir valores que ja vieram da API
 * (onde o tipo pode nao estar a mao, como numa listagem). Documento incompleto
 * sai sem mascara em vez de sair errado.
 */
export function mascararDocumento(valor: string): string {
  const d = limparDocumento(valor);
  if (d.length === 11) return mascararCpf(d);
  if (d.length === 14) return mascararCnpj(d);
  return d;
}

/** Rotulo curto do tipo, para o chip do dropdown de busca. */
export function siglaTipoPessoa(tipo: TipoPessoa): string {
  return tipo === "FISICA" ? "PF" : "PJ";
}

/** Rotulo do campo de documento conforme o tipo. */
export function rotuloDocumento(tipo: TipoPessoa): string {
  return tipo === "FISICA" ? "CPF" : "CNPJ";
}

/** Iniciais para o avatar do dropdown ("Marcos Andrade Silva" -> "MA"). */
export function iniciaisNome(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}
