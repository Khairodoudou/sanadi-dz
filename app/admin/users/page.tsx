"use client";
import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, MapPin, Mail, Phone, Search } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  wilaya: string;
  approved: boolean;
  createdAt: string;
};

const roleColors: Record<string, string> = {
  ADMIN: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  PROVIDER: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  PATIENT: "text-primary-600 dark:text-primary-400 bg-primary-500/10",
};

export default function AdminUsersPage() {
  const { lang, dir, t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setLoading(false);
      });
  }, []);

  const toggleApproval = async (id: string, approved: boolean) => {
    setUpdating(id);
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved: !approved }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, approved: !approved } : u))
      );
    }
    setUpdating(null);
  };

  const roleLabels: Record<string, string> = {
    ADMIN: t("role_admin"),
    PROVIDER: t("role_provider"),
    PATIENT: t("role_patient"),
  };

  const ROLES = ["Tous", "PATIENT", "PROVIDER", "ADMIN"];
  const filtered = users
    .filter((u) => filter === "Tous" || u.role === filter)
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

  const tableHeaders = lang === "ar"
    ? ["المستخدم", "الصفة", "الاتصال", "الولاية", "الحالة", "الإجراءات"]
    : lang === "en"
      ? ["User", "Role", "Contact", "Wilaya", "Status", "Actions"]
      : ["Utilisateur", "Rôle", "Contact", "Wilaya", "Statut", "Actions"];

  return (
    <div className="space-y-6 animate-fade-in" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
        <div>
          <h2 className="text-2xl font-extrabold">{t("adm_usr_title")}</h2>
          <p className="text-[var(--text-muted)] text-sm">
            {users.length} {lang === "ar" ? "مستخدمين مسجلين" : lang === "en" ? "registered users" : "utilisateur(s) enregistré(s)"}
          </p>
        </div>
        <div className="relative">
          <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3" : "left-3"}`} />
          <input
            className={`input-field w-64 ${lang === "ar" ? "pr-9 pl-4" : "pl-9 pr-4"}`}
            placeholder={lang === "ar" ? "بحث..." : lang === "en" ? "Search..." : "Rechercher..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === r
                ? "bg-primary-600 text-white"
                : "bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--border)]"
            }`}
          >
            {r === "Tous" ? t("pat_book_tabs_all") : roleLabels[r]}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-16 animate-pulse bg-[var(--bg-muted)]" />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir={dir}>
              <thead>
                <tr className="bg-[var(--bg-muted)] border-b border-[var(--border)]" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                  {tableHeaders.map((h) => (
                    <th
                      key={h}
                      className="text-start py-3 px-4 text-xs font-semibold text-[var(--text-muted)] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors"
                    style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}
                  >
                    <td className="py-3 px-4 text-start">
                      <div className="flex items-center gap-3" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 text-xs shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                            <Mail size={10} />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-start">
                      <span className={`badge text-xs ${roleColors[u.role] ?? ""}`}>
                        {roleLabels[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)] text-start">
                      {u.phone ? (
                        <span className="flex items-center gap-1 text-xs" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                          <Phone size={11} />
                          {u.phone}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)] text-start">
                      {u.wilaya ? (
                        <span className="flex items-center gap-1 text-xs" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                          <MapPin size={11} />
                          {u.wilaya}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-start">
                      <span className={`badge ${u.approved ? "badge-confirmed" : "badge-pending"}`}>
                        {u.approved ? t("approved") : t("pending")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-start">
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => toggleApproval(u.id, u.approved)}
                          disabled={updating === u.id}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            u.approved
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                        >
                          {updating === u.id ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : u.approved ? (
                            <>
                              <XCircle size={12} />
                              {lang === "ar" ? "تعليق" : lang === "en" ? "Suspend" : "Suspendre"}
                            </>
                          ) : (
                            <>
                              <CheckCircle size={12} />
                              {t("adm_usr_approve")}
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {lang === "ar"
                    ? "لم يتم العثور على أي مستخدم."
                    : lang === "en"
                    ? "No users found."
                    : "Aucun utilisateur trouvé."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
