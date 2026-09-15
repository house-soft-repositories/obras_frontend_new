import { PrivateLayout } from "@/core/ui/layout/private-layout";

export default function PrivateRouteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
