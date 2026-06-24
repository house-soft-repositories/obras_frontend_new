/**
 * Exportacao de graficos do dashboard (RN-REL-16, manual 7.1) em PNG/JPEG/SVG,
 * executada no front a partir do SVG renderizado pela lib de graficos. As partes
 * puras (MIME, serializacao do SVG, montagem do blob SVG) sao testaveis; a
 * rasterizacao PNG/JPEG usa canvas (browser).
 */
export type FormatoGrafico = "PNG" | "JPEG" | "SVG";

const MIME: Record<FormatoGrafico, string> = {
  PNG: "image/png",
  JPEG: "image/jpeg",
  SVG: "image/svg+xml",
};

export function mimePorFormato(formato: FormatoGrafico): string {
  return MIME[formato];
}

/** Serializa um <svg> em string XML com o namespace garantido. */
export function serializarSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  return new XMLSerializer().serializeToString(clone);
}

/** Blob SVG a partir da string (puro — usado direto na exportacao SVG). */
export function blobSvg(svgString: string): Blob {
  return new Blob([svgString], { type: MIME.SVG });
}

/** Dispara o download de um blob no browser. */
export function baixarBlob(blob: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

/** Rasteriza o SVG para PNG/JPEG via canvas e devolve o blob. */
async function rasterizar(
  svgString: string,
  formato: "PNG" | "JPEG",
): Promise<Blob> {
  const svgBlob = blobSvg(svgString);
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("falha ao carregar SVG"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.width || 800;
    canvas.height = img.height || 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d indisponivel");
    if (formato === "JPEG") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob nulo"))),
        MIME[formato],
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Exporta o <svg> de um grafico no formato pedido e dispara o download. */
export async function exportarGrafico(
  svg: SVGSVGElement,
  formato: FormatoGrafico,
  nomeBase = "grafico",
): Promise<void> {
  const svgString = serializarSvg(svg);
  const blob =
    formato === "SVG" ? blobSvg(svgString) : await rasterizar(svgString, formato);
  baixarBlob(blob, `${nomeBase}.${formato.toLowerCase()}`);
}
