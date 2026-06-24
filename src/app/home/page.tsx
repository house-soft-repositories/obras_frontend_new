import Link from "next/link";
import styles from "@/components/layout/app-shell.module.css";

export const dynamic = "force-dynamic";

const ATALHOS = [
  { href: "/obras", icone: "📁", titulo: "Obras", desc: "Acompanhe e gerencie todas as obras." },
  { href: "/obras/nova", icone: "➕", titulo: "Nova obra", desc: "Cadastrar uma nova obra ou acao." },
  { href: "/dashboard", icone: "📊", titulo: "Dashboard", desc: "Indicadores fisico-financeiros." },
  { href: "/relatorios/obras", icone: "📄", titulo: "Relatorios", desc: "Gere relatorios e exportacoes." },
  { href: "/cadastros/orgaos", icone: "🏛️", titulo: "Orgaos", desc: "Secretarias e orgaos executores." },
  { href: "/cadastros/localidades", icone: "📍", titulo: "Localidades", desc: "Regioes e localidades atendidas." },
  { href: "/cadastros/usuarios", icone: "👥", titulo: "Usuarios", desc: "Perfis e permissoes de acesso." },
  { href: "/cadastros/fontes", icone: "💰", titulo: "Fontes", desc: "Fontes de recurso e convenios." },
  { href: "/cadastros/empresas-contratadas", icone: "🏢", titulo: "Empresas", desc: "Empresas contratadas." },
  { href: "/admin/tenants", icone: "🗂️", titulo: "Tenants", desc: "Orgaos/clientes do sistema." },
];

export default function HomePage() {
  return (
    <main style={{ padding: "1.5rem 1.75rem" }}>
      <h1 className={styles.cardTitulo} style={{ fontSize: "1.5rem" }}>
        Bem-vindo
      </h1>
      <p className="page-sub">
        Selecione uma funcionalidade no menu lateral ou em um dos atalhos abaixo.
      </p>

      <div className={styles.cards}>
        {ATALHOS.map((a) => (
          <Link key={a.href} href={a.href} className={styles.card}>
            <span className={styles.cardIcone} aria-hidden>
              {a.icone}
            </span>
            <p className={styles.cardTitulo}>{a.titulo}</p>
            <p className={styles.cardDesc}>{a.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
