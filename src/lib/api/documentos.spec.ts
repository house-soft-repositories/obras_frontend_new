import { describe, expect, it } from "vitest";
import {
  acoesArquivoPermitidas,
  destinosMover,
  ehPastaRaiz,
  formatarTamanho,
  siglaTipoArquivo,
  trilhaTexto,
  validarNomePasta,
  validarUpload,
  type Pasta,
} from "./documentos";

describe("documentos — regras de UI (E8-04)", () => {
  it("ehPastaRaiz: pasta_pai_id nulo = raiz (RN-DOC-01/03)", () => {
    expect(ehPastaRaiz({ pastaPaiId: null })).toBe(true);
    expect(ehPastaRaiz({ pastaPaiId: "abc" })).toBe(false);
  });

  it("formatarTamanho cobre nulo, bytes, KB e MB", () => {
    expect(formatarTamanho(null)).toBe("—");
    expect(formatarTamanho(512)).toBe("512 B");
    expect(formatarTamanho("2048")).toBe("2.0 KB");
    expect(formatarTamanho(1048576)).toBe("1.0 MB");
    expect(formatarTamanho(-1)).toBe("—");
  });

  it("validarNomePasta exige nome (RN-DOC-03)", () => {
    expect(validarNomePasta("")).toHaveLength(1);
    expect(validarNomePasta("   ")).toHaveLength(1);
    expect(validarNomePasta("Contrato")).toHaveLength(0);
  });

  it("validarUpload exige ao menos 1 arquivo e nome em cada (RN-DOC-05)", () => {
    expect(validarUpload([])).toHaveLength(1);
    expect(
      validarUpload([{ nome: "", nomeOriginal: "a.pdf" }]),
    ).toHaveLength(1);
    expect(
      validarUpload([{ nome: "Doc", nomeOriginal: "a.pdf" }]),
    ).toHaveLength(0);
  });

  it("acoesArquivoPermitidas: CONSULTA so baixa (RN-DOC-13)", () => {
    expect(acoesArquivoPermitidas(false)).toEqual({
      baixar: true,
      editar: false,
      mover: false,
      remover: false,
    });
    expect(acoesArquivoPermitidas(true)).toEqual({
      baixar: true,
      editar: true,
      mover: true,
      remover: true,
    });
  });

  it("destinosMover exclui a pasta atual", () => {
    const pastas = [
      { id: "p1" },
      { id: "p2" },
      { id: "p3" },
    ] as Pasta[];
    expect(destinosMover(pastas, "p2").map((p) => p.id)).toEqual(["p1", "p3"]);
  });

  it("trilhaTexto monta o breadcrumb (RN-DOC-02)", () => {
    expect(
      trilhaTexto([
        { id: "r", nome: "Raiz" },
        { id: "c", nome: "Contrato" },
      ]),
    ).toBe("Raiz > Contrato");
  });
});

describe("siglaTipoArquivo — selo da lista de arquivos", () => {
  it("usa a extensao em caixa alta", () => {
    expect(siglaTipoArquivo("Contrato_Original.pdf")).toBe("PDF");
    expect(siglaTipoArquivo("planilha.CSV")).toBe("CSV");
  });

  it("agrupa variantes conhecidas", () => {
    expect(siglaTipoArquivo("cronograma.xlsx")).toBe("XLS");
    expect(siglaTipoArquivo("oficio.docx")).toBe("DOC");
    expect(siglaTipoArquivo("foto.jpeg")).toBe("IMG");
  });

  it("sem extensao reconhecivel cai em ARQ", () => {
    expect(siglaTipoArquivo("arquivo_sem_extensao")).toBe("ARQ");
    expect(siglaTipoArquivo("termina_com_ponto.")).toBe("ARQ");
    expect(siglaTipoArquivo(null)).toBe("ARQ");
  });

  it("extensao muito longa e truncada para caber no selo", () => {
    expect(siglaTipoArquivo("backup.database")).toBe("DATA");
  });
});
