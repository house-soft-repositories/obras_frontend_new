/**
 * Fetch JSON via /api/proxy para as telas de cadastro, no mesmo padrao das
 * paginas atuais (cookies httpOnly injetados pelo proxy). Erros HTTP viram
 * `ErroHttp` com status + mensagem exibivel (message do Nest quando houver).
 */
import { mensagemErroApi } from "@/lib/ui/cadastro-labels";

export class ErroHttp extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroHttp";
  }
}

export async function proxyJson<T>(
  caminho: string,
  init?: RequestInit,
): Promise<T> {
  const resposta = await fetch(`/api/proxy/${caminho}`, {
    headers: { "content-type": "application/json" },
    cache: "no-store",
    ...init,
  });
  if (!resposta.ok) {
    const corpo: unknown = await resposta.json().catch(() => null);
    throw new ErroHttp(
      resposta.status,
      mensagemErroApi(resposta.status, corpo),
    );
  }
  return (resposta.status === 204 ? undefined : await resposta.json()) as T;
}

/** Mensagem exibivel de qualquer erro (ErroHttp ou falha de rede). */
export function mensagemErro(erro: unknown): string {
  return erro instanceof ErroHttp
    ? erro.message
    : "Falha de comunicação com o servidor.";
}
