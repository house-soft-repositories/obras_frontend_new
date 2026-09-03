"use client";

import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Body, Caption, Eyebrow, Heading } from "@/components/ui/typography";

const fieldClassName =
  "!h-[50px] !rounded-lg !border-login-line !bg-white !py-0 !pr-3.5 !pl-11 text-login-ink transition-[border-color,box-shadow] placeholder:!text-login-placeholder focus:!border-login-accent focus-visible:!ring-3 focus-visible:!ring-login-accent/20 focus-visible:!ring-offset-0";

function FormularioLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resultado = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: senha,
        redirect: false,
      });
      if (!resultado || resultado.error) {
        setErro("Não foi possível entrar com essas credenciais.");
        return;
      }
      router.push("/home");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main
      data-slot="login-page"
      className="grid min-h-screen grid-cols-1 bg-login-canvas md:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]"
    >
      <section
        data-slot="login-brand-panel"
        aria-label="Obras Gest"
        className="relative flex min-h-[250px] flex-col justify-between overflow-hidden bg-login-ink p-7 text-white before:absolute before:right-[-255px] before:bottom-[-305px] before:size-[680px] before:rounded-full before:border before:border-login-accent/30 before:content-[''] after:absolute after:right-[-118px] after:bottom-[-175px] after:size-[420px] after:rounded-full after:border after:border-white/15 after:content-[''] md:min-h-full md:p-[clamp(28px,5vw,72px)]"
      >
        <div className="relative z-10 flex items-center gap-3 font-display text-lg leading-none font-semibold">
          <span className="grid size-[42px] place-items-center rounded-lg bg-login-accent text-[19px] font-bold text-login-ink">
            OG
          </span>
          <span>
            Obras Gest
            <small className="mt-1 block font-body text-[11px] leading-[1.2] font-medium tracking-[0.04em] text-white/70 uppercase">
              Gestão inteligente de obras
            </small>
          </span>
        </div>
        <div className="relative z-10 my-10 max-w-[540px] md:my-16">
          <Eyebrow className="mb-3.5 font-body text-xs leading-4 font-bold tracking-[0.12em] text-login-accent">
            Plataforma de gestão
          </Eyebrow>
          <Heading
            as="h1"
            className="!m-0 max-w-[600px] !text-[38px] !leading-[1.03] !font-bold tracking-[-0.045em] !text-surface md:!text-[clamp(38px,5vw,68px)]"
          >
            Decisões melhores para cada obra.
          </Heading>
          <Body className="mt-[22px] max-w-[430px] text-base leading-[1.65] text-white/80 max-md:hidden">
            Acompanhe obras públicas e privadas, fiscalização, contratos e
            execução em um só lugar.
          </Body>
        </div>
        <div className="relative z-10 flex items-center gap-2.5 text-xs text-white/70 max-md:hidden">
          <LockKeyhole
            aria-hidden="true"
            className="size-4 text-login-accent"
          />
          Ambiente seguro · acesso institucional
        </div>
      </section>

      <section
        data-slot="login-form-panel"
        aria-label="Acesso à plataforma"
        className="grid place-items-start bg-white px-6 pt-[42px] pb-14 md:place-items-center md:p-8"
      >
        <div className="w-full max-w-[408px]">
          <Heading
            as="h2"
            className="!m-0 !text-[32px] !leading-[1.15] !font-bold tracking-[-0.035em] text-login-ink"
          >
            Boas-vindas
          </Heading>
          <Body className="mt-2.5 mb-8 leading-[1.55] text-login-muted">
            Entre com suas credenciais para acessar a plataforma.
          </Body>

          <form
            data-slot="login-form"
            className="grid gap-[19px]"
            onSubmit={aoEnviar}
          >
            <label className="grid gap-2 text-[13px] font-semibold text-login-ink">
              E-mail
              <span className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-login-muted"
                />
                <Input
                  className={fieldClassName}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@prefeitura.gov.br"
                  autoComplete="email"
                />
              </span>
            </label>

            <label className="grid gap-2 text-[13px] font-semibold text-login-ink">
              Senha
              <span className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-login-muted"
                />
                <Input
                  className={`${fieldClassName} !pr-12`}
                  type={mostrarSenha ? "text" : "password"}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-slot="password-visibility-toggle"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setMostrarSenha((atual) => !atual)}
                  className="absolute top-1/2 right-2 !size-9 !min-h-0 -translate-y-1/2 rounded-[7px] !text-login-muted hover:!bg-surface-subtle"
                >
                  {mostrarSenha ? (
                    <EyeOff className="!size-[18px]" aria-hidden="true" />
                  ) : (
                    <Eye className="!size-[18px]" aria-hidden="true" />
                  )}
                </Button>
              </span>
            </label>

            <div className="-mt-[3px] flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[13px] text-login-muted">
                <Checkbox className="size-4" />
                Manter conectado
              </label>
              <a
                href="#recuperar-senha"
                className="!text-login-ink text-[13px] font-semibold underline decoration-login-accent decoration-2 underline-offset-3"
              >
                Esqueci minha senha
              </a>
            </div>

            {erro ? (
              <p
                className="-mt-0.5 text-[13px] leading-5 text-login-danger"
                role="alert"
              >
                {erro}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              disabled={enviando}
              className="mt-[5px] !h-[52px] !w-full !rounded-lg !border-login-accent !bg-login-accent text-sm !font-bold !text-login-ink shadow-login-button transition-[background,transform] hover:!bg-login-accent-hover hover:enabled:-translate-y-px focus-visible:!ring-login-accent"
            >
              {enviando ? "Entrando…" : "Entrar na plataforma"}
            </Button>
          </form>

          <Caption className="mt-7 border-t border-login-line pt-6 leading-[1.55] text-login-muted">
            Problemas para acessar? Entre em contato com o{" "}
            <a
              href="#suporte"
              className="!text-login-ink font-semibold underline decoration-login-accent decoration-2 underline-offset-3"
            >
              administrador da sua organização
            </a>
            .
          </Caption>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-login-canvas" />}>
      <FormularioLogin />
    </Suspense>
  );
}
