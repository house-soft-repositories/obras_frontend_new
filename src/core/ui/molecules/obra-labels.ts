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

export function statusObraChipClasse(status: string): string {
  switch (status) {
    case "EM_DESENVOLVIMENTO":
      return "chip-azul";
    case "CONCLUIDO":
      return "chip-verde";
    case "PARALISADO":
      return "chip-vermelho";
    default:
      return "chip-cinza";
  }
}

export interface SemaforoInfo {
  rotulo: string;
  cor: string;
}

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

export function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palavra) => palavra[0].toUpperCase())
    .join("");
}

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

export function rotuloEnum(valor: string): string {
  return valor.replaceAll("_", " ");
}
