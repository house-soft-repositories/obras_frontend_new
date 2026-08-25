/**
 * Consulta de CEP no ViaCEP (https://viacep.com.br/ws/:cep/json/) — API publica
 * brasileira, gratuita, HTTPS, sem chave e com CORS. Mesmo padrao da consulta
 * de CNPJ na BrasilAPI (`cnpj.ts`): a chamada de rede vive aqui, separada da
 * logica pura, e o preenchimento so completa campos vazios.
 *
 * O ViaCEP responde 200 com `{ erro: true }` para CEP inexistente, em vez de
 * 404 — por isso a checagem nao pode olhar so o status.
 */

export function limparCep(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 8);
}

/** Aplica a mascara 00000-000 progressivamente enquanto digita. */
export function mascararCep(valor: string): string {
  const d = limparCep(valor);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** CEP completo (8 digitos). Nao ha digito verificador em CEP. */
export function cepCompleto(valor: string): boolean {
  return limparCep(valor).length === 8;
}

export interface EnderecoCep {
  logradouro: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
}

interface RespostaViaCep {
  erro?: boolean | string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

/** Traduz a resposta do ViaCEP para o formato do formulario. Funcao pura. */
export function mapearRespostaViaCep(
  bruto: RespostaViaCep,
): EnderecoCep | null {
  // O ViaCEP sinaliza CEP inexistente com `erro` no corpo, com status 200.
  if (bruto.erro === true || bruto.erro === "true") return null;
  const vazio = (v?: string) => (v && v.trim() ? v.trim() : null);
  return {
    logradouro: vazio(bruto.logradouro),
    bairro: vazio(bruto.bairro),
    cidade: vazio(bruto.localidade),
    uf: vazio(bruto.uf)?.toUpperCase() ?? null,
  };
}

/**
 * Consulta o CEP. Retorna null quando o CEP nao existe ou a consulta falha —
 * a falha e silenciosa de proposito: o preenchimento automatico e uma
 * conveniencia, e o fiscal em campo pode digitar o endereco a mao.
 */
export async function consultarCep(cep: string): Promise<EnderecoCep | null> {
  const digitos = limparCep(cep);
  if (digitos.length !== 8) return null;
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
    if (!resposta.ok) return null;
    return mapearRespostaViaCep((await resposta.json()) as RespostaViaCep);
  } catch {
    return null;
  }
}
