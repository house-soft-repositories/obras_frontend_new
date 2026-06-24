import { redirect } from "next/navigation";

/** A raiz leva ao hub do sistema. Sem sessao, o middleware de /home envia ao login. */
export default function Index() {
  redirect("/home");
}
