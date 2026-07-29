import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar, Topbar } from "@/components/layout/DashboardNav";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "PATIENT") redirect("/login");

  const user = { name: session.name, email: session.email, role: session.role };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar user={user} title="Espace Patient" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
