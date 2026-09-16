import listObrasPrivadasAction from "@/core/actions/obras-privadas/list_obras_privadas_action";
import { MapaClient } from "./_components/mapa-client";

export default async function MapaPage() {
  const obras = await listObrasPrivadasAction({
    page: 1,
    take: 100,
    order: "DESC",
  });

  return <MapaClient obras={obras.data} />;
}
