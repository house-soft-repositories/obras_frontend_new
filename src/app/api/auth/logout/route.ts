import { NextResponse } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/auth/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_ACCESS);
  res.cookies.delete(COOKIE_REFRESH);
  return res;
}
