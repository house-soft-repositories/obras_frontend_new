import {cookies} from "next/headers"
export default async function getObraNavigationTypeAction(): Promise<"OBRA_PUBLIC" | "OBRA_PRIVATE"> {
  const cookieStore = await cookies()

  const obraType = cookieStore.get("obraType")?.value
  
  if (obraType === "OBRA_PUBLIC" || obraType === "OBRA_PRIVATE") {
    return obraType
  }
  return "OBRA_PUBLIC"
}