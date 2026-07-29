"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface AuditLog {
  id: string; action: string; target: string; targetId?: string;
  details?: string; ip?: string; createdAt: string;
  admin: { id: string; name: string; email: string };
}

const actionColor = (action: string) => {
  if (action.includes("DELETED") || action.includes("REJECTED") || action.includes("SUSPENDED"))
    return "bg-red-500/10 text-red-600";
  if (action.includes("APPROVED") || action.includes("REACTIVATED") || action.includes("RESTORED"))
    return "bg-emerald-500/10 text-emerald-600";
  if (action.includes("UPDATED") || action.includes("HIDDEN") || action.includes("CHANGED"))
    return "bg-amber-500/10 text-amber-600";
  if (action.includes("SENT") || action.includes("VIEWED"))
    return "bg-indigo-500/10 text-indigo-600";
  return "bg-gray-500/10 text-gray-600";
};

export default function AdminAuditLogsPage() {
  const { lang, dir } = useLanguage();
  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "سجل المراجعة والتدقيق" : isEn ? "Audit Trail" : "Journal d'Audit",
    subtitle: isAr ? `${total} إجراء مسجل` : isEn ? `${total} action(s) recorded` : `${total} action(s) enregistrée(s)`,
    refresh: isAr ? "تحديث" : isEn ? "Refresh" : "Actualiser",

    bannerTitle: isAr ? "شفافية وتتبع كامل" : isEn ? "Full Traceability" : "Traçabilité complète",
    bannerDesc: isAr ? "يتم تسجل كافة الإجراءات الإدارية تلقائياً مع طابع زمني دقيق، بما في ذلك الاعتمادات، التعليق، الحذف، استعراض الملفات الطبية، والإشعارات الموجهة." : isEn ? "All administrative actions are logged automatically with precise timestamps, including approvals, suspensions, deletions, record views, and notifications." : "Toutes les actions administratives sont enregistrées automatiquement avec horodatage. Cela inclut les approbations, suspensions, suppressions, accès aux dossiers médicaux et notifications envoyées.",

    thTime: isAr ? "الوقت والتاريخ" : isEn ? "Timestamp" : "Horodatage",
    thAdmin: isAr ? "المشرف" : isEn ? "Admin" : "Admin",
    thAction: isAr ? "الإجراء" : isEn ? "Action" : "Action",
    thTarget: isAr ? "الهدف" : isEn ? "Target" : "Cible",
    thDetails: isAr ? "التفاصيل" : isEn ? "Details" : "Détails",

    empty: isAr ? "سجل المراجعة فارغ" : isEn ? "No audit logs found" : "Aucune action dans le journal",
  };

  const ACTION_CATEGORIES = [
    { key: "",               label: isAr ? "الكل" : "Toutes" },
    { key: "PROVIDER",       label: isAr ? "مقدمو الرعاية" : "Providers" },
    { key: "PATIENT",        label: isAr ? "المرضى" : "Patients" },
    { key: "SERVICE",        label: isAr ? "الخدمات" : "Services" },
    { key: "APPOINTMENT",    label: isAr ? "المواعيد" : "Rendez-vous" },
    { key: "REVIEW",         label: isAr ? "التقييمات" : "Avis" },
    { key: "NOTIFICATION",   label: isAr ? "الإشعارات" : "Notifications" },
    { key: "SETTINGS",       label: isAr ? "الإعدادات" : "Paramètres" },
    { key: "RECORDS",        label: isAr ? "الملفات" : "Dossiers" },
  ];

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (actionFilter) params.set("action", actionFilter);
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs); setTotal(data.total); setPages(data.pages);
      }
    } finally { setLoading(false); }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-5 animate-fade-in text-start" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">{L.subtitle}</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {L.refresh}
        </button>
      </div>

      {/* Info Banner */}
      <div className="card p-4 border border-indigo-500/20 bg-indigo-500/5 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-indigo-700 dark:text-indigo-300">{L.bannerTitle}</p>
          <p className="text-[var(--text-muted)] text-xs mt-0.5">{L.bannerDesc}</p>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ACTION_CATEGORIES.map(({ key, label }) => (
          <button key={key} onClick={() => { setActionFilter(key); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              actionFilter === key ? "bg-indigo-600 text-white" : "bg-[var(--card-bg)] hover:bg-[var(--hover)]"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="card h-12 animate-pulse" />)}</div>
      ) : logs.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)]">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>{L.empty}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {[L.thTime, L.thAdmin, L.thAction, L.thTarget, L.thDetails].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-[var(--text-muted)] font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-[var(--hover)] transition-colors">
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit", second: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs">{log.admin.name}</p>
                      <p className="text-[var(--text-muted)] text-xs">{log.admin.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium font-mono ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      <span className="font-medium">{log.target}</span>
                      {log.targetId && <span className="ml-1 rtl:mr-1 opacity-60">#{log.targetId.slice(-6)}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] max-w-[200px] truncate">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)]">Page {page} / {pages} — {total} {isAr ? "إجراء" : "actions"}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3"><ChevronLeft className="w-4 h-4 rtl:rotate-180" /></button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary text-sm py-1.5 px-3"><ChevronRight className="w-4 h-4 rtl:rotate-180" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
