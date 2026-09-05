import { NextRequest, NextResponse } from "next/server";
import { montarUrl } from "@/lib/api/client";
import {
  lerExpiracao,
  obterTokenBackend,
  persistirTokenBackend,
} from "@/lib/auth/backend-token";

interface TenancyAtiva {
  id: string;
  name: string;
  slug: string;
  cnpj: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TrocaTenancyResposta {
  accessToken: string;
  tenancy: TenancyAtiva;
}

export async function POST(request: NextRequest) {
  const token = await obterTokenBackend(request);
  if (!token?.accessToken || token.error) {
    return NextResponse.json({ message: "Sem sessão" }, { status: 401 });
  }

  const body = await request.text();
  const resposta = await fetch(montarUrl("/api/auth/switch-tenancy"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token.accessToken}`,
    },
    body,
    cache: "no-store",
  });
  const texto = await resposta.text();

  if (!resposta.ok) {
    return new NextResponse(texto, {
      status: resposta.status,
      headers: {
        "content-type":
          resposta.headers.get("content-type") ?? "application/json",
      },
    });
  }

  const dados = JSON.parse(texto) as TrocaTenancyResposta;
  const response = NextResponse.json(
    { tenancy: dados.tenancy },
    { status: 201 },
  );
  await persistirTokenBackend(response, {
    ...token,
    accessToken: dados.accessToken,
    accessTokenExpiresAt: lerExpiracao(dados.accessToken),
    tenantId: dados.tenancy.id,
    error: undefined,
  });
  return response;
}
