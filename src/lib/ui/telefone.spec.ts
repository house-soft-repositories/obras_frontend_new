import { describe, expect, it } from "vitest";
import { limparTelefone, mascararTelefone, telefoneValido } from "./telefone";

describe("limparTelefone", () => {
  it("mantem so digitos", () => {
    expect(limparTelefone("(11) 98765-4321")).toBe("11987654321");
  });

  it("limita a 11 digitos", () => {
    expect(limparTelefone("119876543219999")).toBe("11987654321");
  });
});

describe("mascararTelefone", () => {
  it("formata celular em (00) 00000-0000", () => {
    expect(mascararTelefone("11987654321")).toBe("(11) 98765-4321");
  });

  it("formata fixo de 10 digitos em (00) 0000-0000", () => {
    expect(mascararTelefone("1132654321")).toBe("(11) 3265-4321");
  });

  it("mascara progressivamente enquanto digita", () => {
    expect(mascararTelefone("")).toBe("");
    expect(mascararTelefone("1")).toBe("(1");
    expect(mascararTelefone("11")).toBe("(11");
    expect(mascararTelefone("1198")).toBe("(11) 98");
    expect(mascararTelefone("119876")).toBe("(11) 9876");
    expect(mascararTelefone("1198765")).toBe("(11) 9876-5");
  });

  it("descarta o excedente alem do 11o digito", () => {
    expect(mascararTelefone("11987654321999")).toBe("(11) 98765-4321");
  });

  it("reformata valor que ja vem mascarado", () => {
    expect(mascararTelefone("(11) 98765-4321")).toBe("(11) 98765-4321");
  });
});

describe("telefoneValido", () => {
  it("aceita fixo (10) e celular (11)", () => {
    expect(telefoneValido("(11) 3265-4321")).toBe(true);
    expect(telefoneValido("(11) 98765-4321")).toBe(true);
  });

  it("rejeita numero incompleto", () => {
    expect(telefoneValido("(11) 9876")).toBe(false);
    expect(telefoneValido("")).toBe(false);
  });
});
