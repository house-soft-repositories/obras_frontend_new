import { describe, expect, it } from "vitest";
import {
  blobSvg,
  mimePorFormato,
  type FormatoGrafico,
} from "./exportar-grafico";

const SVG_TESTE = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

describe("mimePorFormato (RN-REL-16)", () => {
  it("mapeia os formatos do manual para o MIME correto", () => {
    expect(mimePorFormato("PNG")).toBe("image/png");
    expect(mimePorFormato("JPEG")).toBe("image/jpeg");
    expect(mimePorFormato("SVG")).toBe("image/svg+xml");
  });
});

describe("blob a partir de um SVG de teste", () => {
  it("gera blob com os 3 MIMEs (png, jpeg, svg+xml)", () => {
    const formatos: FormatoGrafico[] = ["PNG", "JPEG", "SVG"];
    const mimes = formatos.map(
      (f) => new Blob([SVG_TESTE], { type: mimePorFormato(f) }).type,
    );
    expect(mimes).toEqual(["image/png", "image/jpeg", "image/svg+xml"]);
  });

  it("blobSvg produz image/svg+xml com conteudo", () => {
    const b = blobSvg(SVG_TESTE);
    expect(b.type).toBe("image/svg+xml");
    expect(b.size).toBeGreaterThan(0);
  });
});
