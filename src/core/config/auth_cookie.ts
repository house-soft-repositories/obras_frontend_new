export interface CookieSessao {
  nome: string;
  seguro: boolean;
}

export function resolverCookieSessao(
  urlAuth: string | undefined,
  protocoloEncaminhado: string | null | undefined,
): CookieSessao {
  if (urlAuth) {
    try {
      const seguro = new URL(urlAuth).protocol === "https:";
      return { nome: `${seguro ? "__Secure-" : ""}authjs.session-token`, seguro };
    } catch {
      return { nome: "authjs.session-token", seguro: false };
    }
  }
  const protocolo = protocoloEncaminhado ?? "https";
  const normalizado = protocolo.endsWith(":") ? protocolo : `${protocolo}:`;
  const seguro = normalizado === "https:";
  return { nome: `${seguro ? "__Secure-" : ""}authjs.session-token`, seguro };
}
