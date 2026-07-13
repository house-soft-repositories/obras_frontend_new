"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function FormularioLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          senha,
          tenantSlug: tenantSlug || undefined,
        }),
      });
      if (!r.ok) {
        setErro("Credenciais inválidas");
        return;
      }
      router.push("/home");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  const rotulo: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--cor-texto)",
    marginBottom: "0.4rem",
  };
  const campo: React.CSSProperties = {
    width: "100%",
    border: "1px solid var(--cor-borda-forte)",
    borderRadius: "var(--raio-campo)",
    padding: "0.7rem 0.75rem",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  };

  return (
    <div style={{ width: "100%", maxWidth: 380 }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 13,
            background: "var(--cor-acento)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 20,
            color: "#fff",
            marginBottom: 14,
            boxShadow: "0 6px 16px rgba(37,99,235,.32)",
          }}
        >
          OP
        </div>
        <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>Obras Públicas</div>
        <div style={{ fontSize: "0.9rem", color: "var(--cor-texto-fraco)", marginTop: 4 }}>
          Gestão e acompanhamento de obras
        </div>
      </div>

      <form
        onSubmit={aoEnviar}
        style={{
          background: "var(--cor-superficie)",
          border: "1px solid var(--cor-borda)",
          borderRadius: 14,
          padding: "1.5rem",
          boxShadow: "0 8px 24px rgba(31,41,51,.06)",
        }}
      >
        <label style={rotulo}>Tenant (órgão)</label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid var(--cor-borda-forte)",
            borderRadius: "var(--raio-campo)",
            overflow: "hidden",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              padding: "0.7rem 0.6rem",
              background: "var(--cor-fundo)",
              color: "var(--cor-texto-fraco)",
              fontSize: "0.85rem",
              borderRight: "1px solid var(--cor-borda)",
              whiteSpace: "nowrap",
            }}
          >
            obras.gov.br/
          </span>
          <input
            type="text"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            placeholder="prefeitura-demo"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              padding: "0.7rem 0.75rem",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>

        <label style={rotulo}>E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu.nome@orgao.gov.br"
          style={campo}
        />

        <label style={rotulo}>Senha</label>
        <input
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
          style={campo}
        />

        {erro ? (
          <p style={{ color: "var(--sem-vermelho)", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
            {erro}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={enviando}
          className="btn-primario"
          style={{ width: "100%", fontSize: "0.95rem" }}
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        <div
          style={{
            textAlign: "center",
            marginTop: "1rem",
            fontSize: "0.8rem",
            color: "var(--cor-texto-fraco)",
            lineHeight: 1.5,
          }}
        >
          Acesso institucional. Use as credenciais fornecidas pelo administrador
          do seu órgão.
        </div>
      </form>

      <div
        style={{
          textAlign: "center",
          marginTop: "1.1rem",
          fontSize: "0.75rem",
          color: "var(--cor-texto-fraco)",
        }}
      >
        🔒 Ambiente seguro · Plataforma GovTech
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
        background: "var(--cor-fundo)",
      }}
    >
      <Suspense fallback={<p>Carregando...</p>}>
        <FormularioLogin />
      </Suspense>
    </main>
  );
}
