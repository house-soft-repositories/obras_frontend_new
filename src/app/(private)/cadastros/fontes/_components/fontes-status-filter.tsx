"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function FontesStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get("ativo") ?? "";

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue) {
      params.set("ativo", nextValue);
    } else {
      params.delete("ativo");
    }
    const query = params.toString();
    router.push(query ? `/cadastros/fontes?${query}` : "/cadastros/fontes");
  }

  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-foreground sm:max-w-56">
      Status
      <select
        aria-label="Filtrar fontes por status"
        className="h-11 rounded-app border border-input bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
      >
        <option value="">Todas</option>
        <option value="true">Ativas</option>
        <option value="false">Inativas</option>
      </select>
    </label>
  );
}
