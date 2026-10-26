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
      return status.replaceAll("_", " ");
  }
}

export type StatusObraChipVariant =
  | "azul"
  | "verde"
  | "vermelho"
  | "cinza"
  | "ambar"
  | "roxo";

export function statusObraChipVariant(status: string): StatusObraChipVariant {
  switch (status) {
    case "EM_DESENVOLVIMENTO":
      return "azul";
    case "CONCLUIDO":
      return "verde";
    case "PARALISADO":
    case "CANCELADO":
      return "vermelho";
    case "EM_ABERTO":
      return "ambar";
    default:
      return "cinza";
  }
}
