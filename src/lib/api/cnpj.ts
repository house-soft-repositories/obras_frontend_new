/**
 * Consulta de CNPJ na BrasilAPI (https://brasilapi.com.br/api/cnpj/v1/:cnpj)
 * — API publica brasileira, gratuita, HTTPS, sem chave e com CORS, servindo
 * dados da Receita Federal. 200 = encontrado, 404 = CNPJ nao cadastrado,
 * 400 = numero malformado.
 *
 * Logica pura (mascara, digitos verificadores, mapeamento) separada da
 * chamada de rede para ser testavel em vitest node.
 */

export function limparCnpj(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 14);
}

/** Aplica a mascara 00.000.000/0000-00 progressivamente enquanto digita. */
export function mascararCnpj(valor: string): string {
  const d = limparCnpj(valor);
  let r = d.slice(0, 2);
  if (d.length > 2) r += "." + d.slice(2, 5);
  if (d.length > 5) r += "." + d.slice(5, 8);
  if (d.length > 8) r += "/" + d.slice(8, 12);
  if (d.length > 12) r += "-" + d.slice(12, 14);
  return r;
}

/** Valida os digitos verificadores (modulo 11); rejeita sequencias repetidas. */
export function cnpjValido(valor: string): boolean {
  const d = limparCnpj(valor);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const dv = (pesos: number[]) => {
    const soma = pesos.reduce((acc, p, i) => acc + p * Number(d[i]), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const dv1 = dv([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = dv([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv1 === Number(d[12]) && dv2 === Number(d[13]);
}

export interface DadosCnpj {
  razaoSocial: string;
  nomeFantasia: string | null;
  email: string | null;
  telefone: string | null;
  situacaoCadastral: string | null;
  /** Primeiro socio do quadro societario (qsa) e sua qualificacao. */
  responsavel: string | null;
  cargoResponsavel: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
}

/** Mapeia a resposta crua da BrasilAPI para os campos do formulario. */
export function mapearRespostaBrasilApi(
  json: Record<string, unknown>,
): DadosCnpj {
  const texto = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;
  const socio = Array.isArray(json.qsa)
    ? (json.qsa[0] as Record<string, unknown> | undefined)
    : undefined;
  const logradouro = [
    texto(json.descricao_tipo_de_logradouro),
    texto(json.logradouro),
  ]
    .filter(Boolean)
    .join(" ");
  return {
    razaoSocial: texto(json.razao_social) ?? "",
    nomeFantasia: texto(json.nome_fantasia),
    email: texto(json.email)?.toLowerCase() ?? null,
    telefone: texto(json.ddd_telefone_1),
    situacaoCadastral: texto(json.descricao_situacao_cadastral),
    responsavel: texto(socio?.nome_socio),
    cargoResponsavel: texto(socio?.qualificacao_socio),
    cep: texto(json.cep),
    logradouro: logradouro || null,
    numero: texto(json.numero),
    complemento: texto(json.complemento),
    bairro: texto(json.bairro),
    cidade: texto(json.municipio),
    uf: texto(json.uf),
  };
}

export type ResultadoConsultaCnpj =
  | { status: "ok"; dados: DadosCnpj }
  | { status: "nao-encontrado" }
  | { status: "indisponivel" };

const URL_BRASILAPI = "https://brasilapi.com.br/api/cnpj/v1";

export async function consultarCnpj(
  cnpj: string,
  fetchFn: typeof fetch = fetch,
): Promise<ResultadoConsultaCnpj> {
  try {
    const r = await fetchFn(`${URL_BRASILAPI}/${limparCnpj(cnpj)}`);
    if (r.status === 404 || r.status === 400) {
      return { status: "nao-encontrado" };
    }
    if (!r.ok) return { status: "indisponivel" };
    return {
      status: "ok",
      dados: mapearRespostaBrasilApi(
        (await r.json()) as Record<string, unknown>,
      ),
    };
  } catch {
    return { status: "indisponivel" };
  }
}
