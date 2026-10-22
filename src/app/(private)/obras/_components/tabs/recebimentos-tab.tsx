"use client";

import { RecebimentosSection } from "../recebimentos-section";

export function RecebimentosTab({ obraId }: { obraId: string }) {
  return <RecebimentosSection obraId={obraId} />;
}
