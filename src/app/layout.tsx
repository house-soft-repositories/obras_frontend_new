import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { auth } from "@/core/config/auth_options";
import AuthProvider from "@/core/context/AuthProvider";
import { ToastProvider } from "@/core/context/ToastProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--fonte",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--fonte-display",
});

export const metadata: Metadata = {
  title: "Obras Gest",
  description:
    "SaaS de acompanhamento de obras e acoes publicas (GovTech multi-tenant)",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AuthProvider session={session}>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
