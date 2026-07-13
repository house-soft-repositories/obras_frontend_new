/**
 * Rotulos e estilos de UI compartilhados (status de obra, semaforo, saudacao,
 * iniciais e perfis) em funcoes PURAS testaveis em vitest node.
 *
 * Textos exibidos ao usuario em PT-BR acentuado (diretriz do design); as cores
 * e classes referenciam os tokens globais de globals.css (chips `chip-*` e
 * variaveis `--sem-*`).
 */

/** Rotulo do status da obra exibido em chips e listagens. */
export function statusObraLabel(status: string): string {
  switch (status) {
    case "EM_ABERTO":
      return "Em aberto";
    case "EM_DESENVOLVIMENTO":
      return "Em execução";
    case "PARALISADO":
      return "Paralisada";
    case "CONCLUIDO":
      return "Concluída";
    case "CANCELADO":
      return "Cancelada";
    default:
      return status;
  }
}

/** Classe global de chip (globals.css) correspondente ao status da obra. */
export function statusObraChipClasse(status: string): string {
  switch (status) {
    case "EM_DESENVOLVIMENTO":
      return "chip-azul";
    case "CONCLUIDO":
      return "chip-verde";
    case "PARALISADO":
      return "chip-vermelho";
    default:
      // EM_ABERTO, CANCELADO e valores desconhecidos
      return "chip-cinza";
  }
}

export interface SemaforoInfo {
  rotulo: string;
  cor: string;
}

/**
 * Rotulo e cor do semaforo de desempenho. A cor e uma variavel CSS de
 * globals.css (`var(--sem-*)`), pronta para uso em style/background.
 */
export function semaforoInfo(
  semaforo: "VERDE" | "LARANJA" | "VERMELHO" | null | undefined,
): SemaforoInfo {
  switch (semaforo) {
    case "VERDE":
      return { rotulo: "No prazo", cor: "var(--sem-verde)" };
    case "LARANJA":
      return { rotulo: "Dentro da meta", cor: "var(--sem-laranja)" };
    case "VERMELHO":
      return { rotulo: "Atrasado", cor: "var(--sem-vermelho)" };
    default:
      return { rotulo: "Sem status", cor: "var(--sem-cinza)" };
  }
}

/** Saudacao conforme a hora local (0-23): manha 5-11, tarde 12-17, senao noite. */
export function saudacaoPorHora(hora: number): string {
  if (hora >= 5 && hora <= 11) return "Bom dia";
  if (hora >= 12 && hora <= 17) return "Boa tarde";
  return "Boa noite";
}

/** Iniciais (ate 2) do nome, para avatares: "Mariana Rocha" -> "MR". */
export function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palavra) => palavra[0].toUpperCase())
    .join("");
}

/** Rotulo do perfil de acesso (RBAC) exibido na UI. */
export function perfilLabel(perfil: string): string {
  switch (perfil) {
    case "SUPER_ADMIN":
      return "Super admin";
    case "ADMIN_TENANT":
      return "Administrador";
    case "GESTOR_ORGAO":
      return "Gestor";
    case "RESPONSAVEL_OBRA":
      return "Responsável por obra";
    case "CONSULTA":
      return "Consulta";
    default:
      return perfil;
  }
}

/**
 * Rotulo generico de enum para exibicao: troca "_" por espaco, preservando o
 * texto/siglas (ex.: "INVESTIMENTO_PRIVADO" -> "INVESTIMENTO PRIVADO",
 * "SEM_OGU" -> "SEM OGU"). Nao aplica title-case para nao quebrar siglas.
 */
export function rotuloEnum(valor: string): string {
  return valor.replaceAll("_", " ");
}
