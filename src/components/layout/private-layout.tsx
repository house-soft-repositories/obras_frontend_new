import { Sidebar } from "@/core/ui/molecules/sidebar";

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-layout="private" className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 md:block">
        <Sidebar />
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
