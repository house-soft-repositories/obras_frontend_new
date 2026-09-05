import { PrivateLayout } from "@/components/layout/private-layout";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
