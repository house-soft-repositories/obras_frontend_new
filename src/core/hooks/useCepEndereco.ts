import { useEffect, useRef, useState } from "react";
import type { UseFormClearErrors, UseFormSetValue } from "react-hook-form";
import lookupCepAction from "@/core/actions/localidades/lookup_cep_action";
import type { CriarObraPrivadaFormularioInput } from "@/core/schemas/obras-privadas/create_obra_privada_schema";

type Localidade = { id: string; nome: string };

type Options = {
  cep: string;
  localidades: Localidade[];
  setValue: UseFormSetValue<CriarObraPrivadaFormularioInput>;
  clearErrors: UseFormClearErrors<CriarObraPrivadaFormularioInput>;
};

export function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function localidadeNome(value: string) {
  return value.split(" - ")[0].trim().toLocaleLowerCase();
}

export function useCepEndereco({
  cep,
  localidades,
  setValue,
  clearErrors,
}: Options) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const requestId = useRef(0);

  useEffect(() => {
    const normalizedCep = normalizeCep(cep);
    if (normalizedCep.length !== 8) {
      const timer = window.setTimeout(() => {
        setStatus("idle");
        setMessage("");
      });
      return () => window.clearTimeout(timer);
    }

    const currentRequest = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      setMessage("Consultando CEP...");
      const result = await lookupCepAction({ cep: normalizedCep });
      if (currentRequest !== requestId.current) return;

      if (!result.success) {
        setStatus("error");
        setMessage(result.error);
        return;
      }

      const data = result.data;
      setValue("cep", normalizeCep(data.cep), { shouldDirty: true });
      setValue("logradouro", data.logradouro, { shouldDirty: true });
      setValue("complemento", data.complemento, { shouldDirty: true });
      setValue("bairro", data.bairro, { shouldDirty: true });
      setValue("uf", data.uf, { shouldDirty: true });
      setValue("latitude", data.latitude, { shouldDirty: true });
      setValue("longitude", data.longitude, { shouldDirty: true });
      setValue("geoOrigem", data.geoOrigem, { shouldDirty: true });

      const localidade = localidades.find(
        (item) => localidadeNome(item.nome) === localidadeNome(data.cidade),
      );
      if (localidade)
        setValue("localidadeId", localidade.id, { shouldDirty: true });
      clearErrors(["cep", "logradouro", "uf"]);
      setStatus("success");
      setMessage(
        data.latitude && data.longitude
          ? "Endereço e coordenadas preenchidos automaticamente."
          : "Endereço preenchido. Informe as coordenadas manualmente.",
      );
    }, 350);

    return () => window.clearTimeout(timer);
  }, [cep, localidades, setValue, clearErrors]);

  return { status, message };
}
