export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-layout="public" className="min-h-screen bg-background">
      {children}
    </div>
  );
}
