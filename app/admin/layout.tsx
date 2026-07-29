import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar, Topbar } from "@/components/layout/DashboardNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/login");

  const user = { name: session.name, email: session.email, role: session.role };

  return (
    <div className="flex h-screen bg-[var(--bg)]">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Topbar user={user} title="Administration" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
