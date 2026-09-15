import { PublicLayout } from "@/core/ui/layout/public-layout";

export default function PublicRouteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PublicLayout>{children}</PublicLayout>;
}
