"use server";
import { cookies } from "next/headers";

export default async function switchObraTypeNavigationAction(
  obraType: "OBRA_PUBLIC" | "OBRA_PRIVATE" | null,
) {
  const cookieStore = await cookies();
  cookieStore.set("obraType", obraType ?? "", {
    maxAge: 60 * 60 * 24 * 30,
  });
}
