import { PrivateLayout } from "@/components/layout/private-layout";

export default function PrivateRouteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
