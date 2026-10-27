import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await getSession();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <Sidebar />
      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10">{children}</main>
    </div>
  );
}
