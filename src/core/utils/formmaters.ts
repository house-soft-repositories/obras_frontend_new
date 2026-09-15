export default abstract class Formmaters {
  static moneyFromCents(valueInCents: string | number | null | undefined): string {
    return (Number(valueInCents || 0) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
}
